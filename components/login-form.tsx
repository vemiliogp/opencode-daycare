"use client";

import Link from "next/link";
import { useState } from "react";

function SunIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export default function LoginForm() {
  const [email] = useState("caro@opendaycare.com");

  return (
    <div
      className="grid min-h-screen w-full"
      style={{ gridTemplateColumns: "1.05fr 1fr" }}
    >
      {/* Left decorative panel */}
      <div
        className="relative flex flex-col justify-between p-14 text-white lg:py-14 lg:px-[60px]"
        style={{
          background:
            "linear-gradient(155deg,#F6A98E 0%,#F2937A 45%,#EC7E62 100%)",
          overflow: "hidden",
        }}
      >
        <div
          className="absolute"
          style={{
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(255,255,255,.12)",
            top: -140,
            right: -120,
          }}
        />
        <div
          className="absolute"
          style={{
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,.10)",
            bottom: -110,
            left: -80,
          }}
        />

        {/* Brand */}
        <div
          className="relative flex items-center gap-[13px]"
          style={{ position: "relative" }}
        >
          <div
            className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px]"
            style={{ background: "rgba(255,255,255,.22)" }}
          >
            <SunIcon />
          </div>
          <span
            className="text-[21px] font-semibold tracking-[.5px]"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            OpenDayCare
          </span>
        </div>

        {/* Tagline */}
        <div className="relative">
          <h1
            className="mb-4.5 mt-0 text-[42px] font-semibold leading-[1.12]"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            El día de cada niño,
            <br />
            compartido con su familia.
          </h1>
          <p
            className="m-0 max-w-[430px] text-[17px] leading-[1.6]"
            style={{ color: "rgba(255,255,255,.92)" }}
          >
            Publicá momentos, gestioná las salas y mantené a las familias
            cerca, desde un solo lugar.
          </p>
        </div>

        {/* Footer badge */}
        <div
          className="relative text-[14px]"
          style={{ color: "rgba(255,255,255,.9)" }}
        >
          🌿 Guardería Sala Soles
        </div>
      </div>

      {/* Right form panel */}
      <div
        className="flex items-center justify-center p-10"
        style={{ background: "#FBF4EC" }}
      >
        <div className="w-full max-w-[392px]">
          <h2
            className="mb-1.5 mt-0 text-[30px] font-semibold"
            style={{ fontFamily: "var(--font-fredoka)", color: "#3F362E" }}
          >
            Iniciar sesión
          </h2>
          <p className="mb-7 mt-0 text-[15px]" style={{ color: "#94887B" }}>
            Ingresá para ver el día de hoy.
          </p>

          {/* Email */}
          <div
            className="mb-2 text-[12px] font-extrabold tracking-[.7px]"
            style={{ color: "#94887B" }}
          >
            EMAIL
          </div>
          <input
            type="email"
            defaultValue={email}
            className="mb-4.5 w-full rounded-[14px] border-[1.5px] bg-white px-4 py-3.5 text-[15px]"
            style={{ borderColor: "#EADFD0", color: "#3F362E" }}
          />

          {/* Password */}
          <div
            className="mb-2 text-[12px] font-extrabold tracking-[.7px]"
            style={{ color: "#94887B" }}
          >
            CONTRASEÑA
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className="mb-2.5 w-full rounded-[14px] border-[1.5px] bg-white px-4 py-3.5 text-[15px]"
            style={{ borderColor: "#EADFD0", color: "#3F362E" }}
          />

          {/* Forgot password link */}
          <div className="mb-5 text-right">
            <span
              className="cursor-pointer text-[13.5px] font-extrabold"
              style={{ color: "#C5503A" }}
            >
              ¿Olvidaste tu contraseña?
            </span>
          </div>

          {/* Submit button */}
          <Link
            href="/"
            className="block text-center text-[16px] font-extrabold text-white"
            style={{
              display: "block",
              padding: 15,
              borderRadius: 15,
              background: "linear-gradient(180deg,#F4977E,#EE8164)",
              boxShadow:
                "0 10px 22px -8px rgba(238,129,100,.7)",
              textAlign: "center",
            }}
          >
            Iniciar sesión
          </Link>

          {/* Activate account link */}
          <p className="mx-0 mb-0 mt-6 text-center text-[14.5px]" style={{ color: "#94887B" }}>
            ¿Te invitó la guardería?{" "}
            <Link
              href="/activar-cuenta"
              className="font-extrabold"
              style={{ color: "#C5503A" }}
            >
              Activá tu cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
