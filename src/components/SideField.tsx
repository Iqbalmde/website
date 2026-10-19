// @ts-nocheck -- logic kept verbatim from spec; strict index checks disabled here
import { useEffect, useRef } from "react";
const S = 44, R = 200;
export default function SideField({ side }: { side: "left" | "right" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d")!;
    let w = 0, h = 0, dpr = 1, cols = 0, rows = 0, any = false, raf = 0, last = 0;
    let I = new Float32Array(0), F = new Float32Array(0);
    let mx = -99999, my = -99999;
    const setup = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = c.clientWidth; h = c.clientHeight;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      cols = Math.ceil(w / S); rows = Math.ceil(h / S);
      I = new Float32Array(cols * rows); F = new Float32Array(cols * rows);
      for (let q = 0; q < cols; q++) {
        const x = q * S + S / 2;
        const xo = side === "left" ? x / w : 1 - x / w;        // 0 = outer edge, 1 = inner edge
        let f = 1;
        if (xo > 0.75) { const u = Math.min(1, (xo - 0.75) / 0.25); f = 1 - u * u * (3 - 2 * u); } // last 25% (=5% of screen) fades out
        for (let r = 0; r < rows; r++) F[r * cols + q] = f;
      }
    };
    setup();
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const onLeave = () => { mx = -99999; my = -99999; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", setup);
    document.addEventListener("mouseleave", onLeave);
    const draw = (dt: number) => {
      const rect = c.getBoundingClientRect();
      const lx = mx - rect.left, ly = my - rect.top;
      const near = mx > -9999 && lx > -R && lx < w + R;
      if (!any && !near) return;
      const decay = Math.exp(-dt / 1100), rise = Math.min(1, dt / 120);
      let anyNow = false;
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
        const i = r * cols + q;
        let target = 0;
        if (near) {
          const dx = q * S + S / 2 - lx, dy = r * S + S / 2 - ly;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < R) { const u = 1 - d / R; target = u * u; }
        }
        let v = I[i];
        if (target > v) v += (target - v) * rise; else v *= decay;
        I[i] = v; if (v > 0.01) anyNow = true;
      }
      any = anyNow;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!any) return;
      ctx.lineWidth = 1;
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {   // connecting lines
        const i = r * cols + q, v = I[i]; if (v < 0.05) continue;
        const x = q * S + S / 2, y = r * S + S / 2;
        if (q + 1 < cols && I[i + 1] >= 0.05) {
          const a = Math.min(v, I[i + 1]) * 0.5 * (F[i] + F[i + 1]) / 2;
          if (a > 0.01) { ctx.strokeStyle = `rgba(47,158,146,${a.toFixed(3)})`; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + S, y); ctx.stroke(); }
        }
        if (r + 1 < rows && I[i + cols] >= 0.05) {
          const a = Math.min(v, I[i + cols]) * 0.5 * (F[i] + F[i + cols]) / 2;
          if (a > 0.01) { ctx.strokeStyle = `rgba(47,158,146,${a.toFixed(3)})`; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + S); ctx.stroke(); }
        }
      }
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {   // marks
        const i = r * cols + q, v = I[i], f = F[i];
        if (v < 0.02 || f < 0.01) continue;
        const x = q * S + S / 2, y = r * S + S / 2;
        const s = 2.5 + 4.5 * v, ang = v * Math.PI / 4;
        const ca = Math.cos(ang) * s, sa = Math.sin(ang) * s;
        ctx.strokeStyle = `rgba(17,17,17,${(v * 0.55 * f).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(x - ca, y - sa); ctx.lineTo(x + ca, y + sa); ctx.moveTo(x + sa, y - ca); ctx.lineTo(x - sa, y + ca); ctx.stroke();
        ctx.fillStyle = `rgba(47,158,146,${(v * f).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, 1.2 + 1.6 * v, 0, Math.PI * 2); ctx.fill();
      }
    };
    const loop = (t: number) => {
      const dt = Math.min(64, last ? t - last : 16); last = t;
      if (!document.hidden) draw(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); window.removeEventListener("resize", setup); document.removeEventListener("mouseleave", onLeave); };
  }, [side]);
  return <canvas ref={ref} aria-hidden="true" className={`side-field ${side}`} />;
}
