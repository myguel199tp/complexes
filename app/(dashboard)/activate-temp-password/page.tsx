import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { activateTempPassword } from "@/app/auth/services/active-temp";

export default function ActivateTempPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return setError("Usuario inválido");

    setLoading(true);
    setError("");

    try {
      await activateTempPassword({ userId, newPassword: password });
      router.push("/login"); // redirige al login normal
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error activando contraseña temporal");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Activa tu contraseña temporal</h2>
      <input
        type="password"
        placeholder="Nueva contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Activando..." : "Activar"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}
