import dynamic from "next/dynamic";

const NewsAll = dynamic(() => import("./_components/newsAll"), {
  ssr: false,
});

export default function Page() {
  return <NewsAll />;
}
