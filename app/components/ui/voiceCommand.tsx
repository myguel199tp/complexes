"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

const commandMap: Record<string, string> = {
  anuncios: route.advertisement,
  servicios: route.us,
  inmuebles: route.immovables,
  alquiler: route.holiday,
  registrarme: route.registers,
  inicio: "/complexes",
  perfil: route.ensemble,
};

export default function VoiceCommands() {
  const router = useRouter();

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.log("Reconocimiento de voz no soportado");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "es-CO"; // puedes cambiar a "es-ES"
    recognition.continuous = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex][0].transcript
        .toLowerCase()
        .trim();

      for (const [key, path] of Object.entries(commandMap)) {
        if (result.includes(key)) {
          router.push(path);
          break;
        }
      }
    };

    recognition.start();
    return () => recognition.stop();
  }, [router]);

  return null;
}
