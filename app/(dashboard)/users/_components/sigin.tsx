import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Usar el enrutador de Next.js para redirigir

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false, // Evita redirigir automáticamente
      email,
      password,
    });

    if (res?.error) {
      setError("Credenciales incorrectas");
    } else {
      // Redirigir usando el enrutador de Next.js
      router.push("/"); // Redirige a la página principal
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="p-6 bg-white rounded-md shadow-md w-80"
        onSubmit={handleLogin}
      >
        <h2 className="text-lg font-bold mb-4">Iniciar Sesión</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            className="w-full border-gray-300 rounded-md shadow-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Contraseña</label>
          <input
            type="password"
            className="w-full border-gray-300 rounded-md shadow-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}
