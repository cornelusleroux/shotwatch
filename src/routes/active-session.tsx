import { useEffect, useRef, useState } from "preact/hooks";
import {
  loadActiveSession,
  sessionEventIconMap,
  SessionEventType,
  storeActiveSession,
  storeSession,
} from "../common";
import DropdownItem from "../components/dropdown-item";
import Footer from "../components/footer";
import SessionTable from "../components/session-table";

const ActiveSession = () => {
  const [session, setSession] = useState(() => loadActiveSession());

  useEffect(() => {
    localStorage.setItem("session.loadActive", "1");
  }, []);

  const filterButtonRef = useRef<HTMLAnchorElement>(null);
  const dropdownInstance = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const M = (window as any).M;
    if (!M || !filterButtonRef.current) return;

    const instance = M.Dropdown.init(filterButtonRef.current, {
      coverTrigger: false,
      constrainWidth: false,
      closeOnClick: false,
    });
    dropdownInstance.current = instance;

    return () => instance?.destroy();
  }, []);

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

  const [filteredEvents, setFilteredEvents] = useState(session?.events ?? []);

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

  const modalButtonEditRef = useRef<HTMLAnchorElement>(null);
  const modalInstanceEdit = useRef<any>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const modalButtonDeleteRef = useRef<HTMLAnchorElement>(null);
  const modalInstanceDelete = useRef<any>(null);
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

    return () => {
      if (modalInstanceEdit.current) {
        modalInstanceEdit.current.destroy();
        modalInstanceEdit.current = null;
      }
      if (modalInstanceDelete.current) {
        modalInstanceDelete.current.destroy();
        modalInstanceDelete.current = null;
      }
    };
  }, [session]);

  if (!session) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="preloader-wrapper big active">
          <div
            className="spinner-layer"
            style={{ borderColor: "var(--theme-primary)" }}
          >
            <div className="circle-clipper left">
              <div className="circle"></div>
            </div>
            <div className="gap-patch">
              <div className="circle"></div>
            </div>
            <div className="circle-clipper right">
              <div className="circle"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="default-layout">
      <div id="modal-edit" className="modal">
        <div className="modal-content">
          <h5>Edit session</h5>
          <input
            ref={editInputRef}
            type="text"
            autocomplete="off"
            value={session.name}
            placeholder={"<unnamed>"}
          />
        </div>
        <div className="modal-footer">
          <a className="modal-close waves-effect btn-flat">Cancel</a>
          <a
            className="modal-close waves-effect btn-flat green-text"
            onClick={() => {
              const name = editInputRef.current?.value || "";
              const newSession = { ...session, name };
              storeActiveSession(newSession);
              storeSession(newSession);
              setSession(newSession);
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
              localStorage.removeItem(`history.${session.startTime}`);
              localStorage.setItem("session.loadActive", "0");
              window.history.back();
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

      <h4>Active Session</h4>

      <SessionTable session={session} events={filteredEvents} />

      <Footer>
        <a
          className="btn-floating btn-large waves-effect waves-light primary-bg"
          onClick={() => window.history.back()}
        >
          <i className="material-icons">navigate_before</i>
        </a>
        <a
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
      </Footer>
    </div>
  );
};

export default ActiveSession;
