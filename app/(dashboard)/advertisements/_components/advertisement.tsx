"use client";
import { Text, InputField } from "complexes-next-components";
import AdvertisementInfo from "./advertisement-info";
import Cardinfo from "./card-advertidement/card-info";

export default function Advertisement() {
  const { filteredData, formState, setFormState } = AdvertisementInfo();
  return (
    <div>
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl">
        <div className="flex flex-col md:!flex-row justify-center items-center gap-0 md:!gap-10">
          <Text className="text-white" font="bold" size="lg">
            Encuentra el mejor producto o servicio dentro de tu comunidad
          </Text>
        </div>

        <div className="p-2">
          <InputField
            placeholder="Buscar"
            rounded="lg"
            value={formState.search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormState((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>
      </section>

      <div className="grid grid-cols-1 md:!grid-cols-4 gap-2 h-screen mt-4">
        {filteredData.map((e) => {
          const infodata = e.files.map((file) =>
            typeof file === "string" ? file : file.filename
          );
          return (
            <Cardinfo
              key={e.id}
              images={infodata}
              phone={e.phone}
              email={e.email}
              description={e.description}
              name={e.name}
              profession={e.profession}
              nameUnit={e.nameUnit}
              webPage={e.webPage}
            />
          );
        })}
      </div>
    </div>
  );
}
