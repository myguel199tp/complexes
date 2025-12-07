import Link from "next/link";

export default function AssemblyCard({ assembly }: { assembly: any }) {
  return (
    <Link href={`/assemblies/${assembly.id}`}>
      <div className="p-4 hover:bg-gray-50 cursor-pointer rounded-xl">
        <h3 className="text-lg font-semibold">{assembly.title}</h3>
        <p className="text-sm text-gray-600">
          {assembly.typeAssembly.toUpperCase()}
        </p>
      </div>
    </Link>
  );
}
