// ReferralLink.tsx
"use client";

interface Props {
  referralCode: string;
  conjuntoId: string;
}

export default function ReferralLink({ referralCode, conjuntoId }: Props) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL_LOC}/registers/complex?ref=${referralCode}&conjunto=${conjuntoId}`;

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    alert("Link copiado");
  };

  return (
    <div className="p-4 border rounded-xl space-y-2">
      <p className="text-sm text-gray-500">Tu link de referido</p>
      <div className="flex gap-2">
        <input
          value={link}
          readOnly
          className="w-full border px-3 py-2 rounded"
        />
        <button onClick={copy} className="bg-cyan-800 text-white px-4 rounded">
          Copiar
        </button>
      </div>
    </div>
  );
}
