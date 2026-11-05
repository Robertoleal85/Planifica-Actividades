(() => {
    const DURACION = 10 * 1000; /* ZUmayaa recuerda que es 30 * 60 * 1000*/
    const STORAGE_KEY = "planeaTareasEstadoV1";
    const tareas = [
        { id: 1, icon: "📚", categoria: "APRENDIZAJE", titulo: "Repasa un tema", descripcion: "Repasa tus apuntes y escribe tres ideas importantes de lo aprendido en clase." },
        { id: 2, icon: "📝", categoria: "ORGANIZACIÓN", titulo: "Organiza tus pendientes", descripcion: "Anota tus actividades y elige cuál necesitas terminar primero." },
        { id: 3, icon: "🌱", categoria: "BIENESTAR", titulo: "Tómate un descanso", descripcion: "Haz una pausa, estira el cuerpo y despeja tu mente antes de continuar estudiando." },
        { id: 4, icon: "🎯", categoria: "OBJETIVOS", titulo: "Define una meta", descripcion: "Elige un objetivo concreto para hoy y escribe cuál será tu primer paso." },
        { id: 5, icon: "💧", categoria: "BIENESTAR", titulo: "Cuida tu hidratación", descripcion: "Tómate un momento para beber agua y descansar la vista." },
        { id: 6, icon: "📖", categoria: "APRENDIZAJE", titulo: "Lee algo nuevo", descripcion: "Lee unas páginas de un libro o un texto relacionado con una materia." },
        { id: 7, icon: "🧹", categoria: "ORGANIZACIÓN", titulo: "Ordena tu espacio", descripcion: "Prepara tu escritorio y deja a mano los materiales que necesitas." },
        { id: 8, icon: "🧠", categoria: "APRENDIZAJE", titulo: "Practica lo aprendido", descripcion: "Resuelve algunos ejercicios o explica el tema con tus propias palabras." },
        { id: 9, icon: "🌙", categoria: "PLANIFICACIÓN", titulo: "Prepara el día siguiente", descripcion: "Revisa tu horario y prepara tus materiales para mañana." }
    ];

    const cards = [...document.querySelectorAll(".tarea-card")];
    if (!cards.length) return;
    const fechaHoy = new Date().toLocaleDateString("en-CA");

    function cargarEstado() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
        catch { return {}; }
    }
    let estado = cargarEstado();
    if (estado.fecha !== fechaHoy || !Array.isArray(estado.slots) || estado.slots.length !== cards.length) {
        estado = { fecha: fechaHoy, slots: mezclar(tareas).slice(0, cards.length).map(t => ({ id: t.id, hasta: 0 })) };
        guardarEstado();
    }
    function guardarEstado() { localStorage.setItem(STORAGE_KEY, JSON.stringify(estado)); }
    function mezclar(lista) {
        const copia = [...lista];
        for (let i = copia.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }
        return copia;
    }
    function tareaPorId(id) { return tareas.find(t => t.id === id) || tareas[0]; }
    function elegirNueva(excluir) { return mezclar(tareas.filter(t => !excluir.includes(t.id)))[0] || mezclar(tareas)[0]; }
    function renderCard(card, indice) {
        const slot = estado.slots[indice];
        const tarea = tareaPorId(slot.id);
        card.dataset.tareaId = tarea.id;
        card.querySelector(".tarea-icon").textContent = tarea.icon;
        card.querySelector(".tarea-categoria").textContent = tarea.categoria;
        card.querySelector("h3").textContent = tarea.titulo;
        card.querySelector("p:not(.tarea-status)").textContent = tarea.descripcion;
        const boton = card.querySelector(".tarea-button");
        const status = card.querySelector(".tarea-status");
        boton.onclick = () => completar(indice);
        actualizarCard(card, indice);
    }
    function actualizarCard(card, indice) {
        const slot = estado.slots[indice];
        const boton = card.querySelector(".tarea-button");
        const status = card.querySelector(".tarea-status");
        const restante = slot.hasta - Date.now();
        if (restante > 0) {
            boton.disabled = true;
            boton.textContent = "Actividad realizada";
            status.textContent = `Nueva tarea en ${formatear(restante)}`;
            status.setAttribute("aria-live", "polite");
        } else {
            if (slot.hasta) {
                const ocupadas = estado.slots.map(s => s.id);
                const nueva = elegirNueva(ocupadas);
                slot.id = nueva.id;
                slot.hasta = 0;
                guardarEstado();
                renderCard(card, indice);
                return;
            }
            boton.disabled = false;
            boton.textContent = "Marcar como realizada";
            status.textContent = "Pendiente de completar";
        }
    }
    function completar(indice) {
        estado.slots[indice].hasta = Date.now() + DURACION;
        guardarEstado();
        actualizarCard(cards[indice], indice);
    }
    function formatear(ms) {
        const segundos = Math.max(0, Math.ceil(ms / 1000));
        return `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;
    }
    cards.forEach(renderCard);
    window.setInterval(() => cards.forEach(actualizarCard), 1000);
})();
