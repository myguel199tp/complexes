import { Text, Title } from "complexes-next-components";
import React from "react";

export default function Vip() {
  return (
    <>
      <Title font="bold">Zona VIP</Title>
      <div className="flex mt-2 justify-center">
        <div className="flex w-full justify-center">
          <div className="border border-cyan-800 p-4 w-[50%] rounded-sm">
            <div>
              <Text font="bold"> (Venta/Arriendo)</Text>
              <Text>
                Puedes subir hasta 8 inmuebles ya sea para venta o renta y poder
                que se publicione tambein en nuestras redes sociales
              </Text>
              <div className="flex gap-4 items-center justify-center mt-2">
                <Text>Semestral</Text>
                <Text>Anual</Text>
              </div>
            </div>
            <div className="mt-6">
              <Text font="bold"> (Alquiler)</Text>
              <Text>
                Puedes alquilar hasta 8 inmuebles sin que se te descuente el 7%
                por el uso de la plataforma podras ganar el 100% de lo que te
                corresponde
              </Text>

              <div className="flex gap-4 items-center justify-center mt-2">
                <Text>Semestral</Text>
                <Text>Anual</Text>
              </div>
            </div>
            <div className="mt-6">
              <Text font="bold">(Comercio)</Text>
              <Text>Puedes publicar sin la restriccion de tiempo</Text>
              <div className="flex gap-4 items-center justify-center mt-2">
                <Text>Semestral</Text>
                <Text>Anual</Text>
              </div>
            </div>
          </div>
          <div className="w-[50%]">
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-2">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-4">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                  Realiza tu pago
                </h2>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Juan Pérez"
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="correo@ejemplo.com"
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Monto (COP)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      placeholder="50000"
                      required
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    type="button"
                    // onClick={() => handlePayment("CARD")}
                    className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Pagar con tarjeta de crédito
                  </button>

                  <button
                    type="button"
                    // onClick={() => handlePayment("PSE")}
                    className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Pagar con PSE
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
