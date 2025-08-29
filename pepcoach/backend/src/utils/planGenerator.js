// backend/src/utils/planGenerator.js

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
        'Solo peso corporal': ['Flexiones', 'Sentadillas', 'Plancha', 'Zancadas', 'Burpees'],
        'Mancuernas/Bandas': ['Press mancuernas', 'Remo con banda', 'Peso muerto rumano', 'Sentadilla goblet', 'Face-pull'],
        'Gimnasio completo': ['Press banca', 'Remo barra', 'Sentadilla trasera', 'Peso muerto', 'Press militar']
    }[cliente.equipo || 'Solo peso corporal'];

    return plantilla.map(dia => ({
        dia,
        ejercicios: ejerciciosCatalogo.slice(0,5).map(e => ({
            ejercicio: e,
            series: (nivel==='Avanzado')?'4x6-10':'3x8-12'
        }))
    }));
}

function buildPlan(cliente, dias = 7, enfoque = 'equilibrado') {
    const kcal = estimarKcal(cliente);
    const macros = { prot: Math.round((kcal*0.3)/4), carb: Math.round((kcal*0.4)/4), fat: Math.round((kcal*0.3)/9) };
    const comidas = ['Desayuno','Media mañana','Comida','Merienda','Cena'];

    const recetas = [
        { nombre: 'Avena con frutos rojos', detalle: 'Avena, leche, frutos rojos, nueces' },
        { nombre: 'Pollo con quinoa', detalle: 'Pechuga, quinoa, verduras' },
        { nombre: 'Salmón y ensalada', detalle: 'Salmón, mezcla hojas, aceite oliva' },
        { nombre: 'Tofu salteado', detalle: 'Tofu, verduras, arroz integral' }
    ];

    const nutricion = Array.from({length: dias}, (_,i)=>({
        dia: i+1,
        menu: comidas.map((m,idx)=>({
            momento:m,
            receta: recetas[(i+idx)%recetas.length].nombre,
            detalle: recetas[(i+idx)%recetas.length].detalle,
            kcal: Math.round(kcal / comidas.length)
        }))
    }));

    const entreno = planEntreno(cliente);
    const metrics = {
        imc: cliente.peso && cliente.estatura ? (cliente.peso/((cliente.estatura/100)**2)).toFixed(1) : null
    };
    return { generadoEn: new Date().toISOString(), dias, enfoque, kcal, macros, nutricion, entreno, metrics };
}

module.exports = { buildPlan, calcBodyFatUSNavy };
