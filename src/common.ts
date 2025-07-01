import packageJson from "../package.json";

export const VERSION = packageJson.version;

/**
 * Format fractional seconds as SS.ss or --.--.
 *
 * @param value Value in seconds, or null to indicate no value.
 * @returns Formatted string.
 */
export const formatSeconds = (value: number | null): string => {
  if (value === null) return "--.--";
  const whole = `${Math.floor(value).toString().padStart(2, "0")}`;
  const hundredths = `${Math.round((value % 1) * 100)
    .toString()
    .padStart(2, "0")}`;
  return `${whole}.${hundredths}`;
};

export const playTone = (frequency: number, duration: number) => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "square"; // Options: sine, square, sawtooth, triangle.
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(0.1, ctx.currentTime); // Volume (0.0 - 1.0)

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration / 1000);
};

export type SessionTargets = {
  shots: number | null;
  time: number | null;
  marks: number | null;
};

export enum SessionEventType {
  Shot = "shot",
  Time = "time",
  Mark = "mark",
  End = "end",
}

export type SessionEvent = {
  time: number;
  type: SessionEventType;
};

export type SessionEntry = {
  name: string;
  targets: SessionTargets;
  startTime: number | null;
  events: SessionEvent[];
};

export const storeActiveSession = (session: SessionEntry | null) => {
  localStorage.setItem(
    "session.active",
    session ? JSON.stringify(session) : ""
  );
};

export const loadActiveSession = (): SessionEntry | null => {
  const item = localStorage.getItem("session.active");
  if (item) {
    return JSON.parse(item) as SessionEntry;
  }
  return null;
};

export const storeSession = (session: SessionEntry) => {
  localStorage.setItem(`history.${session.startTime}`, JSON.stringify(session));
};

export const loadSession = (timestamp: string): SessionEntry | null => {
  const value = localStorage.getItem(`history.${timestamp}`);
  return value ? (JSON.parse(value) as SessionEntry) : null;
};

export const sessionEventIconMap = (eventType: SessionEventType): string => {
  switch (eventType) {
    case SessionEventType.Shot:
      return "bolt";
    case SessionEventType.Time:
      return "timer";
    case SessionEventType.Mark:
      return "flag";
    case SessionEventType.End:
      return "cancel";
    default:
      return "help_outline";
  }
};

type LogLevel = "debug" | "info" | "warning" | "error";

export type LogEntry = {
  timestamp: number;
  level: LogLevel;
  message: string;
};

export const WriteLog = (level: LogLevel, message: string) => {
  const timestamp = Date.now();
  const log: LogEntry = { timestamp, level, message };
  localStorage.setItem(`log.${timestamp}`, JSON.stringify(log));
};
