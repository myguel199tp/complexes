import Link from "next/link";
import { Text } from "complexes-next-components";

export default function AssemblyCard({ assembly }: { assembly }) {
  return (
    <Link href={`/assemblies/${assembly.id}`}>
      <div className="p-4 hover:bg-gray-50 cursor-pointer rounded-xl">
        <Text as="h3" font="semi" className="text-lg">{assembly.title}</Text>
        <Text size="sm" className="text-gray-600">
          {assembly.typeAssembly.toUpperCase()}
        </Text>
      </div>
    </Link>
  );
}
