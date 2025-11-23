import React, { useEffect, useState, useRef } from 'react';

export default function HistoricalChart({ apiBase }) {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchHistoricalData();
    // Set up real-time updates every 5 seconds
    intervalRef.current = setInterval(fetchHistoricalData, 5000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (historicalData.length > 0) {
      drawChart();
    }
  }, [historicalData]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/history?limit=100`);
      const json = await res.json();
      if (json?.ok) {
        setHistoricalData(json.data || []);
        setTotalRecords(json.totalRecords || 0);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || historicalData.length === 0) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up margins
    const margin = { top: 20, right: 80, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Find data ranges
    const loadcelValues = historicalData.map(d => d.loadcel).filter(v => v != null);
    const mqValues = historicalData.map(d => d.mq).filter(v => v != null);
    
    const maxLoadcel = Math.max(...loadcelValues, 1);
    const maxMq = Math.max(...mqValues, 1);
    const minLoadcel = Math.min(...loadcelValues, 0);
    const minMq = Math.min(...mqValues, 0);

    // Draw background
    ctx.fillStyle = 'rgba(16, 16, 24, 0.9)';
    ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = margin.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    const gridTimeStep = Math.max(1, Math.floor(historicalData.length / 10));
    for (let i = 0; i < historicalData.length; i += gridTimeStep) {
      const x = margin.left + (chartWidth / (historicalData.length - 1)) * i;
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + chartHeight);
      ctx.stroke();
    }

    // Draw loadcel line (blue)
    if (loadcelValues.length > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      historicalData.forEach((point, index) => {
        if (point.loadcel != null) {
          const x = margin.left + (chartWidth / (historicalData.length - 1)) * index;
          const y = margin.top + chartHeight - ((point.loadcel - minLoadcel) / (maxLoadcel - minLoadcel)) * chartHeight;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw mq line (purple)
    if (mqValues.length > 0) {
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      historicalData.forEach((point, index) => {
        if (point.mq != null) {
          const x = margin.left + (chartWidth / (historicalData.length - 1)) * index;
          const y = margin.top + chartHeight - ((point.mq - minMq) / (maxMq - minMq)) * chartHeight;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    }

    // Draw Y-axis scale labels for Loadcel (left)
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minLoadcel + ((maxLoadcel - minLoadcel) / 5) * i;
      const y = margin.top + chartHeight - (i * chartHeight / 5);
      ctx.fillText(`${value.toFixed(0)}g`, margin.left - 10, y + 4);
    }
    
    // Draw Y-axis scale labels for MQ (right)
    ctx.textAlign = 'left';
    for (let i = 0; i <= 5; i++) {
      const value = minMq + ((maxMq - minMq) / 5) * i;
      const y = margin.top + chartHeight - (i * chartHeight / 5);
      ctx.fillText(`${value.toFixed(0)} ppm`, margin.left + chartWidth + 10, y + 4);
    }
    
    // Draw time labels on X-axis
    ctx.textAlign = 'center';
    ctx.font = '10px Inter, sans-serif';
    const timeStep = Math.max(1, Math.floor(historicalData.length / 8));
    for (let i = 0; i < historicalData.length; i += timeStep) {
      const x = margin.left + (chartWidth / (historicalData.length - 1)) * i;
      const timestamp = new Date(historicalData[i].timestamp || historicalData[i].createdAt);
      const timeStr = timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      ctx.fillText(timeStr, x, height - 20);
    }
    
    // Draw axis labels
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Time →', width / 2, height - 5);
    
    // Y-axis labels
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('Cylinder Weight (grams)', 0, 0);
    ctx.restore();
    
    ctx.save();
    ctx.translate(width - 15, height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillText('Gas Concentration (ppm)', 0, 0);
    ctx.restore();
    
    // Enhanced Legend with better positioning
    const legendY = margin.top + 10;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(margin.left + 10, legendY, 20, 4);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🏺 Cylinder Weight', margin.left + 40, legendY + 12);
    
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(margin.left + 180, legendY, 20, 4);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('⚠️ Gas Level', margin.left + 210, legendY + 12);
    
    // Current values display
    if (historicalData.length > 0) {
      const latest = historicalData[historicalData.length - 1];
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#3b82f6';
      ctx.fillText(`Current: ${latest.loadcel?.toFixed(1) || 0}g`, width - 20, margin.top + 40);
      ctx.fillStyle = '#8b5cf6';
      ctx.fillText(`Current: ${latest.mq?.toFixed(1) || 0} ppm`, width - 20, margin.top + 55);
    }
  };

  return (
    <div className="historical-chart">
      <div className="chart-header">
        <h3>📊 Real-Time Historical Trends</h3>
        <div className="chart-stats">
          <div className="stats-info">
            <span className="record-count">📈 {totalRecords} Records</span>
            {lastUpdate && (
              <span className="last-update">
                🕒 Updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="chart-controls">
            <div className={`live-indicator ${loading ? 'updating' : 'live'}`}>
              <span className="dot"></span>
              {loading ? 'Updating...' : 'Live'}
            </div>
            <button 
              onClick={fetchHistoricalData} 
              disabled={loading}
              className="refresh-btn"
            >
              {loading ? '⏳' : '🔄'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="chart-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          style={{ width: '100%', height: 'auto', maxWidth: '800px' }}
        />
      </div>
      
      {historicalData.length === 0 && !loading && (
        <div className="no-data">
          <p>No historical data available</p>
          <p className="hint">Data will appear after calling /api/all endpoint multiple times</p>
        </div>
      )}
    </div>
  );
}