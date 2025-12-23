import MaintenanceForm from "./form";

export default function Maintenance() {
  const conjuntoId = "UUID_DEL_CONJUNTO";

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Mantenimientos</h1>

      <MaintenanceForm conjuntoId={conjuntoId} />
    </div>
  );
}
