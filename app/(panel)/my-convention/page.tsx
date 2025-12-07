"use client";

import Link from "next/link";
import { useAssembliesQuery } from "./queries/assemblies.queries";

export default function AssembliesPage() {
  const { data, isLoading } = useAssembliesQuery();

  if (isLoading) return <p>Cargando...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Asambleas</h1>
      {JSON.stringify(data)}
      {data?.map((assembly: any) => (
        <div key={assembly.id} className="mb-3">
          <Link
            className="text-blue-600 underline"
            href={`/my-convention/${assembly.id}`}
          >
            {assembly.title}
          </Link>
        </div>
      ))}
    </div>
  );
}
