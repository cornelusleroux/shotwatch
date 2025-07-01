import { useCallback, useEffect, useState } from "preact/hooks";
import Footer from "../components/footer";
import { useRemainingHeight } from "../components/hooks";

const Link = ({
  url,
  text,
  color = "var(--theme-secondary)",
}: {
  url: string;
  text: string;
  color?: string;
}) => (
  <a
    href={url}
    target="_blank"
    rel="noreferrer"
    style={{ color, textDecoration: "underline" }}
  >
    {text}
  </a>
);

const UserGuide = () => {
  const contentRef = useRemainingHeight();
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);

  useEffect(() => {
    const elems = document.querySelectorAll(".sidenav");
    const instances = M.Sidenav.init(elems, {
      edge: "right",
      onOpenStart: () => setIsSidenavOpen(true),
      onCloseStart: () => setIsSidenavOpen(false),
    });

    return () => {
      instances.forEach((instance: any) => instance.destroy());
    };
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element && contentRef.current) {
      const container = contentRef.current;
      const elementTop = element.offsetTop - container.offsetTop;
      container.scrollTo({
        top: elementTop,
        behavior: "smooth",
      });
    }

    const sidenavElem = document.getElementById("slide-out");
    if (sidenavElem) {
      const instance = M.Sidenav.getInstance(sidenavElem);
      if (instance) {
        instance.close();
      }
    }
  }, []);

  return (
    <div className="default-layout">
      <h4>User Guide</h4>

      <div
        ref={contentRef}
        className="user-manual-content"
        style={{
          display: "flex",
          flexDirection: "column",
          color: "var(--secondary-fg)",
          overflowY: "auto",
        }}
      >
        <h5 id="installation">Installation</h5>

        <p>
          The application is accessible via its URL, but is meant to be
          installed on mobile devices with browsers that support progressive web
          apps. It has not been optimized for a desktop or tablet experience.
        </p>

        <p>
          To start the installation, navigate to{" "}
          <Link
            url="https://shotwatch.app"
            text="ShotWatch.app"
            color="var(--theme-primary)"
          />{" "}
          in your browser, then follow the steps below. Note that there may be
          slight variations depending on the device, operating system and
          browser version.
        </p>

        <h6>Google Chrome on Android</h6>

        <ol>
          <li>
            If prompted, tap <b>Install</b> on the popup. Otherwise, continue
            with the steps below.
          </li>
          <li>Tap the three-dot menu button.</li>
          <li>
            Tap the <b>Add to home screen</b> option.
          </li>
          <li>
            Tap <b>Install</b>.
          </li>
        </ol>

        <h6>Safari on iOS</h6>

        <ol>
          <li>
            Tap the share button (square with an upward arrow) in the browser
            toolbar.
          </li>
          <li>
            Tap the <b>Add to Home Screen</b> option.
          </li>
          <li>
            Tap <b>Add</b>.
          </li>
        </ol>

        <p>
          Once installed, the app should behave as a regularly installed system
          app, work offline, and update itself in the background when opened
          with an active Internet connection. It will be initialized with
          default settings, and any changes will be persisted on the device, but
          can be reset by clearing the cache.
        </p>

        <p>
          A consistent layout is used throughout the app, with most navigation
          and action buttons contained in the footer section. Typically, the
          bottom left button will navigate a screen backward or to the home
          screen. Other button functions are relevant to the current screen.
        </p>

        <h5 id="calibration">Calibrating the Microphone</h5>

        <p>
          The device's microphone is used to measure shots from your firearm.
          Calibration allows the user to configure the desired threshold to
          avoid false positives from ambient noise and prevent additional
          detections from echoes.
        </p>

        <ol>
          <li>
            From the home screen, select the <b>Calibrate Microphone</b> option.
          </li>
          <li>If asked, grant permission to use the microphone.</li>
          <li>
            The red waveform on the graph shows the current audio detected.
          </li>
          <li>
            To configure the input threshold above which sound levels should be
            considered a valid shot, adjust the <b>Threshold</b> slider,
            indicated by the green line.
          </li>
          <li>
            To configure the cooldown period (in milliseconds) after which shots
            above the threshold should be ignored, adjust the <b>Cooldown</b>{" "}
            slider, indicated by the yellow block. This is useful to limit false
            detections during long peaks.
          </li>
          <li>
            To temporarily pause updates to the graph for inspection, tap the{" "}
            <a className="btn btn-small secondary-bg">
              <i className="material-icons left">mic</i>
              Start
            </a>{" "}
            /{" "}
            <a className="btn btn-small secondary-bg">
              <i className="material-icons left">mic</i>
              Stop
            </a>{" "}
            buttons.
          </li>
        </ol>

        <h5 id="buzzer">Configuring the Buzzer</h5>

        <p>
          A buzzer sound is played to indicate that measurement has started or
          stopped.
        </p>

        <ol>
          <li>
            From the home screen, select the <b>Configure Buzzer</b> option.
          </li>
          <li>
            The following options for the start buzzer are configurable using
            their respective sliders:
            <ul>
              <li>
                <b>Frequency</b>: Frequency of the buzzer in Hz. A higher value
                increases the pitch.
              </li>
              <li>
                <b>Duration</b>: Duration of the buzzer in milliseconds.
              </li>
              <li>
                <b>Minimum Delay</b>: The shortest time in seconds that should
                elapse until the buzzer sounds after the record button is
                pressed.
              </li>
              <li>
                <b>Random Delay</b>: The maximum randomized delay in seconds
                added to the minimum delay. The randomized delay is fractional
                between 0 and the configured value.
              </li>
            </ul>
          </li>
          <li>
            The following options for the end buzzer are configurable using
            their respective sliders:
            <ul>
              <li>
                <b>Frequency</b>: Frequency of the buzzer in Hz. A higher value
                increases the pitch.
              </li>
              <li>
                <b>Duration</b>: Duration of the buzzer in milliseconds.
              </li>
            </ul>
          </li>
          <li>
            To hear the current start and end buzzer configurations, tap the{" "}
            <a className="btn btn-small secondary-bg">
              <i className="material-icons left">play_arrow</i>
              Start
            </a>{" "}
            /{" "}
            <a className="btn btn-small secondary-bg">
              <i className="material-icons left">play_arrow</i>
              End
            </a>{" "}
            buttons.
          </li>
        </ol>

        <h5 id="record-session">Recording a Session</h5>

        <p>
          A shooting string, or session, can be recorded by triggering the
          session start point and running until manually ended or the
          preconfigured number of shots, end time, or manual number of marks are
          reached. Multiple targets can be configured at the same time, allowing
          for significant flexibility in supported timer modes.
        </p>

        <ol>
          <li>
            From the home screen, select the <b>Record Sessions</b> option.
          </li>
          <li>
            The record screen has a large display showing the current and target
            number of shots, marks, time and session name. For targets not set,
            a dash (-) is shown.
          </li>
          <li>
            To name the current/next session, tap the{" "}
            <a className="btn-floating btn-small secondary-bg">
              <i className="material-icons">edit</i>
            </a>{" "}
            button.
          </li>
          <li>
            To delete the current session, tap the{" "}
            <a className="btn-floating btn-small red">
              <i className="material-icons">delete</i>
            </a>{" "}
            button.
          </li>
          <li>
            To configure the next session, tap the{" "}
            <a className="btn-floating btn-small secondary-bg">
              <i className="material-icons">settings</i>
            </a>{" "}
            button, which also clears the current session. The following options
            are configurable, all optionally enabled:
            <ul>
              <li>
                <b>Shots</b>: The number of shots to detect before automatically
                stopping the session.
              </li>
              <li>
                <b>Time</b>: The time in seconds to record events before
                automatically stopping the session.
              </li>
              <li>
                <b>Marks</b>: The number of manual marks to record before
                automatically stopping the session.
              </li>
              <li>
                <b>Keep Name</b>: Keep the session name between subsequent
                sessions.
              </li>
              <li>
                <b>Increment Name # Sequence</b>: If the session name contains a
                # followed immediately by an integer, increment the number when
                starting the next session.
              </li>
            </ul>
            The configuration persists and is applied to all new sessions.
          </li>

          <li>
            To begin recording, tap the{" "}
            <a className="btn-floating btn-small green">
              <i className="material-icons">timer</i>
            </a>{" "}
            button to start the configured delayed time, which can be cancelled
            by tapping the{" "}
            <a className="btn-floating btn-small orange">
              <i className="material-icons">timer</i>
            </a>{" "}
            button. After the delay expired, the buzzer will sound, the timer
            started, and shots recorded. To record a mark, tap the{" "}
            <a className="btn-floating btn-small brown">
              <i className="material-icons">flag</i>
            </a>{" "}
            button. To stop recording, tap the{" "}
            <a className="btn-floating btn-small red">
              <i className="material-icons">timer</i>
            </a>{" "}
            button. When the first target is reached, the session will be
            stopped automatically. The end buzzer will sound when the session is
            stopped for any reason. To start the next session, tap the{" "}
            <a className="btn-floating btn-small blue">
              <i className="material-icons">check</i>
            </a>{" "}
            button.
          </li>

          <li>
            To view session details after completion, tap the{" "}
            <a className="btn-floating btn-small secondary-bg">
              <i className="material-icons">assignment</i>
            </a>{" "}
            button to view the raw and split times of recorded events. To filter
            events shown, use the{" "}
            <a className="btn-floating btn-small secondary-bg">
              <i className="material-icons">filter_alt</i>
            </a>{" "}
            button, which will indicate if any filters are active. The session
            can also be named or deleted from here.
          </li>
        </ol>

        <h5 id="history">Viewing the Session History</h5>

        <p>
          Sessions are stored on the device as soon as they are completed or
          edited. The view of each entry is similar to the post-session view
          when recording sessions.
        </p>

        <ol>
          <li>
            From the home screen, select the <b>View Session History</b> option.
          </li>
          <li>
            A list of all recorded sessions are shown in chronological order
            with their timestamps, optional name, and icon indicating the last
            recorded event in that session.
          </li>
          <li>
            To view a session in more detail, tap on it.
            <ul>
              <li>
                To navigate between sessions, tap the{" "}
                <a className="btn-floating btn-small secondary-bg">
                  <i className="material-icons">navigate_before</i>
                </a>{" "}
                /{" "}
                <a className="btn-floating btn-small secondary-bg">
                  <i className="material-icons">navigate_next</i>
                </a>{" "}
                buttons.
              </li>
              <li>
                Similar to the active session view, the{" "}
                <a className="btn-floating btn-small secondary-bg">
                  <i className="material-icons">filter_alt</i>
                </a>{" "}
                ,{" "}
                <a className="btn-floating btn-small secondary-bg">
                  <i className="material-icons">edit</i>
                </a>{" "}
                , and{" "}
                <a className="btn-floating btn-small red">
                  <i className="material-icons">delete</i>
                </a>{" "}
                buttons can be used to filter, rename, or delete the currently
                shown session, respectively.
              </li>
            </ul>
          </li>
          <li>
            To download all sessions in the history, tap the{" "}
            <a className="btn-floating btn-small secondary-bg">
              <i className="material-icons">download</i>
            </a>{" "}
            button.
          </li>
          <li>
            To delete all sessions in the history, tap the{" "}
            <a className="btn-floating btn-small red">
              <i className="material-icons">delete_sweep</i>
            </a>{" "}
            button.
          </li>
        </ol>

        <h5 id="app-info">App Information</h5>

        <p>
          To view information about the app, select the <b>About</b> option from
          the home screen. The page provides the current version number, links
          to sponsor the project or view the source code, and share it with
          others.
        </p>

        <div class="row">
          <div class="col s12 m6">
            <div class="card yellow lighten-3">
              <div class="card-content black-text">
                <span class="card-title">
                  <i className="material-icons left">warning</i>Warning
                </span>
                <p>
                  <i>ShotWatch</i> is designed for training purposes only, and
                  is not intended as a replacement for commercial shot timers.
                  It is not recommended for official or competition use.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col s12 m6">
            <div class="card blue lighten-3">
              <div class="card-content black-text">
                <span class="card-title">
                  <i className="material-icons left">info</i>Note
                </span>
                <p>
                  A special thanks to the following software projects for making{" "}
                  <i>ShotWatch</i> possible:
                </p>
                <ul>
                  <li>
                    <Link
                      url="https://github.com/preactjs/preact"
                      text="Preact"
                    />
                  </li>
                  <li>
                    <Link
                      url="https://github.com/dogfalo/materialize"
                      text="Materialize"
                    />
                  </li>
                  <li>
                    <Link
                      url="https://github.com/joewalnes/smoothie"
                      text="Smoothie Charts"
                    />
                  </li>
                  <li>
                    <Link
                      url="https://github.com/google/material-design-icons"
                      text="Material Design Icons"
                    />
                  </li>
                  <li>
                    <Link url="https://github.com/oven-sh/bun" text="Bun" />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isSidenavOpen && (
        <Footer>
          <a
            className="btn-floating btn-large waves-effect waves-light primary-bg"
            onClick={() => window.history.back()}
          >
            <i className="material-icons">home</i>
          </a>

          <a
            data-target="slide-out"
            className="btn-floating btn waves-effect waves-light secondary-bg sidenav-trigger"
            style={{ marginLeft: "auto" }}
          >
            <i className="material-icons">menu</i>
          </a>
        </Footer>
      )}

      {/* Menu */}

      <ul id="slide-out" class="sidenav">
        <li>
          <a class="subheader">Contents</a>
        </li>
        <li
          onClick={(e) => {
            scrollToSection("installation");
          }}
        >
          <a>Installation</a>
        </li>
        <li
          onClick={(e) => {
            scrollToSection("calibration");
          }}
        >
          <a>Calibrating the Microphone</a>
        </li>
        <li
          onClick={(e) => {
            scrollToSection("buzzer");
          }}
        >
          <a>Configuring the Buzzer</a>
        </li>
        <li
          onClick={(e) => {
            scrollToSection("record-session");
          }}
        >
          <a>Recording a Session</a>
        </li>
        <li
          onClick={(e) => {
            scrollToSection("history");
          }}
        >
          <a>Viewing the Session History</a>
        </li>
        <li
          onClick={(e) => {
            scrollToSection("app-info");
          }}
        >
          <a>App Information</a>
        </li>
      </ul>
    </div>
  );
};

export default UserGuide;
