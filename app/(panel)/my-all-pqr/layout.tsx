import { Metadata } from "next";
import React, { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AllPqr",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
