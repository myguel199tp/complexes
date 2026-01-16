import { Button, Text } from "complexes-next-components";
import Link from "next/link";

export default function EmptyState({ missingAreas, missingProviders }: any) {
  return (
    <div className="p-6 border rounded-md space-y-4">
      <Text font="bold">Antes de crear un mantenimiento debes:</Text>

      {missingAreas && <p>• Crear al menos una zona común</p>}
      {missingProviders && <p>• Crear al menos un proveedor</p>}

      <div className="flex gap-2">
        {missingAreas && (
          <Link href="/settings/common-areas">
            <Button size="sm">Crear zona común</Button>
          </Link>
        )}
        {missingProviders && (
          <Link href="/settings/providers">
            <Button size="sm">Crear proveedor</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
