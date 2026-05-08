(() => {
	const canvas = document.getElementById("gameCanvas");
	const ctx = canvas.getContext("2d");
	const BASE_WIDTH = 960;
	const BASE_HEIGHT = 540;

	function setupCanvas() {
		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		const displayWidth = Math.round(rect.width || BASE_WIDTH);
		const displayHeight = Math.round(rect.height || BASE_HEIGHT);
		canvas.width = Math.round(displayWidth * dpr);
		canvas.height = Math.round(displayHeight * dpr);
		ctx.setTransform(canvas.width / BASE_WIDTH, 0, 0, canvas.height / BASE_HEIGHT, 0, 0);
		ctx.imageSmoothingEnabled = false;
	}

	setupCanvas();
	window.addEventListener("resize", setupCanvas);

	const menuScreen = document.getElementById("menuScreen");
	const introScreen = document.getElementById("introScreen");
	const endScreen = document.getElementById("endScreen");
	const hud = document.getElementById("hud");
	const promptEl = document.getElementById("interactionPrompt");
	const casePanel = document.getElementById("casePanel");
	const caseMeta = document.getElementById("caseMeta");
	const caseText = document.getElementById("caseText");
	const opt1 = document.getElementById("opt1");
	const opt2 = document.getElementById("opt2");

	const metroValue = document.getElementById("metroValue");
	const metroBar = document.getElementById("metroBar");
	const angerValue = document.getElementById("angerValue");
	const angerBar = document.getElementById("angerBar");
	const coopValue = document.getElementById("coopValue");
	const timerValue = document.getElementById("timerValue");
	const lineStateEl = document.getElementById("lineState");
	const stressValue = document.getElementById("stressValue");
	const healthValue = document.getElementById("healthValue");
	const priceValue = document.getElementById("priceValue");

	const introText = document.getElementById("introText");
	const endTitle = document.getElementById("endTitle");
	const endText = document.getElementById("endText");

	const introLines = [
		"Alejo entró al Metro buscando una salida.",
		"Pero el sistema lo atrapó dentro de sus decisiones.",
		"Ahora cada caso exige una respuesta rápida y cruel.",
		"No hay opción correcta: solo costo distinto.",
		"Si el sistema cae, la ciudad lo arrastra con él."
	];

	const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
	const rand = (min, max) => min + Math.random() * (max - min);
	const choice = (array) => array[Math.floor(Math.random() * array.length)];
	const GAME_DURATION_SEC = 300;
	const SHIFT_START_MIN = 6 * 60;
	const SHIFT_END_MIN = 23 * 60;
	const SHIFT_DURATION_MIN = SHIFT_END_MIN - SHIFT_START_MIN;
	const ui = {
		bg: "#05090d",
		panel: "#081018",
		line: "#1a2c38",
		text: "#d7d7d7",
		muted: "#8b8b8b",
		green: "#9acd32",
		red: "#ff2b2b",
		yellow: "#d4aa00",
		blue: "#3aa0ff",
		purple: "#a020f0",
		orange: "#ff8c00",
	};
	const ALEJO_KEY_STATIONS = new Set(["UNIVERSIDAD", "CENTRO MÉDICO", "HIDALGO", "ZAPATA", "MIXCOAC"]);
	const ALEJO_WHISPERS = [
		"AÚN NO ES TARDE.",
		"ALGO CAMBIÓ AQUÍ.",
		"NO MIRES ATRÁS.",
		"EL METRO RECUERDA.",
		"ESTO YA PASÓ.",
		"ESCUCHA EL SILENCIO.",
	];
	const MOCHILA_EVENT_IDS = new Set(["universidad_2", "mochila_abandonada"]);
	const universidadStationNodes = {
		Mochila: { x: 574, y: 352, w: 26, h: 16, visible: false },
	};
	const mochilaEventNpcs = [
		{
			id: "npc_trabajador_mochila",
			label: "Trabajador",
			x: 468,
			y: 197,
			w: 104,
			h: 168,
			dialog: "Esa mochila no debería estar ahí… va a hacer que las personas se quejen.",
		},
		{
			id: "npc_estudiante_mochila",
			label: "Estudiante",
			x: 642,
			y: 197,
			w: 104,
			h: 168,
			dialog: "¿De quién es eso…? Mejor me alejo.",
		},
	];
	const trabajadorSprite = new Image();
	trabajadorSprite.src = "trabajador_metro.png";
	let trabajadorSpriteReady = false;
	trabajadorSprite.onload = () => { trabajadorSpriteReady = true; };

	const estudianteSprite = new Image();
	estudianteSprite.src = "estudiante_universidad.png";
	let estudianteSpriteReady = false;
	estudianteSprite.onload = () => { estudianteSpriteReady = true; };

	const stationBg = new Image();
	stationBg.src = "universidad.png";
	let stationBgReady = false;
	stationBg.onload = () => { stationBgReady = true; };

	const metroLogo = new Image();
	metroLogo.src = "logo_metro.png";
	let metroLogoReady = false;
	metroLogo.onload = () => { metroLogoReady = true; };

	const networkMap = new Image();
	networkMap.src = "mapa.png";
	let networkMapReady = false;
	networkMap.onload = () => { networkMapReady = true; };
	networkMap.onerror = () => {
		networkMapReady = false;
		pushMessage("[SISTEMA]", "No se pudo cargar mapa.png.", "#ef4444");
	};

	const ghostSprite = new Image();
	const ghostCandidates = ["ghost_front.png", "ghost-front.png"];
	let ghostReady = false;
	let ghostIndex = 0;
	const loadGhost = () => {
		if (ghostIndex >= ghostCandidates.length) return;
		ghostSprite.src = ghostCandidates[ghostIndex];
	};
	ghostSprite.onload = () => { ghostReady = true; };
	ghostSprite.onerror = () => { ghostIndex += 1; loadGhost(); };
	loadGhost();

	let audioCtx = null;
	let ambienceOsc = null;

	function ensureAudio() {
		if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	}

	function beep(freq = 440, duration = 0.08, type = "square", gainVal = 0.03) {
		if (!audioCtx) return;
		const osc = audioCtx.createOscillator();
		const gain = audioCtx.createGain();
		osc.type = type;
		osc.frequency.value = freq;
		gain.gain.value = gainVal;
		osc.connect(gain);
		gain.connect(audioCtx.destination);
		osc.start();
		gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
		osc.stop(audioCtx.currentTime + duration);
	}

	function startAmbience() {
		if (!audioCtx || ambienceOsc) return;
		ambienceOsc = audioCtx.createOscillator();
		const lfo = audioCtx.createOscillator();
		const lfoGain = audioCtx.createGain();
		const gain = audioCtx.createGain();
		ambienceOsc.type = "triangle";
		ambienceOsc.frequency.value = 64;
		lfo.type = "sine";
		lfo.frequency.value = 0.25;
		lfoGain.gain.value = 8;
		gain.gain.value = 0.02;
		lfo.connect(lfoGain);
		lfoGain.connect(ambienceOsc.frequency);
		ambienceOsc.connect(gain);
		gain.connect(audioCtx.destination);
		ambienceOsc.start();
		lfo.start();
	}

	const stations = [
		{ name: "INDIOS VERDES", nodeX: 457, nodeY: 147, pointX: 457, pointY: 133, labelX: 470, labelY: 147, line: 3 },
		{ name: "HIDALGO", nodeX: 457, nodeY: 187, pointX: 457, pointY: 173, labelX: 470, labelY: 187, line: 3 },
		{ name: "CENTRO MÉDICO", nodeX: 457, nodeY: 237, pointX: 457, pointY: 223, labelX: 470, labelY: 255, line: "3-9" },
		{ name: "ZAPATA", nodeX: 457, nodeY: 302, pointX: 457, pointY: 288, labelX: 470, labelY: 320, line: "3-12" },
		{ name: "VIVEROS DE COYOACÁN", nodeX: 457, nodeY: 347, pointX: 457, pointY: 333, labelX: 470, labelY: 347, line: 3 },
		{ name: "UNIVERSIDAD", nodeX: 457, nodeY: 390, pointX: 457, pointY: 376, labelX: 470, labelY: 390, line: 3 },
		{ name: "PANTITLÁN", nodeX: 315, nodeY: 237, pointX: 315, pointY: 223, labelX: 320, labelY: 255, line: 9 },
		{ name: "CHILPANCINGO", nodeX: 388, nodeY: 237, pointX: 388, pointY: 223, labelX: 390, labelY: 255, line: 9 },
		{ name: "TACUBAYA", nodeX: 569, nodeY: 237, pointX: 569, pointY: 223, labelX: 570, labelY: 255, line: 9 },
		{ name: "MIXCOAC", nodeX: 375, nodeY: 302, pointX: 375, pointY: 288, labelX: 395, labelY: 320, line: 12 },
		{ name: "ERMITA", nodeX: 561, nodeY: 302, pointX: 561, pointY: 288, labelX: 545, labelY: 320, line: 12 },
		{ name: "TLÁHUAC", nodeX: 657, nodeY: 302, pointX: 657, pointY: 288, labelX: 640, labelY: 320, line: 12 },
	];

	const eventCatalog = [
		{ id: "universidad_1", estacion: "UNIVERSIDAD", titulo: "Cientos de estudiantes entran al mismo tiempo por cambio de turno", descripcion: "Una oleada de alumnos invade los accesos al mismo tiempo tras el cambio de clases. Los torniquetes se saturan y el andén comienza a llenarse rápidamente.", opcionA: "Abrir acceso extra", opcionB: "Mantener flujo normal", cambioMolestia: { A: -4, B: 6 }, cambioFuncionamiento: { A: -5, B: 2 } },
		{ id: "universidad_2", estacion: "UNIVERSIDAD", titulo: "Mochila abandonada cerca del andén", descripcion: "Personal de estación reporta una mochila sin dueño junto a una banca cercana al borde del andén. Algunos usuarios comienzan a alarmarse.", opcionA: "Revisar mochila", opcionB: "Ignorar reporte", cambioMolestia: { A: 7, B: -2 }, cambioFuncionamiento: { A: -4, B: 2 } },
		{ id: "universidad_3", estacion: "UNIVERSIDAD", titulo: "Protesta estudiantil bloquea torniquetes", descripcion: "Un grupo estudiantil coloca pancartas y cierra parcialmente la entrada principal. La fila empieza a crecer mientras exigen ser escuchados.", opcionA: "Negociar paso parcial", opcionB: "Desalojar acceso", cambioMolestia: { A: 4, B: 9 }, cambioFuncionamiento: { A: -5, B: 3 } },
		{ id: "universidad_4", estacion: "UNIVERSIDAD", titulo: "Tren lleno no puede cerrar puertas", descripcion: "El convoy permanece detenido porque mochilas y pasajeros impiden el cierre de puertas. La acumulación en el andén aumenta.", opcionA: "Vaciar vagón", opcionB: "Forzar salida", cambioMolestia: { A: 6, B: -2 }, cambioFuncionamiento: { A: -4, B: 3 } },
		{ id: "centromedico_1", estacion: "CENTRO MÉDICO", titulo: "Persona se desmaya en andén", descripcion: "Una persona cae inconsciente mientras esperaba el tren. Los usuarios se agrupan alrededor y el flujo se detiene.", opcionA: "Atender de inmediato", opcionB: "Esperar siguiente estación", cambioMolestia: { A: 6, B: -2 }, cambioFuncionamiento: { A: -4, B: 2 } },
		{ id: "centromedico_2", estacion: "CENTRO MÉDICO", titulo: "Usuario en silla de ruedas requiere elevador averiado", descripcion: "Una persona con movilidad reducida necesita bajar al andén, pero el elevador está fuera de servicio. Se solicita apoyo inmediato.", opcionA: "Dar apoyo manual", opcionB: "Pedir esperar", cambioMolestia: { A: 4, B: 7 }, cambioFuncionamiento: { A: -3, B: 1 } },
		{ id: "centromedico_3", estacion: "CENTRO MÉDICO", titulo: "Tren detenido con pasajero enfermo dentro", descripcion: "Un usuario presenta malestar dentro del vagón y el operador detiene la marcha para pedir instrucciones. El retraso comienza a extenderse.", opcionA: "Evacuar y atender", opcionB: "Avanzar normal", cambioMolestia: { A: 8, B: -2 }, cambioFuncionamiento: { A: -6, B: 3 } },
		{ id: "centromedico_4", estacion: "CENTRO MÉDICO", titulo: "Objeto sospechoso en correspondencia", descripcion: "Se reporta un paquete abandonado en la zona de transbordo. Seguridad pide decidir si se aísla el área o se continúa operación normal.", opcionA: "Aislar zona", opcionB: "Ignorar", cambioMolestia: { A: 9, B: -3 }, cambioFuncionamiento: { A: -7, B: 2 } },
		{ id: "pantitlan_1", estacion: "PANTITLÁN", titulo: "Andén rebasado de capacidad", descripcion: "La cantidad de personas supera el espacio disponible en el andén. Empieza a haber riesgo de empujones y accidentes.", opcionA: "Cerrar acceso temporal", opcionB: "Mantener abierto", cambioMolestia: { A: 10, B: -2 }, cambioFuncionamiento: { A: 5, B: -10 } },
		{ id: "pantitlan_2", estacion: "PANTITLÁN", titulo: "Usuarios empujan para entrar", descripcion: "La desesperación por subir provoca jalones, gritos y empujones en cuanto llegan los trenes. El ambiente escala rápido.", opcionA: "Frenar abordaje", opcionB: "Permitir entrada total", cambioMolestia: { A: 7, B: -2 }, cambioFuncionamiento: { A: 4, B: -8 } },
		{ id: "pantitlan_3", estacion: "PANTITLÁN", titulo: "Carteristas operando", descripcion: "Varios pasajeros denuncian robos entre la multitud. La gente exige presencia de seguridad mientras el caos continúa.", opcionA: "Operativo de seguridad", opcionB: "Ignorar", cambioMolestia: { A: 5, B: 8 }, cambioFuncionamiento: { A: -3, B: 1 } },
		{ id: "pantitlan_4", estacion: "PANTITLÁN", titulo: "Niño separado de su familia", descripcion: "Un menor llora solo cerca del acceso principal. Sus familiares no aparecen y la multitud dificulta localizarles.", opcionA: "Detener flujo y buscar", opcionB: "Aviso rápido y seguir", cambioMolestia: { A: 6, B: 3 }, cambioFuncionamiento: { A: -5, B: 1 } },
		{ id: "hidalgo_1", estacion: "HIDALGO", titulo: "Manifestantes ocupan acceso principal", descripcion: "Un grupo bloquea una entrada con mantas y consignas. El paso queda reducido y miles de usuarios buscan rutas alternas.", opcionA: "Negociar ruta alterna", opcionB: "Desalojar", cambioMolestia: { A: 4, B: 10 }, cambioFuncionamiento: { A: -5, B: 3 } },
		{ id: "hidalgo_2", estacion: "HIDALGO", titulo: "Vendedores bloquean pasillo", descripcion: "Comerciantes informales ocupan gran parte del corredor de correspondencia. El tránsito peatonal se vuelve lento y tenso.", opcionA: "Retirarlos", opcionB: "Tolerarlos", cambioMolestia: { A: 6, B: 2 }, cambioFuncionamiento: { A: 4, B: -5 } },
		{ id: "hidalgo_3", estacion: "HIDALGO", titulo: "Policía solicita cerrar entrada", descripcion: "Elementos de seguridad recomiendan cerrar uno de los accesos por prevención. La medida podría generar largas filas afuera.", opcionA: "Cerrar acceso", opcionB: "Mantener abierto", cambioMolestia: { A: 8, B: 3 }, cambioFuncionamiento: { A: 3, B: -4 } },
		{ id: "hidalgo_4", estacion: "HIDALGO", titulo: "Grupo exige acceso gratuito", descripcion: "Usuarios inconformes presionan para entrar sin pagar argumentando fallas del servicio. El personal espera una orden.", opcionA: "Permitir paso temporal", opcionB: "Negar acceso", cambioMolestia: { A: -3, B: 9 }, cambioFuncionamiento: { A: -4, B: 2 } },
		{ id: "zapata_1", estacion: "ZAPATA", titulo: "Intervalos demasiado largos", descripcion: "Los trenes tardan mucho más de lo habitual en llegar. Los usuarios comienzan a reclamar explicaciones.", opcionA: "Comunicar retraso", opcionB: "No informar", cambioMolestia: { A: -4, B: 8 }, cambioFuncionamiento: { A: 0, B: 1 } },
		{ id: "zapata_2", estacion: "ZAPATA", titulo: "Pasillo de transbordo saturado", descripcion: "La conexión entre líneas está llena de personas detenidas y caminando lentamente. Moverse entre andenes se vuelve difícil.", opcionA: "Desviar flujo", opcionB: "Mantener igual", cambioMolestia: { A: 3, B: 6 }, cambioFuncionamiento: { A: 4, B: -5 } },
		{ id: "zapata_3", estacion: "ZAPATA", titulo: "Trenes llegan llenos", descripcion: "Los convoyes arriban sin espacio disponible y casi nadie logra abordar. La frustración aumenta en cada llegada.", opcionA: "Retener siguiente tren", opcionB: "Continuar igual", cambioMolestia: { A: 6, B: 7 }, cambioFuncionamiento: { A: 5, B: -4 } },
		{ id: "zapata_4", estacion: "ZAPATA", titulo: "Altavoz falla", descripcion: "El sistema de anuncios deja de escucharse o se oye entrecortado. Nadie entiende avisos ni cambios de servicio.", opcionA: "Personal informa manualmente", opcionB: "Ignorar falla", cambioMolestia: { A: 2, B: 8 }, cambioFuncionamiento: { A: -2, B: 0 } },
		{ id: "mixcoac_1", estacion: "MIXCOAC", titulo: "Los indicadores presentan errores y los operadores esperan confirmación para avanzar. El servicio entra en incertidumbre.", descripcion: "Una maniobra operativa retrasa la salida de varios trenes. La línea empieza a acumular demoras.", opcionA: "Esperar maniobra segura", opcionB: "Acelerar proceso", cambioMolestia: { A: 5, B: -2 }, cambioFuncionamiento: { A: 3, B: -7 } },
		{ id: "mixcoac_2", estacion: "MIXCOAC", titulo: "Fallo en señalización", descripcion: "Los indicadores presentan errores y los operadores esperan confirmación para avanzar. El servicio entra en incertidumbre.", opcionA: "Revisar sistema", opcionB: "Operación manual inmediata", cambioMolestia: { A: 6, B: -1 }, cambioFuncionamiento: { A: 5, B: -6 } },
		{ id: "mixcoac_3", estacion: "MIXCOAC", titulo: "Puertas sin cierre correcto", descripcion: "Un convoy reporta fallas mecánicas en varias puertas. Mantenerlo en circulación implica riesgo operativo.", opcionA: "Sacar tren de servicio", opcionB: "Mantener operación", cambioMolestia: { A: 7, B: -2 }, cambioFuncionamiento: { A: -4, B: -10 } },
		{ id: "mixcoac_4", estacion: "MIXCOAC", titulo: "Olor a quemado", descripcion: "Usuarios y personal detectan olor a cable quemado en una zona técnica cercana al andén. Se teme una avería mayor.", opcionA: "Cerrar zona e inspeccionar", opcionB: "Continuar servicio", cambioMolestia: { A: 8, B: -2 }, cambioFuncionamiento: { A: -5, B: -12 } },
		{ id: "universidad_5", estacion: "UNIVERSIDAD", titulo: "Fila invade avenida exterior", descripcion: "La cantidad de usuarios supera la explanada y la fila comienza a bloquear la calle.", opcionA: "Abrir acceso adicional", opcionB: "Mantener control normal", cambioMolestia: { A: -3, B: 7 }, cambioFuncionamiento: { A: -4, B: 2 } },
		{ id: "universidad_6", estacion: "UNIVERSIDAD", titulo: "Corte de energía en torniquetes", descripcion: "Varios accesos dejan de leer tarjetas y la fila crece rápidamente.", opcionA: "Paso manual temporal", opcionB: "Esperar reinicio", cambioMolestia: { A: 2, B: 8 }, cambioFuncionamiento: { A: -3, B: 1 } },
		{ id: "universidad_7", estacion: "UNIVERSIDAD", titulo: "Rumor de suspensión de clases", descripcion: "Miles de estudiantes intentan salir al mismo tiempo tras una versión no confirmada.", opcionA: "Regular salidas", opcionB: "Dejar flujo libre", cambioMolestia: { A: 3, B: 6 }, cambioFuncionamiento: { A: -2, B: -5 } },
		{ id: "centromedico_5", estacion: "CENTRO MÉDICO", titulo: "Paciente trasladado bloquea pasillo", descripcion: "Personal médico cruza la estación con una camilla y detiene la correspondencia.", opcionA: "Desviar flujo", opcionB: "Mantener paso abierto", cambioMolestia: { A: 2, B: 5 }, cambioFuncionamiento: { A: -2, B: -4 } },
		{ id: "centromedico_6", estacion: "CENTRO MÉDICO", titulo: "Persona desorientada en andén", descripcion: "Un usuario mayor no recuerda su destino y está cerca del borde del andén.", opcionA: "Asignar apoyo", opcionB: "Dar aviso general", cambioMolestia: { A: 1, B: 4 }, cambioFuncionamiento: { A: -2, B: 0 } },
		{ id: "centromedico_7", estacion: "CENTRO MÉDICO", titulo: "Ambulancia solicita acceso inmediato", descripcion: "Servicios de emergencia requieren paso libre en zona exterior de la estación.", opcionA: "Despejar entradas", opcionB: "Mantener operación normal", cambioMolestia: { A: 3, B: 6 }, cambioFuncionamiento: { A: -2, B: -3 } },
		{ id: "pantitlan_5", estacion: "PANTITLÁN", titulo: "Perrito entra a vías", descripcion: "Un perro baja accidentalmente a la zona de vías y usuarios exigen detener el tren.", opcionA: "Cortar corriente y rescatar", opcionB: "Intentar moverlo rápido", cambioMolestia: { A: 2, B: 8 }, cambioFuncionamiento: { A: -6, B: -10 } },
		{ id: "pantitlan_6", estacion: "PANTITLÁN", titulo: "Empujones en borde de andén", descripcion: "La presión por subir deja a varias personas peligrosamente cerca de las vías.", opcionA: "Cerrar acceso temporal", opcionB: "Mantener abordaje", cambioMolestia: { A: 6, B: -2 }, cambioFuncionamiento: { A: 3, B: -9 } },
		{ id: "pantitlan_7", estacion: "PANTITLÁN", titulo: "Maleta atorada en puertas", descripcion: "El convoy no puede salir mientras una maleta bloquea el cierre.", opcionA: "Desalojar vagón", opcionB: "Forzar cierre", cambioMolestia: { A: 5, B: -1 }, cambioFuncionamiento: { A: -3, B: -7 } },
		{ id: "pantitlan_8", estacion: "PANTITLÁN", titulo: "Caída en escaleras de correspondencia", descripcion: "Una persona cae y el flujo detrás se detiene de golpe.", opcionA: "Cerrar paso y atender", opcionB: "Mover flujo lateral", cambioMolestia: { A: 4, B: 6 }, cambioFuncionamiento: { A: -4, B: -2 } },
		{ id: "hidalgo_5", estacion: "HIDALGO", titulo: "Marcha llega a accesos", descripcion: "Un contingente numeroso ocupa entradas principales de la estación.", opcionA: "Abrir rutas alternas", opcionB: "Cerrar accesos", cambioMolestia: { A: 3, B: 8 }, cambioFuncionamiento: { A: -3, B: 2 } },
		{ id: "hidalgo_6", estacion: "HIDALGO", titulo: "Rumor de riña en andén", descripcion: "Usuarios comienzan a correr tras escuchar gritos en la plataforma.", opcionA: "Enviar seguridad", opcionB: "Esperar confirmación", cambioMolestia: { A: 2, B: 7 }, cambioFuncionamiento: { A: -2, B: -4 } },
		{ id: "hidalgo_7", estacion: "HIDALGO", titulo: "Comercio invade correspondencia", descripcion: "Puestos improvisados reducen el paso entre líneas.", opcionA: "Retirar puestos", opcionB: "Permitir operación", cambioMolestia: { A: 5, B: 2 }, cambioFuncionamiento: { A: 4, B: -5 } },
		{ id: "zapata_5", estacion: "ZAPATA", titulo: "Altavoces dan mensajes opuestos", descripcion: "Dos anuncios contradictorios confunden a todos los usuarios.", opcionA: "Cancelar audio y orientar manualmente", opcionB: "Mantener sistema", cambioMolestia: { A: 1, B: 7 }, cambioFuncionamiento: { A: -2, B: -3 } },
		{ id: "zapata_6", estacion: "ZAPATA", titulo: "Pasillo detenido por saturación", descripcion: "La correspondencia apenas avanza y comienzan empujones.", opcionA: "Separar sentidos de paso", opcionB: "Esperar a que fluya", cambioMolestia: { A: 2, B: 6 }, cambioFuncionamiento: { A: 4, B: -5 } },
		{ id: "zapata_7", estacion: "ZAPATA", titulo: "Convoy llega sin abrir puertas", descripcion: "El tren se detiene unos segundos y arranca sin permitir descenso.", opcionA: "Retener siguiente tren", opcionB: "Continuar servicio", cambioMolestia: { A: 4, B: 8 }, cambioFuncionamiento: { A: -2, B: 1 } },
		{ id: "mixcoac_5", estacion: "MIXCOAC", titulo: "Olor a quemado en gabinete", descripcion: "Personal técnico detecta posible falla eléctrica cerca del andén.", opcionA: "Cerrar zona e inspeccionar", opcionB: "Continuar operación", cambioMolestia: { A: 7, B: -2 }, cambioFuncionamiento: { A: -4, B: -11 } },
		{ id: "mixcoac_6", estacion: "MIXCOAC", titulo: "Conductor reporta fatiga", descripcion: "Un operador solicita relevo antes de continuar recorrido.", opcionA: "Esperar relevo", opcionB: "Pedir último viaje", cambioMolestia: { A: 4, B: -1 }, cambioFuncionamiento: { A: -3, B: -8 } },
		{ id: "mixcoac_7", estacion: "MIXCOAC", titulo: "Señal intermitente en tablero", descripcion: "Los indicadores cambian sin patrón claro y frenan la operación.", opcionA: "Revisión completa", opcionB: "Operación manual inmediata", cambioMolestia: { A: 5, B: -1 }, cambioFuncionamiento: { A: 3, B: -7 } },
	];

	const eventCommsById = {
		universidad_1: [
			{ tag: "[OPERADOR UNIVERSIDAD]", text: "Ingreso masivo por cambio de clases, accesos saturados.", color: ui.orange },
			{ tag: "[USUARIO]", text: "¡No avanzan los torniquetes!", color: ui.yellow },
			{ tag: "[VOZ]", text: "Yo también corría así alguna vez.", color: ui.purple },
		],
		universidad_2: [
			{ tag: "[SEGURIDAD UNIVERSIDAD]", text: "Objeto sin propietario reportado en andén.", color: ui.blue },
			{ tag: "[USUARIO]", text: "Esa mochila lleva rato sola.", color: ui.yellow },
			{ tag: "[VOZ]", text: "Algo olvidado pesa más cuando nadie vuelve por ello.", color: ui.purple },
		],
		universidad_3: [
			{ tag: "[OPERADOR UNIVERSIDAD]", text: "Grupo bloquea acceso principal.", color: ui.orange },
			{ tag: "[USUARIO]", text: "Vamos tarde y no dejan pasar.", color: ui.yellow },
		],
		universidad_4: [
			{ tag: "[OPERADOR UNIVERSIDAD]", text: "Puertas obstruidas, convoy detenido.", color: ui.orange },
			{ tag: "[USUARIO]", text: "¡Háganse para adentro!", color: ui.yellow },
		],
		centromedico_1: [
			{ tag: "[OPERADOR CENTRO MÉDICO]", text: "Usuario inconsciente en zona de espera.", color: ui.orange },
			{ tag: "[USUARIO]", text: "¡Alguien ayude, por favor!", color: ui.yellow },
		],
		centromedico_2: [
			{ tag: "[OPERADOR CENTRO MÉDICO]", text: "Solicitan apoyo por elevador fuera de servicio.", color: ui.orange },
			{ tag: "[USUARIO]", text: "No puede bajar solo.", color: ui.yellow },
		],
		centromedico_3: [
			{ tag: "[SISTEMA]", text: "Convoy inmovilizado por incidente médico.", color: ui.green },
			{ tag: "[USUARIO]", text: "Ya llevamos mucho aquí encerrados.", color: ui.yellow },
			{ tag: "[VOZ]", text: "Respirtambién puede sentirse lejano.", color: ui.purple },
		],
		centromedico_4: [
			{ tag: "[SEGURIDAD CENTRO MÉDICO]", text: "Paquete abandonado en transbordo.", color: ui.blue },
			{ tag: "[USUARIO]", text: "Mejor revisen eso.", color: ui.yellow },
			{ tag: "[VOZ]", text: "Lo desconocido siempre detiene a todos.", color: ui.purple },
		],
		pantitlan_1: [
			{ tag: "[OPERADOR PANTITLÁN]", text: "Capacidad excedida en plataforma.", color: ui.orange },
			{ tag: "[USUARIO]", text: "¡Ya no cabe nadie más!", color: ui.yellow },
			{ tag: "[VOZ]", text: "Aquí el caos respira solo.", color: ui.purple },
		],
		pantitlan_2: [
			{ tag: "[SEGURIDAD PANTITLÁN]", text: "Empujones generalizados al arribo de tren.", color: ui.blue },
			{ tag: "[USUARIO]", text: "¡No me empujen!", color: ui.yellow },
			{ tag: "[VOZ]", text: "Todos quieren salir primero.", color: ui.purple },
		],
		pantitlan_3: [
			{ tag: "[SEGURIDAD PANTITLÁN]", text: "Reportes múltiples de robo.", color: ui.blue },
			{ tag: "[USUARIO]", text: "Me abrieron la mochila.", color: ui.yellow },
			{ tag: "[VOZ]", text: "En la multitud siempre falta algo.", color: ui.purple },
		],
		pantitlan_4: [
			{ tag: "[OPERADOR PANTITLÁN]", text: "Menor extraviado localizado.", color: ui.orange },
			{ tag: "[USUARIO]", text: "Está llorando solo.", color: ui.yellow },
			{ tag: "[VOZ]", text: "Perderse toma segundos.", color: ui.purple },
		],
		hidalgo_1: [
			{ tag: "[SEGURIDAD HIDALGO]", text: "Acceso bloqueado por protesta.", color: ui.blue },
			{ tag: "[USUARIO]", text: "¿Y ahora por dónde entramos?", color: ui.yellow },
			{ tag: "[VOZ]", text: "La ciudad siempre exige algo.", color: ui.purple },
		],
		hidalgo_2: [
			{ tag: "[OPERADOR HIDALGO]", text: "Flujo lento por comercio informal.", color: ui.orange },
			{ tag: "[USUARIO]", text: "No se puede caminar.", color: ui.yellow },
			{ tag: "[VOZ]", text: "Algunos sobreviven estorbando a otros.", color: ui.purple },
		],
		hidalgo_3: [
			{ tag: "[SEGURIDAD HIDALGO]", text: "Solicitud de cierre preventivo.", color: ui.blue },
			{ tag: "[USUARIO]", text: "Siempre cierran cuando más urge pasar.", color: ui.yellow },
			{ tag: "[VOZ]", text: "La autoridad también duda.", color: ui.purple },
		],
		hidalgo_4: [
			{ tag: "[OPERADOR HIDALGO]", text: "Usuarios presionan torniquetes.", color: ui.orange },
			{ tag: "[USUARIO]", text: "¡Con este servicio no pagamos!", color: ui.yellow },
			{ tag: "[VOZ]", text: "Todo tiene costo, incluso seguir aquí.", color: ui.purple },
		],
		zapata_1: [
			{ tag: "[SISTEMA]", text: "Demoras acumuladas en Línea 3.", color: ui.green },
			{ tag: "[USUARIO]", text: "Llevamos siglos esperando.", color: ui.yellow },
			{ tag: "[VOZ]", text: "El tiempo aquí pesa distinto.", color: ui.purple },
		],
		zapata_2: [
			{ tag: "[OPERADOR ZAPATA]", text: "Correspondencia a máxima capacidad.", color: ui.orange },
			{ tag: "[USUARIO]", text: "Ni caminar se puede.", color: ui.yellow },
			{ tag: "[VOZ]", text: "A veces avanzar es solo empujar.", color: ui.purple },
		],
		zapata_3: [
			{ tag: "[OPERADOR ZAPATA]", text: "Convoyes sin capacidad disponible.", color: ui.orange },
			{ tag: "[USUARIO]", text: "Otro lleno... otra vez.", color: ui.yellow },
			{ tag: "[VOZ]", text: "Siempre hay puertas que no abren para uno.", color: ui.purple },
		],
		zapata_4: [
			{ tag: "[SISTEMA]", text: "Error en sistema de anuncios.", color: ui.green },
			{ tag: "[USUARIO]", text: "No se entiende nada.", color: ui.yellow },
			{ tag: "[VOZ]", text: "Algunas voces solo se oyen cuando todo falla.", color: ui.purple },
		],
		mixcoac_1: [
			{ tag: "[OPERADOR MIXCOAC]", text: "Maniobra retrasada en zona técnica.", color: ui.orange },
			{ tag: "[USUARIO]", text: "¿Por qué no avanza?", color: ui.yellow },
			{ tag: "[VOZ]", text: "Cambiar de ruta nunca es rápido.", color: ui.purple },
		],
		mixcoac_2: [
			{ tag: "[SISTEMA]", text: "Inconsistencia en señales detectada.", color: ui.green },
			{ tag: "[OPERADOR MIXCOAC]", text: "Esperando confirmación.", color: ui.orange },
			{ tag: "[VOZ]", text: "Cuando no hay señales, uno inventa camino.", color: ui.purple },
		],
		mixcoac_3: [
			{ tag: "[OPERADOR MIXCOAC]", text: "Convoy con puertas defectuosas.", color: ui.orange },
			{ tag: "[USUARIO]", text: "Así nos vamos a quedar parados.", color: ui.yellow },
			{ tag: "[VOZ]", text: "Hay cosas que no cierran aunque lo intentes.", color: ui.purple },
		],
		mixcoac_4: [
			{ tag: "[SEGURIDAD MIXCOAC]", text: "Posible sobrecalentamiento en zona operativa.", color: ui.blue },
			{ tag: "[USUARIO]", text: "Huele raro aquí abajo.", color: ui.yellow },
			{ tag: "[VOZ]", text: "Algo se consume desde hace tiempo.", color: ui.purple },
		],
		universidad_5: [
			{ tag: "[OPERADOR UNIVERSIDAD]", text: "Fila exterior invade zona peatonal.", color: ui.orange },
			{ tag: "[USUARIO]", text: "Ya llegamos hasta la avenida.", color: ui.yellow },
		],
		universidad_6: [
			{ tag: "[SISTEMA]", text: "Lectores fuera de servicio en accesos principales.", color: ui.green },
			{ tag: "[USUARIO]", text: "Mi tarjeta sí tiene saldo.", color: ui.yellow },
		],
		universidad_7: [
			{ tag: "[OPERADOR UNIVERSIDAD]", text: "Salida masiva por rumor no confirmado.", color: ui.orange },
			{ tag: "[USUARIO]", text: "Dicen que cancelaron todo.", color: ui.yellow },
		],
		centromedico_5: [
			{ tag: "[OPERADOR CENTRO MÉDICO]", text: "Traslado médico cruza correspondencia.", color: ui.orange },
			{ tag: "[USUARIO]", text: "No empujen, va una camilla.", color: ui.yellow },
		],
		centromedico_6: [
			{ tag: "[OPERADOR CENTRO MÉDICO]", text: "Usuario desorientado en plataforma.", color: ui.orange },
			{ tag: "[USUARIO]", text: "No sabe ni a dónde iba.", color: ui.yellow },
		],
		centromedico_7: [
			{ tag: "[SEGURIDAD CENTRO MÉDICO]", text: "Ambulancia solicita acceso libre.", color: ui.blue },
			{ tag: "[USUARIO]", text: "Háganse a un lado.", color: ui.yellow },
		],
		pantitlan_5: [
			{ tag: "[OPERADOR PANTITLÁN]", text: "Animal en zona de vías.", color: ui.orange },
			{ tag: "[USUARIO]", text: "¡No lo dejen ahí!", color: ui.yellow },
		],
		pantitlan_6: [
			{ tag: "[SEGURIDAD PANTITLÁN]", text: "Usuarios al borde de andén.", color: ui.blue },
			{ tag: "[USUARIO]", text: "¡No me empujen!", color: ui.yellow },
		],
		pantitlan_7: [
			{ tag: "[OPERADOR PANTITLÁN]", text: "Puertas bloqueadas por equipaje.", color: ui.orange },
			{ tag: "[USUARIO]", text: "¡Saquen esa maleta!", color: ui.yellow },
		],
		pantitlan_8: [
			{ tag: "[SEGURIDAD PANTITLÁN]", text: "Persona caída en escaleras.", color: ui.blue },
			{ tag: "[USUARIO]", text: "¡Deténganse tantito!", color: ui.yellow },
		],
		hidalgo_5: [
			{ tag: "[OPERADOR HIDALGO]", text: "Contingente ocupa entradas principales.", color: ui.orange },
			{ tag: "[USUARIO]", text: "¿Entonces por dónde pasamos?", color: ui.yellow },
		],
		hidalgo_6: [
			{ tag: "[SEGURIDAD HIDALGO]", text: "Reportan disturbio en andén.", color: ui.blue },
			{ tag: "[USUARIO]", text: "Todos empezaron a correr.", color: ui.yellow },
		],
		hidalgo_7: [
			{ tag: "[OPERADOR HIDALGO]", text: "Paso reducido por comercio irregular.", color: ui.orange },
			{ tag: "[USUARIO]", text: "Ni caminar se puede.", color: ui.yellow },
		],
		zapata_5: [
			{ tag: "[SISTEMA]", text: "Mensajes simultáneos detectados.", color: ui.green },
			{ tag: "[USUARIO]", text: "Uno dice avance y otro no.", color: ui.yellow },
		],
		zapata_6: [
			{ tag: "[OPERADOR ZAPATA]", text: "Correspondencia detenida por saturación.", color: ui.orange },
			{ tag: "[USUARIO]", text: "Ni para atrás ni para adelante.", color: ui.yellow },
		],
		zapata_7: [
			{ tag: "[OPERADOR ZAPATA]", text: "Convoy sin maniobra de ascenso.", color: ui.orange },
			{ tag: "[USUARIO]", text: "¿Y ni abrió?", color: ui.yellow },
		],
		mixcoac_5: [
			{ tag: "[SEGURIDAD MIXCOAC]", text: "Posible sobrecalentamiento técnico.", color: ui.blue },
			{ tag: "[USUARIO]", text: "Huele a cable quemado.", color: ui.yellow },
		],
		mixcoac_6: [
			{ tag: "[OPERADOR MIXCOAC]", text: "Conductor solicita relevo inmediato.", color: ui.orange },
			{ tag: "[USUARIO]", text: "Ya vámonos, por favor.", color: ui.yellow },
		],
		mixcoac_7: [
			{ tag: "[SISTEMA]", text: "Lecturas erráticas en tablero principal.", color: ui.green },
			{ tag: "[OPERADOR MIXCOAC]", text: "Sin señal clara para salida.", color: ui.orange },
		],
	};

	const state = {
		gameState: "menu",
		introIndex: 0,
		timer: GAME_DURATION_SEC,
		worldTime: 0,
		caseCooldown: 2,
		currentCase: null,
		currentCaseVisible: false,
		currentCaseSource: null,
		functionBias: 0,
		publicAnger: 28,
		metroFunction: 62,
		recentCases: [],
		messageLog: [
			{ tag: "[SISTEMA]", text: "Centro de control operativo.", color: "#8b949e" },
			{ tag: "[SISTEMA]", text: "Esperando el primer caso.", color: "#7dd3fc" },
		],
		metroSystem: {
			stress: 34,
			unitsHealth: 74,
			price: 5,
		},
		lastEventId: null,
		lastEventStation: null,
		sameStationStreak: 0,
		messageCooldown: 2,
		player: {
			x: 110,
			y: 338,
			w: 18,
			h: 18,
			speed: 180,
			vx: 0,
			floatPhase: 0,
		},
		currentStation: null,
		selectedStationIndex: null,
		keys: {},
		stationDialog: {
			open: false,
			text: "",
			npcId: null,
		},
	};

	const stationNpcs = [
		{
			id: "npc_student",
			x: 240,
			y: 316,
			w: 22,
			h: 34,
			label: "Estudiante",
			case: {
				text: "Una estudiante no tiene saldo suficiente.",
				options: [
					{
						text: "Dejarla pasar",
						effect: () => {
							state.publicAnger = clamp(state.publicAnger - 6, 0, 100);
							state.metroSystem.stress = clamp(state.metroSystem.stress + 5, 0, 100);
						},
					},
					{
						text: "Negar acceso",
						effect: () => {
							state.publicAnger = clamp(state.publicAnger + 10, 0, 100);
							state.metroSystem.unitsHealth = clamp(state.metroSystem.unitsHealth + 2, 0, 100);
						},
					},
				],
			},
		},
		{
			id: "npc_woman",
			x: 470,
			y: 316,
			w: 22,
			h: 34,
			label: "Señora",
			case: {
				text: "Una señora pide que el tren espere.",
				options: [
					{
						text: "Esperar",
						effect: () => {
							state.publicAnger = clamp(state.publicAnger - 5, 0, 100);
							state.metroSystem.stress = clamp(state.metroSystem.stress + 6, 0, 100);
						},
					},
					{
						text: "Seguir",
						effect: () => {
							state.publicAnger = clamp(state.publicAnger + 8, 0, 100);
							state.functionBias = clamp(state.functionBias + 4, -40, 40);
						},
					},
				],
			},
		},
		{
			id: "npc_police",
			x: 720,
			y: 316,
			w: 22,
			h: 34,
			label: "Policía",
			case: {
				text: "Un policía dice que cierres la estación.",
				options: [
					{
						text: "Cerrar",
						effect: () => {
							state.functionBias = clamp(state.functionBias - 10, -40, 40);
							state.publicAnger = clamp(state.publicAnger + 5, 0, 100);
						},
					},
					{
						text: "Ignorar",
						effect: () => {
							state.metroSystem.stress = clamp(state.metroSystem.stress + 10, 0, 100);
							state.publicAnger = clamp(state.publicAnger + 8, 0, 100);
						},
					},
				],
			},
		},
	];

	const globalCases = [
		{
			tag: "tarifa",
			priority: "MEDIA",
			text: "Te sugieren subir el precio del boleto.",
			options: [
				{
					text: "Subir precio",
					effect: () => {
						state.metroSystem.price = clamp(state.metroSystem.price + 1, 1, 10);
						state.publicAnger = clamp(state.publicAnger + 12, 0, 100);
						state.metroSystem.stress = clamp(state.metroSystem.stress - 2, 0, 100);
					},
				},
				{
					text: "Mantener precio",
					effect: () => {
						state.metroSystem.stress = clamp(state.metroSystem.stress + 6, 0, 100);
						state.metroSystem.unitsHealth = clamp(state.metroSystem.unitsHealth - 4, 0, 100);
					},
				},
			],
		},
		{
			tag: "mantenimiento",
			priority: "URGENTE",
			text: "Una línea necesita mantenimiento urgente.",
			options: [
				{
					text: "Detener línea",
					effect: () => {
							state.functionBias = clamp(state.functionBias - 12, -40, 40);
						state.metroSystem.unitsHealth = clamp(state.metroSystem.unitsHealth + 10, 0, 100);
						state.metroSystem.stress = clamp(state.metroSystem.stress - 4, 0, 100);
					},
				},
				{
					text: "Posponer",
					effect: () => {
						state.metroSystem.unitsHealth = clamp(state.metroSystem.unitsHealth - 15, 0, 100);
						state.publicAnger = clamp(state.publicAnger + 8, 0, 100);
					},
				},
			],
		},
		{
			tag: "saturación",
			priority: "MEDIA",
			text: "Un tren está completamente saturado.",
			options: [
				{
					text: "Reducir flujo",
					effect: () => {
						state.metroSystem.stress = clamp(state.metroSystem.stress + 5, 0, 100);
						state.publicAnger = clamp(state.publicAnger - 3, 0, 100);
					},
				},
				{
					text: "Ignorar",
					effect: () => {
						state.publicAnger = clamp(state.publicAnger + 12, 0, 100);
						state.metroSystem.unitsHealth = clamp(state.metroSystem.unitsHealth - 5, 0, 100);
					},
				},
			],
		},
		{
			tag: "evacuación",
			priority: "URGENTE",
			text: "Circula un rumor de incendio.",
			options: [
				{
					text: "Evacuar",
					effect: () => {
							state.functionBias = clamp(state.functionBias - 15, -40, 40);
						state.publicAnger = clamp(state.publicAnger - 3, 0, 100);
						state.metroSystem.stress = clamp(state.metroSystem.stress + 5, 0, 100);
					},
				},
				{
					text: "Ignorar",
					effect: () => {
						state.publicAnger = clamp(state.publicAnger + 15, 0, 100);
						state.metroSystem.unitsHealth = clamp(state.metroSystem.unitsHealth - 8, 0, 100);
					},
				},
			],
		},
		{
			tag: "falla",
			priority: "BAJA",
			text: "Un fallo técnico aparece.",
			options: [
				{
					text: "Arreglar ahora",
					effect: () => {
							state.functionBias = clamp(state.functionBias - 5, -40, 40);
						state.metroSystem.unitsHealth = clamp(state.metroSystem.unitsHealth + 6, 0, 100);
						state.metroSystem.stress = clamp(state.metroSystem.stress + 2, 0, 100);
					},
				},
				{
					text: "Ignorar",
					effect: () => {
						state.metroSystem.unitsHealth = clamp(state.metroSystem.unitsHealth - 10, 0, 100);
						state.publicAnger = clamp(state.publicAnger + 7, 0, 100);
					},
				},
			],
		},
	];

	function drawRect(x, y, w, h, color) {
		ctx.fillStyle = color;
		ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
	}

	function drawText(text, x, y, color = "#f8fafc", size = 10, scale = 1.6) {
		const normalizedText = String(text).toUpperCase();
		const readableSize = Math.max(8, Math.round(size * scale));
		ctx.fillStyle = color;
		ctx.font = `${readableSize}px "Courier New", monospace`;
		ctx.lineJoin = "round";
		ctx.miterLimit = 2;
		ctx.lineWidth = Math.max(1, Math.ceil(readableSize / 8));
		ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
		ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
		ctx.shadowBlur = 0;
		ctx.strokeText(normalizedText, x, y);
		ctx.fillText(normalizedText, x, y);
	}

	function wrapCanvasText(text, size = 10, scale = 1.6, maxWidth = 100, maxLines = 2) {
		const source = String(text || "").toUpperCase().trim();
		if (!source) return [""];
		const readableSize = Math.max(8, Math.round(size * scale));
		ctx.save();
		ctx.font = `${readableSize}px "Courier New", monospace`;
		const words = source.split(/\s+/);
		const lines = [];
		let current = "";
		for (const word of words) {
			const testLine = current ? `${current} ${word}` : word;
			if (ctx.measureText(testLine).width <= maxWidth) {
				current = testLine;
			} else {
				if (current) lines.push(current);
				current = word;
				if (lines.length >= maxLines - 1) break;
			}
		}
		if (lines.length < maxLines && current) lines.push(current);

		const usedWords = lines.join(" ").split(/\s+/).filter(Boolean).length;
		if (usedWords < words.length && lines.length) {
			let last = lines[lines.length - 1];
			while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
				last = last.slice(0, -1);
			}
			lines[lines.length - 1] = `${last}…`;
		}
		ctx.restore();
		return lines.slice(0, maxLines);
	}

	function formatTime(sec) {
		const m = String(Math.floor(sec / 60)).padStart(2, "0");
		const s = String(Math.floor(sec % 60)).padStart(2, "0");
		return `${m}:${s}`;
	}

	function formatClockFromMinutes(totalMinutes) {
		const clampedMinutes = clamp(Math.round(totalMinutes), SHIFT_START_MIN, SHIFT_END_MIN);
		const steppedMinutes = Math.floor(clampedMinutes / 10) * 10;
		const h = String(Math.floor(steppedMinutes / 60)).padStart(2, "0");
		const m = String(steppedMinutes % 60).padStart(2, "0");
		return `${h}:${m}`;
	}

	function getWorkdayMinutes(offsetSeconds = 0) {
		const elapsedSeconds = clamp((GAME_DURATION_SEC - state.timer) + offsetSeconds, 0, GAME_DURATION_SEC);
		const progress = elapsedSeconds / GAME_DURATION_SEC;
		return SHIFT_START_MIN + progress * SHIFT_DURATION_MIN;
	}

	function getWorkdayClock(offsetSeconds = 0) {
		return formatClockFromMinutes(getWorkdayMinutes(offsetSeconds));
	}

	function getTimeBand() {
		const minutes = getWorkdayMinutes();
		if (minutes < 12 * 60) return "manana";
		if (minutes < 19 * 60) return "tarde";
		return "noche";
	}

	function updateMetroFunction() {
		state.metroFunction = clamp(
			55 + state.metroSystem.unitsHealth * 0.4 - state.metroSystem.stress * 0.5 - (state.metroSystem.price - 5) * 6 + state.functionBias,
			0,
			100
		);
	}

	function updateAngerFromFunction() {
		if (state.metroFunction >= 80) {
			state.publicAnger = clamp(state.publicAnger - 1.5, 0, 100);
		} else if (state.metroFunction >= 60) {
			state.publicAnger = clamp(state.publicAnger - 0.4, 0, 100);
		} else if (state.metroFunction >= 40) {
			state.publicAnger = clamp(state.publicAnger + 1.2, 0, 100);
		} else {
			state.publicAnger = clamp(state.publicAnger + 3.5, 0, 100);
		}
	}

	function updateHUD() {
		metroValue.textContent = Math.round(state.metroFunction);
		metroBar.style.width = `${state.metroFunction}%`;
		angerValue.textContent = Math.round(state.publicAnger);
		angerBar.style.width = `${state.publicAnger}%`;
		coopValue.textContent = Math.round(100 - state.publicAnger);
		timerValue.textContent = getWorkdayClock();
		lineStateEl.textContent = `PRESIÓN SOCIAL | Boleto: $${state.metroSystem.price} | Enojo: ${Math.round(state.publicAnger)}%`;
		stressValue.textContent = Math.round(state.metroSystem.stress);
		healthValue.textContent = Math.round(state.metroSystem.unitsHealth);
		priceValue.textContent = state.metroSystem.price;
	}

	function formatStamp() {
		return getWorkdayClock();
	}

	function pushRecentCase(entry) {
		state.recentCases.unshift({
			stamp: formatStamp(),
			title: entry.titulo,
			priority: entry.estacion || "CASO",
			tag: entry.descripcion,
		});
		state.recentCases = state.recentCases.slice(0, 5);
	}

	function pushMessage(tag, text, color = "#cbd5e1") {
		state.messageLog.push({ tag, text, color });
		state.messageLog = state.messageLog.slice(-6);
	}

	function setPrompt(text = "") {
		promptEl.classList.add("hidden");
		promptEl.textContent = "";
	}

	function showCaseUI(c) {
		casePanel.classList.add("hidden");
		caseMeta.textContent = `${c.estacion || "CASO"} | ZONA: METRO CDMX`;
		caseText.textContent = c.descripcion;
		const buttons = [opt1, opt2];
		buttons[0].textContent = `A) ${c.opcionA}`;
		buttons[1].textContent = `B) ${c.opcionB}`;
		buttons[0].onclick = () => resolveCase("A");
		buttons[1].onclick = () => resolveCase("B");
	}

	function hideCaseUI() {
		casePanel.classList.add("hidden");
		opt1.onclick = null;
		opt2.onclick = null;
	}

	function resolveCase(choiceKey) {
		if (!state.currentCase) return;
		const eventCase = state.currentCase;
		state.publicAnger = clamp(state.publicAnger + (eventCase.cambioMolestia[choiceKey] || 0), 0, 100);
		state.metroFunction = clamp(state.metroFunction + (eventCase.cambioFuncionamiento[choiceKey] || 0), 0, 100);
		pushMessage("[OPERADOR]", `Resuelto: ${eventCase.titulo}`, "#fca5a5");
		state.lastEventId = eventCase.id;
		state.currentCase = null;
		state.currentCaseVisible = false;
		state.currentCaseSource = null;
		state.caseCooldown = rand(8, 12);
		hideCaseUI();
		normalizeStats();
		updateHUD();
		if (state.publicAnger >= 100) {
			showEnding("lose");
			return;
		}
		if (state.metroFunction <= 0) {
			showEnding("lose");
			return;
		}
		beep(520, 0.05, "square", 0.03);
	}

	function getFocusStationName() {
		if (state.currentStation) return state.currentStation;
		if (state.selectedStationIndex !== null && stations[state.selectedStationIndex]) {
			return stations[state.selectedStationIndex].name;
		}
		return null;
	}

	function getCurrentCaseStationName() {
		if (!state.currentCase) return null;
		return state.currentCase.estacion || state.currentCase.station || state.currentCase.priority || null;
	}

	function canRevealCurrentCase() {
		if (!state.currentCase || state.currentCaseVisible) return false;
		if (state.selectedStationIndex === null || !stations[state.selectedStationIndex]) return false;
		const selectedStationName = stations[state.selectedStationIndex].name;
		const targetStationName = getCurrentCaseStationName();
		return Boolean(targetStationName && selectedStationName === targetStationName);
	}

	function revealCurrentCaseIfAtStation() {
		if (!state.currentCase || state.currentCaseVisible) return false;
		if (!canRevealCurrentCase()) return false;
		state.currentCaseVisible = true;
		showCaseUI(state.currentCase);
		pushMessage("[SISTEMA]", `Detalle habilitado en ${getCurrentCaseStationName()}. Presiona 1 o 2 para decidir.`, "#7dd3fc");
		beep(580, 0.06, "square", 0.03);
		return true;
	}

	function isAlejoKeyStation(stationName) {
		return Boolean(stationName && ALEJO_KEY_STATIONS.has(stationName));
	}

	function alejoChance(stationName, reason = "event") {
		if (!isAlejoKeyStation(stationName)) return 0;
		let chance = rand(0.10, 0.15);
		if (state.metroFunction >= 80 && state.publicAnger <= 25) chance += 0.12;
		if (state.metroFunction <= 25 || state.publicAnger >= 80) chance += 0.12;
		if (state.timer <= 60) chance += 0.12;
		if (reason === "enter") chance += 0.15;
		return clamp(chance, 0, 0.55);
	}

	function tryPushAlejoVoice(stationName, reason = "event") {
		const chance = alejoChance(stationName, reason);
		if (chance <= 0) return false;
		if (Math.random() > chance) return false;
		pushMessage("[VOZ DE ALEJO]", choice(ALEJO_WHISPERS), ui.purple);
		return true;
	}

	function pushEventComms(eventEntry) {
		const lines = eventCommsById[eventEntry.id] || [];
		for (const line of lines) {
			if (String(line.tag || "").includes("VOZ")) continue;
			pushMessage(line.tag, line.text, line.color || "#cbd5e1");
		}
		tryPushAlejoVoice(eventEntry.estacion, "event");
	}

	function eventTheme(eventEntry) {
		const text = `${eventEntry.titulo || ""} ${eventEntry.descripcion || ""}`.toLowerCase();
		if (/satura|andén|lleno|flujo|empujan|torniquete|acceso/.test(text)) return "manana";
		if (/falla|averiad|señal|altavoz|puerta|quemad|mochila|objeto/.test(text)) return "tarde";
		return "noche";
	}

	function spawnCase() {
		if (state.currentCase || state.caseCooldown > 0 || state.gameState !== "game") return;
		const timeBand = getTimeBand();
		const focusStation = getFocusStationName();
		const bandPool = eventCatalog.filter((event) => eventTheme(event) === timeBand);
		let pool = bandPool.length ? bandPool : eventCatalog;

		const nonRepeatIdPool = pool.filter((event) => event.id !== state.lastEventId);
		if (nonRepeatIdPool.length) pool = nonRepeatIdPool;

		if (state.sameStationStreak >= 2 && state.lastEventStation) {
			const antiStreakPool = pool.filter((event) => event.estacion !== state.lastEventStation);
			if (antiStreakPool.length) {
				pool = antiStreakPool;
			}
		} else if (focusStation) {
			const focusPool = pool.filter((event) => event.estacion === focusStation);
			const otherPool = pool.filter((event) => event.estacion !== focusStation);
			if (focusPool.length && (Math.random() < 0.7 || !otherPool.length)) {
				pool = focusPool;
			} else if (otherPool.length) {
				pool = otherPool;
			}
		}

		state.currentCase = choice(pool);
		state.currentCaseVisible = false;
		state.currentCaseSource = state.currentCase.id;
		if (state.currentCase.estacion === state.lastEventStation) {
			state.sameStationStreak += 1;
		} else {
			state.sameStationStreak = 1;
		}
		state.lastEventStation = state.currentCase.estacion;
		pushRecentCase(state.currentCase);
		pushMessage("[SISTEMA]", `Nuevo caso en ${state.currentCase.estacion}. Navega y presiona E para abrir detalle.`, "#fde68a");
		pushEventComms(state.currentCase);
	}

	function pushDynamicComms() {
		const timeBand = getTimeBand();
		const sourcePool = ["SISTEMA", "OPERADOR", "SEGURIDAD", "USUARIOS"];
		let source = choice(sourcePool);

		const messageBySource = {
			SISTEMA: [
				"Monitoreo operativo en tiempo real.",
				"Revisión automática de incidencias.",
				"Ajuste de intervalos en proceso.",
			],
			OPERADOR: [
				"Andén bajo observación.",
				"Se reporta presión de usuarios.",
				"Solicito apoyo de control central.",
			],
			SEGURIDAD: [
				"Recorrido preventivo en accesos.",
				"Control de pasillos en curso.",
				"Vigilancia reforzada en andén.",
			],
			USUARIOS: [
				"¿Por qué no avanza la fila?",
				"Necesitamos información clara.",
				"Hay demasiada gente en el andén.",
			],
		};

		const postfixByBand = {
			manana: "Afluencia alta de mañana.",
			tarde: "Se detectan fallas recurrentes.",
			noche: "Ambiente de tensión en estaciones.",
		};

		let color = "#cbd5e1";
		if (source === "SISTEMA") color = ui.green;
		if (source === "OPERADOR") color = ui.orange;
		if (source === "SEGURIDAD") color = ui.blue;
		if (source === "USUARIOS") color = ui.yellow;

		let text = choice(messageBySource[source]);
		text = `${text} ${postfixByBand[timeBand]}`;
		pushMessage(`[${source}]`, text, color);
		if (timeBand === "noche") {
			const focusStation = getFocusStationName() || getCurrentCaseStationName();
			if (focusStation && Math.random() < 0.35) {
				tryPushAlejoVoice(focusStation, "dynamic");
			}
		}
	}

	function normalizeStats() {
		state.publicAnger = clamp(state.publicAnger, 0, 100);
		state.metroSystem.stress = clamp(state.metroSystem.stress, 0, 100);
		state.metroSystem.unitsHealth = clamp(state.metroSystem.unitsHealth, 0, 100);
		state.metroSystem.price = clamp(state.metroSystem.price, 1, 10);
		state.metroFunction = clamp(state.metroFunction, 0, 100);
	}

	function nearestNpc() {
		let best = null;
		let bestDist = Infinity;
		for (const npc of stationNpcs) {
			const px = state.player.x + state.player.w / 2;
			const py = state.player.y + state.player.h / 2;
			const nx = npc.x + npc.w / 2;
			const ny = npc.y + npc.h / 2;
			const dist = Math.hypot(px - nx, py - ny);
			if (dist < 56 && dist < bestDist) {
				best = npc;
				bestDist = dist;
			}
		}
		return best;
	}

	function isMochilaEventActive() {
		if (state.currentStation !== "UNIVERSIDAD") return false;
		return true;
	}

	function nearestMochilaNpc() {
		if (!isMochilaEventActive()) return null;
		let best = null;
		let bestDist = Infinity;
		for (const npc of mochilaEventNpcs) {
			const px = state.player.x + state.player.w / 2;
			const py = state.player.y + state.player.h / 2;
			const nx = npc.x + npc.w / 2;
			const ny = npc.y + npc.h / 2;
			const dist = Math.hypot(px - nx, py - ny);
			if (dist < 64 && dist < bestDist) {
				best = npc;
				bestDist = dist;
			}
		}
		return best;
	}

	function handleMochilaInteraction() {
		if (!isMochilaEventActive()) return false;
		if (state.stationDialog.open) {
			state.stationDialog.open = false;
			state.stationDialog.text = "";
			state.stationDialog.npcId = null;
			return true;
		}
		const npc = nearestMochilaNpc();
		if (!npc) return false;
		state.stationDialog.open = true;
		state.stationDialog.text = npc.dialog;
		state.stationDialog.npcId = npc.id;
		return true;
	}

	function movePlayer(dt) {
		if (state.currentCase) return;
		let dx = 0;
		if (state.keys["arrowleft"] || state.keys["a"]) dx -= 1;
		if (state.keys["arrowright"] || state.keys["d"]) dx += 1;
		const accel = state.player.speed * 5.2;
		const drag = 0.84;
		state.player.vx += dx * accel * dt;
		state.player.vx *= Math.pow(drag, dt * 60);
		state.player.x += state.player.vx * dt;
		state.player.x = clamp(state.player.x, 30, 920 - state.player.w);
		state.player.y = 344;
		state.player.floatPhase += dt * 6;
	}

	function openNpcCase(npc) {
		if (state.currentCase) return;
		state.currentCase = npc.case;
		state.currentCaseSource = npc.id;
		pushRecentCase(npc.case);
		pushMessage("[NPC]", npc.case.text, "#a78bfa");
		showCaseUI(state.currentCase);
	}

	function showEnding(mode) {
		state.gameState = "ending";
		hud.classList.add("hidden");
		setPrompt("");
		hideCaseUI();
		endScreen.classList.remove("hidden");
		if (mode === "win") {
			endTitle.textContent = "Ganaste";
			endText.textContent = "Sobreviviste al Metro: el sistema se sostuvo, pero cada decisión dejó cicatrices.";
			beep(523, 0.1, "square", 0.04);
			setTimeout(() => beep(659, 0.09, "square", 0.03), 90);
			setTimeout(() => beep(784, 0.14, "square", 0.03), 180);
		} else if (mode === "mid") {
			endTitle.textContent = "Sobreviviste";
			endText.textContent = "El Metro siguió funcionando, pero la ciudad quedó muy insatisfecha.";
			beep(300, 0.08, "triangle", 0.03);
			setTimeout(() => beep(360, 0.08, "triangle", 0.03), 80);
		} else {
			endTitle.textContent = "Perdiste";
			endText.textContent = "El sistema colapsó bajo la presión de tus decisiones.";
			beep(180, 0.35, "sawtooth", 0.03);
		}
	}

	function resetGame() {
		state.timer = GAME_DURATION_SEC;
		state.worldTime = 0;
		state.caseCooldown = rand(2, 4);
		state.currentCase = null;
		state.currentCaseVisible = false;
		state.currentCaseSource = null;
		state.lastEventId = null;
		state.lastEventStation = null;
		state.sameStationStreak = 0;
		state.messageCooldown = 2;
		state.functionBias = 0;
		state.publicAnger = 28;
		state.metroSystem.stress = 34;
		state.metroSystem.unitsHealth = 74;
		state.metroSystem.price = 5;
		state.metroFunction = 62;
		state.recentCases = [];
		state.messageLog = [
			{ tag: "[SISTEMA]", text: "Centro de control operativo.", color: "#8b949e" },
			{ tag: "[SISTEMA]", text: "Esperando el primer caso.", color: "#7dd3fc" },
		];
		state.player.x = 110;
		state.player.y = 344;
		state.player.vx = 0;
		state.player.floatPhase = 0;
		state.stationDialog.open = false;
		state.stationDialog.text = "";
		state.stationDialog.npcId = null;
		normalizeStats();
		hideCaseUI();
		updateHUD();
	}

	function startIntro() {
		state.gameState = "intro";
		menuScreen.classList.add("hidden");
		introScreen.classList.remove("hidden");
		state.introIndex = 0;
		introText.textContent = introLines[state.introIndex];
		beep(420, 0.06, "square", 0.03);
	}

	function startGame() {
		state.gameState = "game";
		introScreen.classList.add("hidden");
		endScreen.classList.add("hidden");
		hud.classList.remove("hidden");
		setPrompt("Presiona E cerca de un NPC o espera el siguiente caso.");
		resetGame();
		pushMessage("[SISTEMA]", "Afluencia alta en Centro Médico. Se activó el turno de control.", "#a3e635");
		startAmbience();
		updateHUD();
	}

	function exitGame() {
		state.gameState = "exit";
		menuScreen.classList.add("hidden");
		introScreen.classList.add("hidden");
		hud.classList.add("hidden");
		endScreen.classList.remove("hidden");
		endTitle.textContent = "Salida";
		endText.textContent = "Gracias por visitar Encaminados.";
	}

	function renderWorld() {
		const t = state.metroFunction / 100;
		drawRect(0, 0, 960, 540, ui.bg);
		drawRect(0, 0, 960, 540, `rgba(12, 16, 22, ${0.22 + (1 - t) * 0.12})`);
		drawRect(0, 0, 960, 8, ui.line);

		// If inside a station, show station view
		if (state.currentStation === "UNIVERSIDAD") {
			const mochilaEventActive = true;
			universidadStationNodes.Mochila.visible = mochilaEventActive;

			if (stationBgReady) {
				ctx.drawImage(stationBg, 0, 0, 960, 540);
			} else {
				drawRect(0, 0, 960, 540, "rgba(0,0,0,0.8)");
				drawText("CARGANDO ESTACIÓN...", 480, 270, "#a3aab4", 10, 1);
			}

			// Draw ghost
			if (ghostReady) {
				const ghostWidth = 100;
				const ghostHeight = ghostSprite.naturalWidth
					? Math.round(ghostWidth * (ghostSprite.naturalHeight / ghostSprite.naturalWidth))
					: 100;
				ctx.save();
				ctx.imageSmoothingEnabled = false;
				ctx.drawImage(ghostSprite, state.player.x - Math.round(ghostWidth / 2), state.player.y - ghostHeight + 8, ghostWidth, ghostHeight);
				ctx.restore();
			}

			if (universidadStationNodes.Mochila.visible) {
				const mochilaNode = universidadStationNodes.Mochila;
				drawRect(mochilaNode.x, mochilaNode.y, mochilaNode.w, mochilaNode.h, "#1a1f28");
				drawRect(mochilaNode.x, mochilaNode.y, mochilaNode.w, 1, "rgba(255,255,255,0.15)");
				drawRect(mochilaNode.x, mochilaNode.y + mochilaNode.h - 1, mochilaNode.w, 1, "rgba(0,0,0,0.35)");
				drawRect(mochilaNode.x, mochilaNode.y, 1, mochilaNode.h, "rgba(255,255,255,0.08)");
				drawRect(mochilaNode.x + mochilaNode.w - 1, mochilaNode.y, 1, mochilaNode.h, "rgba(0,0,0,0.4)");
			}

			if (mochilaEventActive) {
				for (const npc of mochilaEventNpcs) {
					if (npc.id === "npc_trabajador_mochila" && trabajadorSpriteReady) {
						ctx.save();
						ctx.imageSmoothingEnabled = false;
						const spriteAspect = trabajadorSprite.naturalWidth && trabajadorSprite.naturalHeight
							? trabajadorSprite.naturalWidth / trabajadorSprite.naturalHeight
							: 0.62;
						const drawH = npc.h;
						const drawW = Math.round(drawH * spriteAspect);
						const offsetX = npc.x + Math.round((npc.w - drawW) / 2);
						const offsetY = npc.y + npc.h - drawH;
						ctx.drawImage(trabajadorSprite, offsetX, offsetY, drawW, drawH);
						ctx.restore();
					} else if (npc.id === "npc_estudiante_mochila" && estudianteSpriteReady) {
						ctx.save();
						ctx.imageSmoothingEnabled = false;
						const spriteAspect = estudianteSprite.naturalWidth && estudianteSprite.naturalHeight
							? estudianteSprite.naturalWidth / estudianteSprite.naturalHeight
							: 0.58;
						const drawH = npc.h;
						const drawW = Math.round(drawH * spriteAspect);
						const offsetX = npc.x + Math.round((npc.w - drawW) / 2);
						const offsetY = npc.y + npc.h - drawH;
						ctx.drawImage(estudianteSprite, offsetX, offsetY, drawW, drawH);
						ctx.restore();
					} else {
						drawRect(npc.x, npc.y, npc.w, npc.h, "rgba(10,14,20,0.92)");
						drawRect(npc.x, npc.y, npc.w, 1, ui.line);
						drawRect(npc.x, npc.y + npc.h - 1, npc.w, 1, ui.line);
						drawRect(npc.x, npc.y, 1, npc.h, ui.line);
						drawRect(npc.x + npc.w - 1, npc.y, 1, npc.h, ui.line);
					}
					if (npc.id !== "npc_trabajador_mochila" && npc.id !== "npc_estudiante_mochila") {
						drawText(npc.label, npc.x - 6, npc.y - 8, "#e5e7eb", 4, 1);
					}
				}

				const nearbyNpc = nearestMochilaNpc();
				if (nearbyNpc && !state.stationDialog.open) {
					drawRect(374, 470, 212, 24, "rgba(8,15,23,0.92)");
					drawRect(374, 470, 212, 1, ui.line);
					drawText("PRESIONA E PARA HABLAR", 388, 487, "#7dd3fc", 5, 1);
				}

				if (state.stationDialog.open) {
					drawRect(220, 418, 520, 90, "rgba(6, 10, 16, 0.95)");
					drawRect(220, 418, 520, 1, ui.line);
					drawRect(220, 507, 520, 1, ui.line);
					drawRect(220, 418, 1, 90, ui.line);
					drawRect(739, 418, 1, 90, ui.line);
					drawText("DIALOGO", 236, 438, "#f8fafc", 5, 1);
					const dialogLines = wrapCanvasText(state.stationDialog.text, 6, 1, 486, 3);
					dialogLines.forEach((line, index) => drawText(line, 236, 458 + index * 16, "#e5e7eb", 6, 1));
					drawText("PRESIONA E PARA CERRAR", 236, 496, "#93c5fd", 5, 1);
				}
			}

			// Draw HUD for station
			drawRect(8, 10, 944, 52, "#0e1218");
			drawRect(8, 10, 944, 52, "rgba(255,255,255,0.03)");
			drawRect(300, 16, 132, 40, "#070f17");
			drawRect(300, 16, 132, 1, "rgba(255,255,255,0.10)");
			drawRect(300, 55, 132, 1, "rgba(26,44,56,0.95)");
			drawRect(300, 16, 1, 40, "rgba(26,44,56,0.95)");
			drawRect(431, 16, 1, 40, "rgba(26,44,56,0.95)");
			drawText(formatStamp(), 312, 50, "#e5e7eb", 12, 1.08);
			return;
		}

		// top bar
		drawRect(8, 10, 944, 52, ui.panel);
		drawRect(8, 10, 944, 1, ui.line);
		drawRect(8, 61, 944, 1, ui.line);
		drawRect(8, 10, 1, 52, ui.line);
		drawRect(951, 10, 1, 52, ui.line);
		if (metroLogoReady) {
			const logoX = 8;
			const logoY = -3;
			const logoH = 82;
			const logoW = Math.round(logoH * (metroLogo.naturalWidth / metroLogo.naturalHeight));
			ctx.drawImage(metroLogo, logoX, logoY, logoW, logoH);
		} else {
			drawText("SISTEMA DE TRANSPORTE COLECTIVO", 30, 28, ui.text, 8, 1.08);
			drawText("CENTRO DE CONTROL", 30, 45, ui.text, 7, 1);
		}
		drawRect(300, 16, 132, 40, "#070f17");
		drawRect(300, 16, 132, 1, "rgba(255,255,255,0.10)");
		drawRect(300, 55, 132, 1, "rgba(26,44,56,0.95)");
		drawRect(300, 16, 1, 40, "rgba(26,44,56,0.95)");
		drawRect(431, 16, 1, 40, "rgba(26,44,56,0.95)");
		drawText(formatStamp(), 312, 50, ui.green, 12, 1.08);

		// top metrics
		const topMetrics = [
			{ label: "FUNCIÓN DEL METRO", value: Math.round(state.metroFunction), color: ui.green, x: 560 },
			{ label: "MOLESTIA PÚBLICA", value: Math.round(state.publicAnger), color: ui.red, x: 760 },
		];
		for (const metric of topMetrics) {
			const steppedValue = clamp(Math.round(metric.value / 10) * 10, 0, 100);
			const steppedWidth = Math.max(6, Math.min(168, steppedValue * 1.68));
			drawText(metric.label, metric.x + 4, 23, ui.text, 5, 1);
			drawRect(metric.x - 2, 28, 174, 24, "rgba(6, 11, 18, 0.95)");
			drawRect(metric.x - 2, 28, 174, 1, "rgba(255,255,255,0.10)");
			drawRect(metric.x - 2, 51, 174, 1, ui.line);
			drawRect(metric.x - 2, 28, 1, 24, ui.line);
			drawRect(metric.x + 171, 28, 1, 24, ui.line);

			ctx.save();
			ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
			ctx.shadowBlur = 8;
			drawRect(metric.x + 1, 32, steppedWidth, 16, metric.color);
			ctx.restore();

			for (let i = 1; i < 10; i += 1) {
				drawRect(metric.x + i * 17, 32, 1, 16, "rgba(0,0,0,0.35)");
			}

			drawRect(metric.x + 1, 32, steppedWidth, 3, "rgba(255,255,255,0.16)");
			ctx.save();
			ctx.textAlign = "right";
			drawText(`${steppedValue}%`, metric.x + 166, 44, metric.color, 14, 1.15);
			ctx.restore();
		}

		// left panel
		drawRect(8, 68, 215, 382, ui.panel);
		drawRect(8, 68, 215, 1, ui.line);
		drawRect(8, 449, 215, 1, ui.line);
		drawRect(8, 68, 1, 382, ui.line);
		drawRect(222, 68, 1, 382, ui.line);

		const incomingCount = state.recentCases.length + (state.currentCase ? 1 : 0);
		drawText("CASOS ENTRANTES", 22, 84, ui.text, 6, 1);
		drawRect(182, 73, 28, 20, "#4a0f10");
		drawRect(182, 73, 28, 1, ui.line);
		drawText(`${incomingCount}`, 192, 88, "#ff9b9b", 7, 1);

		const feed = state.recentCases.length ? state.recentCases.slice(0, 5) : [];
		const priorityColor = (priority) => {
			if (priority === "UNIVERSIDAD" || priority === "CENTRO MÉDICO") return { border: ui.green, text: ui.green, icon: ui.green };
			if (priority === "PANTITLÁN" || priority === "TACUBAYA") return { border: ui.orange, text: ui.orange, icon: ui.orange };
			if (priority === "HIDALGO") return { border: ui.yellow, text: ui.yellow, icon: ui.yellow };
			if (priority === "ZAPATA" || priority === "MIXCOAC") return { border: ui.blue, text: ui.blue, icon: ui.blue };
			return { border: "#31253a", text: ui.purple, icon: ui.purple };
		};

		feed.forEach((item, index) => {
			const y = 94 + index * 70;
			const colors = priorityColor(item.priority);
			const isActive = index === 0 && state.currentCase;
			const titleLines = wrapCanvasText(item.title, 5, 1, 158, 2);

			drawRect(12, y, 206, 66, "#060c12");
			drawRect(12, y, 206, 1, isActive ? ui.red : ui.line);
			drawRect(12, y + 65, 206, 1, isActive ? ui.red : ui.line);
			drawRect(12, y, 1, 66, isActive ? ui.red : ui.line);
			drawRect(217, y, 1, 66, isActive ? ui.red : ui.line);
			if (isActive) drawRect(13, y + 1, 204, 64, "rgba(255, 43, 43, 0.07)");

			drawRect(20, y + 12, 20, 20, "rgba(0,0,0,0.35)");
			drawText("▲", 25, y + 27, colors.icon, 7, 1);
			drawText(item.stamp, 48, y + 24, ui.muted, 6, 1);
			drawText(titleLines[0] || "", 48, y + 41, ui.text, 5, 1);
			drawText(titleLines[1] || "", 48, y + 51, ui.text, 5, 1);
			drawText(item.priority, 48, y + 63, colors.text, 6, 1);
		});

		if (!feed.length) {
			drawRect(12, 98, 206, 66, "rgba(9, 14, 20, 0.95)");
			drawRect(13, 99, 204, 2, "rgba(255,255,255,0.08)");
			drawText("SIN AVISOS POR AHORA", 24, 136, "#7dd3fc", 6, 1);
		}

		drawRect(12, 420, 206, 24, "#070e15");
		drawRect(12, 420, 206, 1, ui.line);
		drawRect(12, 443, 206, 1, ui.line);
		drawText("VER HISTORIAL", 75, 436, ui.text, 6, 1);
		drawText("⌄", 182, 436, ui.muted, 8, 1);

		// center map
		drawRect(222, 68, 530, 382, ui.panel);
		drawRect(222, 68, 530, 1, ui.line);
		drawRect(222, 449, 530, 1, ui.line);
		drawRect(222, 68, 1, 382, ui.line);
		drawRect(751, 68, 1, 382, ui.line);
		drawRect(236, 104, 504, 320, "#061018");
		drawRect(236, 104, 504, 1, ui.line);
		drawRect(236, 423, 504, 1, ui.line);
		drawRect(236, 104, 1, 320, ui.line);
		drawRect(739, 104, 1, 320, ui.line);
		if (networkMapReady) {
			ctx.imageSmoothingEnabled = false;
			ctx.drawImage(networkMap, 236, 104, 504, 320);
			ctx.imageSmoothingEnabled = true;
		} else {
			drawRect(236, 104, 504, 320, "rgba(255,255,255,0.05)");
			drawText("CARGANDO MAPA...", 392, 264, "#a3aab4", 7, 1);
		}

		const mapLabel = (text, x, y, size = 7, align = "left", color = "rgb(248, 250, 252)") => {
			ctx.save();
			ctx.textAlign = align;
			ctx.textBaseline = "middle";
			drawText(text, x, y, color, size, 1);
			ctx.restore();
		};

		const stationGuideColor = (line) => {
			if (line === 3) return "rgba(144, 193, 65, 0.95)";
			if (line === 9) return "rgba(207, 93, 33, 0.95)";
			if (line === 12) return "rgba(236, 188, 83, 0.95)";
			if (line === "3-9" || line === "3-12") return "rgba(248, 250, 252, 0.95)";
			return "rgba(248, 250, 252, 0.95)";
		};

		const stationGlowColor = (line) => {
			if (line === 3) return { core: "rgba(205, 255, 122, 0.95)", mid: "rgba(144, 193, 65, 0.55)", outer: "rgba(144, 193, 65, 0)" };
			if (line === 9) return { core: "rgba(255, 177, 101, 0.95)", mid: "rgba(207, 93, 33, 0.52)", outer: "rgba(207, 93, 33, 0)" };
			if (line === 12) return { core: "rgba(255, 228, 138, 0.95)", mid: "rgba(236, 188, 83, 0.5)", outer: "rgba(236, 188, 83, 0)" };
			return { core: "rgba(248, 250, 252, 0.95)", mid: "rgba(248, 250, 252, 0.45)", outer: "rgba(248, 250, 252, 0)" };
		};

		const drawStationGuide = (station) => {
			ctx.save();
			ctx.lineWidth = 2;
			ctx.strokeStyle = stationGuideColor(station.line);
			ctx.fillStyle = "rgba(8, 11, 16, 0.9)";
			ctx.beginPath();
			ctx.arc(station.nodeX, station.nodeY, 8, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
			ctx.restore();
		};

		for (const station of stations) {
			drawStationGuide(station);
		}

		// Draw blinking red event beacon on active case station
		const caseStationName = getCurrentCaseStationName();
		if (caseStationName) {
			const caseStation = stations.find((station) => station.name === caseStationName);
			if (caseStation) {
				const blinkOn = Math.floor(state.worldTime * 3.2) % 2 === 0;
				if (blinkOn) {
					ctx.save();
					const bx = caseStation.nodeX;
					const by = caseStation.nodeY;
					const beacon = ctx.createRadialGradient(bx, by, 0, bx, by, 22);
					beacon.addColorStop(0, "rgba(255, 43, 43, 0.95)");
					beacon.addColorStop(0.45, "rgba(255, 43, 43, 0.45)");
					beacon.addColorStop(1, "rgba(255, 43, 43, 0)");
					ctx.fillStyle = beacon;
					ctx.shadowColor = "rgba(255, 43, 43, 0.7)";
					ctx.shadowBlur = 10;
					ctx.beginPath();
					ctx.arc(bx, by, 16, 0, Math.PI * 2);
					ctx.fill();
					ctx.restore();
				}
			}
		}

		mapLabel("LÍNEA 3", 305, 355, 8, "center", "rgb(144, 193, 65)");
		mapLabel("LÍNEA 9", 305, 367, 8, "center", "rgb(207, 93, 33)");
		mapLabel("LÍNEA 12", 307, 380, 8, "center", "rgb(236, 188, 83)");
		mapLabel("TRANSBORDO", 313, 393, 8, "center", "rgb(248, 250, 252)");

		mapLabel("INDIOS VERDES", stations[0].labelX, stations[0].labelY, 8, "left");
		mapLabel("HIDALGO", stations[1].labelX, stations[1].labelY, 8, "left");
		mapLabel("CENTRO MÉDICO", stations[2].labelX, stations[2].labelY, 8, "left");
		mapLabel("ZAPATA", stations[3].labelX, stations[3].labelY, 8, "left");
		mapLabel("VIVEROS DE COYOACÁN", stations[4].labelX, stations[4].labelY, 8, "left");
		mapLabel("UNIVERSIDAD", stations[5].labelX, stations[5].labelY, 8, "left");

		mapLabel("PANTITLÁN", stations[6].labelX, stations[6].labelY, 8, "center");
		mapLabel("CHILPANCINGO", stations[7].labelX, stations[7].labelY, 8, "center");
		mapLabel("TACUBAYA", stations[8].labelX, stations[8].labelY, 8, "center");
		mapLabel("MIXCOAC", stations[9].labelX, stations[9].labelY, 8, "right");
		mapLabel("ERMITA", stations[10].labelX, stations[10].labelY, 8, "left");
		mapLabel("TLÁHUAC", stations[11].labelX, stations[11].labelY, 8, "left");

		// Draw selected station marker
		const activeStation = state.currentStation
			? stations.find((station) => station.name === state.currentStation)
			: state.selectedStationIndex !== null
				? stations[state.selectedStationIndex]
				: null;
		if (activeStation) {
			const markerX = activeStation.nodeX;
			const markerY = activeStation.nodeY;
			const glowColor = stationGlowColor(activeStation.line);
			ctx.save();
			const glow = ctx.createRadialGradient(markerX, markerY, 0, markerX, markerY, 18);
			glow.addColorStop(0, glowColor.core);
			glow.addColorStop(0.45, glowColor.mid);
			glow.addColorStop(1, glowColor.outer);
			ctx.fillStyle = glow;
			ctx.shadowColor = glowColor.mid;
			ctx.shadowBlur = 8;
			ctx.beginPath();
			ctx.arc(markerX, markerY, 14, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}

		// right detail panel
		drawRect(760, 68, 192, 382, ui.panel);
		drawRect(760, 68, 192, 1, ui.line);
		drawRect(760, 449, 192, 1, ui.line);
		drawRect(760, 68, 1, 382, ui.line);
		drawRect(951, 68, 1, 382, ui.line);
		drawText("DETALLE DEL CASO", 772, 88, ui.text, 5, 1);
		if (state.currentCase) {
			if (!state.currentCaseVisible) {
				const lockStation = getCurrentCaseStationName() || "ESTACIÓN";
				drawRect(772, 102, 36, 24, "#ef4444");
				drawText("!", 784, 119, "#111827", 12);
				drawText("CASO BLOQUEADO", 816, 112, "#f59e0b", 5);
				drawText(lockStation, 816, 131, "#9aa3af", 5);
				drawText("NAVEGA A LA ESTACIÓN", 772, 164, "#e5e7eb", 5);
				drawText("CORRECTA Y PRESIONA E", 772, 178, "#e5e7eb", 5);
				drawText("PARA VER DETALLE.", 772, 192, "#e5e7eb", 5);
				drawText("OBJETIVO:", 772, 220, "#8b949e", 4);
				drawText(lockStation, 772, 236, "#7dd3fc", 6);
			} else {
			const isEventCase = Boolean(state.currentCase.opcionA && state.currentCase.opcionB);
			const desc = isEventCase ? (state.currentCase.descripcion || "") : (state.currentCase.text || "");
			const descLines = wrapCanvasText(desc, 5, 1, 160, 5);
			const detailsStartY = 164;
			const actionsY = detailsStartY + descLines.length * 14 + 10;
			drawRect(772, 102, 36, 24, "#ef4444");
			drawText("!", 784, 119, "#111827", 12);
			if (isEventCase) {
				drawText(state.currentCase.estacion || "EVENTO", 816, 112, "#f59e0b", 5);
				drawText("CASO", 816, 131, "#9aa3af", 5);
				descLines.forEach((line, i) => drawText(line, 772, detailsStartY + i * 14, "#e5e7eb", 5, 1));
				drawText("ACCIONES", 772, actionsY, "#8b949e", 4);
				drawRect(770, actionsY + 12, 168, 28, "rgba(34,197,94,0.12)");
				drawRect(770, actionsY + 46, 168, 28, "rgba(245,158,11,0.12)");
				drawText(wrapCanvasText(`A) ${state.currentCase.opcionA}`, 4, 1, 154, 1)[0], 778, actionsY + 31, "#86efac", 4);
				drawText(wrapCanvasText(`B) ${state.currentCase.opcionB}`, 4, 1, 154, 1)[0], 778, actionsY + 65, "#fbbf24", 4);
				drawText("ELEGIR OPCIÓN", 772, actionsY + 102, "#8b949e", 4);
			} else {
				drawText(state.currentCase.priority || "MEDIA", 816, 112, state.currentCase.priority === "URGENTE" ? "#ef4444" : "#f59e0b", 6);
				drawText(state.currentCase.tag ? state.currentCase.tag.toUpperCase() : "CASO", 816, 131, "#9aa3af", 5);
				descLines.forEach((line, i) => drawText(line, 772, detailsStartY + i * 14, "#e5e7eb", 5, 1));
				drawText("ACCIONES", 772, actionsY, "#8b949e", 4);
				drawRect(770, actionsY + 12, 168, 28, "rgba(34,197,94,0.12)");
				drawRect(770, actionsY + 46, 168, 28, "rgba(245,158,11,0.12)");
				drawText(wrapCanvasText((state.currentCase.options?.[0]?.text || "OPCIÓN A").toUpperCase(), 4, 1, 154, 1)[0], 778, actionsY + 31, "#86efac", 4);
				drawText(wrapCanvasText((state.currentCase.options?.[1]?.text || "OPCIÓN B").toUpperCase(), 4, 1, 154, 1)[0], 778, actionsY + 65, "#fbbf24", 4);
				drawText("ELEGIR OPCIÓN", 772, actionsY + 102, "#8b949e", 4);
			}
			}
		} else {
			drawText("Sin caso activo.", 772, 118, "#7dd3fc", 5);
			drawText("La red espera otra decisión.", 772, 138, "#cbd5e1", 4);
		}

		// bottom messages
		drawRect(8, 456, 944, 76, ui.panel);
		drawRect(8, 456, 944, 1, ui.line);
		drawRect(8, 531, 944, 1, ui.line);
		drawRect(8, 456, 1, 76, ui.line);
		drawRect(951, 456, 1, 76, ui.line);
		drawText("COMUNICACIONES / MENSAJES", 22, 476, ui.text, 6, 1);
		const messages = state.messageLog.slice(-5);
		messages.forEach((msg, index) => {
			const y = 494 + index * 11;
			const stamp = getWorkdayClock(-(messages.length - 1 - index) * 2);
			const tagRaw = String(msg.tag || "[SISTEMA]").replace(/\[|\]/g, "");
			const tagLabel = `[${tagRaw}]`;
			let tagColor = ui.green;
			if (tagRaw.includes("OPERADOR")) tagColor = ui.orange;
			else if (tagRaw.includes("POLIC")) tagColor = ui.blue;
			else if (tagRaw.includes("SEGURIDAD")) tagColor = ui.blue;
			else if (tagRaw.includes("VOZ")) tagColor = ui.purple;
			else if (tagRaw.includes("USUARIOS")) tagColor = ui.yellow;
			else if (tagRaw.includes("USUARIO")) tagColor = ui.yellow;
			else if (tagRaw.includes("ALEJO")) tagColor = ui.purple;
			else if (tagRaw.includes("NPC")) tagColor = ui.purple;

			drawText(stamp, 22, y, ui.muted, 5, 1);
			drawText(tagLabel, 64, y, tagColor, 5, 1);

			ctx.save();
			const readableSize = Math.max(8, Math.round(5 * 1));
			ctx.font = `${readableSize}px "Courier New", monospace`;
			const tagWidth = Math.ceil(ctx.measureText(tagLabel.toUpperCase()).width);
			ctx.restore();

			const messageX = 64 + tagWidth + 10;
			const messageMaxWidth = Math.max(40, 944 - messageX - 14);
			const messageLine = wrapCanvasText(msg.text || "", 5, 1, messageMaxWidth, 1)[0] || "";
			drawText(messageLine, messageX, y, ui.text, 5, 1);
		});

		// if no current case prompt
		if (!state.currentCase) {
			const near = nearestNpc();
			if (near) {
				setPrompt(`Presiona E para tomar el caso de ${near.label}`);
			} else {
				setPrompt("Espera un caso o acércate a un NPC.");
			}
		}
	}

	function update(dt) {
		if (state.gameState !== "game") return;

		state.timer = Math.max(0, state.timer - dt);
		state.worldTime += dt;

		if (!state.currentCase) {
			state.caseCooldown -= dt;
			if (state.caseCooldown <= 0) {
				spawnCase();
			}
			movePlayer(dt);
		}

		state.messageCooldown -= dt;
		if (state.messageCooldown <= 0) {
			pushDynamicComms();
			state.messageCooldown = rand(4, 9);
		}

		if (!isMochilaEventActive() && state.stationDialog.open) {
			state.stationDialog.open = false;
			state.stationDialog.text = "";
			state.stationDialog.npcId = null;
		}
		if (!isMochilaEventActive()) {
			universidadStationNodes.Mochila.visible = false;
		}
		normalizeStats();

		if (state.publicAnger >= 100) {
			showEnding("lose");
			return;
		}

		if (state.metroFunction <= 0) {
			showEnding("lose");
			return;
		}

		if (state.timer <= 0) {
			if (state.metroFunction >= 70 && state.publicAnger <= 35) {
				showEnding("win");
			} else if (state.metroFunction >= 35) {
				showEnding("mid");
			} else {
				showEnding("lose");
			}
			return;
		}

		updateHUD();
	}

	function frame(ts) {
		const dt = Math.min((ts - lastTime) / 1000, 0.05);
		lastTime = ts;
		renderWorld();
		update(dt);
		requestAnimationFrame(frame);
	}

	function normalizeInputKey(e) {
		const raw = (e.key || "").toLowerCase();
		if (e.code === "ArrowLeft") return "arrowleft";
		if (e.code === "ArrowRight") return "arrowright";
		if (e.code === "ArrowUp") return "arrowup";
		if (e.code === "ArrowDown") return "arrowdown";
		return raw;
	}

	function navigateStations(direction) {
		if (state.selectedStationIndex === null) {
			state.selectedStationIndex = 0;
			beep(520, 0.08, "sine", 0.02);
			return;
		}

		if (state.selectedStationIndex < 0 || state.selectedStationIndex >= stations.length) {
			state.selectedStationIndex = 0;
		}

		const currentStation = stations[state.selectedStationIndex];
		const candidates = stations
			.map((station, index) => ({ station, index }))
			.filter(({ station }) => {
				if (direction === "arrowup") return station.nodeY < currentStation.nodeY;
				if (direction === "arrowdown") return station.nodeY > currentStation.nodeY;
				if (direction === "arrowleft") return station.nodeX < currentStation.nodeX;
				if (direction === "arrowright") return station.nodeX > currentStation.nodeX;
				return false;
			});

		let nextIndex = state.selectedStationIndex;
		if (candidates.length) {
			candidates.sort((a, b) => {
				const aDistance = Math.hypot(a.station.nodeX - currentStation.nodeX, a.station.nodeY - currentStation.nodeY);
				const bDistance = Math.hypot(b.station.nodeX - currentStation.nodeX, b.station.nodeY - currentStation.nodeY);
				return aDistance - bDistance;
			});
			nextIndex = candidates[0].index;
		}

		if (nextIndex !== state.selectedStationIndex) {
			state.selectedStationIndex = nextIndex;
			beep(520, 0.08, "sine", 0.02);
		}
	}

	function enterStation() {
		if (state.selectedStationIndex === null) return;
		
		const station = stations[state.selectedStationIndex];
		if (station.name === "UNIVERSIDAD") {
			state.player.x = 330;
			state.player.y = 338;
			state.currentStation = station.name;
			state.selectedStationIndex = stations.findIndex((item) => item.name === station.name);
			beep(600, 0.1, "sine", 0.03);
			pushMessage("[SISTEMA]", `Entraste a ${station.name}`, "#7dd3fc");
			tryPushAlejoVoice(station.name, "enter");
		}
	}

	function exitStation() {
		if (!state.currentStation) return;
		const stationName = state.currentStation;
		state.currentStation = null;
		state.stationDialog.open = false;
		state.stationDialog.text = "";
		state.stationDialog.npcId = null;
		if (state.selectedStationIndex === null || stations[state.selectedStationIndex]?.name !== stationName) {
			const idx = stations.findIndex((item) => item.name === stationName);
			if (idx >= 0) state.selectedStationIndex = idx;
		}
		beep(420, 0.08, "sine", 0.03);
		pushMessage("[SISTEMA]", `Saliste de ${stationName}`, "#7dd3fc");
	}

	window.addEventListener("keydown", (e) => {
		const key = normalizeInputKey(e);
		if (["arrowleft", "arrowright", "arrowup", "arrowdown", "e", " ", "1", "2", "q", "escape"].includes(key)) e.preventDefault();
		state.keys[key] = true;

		if (state.gameState === "game") {
			if ((key === "q" || key === "escape") && state.currentStation) {
				exitStation();
				return;
			}

			if (state.currentStation) {
				if (key === "e") {
					if (handleMochilaInteraction()) {
						beep(560, 0.05, "square", 0.03);
					} else {
						beep(260, 0.04, "square", 0.02);
					}
				}
				return;
			}

			if (state.currentCaseVisible && key === "1") {
				resolveCase("A");
				return;
			}
			if (state.currentCaseVisible && key === "2") {
				resolveCase("B");
				return;
			}

			if (key === "arrowup" || key === "arrowdown" || key === "arrowleft" || key === "arrowright") {
				navigateStations(key);
			}
			if (key === "e") {
				if (state.currentCase) {
					if (!revealCurrentCaseIfAtStation()) {
						beep(260, 0.04, "square", 0.02);
					}
				} else if (state.selectedStationIndex !== null) {
					enterStation();
				} else {
					const near = nearestNpc();
					if (near) {
						openNpcCase(near);
						setPrompt("");
						beep(480, 0.05, "square", 0.03);
					}
				}
			}
		}
	});

	window.addEventListener("keyup", (e) => {
		state.keys[normalizeInputKey(e)] = false;
	});

	document.getElementById("playBtn").addEventListener("click", () => {
		ensureAudio();
		if (audioCtx.state === "suspended") audioCtx.resume();
		startIntro();
	});

	document.getElementById("exitBtn").addEventListener("click", () => {
		ensureAudio();
		if (audioCtx.state === "suspended") audioCtx.resume();
		exitGame();
	});

	document.getElementById("nextIntroBtn").addEventListener("click", () => {
		ensureAudio();
		if (audioCtx.state === "suspended") audioCtx.resume();
		state.introIndex += 1;
		beep(430, 0.05, "square", 0.03);
		if (state.introIndex >= introLines.length) {
			startGame();
		} else {
			introText.textContent = introLines[state.introIndex];
		}
	});

	document.getElementById("restartBtn").addEventListener("click", () => {
		ensureAudio();
		if (audioCtx.state === "suspended") audioCtx.resume();
		menuScreen.classList.remove("hidden");
		introScreen.classList.add("hidden");
		endScreen.classList.add("hidden");
		state.gameState = "menu";
	});

	// Hover state? not necessary
	resetGame();
	updateHUD();
	requestAnimationFrame((t) => {
		lastTime = t;
		frame(t);
	});
})();
