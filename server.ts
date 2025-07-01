const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    // Serve the root path as index.
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    // If the path is a file, serve it as a static resource.
    const file = Bun.file(`./public${path}`);
    if (await file.exists()) {
      return new Response(file);
    }
    // Fallback to index.html for SPA routing (allows refresh on any SPA route).
    return new Response(Bun.file("./public/index.html"));
    return new Response("", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
