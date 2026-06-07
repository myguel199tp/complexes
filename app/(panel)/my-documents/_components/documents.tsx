import { HeaderAction } from "@/app/components/header";
import React from "react";
import DocumentsInfo from "./document";

export default function Documents() {
  return (
    <>
      <HeaderAction title="Documentos" />
      <DocumentsInfo />;
    </>
  );
}
