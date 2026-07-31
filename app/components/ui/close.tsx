import { route } from "@/app/_domain/constants/routes";
import { useSession } from "@/app/components/session-provider";
import { useLanguage } from "@/app/hooks/useLanguage";
import { logout } from "@/app/middlewares/close";
import { Button } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function LogoutPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { clear } = useSession();

  const handleLogout = async () => {
    await logout();
    // Las cookies son httpOnly: al expirarlas en el servidor el contexto de
    // sesión sigue en memoria, así que hay que vaciarlo a mano para que el nav
    // vuelva a "Iniciar Sesión" sin recargar.
    clear();
    router.push(route.complexes);
    // Refresca los Server Components para que el layout raíz vuelva a resolver
    // initialSession = null y no se rehidrate la sesión anterior.
    router.refresh();
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
