import { route } from "@/app/_domain/constants/routes";
import { logout } from "@/app/middlewares/close";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push(route.complexes);
  };

  return <button onClick={handleLogout}>Cerrar sesión</button>;
}
