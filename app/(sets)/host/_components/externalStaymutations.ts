import { useMutation } from "@tanstack/react-query";
import { createExternalStay } from "../../guest-invite/services/externalStayservice";

export function useCreateExternalStay() {
  return useMutation({
    mutationFn: ({ listingId, data }) => createExternalStay(listingId, data),
  });
}
