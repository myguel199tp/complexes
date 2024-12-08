import { useAntiquityData } from "./fetch-antiquity-data";
import { useParkingData } from "./fetch-parking-data";
import { useRestroomData } from "./fetch-restroom-data";
import { useRoomData } from "./fetch-room-data";

export default function RegisterOptions() {
  const { data: parkings } = useParkingData();
  const { data: antiquitys } = useAntiquityData();
  const { data: restrooms } = useRestroomData();
  const { data: rooms } = useRoomData();

  const parkingOptions =
    parkings?.map((parking) => ({
      value: parking.id,
      label: parking.name,
    })) || [];

  const antiquitygOptions =
    antiquitys?.map((antiquity) => ({
      value: antiquity.id,
      label: antiquity.name,
    })) || [];

  const restrooomOptions =
    restrooms?.map((restroom) => ({
      value: restroom.id,
      label: restroom.name,
    })) || [];

  const roomOptions =
    rooms?.map((room) => ({
      value: room.id,
      label: room.name,
    })) || [];

  return { antiquitygOptions, parkingOptions, restrooomOptions, roomOptions };
}
