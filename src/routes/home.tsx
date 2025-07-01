import { useLocation } from "preact-iso/router";
import { useState } from "preact/hooks";
import { VERSION } from "../common";

const Home = () => {
  const location = useLocation();
  const [debugMode] = useState(localStorage.getItem("debug.enabled") === "1");

  return (
    <div className="default-layout">
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "2rem 0",
          borderBottom: "1px solid var(--grey-lighten-1)",
          marginBottom: "1rem",
        }}
      >
        <img
          src="/icon-512.png"
          alt="logo"
          style={{ height: "4rem", alignSelf: "center" }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className="primary-fg" style={{ fontSize: "x-large" }}>
            ShotWatch
          </span>
          <span className="grey-text">v{VERSION}</span>
        </div>
      </div>

      <a
        className="btn-flat btn-large btn-menu"
        onClick={() => location.route("/session")}
      >
        <i className="material-icons left">timer</i>
        Record Sessions
      </a>

      <a
        className="btn-flat btn-large btn-menu"
        onClick={() => location.route("/history")}
      >
        <i className="material-icons left">assignment</i>
        View Session History
      </a>

      <a
        className="btn-flat btn-large btn-menu"
        onClick={() => location.route("/calibration")}
      >
        <i className="material-icons left">graphic_eq</i>
        Calibrate Microphone
      </a>

      <a
        className="btn-flat btn-large btn-menu"
        onClick={() => location.route("/buzzer")}
      >
        <i className="material-icons left">volume_up</i>
        Configure Buzzer
      </a>

      <a
        className="btn-flat btn-large btn-menu"
        onClick={() => location.route("/user-guide")}
      >
        <i className="material-icons left">menu_book</i>
        View User Guide
      </a>

      <a
        className="btn-flat btn-large btn-menu"
        onClick={() => location.route("/about")}
      >
        <i className="material-icons left">info</i>
        About
      </a>

      {debugMode && (
        <a
          className="btn-flat btn-large btn-menu"
          onClick={() => location.route("/logs")}
        >
          <i className="material-icons left">adb</i>
          View Logs
        </a>
      )}
    </div>
  );
};

export default Home;
