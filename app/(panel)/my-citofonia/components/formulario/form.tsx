// "use client";
// import { Buton, InputField, Text, Button } from "complexes-next-components";
// import React, { useRef, useState } from "react";
// import { IoImages } from "react-icons/io5";
// import useForm from "./use-form";
// import Image from "next/image";

// export default function Form() {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const cameraInputRef = useRef<HTMLInputElement>(null);
//   const [preview, setPreview] = useState<string | null>(null);

//   const {
//     register,
//     setValue,
//     formState: { errors },
//     handleSubmit,
//     isSuccess,
//   } = useForm();

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setValue("file", file, { shouldValidate: true });
//       const fileUrl = URL.createObjectURL(file);
//       setPreview(fileUrl);
//     } else {
//       setPreview(null);
//     }
//   };

//   const handleGalleryClick = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };

//   const handleCameraClick = () => {
//     if (cameraInputRef.current) {
//       cameraInputRef.current.click();
//     }
//   };

//   return (
//     <div className="w-full">
//       <form
//         onSubmit={handleSubmit}
//         className="flex flex-col justify-center items-center w-full p-6"
//       >
//         <section className="w-full flex flex-col md:!flex-row">
//           <div className="w-full md:!w-[70%]">
//             <InputField
//               placeholder="nombre del visitante"
//               inputSize="full"
//               rounded="md"
//               className="mt-2"
//               type="text"
//               {...register("namevisit")}
//               hasError={!!errors.namevisit}
//               errorMessage={errors.namevisit?.message}
//             />
//             <InputField
//               placeholder="Número de identificación"
//               inputSize="full"
//               rounded="md"
//               className="mt-2"
//               type="text"
//               {...register("numberId")}
//               hasError={!!errors.numberId}
//               errorMessage={errors.numberId?.message}
//             />
//             <InputField type="hidden" {...register("nameUnit")} />

//             <InputField
//               placeholder="Número de casa o apartamento"
//               inputSize="full"
//               rounded="md"
//               className="mt-2"
//               type="text"
//               {...register("apartment")}
//               hasError={!!errors.apartment}
//               errorMessage={errors.apartment?.message}
//             />
//             <InputField
//               placeholder="Número de placa"
//               inputSize="full"
//               rounded="md"
//               className="mt-2"
//               type="text"
//               {...register("plaque")}
//               hasError={!!errors.plaque}
//               errorMessage={errors.plaque?.message}
//             />
//           </div>

//           <div className="w-full md:!w-[30%] mt-2 md!mt-0 ml-2 justify-center items-center border-x-4 border-cyan-800 p-2">
//             {!preview && (
//               <>
//                 <IoImages
//                   size={150}
//                   onClick={handleGalleryClick}
//                   className="cursor-pointer text-cyan-800"
//                 />
//                 <div className="flex justify-center items-center gap-2 mt-2">
//                   <Button
//                     size="sm"
//                     colVariant="primary"
//                     onClick={handleGalleryClick}
//                   >
//                     Subir desde galería
//                   </Button>
//                   <Button
//                     size="sm"
//                     colVariant="primary"
//                     onClick={handleCameraClick}
//                   >
//                     Tomar foto
//                   </Button>
//                 </div>
//                 <div className="flex justify-center items-center">
//                   <Text size="sm">solo archivos png - jpg</Text>
//                 </div>
//               </>
//             )}

//             {/* Input normal (galería) */}
//             <input
//               type="file"
//               accept="image/*"
//               ref={fileInputRef}
//               className="hidden"
//               onChange={handleFileChange}
//             />

//             {/* Input con cámara */}
//             <input
//               type="file"
//               accept="image/*"
//               capture="environment" // "user" para frontal
//               ref={cameraInputRef}
//               className="hidden"
//               onChange={handleFileChange}
//             />

//             {preview && (
//               <div className="block">
//                 <div className="mt-3">
//                   <Image
//                     src={preview}
//                     width={200}
//                     height={200}
//                     alt="Vista previa"
//                     className="w-full max-w-xs rounded-md border"
//                   />
//                 </div>
//                 <Button
//                   className="p-2 mt-2"
//                   colVariant="primary"
//                   size="sm"
//                   onClick={handleGalleryClick}
//                 >
//                   Cargar otra
//                 </Button>
//               </div>
//             )}

//             {errors.file && (
//               <p className="text-red-500 text-sm mt-1">{errors.file.message}</p>
//             )}
//           </div>
//         </section>

//         <Buton
//           colVariant="primary"
//           size="full"
//           rounded="lg"
//           borderWidth="semi"
//           type="submit"
//           className="mt-4"
//           disabled={isSuccess}
//         >
//           <Text>Agregar Visitante</Text>
//         </Buton>
//       </form>
//     </div>
//   );
// }
"use client";
import { InputField, Text, Button } from "complexes-next-components";
import React, { useRef, useState } from "react";
import { IoCamera, IoImages } from "react-icons/io5";
import useForm from "./use-form";
import Image from "next/image";

export default function Form() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
    isSuccess,
  } = useForm();

  const handleGalleryClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    }
  };

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Error abriendo cámara:", err);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        const imageData = canvasRef.current.toDataURL("image/png");

        // convertir base64 a File
        fetch(imageData)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "foto.png", { type: "image/png" });
            setValue("file", file, { shouldValidate: true });
          });

        setPreview(imageData);
        setIsCameraOpen(false);

        // detener la cámara
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach((track) => track.stop());
      }
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center w-full p-6"
      >
        <section className="w-full flex flex-col md:!flex-row my-8">
          <div className="w-full md:!w-[70%]">
            {/* Tus inputs normales */}
            <InputField
              placeholder="Nombre del visitante"
              {...register("namevisit")}
              hasError={!!errors.namevisit}
              errorMessage={errors.namevisit?.message}
            />
            <InputField
              placeholder="Número de identificación"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("numberId")}
              hasError={!!errors.numberId}
              errorMessage={errors.numberId?.message}
            />
            <InputField type="hidden" {...register("nameUnit")} />

            <InputField
              placeholder="Número de casa o apartamento"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("apartment")}
              hasError={!!errors.apartment}
              errorMessage={errors.apartment?.message}
            />
            <InputField
              placeholder="Número de placa"
              inputSize="full"
              rounded="md"
              className="mt-2"
              type="text"
              {...register("plaque")}
              hasError={!!errors.plaque}
              errorMessage={errors.plaque?.message}
            />
          </div>

          <div className="w-full md:!w-[30%] mt-2 ml-2 flex flex-col justify-center items-center border-x-4 p-2">
            {!preview && !isCameraOpen && (
              <div className="flex flex-col items-center gap-2">
                <IoImages
                  size={90}
                  onClick={handleGalleryClick}
                  className="cursor-pointer text-gray-300"
                />
                <Button
                  size="sm"
                  colVariant="warning"
                  className="flex gap-4 items-center"
                  onClick={openCamera}
                >
                  <IoCamera className="mr-1" size={30} />
                  <Text>Tomar foto</Text>
                </Button>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            {isCameraOpen && (
              <div className="flex flex-col items-center">
                <video ref={videoRef} className="w-48 border rounded-md" />
                <Button
                  size="sm"
                  colVariant="primary"
                  className="mt-2"
                  onClick={takePhoto}
                >
                  Capturar
                </Button>
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={200}
                  className="hidden"
                />
              </div>
            )}

            {preview && (
              <div className="mt-3">
                <Image
                  src={preview}
                  width={200}
                  height={200}
                  alt="Vista previa"
                  className="rounded-md border"
                />
                <Button
                  size="sm"
                  className="mt-2"
                  colVariant="primary"
                  onClick={openCamera}
                >
                  Tomar otra
                </Button>
              </div>
            )}
          </div>
        </section>

        <Button
          colVariant="warning"
          size="full"
          rounded="lg"
          type="submit"
          className="mt-4"
          disabled={isSuccess}
        >
          <Text>Agregar Visitante</Text>
        </Button>
      </form>
    </div>
  );
}
