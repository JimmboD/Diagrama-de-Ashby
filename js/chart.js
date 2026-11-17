/* Motor de dibujo de diagramas de Ashby (canvas) — tema oscuro */
const Ashby = (() => {
  const M = {l:78, r:24, t:18, b:62};
  const C = {txt:'#e7e9f0', mut:'#8b90a3', bg:'#0a0b10', grid:'#ffffff14', gridMinor:'#ffffff08'};
  let cv, ctx, tip, mats = [], fams = {}, hidden = new Set();
  let cur = null, W = 0, H = 0, dpr = 1, anim = {start:0}, hover = null, pinned = null, mouse = null;
  let opts = {labels:()=>false, hulls:()=>true}, onCount = ()=>{}, onPin = ()=>{};

  const val = (m,k) => PROPS[k].f ? PROPS[k].f(m) : m[k];
  const fmt = v => v>=1e4||v<1e-2 ? v.toExponential(2) : +v.toPrecision(3)+'';
  const norm = (v,[a,b],log) => ((log?Math.log10(v):v)-a)/(b-a);
  const ease = t => 1-Math.pow(1-t,4);
  const px = n => M.l+n*(W-M.l-M.r), py = n => H-M.b-n*(H-M.t-M.b);
  const hexA = (h,a) => h+Math.round(a*255).toString(16).padStart(2,'0');
  const sup = n => String(n).split('').map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹⁻'['0123456789-'.indexOf(c)]).join('');

  function init(canvas, tooltip, materials, families, options, countCb, pinCb){
    cv = canvas; ctx = cv.getContext('2d'); tip = tooltip;
    mats = materials; fams = families; opts = options; onCount = countCb; onPin = pinCb;
    new ResizeObserver(resize).observe(cv.parentElement);
    cv.onmousemove = onMove;
    cv.onmouseleave = () => { hover = null; mouse = null; tip.classList.remove('show'); };
    cv.onclick = () => { pinned = (hover && hover!==pinned) ? hover : null; onPin(pinned ? {m:pinned.m, color:fams[pinned.m.Familia]} : null); };
    requestAnimationFrame(frame);
  }
  function resize(){
    const r = cv.getBoundingClientRect(); if(!r.width) return;
    dpr = window.devicePixelRatio||1; W = r.width; H = r.height;
    cv.width = W*dpr; cv.height = H*dpr;
  }

  function show(d){
    const logX = d.logX ?? PROPS[d.x].log, logY = d.logY ?? PROPS[d.y].log;
    const pts = mats.map(m => ({m, vx:val(m,d.x), vy:val(m,d.y)}))
      .filter(p => isFinite(p.vx)&&isFinite(p.vy)&&(!logX||p.vx>0)&&(!logY||p.vy>0));
    const dom = (k,log) => {
      const v = pts.map(p=>k=='x'?p.vx:p.vy); let a=Math.min(...v), b=Math.max(...v);
      if(log){ a=Math.floor(Math.log10(a)-.15); b=Math.ceil(Math.log10(b)+.15); if(a==b) b++; }
      else { const p=(b-a||1)*.08; a=Math.max(0,a-p); b+=p; }
      return [a,b];
    };
    const prev = cur;
    cur = {d, logX, logY, pts, dx:dom('x',logX), dy:dom('y',logY)};
    const old = new Map(); if(prev && prev.pts) prev.pts.forEach(p=>old.set(p.m,{x:p.cx,y:p.cy}));
    pts.forEach(p => {
      p.nx = norm(p.vx,cur.dx,logX); p.ny = norm(p.vy,cur.dy,logY);
      const o = old.get(p.m); p.fx = o?o.x:p.nx; p.fy = o?o.y:0; p.cx=p.fx; p.cy=p.fy; p.s=0; p.hv=0;
    });
    anim.start = performance.now(); hover = null; pinned = null; onPin(null); tip.classList.remove('show');
    resize(); count();
  }
  function count(){
    if(!cur) return;
    const v = cur.pts.filter(p=>!hidden.has(p.m.Familia));
    const rng = k => v.length ? [Math.min(...v.map(p=>p[k])), Math.max(...v.map(p=>p[k]))] : [0,0];
    onCount(v.length, mats.length, {xr:rng('vx'), yr:rng('vy'), fams:new Set(v.map(p=>p.m.Familia)).size, d:cur.d});
  }
  function toggleFamily(f){ const s = fst(f), on = hidden.has(f); on ? hidden.delete(f) : hidden.add(f); s.dir = on ? 1 : -1; s.t0 = performance.now(); if(on && s.fb<=0) s.fb = .001; if(pinned && hidden.has(pinned.m.Familia)){ pinned=null; onPin(null); } count(); }
  function unpin(){ pinned = null; }

  function hull(P){
    P = P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]); if(P.length<3) return P;
    const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
    const lo=[], up=[];
    for(const p of P){ while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0) lo.pop(); lo.push(p); }
    for(const p of P.slice().reverse()){ while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0) up.pop(); up.push(p); }
    return lo.slice(0,-1).concat(up.slice(0,-1));
  }

  /* ---------- estado animado por familia ---------- */
  const FS = {};   // f -> {fb: brillo 0..1, ff: foco 0..1, gb: realce 0..1, t0, dir}
  const fst = f => FS[f] || (FS[f] = {fb:1, ff:1, gb:0, t0:0, dir:0});
  // parpadeo de apagado (neón que titila y se extingue) y encendido
  function flicker(f, now){
    const s = fst(f); if(!s.dir) return;
    const e = now - s.t0;
    if(s.dir < 0){                       // apagando
      const k = Math.min(1, e/1100);
      s.fb = k>=1 ? 0 : (1-k*k) * (Math.sin(k*46*(1+k)) > -.1 ? 1 : .12);
      if(k>=1) s.dir = 0;
    } else {                             // encendiendo
      const k = Math.min(1, e/600);
      s.fb = k>=1 ? 1 : k * (Math.sin(k*28) > -.4 ? 1 : .35);
      if(k>=1) s.dir = 0;
    }
  }
  function inHull(h, x, y, pad){
    if(!h.length) return false;
    let inside = false;
    for(let i=0,j=h.length-1;i<h.length;j=i++){
      if(((h[i][1]>y)!=(h[j][1]>y)) && (x < (h[j][0]-h[i][0])*(y-h[i][1])/(h[j][1]-h[i][1])+h[i][0])) inside = !inside;
    }
    if(inside) return true;
    for(let i=0;i<h.length;i++){
      const a=h[i], b=h[(i+1)%h.length], dx=b[0]-a[0], dy=b[1]-a[1], l=dx*dx+dy*dy;
      const k = l ? Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/l)) : 0;
      if(Math.hypot(x-(a[0]+k*dx), y-(a[1]+k*dy)) <= pad) return true;
    }
    return false;
  }

  let hoverFam = null, hulls = {};
  function drawOrb(x, y, r, col, boost, tw, alpha){
    if(alpha<=0.01 || r<=0) return;
    ctx.save(); ctx.globalAlpha = alpha;
    // punto liso con resplandor suave, como los íconos de la leyenda
    ctx.shadowColor = col; ctx.shadowBlur = 8 + boost*18;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fill();
    ctx.restore();
  }
  function frame(now){
    requestAnimationFrame(frame);
    if(!cur || !W) return;
    const t = Math.min(1,(now-anim.start)/1100), e = ease(t);
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
    drawAxes(Math.min(1,e*1.4));
    Object.keys(fams).forEach(f => flicker(f, now));
    cur.pts.forEach((p,i) => {
      const k = ease(Math.min(1,Math.max(0,t*1.3-i*0.012)));
      p.cx = p.fx+(p.nx-p.fx)*k; p.cy = p.fy+(p.ny-p.fy)*k; p.s = k;
      p.X = px(p.cx); p.Y = py(p.cy);
      p.hv += ((hover===p?1:0)-p.hv)*.2;
    });
    const vis = cur.pts.filter(p => fst(p.m.Familia).fb > .01);

    // regiones (casco convexo) de cada familia
    hulls = {};
    Object.keys(fams).forEach(f => {
      const g = vis.filter(p=>p.m.Familia==f); if(g.length) hulls[f] = hull(g.map(p=>[p.X,p.Y]));
    });
    // grupo bajo el cursor (si no hay punto directo)
    hoverFam = null;
    if(hover) hoverFam = hover.m.Familia;
    else if(mouse && opts.hulls()) for(const f in hulls){ if(!hidden.has(f) && inHull(hulls[f], mouse.x, mouse.y, 17)){ hoverFam = f; break; } }
    const focusF = hoverFam || (pinned ? pinned.m.Familia : null);
    cv.style.cursor = hover ? 'pointer' : (hoverFam ? 'crosshair' : 'default');

    Object.keys(fams).forEach(f => { const s = fst(f);
      s.ff += ((focusF && f!==focusF ? .18 : 1) - s.ff)*.14;
      s.gb += ((focusF===f ? 1 : 0) - s.gb)*.14; });

    if(opts.hulls()) Object.keys(hulls).forEach(f => {
      const h = hulls[f], col = fams[f], s = fst(f);
      ctx.save(); ctx.globalAlpha = e*s.fb*s.ff; ctx.lineJoin='round'; ctx.lineCap='round';
      ctx.beginPath(); h.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));
      if(h.length==1) ctx.lineTo(h[0][0]+.01,h[0][1]);
      if(h.length>2) ctx.closePath();
      const a = .1 + s.gb*.16;
      ctx.lineWidth = 34; ctx.strokeStyle = hexA(col,a); ctx.stroke();
      if(h.length>2){ ctx.fillStyle = hexA(col,a); ctx.fill(); }
      if(s.gb > .02){ ctx.lineWidth = 1.2; ctx.setLineDash([5,6]); ctx.strokeStyle = hexA(col,.5*s.gb); ctx.stroke(); }
      ctx.restore();
    });

    // retícula hacia los ejes
    const fp = hover || pinned;
    if(fp){
      const col = fams[fp.m.Familia];
      ctx.save(); ctx.setLineDash([4,5]); ctx.strokeStyle = hexA(col,.7); ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(M.l,fp.Y); ctx.lineTo(fp.X,fp.Y); ctx.lineTo(fp.X,H-M.b); ctx.stroke(); ctx.setLineDash([]);
      ctx.font='600 11px Segoe UI'; const chip = (txt,x,y,al) => {
        const w = ctx.measureText(txt).width+12; const x0 = al=='c'?x-w/2:x-w;
        ctx.fillStyle=col; ctx.beginPath(); ctx.roundRect(x0,y-10,w,20,6); ctx.fill();
        ctx.fillStyle='#0a0b10'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(txt,x0+w/2,y); };
      chip(fmt(fp.vx), fp.X, H-M.b+14, 'c'); chip(fmt(fp.vy), M.l-4, fp.Y, 'r');
      ctx.restore();
    }

    // puntos: esferas luminosas con respiración suave
    vis.forEach(p => {
      const f = p.m.Familia, s = fst(f), col = fams[f], isP = pinned===p;
      if(!p.ph) p.ph = Math.random()*6.28;
      const tw = (Math.sin(now/900 + p.ph)+1)/2;
      const r = (5.5 + p.hv*2.5 + s.gb*1 + (isP?2:0)) * p.s * (.55+.45*s.fb);
      const boost = Math.max(p.hv, s.gb*.7, isP?1:0);
      drawOrb(p.X, p.Y, r, col, boost, tw, s.fb*s.ff*(.85+.15*tw));
    });

    // etiquetas: todas, o las del grupo enfocado
    const all = opts.labels();
    if(all || hover || pinned || hoverFam){
      ctx.font='11.5px Segoe UI'; ctx.textBaseline='middle'; ctx.fillStyle=C.txt;
      vis.forEach(p => { const f = p.m.Familia;
        if(!all && hover!==p && pinned!==p && f!==hoverFam) return;
        ctx.globalAlpha = e*fst(f).fb*fst(f).ff;
        const right = p.X+ctx.measureText(p.m.Material).width+16<W;
        ctx.textAlign = right?'left':'right'; ctx.fillText(p.m.Material,p.X+(right?12:-12),p.Y-13); });
      ctx.globalAlpha=1;
    }
  }
  function ticks([a,b],log){
    const out=[];
    if(log){ for(let n=a;n<=b;n++){ out.push({v:n,major:true}); if(n<b) for(let k=2;k<10;k++) out.push({v:n+Math.log10(k),major:false}); } }
    else { const raw=(b-a)/7, mag=Math.pow(10,Math.floor(Math.log10(raw))), f=raw/mag, st=(f<1.5?1:f<3.5?2:f<7.5?5:10)*mag;
      for(let v=Math.ceil(a/st)*st; v<=b+1e-9; v+=st) out.push({v,major:true}); }
    return out;
  }
  function drawAxes(a){
    const {dx,dy,logX,logY,d} = cur, x0=M.l, x1=W-M.r, y0=H-M.b, y1=M.t;
    ctx.save(); ctx.globalAlpha=a; ctx.font='12px Segoe UI'; ctx.fillStyle=C.mut; ctx.lineWidth=1;
    ticks(dx,logX).forEach(t => { const X=px((t.v-dx[0])/(dx[1]-dx[0]));
      ctx.strokeStyle=t.major?C.grid:C.gridMinor; ctx.beginPath(); ctx.moveTo(X,y0); ctx.lineTo(X,y1); ctx.stroke();
      if(t.major){ ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText(logX?'10'+sup(t.v):fmt(t.v),X,y0+8); } });
    ticks(dy,logY).forEach(t => { const Y=py((t.v-dy[0])/(dy[1]-dy[0]));
      ctx.strokeStyle=t.major?C.grid:C.gridMinor; ctx.beginPath(); ctx.moveTo(x0,Y); ctx.lineTo(x1,Y); ctx.stroke();
      if(t.major){ ctx.textAlign='right'; ctx.textBaseline='middle'; ctx.fillText(logY?'10'+sup(t.v):fmt(t.v),x0-8,Y); } });
    ctx.strokeStyle='#ffffff55'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(x0,y1); ctx.lineTo(x0,y0); ctx.lineTo(x1,y0); ctx.stroke();
    ctx.fillStyle=C.txt; ctx.font='600 13px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText(`${PROPS[d.x].l} (${PROPS[d.x].u})`,(x0+x1)/2,H-6);
    ctx.translate(16,(y0+y1)/2); ctx.rotate(-Math.PI/2); ctx.textBaseline='top';
    ctx.fillText(`${PROPS[d.y].l} (${PROPS[d.y].u})`,0,0);
    ctx.restore();
  }

  function onMove(ev){
    if(!cur) return;
    const r = cv.getBoundingClientRect(), x = ev.clientX-r.left, y = ev.clientY-r.top; mouse = {x,y};
    let best=null, bd=18;
    cur.pts.forEach(p => { if(hidden.has(p.m.Familia)) return; const d=Math.hypot(p.X-x,p.Y-y); if(d<bd){bd=d;best=p;} });
    hover = best;
    if(!best){ tip.classList.remove('show'); return; }
    const m=best.m, d=cur.d;
    tip.innerHTML = `<b>${m.Material}</b><em style="--c:${fams[m.Familia]}">${m.Familia.replace('_',' / ')}</em>
      <div><span>${PROPS[d.x].l}</span><strong>${fmt(best.vx)} <small>${PROPS[d.x].u}</small></strong></div>
      <div><span>${PROPS[d.y].l}</span><strong>${fmt(best.vy)} <small>${PROPS[d.y].u}</small></strong></div>`;
    const left = x+18+tip.offsetWidth > r.width ? x-18-tip.offsetWidth : x+18;
    tip.style.left = Math.max(6,left)+'px'; tip.style.top = Math.max(6,Math.min(y-40, r.height-tip.offsetHeight-6))+'px';
    tip.classList.add('show');
  }

  return {init, show, toggleFamily, resize, unpin};
})();
