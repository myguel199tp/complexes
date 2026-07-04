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
  const model = await loadDetector();

  const result = model.detect(img);

  return result.detections.length > 0;
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
