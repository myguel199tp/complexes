import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendMessage } from "@/app/helpers/backendError";
import {
  CaseDetail,
  CaseSummary,
  CommitteeCandidate,
  CommitteeMember,
  ConvivenciaMe,
  CreateCaseRequest,
  SanctionRequest,
} from "./convivenciaTypes";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/convivencia`;

async function request<T>(
  conjuntoId: string,
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const response = await fetchWithAuth(`${BASE}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  if (!response.ok) {
    throw new Error(backendMessage(await response.text()));
  }

  return response.json();
}

const id = (value: string) => encodeURIComponent(value);

export const convivenciaApi = {
  me: (c: string) => request<ConvivenciaMe>(c, "/me"),

  members: (c: string) => request<CommitteeMember[]>(c, "/members"),
  candidates: (c: string) => request<CommitteeCandidate[]>(c, "/members/candidates"),
  addMember: (c: string, body: { userId: string; periodStart?: string; periodEnd?: string }) =>
    request<CommitteeMember[]>(c, "/members", { method: "POST", body }),
  removeMember: (c: string, userId: string) =>
    request<CommitteeMember[]>(c, `/members/${id(userId)}`, { method: "DELETE" }),

  list: (c: string, status?: string) =>
    request<CaseSummary[]>(c, `/cases${status ? `?status=${id(status)}` : ""}`),
  get: (c: string, caseId: string) => request<CaseDetail>(c, `/cases/${id(caseId)}`),
  create: (c: string, body: CreateCaseRequest) =>
    request<CaseDetail>(c, "/cases", { method: "POST", body }),

  assign: (c: string, caseId: string, userIds: string[]) =>
    request<CaseDetail>(c, `/cases/${id(caseId)}/mediators`, { method: "PATCH", body: { userIds } }),
  respondent: (c: string, caseId: string, body: { tower?: string; apartment?: string; description?: string }) =>
    request<CaseDetail>(c, `/cases/${id(caseId)}/respondent`, { method: "PATCH", body }),
  summon: (c: string, caseId: string, body: { hearingAt: string; hearingPlace?: string; descargosDeadline?: string }) =>
    request<CaseDetail>(c, `/cases/${id(caseId)}/summon`, { method: "POST", body }),
  /** Acciones que solo llevan un texto. */
  text: (
    c: string,
    caseId: string,
    action: "descargos" | "petitioner-note" | "withdraw" | "escalate" | "appeal" | "close",
    text: string,
  ) => request<CaseDetail>(c, `/cases/${id(caseId)}/${action}`, { method: "POST", body: { text } }),
  note: (c: string, caseId: string, text: string, internal: boolean) =>
    request<CaseDetail>(c, `/cases/${id(caseId)}/notes`, { method: "POST", body: { text, internal } }),
  outcome: (c: string, caseId: string, result: "agreement" | "no_agreement", text: string) =>
    request<CaseDetail>(c, `/cases/${id(caseId)}/outcome`, { method: "POST", body: { result, text } }),
  sanction: (c: string, caseId: string, body: SanctionRequest) =>
    request<CaseDetail>(c, `/cases/${id(caseId)}/sanction`, { method: "POST", body }),
  resolveAppeal: (c: string, caseId: string, decision: "confirmed" | "revoked", text: string) =>
    request<CaseDetail>(c, `/cases/${id(caseId)}/appeal/resolve`, { method: "POST", body: { decision, text } }),
};
