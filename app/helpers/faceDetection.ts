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
