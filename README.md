# Open Daycare

Plataforma de gestión para guarderías. Construida con Next.js 16, React 19, Tailwind CSS v4 y Supabase.

## Requisitos

- **Node.js 20+** y npm
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) (recomendado para desarrollo local)
- [opencode](https://opencode.ai) con el servidor MCP de Supabase configurado (opcional, para operaciones con la base de datos desde el editor)

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y completa las credenciales:

```bash
cp .env.template .env.local
```

Edita `.env.local` con los valores de tu proyecto Supabase:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (anon key) del proyecto |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (solo servidor) |
| `SUPABASE_DB_PASSWORD` | Contraseña de la base de datos Postgres |
| `RESEND_API_KEY` | API key de Resend para envío de correos |

### 3. Autenticar Supabase CLI (MCP)

El MCP de Supabase usa la sesión del CLI. Para autenticarte:

```bash
npx supabase login
```

Esto abre el navegador y te pide iniciar sesión en Supabase. Una vez hecho, el CLI guarda un token en `~/.supabase/config.toml` que el MCP utiliza automáticamente.

Para enlazar un proyecto existente:

```bash
npx supabase link --project-ref <tu-project-ref>
```

El project-ref lo encuentras en la URL del dashboard de Supabase o en `supabase/migrations/` si ya está enlazado.

Para validar que el MCP está autenticado correctamente:

```bash
opencode mcp auth supabase
```

> **Nota:** Sin autenticación, las herramientas del MCP (apply migration, deploy edge function, query logs, etc.) no podrán conectar con tu proyecto.

### 4. Aplicar migraciones

Si trabajas con un proyecto remoto (recomendado para equipo):

```bash
npx supabase db push
```

Para desarrollo local con Supabase Stack:

```bash
npx supabase start
npx supabase db reset
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Comandos útiles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (incluye type-check) |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check |
| `npx supabase login` | Autenticar CLI / MCP |
| `npx supabase link --project-ref <ref>` | Enlazar proyecto |
| `npx supabase db push` | Aplicar migraciones al remoto |
| `npx supabase start` | Levantar Supabase local |

## Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS v4
- **Backend:** Supabase (Postgres, Auth, Edge Functions, Realtime)
- **Email:** Resend
- **Package manager:** npm
