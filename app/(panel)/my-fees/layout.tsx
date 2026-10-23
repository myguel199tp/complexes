import { Metadata } from "next";
import React, { ReactNode } from "react";
import HistoryNotice from "@/app/components/history-notice";

export const metadata: Metadata = {
  title: "favoritos",
};

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      <HistoryNotice />
      {children}
    </div>
  );
}
