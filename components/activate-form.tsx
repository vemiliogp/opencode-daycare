"use client";

import Link from "next/link";

function SunIcon() {
  return (
    <svg
      width="30"
      height="30"
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

function CheckMark() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function ActivateForm() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-10 py-10"
      style={{ background: "#FBF4EC" }}
    >
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div
          className="mb-[22px] flex h-[58px] w-[58px] items-center justify-center rounded-[18px]"
          style={{
            background: "linear-gradient(155deg,#F8C3A8,#F2937A)",
            boxShadow: "0 12px 26px -10px rgba(238,129,100,.65)",
          }}
        >
          <SunIcon />
        </div>

        {/* Title */}
        <h1
          className="mb-2 mt-0 text-[32px] font-semibold leading-[1.15]"
          style={{ fontFamily: "var(--font-fredoka)", color: "#3F362E" }}
        >
          Bienvenida a OpenDayCare
        </h1>
        <p
          className="mb-[26px] mt-0 text-[15.5px] leading-[1.55]"
          style={{ color: "#94887B" }}
        >
          Te invitaron a seguir el día de tu hijo. Creá tu contraseña para
          activar la cuenta.
        </p>

        {/* Child card */}
        <div
          className="mb-[22px] flex items-center gap-[14px] rounded-[16px] border-[1.5px] p-[14px_16px]"
          style={{ borderColor: "#EADFD0", background: "#fff" }}
        >
          <div
            className="flex h-[44px] w-[44px] items-center justify-center rounded-full text-[19px] font-semibold"
            style={{
              background: "#A9D9E8",
              color: "#1F7A93",
              fontFamily: "var(--font-fredoka)",
            }}
          >
            M
          </div>
          <div>
            <div className="text-[13px]" style={{ color: "#94887B" }}>
              Te invitaron a seguir a
            </div>
            <div
              className="text-[17px] font-semibold"
              style={{
                fontFamily: "var(--font-fredoka)",
                color: "#3F362E",
              }}
            >
              Mateo · Sala Soles
            </div>
          </div>
        </div>

        {/* Invitation code */}
        <div
          className="mb-2 text-[12px] font-extrabold tracking-[.7px]"
          style={{ color: "#94887B" }}
        >
          CÓDIGO DE INVITACIÓN
        </div>
        <input
          defaultValue="7K4P9"
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] bg-white px-4 py-3.5 text-[18px] font-extrabold tracking-[3px]"
          style={{
            borderColor: "#EADFD0",
            color: "#3F362E",
            fontFamily: "var(--font-fredoka)",
          }}
        />

        {/* Email */}
        <div
          className="mb-2 text-[12px] font-extrabold tracking-[.7px]"
          style={{ color: "#94887B" }}
        >
          EMAIL
        </div>
        <input
          type="email"
          defaultValue="lucia.fernandez@gmail.com"
          className="mb-[18px] w-full rounded-[14px] border-[1.5px] bg-white px-4 py-3.5 text-[15px]"
          style={{
            borderColor: "#EADFD0",
            color: "#3F362E",
          }}
        />

        {/* Create password */}
        <div
          className="mb-2 text-[12px] font-extrabold tracking-[.7px]"
          style={{ color: "#94887B" }}
        >
          CREAR CONTRASEÑA
        </div>
        <input
          type="password"
          defaultValue="contraseña"
          className="mb-6 w-full rounded-[14px] border-[1.5px] bg-white px-4 py-3.5 text-[15px]"
          style={{
            borderColor: "#F2A78E",
            color: "#3F362E",
          }}
        />

        {/* Consent checkbox */}
        <label
          className="mb-6 flex items-start gap-[12px] rounded-[14px] p-[14px_16px]"
          style={{
            background: "#FBF1D6",
            cursor: "pointer",
          }}
        >
          <span
            className="flex h-[24px] w-[24px] flex-none items-center justify-center rounded-[8px] mt-[1px]"
            style={{ background: "#5FB97E" }}
          >
            <CheckMark />
          </span>
          <span
            className="text-[14px] leading-[1.45]"
            style={{ color: "#8A7234" }}
          >
            Autorizo a la guardería a tomar y compartir fotos de mi hijo
            dentro de la app.
          </span>
        </label>

        {/* Activate button */}
        <Link
          href="/"
          className="block text-center text-[16px] font-extrabold text-white"
          style={{
            padding: 15,
            borderRadius: 15,
            background: "linear-gradient(180deg,#F4977E,#EE8164)",
            boxShadow: "0 10px 22px -8px rgba(238,129,100,.7)",
          }}
        >
          Activar mi cuenta
        </Link>

        {/* Login link */}
        <p
          className="mx-0 mb-0 mt-[22px] text-center text-[14.5px]"
          style={{ color: "#94887B" }}
        >
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="font-extrabold"
            style={{ color: "#C5503A" }}
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
