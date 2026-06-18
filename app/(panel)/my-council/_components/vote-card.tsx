"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "complexes-next-components";
import { VoteResponse } from "../services/response/councilResponse";
import { useVoteResultsQuery } from "./use-vote-query";
import { useRegisterVoteMutation } from "./use-register-vote-mutation";

interface Props {
  vote: VoteResponse;
  meetingOngoing: boolean;
}

export default function VoteCard({ vote, meetingOngoing }: Props) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const { data: results = [] } = useVoteResultsQuery(vote.id);
  const castMutation = useRegisterVoteMutation();

  const options = vote.options ?? [];
  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

  const handleVote = () => {
    if (!selectedOptionId) return;
    castMutation.mutate(
      { voteId: vote.id, optionId: selectedOptionId },
      { onSuccess: () => setSelectedOptionId("") }
    );
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-white">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{vote.title}</h4>
          {vote.description && (
            <p className="text-xs text-gray-500 mt-0.5">{vote.description}</p>
          )}
        </div>
        <Link
          href={`/my-council/vote/${vote.id}`}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
        >
          Ver detalle
        </Link>
      </div>

      {meetingOngoing && options.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Emitir voto
          </p>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOptionId(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  selectedOptionId === opt.id
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            colVariant="success"
            rounded="md"
            onClick={handleVote}
            disabled={!selectedOptionId || castMutation.isPending}
          >
            {castMutation.isPending ? "Registrando..." : "Votar"}
          </Button>
        </div>
      )}

      {meetingOngoing && options.length === 0 && (
        <p className="text-xs text-gray-400 italic">
          Opciones de votación no disponibles.
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-2.5 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Resultados · {totalVotes} voto{totalVotes !== 1 ? "s" : ""}
          </p>
          {results.map((r) => {
            const pct =
              totalVotes > 0 ? Math.round((r.votes / totalVotes) * 100) : 0;
            return (
              <div key={r.optionId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">{r.label}</span>
                  <span className="text-gray-400 text-xs">
                    {r.votes} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {results.length === 0 && !meetingOngoing && (
        <p className="text-xs text-gray-400 italic">Sin votos registrados.</p>
      )}
    </div>
  );
}
