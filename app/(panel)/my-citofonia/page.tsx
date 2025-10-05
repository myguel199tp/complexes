"use client";

import React, { useEffect, useState } from "react";
import Citofonie from "./components/citofonie";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const payload = getTokenPayload();

    if (payload?.role !== "employee") {
      router.replace("/my-profile");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return null; // o un spinner si quieres

  return <Citofonie />;
}
