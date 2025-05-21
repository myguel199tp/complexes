"use client";
import { Buton, Text, InputField } from "complexes-next-components";
import { IoFilter } from "react-icons/io5";
import AdvertisementInfo from "./advertisement-info";
import Cardinfo from "./card-advertidement/card-info";

export default function Advertisement() {
  const {
    openModal,
    filteredData,
    formState,
    handleInputChange,
    setFormToogle,
  } = AdvertisementInfo();
  return (
    <div>
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl">
        <div className="flex flex-col md:!flex-row justify-center items-center gap-0 md:!gap-10">
          <Text className="text-white" font="bold" size="lg">
            _Lo que Buscas_
          </Text>

          <Buton size="md" borderWidth="thin" rounded="lg" onClick={openModal}>
            <div className="flex gap-1 cursor-pointer">
              <IoFilter size={20} className="text-white" />
              <Text className="text-white" size="sm">
                Filtros
              </Text>
            </div>
          </Buton>
        </div>

        <InputField
          className="bg-transparent text-gray-300"
          placeholder="Nombre"
          id="copInit"
          type="number"
          value={formState.names}
          onChange={handleInputChange}
        />

        <div className="p-2">
          <InputField
            placeholder="Buscar ciudad o barrio"
            rounded="lg"
            value={formState.search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormToogle((prev) => ({ ...prev, search: e.target.value }))
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
              key={e._id}
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
