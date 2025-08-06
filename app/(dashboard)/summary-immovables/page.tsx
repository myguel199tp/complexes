import React, { Suspense } from "react";
import { Text } from "complexes-next-components";
import SummaryImmovables from "./_components/summary-immovables";
import { ImSpinner9 } from "react-icons/im";

export default function page() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-96">
            <Text colVariant="primary">Cargando ...</Text>
            <ImSpinner9 className="animate-spin text-base mr-2 text-blue-400" />
          </div>
        }
      >
        <SummaryImmovables />
      </Suspense>
    </div>
  );
}
