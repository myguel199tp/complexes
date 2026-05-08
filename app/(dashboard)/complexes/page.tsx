import dynamic from "next/dynamic";

const Homepage = dynamic(() => import("./_components/hompage"), {
  ssr: false,
});

export default function Home() {
  return <Homepage />;
}
