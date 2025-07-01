import type { SessionEntry, SessionEvent } from "../common";
import { formatSeconds, sessionEventIconMap } from "../common";
import { useRemainingHeight } from "../components/hooks";

const SessionTable = ({
  session,
  events,
}: {
  session: SessionEntry;
  events: SessionEvent[];
}) => {
  const containerRef = useRemainingHeight([session, events]);

  return (
    <>
      <h5>{new Date(Number(session.startTime)).toLocaleString()}</h5>
      <h6 className={`${session.name ? "" : "grey-text"}`}>
        {session.name || "<unnamed>"}
      </h6>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          alignSelf: "center",
          gap: "2rem",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          <i className="material-icons left secondary-fg">bolt</i>
          {session.targets.shots || "-"}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          <i className="material-icons left secondary-fg">timer</i>
          {formatSeconds(session.targets.time) || "--.--"}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          <i className="material-icons left secondary-fg">flag</i>
          {session.targets.marks || "-"}
        </span>
      </div>

      <div style={{ width: "100%" }}>
        <table className="events-detected">
          <colgroup>
            <col style={{ width: "33%" }} />
            <col style={{ width: "34%" }} />
            <col style={{ width: "33%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Shot</th>
              <th>Split</th>
              <th>Total</th>
            </tr>
          </thead>
        </table>
        <div ref={containerRef} style={{ width: "100%", overflowY: "auto" }}>
          <table className="events-detected">
            <colgroup>
              <col style={{ width: "33%" }} />
              <col style={{ width: "34%" }} />
              <col style={{ width: "33%" }} />
            </colgroup>
            <tbody>
              {events.map((event, index) => (
                <tr key={index}>
                  <td>
                    <i
                      className="material-icons secondary-fg"
                      style={{ verticalAlign: "middle" }}
                    >
                      {sessionEventIconMap(event.type)}
                    </i>
                  </td>
                  <td>
                    {index == 0
                      ? ((event.time - session.startTime!) / 1000).toFixed(2)
                      : ((event.time - events[index - 1].time) / 1000).toFixed(
                          2
                        )}
                  </td>
                  <td>
                    {((event.time - session.startTime!) / 1000).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default SessionTable;
