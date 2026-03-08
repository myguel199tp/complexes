"use client";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useVoteMutation } from "../queries/assemblies.queries";

export default function PollCard({ poll }) {
  const voteMutation = useVoteMutation();

  const hasVoted = !!poll.userVote;
  const storedUserId = useConjuntoStore((state) => state.userId);

  const handleVote = (optionId: string) => {
    if (hasVoted) return;

    voteMutation.mutate({
      pollId: poll.id,
      optionId,
      userId: String(storedUserId),
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
      <h3 className="font-semibold mb-3">{poll.question}</h3>

      <div className="flex flex-col gap-2">
        {poll.options.map((op) => {
          const percent =
            poll.totalVotes > 0
              ? Math.round((op.votes / poll.totalVotes) * 100)
              : 0;

          const isSelected = poll.userVote === op.id;

          return (
            <button
              key={op.id}
              disabled={hasVoted}
              onClick={() => handleVote(op.id)}
              className={`relative w-full px-3 py-2 rounded-lg transition
              ${
                hasVoted
                  ? isSelected
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {op.option}

              {hasVoted && (
                <span className="absolute right-3 text-xs">{percent}%</span>
              )}
            </button>
          );
        })}
      </div>

      {hasVoted && (
        <p className="text-xs text-gray-500 mt-3">
          Total votos: {poll.totalVotes}
        </p>
      )}
    </div>
  );
}
