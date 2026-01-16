"use client";

import ReferralStats from "./_components/ReferralStats";
import ReferralLink from "./_components/ReferralLink";
import ReferralTable from "./_components/referralTable";
import { useMe } from "./_components/use-me";
import { useReferrals } from "./_components/use-referrals";
import { ImSpinner9 } from "react-icons/im";
import { Title } from "complexes-next-components";

export default function ReferralsPage() {
  const { data: me, isLoading: loadingMe } = useMe();
  console.log("me", me);
  const { data: referrals = [], isLoading: loadingRefs } = useReferrals(me?.id);

  if (loadingMe || loadingRefs) {
    return (
      <div className="flex justify-center items-center h-96">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );
  }

  if (!me?.conjunto) {
    return (
      <div className="flex justify-center items-center c">
        <Title as="h4">No tienes conjunto asignado</Title>
      </div>
    );
  }

  const completed = referrals.filter(
    (r: any) => r.status === "completed"
  ).length;

  return (
    <div className="space-y-6 mt-4">
      <div className="w-full gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <Title size="sm" font="bold" colVariant="on" translate="yes">
          Referidos
        </Title>
      </div>

      <ReferralStats total={referrals.length} completed={completed} />

      <ReferralLink
        referralCode={me.referralCode}
        conjuntoId={me.conjunto.id}
      />

      <ReferralTable referrals={referrals} />
    </div>
  );
}
