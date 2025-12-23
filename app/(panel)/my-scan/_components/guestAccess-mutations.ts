import { useMutation } from "@tanstack/react-query";
import { validateGuestAccess } from "../services/guestAccessservice";

export function useValidateGuestAccess() {
  return useMutation({
    mutationFn: (accessCode: string) => validateGuestAccess(accessCode),
  });
}
