import { route } from "@/app/_domain/constants/routes";
import { logout } from "@/app/middlewares/close";
import { Button } from "complexes-next-components";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push(route.complexes);
  };

  return (
    <Button
      size="sm"
      rounded="md"
      role="button"
      colVariant="danger"
      onClick={handleLogout}
    >
      Cerrar sesión
    </Button>
  );
}
