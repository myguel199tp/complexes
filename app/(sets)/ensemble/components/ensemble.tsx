// "use client";
// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { route } from "@/app/_domain/constants/routes";
// import { Title, Text, Avatar } from "complexes-next-components";
// import { useConjuntoStore } from "./use-store";
// import { useEnsembleInfo } from "./ensemble-info";
// import { useLanguage } from "@/app/hooks/useLanguage";
// import Link from "next/link";
// import ModalWelcome from "./modal/modal";
// import { useCountryCityOptions } from "../../registers/_components/register-option";
// import LogoutPage from "@/app/components/ui/close";
// import { useSidebarInformation } from "@/app/components/ui/sidebar-information";
// import { useHabeasQuery } from "./habeas-query";

// export default function Ensemble() {
//   const { valueState } = useSidebarInformation();
//   const { data: habeasData, isError, isLoading } = useHabeasQuery();

//   const isHabeasSigned =
//     !!habeasData && Array.isArray(habeasData) && habeasData.length > 0;
//   const { userRolName } = valueState;
//   const hasRole = (role: string) => userRolName.includes(role);

//   const { data } = useEnsembleInfo();
//   const { countryOptions, data: datacountry } = useCountryCityOptions();
//   const router = useRouter();
//   const setPlan = useConjuntoStore((state) => state.setPlan);
//   const setConjuntoId = useConjuntoStore((state) => state.setConjuntoId);
//   const setConjuntoImage = useConjuntoStore((state) => state.setConjuntoImage);
//   const setConjuntoName = useConjuntoStore((state) => state.setConjuntoName);
//   const setUserName = useConjuntoStore((state) => state.setUserName);
//   const setUserLastName = useConjuntoStore((state) => state.setUserLastName);
//   const setUserNumberId = useConjuntoStore((state) => state.setUserNumberId);
//   const setImage = useConjuntoStore((state) => state.setImage);
//   const setAddress = useConjuntoStore((state) => state.setAddress);
//   const setCity = useConjuntoStore((state) => state.setCity);
//   const setCountry = useConjuntoStore((state) => state.setCountry);
//   const setNeighborhood = useConjuntoStore((state) => state.setNeighborhood);
//   const setReside = useConjuntoStore((state) => state.setReside);
//   const setRole = useConjuntoStore((state) => state.setRole);
//   const setIsActive = useConjuntoStore((state) => state.setIsActive);
//   const srtUserId = useConjuntoStore((state) => state.setUserId);

//   const setConjuntoApartment = useConjuntoStore(
//     (state) => state.setConjuntoApartment,
//   );
//   const setConjuntoTower = useConjuntoStore((state) => state.setConjuntoTower);

//   const { language } = useLanguage();

//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     if (data?.some((item) => item.role === "visitor")) {
//       setShowModal(true);
//     }
//   }, [data]);

//   useEffect(() => {
//     if (!isLoading && (isError || !isHabeasSigned)) {
//       router.push(route.signature);
//     }
//   }, [isError, isHabeasSigned, isLoading, router]);
//   return (
//     <div
//       key={language}
//       style={{
//         backgroundImage: "url('/cici.jpg')",
//         backgroundRepeat: "no-repeat",
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//       }}
//       className="flex flex-col items-center justify-center h-screen relative"
//     >
//       {/* Header */}
//       <header className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-white/70 backdrop-blur-md shadow-md">
//         <Title as="h2" size="xs" font="bold">
//           Bienvenido al club de conjuntos más grande del mundo
//         </Title>
//         <Link href="/return-password" className="text-blue-300">
//           Cambiar contraseña
//         </Link>
//         <LogoutPage />
//       </header>

//       {hasRole("user") && (
//         <div className="bg-red-500">
//           <Text>Bienvenido a compexes</Text>
//         </div>
//       )}

//       {/* Contenido principal */}
//       {isHabeasSigned && (
//         <div className="flex justify-center gap-6 ">
//           {data?.map((item) => {
//             const {
//               id,
//               apartment,
//               tower,
//               role,
//               isMainResidence,
//               // active,
//               conjunto,
//               user,
//             } = item;

//             const fileImage = conjunto?.file || "";
//             const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
//             const fileName = fileImage
//               ? `${BASE_URL}/uploads/${fileImage.replace(/^.*[\\/]/, "")}`
//               : "";

//             const countryLabel =
//               countryOptions.find((c) => c.value === String(conjunto.country))
//                 ?.label || conjunto.country;

//             const cityLabel =
//               datacountry
//                 ?.find((c) => String(c.ids) === String(conjunto.country))
//                 ?.city.find((c) => String(c.id) === String(conjunto.city))
//                 ?.name || conjunto.city;

//             return (
//               <div
//                 key={id}
//                 className={`w-full max-w-md p-4 hover:bg-white/50 hover:text-black rounded-lg shadow-2xl cursor-pointer transition-all duration-200 ${
//                   role === "tenant"
//                     ? "bg-orange-500 text-white"
//                     : "bg-cyan-800 text-white"
//                 }`}
//                 onClick={() => {
//                   setConjuntoId(conjunto.id);
//                   setConjuntoName(conjunto.name);
//                   setConjuntoImage(conjunto.file);
//                   setConjuntoApartment(String(apartment));
//                   setConjuntoTower(String(tower));
//                   setUserName(user.name);
//                   setUserLastName(user.lastName);
//                   setUserNumberId(user.numberId);
//                   setPlan(conjunto.plan);
//                   setImage(user.file);
//                   setNeighborhood(conjunto.neighborhood);
//                   setAddress(conjunto.address);
//                   setCity(conjunto.city);
//                   setReside(isMainResidence);
//                   setRole(role);
//                   setIsActive(conjunto.isActive);
//                   srtUserId(user.id);
//                   setCountry(conjunto.country);
//                   router.push(route.myprofile);
//                 }}
//               >
//                 <section className="flex justify-between ">
//                   <div>
//                     <Title size="sm" font="bold">
//                       {conjunto.name}
//                     </Title>
//                     <Text size="sm" font="semi">
//                       {conjunto.address}
//                     </Text>

//                     <Text size="sm" font="semi">
//                       {countryLabel} | {cityLabel} | {conjunto.neighborhood}
//                     </Text>

//                     <hr className="my-2" />

//                     {apartment !== null && (
//                       <Text size="sm">
//                         <Text font="bold">
//                           {tower}-{apartment}
//                         </Text>
//                       </Text>
//                     )}
//                   </div>

//                   <div className="flex justify-end">
//                     <Avatar
//                       src={fileName}
//                       alt={`${conjunto.name}`}
//                       size="xxl"
//                       border="thick"
//                       shape="round"
//                     />
//                   </div>
//                 </section>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* 👇 Modal condicional */}
//       {showModal && <ModalWelcome isOpen onClose={() => setShowModal(false)} />}
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { Title, Text, Avatar } from "complexes-next-components";
import { useConjuntoStore } from "./use-store";
import { useEnsembleInfo } from "./ensemble-info";
import { useLanguage } from "@/app/hooks/useLanguage";
import Link from "next/link";
import ModalWelcome from "./modal/modal";
import { useCountryCityOptions } from "../../registers/_components/register-option";
import LogoutPage from "@/app/components/ui/close";
import { useSidebarInformation } from "@/app/components/ui/sidebar-information";

export default function Ensemble() {
  const router = useRouter();
  const { valueState } = useSidebarInformation();
  const { userRolName } = valueState;

  const hasRole = (role: string) => userRolName.includes(role);

  const { data } = useEnsembleInfo();
  const { countryOptions, data: datacountry } = useCountryCityOptions();
  const { language } = useLanguage();

  const setPlan = useConjuntoStore((state) => state.setPlan);
  const setConjuntoId = useConjuntoStore((state) => state.setConjuntoId);
  const setConjuntoImage = useConjuntoStore((state) => state.setConjuntoImage);
  const setConjuntoName = useConjuntoStore((state) => state.setConjuntoName);
  const setUserName = useConjuntoStore((state) => state.setUserName);
  const setUserLastName = useConjuntoStore((state) => state.setUserLastName);
  const setUserNumberId = useConjuntoStore((state) => state.setUserNumberId);
  const setImage = useConjuntoStore((state) => state.setImage);
  const setAddress = useConjuntoStore((state) => state.setAddress);
  const setCity = useConjuntoStore((state) => state.setCity);
  const setCountry = useConjuntoStore((state) => state.setCountry);
  const setNeighborhood = useConjuntoStore((state) => state.setNeighborhood);
  const setReside = useConjuntoStore((state) => state.setReside);
  const setRole = useConjuntoStore((state) => state.setRole);
  const setIsActive = useConjuntoStore((state) => state.setIsActive);
  const srtUserId = useConjuntoStore((state) => state.setUserId);
  const setConjuntoApartment = useConjuntoStore(
    (state) => state.setConjuntoApartment,
  );
  const setConjuntoTower = useConjuntoStore((state) => state.setConjuntoTower);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (data?.some((item) => item.role === "visitor")) {
      setShowModal(true);
    }
  }, [data]);

  return (
    <div
      key={language}
      style={{
        backgroundImage: "url('/cici.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="flex flex-col items-center justify-center h-screen relative"
    >
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-white/70 backdrop-blur-md shadow-md">
        <Title as="h2" size="xs" font="bold">
          Bienvenido al club de conjuntos más grande del mundo
        </Title>

        <Link href="/return-password" className="text-blue-300">
          Cambiar contraseña
        </Link>

        <LogoutPage />
      </header>

      {hasRole("user") && (
        <div className="bg-red-500">
          <Text>Bienvenido a complexes</Text>
        </div>
      )}

      <div className="flex justify-center gap-6">
        {data?.map((item) => {
          const {
            id,
            apartment,
            tower,
            role,
            isMainResidence,
            conjunto,
            user,
          } = item;

          const fileImage = conjunto?.file || "";
          const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

          const fileName = fileImage
            ? `${BASE_URL}/uploads/${fileImage.replace(/^.*[\\/]/, "")}`
            : "";

          const countryLabel =
            countryOptions.find((c) => c.value === String(conjunto.country))
              ?.label || conjunto.country;

          const cityLabel =
            datacountry
              ?.find((c) => String(c.ids) === String(conjunto.country))
              ?.city.find((c) => String(c.id) === String(conjunto.city))
              ?.name || conjunto.city;

          return (
            <div
              key={id}
              className={`w-full max-w-md p-4 hover:bg-white/50 hover:text-black rounded-lg shadow-2xl cursor-pointer transition-all duration-200 ${
                role === "tenant"
                  ? "bg-orange-500 text-white"
                  : "bg-cyan-800 text-white"
              }`}
              onClick={() => {
                setConjuntoId(conjunto.id);
                setConjuntoName(conjunto.name);
                setConjuntoImage(conjunto.file);
                setConjuntoApartment(String(apartment));
                setConjuntoTower(String(tower));
                setUserName(user.name);
                setUserLastName(user.lastName);
                setUserNumberId(user.numberId);
                setPlan(conjunto.plan);
                setImage(user.file);
                setNeighborhood(conjunto.neighborhood);
                setAddress(conjunto.address);
                setCity(conjunto.city);
                setReside(isMainResidence);
                setRole(role);
                setIsActive(conjunto.isActive);
                srtUserId(user.id);
                setCountry(conjunto.country);

                router.push(route.myprofile);
              }}
            >
              <section className="flex justify-between">
                <div>
                  <Title size="sm" font="bold">
                    {conjunto.name}
                  </Title>

                  <Text size="sm">{conjunto.address}</Text>

                  <Text size="sm">
                    {countryLabel} | {cityLabel} | {conjunto.neighborhood}
                  </Text>

                  <hr className="my-2" />

                  {apartment !== null && (
                    <Text size="sm">
                      <Text font="bold">
                        {tower}-{apartment}
                      </Text>
                    </Text>
                  )}
                </div>

                <Avatar
                  src={fileName}
                  alt={`${conjunto.name}`}
                  size="xxl"
                  border="thick"
                  shape="round"
                />
              </section>
            </div>
          );
        })}
      </div>

      {showModal && <ModalWelcome isOpen onClose={() => setShowModal(false)} />}
    </div>
  );
}
