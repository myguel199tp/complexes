import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { ContactsByOwnerService } from "../../services/contactOwnerService";

export const QUERY_CONTACTS_BY_OWNER = "query_contacts_by_owner";

export default function useQueryContacts(inmovableId?: string) {
  const storedUserId = useConjuntoStore((state) => state.userId);

  return useQuery({
    queryKey: [QUERY_CONTACTS_BY_OWNER, inmovableId ?? "all"],
    queryFn: () => ContactsByOwnerService(inmovableId),
    enabled: !!storedUserId,
    staleTime: 1000 * 5,
  });
}
