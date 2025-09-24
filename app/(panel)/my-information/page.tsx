import dynamic from "next/dynamic";
import Layout from "./layout";

const NewsAll = dynamic(() => import("./_components/newsAll"), {
  ssr: false,
});

export default function Page() {
  return (
    <Layout>
      <NewsAll />
    </Layout>
  );
}
