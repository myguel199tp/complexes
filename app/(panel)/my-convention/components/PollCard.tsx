"use client";

import { useVoteMutation } from "../queries/assemblies.queries";

export interface Polls {
  id: number;
  text: string;
}

export default function PollCard({ poll }: { poll }) {
  const voteMutation = useVoteMutation();

  const handleVote = (optionId: string) => {
    voteMutation.mutate({
      pollId: poll.id,
      optionId,
      userId: "USER_ID_DESDE_COOKIES_O_STORE",
    });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
      <h3 className="font-semibold mb-2">{poll.question}</h3>

      <div className="flex flex-col gap-2">
        {poll.options.map((op) => (
          <button
            key={op.id}
            onClick={() => handleVote(op.id)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition"
          >
            {op.text}
          </button>
        ))}
      </div>
    </div>
  );
}
