import { Suspense } from "react";
import PaymentPendingPage from "./_components/pending";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPendingPage />
    </Suspense>
  );
}
