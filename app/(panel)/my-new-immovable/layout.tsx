import { Title } from "complexes-next-components";
import { Metadata } from "next";
import React, { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Registrar | Complexes",
};

interface LayoutProps {
  children: ReactNode;
  titles: string;
}

export default function Layout({ children, titles }: LayoutProps) {
  return (
    <div className="w-full p-4">
      <Title size="md" className="m-4" font="semi" as="h2">
        {titles}
      </Title>
      <div>{children}</div>
    </div>
  );
}
