import React from "react";

export default function CircleProgress({ percent = 62, kg = null, capacity = 20 }) {
  const size = 140;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent || 0));
  const dash = (clamped / 100) * c;

  const displayKg = kg != null ? Math.round(kg * 10) / 10 : Math.round((clamped / 100) * capacity * 10) / 10;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="50%" stopColor="#764ba2" />
          <stop offset="100%" stopColor="#f093fb" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g transform={`translate(${size/2},${size/2})`}>
        <circle r={r} fill="none" stroke="rgba(30, 41, 59, 0.3)" strokeWidth={stroke} />
        <circle r={r} fill="none" stroke="url(#progressGrad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`} transform="rotate(-90)" 
          filter="url(#glow)" style={{transition: 'stroke-dasharray 0.5s ease'}} />
        <text x="0" y="4" textAnchor="middle" fontSize="26" fill="#f1f5f9" fontWeight="700">{clamped}%</text>
        <text x="0" y="26" textAnchor="middle" fontSize="14" fill="#94a3b8" fontWeight="500">{displayKg} kg</text>
      </g>
    </svg>
  );
}
