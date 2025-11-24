import { useState } from "preact/hooks";
import Footer from "../components/footer";

const clamp = (value: number, min: number, max: number, precision = 0) => {
  const factor = Math.pow(10, precision);
  const rounded = Math.round(value * factor) / factor;
  return Math.min(Math.max(rounded, min), max);
};

const Configuration = () => {
  const [shots, setShots] = useState(
    Number(localStorage.getItem("session.config.shots"))
  );
  const [time, setTime] = useState(
    Number(localStorage.getItem("session.config.time"))
  );
  const [marks, setMarks] = useState(
    Number(localStorage.getItem("session.config.marks"))
  );
  const [keepName, setKeepName] = useState(
    localStorage.getItem("session.config.keepName") === "1"
  );
  const [incrementSequence, setIncrementSequence] = useState(
    localStorage.getItem("session.config.incrementSequence") === "1"
  );

  return (
    <div className="default-layout" style={{ gap: "1rem" }}>
      <h4>Configuration</h4>

      <h5>Targets</h5>

      <div className="row config-row">
        <p className="col s6">
          <label>
            <input
              type="checkbox"
              checked={!!shots}
              onChange={(e: Event) => {
                const checked = (e.currentTarget as HTMLInputElement).checked;
                if (checked) {
                  const value = localStorage.getItem("session.last.shots")!;
                  localStorage.setItem("session.config.shots", value);
                  setShots(Number(value));
                } else {
                  localStorage.setItem("session.config.shots", "");
                  setShots(0);
                }
              }}
            />
            <span>Shot Count</span>
          </label>
        </p>
        <div className="col s6">
          <input
            disabled={!shots}
            type="number"
            min={1}
            max={99}
            step={1}
            value={shots || ""}
            onBlur={(e: Event) => {
              const el = e.currentTarget as HTMLInputElement;
              var value = Number(el.value);
              if (value) {
                value = clamp(value, 1, 99);
                localStorage.setItem("session.last.shots", String(value));
                localStorage.setItem("session.config.shots", String(value));
                setShots(Number(value));
              } else {
                localStorage.setItem("session.config.shots", "");
                setShots(0);
              }
              el.value = value ? String(value) : "";
            }}
          />
        </div>
      </div>

      <div className="row config-row">
        <p className="col s6">
          <label>
            <input
              type="checkbox"
              checked={!!time}
              onChange={(e: Event) => {
                const checked = (e.currentTarget as HTMLInputElement).checked;
                if (checked) {
                  const value = localStorage.getItem("session.last.time")!;
                  localStorage.setItem("session.config.time", value);
                  setTime(Number(value));
                } else {
                  localStorage.setItem("session.config.time", "");
                  setTime(0);
                }
              }}
            />
            <span>Time Limit [s]</span>
          </label>
        </p>
        <div className="col s6">
          <input
            disabled={!time}
            type="number"
            min={0.1}
            max={999}
            step={0.1}
            value={time ? time.toFixed(1) : ""}
            onBlur={(e: Event) => {
              const el = e.currentTarget as HTMLInputElement;
              var value = Number(el.value);
              if (value) {
                value = clamp(value, 0.1, 999, 1);
                localStorage.setItem("session.last.time", String(value));
                localStorage.setItem("session.config.time", String(value));
                setTime(Number(value));
              } else {
                localStorage.setItem("session.config.time", "");
                setTime(0);
              }
              el.value = value ? value.toFixed(1) : "";
            }}
          />
        </div>
      </div>

      <div className="row config-row">
        <p className="col s6">
          <label>
            <input
              type="checkbox"
              checked={!!marks}
              onChange={(e: Event) => {
                const checked = (e.currentTarget as HTMLInputElement).checked;
                if (checked) {
                  const value = localStorage.getItem("session.last.marks")!;
                  localStorage.setItem("session.config.marks", value);
                  setMarks(Number(value));
                } else {
                  localStorage.setItem("session.config.marks", "");
                  setMarks(0);
                }
              }}
            />
            <span>Mark Count</span>
          </label>
        </p>
        <div className="col s6">
          <input
            disabled={!marks}
            type="number"
            min={1}
            max={99}
            step={1}
            value={marks || ""}
            onBlur={(e: Event) => {
              const el = e.currentTarget as HTMLInputElement;
              var value = Number(el.value);
              if (value) {
                value = clamp(value, 1, 99);
                localStorage.setItem("session.last.marks", String(value));
                localStorage.setItem("session.config.marks", String(value));
                setMarks(Number(value));
              } else {
                localStorage.setItem("session.config.marks", "");
                setMarks(0);
              }
              el.value = value ? String(value) : "";
            }}
          />
        </div>
      </div>

      <h5>Session Naming</h5>

      <div className="row config-row">
        <p className="col s12">
          <label>
            <input
              type="checkbox"
              checked={keepName}
              onChange={(e: Event) => {
                const checked = (e.currentTarget as HTMLInputElement).checked;
                if (checked) {
                  localStorage.setItem("session.config.keepName", "1");
                  setKeepName(true);
                } else {
                  localStorage.setItem("session.config.keepName", "0");
                  setKeepName(false);
                  localStorage.setItem("session.config.incrementSequence", "0");
                  setIncrementSequence(false);
                }
              }}
            />
            <span>Keep Name</span>
          </label>
        </p>
      </div>

      <div className="row config-row">
        <p className="col s12">
          <label>
            <input
              disabled={!keepName}
              type="checkbox"
              checked={incrementSequence}
              onChange={(e: Event) => {
                const checked = (e.currentTarget as HTMLInputElement).checked;
                if (checked) {
                  localStorage.setItem("session.config.incrementSequence", "1");
                  setIncrementSequence(true);
                } else {
                  localStorage.setItem("session.config.incrementSequence", "0");
                  setIncrementSequence(false);
                }
              }}
            />
            <span>Increment Name # Sequence</span>
          </label>
        </p>
      </div>

      <Footer>
        <a
          className="btn-floating btn-large waves-effect waves-light primary-bg"
          onClick={() => window.history.back()}
        >
          <i className="material-icons">navigate_before</i>
        </a>
      </Footer>
    </div>
  );
};

export default Configuration;
