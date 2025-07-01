import { formatSeconds } from "../common";

const DummyRow = () => (
  <div style={{ gridColumn: "1 / span 2", height: 0 }}></div>
);

const ShotDisplay = ({
  currentShots,
  targetShots,
  currentTime,
  targetTime,
  currentMarks,
  targetMarks,
  name,
}: {
  currentShots: number;
  targetShots: number | null;
  currentTime: number;
  targetTime: number | null;
  currentMarks: number;
  targetMarks: number | null;
  name: string;
}) => (
  <div
    style={{
      background:
        "linear-gradient(158deg, var(--green-lighten-3) 25%, var(--green-lighten-4) 75%)",
      border: "medium ridge var(--grey-darken-2)",
      borderRadius: "1rem",
      boxShadow: "0px 0px 4px var(--blue-grey-darken-4)",
      padding: "1rem",
      margin: "1rem",
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      alignItems: "center",
      gap: "1rem",
      fontFamily: "Roboto Mono, monospace",
    }}
  >
    <span style={{ textAlign: "center", fontSize: "small" }}>SHOTS</span>
    <span style={{ textAlign: "center", fontSize: "small" }}>MARKS</span>

    <span style={{ textAlign: "center", fontSize: "xxx-large" }}>
      {currentShots}
      <sub style={{ fontSize: "xx-large", color: "var(--grey-darken-2)" }}>
        /{targetShots ?? "-"}
      </sub>
    </span>
    <span style={{ textAlign: "center", fontSize: "xxx-large" }}>
      {currentMarks}
      <sub style={{ fontSize: "xx-large", color: "var(--grey-darken-2)" }}>
        /{targetMarks ?? "-"}
      </sub>
    </span>

    <DummyRow />

    <span
      style={{
        gridColumn: "1 / span 2",
        textAlign: "center",
        fontSize: "small",
      }}
    >
      TIME
    </span>
    <span
      style={{
        gridColumn: "1 / span 2",
        textAlign: "center",
        fontSize: "xxx-large",
      }}
    >
      {formatSeconds(currentTime)}
      <sub style={{ fontSize: "xx-large", color: "var(--grey-darken-2)" }}>
        /{formatSeconds(targetTime)}
      </sub>
    </span>

    <DummyRow />

    <span
      style={{
        gridColumn: "1 / span 2",
        textAlign: "center",
        fontSize: "small",
      }}
    >
      NAME
    </span>
    <span
      style={{
        gridColumn: "1 / span 2",
        textAlign: "center",
        fontSize: "large",
        whiteSpace: "nowrap",
        contain: "content",
        textOverflow: "ellipsis",
      }}
    >
      {name || "--"}
    </span>
  </div>
);

export default ShotDisplay;
