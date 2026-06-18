import VoteDetailPage from "../../_components/vote-detail-page";

interface Props {
  params: { id: string };
}

export default function Page({ params }: Props) {
  return <VoteDetailPage voteId={params.id} />;
}
