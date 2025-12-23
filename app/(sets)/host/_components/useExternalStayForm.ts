import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

export function useExternalStayForm() {
  return useForm({
    resolver: yupResolver(createExternalStaySchema),
  });
}
export const guestInviteSchema = yup.object({
  fullName: yup.string().required(),
  document: yup.string().required(),
  phone: yup.string().required(),
  acceptRules: yup.boolean().oneOf([true]),
});

import * as yup from "yup";

export const createExternalStaySchema = yup.object({
  guestName: yup.string().required(),
  startDate: yup.date().required(),
  endDate: yup.date().required(),
  guestsCount: yup.number().min(1).required(),
  guestEmail: yup.string().email().required(),
});
