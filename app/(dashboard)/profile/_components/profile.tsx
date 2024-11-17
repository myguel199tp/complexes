import { Button, Buton } from "complexes-next-components";
import React from "react";
import Cardinfo from "./card-immovables/card-info";

export default function Profile() {
  const imagesSet1 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];

  const imagesSet2 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];
  const imagesSet3 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];
  const imagesSet4 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];
  return (
    <div>
      <div className="flex gap-10 justify-center mt-6">
        <Button size="full">Anuncio</Button>
        <Button size="full">Inmueble</Button>
      </div>
      <div className="flex gap-5 justify-center mt-10">
        <Buton>Tus publicaciones antiguas</Buton>
        <Buton>Tus publicaciones activas</Buton>
        <Buton>Tus publicaciones por vencer</Buton>
      </div>
      <div className="grid grid-cols-4 gap-2 h-screen mt-8">
        <Cardinfo images={imagesSet1} />
        <Cardinfo images={imagesSet2} />
        <Cardinfo images={imagesSet3} />
        <Cardinfo images={imagesSet4} />
      </div>
    </div>
  );
}
