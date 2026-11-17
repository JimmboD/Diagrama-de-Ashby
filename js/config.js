/* Propiedades, diagramas predefinidos y sugeridos */
const PROPS = {
  Densidad:               {l:'Densidad',                        u:'kg/m³',  log:true},
  Modulo_de_Young_GPa:    {l:'Módulo de Young',                 u:'GPa',    log:true},
  Limite_Elastico_MPa:    {l:'Límite elástico',                 u:'MPa',    log:true},
  Conductividad_Termica:  {l:'Conductividad térmica',           u:'W/m·K',  log:true},
  Resistividad_Electrica: {l:'Resistividad eléctrica',          u:'Ω·m',    log:true},
  Expansion_Termica:      {l:'Coef. de expansión térmica',      u:'µm/m·K', log:true},
  Capacidad_Calorifica:   {l:'Capacidad calorífica específica', u:'J/kg·K', log:true},
  // derivadas
  E_rho: {l:'Rigidez específica (E/ρ)',      u:'MPa·m³/kg', log:true, f:m=>m.Modulo_de_Young_GPa*1e3/m.Densidad},
  S_rho: {l:'Resistencia específica (σy/ρ)', u:'kPa·m³/kg', log:true, f:m=>m.Limite_Elastico_MPa*1e3/m.Densidad},
  Alpha: {l:'Difusividad térmica (k/ρcp)',   u:'mm²/s',     log:true, f:m=>m.Conductividad_Termica/(m.Densidad*m.Capacidad_Calorifica)*1e6},
};

// "Y vs X": x = eje horizontal, y = eje vertical
const PRESETS = [
  {x:'Densidad',               y:'Modulo_de_Young_GPa',   name:'Módulo de Young vs Densidad'},
  {x:'Densidad',               y:'Limite_Elastico_MPa',   name:'Límite elástico vs Densidad'},
  {x:'Resistividad_Electrica', y:'Conductividad_Termica', name:'Conductividad térmica vs Resistividad eléctrica'},
  {x:'Densidad',               y:'Expansion_Termica',     name:'Expansión térmica vs Densidad'},
  {x:'Conductividad_Termica',  y:'Capacidad_Calorifica',  name:'Capacidad calorífica vs Conductividad térmica'},
];
const SUGGESTED = [
  {x:'Modulo_de_Young_GPa',   y:'Limite_Elastico_MPa',   name:'Límite elástico vs Módulo de Young'},
  {x:'E_rho',                 y:'S_rho',                 name:'Resistencia específica vs Rigidez específica'},
  {x:'Densidad',              y:'Conductividad_Termica', name:'Conductividad térmica vs Densidad'},
  {x:'Conductividad_Termica', y:'Expansion_Termica',     name:'Expansión térmica vs Conductividad térmica'},
  {x:'Densidad',              y:'Alpha',                 name:'Difusividad térmica vs Densidad'},
  {x:'Limite_Elastico_MPa',   y:'Resistividad_Electrica',name:'Resistividad eléctrica vs Límite elástico'},
];
const FAM_COLORS = ['#2563eb','#dc2626','#7c3aed','#d97706','#059669','#db2777','#0891b2','#ea580c'];
