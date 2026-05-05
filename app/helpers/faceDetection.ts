import * as faceapi from "face-api.js";

let loaded = false;

export async function loadFaceModel() {
  if (loaded) return;

  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  loaded = true;
}

export async function detectFace(img: HTMLImageElement) {
  await loadFaceModel();

  const result = await faceapi.detectAllFaces(
    img,
    new faceapi.TinyFaceDetectorOptions(),
  );

  return result.length > 0;
}
