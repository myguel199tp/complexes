"use client";

import { useVoteMutation } from "../queries/assemblies.queries";
import { Text, Title } from "complexes-next-components";

export default function PollCard({ poll, assemblyId }) {
  // El id de la asamblea es lo que la mutación invalida al terminar; con el de
  // la pregunta refrescaba una clave inexistente y la tarjeta se quedaba con
  // los votos viejos.
  const voteMutation = useVoteMutation(assemblyId);

  const hasVoted = !!poll.userVote;

  const handleVote = (optionId: string) => {
    if (hasVoted) return;

    voteMutation.mutate({
      pollId: poll.id,
      optionId,
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
      <Title as="h3" size="xs" font="semi" className="mb-3">{poll.question}</Title>

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
        <Text size="xs" className="text-gray-500 mt-3">
          Total votos: {poll.totalVotes}
        </Text>
      )}
    </div>
  );
}
