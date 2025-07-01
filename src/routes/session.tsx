import { useLocation } from "preact-iso/router";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import type { SessionEntry } from "../common";
import {
  loadActiveSession,
  playTone,
  SessionEventType,
  storeActiveSession,
  storeSession,
  WriteLog,
} from "../common";
import Footer from "../components/footer";
import { useBuzzerSettings } from "../components/hooks";
import ShotDisplay from "../components/shot-display";

enum State {
  Ready = "ready",
  Waiting = "waiting",
  Active = "active",
  Review = "review",
}

const Session = () => {
  const location = useLocation();
  const debugMode = useRef(localStorage.getItem("debug.enabled") === "1");

  useEffect(() => {
    navigator.permissions
      ?.query({ name: "microphone" })
      .then((status) => {
        if (status.state === "granted") return;
        return navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            stream.getTracks().forEach((track) => track.stop());
          });
      })
      .catch((err) => {
        console.warn("Audio permission check/request failed -", err);
        WriteLog("warning", `Audio permission check/request failed - ${err}`);
      });
  }, []);

  useEffect(() => {
    return () => localStorage.setItem("session.loadActive", "0");
  }, []);

  const timerId = useRef<number | null>(null);
  const buzzerId = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const [state, setState] = useState(State.Ready);
  const {
    startFrequency,
    startDuration,
    startMinimumDelay,
    startRandomDelay,
    endFrequency,
    endDuration,
    threshold,
    cooldown,
  } = useBuzzerSettings();

  const targetShots = useRef(
    Number(localStorage.getItem("session.config.shots")) || null
  );
  const targetTime = useRef(
    Number(localStorage.getItem("session.config.time")) || null
  );
  const targetMarks = useRef(
    Number(localStorage.getItem("session.config.marks")) || null
  );
  const keepName = useRef(
    localStorage.getItem("session.config.keepName") === "1"
  );
  const incrementSequence = useRef(
    localStorage.getItem("session.config.incrementSequence") === "1"
  );

  const [currentShots, setCurrentShots] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentMarks, setCurrentMarks] = useState(0);
  const [currentName, setCurrentName] = useState<string>("");

  const getNewSessionEntry = useCallback((): SessionEntry => {
    return {
      name: "",
      targets: {
        shots: targetShots.current,
        time: targetTime.current,
        marks: targetMarks.current,
      },
      startTime: null,
      events: [],
    };
  }, []);

  const [activeSession, setActiveSession] = useState<SessionEntry | null>(
    () => {
      if (localStorage.getItem("session.loadActive") === "0") {
        const data = getNewSessionEntry();
        storeActiveSession(data);
        return data;
      } else {
        const data = loadActiveSession();
        if (data) {
          setCurrentShots(
            data.events.filter((e) => e.type === SessionEventType.Shot).length
          );
          setCurrentTime(
            data.events.length > 0
              ? (data.events[data.events.length - 1].time - data.startTime!) /
                  1000
              : 0
          );
          setCurrentMarks(
            data.events.filter((e) => e.type === SessionEventType.Mark).length
          );
          setCurrentName(data.name);
          if (data.startTime) {
            startTime.current = data.startTime;
            setState(State.Review);
          }
        }
        return data;
      }
    }
  );

  const incrementTimeRef = useRef<(value: number) => void>();
  const incrementShotsRef = useRef<(value: number) => void>();
  const currentShotsRef = useRef(0);

  // Add refs for audio context
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const lastShotDetected = useRef(Date.now());
  const detectIntervalRef = useRef<number | null>(null);

  const resetSession = useCallback(() => {
    setCurrentShots(0);
    setCurrentTime(0);
    setCurrentMarks(0);
    setCurrentName("");
    startTime.current = null;
    currentShotsRef.current = 0;

    setActiveSession(getNewSessionEntry());
    setState(State.Ready);
  }, []);

  const changeState = useCallback(
    (newState: State) => {
      switch (state) {
        case State.Ready:
          if (newState === State.Waiting) {
            setState(newState);
            // Start capturing after timeout.
            buzzerId.current = window.setTimeout(() => {
              playTone(startFrequency, startDuration);
              startTime.current = Date.now();
              setActiveSession((prev) => ({
                ...prev!,
                startTime: startTime.current,
              }));
              setState(State.Active);
              timerId.current = window.setInterval(
                () =>
                  incrementTimeRef.current?.(
                    (Date.now() - startTime.current!) / 1000
                  ),
                10
              );
            }, 1000 * (startMinimumDelay + Math.random() * startRandomDelay));
          }
          break;
        case State.Waiting:
          if (newState === State.Ready) {
            setState(newState);
            if (buzzerId.current) {
              clearTimeout(buzzerId.current);
              buzzerId.current = null;
            }
            resetSession();
            // Restore the name from the name still in state.
            setCurrentName(activeSession!.name);
          }
          // This transition to State.Active is handled by the Timeout.
          break;
        case State.Active:
          if (newState === State.Ready || newState === State.Review) {
            if (timerId.current) {
              clearTimeout(timerId.current);
              timerId.current = null;
            }
            setState(newState);
            // Stop capturing.
            playTone(endFrequency, endDuration);
            if (newState === State.Ready) {
              resetSession();
            }
            if (newState === State.Review) {
              setActiveSession((prev) => {
                storeActiveSession(prev);
                storeSession(prev!);
                return prev;
              });
            }
          }
          break;
        case State.Review:
          if (newState === State.Ready) {
            if (timerId.current) {
              clearTimeout(timerId.current);
              timerId.current = null;
            }

            var nextName = "";
            if (keepName.current) {
              nextName = loadActiveSession()?.name || "";
              if (nextName && incrementSequence.current) {
                const match = nextName.match(/#(\d+)/);
                const number = match ? parseInt(match[1], 10) : null;
                if (number !== null) {
                  nextName = nextName.replace(/#\d+/, `#${number + 1}`);
                }
              }
            }

            setState(newState);
            resetSession();
            if (nextName) {
              setCurrentName(nextName);
              setActiveSession((prev) => {
                const updated = { ...prev!, name: nextName };
                storeActiveSession(updated);
                return updated;
              });
            }
          }
      }
    },
    [state]
  );

  const incrementShots = useCallback(
    (value: number) => {
      if (state !== State.Active) return;
      const now = Date.now();
      setActiveSession((prev) => ({
        ...prev!,
        events: [...prev!.events, { time: now, type: SessionEventType.Shot }],
      }));
      setCurrentShots(value);
      currentShotsRef.current = value;
      if (targetShots.current !== null && value >= targetShots.current) {
        changeState(State.Review);
      }
    },
    [state, changeState]
  );

  const incrementTime = useCallback(
    (value: number) => {
      if (state !== State.Active) return;
      setCurrentTime(value);
      if (targetTime.current !== null && value >= targetTime.current) {
        const now = Date.now();
        setActiveSession((prev) => ({
          ...prev!,
          events: [...prev!.events, { time: now, type: SessionEventType.Time }],
        }));
        changeState(State.Review);
      }
    },
    [state, changeState]
  );

  const incrementMarks = useCallback(
    (value: number) => {
      if (state !== State.Active) return;
      const now = Date.now();
      setActiveSession((prev) => ({
        ...prev!,
        events: [...prev!.events, { time: now, type: SessionEventType.Mark }],
      }));
      setCurrentMarks(value);
      if (targetMarks.current !== null && value >= targetMarks.current) {
        changeState(State.Review);
      }
    },
    [state, changeState]
  );

  const incrementEnd = useCallback(() => {
    if (state !== State.Active) return;
    const now = Date.now();
    setActiveSession((prev) => ({
      ...prev!,
      events: [...prev!.events, { time: now, type: SessionEventType.End }],
    }));
    changeState(State.Review);
  }, [state, changeState]);

  // Keep the refs updated with the latest callbacks.
  useEffect(() => {
    incrementTimeRef.current = incrementTime;
    incrementShotsRef.current = incrementShots;
  }, [incrementTime, incrementShots]);

  const activeRef = useRef(false);

  useEffect(() => {
    if (state === State.Waiting) {
      // Start audio context.
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        })
        .then((stream) => {
          audioStreamRef.current = stream;
          const ctx = new AudioContext({ sampleRate: 48000 });
          audioContextRef.current = ctx;

          const mic = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 512;
          mic.connect(analyser);

          const buffer = new Uint8Array(analyser.fftSize);

          detectIntervalRef.current = window.setInterval(() => {
            analyser.getByteTimeDomainData(buffer);

            if (!activeRef.current) {
              return;
            }

            // Calculate peak amplitude.
            let peak = 0;
            for (let i = 0; i < buffer.length; i++) {
              const val = Math.abs(buffer[i] - 128);
              if (val > peak) peak = val;
            }
            const amplitude = (100 * peak) / 128;

            // Check threshold and cooldown.
            const now = Date.now();
            if (
              amplitude >= threshold &&
              now >= lastShotDetected.current + cooldown
            ) {
              incrementShotsRef.current?.(currentShotsRef.current + 1);
              lastShotDetected.current = now;
              navigator.vibrate?.(100);
            }
          }, 10);
        })
        .catch((err) => {
          console.error("Failed to access microphone -", err);
          WriteLog("error", `Failed to access microphone - ${err}`);
          setState(State.Ready);
        });
    } else if (state === State.Active) {
      // Start audio detection.
      activeRef.current = true;
    } else if (state === State.Ready || state === State.Review) {
      // Stop audio context.
      activeRef.current = false;
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }
      if (detectIntervalRef.current) {
        clearInterval(detectIntervalRef.current);
        detectIntervalRef.current = null;
      }
    }
  }, [state]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop audio context.
      activeRef.current = false;
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }
      if (detectIntervalRef.current) {
        clearInterval(detectIntervalRef.current);
        detectIntervalRef.current = null;
      }
    };
  }, []);

  const modalButtonEditRef = useRef<HTMLAnchorElement>(null);
  const modalInstanceEdit = useRef<any>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const modalButtonDeleteRef = useRef<HTMLAnchorElement>(null);
  const modalInstanceDelete = useRef<any>(null);
  useEffect(() => {
    const M = (window as any).M;
    if (!M) return;

    if ([State.Ready, State.Review].includes(state)) {
      const modalEditEl = document.getElementById("modal-edit");
      if (modalEditEl) {
        modalInstanceEdit.current = M.Modal.init(modalEditEl, {});
      }
    }
    if (state === State.Review) {
      const modalDeleteEl = document.getElementById("modal-delete");
      if (modalDeleteEl) {
        modalInstanceDelete.current = M.Modal.init(modalDeleteEl, {});
      }
    }

    return () => {
      if ([State.Ready, State.Review].includes(state)) {
        if (modalInstanceEdit.current) {
          modalInstanceEdit.current.destroy();
          modalInstanceEdit.current = null;
        }
      }
      if (state === State.Review) {
        if (modalInstanceDelete.current) {
          modalInstanceDelete.current.destroy();
          modalInstanceDelete.current = null;
        }
      }
    };
  }, [state]);

  return (
    <div
      style={{
        background:
          "linear-gradient(158deg, var(--blue-grey-lighten-2) 25%, var(--blue-grey-lighten-4) 100%)",
        display: "flow-root", // Prevent margin-collapsing with first child.
        height: "100vh",
      }}
    >
      {[State.Ready, State.Review].includes(state) && (
        <div id="modal-edit" className="modal">
          <div className="modal-content">
            <h5>Edit session</h5>
            <input
              ref={editInputRef}
              type="text"
              autocomplete="off"
              value={activeSession?.name || ""}
              placeholder={"<unnamed>"}
            />
          </div>
          <div className="modal-footer">
            <a className="modal-close waves-effect btn-flat">Cancel</a>
            <a
              className="modal-close waves-effect btn-flat green-text"
              onClick={() => {
                const name = editInputRef.current?.value || "";
                setCurrentName(name);
                activeSession!.name = name;
                storeActiveSession(activeSession);
                if (
                  localStorage.getItem(
                    `history.${activeSession!.startTime}`
                  ) !== null
                ) {
                  storeSession(activeSession!);
                }
              }}
            >
              Save
            </a>
          </div>
        </div>
      )}

      {state === State.Review && (
        <div id="modal-delete" className="modal">
          <div className="modal-content">
            <h5>Delete session?</h5>
          </div>
          <div className="modal-footer">
            <a className="modal-close waves-effect btn-flat">Cancel</a>
            <a
              className="modal-close waves-effect btn-flat red-text"
              onClick={() => {
                localStorage.removeItem(`history.${activeSession!.startTime}`);
                resetSession();
              }}
            >
              Delete
            </a>
          </div>
        </div>
      )}

      <ShotDisplay
        currentShots={currentShots}
        targetShots={targetShots.current}
        currentTime={currentTime}
        targetTime={targetTime.current}
        currentMarks={currentMarks}
        targetMarks={targetMarks.current}
        name={currentName}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "4rem",
          padding: "2rem",
        }}
      >
        <a
          className={`btn-floating btn-large waves-effect waves-light ${
            state === State.Ready
              ? "green"
              : state === State.Waiting
              ? "orange"
              : state === State.Active
              ? "red"
              : state === State.Review
              ? "blue"
              : ""
          } ${state === State.Waiting ? "pulse" : ""}`}
          style={{ width: 84, height: 84 }} // 1.5x of default
          onClick={
            state === State.Ready
              ? () => changeState(State.Waiting)
              : [State.Waiting, State.Review].includes(state)
              ? () => changeState(State.Ready)
              : state === State.Active
              ? () => incrementEnd()
              : () => undefined
          }
        >
          <i
            className="material-icons"
            style={{ lineHeight: "84px", fontSize: "3.2rem" }}
          >{`${
            state === State.Ready
              ? "timer"
              : [State.Waiting, State.Active].includes(state)
              ? "timer_off"
              : state === State.Review
              ? "check"
              : ""
          }`}</i>
        </a>
        <a
          style={{ width: 84, height: 84 }} // 1.5x
          className={`btn-floating btn-large waves-effect waves-light brown ${
            state === State.Active ? "" : "disabled"
          }`}
          onClick={() => {
            navigator.vibrate?.(250);
            incrementMarks(currentMarks + 1);
          }}
        >
          <i
            className="material-icons"
            style={{ lineHeight: "84px", fontSize: "3.2rem" }} // 1.5x, 2x of default
          >
            flag
          </i>
        </a>
      </div>

      <Footer>
        <a
          className={`btn-floating btn-large waves-effect waves-light primary-bg ${
            [State.Ready, State.Review].includes(state) ? "" : "disabled"
          }`}
          onClick={() => window.history.back()}
        >
          <i className="material-icons">home</i>
        </a>
        <a
          className={`btn-floating btn-normal waves-effect waves-light secondary-bg ${
            state === State.Ready ? "" : "disabled"
          }`}
          onClick={() => location.route("/configuration")}
        >
          <i className="material-icons">settings</i>
        </a>
        {debugMode.current && (
          <a
            className={`btn-floating btn-small waves-effect waves-light pink ${
              state === State.Active ? "" : "disabled"
            }`}
            onClick={() => {
              incrementShots(currentShots + 1);
              navigator.vibrate?.(100);
            }}
          >
            <i className="material-icons">adb</i>
          </a>
        )}
        <a
          style={{ marginLeft: "auto" }}
          className={`btn-floating btn waves-effect waves-light secondary-bg ${
            state === State.Review ? "" : "disabled"
          }`}
          onClick={() => location.route("/active-session")}
        >
          <i className="material-icons">assignment</i>
        </a>
        <a
          key="edit"
          className={`btn-floating btn-normal waves-effect waves-light secondary-bg modal-trigger ${
            [State.Ready, State.Review].includes(state) ? "" : "disabled"
          }`}
          ref={modalButtonEditRef}
          data-target="modal-edit"
        >
          <i className="material-icons">edit</i>
        </a>
        <a
          key="delete"
          className={`btn-floating btn-normal waves-effect waves-light red modal-trigger ${
            state === State.Review ? "" : "disabled"
          }`}
          ref={modalButtonDeleteRef}
          data-target="modal-delete"
        >
          <i className="material-icons">delete</i>
        </a>
      </Footer>
    </div>
  );
};

export default Session;
