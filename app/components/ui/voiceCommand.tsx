"use client";
import { useEffect, useRef } from "react";
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("webkitSpeechRecognition" in window)) return;

    const SpeechRecognition = window.webkitSpeechRecognition as unknown as {
      new (): SpeechRecognition;
    };

    const recognition = new SpeechRecognition();

    recognition.lang = "es-CO";
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
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [router]);

  return null;
}
