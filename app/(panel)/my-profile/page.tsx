import React from "react";
import Layout from "./layout";
import NewsAll from "./_components/newsAll";

export default function page() {
  return (
    <Layout titles="Noticias">
      <NewsAll />
    </Layout>
  );
}
