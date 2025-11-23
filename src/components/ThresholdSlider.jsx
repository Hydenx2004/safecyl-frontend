import React from "react";

export default function ThresholdSlider({ value = 200, onChange, min = 10, max = 1500 }) {
  return (
    <div className="threshold-slider">
      <input type="range" min={min} max={max} value={value} onChange={(e)=>onChange(Number(e.target.value))} />
    </div>
  );
}
