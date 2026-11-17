const MATERIALES = [
  {
    "Material": "Aluminio 6061",
    "Familia": "Metal",
    "Densidad": 2700,
    "Conductividad_Termica": 167.0,
    "Resistividad_Electrica": 3.99e-8,
    "Expansion_Termica": 23.6,
    "Capacidad_Calorifica": 896,
    "Modulo_de_Young_GPa": 69.0,
    "Limite_Elastico_MPa": 276.0
  },
  {
    "Material": "Acero Inoxidable 316L",
    "Familia": "Metal",
    "Densidad": 8000,
    "Conductividad_Termica": 16.3,
    "Resistividad_Electrica": 7.4e-7,
    "Expansion_Termica": 16.0,
    "Capacidad_Calorifica": 500,
    "Modulo_de_Young_GPa": 193.0,
    "Limite_Elastico_MPa": 290.0
  },
  {
    "Material": "Aleación de Titanio (Ti-6Al-4V)",
    "Familia": "Metal",
    "Densidad": 4430,
    "Conductividad_Termica": 6.7,
    "Resistividad_Electrica": 1.7e-6,
    "Expansion_Termica": 8.6,
    "Capacidad_Calorifica": 526,
    "Modulo_de_Young_GPa": 114.0,
    "Limite_Elastico_MPa": 880.0
  },
  {
    "Material": "Cobre",
    "Familia": "Metal",
    "Densidad": 8960,
    "Conductividad_Termica": 400.0,
    "Resistividad_Electrica": 1.68e-8,
    "Expansion_Termica": 16.5,
    "Capacidad_Calorifica": 385,
    "Modulo_de_Young_GPa": 110.0,
    "Limite_Elastico_MPa": 210.0
  },
  {
    "Material": "Oro",
    "Familia": "Metal",
    "Densidad": 19300,
    "Conductividad_Termica": 314.0,
    "Resistividad_Electrica": 2.44e-8,
    "Expansion_Termica": 14.2,
    "Capacidad_Calorifica": 129,
    "Modulo_de_Young_GPa": 79.0,
    "Limite_Elastico_MPa": 120.0
  },
  {
    "Material": "Aluminosilicato (Gorilla Glass)",
    "Familia": "Cerámica_Vidrio",
    "Densidad": 2420,
    "Conductividad_Termica": 1.3,
    "Resistividad_Electrica": 1.0e12,
    "Expansion_Termica": 8.1,
    "Capacidad_Calorifica": 780,
    "Modulo_de_Young_GPa": 69.0,
    "Limite_Elastico_MPa": 700.0
  },
  {
    "Material": "Cristal de Zafiro",
    "Familia": "Cerámica_Vidrio",
    "Densidad": 3980,
    "Conductividad_Termica": 27.2,
    "Resistividad_Electrica": 1.0e14,
    "Expansion_Termica": 5.8,
    "Capacidad_Calorifica": 760,
    "Modulo_de_Young_GPa": 345.0,
    "Limite_Elastico_MPa": 400.0
  },
  {
    "Material": "Alúmina (Al2O3)",
    "Familia": "Cerámica_Vidrio",
    "Densidad": 3900,
    "Conductividad_Termica": 30.0,
    "Resistividad_Electrica": 1.0e12,
    "Expansion_Termica": 8.1,
    "Capacidad_Calorifica": 880,
    "Modulo_de_Young_GPa": 300.0,
    "Limite_Elastico_MPa": 300.0
  },
  {
    "Material": "Nitruro de Aluminio (AlN)",
    "Familia": "Cerámica_Vidrio",
    "Densidad": 3260,
    "Conductividad_Termica": 180.0,
    "Resistividad_Electrica": 1.0e12,
    "Expansion_Termica": 4.5,
    "Capacidad_Calorifica": 740,
    "Modulo_de_Young_GPa": 330.0,
    "Limite_Elastico_MPa": 320.0
  },
  {
    "Material": "Policarbonato (PC)",
    "Familia": "Polímero",
    "Densidad": 1200,
    "Conductividad_Termica": 0.2,
    "Resistividad_Electrica": 1.0e14,
    "Expansion_Termica": 65.0,
    "Capacidad_Calorifica": 1200,
    "Modulo_de_Young_GPa": 2.4,
    "Limite_Elastico_MPa": 62.0
  },
  {
    "Material": "FR-4 (Placa PCB)",
    "Familia": "Compuesto",
    "Densidad": 1850,
    "Conductividad_Termica": 0.3,
    "Resistividad_Electrica": 1.0e10,
    "Expansion_Termica": 15.0,
    "Capacidad_Calorifica": 1000,
    "Modulo_de_Young_GPa": 24.0,
    "Limite_Elastico_MPa": 300.0
  },
  {
    "Material": "Poliimida (Kapton)",
    "Familia": "Polímero",
    "Densidad": 1420,
    "Conductividad_Termica": 0.12,
    "Resistividad_Electrica": 1.0e15,
    "Expansion_Termica": 20.0,
    "Capacidad_Calorifica": 1090,
    "Modulo_de_Young_GPa": 2.5,
    "Limite_Elastico_MPa": 69.0
  },
  {
    "Material": "Fluoroelastómero (Viton)",
    "Familia": "Elastómero",
    "Densidad": 1800,
    "Conductividad_Termica": 0.2,
    "Resistividad_Electrica": 1.0e12,
    "Expansion_Termica": 160.0,
    "Capacidad_Calorifica": 1200,
    "Modulo_de_Young_GPa": 0.005,
    "Limite_Elastico_MPa": 15.0
  },
  {
    "Material": "Silicona (PDMS)",
    "Familia": "Elastómero",
    "Densidad": 970,
    "Conductividad_Termica": 0.15,
    "Resistividad_Electrica": 1.0e13,
    "Expansion_Termica": 300.0,
    "Capacidad_Calorifica": 1460,
    "Modulo_de_Young_GPa": 0.002,
    "Limite_Elastico_MPa": 5.0
  },
  {
    "Material": "Resina Epóxica Térmica",
    "Familia": "Compuesto",
    "Densidad": 1600,
    "Conductividad_Termica": 2.0,
    "Resistividad_Electrica": 1.0e11,
    "Expansion_Termica": 40.0,
    "Capacidad_Calorifica": 1000,
    "Modulo_de_Young_GPa": 3.5,
    "Limite_Elastico_MPa": 80.0
  }
];
