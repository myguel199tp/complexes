import { Tabs } from "complexes-next-components";
import React from "react";
import Cardinfo from "../card-immovables/card-info";

export default function Publications() {
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
  const tabs = [
    {
      label: "Antiguas",
      children: (
        <div className="grid grid-cols-4 gap-2 h-screen mt-8">
          <Cardinfo images={imagesSet1} />
          <Cardinfo images={imagesSet2} />
          <Cardinfo images={imagesSet3} />
          <Cardinfo images={imagesSet4} />
        </div>
      ),
      colVariant: "default",
      size: "md",
      background: "success",
      padding: "md",
      rounded: "md",
    },
    {
      label: "Activas",
      children: <div>publicaciones activas</div>,
      colVariant: "default",
      size: "md",
      background: "success",
      padding: "md",
      rounded: "md",
    },
    {
      label: "Por vencer",
      children: <div>publicaciones base de datos</div>,
      colVariant: "default",
      size: "md",
      background: "success",
      padding: "md",
      rounded: "md",
    },
  ];
  return (
    <div className="max-w-md mx-auto">
      <Tabs tabs={tabs} defaultActiveIndex={0} />
    </div>
  );
}
