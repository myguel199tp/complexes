// "use client";

// import React, { useState, useEffect } from "react";
// import { loadStripe } from "@stripe/stripe-js";
// import {
//   Elements,
//   PaymentElement,
//   useStripe,
//   useElements,
// } from "@stripe/react-stripe-js";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { useCreatePayment } from "./useCreatePayment";

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
// const queryClient = new QueryClient();

// export default function PaymentPage() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <Elements
//         stripe={stripePromise}
//         options={{ appearance: { theme: "flat" } }}
//       >
//         <CheckoutForm />
//       </Elements>
//     </QueryClientProvider>
//   );
// }

// function CheckoutForm() {
//   const stripe = useStripe();
//   const elements = useElements();
//   const { mutateAsync } = useCreatePayment();
//   const [clientSecret, setClientSecret] = useState<string | null>(null);
//   const [message, setMessage] = useState("");

//   // 🔹 Crea el PaymentIntent al montar el componente
//   useEffect(() => {
//     const initPayment = async () => {
//       const payment = await mutateAsync({
//         amount: 300000,
//         currency: "cop",
//         plan: "ORO",
//         propertyType: "INTERNO",
//         hostAccountId: "acct_123host",
//         conjuntoAccountId: "acct_456conjunto",
//         description: "Reserva apartamento 302",
//       });
//       setClientSecret(payment.clientSecret);
//     };
//     initPayment();
//   }, [mutateAsync]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!stripe || !elements) return;

//     setMessage("Procesando pago...");

//     const result = await stripe.confirmPayment({
//       elements,
//       confirmParams: {
//         return_url: window.location.origin + "/confirmacion",
//       },
//       redirect: "if_required", // 🔹 evita redirección automática
//     });

//     // ✅ Type narrowing seguro basado en las interfaces de Stripe
//     if (result.error) {
//       setMessage(`❌ ${result.error.message}`);
//       return;
//     }

//     // result es de tipo Stripe.PaymentIntentResult
//     const paymentIntent = result.paymentIntent;

//     if (!paymentIntent) {
//       setMessage("⚠️ No se recibió información del pago.");
//       return;
//     }

//     switch (paymentIntent.status) {
//       case "requires_capture":
//         setMessage(
//           "✅ Pago retenido correctamente. Pendiente de confirmación."
//         );
//         break;
//       case "succeeded":
//         setMessage("🎉 Pago completado con éxito.");
//         break;
//       default:
//         setMessage(`ℹ️ Estado del pago: ${paymentIntent.status}`);
//     }
//   };

//   if (!clientSecret) return <p>Cargando opciones de pago...</p>;

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded-2xl"
//     >
//       <h2 className="text-xl font-semibold mb-4 text-center">
//         Selecciona tu método de pago
//       </h2>
//       <PaymentElement className="mb-4" />
//       <button
//         type="submit"
//         disabled={!stripe}
//         className="bg-blue-600 text-white w-full py-2 rounded-md hover:bg-blue-700 transition"
//       >
//         Pagar $300.000
//       </button>
//       {message && <p className="mt-3 text-center">{message}</p>}
//     </form>
//   );
// }
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
