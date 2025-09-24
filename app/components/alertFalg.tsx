import { Flag } from "complexes-next-components";
import { useEffect } from "react";
import { useAlertStore } from "./store/useAlertStore";

// Mapeo de tipos personalizados al formato del componente Flag
const mapAlertTypeToColVariant = (type: "success" | "error" | "info") => {
  switch (type) {
    case "success":
      return "success";
    case "error":
      return "danger";
    case "info":
      return "primary";
    default:
      return "default";
  }
};

export function AlertFlag() {
  const { message, type, show, hideAlert } = useAlertStore();

  useEffect(() => {
    if (show) {
      const timeout = setTimeout(() => hideAlert(), 3000);
      return () => clearTimeout(timeout);
    }
  }, [show]);

  if (!show) return null;

  const colVariant = mapAlertTypeToColVariant(type);

  return (
    <Flag
      colVariant={colVariant}
      background={colVariant}
      size="md"
      rounded="basic"
    >
      {message}
    </Flag>
  );
}
