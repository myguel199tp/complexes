import { useQuery } from "@tanstack/react-query";
import { getGuestInvite } from "../../guest-invite/services/guestInviteservice";

export function useGuestInvite(token: string) {
  return useQuery({
    queryKey: ["guest-invite", token],
    queryFn: () => getGuestInvite(token),
    enabled: !!token,
  });
}
