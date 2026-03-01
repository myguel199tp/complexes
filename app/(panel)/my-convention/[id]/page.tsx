"use client";

import {
  useAssemblyDetailQuery,
  useAssemblyPollsQuery,
  useVoteMutation,
} from "../queries/assemblies.queries";

export default function AssemblyDetailPage({ params }) {
  const { id } = params;

  const { data: assembly } = useAssemblyDetailQuery(id);
  const { data: polls } = useAssemblyPollsQuery(id);
  const voteMutation = useVoteMutation();

  const handleVote = (pollId: string, optionId: string) => {
    voteMutation.mutate({
      pollId,
      optionId,
      userId: "USER_ID_DESDE_COOKIES",
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">{assembly?.title}</h1>
      {polls?.map((poll) => (
        <div key={poll.id} className="mt-6 p-4 border rounded-lg">
          <h2 className="font-medium">{poll.question}</h2>

          <div className="mt-2 flex flex-col gap-2">
            {poll.options.map((o) => (
              <button
                key={o.id}
                onClick={() => handleVote(poll.id, o.id)}
                className="bg-blue-600 text-white px-3 py-1 rounded-md"
              >
                {o.option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
