import React, { useEffect, useState, useRef } from "react";
import LineChart from "./components/LineChart";
import CircleProgress from "./components/CircleProgress";
import ThresholdSlider from "./components/ThresholdSlider";

export default function Dashboard({ apiBase, onLogout }) {
  const [data, setData] = useState(null);
  const [samples, setSamples] = useState([]);
  const [threshold, setThreshold] = useState(200);
  const [loading, setLoading] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const pollRef = useRef(null);
  const alarmIntervalRef = useRef(null);
  const prevExceededRef = useRef(false);

  const parseNumber = (v) => {
    if (v == null) return null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/all`);
      const json = await res.json();
      if (json?.ok) {
        setData(json.data ?? {});
        // derive a numeric mq value if present
        const mq = parseNumber(json.data?.["mq-2"] ?? json.data?.mq) ?? null;
        const val = mq !== null ? mq : parseNumber(json.data?.lpg) ?? null;
        setSamples((s) => {
          const next = [...s].slice(-59);
          next.push(val === null ? 0 : val);
          return next;
        });
        // alarm check: trigger when reading exceeds threshold
        const exceeded = val != null && val > threshold;
        if (exceeded && !prevExceededRef.current) {
          // rising edge -> start alarm
          prevExceededRef.current = true;
          setAlarmActive(true);
          // play a beep immediately and repeatedly until cleared
          try {
            playBeep();
            alarmIntervalRef.current = setInterval(() => playBeep(), 4000);
          } catch (e) {
            console.warn("beep failed", e);
          }
        }
        if (!exceeded && prevExceededRef.current) {
          // cleared
          prevExceededRef.current = false;
          setAlarmActive(false);
          if (alarmIntervalRef.current) {
            clearInterval(alarmIntervalRef.current);
            alarmIntervalRef.current = null;
          }
        }
      } else {
        console.warn("/api/all returned not ok", json);
      }
    } catch (e) {
      console.error("fetchAll error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch
    fetchAll();
    // poll every 3s
    pollRef.current = setInterval(fetchAll, 3000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(()=>{
    // cleanup alarm interval when unmounting
    return ()=>{
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    };
  },[]);

  function playBeep(){
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.08;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      setTimeout(()=>{
        o.stop();
        try{ctx.close();}catch(e){}
      }, 350);
    }catch(e){
      // ignore in environments without WebAudio
      console.warn('playBeep error', e);
    }
  }

  // derived displays
  const mqNow = (() => {
    if (!data) return null;
    return parseNumber(data["mq-2"]) ?? parseNumber(data.mq) ?? null;
  })();

  // cylinder capacity (grams) - can be overridden with VITE_CYL_CAPACITY
  const CAPACITY = Number(import.meta.env.VITE_CYL_CAPACITY) || 600;

  const cylinderGrams = (() => {
    if (!data) return null;
    const v = parseNumber(data.loadcel) ?? parseNumber(data.loadcell) ?? parseNumber(data.weight);
    return v == null ? null : v;
  })();

  const cylinderPercent = (() => {
    if (cylinderGrams == null) return 62;
    const pct = Math.round((cylinderGrams / CAPACITY) * 100);
    return Math.max(0, Math.min(100, pct));
  })();

  const lastUpdate = (() => {
    if (!data) return "-";
    if (data.ts) return new Date(data.ts).toLocaleTimeString();
    return new Date().toLocaleTimeString();
  })();

  return (
    <div className="dash-root">
      <nav className="topbar">
        <div className="brand">🛡️ SafeCyl Dashboard</div>
        <div>
          <button className="btn-ghost" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <main className="dash-main">
        <div className="cards">
          <div className="card">
            <div className="card-title">Leak Status</div>
            <div className={`card-value ${((mqNow ?? 0) < threshold) ? 'safe' : 'leak'}`}>{(mqNow ?? 0) < threshold ? "SAFE" : "LEAK"}</div>
            <div className="card-meta">MQ sensor</div>
          </div>

          <div className="card">
            <div className="card-title">Cylinder Level</div>
            <div className="card-value big">{cylinderPercent}%</div>
            <div className="card-meta">{cylinderGrams != null ? `${Math.round(cylinderGrams)} g` : "—"} / {CAPACITY} g</div>
          </div>

          <div className="card">
            <div className="card-title">LPG Concentration</div>
            <div className="card-value orange">{mqNow ?? "—"} ppm</div>
            <div className="card-meta">Last 3s avg</div>
          </div>

          <div className="card">
            <div className="card-title">Last Update</div>
            <div className="card-value">{lastUpdate}</div>
            <div className="card-meta">Real-time</div>
          </div>
        </div>

        <section className="panel">
          <h3>Real-time Readings</h3>
          <div className="chart-wrap">
            <LineChart data={samples} threshold={threshold} />
          </div>
        </section>

        <section className="panel two-col">
          <div>
            <h3>Cylinder Level</h3>
            <div className="circle-wrap">
              <CircleProgress percent={cylinderPercent} grams={cylinderGrams} capacity={CAPACITY} />
            </div>
          </div>

          <div className="controls-panel">
            <h3>Controls</h3>
            <div className="control-row">
              <label>Leak Threshold (ppm)</label>
              <ThresholdSlider value={threshold} onChange={setThreshold} min={10} max={1500} />
              <div className="threshold-value">{threshold} ppm</div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
