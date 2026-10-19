function initSideField(c, side) {
  const S = 44, R = 200;
  if (!c)
    return;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const ctx = c.getContext("2d");
  if (!ctx)
    return;
  const styles = getComputedStyle(c);
  const accent = styles.getPropertyValue("--motion-accent-rgb").trim();
  const ink = styles.getPropertyValue("--motion-ink-rgb").trim();
  let w = 0, h = 0, dpr = 1, cols = 0, rows = 0, any = false, raf = 0, last = 0;
  let I = new Float32Array(0), F = new Float32Array(0);
  let mx = -99999, my = -99999;
  const setup = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = c.clientWidth;
    h = c.clientHeight;
    any = false;
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    cols = Math.ceil(w / S);
    rows = Math.ceil(h / S);
    I = new Float32Array(cols * rows);
    F = new Float32Array(cols * rows);
    for (let q = 0;q < cols; q++) {
      const x = q * S + S / 2;
      const xo = side === "left" ? x / w : 1 - x / w;
      let f = 1;
      if (xo > 0.75) {
        const u = Math.min(1, (xo - 0.75) / 0.25);
        f = 1 - u * u * (3 - 2 * u);
      }
      for (let r = 0;r < rows; r++)
        F[r * cols + q] = f;
    }
  };
  setup();
  const wake = () => {
    if (!raf && !motion.matches && !document.hidden && w && h) {
      last = 0;
      raf = requestAnimationFrame(loop);
    }
  };
  const onMove = (e) => {
    if (e.pointerType === "touch")
      return;
    mx = e.clientX;
    my = e.clientY;
    wake();
  };
  const onLeave = () => {
    mx = -99999;
    my = -99999;
    wake();
  };
  const draw = (dt) => {
    const rect = c.getBoundingClientRect();
    const lx = mx - rect.left, ly = my - rect.top;
    const near = mx > -9999 && lx > -R && lx < w + R && ly > -R && ly < h + R;
    if (!any && !near)
      return;
    const decay = Math.exp(-dt / 1100), rise = Math.min(1, dt / 120);
    let anyNow = false;
    for (let r = 0;r < rows; r++)
      for (let q = 0;q < cols; q++) {
        const i = r * cols + q;
        let target = 0;
        if (near) {
          const dx = q * S + S / 2 - lx, dy = r * S + S / 2 - ly;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < R) {
            const u = 1 - d / R;
            target = u * u;
          }
        }
        let v = I[i] ?? 0;
        if (target > v)
          v += (target - v) * rise;
        else
          v *= decay;
        I[i] = v > 0.01 ? v : 0;
        if (v > 0.01)
          anyNow = true;
      }
    any = anyNow;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!any)
      return;
    ctx.lineWidth = 1;
    for (let r = 0;r < rows; r++)
      for (let q = 0;q < cols; q++) {
        const i = r * cols + q, v = I[i] ?? 0;
        if (v < 0.05)
          continue;
        const x = q * S + S / 2, y = r * S + S / 2;
        if (q + 1 < cols && (I[i + 1] ?? 0) >= 0.05) {
          const a = Math.min(v, I[i + 1] ?? 0) * 0.5 * ((F[i] ?? 0) + (F[i + 1] ?? 0)) / 2;
          if (a > 0.01) {
            ctx.strokeStyle = `rgba(${accent},${a.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + S, y);
            ctx.stroke();
          }
        }
        if (r + 1 < rows && (I[i + cols] ?? 0) >= 0.05) {
          const a = Math.min(v, I[i + cols] ?? 0) * 0.5 * ((F[i] ?? 0) + (F[i + cols] ?? 0)) / 2;
          if (a > 0.01) {
            ctx.strokeStyle = `rgba(${accent},${a.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + S);
            ctx.stroke();
          }
        }
      }
    for (let r = 0;r < rows; r++)
      for (let q = 0;q < cols; q++) {
        const i = r * cols + q, v = I[i] ?? 0, f = F[i] ?? 0;
        if (v < 0.02 || f < 0.01)
          continue;
        const x = q * S + S / 2, y = r * S + S / 2;
        const s = 2.5 + 4.5 * v, ang = v * Math.PI / 4;
        const ca = Math.cos(ang) * s, sa = Math.sin(ang) * s;
        ctx.strokeStyle = `rgba(${ink},${(v * 0.55 * f).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(x - ca, y - sa);
        ctx.lineTo(x + ca, y + sa);
        ctx.moveTo(x + sa, y - ca);
        ctx.lineTo(x - sa, y + ca);
        ctx.stroke();
        ctx.fillStyle = `rgba(${accent},${(v * f).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.2 + 1.6 * v, 0, Math.PI * 2);
        ctx.fill();
      }
  };
  const loop = (t) => {
    raf = 0;
    const dt = Math.min(64, last ? t - last : 16);
    last = t;
    if (document.hidden || motion.matches)
      return;
    draw(dt);
    const rect = c.getBoundingClientRect();
    if (any || mx > rect.left - R && mx < rect.right + R && my > -R && my < h + R)
      raf = requestAnimationFrame(loop);
  };
  const onMotion = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    if (motion.matches) {
      I.fill(0);
      any = false;
      ctx.clearRect(0, 0, c.width, c.height);
    } else
      wake();
  };
  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else
      wake();
  };
  const resize = new ResizeObserver(() => {
    setup();
    wake();
  });
  resize.observe(c);
  window.addEventListener("pointermove", onMove);
  document.addEventListener("mouseleave", onLeave);
  document.addEventListener("visibilitychange", onVisibility);
  motion.addEventListener("change", onMotion);
}
document.querySelectorAll(".side-field").forEach((c) => initSideField(c, c.classList.contains("left") ? "left" : "right"));
document.querySelectorAll("[data-live]").forEach((b) => b.addEventListener("click", () => window.open("https://zelantrix-inc.lovable.app/admin", "_blank", "noopener")));

(() => {
 const banner = document.querySelector('.cookie-banner');
 const dialog = document.getElementById('offline-cookie-dialog');
 const key = 'zelantrix-cookie-choice';
 const maxAge = 180*24*60*60*1000;
 let choice = null;
 try { const c=JSON.parse(localStorage.getItem(key)); if(c && c.version===1 && c.necessary===true && typeof c.preferences==='boolean' && typeof c.analytics==='boolean' && Number.isFinite(c.savedAt) && c.savedAt<=Date.now() && Date.now()-c.savedAt<maxAge) choice=c; } catch {}
 if(banner) banner.hidden=false;
 const inputs = dialog ? dialog.querySelectorAll('input[type=checkbox]') : [];
 const fill = () => { if(inputs[0]) inputs[0].checked=choice?.preferences===true; if(inputs[1]) inputs[1].checked=choice?.analytics===true; };
 let previousFocus;
 const open = () => { if(!dialog) return; fill(); previousFocus=document.activeElement; dialog.showModal(); };
 const close = () => { if(dialog?.open) dialog.close(); previousFocus?.focus(); };
 const save = (preferences,analytics) => {
  choice={version:1,savedAt:Date.now(),necessary:true,preferences,analytics};
  try { localStorage.setItem(key,JSON.stringify(choice)); } catch {
   // file:// storage may be disabled; keep this document's choice only.
  }
  if(banner) banner.hidden=true; close();
 };
 fill();
 document.querySelectorAll('button').forEach(b => {
  const name=b.textContent.trim();
  if(name==='Cookie Settings' || name==='Configure Cookies') b.addEventListener('click',open);
  else if(name==='Necessary Cookies Only') b.addEventListener('click',()=>save(false,false));
  else if(name==='Accept All Cookies') b.addEventListener('click',()=>save(true,true));
  else if(name==='Save Preferences') b.addEventListener('click',()=>save(inputs[0]?.checked===true,inputs[1]?.checked===true));
  else if(b.getAttribute('aria-label')==='Close cookie preferences') b.addEventListener('click',close);
 });
 dialog?.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect(); if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) close();}});
 document.querySelectorAll('.cookie-dialog a').forEach(a=>a.addEventListener('click',close));
 const form=document.querySelector('.query-form');
 if(form){
  form.addEventListener('input',()=>form.querySelector('.query-result')?.remove());
  form.addEventListener('submit',e=>{
   e.preventDefault();if(!form.reportValidity())return;
   form.querySelector('.query-result')?.remove();
   const category=form.querySelector('select').value;
   const subject=form.querySelector('input').value.trim();
   const body=form.querySelector('textarea').value.trim();
   const result=document.createElement('div');result.className='query-result';result.setAttribute('role','status');
   const note=document.createElement('p');note.textContent='Your email draft is ready—not sent.';result.append(note);
   const a=document.createElement('a');a.className='policy-button policy-button-solid';a.textContent='Open Email App ↗';a.href='mailto:raihan@zelantrix.com?subject='+encodeURIComponent('['+category+'] '+subject)+'&body='+encodeURIComponent(body);result.append(a);
   const fallback=document.createElement('p');fallback.textContent='No email app? Send your subject and message to raihan@zelantrix.com using your email service.';result.append(fallback);form.append(result);
  });
 }
})();
