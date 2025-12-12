"use client";

import Link from "next/link";
import { useAssembliesQuery } from "./queries/assemblies.queries";
import { Text } from "complexes-next-components";

export default function AssembliesPage() {
  const { data, isLoading } = useAssembliesQuery();

  if (isLoading) return <Text>Cargando...</Text>;

  return (
    <div className="p-4">
      <Text className="text-xl font-semibold mb-4">Asambleas</Text>
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
