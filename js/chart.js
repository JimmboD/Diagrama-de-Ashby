/* Motor de dibujo de diagramas de Ashby (canvas) */
const Ashby = (() => {
  const M = {l:78, r:24, t:18, b:62};
  let cv, ctx, tip, mats = [], fams = {}, hidden = new Set();
  let cur = null, W = 0, H = 0, dpr = 1, anim = {start:0}, hover = null;
  let opts = {labels:()=>false, hulls:()=>true}, onCount = ()=>{};

  const val = (m,k) => PROPS[k].f ? PROPS[k].f(m) : m[k];
  const fmt = v => v>=1e4||v<1e-2 ? v.toExponential(2) : +v.toPrecision(3)+'';
  const norm = (v,[a,b],log) => ((log?Math.log10(v):v)-a)/(b-a);
  const ease = t => 1-Math.pow(1-t,4);
  const px = n => M.l+n*(W-M.l-M.r), py = n => H-M.b-n*(H-M.t-M.b);
  const hexA = (h,a) => h+Math.round(a*255).toString(16).padStart(2,'0');
  const sup = n => String(n).split('').map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹⁻'['0123456789-'.indexOf(c)]).join('');

  function init(canvas, tooltip, materials, families, options, countCb){
    cv = canvas; ctx = cv.getContext('2d'); tip = tooltip;
    mats = materials; fams = families; opts = options; onCount = countCb;
    new ResizeObserver(resize).observe(cv.parentElement);
    cv.onmousemove = onMove;
    cv.onmouseleave = () => { hover = null; tip.classList.remove('show'); };
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
      const o = old.get(p.m); p.fx = o?o.x:p.nx; p.fy = o?o.y:0; p.cx=p.fx; p.cy=p.fy; p.s=0;
    });
    anim.start = performance.now(); hover = null; tip.classList.remove('show');
    resize(); count();
  }
  function count(){ if(cur) onCount(cur.pts.filter(p=>!hidden.has(p.m.Familia)).length, mats.length); }
  function toggleFamily(f){ hidden.has(f) ? hidden.delete(f) : hidden.add(f); count(); }

  function hull(P){
    P = P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]); if(P.length<3) return P;
    const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
    const lo=[], up=[];
    for(const p of P){ while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0) lo.pop(); lo.push(p); }
    for(const p of P.slice().reverse()){ while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0) up.pop(); up.push(p); }
    return lo.slice(0,-1).concat(up.slice(0,-1));
  }

  function frame(now){
    requestAnimationFrame(frame);
    if(!cur || !W) return;
    const t = Math.min(1,(now-anim.start)/1100), e = ease(t);
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,W,H);
    drawAxes(Math.min(1,e*1.4));
    cur.pts.forEach((p,i) => {
      const k = ease(Math.min(1,Math.max(0,t*1.3-i*0.012)));
      p.cx = p.fx+(p.nx-p.fx)*k; p.cy = p.fy+(p.ny-p.fy)*k; p.s = k;
      p.X = px(p.cx); p.Y = py(p.cy);
    });
    const vis = cur.pts.filter(p=>!hidden.has(p.m.Familia));
    if(opts.hulls()) Object.keys(fams).forEach(f => {
      const g = vis.filter(p=>p.m.Familia==f); if(!g.length) return;
      const h = hull(g.map(p=>[p.X,p.Y])), col = fams[f];
      ctx.save(); ctx.globalAlpha = e; ctx.lineJoin='round'; ctx.lineCap='round';
      ctx.beginPath(); h.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));
      if(h.length==1) ctx.lineTo(h[0][0]+.01,h[0][1]);
      if(h.length>2) ctx.closePath();
      ctx.lineWidth = 34; ctx.strokeStyle = hexA(col,.10); ctx.stroke();
      if(h.length>2){ ctx.fillStyle = hexA(col,.10); ctx.fill(); }
      ctx.restore();
    });
    const pulse = (Math.sin(now/400)+1)/2;
    vis.forEach(p => {
      const col = fams[p.m.Familia], isH = hover===p, r = (isH?10:7)*p.s; if(r<=0) return;
      ctx.beginPath(); ctx.arc(p.X,p.Y,r,0,7); ctx.fillStyle=col; ctx.fill();
      ctx.lineWidth=2; ctx.strokeStyle='#fff'; ctx.stroke();
      if(isH){ ctx.beginPath(); ctx.arc(p.X,p.Y,r+5+pulse*3,0,7); ctx.strokeStyle=hexA(col,.6); ctx.stroke(); }
      ctx.globalAlpha = 1;
    });
    const all = opts.labels();
    if(all || hover){
      ctx.font='11.5px Segoe UI'; ctx.textBaseline='middle'; ctx.fillStyle='#1c1917'; ctx.globalAlpha=e;
      vis.forEach(p => { if(!all && hover!==p) return;
        const right = p.X+ctx.measureText(p.m.Material).width+16<W;
        ctx.textAlign = right?'left':'right'; ctx.fillText(p.m.Material,p.X+(right?12:-12),p.Y-12); });
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
    ctx.save(); ctx.globalAlpha=a; ctx.font='12px Segoe UI'; ctx.fillStyle='#78716c'; ctx.lineWidth=1;
    ticks(dx,logX).forEach(t => { const X=px((t.v-dx[0])/(dx[1]-dx[0]));
      ctx.strokeStyle=t.major?'#0000001a':'#0000000a'; ctx.beginPath(); ctx.moveTo(X,y0); ctx.lineTo(X,y1); ctx.stroke();
      if(t.major){ ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText(logX?'10'+sup(t.v):fmt(t.v),X,y0+8); } });
    ticks(dy,logY).forEach(t => { const Y=py((t.v-dy[0])/(dy[1]-dy[0]));
      ctx.strokeStyle=t.major?'#0000001a':'#0000000a'; ctx.beginPath(); ctx.moveTo(x0,Y); ctx.lineTo(x1,Y); ctx.stroke();
      if(t.major){ ctx.textAlign='right'; ctx.textBaseline='middle'; ctx.fillText(logY?'10'+sup(t.v):fmt(t.v),x0-8,Y); } });
    ctx.strokeStyle='#1c1917'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(x0,y1); ctx.lineTo(x0,y0); ctx.lineTo(x1,y0); ctx.stroke();
    ctx.fillStyle='#1c1917'; ctx.font='600 13px Segoe UI'; ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillText(`${PROPS[d.x].l} (${PROPS[d.x].u})`,(x0+x1)/2,H-6);
    ctx.translate(16,(y0+y1)/2); ctx.rotate(-Math.PI/2); ctx.textBaseline='top';
    ctx.fillText(`${PROPS[d.y].l} (${PROPS[d.y].u})`,0,0);
    ctx.restore();
  }

  function onMove(ev){
    if(!cur) return;
    const r = cv.getBoundingClientRect(), x = ev.clientX-r.left, y = ev.clientY-r.top;
    let best=null, bd=18;
    cur.pts.forEach(p => { if(hidden.has(p.m.Familia)) return; const d=Math.hypot(p.X-x,p.Y-y); if(d<bd){bd=d;best=p;} });
    hover = best; cv.style.cursor = best?'pointer':'default';
    if(!best){ tip.classList.remove('show'); return; }
    const m=best.m, d=cur.d;
    tip.innerHTML = `<b>${m.Material}</b><span style="color:${fams[m.Familia]}">${m.Familia.replace('_',' / ')}</span><br>
      <span>${PROPS[d.x].l}:</span> ${fmt(best.vx)} ${PROPS[d.x].u}<br><span>${PROPS[d.y].l}:</span> ${fmt(best.vy)} ${PROPS[d.y].u}`;
    tip.style.left = Math.min(x+16, r.width-tip.offsetWidth-6)+'px'; tip.style.top = Math.max(4,y-70)+'px';
    tip.classList.add('show');
  }

  return {init, show, toggleFamily, resize};
})();
