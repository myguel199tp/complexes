import React from "react";
import News from "./_components/news";
import Layout from "./layout";

export default function page() {
  return (
    <Layout titles="Crear Noticia">
      <News />
    </Layout>
  );
}
