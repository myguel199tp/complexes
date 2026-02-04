"use client";

import { Text } from "complexes-next-components";
import ShareButtons from "./shareButton";

interface Props {
  referralCode: string;
  conjuntoId: string;
}

export default function ReferralLink({ referralCode, conjuntoId }: Props) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL_LOC}/registers/complex?ref=${referralCode}&conjunto=${conjuntoId}`;

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    alert("Link de referido copiado ✅");
  };

  return (
    <div className="p-4 border rounded-xl space-y-3 bg-white">
      <div className="flex items-center justify-between gap-2">
        <Text className="text-sm text-gray-600 font-medium">
          Comparte tu link de referido
        </Text>
        <div className="flex gap-2 items-center">
          <Text size="xs">Compartir:</Text>
          <ShareButtons url={link} />
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={link}
          readOnly
          className="w-full border px-3 py-2 rounded text-sm text-gray-700"
        />
        <button
          onClick={copy}
          className="bg-cyan-800 hover:bg-cyan-700 transition text-white px-4 rounded text-sm"
        >
          Copiar
        </button>
      </div>
    </div>
  );
}
