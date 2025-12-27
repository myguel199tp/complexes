"use client";

import ReferralStats from "./_components/ReferralStats";
import ReferralLink from "./_components/ReferralLink";
import ReferralTable from "./_components/referralTable";
import { useMe } from "./_components/use-me";
import { useReferrals } from "./_components/use-referrals";

export default function ReferralsPage() {
  const { data: me, isLoading: loadingMe } = useMe();
  console.log("me", me);
  const { data: referrals = [], isLoading: loadingRefs } = useReferrals(me?.id);

  if (loadingMe || loadingRefs) {
    return <p>Cargando...</p>;
  }

  if (!me?.conjunto) {
    return <p>No tienes conjunto asignado</p>;
  }

  const completed = referrals.filter(
    (r: any) => r.status === "completed"
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Referidos</h1>

      <ReferralStats total={referrals.length} completed={completed} />

      <ReferralLink
        referralCode={me.referralCode}
        conjuntoId={me.conjunto.id}
      />

      <ReferralTable referrals={referrals} />
    </div>
  );
}
