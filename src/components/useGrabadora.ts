"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Reconocedor = any;

interface Opciones {
  alTerminar: (audio: Blob, segundos: number, transcripcionNavegador: string) => void;
  alFallar: () => void;
}

const MAX_SEGUNDOS = 60;

/**
 * Graba con el micrófono real. Al mismo tiempo, si el navegador lo permite (Chrome/Edge),
 * transcribe en vivo con Web Speech API en español de Colombia como respaldo.
 */
export function useGrabadora({ alTerminar, alFallar }: Opciones) {
  const [grabando, setGrabando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [textoEnVivo, setTextoEnVivo] = useState("");

  const grabadorRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trozosRef = useRef<Blob[]>([]);
  const inicioRef = useRef(0);
  const relojRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconocedorRef = useRef<Reconocedor | null>(null);
  const finalRef = useRef("");
  const parcialRef = useRef("");
  const canceladoRef = useRef(false);
  const callbacks = useRef({ alTerminar, alFallar });
  callbacks.current = { alTerminar, alFallar };

  const limpiar = useCallback(() => {
    if (relojRef.current) clearInterval(relojRef.current);
    relojRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setGrabando(false);
    setSegundos(0);
    setTextoEnVivo("");
  }, []);

  const detenerReconocedor = useCallback(
    () =>
      new Promise<string>((resolver) => {
        const r = reconocedorRef.current;
        const terminar = () => resolver(`${finalRef.current} ${parcialRef.current}`.replace(/\s+/g, " ").trim());
        if (!r) return terminar();
        const tope = setTimeout(terminar, 1300);
        r.onend = () => {
          clearTimeout(tope);
          terminar();
        };
        try {
          r.stop();
        } catch {
          clearTimeout(tope);
          terminar();
        }
        reconocedorRef.current = null;
      }),
    [],
  );

  const detener = useCallback(() => {
    const g = grabadorRef.current;
    if (!g || g.state === "inactive") return;
    canceladoRef.current = false;
    g.stop();
  }, []);

  const cancelar = useCallback(() => {
    canceladoRef.current = true;
    grabadorRef.current?.state !== "inactive" && grabadorRef.current?.stop();
    try {
      reconocedorRef.current?.abort();
    } catch {}
    reconocedorRef.current = null;
    limpiar();
  }, [limpiar]);

  const iniciar = useCallback(async () => {
    if (grabando) return;
    let stream: MediaStream;
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("sin soporte");
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      callbacks.current.alFallar();
      return;
    }
    streamRef.current = stream;
    trozosRef.current = [];
    finalRef.current = "";
    parcialRef.current = "";
    canceladoRef.current = false;

    const tipo = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t));
    const grabador = new MediaRecorder(stream, tipo ? { mimeType: tipo } : undefined);
    grabador.ondataavailable = (e) => e.data.size > 0 && trozosRef.current.push(e.data);
    grabador.onstop = async () => {
      const seg = Math.max(1, Math.round((Date.now() - inicioRef.current) / 1000));
      const transcripcion = await detenerReconocedor();
      const blob = new Blob(trozosRef.current, { type: grabador.mimeType || "audio/webm" });
      const cancelado = canceladoRef.current;
      limpiar();
      if (cancelado) return;
      if (blob.size === 0) callbacks.current.alFallar();
      else callbacks.current.alTerminar(blob, seg, transcripcion);
    };
    grabadorRef.current = grabador;
    grabador.start(250);
    inicioRef.current = Date.now();
    setGrabando(true);
    relojRef.current = setInterval(() => {
      const seg = Math.floor((Date.now() - inicioRef.current) / 1000);
      setSegundos(seg);
      if (seg >= MAX_SEGUNDOS) grabador.state !== "inactive" && grabador.stop();
    }, 250);

    // Transcripción del navegador (respaldo cuando no hay clave de OpenAI)
    const Clase = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (Clase) {
      try {
        const r: Reconocedor = new Clase();
        r.lang = "es-CO";
        r.continuous = true;
        r.interimResults = true;
        r.onresult = (ev: any) => {
          let parcial = "";
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const res = ev.results[i];
            if (res.isFinal) finalRef.current += " " + res[0].transcript;
            else parcial += res[0].transcript;
          }
          parcialRef.current = parcial;
          setTextoEnVivo(`${finalRef.current} ${parcial}`.replace(/\s+/g, " ").trim());
        };
        r.onerror = () => {};
        r.start();
        reconocedorRef.current = r;
      } catch {
        reconocedorRef.current = null;
      }
    }
  }, [grabando, detenerReconocedor, limpiar]);

  useEffect(() => () => cancelar(), [cancelar]);

  return { grabando, segundos, textoEnVivo, iniciar, detener, cancelar };
}
