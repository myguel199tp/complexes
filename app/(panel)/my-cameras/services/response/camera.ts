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

/** De dónde sale que una placa tiene que ver con el conjunto. */
export type PlateMatchKind =
  | "resident"
  | "parking_rental"
  | "visit"
  | "access_pass";

export interface PlateMatch {
  kind: PlateMatchKind;
  plate: string;
  /** "Torre 2 · Apto 302", o null si el registro no la tiene. */
  unit: string | null;
  name: string | null;
  /** Lo que el portero necesita para decidir, en una línea. */
  detail: string;
}

/**
 * - `registered`: vehículo de alguien del conjunto o con celda arrendada.
 * - `expected`: no vive aquí, pero hay una visita anotada o un pase vigente.
 * - `unknown`: nada la respalda.
 */
export type PlateVerdict = "registered" | "expected" | "unknown";

export interface PlateCheckResponse {
  plate: string;
  colombianFormat: boolean;
  verdict: PlateVerdict;
  matches: PlateMatch[];
  /** Del conjunto y parecidas: la lectura pudo confundir un carácter. */
  similar: PlateMatch[];
}

export interface PlateReadResult extends PlateCheckResponse {
  /** El modelo dudó de algún carácter: hay que mirar la foto. */
  doubtful: boolean;
}

export interface PlateReadResponse {
  cameraId: string;
  cameraName: string;
  readAt: string;
  /** La foto que se leyó, como data URL. */
  image: string;
  /** Por qué no se leyó, o qué advertir aunque se leyera. */
  reason: string | null;
  results: PlateReadResult[];
}

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
