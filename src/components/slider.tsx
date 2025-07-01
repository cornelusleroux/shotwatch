import type { Dispatch, StateUpdater } from "preact/hooks";

const Slider = ({
  title,
  min,
  max,
  step,
  value,
  setValue,
  keyName,
}: {
  title: string;
  min: number;
  max: number;
  step: number;
  value: number;
  setValue: Dispatch<StateUpdater<number>>;
  keyName: string;
}) => (
  <span className="range-field">
    <span>{title}</span>
    <span style={{ display: "flex", justifyContent: "space-between" }}>
      <span className={"grey-text"}>{min}</span>
      <span className={"primary-fg"}>{value}</span>
      <span className={"grey-text"}>{max}</span>
    </span>
    <input
      type="range"
      style={{ margin: 0 }}
      min={min}
      max={max}
      step={step}
      value={value}
      onInput={(e) => setValue(e.currentTarget.valueAsNumber)}
      onChange={(e) =>
        localStorage.setItem(keyName, String(e.currentTarget.value))
      }
    />
  </span>
);

export default Slider;
