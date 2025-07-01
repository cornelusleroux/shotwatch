import { useCallback, useRef, useState } from "preact/hooks";
import { VERSION, WriteLog } from "../common";
import Footer from "../components/footer";
import { useRemainingHeight } from "../components/hooks";
import {
  BuyMeACoffee as BuyMeACoffeeIcon,
  GitHub as GitHubIcon,
} from "../components/icons";

const shareData = {
  title: "ShotWatch",
  text: `ShotWatch\n\nA simple, free, open-source shot timer.\nNo ads, no tracking, no nonsense.\n\n${window.location.origin}`,
  // url: window.location.origin,
};

const About = () => {
  const contentRef = useRemainingHeight();

  const [canShare] = useState(
    () =>
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      navigator.canShare(shareData)
  );

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);
  const [debugMode, setDebugMode] = useState(
    localStorage.getItem("debug.enabled") === "1"
  );

  const handleLogoClick = useCallback(() => {
    clickCountRef.current++;

    if (clickCountRef.current === 5) {
      localStorage.setItem("debug.enabled", debugMode ? "0" : "1");
      setDebugMode(!debugMode);
      clickCountRef.current = 0;
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      return;
    }

    // Reset counter after 1 second of no clicks.
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1000) as unknown as number;
  }, [debugMode]);

  return (
    <div className="default-layout">
      {debugMode && (
        <span
          className="red-text"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            fontSize: "small",
            display: "flex",
            justifyContent: "center",
            padding: "0.25rem",
          }}
        >
          DEBUG MODE ENABLED
        </span>
      )}
      <div
        ref={contentRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          width: "100%",
          textAlign: "center",
          color: "var(--secondary-fg)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <img
            src="/icon-512.png"
            alt="logo"
            style={{ maxWidth: 256 }}
            onClick={handleLogoClick}
          />
          <span className="primary-fg" style={{ fontSize: "x-large" }}>
            ShotWatch
          </span>
          <span>v{VERSION}</span>
          <span>Copyright &copy; 2025 Cornelus Le Roux</span>
        </div>
        <div style={{ fontStyle: "italic" }}>
          A simple, free, open-source shot timer.
          <br />
          No ads, no tracking, no nonsense.
        </div>

        <div>
          Support me on Buy Me a Coffee.
          <br />
          Source code available on GitHub.
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <a
            className={"secondary-fg"}
            href="https://coff.ee/cornelusleroux"
            target="_blank"
          >
            <BuyMeACoffeeIcon style={{ height: 48 }} />
          </a>

          <a
            className={"secondary-fg"}
            href="https://github.com/cornelusleroux/shotwatch"
            target="_blank"
          >
            <GitHubIcon style={{ height: 48 }} />
          </a>
        </div>
      </div>

      <Footer>
        <a
          className="btn-floating btn-large waves-effect waves-light primary-bg"
          onClick={() => window.history.back()}
        >
          <i className="material-icons">home</i>
        </a>
        <a
          className={`btn-floating btn waves-effect waves-light secondary-bg ${
            !canShare ? "disabled" : ""
          }`}
          style={{ marginLeft: "auto" }}
          onClick={
            canShare
              ? async () => {
                  try {
                    await navigator.share(shareData);
                  } catch (e) {
                    console.warn("Share failed", e);
                    WriteLog("warning", `Share failed - ${e}`);
                  }
                }
              : undefined
          }
        >
          <i className="material-icons">share</i>
        </a>
      </Footer>
    </div>
  );
};

export default About;
