import React, { useRef, useEffect, useState } from 'react';

export default function CubicBezierEditor({ bezier, onChange, dark }) {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null); // 'p1' or 'p2' or null

  const getCanvasCoords = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX) ?? 0;
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY) ?? 0;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleDown = (e) => {
    // e.preventDefault() can be useful, but let's just do it directly on touch start if needed
    const pos = getCanvasCoords(e);
    const p1x = bezier[0] * 200;
    const p1y = 200 - (bezier[1] + 0.5) * 100;
    const p2x = bezier[2] * 200;
    const p2y = 200 - (bezier[3] + 0.5) * 100;
    
    const dist1 = Math.hypot(pos.x - p1x, pos.y - p1y);
    const dist2 = Math.hypot(pos.x - p2x, pos.y - p2y);
    
    if (dist1 < 20 && dist1 <= dist2) {
      setDragging('p1');
    } else if (dist2 < 20) {
      setDragging('p2');
    }
  };

  const handleMove = (e) => {
    if (!dragging) return;
    const pos = getCanvasCoords(e);
    let newX = pos.x / 200;
    let newY = (200 - pos.y) / 100 - 0.5;
    
    // clamp X between 0 and 1
    newX = Math.max(0, Math.min(1, newX));
    // clamp Y to the visible bounds
    newY = Math.max(-0.5, Math.min(1.5, newY));

    // round to 2 decimals
    newX = Math.round(newX * 100) / 100;
    newY = Math.round(newY * 100) / 100;

    if (dragging === 'p1') {
      onChange([newX, newY, bezier[2], bezier[3]]);
    } else if (dragging === 'p2') {
      onChange([bezier[0], bezier[1], newX, newY]);
    }
  };

  const handleUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, 200, 200);

    // Draw grid/background
    ctx.fillStyle = dark ? '#18181b' : '#fafafa';
    ctx.fillRect(0, 0, 200, 200);

    // Draw axes
    ctx.strokeStyle = dark ? '#3f3f46' : '#e4e4e7';
    ctx.lineWidth = 1;
    // Y=0 line (which is y=150)
    ctx.beginPath(); ctx.moveTo(0, 150); ctx.lineTo(200, 150); ctx.stroke();
    // Y=1 line (which is y=50)
    ctx.beginPath(); ctx.moveTo(0, 50); ctx.lineTo(200, 50); ctx.stroke();
    // X=0 and X=1 lines
    ctx.beginPath(); ctx.moveTo(0, 50); ctx.lineTo(0, 150); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(200, 50); ctx.lineTo(200, 150); ctx.stroke();

    // Coordinates mapping function
    const toPx = (x, y) => ({
      x: x * 200,
      y: 200 - (y + 0.5) * 100
    });

    const p0 = toPx(0, 0);
    const p1 = toPx(bezier[0], bezier[1]);
    const p2 = toPx(bezier[2], bezier[3]);
    const p3 = toPx(1, 1);

    // Draw lines to control points
    ctx.strokeStyle = dark ? '#52525b' : '#a1a1aa';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p3.x, p3.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    ctx.setLineDash([]);

    // Draw bezier curve
    ctx.strokeStyle = '#3b82f6'; // blue-500
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    ctx.stroke();

    // Draw control points handles
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ec4899'; // pink-500
    ctx.lineWidth = 2;
    
    // p1 handle
    ctx.beginPath(); ctx.arc(p1.x, p1.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // p2 handle
    ctx.beginPath(); ctx.arc(p2.x, p2.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    
    // Anchor points (p0, p3)
    ctx.fillStyle = dark ? '#d4d4d8' : '#3f3f46';
    ctx.beginPath(); ctx.arc(p0.x, p0.y, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(p3.x, p3.y, 3, 0, Math.PI * 2); ctx.fill();

  }, [bezier, dark]);

  // Handle global mouse/touch events
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleUp);
      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleUp);
      };
    }
  }, [dragging, bezier]); // depend on bezier to capture latest state in handleMove closure

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          onMouseDown={handleDown}
          onTouchStart={(e) => { e.preventDefault(); handleDown(e); }}
          className={`border rounded-xl cursor-crosshair touch-none shadow-sm ${dark ? 'border-zinc-700 bg-[#18181b]' : 'border-zinc-300 bg-[#fafafa]'}`}
          style={{ width: 200, height: 200 }}
        />
      </div>
      <div className="flex items-center justify-center gap-2 text-xs font-mono font-medium">
        <span className={dark ? "text-zinc-400" : "text-zinc-500"}>cubic-bezier(</span>
        <div className={`px-2 py-1 rounded ${dark ? 'bg-zinc-800 text-pink-400' : 'bg-zinc-100 text-pink-600'}`}>
          {bezier[0].toFixed(2)}, {bezier[1].toFixed(2)}
        </div>
        <span className={dark ? "text-zinc-400" : "text-zinc-500"}>,</span>
        <div className={`px-2 py-1 rounded ${dark ? 'bg-zinc-800 text-pink-400' : 'bg-zinc-100 text-pink-600'}`}>
          {bezier[2].toFixed(2)}, {bezier[3].toFixed(2)}
        </div>
        <span className={dark ? "text-zinc-400" : "text-zinc-500"}>)</span>
      </div>
    </div>
  );
}
