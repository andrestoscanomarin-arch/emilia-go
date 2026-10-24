"use client";

import { useEffect, useState } from "react";
import { actualizar, useEstado } from "@/lib/store";
import Telefono from "./Telefono";
import Delta from "./Delta";
import PanelDemo from "./PanelDemo";
import Confeti from "./Confeti";

const ANCHO = 1920;
const ALTO = 1080;

/** Todo se diseña a 1920x1080 y se escala para caber en cualquier pantalla o proyector */
function useEscala() {
  const [escala, setEscala] = useState(1);
  useEffect(() => {
    const calcular = () => setEscala(Math.min(window.innerWidth / ANCHO, window.innerHeight / ALTO));
    calcular();
    window.addEventListener("resize", calcular);
    return () => window.removeEventListener("resize", calcular);
  }, []);
  return escala;
}

export default function App() {
  const escala = useEscala();
  const s = useEstado();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ESTATICO) {
      // Versión en la nube sin servidor: solo respaldos
      actualizar((st) => {
        st.servicios = { claude: false, openai: false };
      });
      return;
    }
    fetch("/api/estado")
      .then((r) => r.json())
      .then((servicios: { claude: boolean; openai: boolean }) =>
        actualizar((st) => {
          st.servicios = servicios;
        }),
      )
      .catch(() =>
        actualizar((st) => {
          st.servicios = { claude: false, openai: false };
        }),
      );
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-[#e6e9ef]">
      <div
        className="relative shrink-0 overflow-hidden bg-fondo"
        style={{ width: ANCHO, height: ALTO, transform: `scale(${escala})`, transformOrigin: "center" }}
      >
        <div className="flex h-full">
          {/* Izquierda: el celular */}
          <section className="relative flex w-[500px] shrink-0 flex-col items-center pt-9">
            <div className="mb-5 text-center">
              <div className="flex items-center justify-center gap-2.5">
                <span className="text-[30px] leading-none">💬</span>
                <h1 className="text-[34px] font-extrabold tracking-tight text-navy">
                  Emilia <span className="text-naranja">Go</span>
                </h1>
              </div>
              <p className="mt-1.5 max-w-[440px] text-[14.5px] leading-snug text-gris">
                No le pidas a la gente que vaya a Delta.{" "}
                <span className="font-semibold text-navy">Lleva a Delta a donde ya está la gente.</span>
              </p>
            </div>
            <Telefono />
          </section>

          {/* Derecha: la plataforma Delta Teams */}
          <section className="min-w-0 flex-1 py-7 pr-7">
            <Delta />
          </section>
        </div>

        <PanelDemo />
        {s.celebracion && Date.now() - s.celebracion.t < 4000 && <Confeti key={s.celebracion.t} />}
      </div>
    </div>
  );
}
