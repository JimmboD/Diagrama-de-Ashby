/* Interfaz: barra lateral, gráficas abiertas, nueva gráfica */
(() => {
  const $ = id => document.getElementById(id);
  const NEW = 'new';
  let diagrams = [], activeId = null, uid = 0;

  // familias y colores a partir de TODOS los materiales
  const fams = {};
  MATERIALES.forEach(m => { if(!(m.Familia in fams)) fams[m.Familia] = FAM_COLORS[Object.keys(fams).length % FAM_COLORS.length]; });

  Ashby.init($('chart'), $('tip'), MATERIALES, fams,
    {labels:()=>$('optLabels').checked, hulls:()=>$('optHull').checked},
    (n,t,s) => { $('count').textContent = `${n} de ${t} materiales`; updateStats(n,t,s); },
    showDetail);

  /* ---------- estadísticas animadas ---------- */
  const tweens = new Map();
  function countTo(el, to, dec=0){
    const from = parseFloat(el.dataset.v ?? 0) || 0; el.dataset.v = to;
    cancelAnimationFrame(tweens.get(el)); const t0 = performance.now();
    const step = now => { const k = Math.min(1,(now-t0)/600), e = 1-Math.pow(1-k,3);
      el.textContent = (from+(to-from)*e).toFixed(dec); if(k<1) tweens.set(el, requestAnimationFrame(step)); };
    step(t0);
  }
  const nf = v => v>=1e4||(v<1e-2&&v>0) ? v.toExponential(1) : +v.toPrecision(3)+'';
  function updateStats(n,t,s){
    countTo($('stN'), n); $('stT').textContent = `de ${t}`; countTo($('stF'), s.fams);
    const d = s.d;
    $('stXl').textContent = PROPS[d.x].l; $('stYl').textContent = PROPS[d.y].l;
    $('stX').textContent = `${nf(s.xr[0])} – ${nf(s.xr[1])}`; $('stXu').textContent = PROPS[d.x].u;
    $('stY').textContent = `${nf(s.yr[0])} – ${nf(s.yr[1])}`; $('stYu').textContent = PROPS[d.y].u;
  }

  /* ---------- ficha del material fijado ---------- */
  const BASE = ['Densidad','Modulo_de_Young_GPa','Limite_Elastico_MPa','Conductividad_Termica','Resistividad_Electrica','Expansion_Termica','Capacidad_Calorifica'];
  function showDetail(sel){
    const box = $('detail');
    if(!sel){ box.hidden = true; return; }
    const {m,color} = sel, d = diagrams.find(x=>x.id===activeId);
    const fmtv = v => v>=1e4||v<1e-2 ? v.toExponential(2) : +v.toPrecision(3)+'';
    box.style.setProperty('--c', color);
    box.innerHTML = `<button class="close" aria-label="Cerrar">&times;</button><h3>${m.Material}</h3><em>${m.Familia.replace('_',' / ')}</em>
      <ul>${BASE.map(k=>`<li class="${d&&(k===d.x||k===d.y)?'cur':''}"><span>${PROPS[k].l}</span><strong>${fmtv(m[k])} <small>${PROPS[k].u}</small></strong></li>`).join('')}</ul>`;
    box.hidden = false;
    box.querySelector('.close').onclick = () => { Ashby.unpin(); box.hidden = true; };
  }

  /* ---------- interactividad: luz del cursor y parallax ---------- */
  document.addEventListener('mousemove', e => {
    document.querySelectorAll('.glow').forEach(el => { const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX-r.left)+'px'); el.style.setProperty('--my', (e.clientY-r.top)+'px'); });
    const x = e.clientX/innerWidth-.5, y = e.clientY/innerHeight-.5;
    document.querySelectorAll('.orb').forEach((o,i) => o.style.transform = `translate(${x*(i+1)*-40}px,${y*(i+1)*-40}px)`);
  });

  /* ---------- estado ---------- */
  function open(spec){
    const d = {...spec, id:++uid};
    diagrams.push(d); activate(d.id);
  }
  function openUnique(spec){
    const ex = diagrams.find(d => d.x===spec.x && d.y===spec.y && d.logX===spec.logX && d.logY===spec.logY);
    ex ? activate(ex.id) : open(spec);
  }
  function close(id){
    const i = diagrams.findIndex(d=>d.id===id); if(i<0) return;
    diagrams.splice(i,1);
    if(activeId===id) activeId = diagrams.length ? diagrams[Math.min(i,diagrams.length-1)].id : NEW;
    activate(activeId);
  }
  function activate(id){
    activeId = id; renderSide();
    const isNew = id===NEW || !diagrams.length;
    $('viewChart').hidden = isNew; $('viewNew').hidden = !isNew;
    document.body.classList.toggle('is-new', isNew);
    if(isNew){
      activeId = NEW; renderSide();
      $('title').textContent = 'Nueva gráfica';
      $('subtitle').textContent = 'Selecciona las variables físicas de cada eje.';
    } else {
      const d = diagrams.find(d=>d.id===id);
      $('title').textContent = d.name;
      $('subtitle').textContent = `Eje X: ${PROPS[d.x].l} (${PROPS[d.x].u}) · Eje Y: ${PROPS[d.y].l} (${PROPS[d.y].u})`;
      Ashby.show(d);
    }
    ['title','subtitle'].forEach(k => { const e=$(k); e.style.animation='none'; e.offsetHeight; e.style.animation=''; });
  }

  /* ---------- barra lateral ---------- */
  function renderSide(){
    const list = $('list'); list.innerHTML = '';
    diagrams.forEach(d => {
      const li = document.createElement('li'); li.className = 'item'+(d.id===activeId?' on':'');
      const b = document.createElement('button'); b.className='name'; b.textContent=d.name; b.title=d.name;
      b.onclick = () => activate(d.id);
      const x = document.createElement('button'); x.className='x'; x.innerHTML='&times;'; x.title='Cerrar gráfica'; x.setAttribute('aria-label','Cerrar '+d.name);
      x.onclick = e => { e.stopPropagation(); li.classList.add('out'); setTimeout(()=>close(d.id),180); };
      li.append(b,x); list.appendChild(li);
    });
    const n = document.createElement('li'); n.className='item add'+(activeId===NEW?' on':'');
    n.innerHTML = '<button class="name">+ Nueva gráfica</button>';
    n.firstChild.onclick = () => activate(NEW); list.appendChild(n);

  }

  /* ---------- nueva gráfica ---------- */
  const DIAGRAMAS = PRESETS.concat(SUGGESTED);
  $('selSug').innerHTML = '<option value="">Elegir un diagrama sugerido…</option>' + DIAGRAMAS.map((s,i)=>`<option value="${i}">${s.name}</option>`).join('');
  $('selSug').onchange = e => { const s = DIAGRAMAS[e.target.value]; if(!s) return; $('selX').value=s.x; $('selY').value=s.y; $('logX').checked=PROPS[s.x].log; $('logY').checked=PROPS[s.y].log; };
  const opts = Object.keys(PROPS).map(k=>`<option value="${k}">${PROPS[k].l} (${PROPS[k].u})</option>`).join('');
  $('selX').innerHTML = opts; $('selY').innerHTML = opts;
  $('selX').value = 'Densidad'; $('selY').value = 'Modulo_de_Young_GPa';
  $('btnGen').onclick = () => {
    const x=$('selX').value, y=$('selY').value;
    if(x===y){ $('formMsg').textContent = 'Elige dos variables distintas.'; return; }
    $('formMsg').textContent = '';
    open({x, y, logX:$('logX').checked, logY:$('logY').checked, name:`${PROPS[y].l} vs ${PROPS[x].l}`});
  };
  $('btnSwap').onclick = () => { const a=$('selX').value; $('selX').value=$('selY').value; $('selY').value=a; };

  /* ---------- leyenda y controles ---------- */
  Object.entries(fams).forEach(([f,col]) => {
    const b = document.createElement('button'); b.innerHTML = `<i style="--c:${col};background:${col}"></i><span>${f.replace('_',' / ')}</span>`;
    b.style.setProperty('--c', col);
    b.onclick = () => { Ashby.toggleFamily(f); b.classList.toggle('off'); };
    $('legend').appendChild(b);
  });
  $('toggleSide').onclick = () => document.body.classList.toggle('side-closed');

  /* ---------- inicio: un solo diagrama: Módulo de Young vs Densidad ---------- */
  open({...PRESETS[0], logX:PROPS[PRESETS[0].x].log, logY:PROPS[PRESETS[0].y].log});
})();
