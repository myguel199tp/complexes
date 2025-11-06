import React from "react";
import ThreadDetail from "../../_components/thread-detail";

interface Props {
  params: { id: string };
}

export default function Page({ params }: Props) {
  return <ThreadDetail threadId={params.id} />;
}
