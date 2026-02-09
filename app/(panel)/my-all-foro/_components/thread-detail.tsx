"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ImSpinner9 } from "react-icons/im";

import { createReplyService } from "../services/createReplyService";
import { voteService } from "../services/voteService";
import { getThreadService } from "../services/getThreadService";
import { ForumThread } from "../services/getThreadsService";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { Button, Text, TextAreaField } from "complexes-next-components";
import MessageNotData from "@/app/components/messageNotData";

interface ThreadDetailProps {
  threadId: string;
}

export default function ThreadDetail({ threadId }: ThreadDetailProps) {
  const queryClient = useQueryClient();
  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";
  const [replyText, setReplyText] = useState("");

  const { data, isLoading } = useQuery<ForumThread>({
    queryKey: ["thread", threadId, infoConjunto],
    queryFn: () => getThreadService(threadId, infoConjunto),
    enabled: !!infoConjunto,
  });

  const voteMutation = useMutation({
    mutationFn: ({
      pollIndex,
      optionId,
    }: {
      pollIndex: number;
      optionId: string;
    }) => voteService(threadId, pollIndex, optionId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["thread", threadId] }),
  });

  const replyMutation = useMutation({
    mutationFn: (payload: { text: string; createdBy: string }) =>
      createReplyService(threadId, payload),
    onSuccess: () => {
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-700" size={36} />
      </div>
    );
  }

  if (!data) return <MessageNotData />;

  const polls = data.polls ?? [];

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8 bg-white rounded-3xl shadow-md border border-gray-100">
      {/* 🧵 HEADER */}
      <div className="space-y-3">
        <Text className="text-3xl font-bold text-gray-900">{data.title}</Text>
        <Text className="text-gray-600 leading-relaxed text-base">
          {data.content}
        </Text>
      </div>

      {/* 📊 ENCUESTAS */}
      {polls.length > 0 && (
        <div className="space-y-6">
          {polls.map((poll, pollIndex) => {
            const totalVotes = poll.options.reduce(
              (sum, opt) => sum + opt.votes,
              0,
            );

            return (
              <div
                key={pollIndex}
                className="p-5 rounded-2xl bg-gray-50 border space-y-4"
              >
                <Text className="font-semibold text-gray-800 text-lg">
                  {poll.question}
                </Text>

                <div className="space-y-3">
                  {poll.options.map((option) => {
                    const percentage =
                      totalVotes > 0
                        ? Math.round((option.votes / totalVotes) * 100)
                        : 0;

                    return (
                      <button
                        key={option.id}
                        onClick={() =>
                          voteMutation.mutate({
                            pollIndex,
                            optionId: option.id,
                          })
                        }
                        className="relative w-full overflow-hidden rounded-xl border bg-white hover:border-cyan-500 transition"
                      >
                        {/* Barra */}
                        <div
                          className="absolute inset-y-0 left-0 bg-cyan-100"
                          style={{ width: `${percentage}%` }}
                        />

                        {/* Contenido */}
                        <div className="relative z-10 flex justify-between items-center px-4 py-3 text-sm">
                          <span className="font-medium text-gray-800">
                            {option.text}
                          </span>
                          <span className="text-gray-500">
                            {percentage}% · {option.votes}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✍️ RESPONDER */}
      <div className="space-y-4 pt-4 border-t">
        <Text className="font-semibold text-gray-900 text-lg">Responder</Text>

        <TextAreaField
          rows={4}
          placeholder="Escribe tu respuesta de forma clara y respetuosa..."
          className="w-full rounded-2xl border-gray-300 focus:ring-2 focus:ring-cyan-600"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />

        <div className="flex justify-end">
          <Button
            disabled={!replyText.trim() || replyMutation.isPending}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-2.5 rounded-2xl font-medium disabled:opacity-50"
            onClick={() =>
              replyMutation.mutate({
                text: replyText,
                createdBy: "user-id-temp",
              })
            }
          >
            Publicar respuesta
          </Button>
        </div>
      </div>
    </div>
  );
}
