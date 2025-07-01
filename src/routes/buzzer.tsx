import { useState } from "preact/hooks";
import { playTone } from "../common";
import Footer from "../components/footer";
import Slider from "../components/slider";

const Buzzer = () => {
  const [startFrequency, setStartFrequency] = useState(
    Number(localStorage.getItem("buzzer.startFrequency"))
  );
  const [startDuration, setStartDuration] = useState(
    Number(localStorage.getItem("buzzer.startDuration"))
  );
  const [startMinimumDelay, setStartMinimumDelay] = useState(
    Number(localStorage.getItem("buzzer.startMinimumDelay"))
  );
  const [startRandomDelay, setStartRandomDelay] = useState(
    Number(localStorage.getItem("buzzer.startRandomDelay"))
  );
  const [endFrequency, setEndFrequency] = useState(
    Number(localStorage.getItem("buzzer.endFrequency"))
  );
  const [endDuration, setEndDuration] = useState(
    Number(localStorage.getItem("buzzer.endDuration"))
  );

  return (
    <div className="default-layout">
      <h4>Buzzer</h4>

      <h5>Start</h5>

      <Slider
        title="Frequency (Hz)"
        min={500}
        max={4000}
        step={50}
        value={startFrequency}
        setValue={setStartFrequency}
        keyName="buzzer.startFrequency"
      />

      <Slider
        title="Duration (ms)"
        min={100}
        max={2000}
        step={100}
        value={startDuration}
        setValue={setStartDuration}
        keyName="buzzer.startDuration"
      />

      <Slider
        title="Minimum Delay (s)"
        min={0}
        max={10}
        step={1}
        value={startMinimumDelay}
        setValue={setStartMinimumDelay}
        keyName="buzzer.startMinimumDelay"
      />

      <Slider
        title="Random Delay (s)"
        min={0}
        max={10}
        step={1}
        value={startRandomDelay}
        setValue={setStartRandomDelay}
        keyName="buzzer.startRandomDelay"
      />

      <span
        className={"grey-text"}
        style={{
          width: "100%",
          fontSize: "small",
          textAlign: "center",
        }}
      >
        {startRandomDelay == 0
          ? `Buzzer triggered at ${startMinimumDelay} sec.`
          : `Buzzer triggered between ${startMinimumDelay} and ${
              startMinimumDelay + startRandomDelay
            } sec.`}
      </span>

      <h5>End</h5>

      <Slider
        title="Frequency (Hz)"
        min={500}
        max={4000}
        step={50}
        value={endFrequency}
        setValue={setEndFrequency}
        keyName="buzzer.endFrequency"
      />

      <Slider
        title="Duration (ms)"
        min={100}
        max={2000}
        step={100}
        value={endDuration}
        setValue={setEndDuration}
        keyName="buzzer.endDuration"
      />

      <Footer>
        <a
          className="btn-floating btn-large waves-effect waves-light primary-bg"
          onClick={() => window.history.back()}
        >
          <i className="material-icons">home</i>
        </a>

        <a
          className="btn waves-effect waves-light secondary-bg"
          onClick={() => playTone(startFrequency, startDuration)}
        >
          <i className="material-icons left">play_arrow</i>Start
        </a>

        <a
          className="btn waves-effect waves-light secondary-bg"
          onClick={() => playTone(endFrequency, endDuration)}
        >
          <i className="material-icons left">play_arrow</i>End
        </a>
      </Footer>
    </div>
  );
};

export default Buzzer;
