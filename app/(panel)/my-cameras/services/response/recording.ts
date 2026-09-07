/** Un segmento grabado, tal como lo lista el backend. */
export interface RecordingResponse {
  id: string;
  cameraId: string;
  cameraName: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  sizeBytes: number;
}

export interface RecordingListResponse {
  total: number;
  limit: number;
  offset: number;
  items: RecordingResponse[];
}

export interface RecordingDay {
  /** `YYYY-MM-DD`. */
  day: string;
  count: number;
}

/** Estado del segundo factor que abre el archivo. */
export interface RecordingAccessResponse {
  unlocked: boolean;
  sessionExpiresAt: string | null;
}

export interface RequestOtpResponse {
  message: string;
  /** Correo enmascarado, para decir a dónde se envió sin exponerlo. */
  email: string;
  expiresInSeconds: number;
}

export interface VerifyOtpResponse {
  message: string;
  sessionExpiresAt: string;
  expiresInSeconds: number;
}

/** Consumo del servicio y lo que se facturaría por él. */
export interface RecordingUsageResponse {
  enabled: boolean;
  retentionDays: number;
  maxStorageGb: number;
  camerasRecording: number;
  recordings: number;
  storageBytes: number;
  storageGb: number;
  storageUsedPercent: number;
  hoursStored: number;
  oldestRecordingAt: string | null;
  billing: {
    /** Mientras sea `true`, el importe se muestra pero no se cobra. */
    simulated: boolean;
    currency: string;
    pricePerCameraMonth: number;
    estimatedMonthlyAmount: number;
  };
}

export interface RecordingAccessLogItem {
  id: string;
  recordingId: string;
  cameraId: string;
  cameraName?: string;
  userId: string;
  userEmail?: string;
  recordingStartedAt: string;
  ip?: string;
  createdAt: string;
}

export interface RecordingAccessLogResponse {
  total: number;
  limit: number;
  offset: number;
  items: RecordingAccessLogItem[];
}

export interface RecordingQuery {
  cameraId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}
