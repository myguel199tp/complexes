"use client";

import {
  Button,
  InputField,
  Modal,
  Text,
  TextAreaField,
} from "complexes-next-components";
import React, { useEffect, useRef, useState } from "react";
import { IoImages } from "react-icons/io5";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import useForm from "../use-form";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  title: string;
  textmessage: string;
  nameUnit: string;
  mailAdmin: string;
  conjuntoId: string;
  fileUrl?: string;
}

export default function ModalEdit(props: Props) {
  const {
    isOpen,
    onClose,
    id,
    title,
    textmessage,
    nameUnit,
    mailAdmin,
    conjuntoId,
    fileUrl,
  } = props;

  console.log(fileUrl);

  const newsData = {
    id,
    title,
    textmessage,
    nameUnit,
    mailAdmin,
    conjuntoId,
    fileUrl,
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm(newsData);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const showAlert = useAlertStore((state) => state.showAlert);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setPreview(null);
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg"];

    if (!allowedTypes.includes(file.type)) {
      showAlert("Solo se permiten archivos PNG o JPG", "error");
      e.target.value = "";
      setPreview(null);
      return;
    }

    setValue("file", file, { shouldValidate: true });

    const fileUrl = URL.createObjectURL(file);
    setPreview(fileUrl);
  };

  useEffect(() => {
    if (fileUrl) {
      const fixedUrl = `${BASE_URL}/${fileUrl.replace(/\\/g, "/")}`;
      setPreview(fixedUrl);
    }
  }, [fileUrl, BASE_URL]);

  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar noticia"
      className="max-w-5xl w-full max-h-[90vh] overflow-y-auto"
    >
      <form
        onSubmit={handleSubmit}
        key={language}
        className="flex flex-col justify-center items-center w-full"
      >
        <section className="w-full flex flex-col gap-2 md:!flex-row my-2">
          <div className="w-full md:!w-[60%]">
            <InputField type="hidden" {...register("nameUnit")} />
            <InputField type="hidden" {...register("conjuntoId")} />
            <InputField type="hidden" {...register("mailAdmin")} />

            <InputField
              placeholder={t("noticiaTitulo")}
              required
              className="mt-2"
              {...register("title")}
              hasError={!!errors.title}
              errorMessage={errors.title?.message}
            />

            <TextAreaField
              className="mt-2 w-full"
              rows={8}
              maxLength={200}
              {...register("textmessage")}
              hasError={!!errors.textmessage}
              errorMessage={errors.textmessage?.message}
            />

            <Text size="xs" className="text-right text-gray-500">
              Minimo 10 - Máximo 200 caracteres
            </Text>
          </div>

          <div
            onClick={handleIconClick}
            className="w-full cursor-pointer md:w-[52%] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed p-6"
          >
            {!preview && (
              <>
                <IoImages className="text-gray-400 w-24 h-24" />
                <Text>Imagen de la noticia *</Text>
              </>
            )}

            <input
              type="file"
              accept="image/png, image/jpeg"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            {preview && (
              <Image
                src={preview}
                width={600}
                height={500}
                alt="preview"
                className="rounded-xl"
              />
            )}

            {errors.file && (
              <Text size="xs" colVariant="danger">
                {errors.file.message}
              </Text>
            )}
          </div>
        </section>

        <Button type="submit" className="mt-4">
          <Text>Editar noticia</Text>
        </Button>
      </form>
    </Modal>
  );
}
