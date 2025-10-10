import { useTransition } from "react";
import { useCountryCityOptions } from "../../registers/_components/register-option";
import ImmovablesInfo from "../../immovables/_components/immovables-info";
import HolidayInfo from "../../holiday/_components/holiday-info";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";

export default function HomepageInfo() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPendingAll, startTransitionAll] = useTransition();
  const { countryOptions, data } = useCountryCityOptions();

  const { filteredData } = ImmovablesInfo();
  const { filteredDataHollliday } = HolidayInfo();

  const handleClick = () => {
    startTransition(() => {
      router.push(route.registerComplex);
    });
  };

  const handleClickAll = () => {
    startTransitionAll(() => {
      router.push(route.us);
    });
  };

  const { t } = useTranslation();
  return {
    isPendingAll,
    isPending,
    countryOptions,
    data,
    filteredData,
    filteredDataHollliday,
    handleClick,
    handleClickAll,
    t,
  };
}
