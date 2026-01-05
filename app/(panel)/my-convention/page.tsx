"use client";

import Link from "next/link";
import { useAssembliesQuery } from "./queries/assemblies.queries";
import { Text } from "complexes-next-components";
import { ImSpinner9 } from "react-icons/im";

export default function AssembliesPage() {
  const { data, isLoading } = useAssembliesQuery();

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );

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
