"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { createReplyService } from "../services/createReplyService";
import { voteService } from "../services/voteService";
import { getThreadService } from "../services/getThreadService";
import { ForumThread } from "../services/getThreadsService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

interface ThreadDetailProps {
  threadId: string;
}

export default function ThreadDetail({ threadId }: ThreadDetailProps) {
  const queryClient = useQueryClient();
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";

  const { data, isLoading } = useQuery<ForumThread>({
    queryKey: ["thread", threadId, infoConjunto],
    queryFn: () => getThreadService(threadId, infoConjunto),
    enabled: !!infoConjunto, // solo ejecuta si existe conjuntoId
  });

  const [replyText, setReplyText] = useState("");

  const voteMutation = useMutation({
    mutationFn: ({
      pollIndex,
      optionId,
    }: {
      pollIndex: number;
      optionId: string;
    }) => voteService(threadId, pollIndex, optionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: (payload: { text: string; createdBy: string }) =>
      createReplyService(threadId, payload),
    onSuccess: () => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
    },
  });

  if (isLoading) return <div>Cargando...</div>;
  if (!data) return <div>No existe el foro</div>;

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-bold">{data.title}</h1>
      <p>{data.content}</p>

      {/* ✅ ENCUESTAS */}
      {data.polls?.map((poll, pollIndex) => (
        <div key={pollIndex}>
          <h3 className="font-semibold">{poll.question}</h3>

          {poll.options.map((option) => (
            <button
              key={option.id}
              onClick={() =>
                voteMutation.mutate({ pollIndex, optionId: option.id })
              }
              className="block border p-1 rounded"
            >
              {option.text} — {option.votes} votos
            </button>
          ))}
        </div>
      ))}

      {/* ✅ RESPONDER */}
      <textarea
        className="border w-full"
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white p-2 rounded"
        onClick={() =>
          replyMutation.mutate({ text: replyText, createdBy: "user-id-temp" })
        }
      >
        Responder
      </button>
    </div>
  );
}
