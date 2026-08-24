"use client";
import Link from "next/link";
import { useVoteQuery } from "./use-vote-query";
import { useMeetingQuery } from "./use-meetings-query";
import VoteCard from "./vote-card";
import { Text } from "complexes-next-components";

interface Props {
  voteId: string;
}

export default function VoteDetailPage({ voteId }: Props) {
  const { data: vote, isLoading, isError } = useVoteQuery(voteId);
  const { data: meeting } = useMeetingQuery(vote?.meetingId ?? "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isError || !vote) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Link
          href="/my-council"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Volver al consejo
        </Link>
        <Text size="sm" colVariant="danger">No se pudo cargar la votación.</Text>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Link
        href={`/my-council/meeting/${vote.meetingId}`}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Volver a la reunión
      </Link>

      <VoteCard vote={vote} meetingOngoing={meeting?.status === "ongoing"} />
    </div>
  );
}
