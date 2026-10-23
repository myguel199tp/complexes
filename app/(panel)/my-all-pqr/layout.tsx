import { Metadata } from "next";
import React, { ReactNode } from "react";
import HistoryNotice from "@/app/components/history-notice";

export const metadata: Metadata = {
  title: "AllPqr",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <HistoryNotice />
      {children}
    </div>
  );
}
