"use client";

import React, { useState } from "react";

export default function PaymentPage() {
  return <CheckoutForm />;
}

function CheckoutForm() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) {
      setMessage("⚠️ Selecciona un método de pago.");
      return;
    }
    setMessage("Procesando pago...");
    setTimeout(
      () => setMessage(`🎉 Pago completado con ${selectedMethod}.`),
      1500
    );
  };

  const paymentMethods = [
    { name: "Tarjeta de crédito", icon: "💳" },
    { name: "PSE", icon: "🏦" },
    { name: "PayPal", icon: "🅿️" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-2xl"
    >
      <h2 className="text-xl font-semibold mb-6 text-center">
        Selecciona tu método de pago
      </h2>

      <div className="grid grid-cols-1 gap-4 mb-6">
        {paymentMethods.map((method) => (
          <button
            type="button"
            key={method.name}
            onClick={() => setSelectedMethod(method.name)}
            className={`flex items-center justify-center gap-2 p-4 border rounded-lg transition
              ${
                selectedMethod === method.name
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
          >
            <span className="text-2xl">{method.icon}</span>
            <span className="font-medium">{method.name}</span>
          </button>
        ))}
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white w-full py-2 rounded-md hover:bg-blue-700 transition"
      >
        Pagar $300.000
      </button>

      {message && <p className="mt-3 text-center">{message}</p>}
    </form>
  );
}
