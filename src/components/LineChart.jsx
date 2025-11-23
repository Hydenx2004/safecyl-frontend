import React, { useEffect, useRef } from "react";

export default function LineChart({ data = [], threshold = 200 }) {
  const cRef = useRef(null);

  useEffect(() => {
    const canvas = cRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    // background
    ctx.clearRect(0, 0, w, h);
    // padding
    const pad = 24;
    const plotW = w - pad * 2;
    const plotH = h - pad * 2;
    // compute min/max
    const arr = data.length ? data : [0];
    const max = Math.max(...arr, threshold * 1.1);
    const min = Math.min(...arr, 0);
    const range = max - min || 1;

    // draw threshold dashed
    const thrY = pad + ((max - threshold) / range) * plotH;
    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = "#ff6b6b";
    ctx.lineWidth = 2;
    ctx.moveTo(pad, thrY);
    ctx.lineTo(pad + plotW, thrY);
    ctx.stroke();
    ctx.setLineDash([]);

    // draw grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const y = pad + (i / 3) * plotH;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(pad + plotW, y);
      ctx.stroke();
    }

    // draw line
    ctx.beginPath();
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 2;
    const len = arr.length;
    for (let i = 0; i < len; i++) {
      const x = pad + (i / Math.max(1, len - 1)) * plotW;
      const y = pad + ((max - arr[i]) / range) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // draw small points
    ctx.fillStyle = "#60a5fa";
    for (let i = 0; i < len; i++) {
      const x = pad + (i / Math.max(1, len - 1)) * plotW;
      const y = pad + ((max - arr[i]) / range) * plotH;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // left axis labels (min/max)
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "12px sans-serif";
    ctx.fillText(max.toFixed(0), 6, pad + 10);
    ctx.fillText(min.toFixed(0), 6, pad + plotH - 4);
  }, [data, threshold]);

  return (
    <div className="linechart">
      <canvas ref={cRef} style={{ width: "100%", height: 260 }} />
    </div>
  );
}
