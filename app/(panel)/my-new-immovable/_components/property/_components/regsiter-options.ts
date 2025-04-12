import { useAntiquityData } from "./fetch-antiquity-data";
import { useOfertData } from "./fetch-ofert-data";
import { useParkingData } from "./fetch-parking-data";
import { usePropertyData } from "./fetch-property-data";
import { useRestroomData } from "./fetch-restroom-data";
import { useRoomData } from "./fetch-room-data";
import { useStratumData } from "./fetch-stratum-data";

export default function RegisterOptions() {
  const { data: parkings } = useParkingData();
  const { data: antiquitys } = useAntiquityData();
  const { data: restrooms } = useRestroomData();
  const { data: rooms } = useRoomData();
  const { data: ofert } = useOfertData();
  const { data: property } = usePropertyData();
  const { data: stratum } = useStratumData();

  const parkingOptions =
    parkings?.map((parking) => ({
      value: `${parking.id}`,
      label: `${parking.name} Parqueos`,
    })) || [];

  const antiquitygOptions =
    antiquitys?.map((antiquity) => ({
      value: `${antiquity.id}`,
      label: `${antiquity.name} Años`,
    })) || [];

  const restroomOptions =
    restrooms?.map((restroom) => ({
      value: `${restroom.id}`,
      label: `${restroom.name} Baños`,
    })) || [];

  const roomOptions =
    rooms?.map((room) => ({
      value: `${room.id}`,
      label: `${room.name} Habitaciones`,
    })) || [];

  const ofertOptions =
    ofert?.map((ofert) => ({
      value: `${ofert.id}`,
      label: ofert.name,
    })) || [];

  const propertyOptions =
    property?.map((property) => ({
      value: `${property.id}`,
      label: property.name,
    })) || [];

  const stratumOptions =
    stratum?.map((stratum) => ({
      value: `${stratum.id}`,
      label: stratum.name,
    })) || [];

  return {
    antiquitygOptions,
    parkingOptions,
    restroomOptions,
    roomOptions,
    ofertOptions,
    propertyOptions,
    stratumOptions,
  };
}
