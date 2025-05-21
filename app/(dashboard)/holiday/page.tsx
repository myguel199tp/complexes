export const dynamic = "force-dynamic";

import React from "react";
import Holiday from "./_components/holiday";
import Layout from "./layout";

export default function Page() {
  return (
    <Layout>
      <Holiday />
    </Layout>
  );
}
