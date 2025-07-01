import { render } from "preact";
import { ErrorBoundary, LocationProvider, Route, Router } from "preact-iso";
import { VERSION, WriteLog } from "./common";
import About from "./routes/about";
import ActiveSession from "./routes/active-session";
import Buzzer from "./routes/buzzer";
import Calibration from "./routes/calibration";
import Configuration from "./routes/configuration";
import History from "./routes/history";
import Home from "./routes/home";
import Logs from "./routes/logs";
import NotFound from "./routes/not-found";
import Session from "./routes/session";
import UserGuide from "./routes/user-guide";

const localStorageDefaults = {
  "debug.enabled": "0",
  // log.<timestamp> = JSON-encoded LogEntry.
  "buzzer.startFrequency": "2500", // Hz
  "buzzer.startDuration": "500", // ms
  "buzzer.startMinimumDelay": "5", // s
  "buzzer.startRandomDelay": "3", // s
  "buzzer.endFrequency": "1250", // Hz
  "buzzer.endDuration": "1000", // ms
  "calibration.threshold": "67", // %
  "calibration.cooldown": "200", // ms
  "session.config.keepName": "0", // Keep name between sessions.
  "session.config.incrementSequence": "0", // Use sequential names if possible.
  "session.config.shots": "5",
  "session.config.time": "15.0", // s.f
  "session.config.marks": "2",
  "session.last.shots": "5",
  "session.last.time": "15.0", // s.f
  "session.last.marks": "2",
  "session.active": "", // JSON-encoded SessionEntry.
  "session.loadActive": "0", // Should load active session on /session.
  "filters.shots": "1",
  "filters.time": "1",
  "filters.marks": "1",
  "filters.end": "1",
  // history.<startTime> = JSON-encoded SessionEntry.
};

function App() {
  // Ensure default values are populated.
  for (const [key, value] of Object.entries(localStorageDefaults)) {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, value);
      WriteLog("info", `Set localStorage default ${key} = ${value}`);
    }
  }

  // Clear logs older than 1 week, or any malformed entry.
  const cleanupDate = Date.now() - 7 * 24 * 60 * 60 * 1000;
  Object.keys(localStorage)
    .filter((key) => key.startsWith("log."))
    .forEach((key) => {
      try {
        const entry = JSON.parse(localStorage.getItem(key)!);
        if (entry.timestamp && entry.timestamp < cleanupDate) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        localStorage.removeItem(key);
      }
    });

  return (
    <LocationProvider>
      <ErrorBoundary
        onError={(e) => {
          console.error(e);
          WriteLog("error", e.message);
        }}
      >
        <Router>
          <Route path="/" component={Home} />
          <Route path="/session" component={Session} />
          <Route path="/configuration" component={Configuration} />
          <Route path="/active-session" component={ActiveSession} />
          <Route path="/history" component={History} />
          <Route path="/calibration" component={Calibration} />
          <Route path="/buzzer" component={Buzzer} />
          <Route path="/about" component={About} />
          <Route path="/logs" component={Logs} />
          <Route path="/user-guide" component={UserGuide} />
          <Route default component={NotFound} />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  );
}

render(<App />, document.getElementById("app")!);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then(
    (registration) => {
      WriteLog("info", `Service worker registration success - v${VERSION}`);
    },
    (error) => {
      console.error("Service worker registration failed -", error);
      WriteLog(
        "error",
        `Service worker registration failed - ${JSON.stringify(error)}`
      );
    }
  );
} else {
  console.error("Service workers not supported");
  WriteLog("error", `Service workers not supported`);
}
