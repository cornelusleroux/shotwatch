import { useEffect, useRef, useState } from "preact/hooks";
import type { LogEntry } from "../common";
import Footer from "../components/footer";
import { useRemainingHeight } from "../components/hooks";

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

const buildCsv = (entries: LogEntry[]): string => {
  const rows: string[][] = [];

  rows.push(["TIMESTAMP", "LEVEL", "MESSAGE"]);
  entries.map((e) => {
    rows.push([formatLocalDateTime(new Date(e.timestamp)), e.level, e.message]);
  });

  return rows.map((r) => r.map(toCsvCell).join(",")).join("\n");
};

const downloadCsv = (entries: LogEntry[]) => {
  if (!entries?.length) return;
  const csv = buildCsv(entries);

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const d = new Date();
  const localTimestamp =
    `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}` +
    "T" +
    `${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
  const fileName = `shotwatch-logs-${localTimestamp}.csv`;

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

const readLogs = () => {
  return Object.keys(localStorage)
    .filter((key) => key.startsWith("log."))
    .map((key) => JSON.parse(localStorage.getItem(key)!) as LogEntry)
    .sort((a, b) => a.timestamp! - b.timestamp!);
};

const Logs = () => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>(readLogs());

  const modalButtonDeleteAllRef = useRef<HTMLAnchorElement>(null);
  const modalInstanceDeleteAll = useRef<any>(null);
  useEffect(() => {
    const M = (window as any).M;
    if (!M) return;

    const modalDeleteAllEl = document.getElementById("modal-delete-all");
    if (modalDeleteAllEl) {
      modalInstanceDeleteAll.current = M.Modal.init(modalDeleteAllEl, {});
    }

    return () => {
      if (modalInstanceDeleteAll.current) {
        modalInstanceDeleteAll.current.destroy();
        modalInstanceDeleteAll.current = null;
      }
    };
  }, []);

  const logsContainerRef = useRemainingHeight();

  return (
    <div className="default-layout">
      <h4>Logs</h4>

      <div
        key="logs-container"
        ref={logsContainerRef}
        style={{ width: "100%", overflowY: "auto" }}
      >
        {logEntries.map((entry, index) => (
          <span
            style={{
              color:
                entry.level === "error"
                  ? "red"
                  : entry.level === "warning"
                  ? "orange"
                  : entry.level === "info"
                  ? "black"
                  : "gray",
              fontSize: "small",
              display: "block",
            }}
          >
            <b>{formatLocalDateTime(new Date(entry.timestamp))}</b>
            &nbsp;
            {entry.message}
          </span>
        ))}
      </div>

      <Footer>
        <a
          className="btn-floating btn-large waves-effect waves-light primary-bg"
          onClick={() => window.history.back()}
        >
          <i className="material-icons">home</i>
        </a>
        <a
          key="download"
          style={{ marginLeft: "auto" }}
          className={`btn-floating btn-normal waves-effect waves-light secondary-bg ${
            logEntries.length === 0 ? "disabled" : ""
          }`}
          onClick={() => downloadCsv(logEntries)}
        >
          <i className="material-icons">download</i>
        </a>
        <a
          key="delete-all"
          className={`btn-floating btn-normal waves-effect waves-light red modal-trigger ${
            logEntries.length === 0 ? "disabled" : ""
          }`}
          ref={modalButtonDeleteAllRef}
          data-target="modal-delete-all"
        >
          <i className="material-icons">delete_sweep</i>
        </a>
      </Footer>

      {/* Initialize modals and filters AFTER the footers that target them. */}

      <div id="modal-delete-all" className="modal">
        <div className="modal-content">
          <h5>Delete logs?</h5>
        </div>
        <div className="modal-footer">
          <a className="modal-close waves-effect btn-flat">Cancel</a>
          <a
            className="modal-close waves-effect btn-flat red-text"
            onClick={() => {
              logEntries.forEach((entry) => {
                localStorage.removeItem(`log.${entry.timestamp}`);
              });
              setLogEntries([]);
            }}
          >
            Delete
          </a>
        </div>
      </div>
    </div>
  );
};

export default Logs;
