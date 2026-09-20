"use client";

import Link from "next/link";
import { useState, useCallback, useId } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

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
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        const supabase = createClient();
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          if (signInError.message.includes("Email not confirmed")) {
            setError("Tu cuenta no ha sido confirmada. Revisá tu email.");
          } else {
            setError("Credenciales inválidas. Intentá de nuevo.");
          }
          setLoading(false);
          return;
        }

        if (data.session) {
          router.push("/");
          router.refresh();
        }
      } catch {
        setError("Ocurrió un error inesperado. Intentá de nuevo.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, router],
  );

  return (
    <div
      className="grid min-h-screen w-full lg:grid-cols-[1.05fr_1fr]"
    >
      {/* Left decorative panel */}
      <aside
        aria-label="Información de OpenDayCare"
        className="relative hidden flex-col justify-between p-14 text-white lg:flex lg:py-14 lg:px-[60px]"
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
      </aside>

      {/* Right form panel */}
      <main
        className="flex w-full items-center justify-center p-10 lg:col-start-2"
        style={{ background: "#FBF4EC" }}
        aria-label="Iniciar sesión"
      >
        <div className="w-full max-w-[392px]" role="form" aria-labelledby="login-heading">
          <h2
            id="login-heading"
            className="mb-1.5 mt-0 text-[30px] font-semibold"
            style={{ fontFamily: "var(--font-fredoka)", color: "#3F362E" }}
          >
            Iniciar sesión
          </h2>
          <p className="mb-7 mt-0 text-[15px]" style={{ color: "#6B5B4A" }}>
            Ingresá para ver el día de hoy.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm"
              style={{ color: "#C5503A" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <label
              htmlFor={emailId}
              className="mb-2 block text-[12px] font-extrabold tracking-[.7px]"
              style={{ color: "#6B5B4A" }}
            >
              EMAIL
            </label>
            <input
              id={emailId}
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="correo@ejemplo.com"
              className="mb-4.5 w-full rounded-[14px] border-[1.5px] bg-white px-4 py-3.5 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5503A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF4EC]"
              style={{ borderColor: "#EADFD0", color: "#3F362E" }}
            />

            {/* Password */}
            <label
              htmlFor={passwordId}
              className="mb-2 block text-[12px] font-extrabold tracking-[.7px]"
              style={{ color: "#6B5B4A" }}
            >
              CONTRASEÑA
            </label>
            <input
              id={passwordId}
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mb-2.5 w-full rounded-[14px] border-[1.5px] bg-white px-4 py-3.5 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5503A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF4EC]"
              style={{ borderColor: "#EADFD0", color: "#3F362E" }}
            />

            {/* Forgot password link */}
            <div className="mb-5 text-right">
              <button
                type="button"
                className="cursor-pointer bg-transparent text-[13.5px] font-extrabold rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5503A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF4EC]"
                style={{ color: "#A8452E" }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              aria-disabled={loading}
              className="block w-full text-center text-[16px] font-extrabold text-white rounded-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F362E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF4EC]"
              style={{
                padding: 15,
                borderRadius: 15,
                background: "linear-gradient(180deg,#F4977E,#EE8164)",
                boxShadow:
                  "0 10px 22px -8px rgba(238,129,100,.7)",
                textAlign: "center",
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                border: "none",
              }}
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          {/* Activate account link */}
          <p className="mx-0 mb-0 mt-6 text-center text-[14.5px]" style={{ color: "#6B5B4A" }}>
            ¿Te invitó la guardería?{" "}
            <Link
              href="/activar-cuenta"
              className="font-extrabold rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5503A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF4EC]"
              style={{ color: "#A8452E" }}
            >
              Activá tu cuenta
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
