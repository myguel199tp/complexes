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
}
