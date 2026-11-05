(() => {
    const DB_NAME = "planeaPerfilDB";
    const STORE = "imagenes";
    const fotoInput = document.getElementById("input-foto");
    const bannerInput = document.getElementById("input-banner");
    const foto = document.getElementById("foto-perfil");
    const banner = document.getElementById("banner");
    const mensaje = document.getElementById("mensaje");

    function abrirDB() {
        return new Promise((resolve, reject) => {
            if (!("indexedDB" in window)) return reject(new Error("Este navegador no admite almacenamiento local de imágenes."));
            const solicitud = indexedDB.open(DB_NAME, 1);
            solicitud.onupgradeneeded = () => {
                const db = solicitud.result;
                if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
            };
            solicitud.onsuccess = () => resolve(solicitud.result);
            solicitud.onerror = () => reject(solicitud.error);
        });
    }
    async function guardarImagen(clave, archivo) {
        const db = await abrirDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, "readwrite");
            tx.objectStore(STORE).put(archivo, clave);
            tx.oncomplete = () => { db.close(); resolve(); };
            tx.onerror = () => { db.close(); reject(tx.error); };
        });
    }
    async function leerImagen(clave) {
        const db = await abrirDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, "readonly");
            const req = tx.objectStore(STORE).get(clave);
            req.onsuccess = () => { const valor = req.result || null; db.close(); resolve(valor); };
            req.onerror = () => { db.close(); reject(req.error); };
        });
    }
    function aplicarImagen(clave, archivo) {
        const url = URL.createObjectURL(archivo);
        if (clave === "foto") foto.src = url;
        else banner.style.backgroundImage = `linear-gradient(135deg, rgba(25,25,25,.25), rgba(190,190,190,.15)), url("${url}")`;
    }
    async function manejarArchivo(input, clave) {
        const archivo = input.files && input.files[0];
        if (!archivo) return;
        if (!archivo.type.startsWith("image/")) {
            mensaje.textContent = "Selecciona un archivo de imagen válido.";
            input.value = "";
            return;
        }
        if (archivo.size > 8 * 1024 * 1024) {
            mensaje.textContent = "La imagen debe pesar menos de 8 MB. Puedes reducir su tamaño e intentarlo de nuevo.";
            input.value = "";
            return;
        }
        try {
            await guardarImagen(clave, archivo);
            aplicarImagen(clave, archivo);
            mensaje.textContent = clave === "foto" ? "Foto de perfil guardada en este dispositivo." : "Banner guardado en este dispositivo.";
        } catch (error) {
            mensaje.textContent = "No se pudo guardar la imagen. Prueba en un navegador actualizado y verifica el espacio disponible.";
        }
    }
    fotoInput.addEventListener("change", () => manejarArchivo(fotoInput, "foto"));
    bannerInput.addEventListener("change", () => manejarArchivo(bannerInput, "banner"));

    document.getElementById("guardar").addEventListener("click", () => {
        const nombre = document.getElementById("nombre").value.trim();
        const correoInput = document.getElementById("correo");
        const correo = correoInput.value.trim();
        if (!nombre) { mensaje.textContent = "Por favor, escribe tu nombre."; return; }
        if (correo && !correoInput.checkValidity()) { mensaje.textContent = "Revisa el formato del correo institucional."; return; }
        localStorage.setItem("perfilNombre", nombre);
        localStorage.setItem("perfilCorreo", correo);
        mensaje.textContent = "Datos del perfil guardados correctamente.";
    });

    document.getElementById("nombre").value = localStorage.getItem("perfilNombre") || "Nombre del estudiante";
    document.getElementById("correo").value = localStorage.getItem("perfilCorreo") || "";
    (async () => {
        try {
            const imagen = await leerImagen("foto");
            if (imagen) foto.src = URL.createObjectURL(imagen);
            const imagenBanner = await leerImagen("banner");
            if (imagenBanner) banner.style.backgroundImage = `linear-gradient(135deg, rgba(25,25,25,.25), rgba(190,190,190,.15)), url("${URL.createObjectURL(imagenBanner)}")`;
        } catch { mensaje.textContent = "El almacenamiento de imágenes no está disponible en este navegador."; }
    })();
})();
