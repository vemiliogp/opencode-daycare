"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

interface ActivateCodeEntryProps {
  invalidCode?: boolean;
}

export default function ActivateCodeEntry({ invalidCode }: ActivateCodeEntryProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(invalidCode ? "Este código no existe, ya fue usado o expiró. Probá con otro." : null);

    const trimmed = code.trim().toUpperCase();
    if (!trimmed || trimmed.length < 5) {
      setError("Ingresá un código válido de 5 caracteres");
      return;
    }

    setLoading(true);
    router.push(`/activar-cuenta?code=${trimmed}`);
  };

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
          Activar cuenta
        </h1>
        <p
          className="mb-[26px] mt-0 text-[15.5px] leading-[1.55]"
          style={{ color: "#94887B" }}
        >
          Ingresá el código de invitación que recibiste por email.
        </p>

        {error && (
          <div
            className="mb-4 rounded-[12px] bg-[#FBDAD6] p-3 text-[14px] text-[#C5413A]"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            className="mb-2 text-[12px] font-extrabold tracking-[.7px]"
            style={{ color: "#94887B" }}
          >
            CÓDIGO DE INVITACIÓN
          </div>
          <input
            type="text"
            placeholder="Ej. 7K4P9"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={5}
            className="mb-6 w-full rounded-[14px] border-[1.5px] bg-white px-4 py-3.5 text-center text-[24px] font-extrabold tracking-[7px] placeholder:tracking-normal placeholder:text-[15px]"
            style={{
              borderColor: "#EADFD0",
              color: "#3F362E",
              fontFamily: "var(--font-fredoka)",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className={`block w-full text-center text-[16px] font-extrabold text-white ${loading ? "opacity-60" : ""}`}
            style={{
              padding: 15,
              borderRadius: 15,
              background: "linear-gradient(180deg,#F4977E,#EE8164)",
              boxShadow: "0 10px 22px -8px rgba(238,129,100,.7)",
              border: "none",
              cursor: "pointer",
            }}
          >
            {loading ? "Buscando invitación..." : "Continuar"}
          </button>
        </form>

        <p
          className="mx-0 mb-0 mt-[22px] text-center text-[14.5px]"
          style={{ color: "#94887B" }}
        >
          ¿Ya tenés cuenta?{" "}
          <a
            href="/login"
            className="font-extrabold"
            style={{ color: "#C5503A", cursor: "pointer" }}
          >
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  );
}
