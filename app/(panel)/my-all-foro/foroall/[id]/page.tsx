import React from "react";
import AllThreadDetail from "../../_components/all-thread-detail";

interface Props {
  params: { id: string };
}

export default function Page({ params }: Props) {
  return <AllThreadDetail threadId={params.id} />;
}
