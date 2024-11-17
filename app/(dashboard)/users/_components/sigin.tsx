"use client";
import { Button, InputField, Text } from "complexes-next-components";
import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  //   const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Correo o contraseña incorrectos. Inténtalo de nuevo.");
    } else {
      //   router.push("/");
      console.log("ingreso");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <InputField
          placeholder="Correo electrónico"
          inputSize="full"
          rounded="md"
          className="mt-2"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <InputField
          placeholder="Contraseña"
          inputSize="full"
          rounded="md"
          className="mt-2"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <Text colVariant="danger" size="md">
          {error}
        </Text>
      )}
      <div className="mt-3">
        <Button
          colVariant="primary"
          size="full"
          rounded="md"
          type="submit"
          disabled={isLoading}
        >
          <Text>{isLoading ? "Cargando..." : "Ingresar"}</Text>
        </Button>
      </div>
    </form>
  );
}
