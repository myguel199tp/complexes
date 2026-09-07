export interface CameraResponse {
  id: string;
  name: string;
  location?: string;
  brand: string;
  host: string;
  rtspPort: number;
  rtspPath: string;
  transcode: boolean;
  isActive: boolean;
  /** Si esta cámara guarda video en continuo. */
  recordingEnabled: boolean;
  /** El backend nunca devuelve la contraseña; sólo si hay una guardada. */
  hasPassword?: boolean;
  hasRtspUrlOverride?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StartStreamResponse {
  cameraId: string;
  type: "hls";
  /** Ruta relativa devuelta por el backend, ej: /camera/:id/stream/index.m3u8 */
  playlistUrl: string;
}

export interface CreateCameraRequest {
  name: string;
  location?: string;
  brand?: string;
  host: string;
  rtspPort?: number;
  rtspPath?: string;
  username?: string;
  password?: string;
  rtspUrlOverride?: string;
  transcode?: boolean;
  isActive?: boolean;
  recordingEnabled?: boolean;
}

/** Campos editables de una cámara ya creada. */
export type UpdateCameraRequest = Partial<CreateCameraRequest>;

/** Marca soportada por el backend, con su puerto y ruta RTSP de fábrica. */
export interface CameraBrandResponse {
  key: string;
  label: string;
  defaultPort: number;
  mainPath: string;
  subPath?: string;
  examples: string[];
  alsoKnownAs?: string[];
  notes?: string;
}
