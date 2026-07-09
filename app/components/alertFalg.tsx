import { Flag } from "complexes-next-components";
import { useEffect } from "react";
import { useAlertStore } from "./store/useAlertStore";

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
  }, [hideAlert, show]);

  if (!show) return null;

  const colVariant = mapAlertTypeToColVariant(type);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[10000] max-w-[90vw]">
      <Flag
        colVariant={colVariant}
        background={colVariant}
        size="sm"
        rounded="lg"
      >
        {message}
      </Flag>
    </div>
  );
}
