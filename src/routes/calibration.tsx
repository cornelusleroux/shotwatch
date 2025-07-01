import { useEffect, useRef, useState } from "preact/hooks";
import { SmoothieChart, TimeSeries } from "smoothie";
import Footer from "../components/footer";
import Slider from "../components/slider";

/**
 * Convert a color to CSS format. Useful when a color codes are required and
 * `var()` is not supported.
 */
const getCssColor = (colorName: string): string => {
  return getComputedStyle(document.body).getPropertyValue(colorName);
};

/**
 * Convert rem to px based on the root font size.
 */
const rem2px = (rem: number) => {
  const fontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );
  return rem * fontSize;
};

const CHART_WIDTH = 350;
const CHART_HEIGHT = 300;
const COOLDOWN_BAR_HEIGHT = 30;
const MS_PER_PIXEL = 20;
const CANVAS_BLACK = getCssColor("--grey-darken-4");
const CANVAS_WHITE = getCssColor("--grey-lighten-4");
const CANVAS_GREY = getCssColor("--grey");
const CANVAS_RED = getCssColor("--red-accent-4");
const CANVAS_GREEN = getCssColor("--green-accent-4");
const CANVAS_YELLOW = getCssColor("--yellow-accent-4");

const CooldownBar = ({
  cooldown,
  width = CHART_WIDTH,
  height = COOLDOWN_BAR_HEIGHT,
}: {
  cooldown: number;
  width?: number;
  height?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and redraw a blank canvas.
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = CANVAS_BLACK;
    ctx.fillRect(0, 0, width, height);
    // Draw centered cooldown bar.
    const chartWindowInMs = width * MS_PER_PIXEL;
    const barWidth = Math.max((cooldown / chartWindowInMs) * width, 2);
    const barX = (width - barWidth) / 2;
    ctx.fillStyle = CANVAS_YELLOW;
    ctx.fillRect(barX, height / 4, barWidth, height / 2);
  }, [cooldown, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

type IWaveformChart = {
  threshold: number;
  width?: number;
  height?: number;
  measuring?: boolean;
};

const WaveformChart = ({
  threshold,
  width = CHART_WIDTH,
  height = CHART_HEIGHT,
  measuring = true,
}: IWaveformChart) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<TimeSeries | null>(null);
  const thresholdSeriesRef = useRef<TimeSeries | null>(null);
  const chartRef = useRef<SmoothieChart | null>(null);
  const measuringRef = useRef(measuring);

  // Pause or resume the chart.
  useEffect(() => {
    measuringRef.current = measuring;
    if (chartRef.current) {
      if (measuring) {
        waveformRef.current?.clear();
        chartRef.current.start();
      } else {
        chartRef.current.stop();
      }
    }
  }, [measuring]);

  // Initialize chart, draw microphone values.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const chart = new SmoothieChart({
      millisPerPixel: MS_PER_PIXEL,
      grid: {
        strokeStyle: CANVAS_BLACK,
        fillStyle: CANVAS_BLACK,
        verticalSections: 4,
      },
      labels: {
        fillStyle: CANVAS_WHITE,
        showIntermediateLabels: true,
        precision: 0,
      },
      minValue: 0,
      maxValue: 100,
      horizontalLines: [
        { value: 0.1, color: CANVAS_GREY, lineWidth: 1 },
        { value: 25, color: CANVAS_GREY, lineWidth: 1 },
        { value: 50, color: CANVAS_GREY, lineWidth: 1 },
        { value: 75, color: CANVAS_GREY, lineWidth: 1 },
      ],
    });
    chartRef.current = chart;

    const waveform = new TimeSeries();
    waveformRef.current = waveform;
    const thresholdSeries = new TimeSeries();
    thresholdSeriesRef.current = thresholdSeries;

    chart.addTimeSeries(waveform, {
      strokeStyle: CANVAS_RED,
      lineWidth: 2,
    });
    chart.addTimeSeries(thresholdSeries, {
      strokeStyle: CANVAS_GREEN,
      lineWidth: 2,
    });

    chart.streamTo(canvas);

    let ctx: AudioContext | null = null;
    let stream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      .then((s) => {
        stream = s;
        ctx = new AudioContext({ sampleRate: 48000 }); // Select 48000, 44100, 96000 if supported.
        const mic = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512; // A lower value increases responsiveness.
        mic.connect(analyser);

        const buffer = new Uint8Array(analyser.fftSize);

        const update = () => {
          analyser.getByteTimeDomainData(buffer);

          // Calculate peak amplitude.
          let peak = 0;
          for (let i = 0; i < buffer.length; i++) {
            const val = Math.abs(buffer[i] - 128);
            if (val > peak) peak = val;
          }
          const SCALE = 100;
          const amplitude = (SCALE * peak) / 128;
          waveform.append(Date.now(), amplitude);

          requestAnimationFrame(update);
        };

        update();
      });

    return () => {
      chart.stop();
      if (ctx) ctx.close();
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [width, height]);

  // Draw threshold line.
  useEffect(() => {
    const thresholdSeries = thresholdSeriesRef.current;
    const updateThreshold = () => {
      if (thresholdSeries) {
        thresholdSeries.clear();
        const now = Date.now();
        const chartWindowInMs = width * MS_PER_PIXEL;
        thresholdSeries.append(now - chartWindowInMs, threshold);
        thresholdSeries.append(now, threshold);
      }
    };

    updateThreshold();

    const interval = setInterval(updateThreshold, 20);
    return () => clearInterval(interval);
  }, [threshold, width]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

const Calibration = () => {
  const [threshold, setThreshold] = useState(
    Number(localStorage.getItem("calibration.threshold"))
  );
  const [cooldown, setCooldown] = useState(
    Number(localStorage.getItem("calibration.cooldown"))
  );

  const [measuring, setMeasuring] = useState(true);
  const [width, setWidth] = useState(() => window.innerWidth - rem2px(2));

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth - rem2px(2));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="default-layout">
      <Footer>
        <a
          className="btn-floating btn-large waves-effect waves-light primary-bg"
          onClick={() => window.history.back()}
        >
          <i className="material-icons">home</i>
        </a>

        <a
          className="btn waves-effect waves-light secondary-bg"
          onClick={() => setMeasuring((m) => !m)}
        >
          <i className="material-icons left">mic</i>
          {measuring ? "Stop" : "Start"}
        </a>
      </Footer>

      <h4>Calibration</h4>

      <div style={{ lineHeight: 0 }}>
        <WaveformChart
          threshold={threshold}
          width={width}
          height={CHART_HEIGHT}
          measuring={measuring}
        />
        <CooldownBar cooldown={cooldown} width={width} />
      </div>

      <Slider
        title="Threshold (%)"
        min={5}
        max={95}
        step={1}
        value={threshold}
        setValue={setThreshold}
        keyName="calibration.threshold"
      />

      <Slider
        title="Cooldown (ms)"
        min={100}
        max={500}
        step={10}
        value={cooldown}
        setValue={setCooldown}
        keyName="calibration.cooldown"
      />
    </div>
  );
};

export default Calibration;
