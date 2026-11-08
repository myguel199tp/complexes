/**
 * Timbre corto de aviso, generado con Web Audio.
 *
 * Los modales del panel reproducían `/sounds/notification.mp3`, un archivo que
 * nunca existió en `public/`: el `catch` vacío se tragaba el error y los avisos
 * salían en silencio. Generado aquí no depende de ningún archivo.
 *
 * El navegador solo deja sonar después de que la persona haya interactuado con
 * la página; si todavía no lo hizo, no suena y no pasa nada más.
 */
export function playNotificationChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    // Dos notas ascendentes: se distingue de un error y no asusta.
    [880, 1320].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * 0.18;

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);

      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.4);
    });

    setTimeout(() => void ctx.close().catch(() => {}), 1000);
  } catch {
    // Sin audio disponible: el modal se muestra igual.
  }
}
