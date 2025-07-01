/// <reference lib="webworker" />
declare var clients: Clients;

// Based on
// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/CycleTracker/Service_workers

import { VERSION, WriteLog } from "./common";

const CACHE_NAME = `shotwatch-v${VERSION}`;

const APP_STATIC_RESOURCES = [
  // Routes
  "/",
  "/about",
  "/active-session",
  "/buzzer",
  "/calibration",
  "/configuration",
  "/history",
  "/logs",
  "/session",
  "/user-guide",
  // Static
  "/app.js",
  "/favicon.png",
  "/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-any.svg",
  "/icon-maskable.png",
  "/index.html",
  "/manifest.json",
  "/material-icons.css",
  "/materialize.min.css",
  "/materialize.min.js",
  "/Roboto-Italic-VariableFont_wdth,wght.ttf",
  "/Roboto-VariableFont_wdth,wght.ttf",
  "/RobotoMono-VariableFont_wght.ttf",
  "/styles.css",
];

// Helper function to fetch with proper redirect handling.
async function fetchWithRedirects(url: string): Promise<Response> {
  try {
    const request = new Request(url, {
      redirect: "follow",
      credentials: "same-origin",
      cache: "no-cache",
    });
    return await fetch(request);
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    WriteLog("error", `SW fetch failed for ${url}: ${error}`);
    throw error;
  }
}

// On install, cache the static resources using manual fetch to avoid redirect issues.
self.addEventListener("install", (event: any) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        APP_STATIC_RESOURCES.map(async (url) => {
          try {
            const response = await fetchWithRedirects(url);
            if (response.ok) {
              await cache.put(url, response);
            } else {
              console.warn("Failed to cache (status):", url, response.status);
              WriteLog(
                "warning",
                `SW failed to cache ${url} - status ${response.status}`
              );
            }
          } catch (err) {
            console.warn("Failed to cache:", url, err);
            WriteLog("warning", `SW failed to cache ${url} - ${err}`);
          }
        })
      );
      // Activate new service worker immediately.
      await (self as any).skipWaiting();
    })()
  );
});

// Delete old caches on activate.
self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
          return undefined;
        })
      );
      await clients.claim();
    })()
  );
});

// Intercept fetches and serve from cache if possible, otherwise pass through as
// standard network request.
self.addEventListener("fetch", (event: any) => {
  const url = new URL(event.request.url);

  // For SPA, serve the index.html for navigation requests.
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match("/index.html");
        if (cachedResponse) {
          // Ensure cached index.html is non-empty.
          const clone = cachedResponse.clone();
          const text = await clone.text();
          if (text.length > 0) {
            return new Response(cachedResponse.body, {
              status: 200,
              statusText: "OK",
              headers: cachedResponse.headers,
            });
          }
        }
        // If not cached or empty, fetch and cache.
        try {
          const response = await fetchWithRedirects("/index.html");
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put("/index.html", response.clone());
            return new Response(response.body, {
              status: 200,
              statusText: "OK",
              headers: response.headers,
            });
          }
          return response;
        } catch (error) {
          return new Response("<html><body><h1>Offline</h1></body></html>", {
            headers: { "Content-Type": "text/html" },
          });
        }
      })()
    );
    return;
  }

  // Special handling for root path requests that aren't navigation.
  if (url.pathname === "/" || url.pathname === "") {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match("/index.html");
        if (cachedResponse) {
          return new Response(cachedResponse.body, {
            status: 200,
            statusText: "OK",
            headers: cachedResponse.headers,
          });
        }
        return fetchWithRedirects("/index.html");
      })()
    );
    return;
  }

  // Attempt to serve requests from cache (ignore query params).
  event.respondWith(
    (async () => {
      const response = await caches.match(event.request, {
        ignoreSearch: true,
      });
      if (response) {
        return response;
      }
      return fetchWithRedirects(event.request.url);
    })()
  );

  // Unhandled, pass to network.
});
