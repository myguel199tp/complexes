import { FilesetResolver, FaceDetector } from "@mediapipe/tasks-vision";

let detector: FaceDetector | null = null;

export async function loadDetector() {
  if (detector) return detector;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
  );

  detector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
    },
    runningMode: "IMAGE",
  });

  return detector;
}

export async function detectFace(img: HTMLImageElement) {
  return (await countFaces(img)) > 0;
}

/**
 * Cuántos rostros hay en el fotograma.
 *
 * Acepta también `<video>` y `<canvas>` —el modelo trabaja igual sobre
 * cualquiera de los tres— porque validar una foto ya tomada llega tarde para
 * quien se está encuadrando: con el vídeo en vivo se le puede decir "no te veo"
 * antes de que dispare.
 *
 * Devuelve el número y no un booleano porque "ninguno" y "varios" son fallos
 * distintos y quien pide una foto de identidad tiene que poder distinguirlos.
 */
export async function countFaces(
  source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
): Promise<number> {
  const model = await loadDetector();

  return model.detect(source).detections.length;
}

/**
 * Valida que el archivo de imagen contenga una persona (rostro detectable).
 * Devuelve true si se detecta al menos un rostro.
 */
export async function validatePersonImage(file: File): Promise<boolean> {
  const fileUrl = URL.createObjectURL(file);

  try {
    const img = new Image();
    img.src = fileUrl;
    // más estable que onload
    await img.decode();

    return await detectFace(img);
  } finally {
    URL.revokeObjectURL(fileUrl);
  }
}
