const { ask } = require('../services/gemini');

function estimarKcal(cliente) {
  const peso = cliente.peso || 70;
  const est = cliente.estatura || 170;
  const edad = cliente.edad || 30;
  const sexo = cliente.sexo || 'Masculino';
  let bmr = 10 * peso + 6.25 * est - 5 * edad + (sexo === 'Femenino' ? -161 : 5);
  const factor = (cliente.actividad === 'Alta') ? 1.725 : (cliente.actividad === 'Moderada') ? 1.55 : 1.375;
  let tdee = Math.round(bmr * factor);
  if (cliente.objetivo === 'Pérdida de grasa') tdee = Math.round(tdee * 0.85);
  if (cliente.objetivo === 'Ganancia muscular') tdee = Math.round(tdee * 1.1);
  return tdee;
}

function calcBodyFatUSNavy({ sexo, cintura, cuello, altura, cadera = 0 }) {
  // Todas las medidas en cm
  if (sexo === 'Masculino') {
    const bf = 86.010 * Math.log10(cintura - cuello) - 70.041 * Math.log10(altura) + 36.76;
    return Number(bf.toFixed(1));
  } else {
    const bf = 163.205 * Math.log10(cintura + cadera - cuello) - 97.684 * Math.log10(altura) - 78.387;
    return Number(bf.toFixed(1));
  }
}

function planEntreno(cliente) {
  const dias = cliente.dias || 3;
  const nivel = cliente.nivel || 'Intermedio';
  const plantilla = {
    2: ['Full Body A', 'Full Body B'],
    3: ['Empuje', 'Tirón', 'Pierna'],
    4: ['Parte superior', 'Parte inferior', 'Empuje', 'Tirón']
  }[dias] || ['Full Body'];

  const ejerciciosCatalogo = {
    'Solo peso corporal': [
        { nombre: 'Flexiones', imageUrl: 'https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?q=80&w=2070&auto=format&fit=crop' },
        { nombre: 'Sentadillas', imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop' },
        { nombre: 'Plancha', imageUrl: 'https://images.unsplash.com/photo-1594737625787-a8a121c44856?q=80&w=2070&auto=format&fit=crop' },
        { nombre: 'Zancadas', imageUrl: 'https://images.unsplash.com/photo-1533560699259-94741b272c3b?q=80&w=2070&auto=format&fit=crop' },
        { nombre: 'Burpees', imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5792c4b64?q=80&w=2070&auto=format&fit=crop' },
    ],
    'Mancuernas/Bandas': [
        { nombre: 'Press mancuernas', imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2070&auto=format&fit=crop' },
        { nombre: 'Remo con banda', imageUrl: 'https://images.unsplash.com/photo-1620188526517-7603375c3e72?q=80&w=2070&auto=format&fit=crop' },
        { nombre: 'Peso muerto rumano', imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b62d0a520?q=80&w=2070&auto=format&fit=crop' },
        { nombre: 'Sentadilla goblet', imageUrl: 'https://images.unsplash.com/photo-1620188526517-7603375c3e72?q=80&w=2070&auto=format&fit=crop' },
        { nombre: 'Face-pull', imageUrl: 'https://images.unsplash.com/photo-1596357395217-e7458c36c46a?q=80&w=2070&auto=format&fit=crop' },
    ],
    'Gimnasio completo': [
        { nombre: 'Press banca', imageUrl: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=1974&auto=format&fit=crop' },
        { nombre: 'Remo barra', imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop' },
        { nombre: 'Sentadilla trasera', imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop' },
        { nombre: 'Peso muerto', imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b62d0a520?q=80&w=2070&auto=format&fit=crop' },
        { nombre: 'Press militar', imageUrl: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?q=80&w=1965&auto=format&fit=crop' },
    ]
  }[cliente.equipo || 'Solo peso corporal'];

  return plantilla.map(dia => ({
    dia,
    ejercicios: ejerciciosCatalogo.slice(0,5).map(e => ({
      ejercicio: e.nombre,
      imageUrl: e.imageUrl,
      series: (nivel==='Avanzado')?'4x6-10':'3x8-12'
    }))
  }));
}

const recetas = [
    {
        nombre: 'Avena con Frutos Rojos',
        ingredientes: ['Avena en hojuelas', 'Leche o bebida vegetal', 'Arándanos', 'Fresas', 'Nueces'],
        imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=2070&auto=format&fit=crop'
    },
    {
        nombre: 'Pollo a la Plancha con Quinoa y Brócoli',
        ingredientes: ['Pechuga de pollo', 'Quinoa', 'Brócoli', 'Aceite de oliva', 'Limón'],
        imageUrl: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=1964&auto=format&fit=crop'
    },
    {
        nombre: 'Salmón al Horno con Espárragos',
        ingredientes: ['Filete de salmón', 'Espárragos frescos', 'Ajo', 'Aceite de oliva', 'Pimienta negra'],
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop'
    },
    {
        nombre: 'Tofu Salteado con Verduras y Arroz Integral',
        ingredientes: ['Tofu firme', 'Pimiento rojo', 'Cebolla', 'Zanahoria', 'Salsa de soja', 'Arroz integral'],
        imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1964&auto=format&fit=crop'
    },
    {
        nombre: 'Ensalada Griega con Garbanzos',
        ingredientes: ['Pepino', 'Tomate', 'Cebolla morada', 'Queso feta', 'Aceitunas Kalamata', 'Garbanzos cocidos'],
        imageUrl: 'https://images.unsplash.com/photo-1569246294372-ed319c674f14?q=80&w=1964&auto=format&fit=crop'
    },
    {
        nombre: 'Sopa de Lentejas y Zanahoria',
        ingredientes: ['Lentejas pardinas', 'Zanahoria', 'Apio', 'Cebolla', 'Caldo de verduras'],
        imageUrl: 'https://images.unsplash.com/photo-1609015746380-571227e2bc72?q=80&w=1964&auto=format&fit=crop'
    },
    {
        nombre: 'Revuelto de Huevo con Espinacas y Aguacate',
        ingredientes: ['Huevos', 'Espinacas frescas', 'Aguacate', 'Tomate cherry', 'Tostada integral'],
        imageUrl: 'https://images.unsplash.com/photo-1520218508822-998633d997e6?q=80&w=1964&auto=format&fit=crop'
    },
    {
        nombre: 'Yogur Griego con Miel y Almendras',
        ingredientes: ['Yogur griego natural', 'Miel pura', 'Almendras laminadas', 'Semillas de chía'],
        imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1964&auto=format&fit=crop'
    }
];

async function buildPlan(cliente, dias = 7, enfoque = 'equilibrado') {
  const kcal = estimarKcal(cliente);
  const macros = { prot: Math.round((kcal*0.3)/4), carb: Math.round((kcal*0.4)/4), fat: Math.round((kcal*0.3)/9) };
  const comidas = ['Desayuno','Media mañana','Comida','Merienda','Cena'];

  // Generar el menú base
  const menuBase = Array.from({length: dias}, (_,i)=>({
    dia: i+1,
    menu: comidas.map((m,idx)=> {
      const recetaSeleccionada = recetas[(i + idx) % recetas.length];
      return {
        momento: m,
        receta: recetaSeleccionada.nombre,
        ingredientes: recetaSeleccionada.ingredientes,
        imageUrl: recetaSeleccionada.imageUrl,
        kcal: Math.round(kcal / comidas.length)
      };
    })
  }));

  // Enriquecer con consejos de la IA
  for (const diaPlan of menuBase) {
    for (const comida of diaPlan.menu) {
      try {
        const prompt = `Dame un consejo de chef muy corto (1-2 frases) para preparar o disfrutar de este plato: "${comida.receta}".`;
        const consejo = await ask(prompt);
        comida.consejoDelChef = consejo.replace(/\\n/g, ' ').trim();
      } catch (err) {
        console.error(`Error al obtener consejo para ${comida.receta}:`, err);
        comida.consejoDelChef = 'Disfruta de tu comida, ¡está hecha con ingredientes frescos!'; // Fallback
      }
    }
  }

  const entreno = planEntreno(cliente);
  const metrics = { imc: cliente.peso && cliente.estatura ? (cliente.peso/((cliente.estatura/100)**2)).toFixed(1) : null };

  return { generadoEn: new Date().toISOString(), dias, enfoque, kcal, macros, nutricion: menuBase, entreno, metrics };
}

module.exports = { buildPlan, calcBodyFatUSNavy };
