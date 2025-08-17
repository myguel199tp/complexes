import { useMutation } from "@tanstack/react-query";
import { DataRegister } from "../../../services/authService";
import { useRegisterStore } from "../../store/registerStore";
import { SearchConjuntoResponse } from "../../../services/response/searchConjntoResponse";

export function useMutationByNit() {
  const api = new DataRegister();
  const {
    setNameConjunto,
    setNitConjunto,
    setAddressConjunto,
    setCityConjunto,
    setCountryConjunto,
    setNeigBoorConjunto,
    setPrices,
    setQuantity,
    showRegistThree,
    setIdConjunto,
  } = useRegisterStore();

  return useMutation<SearchConjuntoResponse, Error, string>({
    mutationFn: async (nit: string) => {
      const result = await api.searchByNit(nit);
      return result;
    },
    onSuccess: (data) => {
      const conjunto = data.conjunto;
      console.log("desde aca es", conjunto.id);
      if (conjunto) {
        setNameConjunto(conjunto.name);
        setNitConjunto(conjunto.nit);
        setAddressConjunto(conjunto.address);
        setCityConjunto(conjunto.city);
        setCountryConjunto(conjunto.country);
        setNeigBoorConjunto(conjunto.neighborhood);
        setPrices(conjunto.prices);
        setQuantity(conjunto.quantityapt);
        setIdConjunto(conjunto.id);
        showRegistThree(); // Solo se llama si todo fue exitoso
      }
    },
  });
}
