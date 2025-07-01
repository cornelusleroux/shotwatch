import { useEffect, useRef, useState } from "preact/hooks";
import type { SessionEntry, SessionEvent } from "../common";
import { sessionEventIconMap, SessionEventType, storeSession } from "../common";
import DropdownItem from "../components/dropdown-item";
import Footer from "../components/footer";
import { useRemainingHeight } from "../components/hooks";
import SessionTable from "../components/session-table";

const formatLocalDateTime = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds())
  );
};

const toCsvCell = (val: unknown): string => {
  if (val === null || val === undefined) return "";
  const str = String(val);
  return /[,"\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const buildCsv = (entries: SessionEntry[]): string => {
  const rows: string[][] = [];

  rows.push(["START TIME", "NAME", "TARGETS"]);
  rows.push(["EVENT", "SPLIT (S)", "TIME (S)"]);
  rows.push([]);

  entries.map((e) => {
    const dateTime = formatLocalDateTime(new Date(e.startTime!));
    const name = e.name || "<unnamed>";
    const targets = `${e.targets.shots} shots, ${e.targets.time?.toFixed(
      2
    )} sec, ${e.targets.marks} marks`;
    rows.push([dateTime, name, targets]);

    e.events.map((ev, i) => {
      const eventType = String(ev.type);
      const timeSinceLast =
        i === 0
          ? ((ev.time - (e.startTime ?? ev.time)) / 1000).toFixed(2)
          : ((ev.time - e.events[i - 1].time) / 1000).toFixed(2);
      const timeSinceStart = e.startTime
        ? ((ev.time - e.startTime) / 1000).toFixed(2)
        : "";
      rows.push([eventType, timeSinceLast, timeSinceStart]);
    });

    rows.push([]);
  });

  return rows.map((r) => r.map(toCsvCell).join(",")).join("\n");
};

const downloadCsv = (entries: SessionEntry[]) => {
  if (!entries?.length) return;
  const csv = buildCsv(entries);

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const d = new Date();
  const localTimestamp =
    `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}` +
    "T" +
    `${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
  const fileName = `shotwatch-history-${localTimestamp}.csv`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const readSessions = () => {
  return Object.keys(localStorage)
    .filter((key) => key.startsWith("history."))
    .map((key) => JSON.parse(localStorage.getItem(key)!) as SessionEntry)
    .sort((a, b) => a.startTime! - b.startTime!);
};

const History = () => {
  const [sessionEntries, setSessionEntries] = useState<SessionEntry[]>(
    readSessions()
  );
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null);
  const [session, setSession] = useState<SessionEntry>();

  useEffect(() => {
    if (selectedEntry !== null) {
      setSession(sessionEntries[selectedEntry]);
    } else {
      setSession(undefined);
    }
  }, [sessionEntries, selectedEntry]);

  const sessionsContainerRef = useRemainingHeight([
    sessionEntries,
    selectedEntry,
  ]);

  const filterButtonRef = useRef<HTMLAnchorElement>(null);
  const dropdownInstance = useRef<any>(null);
  useEffect(() => {
    const M = (window as any).M;
    if (!M || !filterButtonRef.current || selectedEntry === null) return;

    if (filterButtonRef.current) {
      const instance = M.Dropdown.init(filterButtonRef.current, {
        coverTrigger: false,
        constrainWidth: false,
        closeOnClick: false,
      });
      dropdownInstance.current = instance;
    }

    return () => {
      if (dropdownInstance.current) {
        dropdownInstance.current.destroy();
        dropdownInstance.current = null;
      }
    };
  }, [selectedEntry !== null]); // Only re-run when presence changes, not the value.

  const modalButtonEditRef = useRef<HTMLAnchorElement>(null);
  const modalInstanceEdit = useRef<any>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const modalButtonDeleteRef = useRef<HTMLAnchorElement>(null);
  const modalInstanceDelete = useRef<any>(null);
  const modalButtonDeleteAllRef = useRef<HTMLAnchorElement>(null);
  const modalInstanceDeleteAll = useRef<any>(null);
  useEffect(() => {
    const M = (window as any).M;
    if (!M) return;

    const modalEditEl = document.getElementById("modal-edit");
    if (modalEditEl) {
      modalInstanceEdit.current = M.Modal.init(modalEditEl, {});
    }
    const modalDeleteEl = document.getElementById("modal-delete");
    if (modalDeleteEl) {
      modalInstanceDelete.current = M.Modal.init(modalDeleteEl, {});
    }
    const modalDeleteAllEl = document.getElementById("modal-delete-all");
    if (modalDeleteAllEl) {
      modalInstanceDeleteAll.current = M.Modal.init(modalDeleteAllEl, {});
    }

    return () => {
      if (modalInstanceEdit.current) {
        modalInstanceEdit.current.destroy();
        modalInstanceEdit.current = null;
      }
      if (modalInstanceDelete.current) {
        modalInstanceDelete.current.destroy();
        modalInstanceDelete.current = null;
      }
      if (modalInstanceDeleteAll.current) {
        modalInstanceDeleteAll.current.destroy();
        modalInstanceDeleteAll.current = null;
      }
    };
  }, [selectedEntry]); // Must rerun when selected entry changes.

  const [filterShots, setFilterShots] = useState(
    localStorage.getItem("filters.shots") !== "0"
  );
  const [filterTime, setFilterTime] = useState(
    localStorage.getItem("filters.time") !== "0"
  );
  const [filterMarks, setFilterMarks] = useState(
    localStorage.getItem("filters.marks") !== "0"
  );
  const [filterEnd, setFilterEnd] = useState(
    localStorage.getItem("filters.end") !== "0"
  );

  const [filteredEvents, setFilteredEvents] = useState<SessionEvent[]>([]);

  useEffect(() => {
    if (!session) {
      setFilteredEvents([]);
      return;
    }
    const allowed = (t: SessionEventType) =>
      (t === SessionEventType.Shot && filterShots) ||
      (t === SessionEventType.Time && filterTime) ||
      (t === SessionEventType.Mark && filterMarks) ||
      (t === SessionEventType.End && filterEnd);

    setFilteredEvents(session.events.filter((e) => allowed(e.type)));

    localStorage.setItem("filters.shots", filterShots ? "1" : "0");
    localStorage.setItem("filters.time", filterTime ? "1" : "0");
    localStorage.setItem("filters.marks", filterMarks ? "1" : "0");
    localStorage.setItem("filters.end", filterEnd ? "1" : "0");
  }, [session, filterShots, filterTime, filterMarks, filterEnd]);

  return (
    <div className="default-layout">
      <h4>History</h4>

      {sessionEntries.length === 0 ? (
        <p>No session history available.</p>
      ) : selectedEntry === null ? (
        <div
          key="sessions-container"
          ref={sessionsContainerRef}
          style={{ width: "100%", overflowY: "auto" }}
        >
          {sessionEntries.map((entry, index) => (
            <a
              className="btn-flat btn-large btn-menu"
              style={{
                textTransform: "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onClick={() => setSelectedEntry(index)}
            >
              <i className="material-icons left secondary-fg">
                {sessionEventIconMap(entry.events.slice(-1)[0].type)}
              </i>
              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  lineHeight: 1.35,
                  height: 54,
                }}
              >
                <span style={{ fontSize: "large" }}>
                  {new Date(entry.startTime!).toLocaleString()}
                </span>
                {entry.name ? (
                  <span
                    className="grey-text text-darken-1"
                    style={{
                      fontSize: "small",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {entry.name}
                  </span>
                ) : undefined}
              </span>
            </a>
          ))}
        </div>
      ) : (
        <SessionTable
          session={sessionEntries[selectedEntry]}
          events={filteredEvents}
        />
      )}

      <Footer>
        <a
          className="btn-floating btn-large waves-effect waves-light primary-bg"
          onClick={
            selectedEntry !== null
              ? () => setSelectedEntry(null)
              : () => window.history.back()
          }
        >
          <i className="material-icons">
            {selectedEntry !== null ? "assignment" : "home"}
          </i>
        </a>
        {selectedEntry !== null && sessionEntries?.length && (
          <>
            <a
              className={`btn-floating btn-normal waves-effect waves-light secondary-bg ${
                selectedEntry === 0 ? "disabled" : ""
              }`}
              onClick={() => {
                setFilteredEvents([]);
                setSelectedEntry((e) => (e !== null ? e - 1 : null));
              }}
            >
              <i className="material-icons">navigate_before</i>
            </a>
            <a
              className={`btn-floating btn-normal waves-effect waves-light secondary-bg ${
                selectedEntry === sessionEntries.length - 1 ? "disabled" : ""
              }`}
              onClick={() => {
                setFilteredEvents([]);
                setSelectedEntry((e) => (e !== null ? e + 1 : null));
              }}
            >
              <i className="material-icons">navigate_next</i>
            </a>
          </>
        )}

        {selectedEntry !== null ? (
          <>
            <a
              key={1}
              style={{ marginLeft: "auto" }}
              className="btn btn-floating btn-normal waves-effect waves-light secondary-bg dropdown-trigger"
              ref={filterButtonRef}
              data-target="dropdown-filters"
            >
              <i
                className={`material-icons ${
                  !filterShots || !filterTime || !filterMarks || !filterEnd
                    ? "red-text text-lighten-2"
                    : ""
                }`}
              >
                filter_alt
              </i>
            </a>
            <a
              key="edit"
              className="btn-floating btn-normal waves-effect waves-light secondary-bg modal-trigger"
              ref={modalButtonEditRef}
              data-target="modal-edit"
            >
              <i className="material-icons">edit</i>
            </a>
            <a
              key="delete"
              className="btn-floating btn-normal waves-effect waves-light red modal-trigger"
              ref={modalButtonDeleteRef}
              data-target="modal-delete"
            >
              <i className="material-icons">delete</i>
            </a>
          </>
        ) : (
          <>
            <a
              key="download"
              style={{ marginLeft: "auto" }}
              className={`btn-floating btn-normal waves-effect waves-light secondary-bg ${
                sessionEntries.length === 0 ? "disabled" : ""
              }`}
              onClick={() => downloadCsv(sessionEntries)}
            >
              <i className="material-icons">download</i>
            </a>
            <a
              key="delete-all"
              className={`btn-floating btn-normal waves-effect waves-light red modal-trigger ${
                sessionEntries.length === 0 ? "disabled" : ""
              }`}
              ref={modalButtonDeleteAllRef}
              data-target="modal-delete-all"
            >
              <i className="material-icons">delete_sweep</i>
            </a>
          </>
        )}
      </Footer>

      {/* Initialize modals and filters AFTER the footers that target them. */}

      <div id="modal-delete-all" className="modal">
        <div className="modal-content">
          <h5>Delete session history?</h5>
        </div>
        <div className="modal-footer">
          <a className="modal-close waves-effect btn-flat">Cancel</a>
          <a
            className="modal-close waves-effect btn-flat red-text"
            onClick={() => {
              sessionEntries.forEach((entry) => {
                localStorage.removeItem(`history.${entry.startTime}`);
              });
              setSessionEntries([]);
            }}
          >
            Delete
          </a>
        </div>
      </div>

      <div id="modal-edit" className="modal">
        <div className="modal-content">
          <h5>Edit session</h5>
          <input
            ref={editInputRef}
            type="text"
            autocomplete="off"
            value={
              selectedEntry !== null ? sessionEntries[selectedEntry].name : ""
            }
            placeholder={"<unnamed>"}
          />
        </div>
        <div className="modal-footer">
          <a className="modal-close waves-effect btn-flat">Cancel</a>
          <a
            className="modal-close waves-effect btn-flat green-text"
            onClick={() => {
              if (selectedEntry !== null) {
                const entry = sessionEntries[selectedEntry];
                entry.name = editInputRef.current?.value || "";
                storeSession(entry);
                setSession(entry);
                setSessionEntries(readSessions());
              }
            }}
          >
            Save
          </a>
        </div>
      </div>

      <div id="modal-delete" className="modal">
        <div className="modal-content">
          <h5>Delete session?</h5>
        </div>
        <div className="modal-footer">
          <a className="modal-close waves-effect btn-flat">Cancel</a>
          <a
            className="modal-close waves-effect btn-flat red-text"
            onClick={() => {
              localStorage.removeItem(
                `history.${sessionEntries[selectedEntry!].startTime}`
              );
              setSelectedEntry(null);
              setSessionEntries(readSessions());
            }}
          >
            Delete
          </a>
        </div>
      </div>

      <ul id="dropdown-filters" className="dropdown-content">
        <DropdownItem
          icon={sessionEventIconMap(SessionEventType.Shot)}
          label="Shots"
          checked={filterShots}
          onClick={(e: Event) => setFilterShots(!filterShots)}
        />
        <DropdownItem
          icon={sessionEventIconMap(SessionEventType.Time)}
          label="Time"
          checked={filterTime}
          onClick={(e: Event) => setFilterTime(!filterTime)}
        />
        <DropdownItem
          icon={sessionEventIconMap(SessionEventType.Mark)}
          label="Marks"
          checked={filterMarks}
          onClick={(e: Event) => setFilterMarks(!filterMarks)}
        />
        <DropdownItem
          icon={sessionEventIconMap(SessionEventType.End)}
          label="End"
          checked={filterEnd}
          onClick={(e: Event) => setFilterEnd(!filterEnd)}
        />
        <li className="divider"></li>
        <li
          style={{ display: "flex", justifyContent: "center" }}
          onClick={() => (dropdownInstance.current as any).close()}
        >
          <a>
            <i className="material-icons" style={{ margin: 0 }}>
              keyboard_arrow_down
            </i>
          </a>
        </li>
      </ul>
    </div>
  );
};

export default History;
