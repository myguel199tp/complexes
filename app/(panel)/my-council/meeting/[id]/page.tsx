import MeetingDetailPage from "../../_components/meeting-detail-page";

interface Props {
  params: { id: string };
}

export default function Page({ params }: Props) {
  return <MeetingDetailPage meetingId={params.id} />;
}
