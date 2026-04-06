/**
 * Motor de Sonido Retro 8-bit — Web Audio API
 * Sintetizador de onda cuadrada (square wave) sin dependencias externas.
 *
 * Maneja automáticamente el "unlock" del AudioContext que requieren los browsers
 * (necesita al menos un click/interacción del usuario antes del primer sonido).
 */

let ctx: AudioContext | null = null;
let unlocked = false;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return ctx;
}

/** Resume context on first user interaction (browser requirement) */
export function unlockAudio(): void {
  if (unlocked) return;
  try {
    const c = getCtx();
    if (c.state === "suspended") {
      c.resume();
    }
    // Play a silent buffer to fully unlock
    const buf = c.createBuffer(1, 1, 22050);
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    src.start(0);
    unlocked = true;
  } catch {
    // Web Audio not supported
  }
}

/* ─── HELPERS ─────────────────────────────────────────── */

function playTone(
  freq: number,
  duration: number,
  volume: number = 0.08,
  type: OscillatorType = "square",
  delay: number = 0,
): void {
  try {
    const c = getCtx();
    if (c.state === "suspended") return;

    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);

    gain.gain.setValueAtTime(volume, c.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(c.destination);

    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + duration);
  } catch {
    // Silently fail
  }
}

/* ─── PUBLIC SFX ──────────────────────────────────────── */

/**
 * playBlip — Bip corto y agudo (notificación de log)
 * Un pulso rápido a frecuencia alta, tipo Game Boy
 */
export function playBlip(): void {
  playTone(880, 0.06, 0.05, "square");
}

/**
 * playTyping — Ruido mecánico de teclado, tono bajo y ultra rápido
 * Simula una tecla de máquina de escribir
 */
export function playTyping(): void {
  const freq = 120 + Math.random() * 60; // Slight variation each time
  playTone(freq, 0.03, 0.04, "square");
}

/**
 * playSuccess — Mini jingle de victoria (arpegio de 4 notas)
 * Estilo "moneda de Mario" / "level up"
 */
export function playSuccess(): void {
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6 (major arpeggio)
  notes.forEach((freq, i) => {
    playTone(freq, 0.12, 0.06, "square", i * 0.1);
  });
}

/**
 * playError — Dos tonos descendentes (buzz de error)
 */
export function playError(): void {
  playTone(330, 0.15, 0.06, "square", 0);
  playTone(220, 0.2, 0.06, "square", 0.15);
}

/**
 * playTaskSent — Confirmación de envío (bip ascendente corto)
 */
export function playTaskSent(): void {
  playTone(440, 0.08, 0.05, "square", 0);
  playTone(660, 0.08, 0.05, "square", 0.08);
}

/* ─── TYPING LOOP (for active agents) ────────────────── */

let typingInterval: ReturnType<typeof setInterval> | null = null;

/**
 * startTypingLoop — Inicia sonido de tecleo repetido mientras hay agentes activos
 */
export function startTypingLoop(): void {
  if (typingInterval) return; // Already running
  typingInterval = setInterval(() => {
    playTyping();
  }, 150 + Math.random() * 100);
}

/**
 * stopTypingLoop — Detiene el loop de tecleo
 */
export function stopTypingLoop(): void {
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }
}
