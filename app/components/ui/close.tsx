import { route } from "@/app/_domain/constants/routes";
import { useLanguage } from "@/app/hooks/useLanguage";
import { logout } from "@/app/middlewares/close";
import { Button } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function LogoutPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const handleLogout = () => {
    logout();
    router.push(route.complexes);
  };

  return (
    <Button
      key={language}
      size="sm"
      rounded="md"
      className="mt-2"
      tKey={t("cerrarsesion")}
      translate="yes"
      role="button"
      colVariant="danger"
      onClick={handleLogout}
    >
      Cerrar sesión
    </Button>
  );
}
