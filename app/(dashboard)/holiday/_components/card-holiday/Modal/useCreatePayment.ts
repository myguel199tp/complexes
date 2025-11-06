import { useMutation } from "@tanstack/react-query";
import {
  CreatePaymentDto,
  CreatePaymentResponse,
  createPaymentService,
} from "../../../services/paymentService";

export function useCreatePayment() {
  return useMutation<CreatePaymentResponse, Error, CreatePaymentDto>({
    mutationFn: createPaymentService,
  });
}
