# Módulo: Vue 3 + Vite + Tailwind CSS + shadcn-vue

Este módulo cubre la configuración del stack frontend: Vue 3, Vite, Tailwind CSS v4 y shadcn-vue.

## Crear el Proyecto Base

### Crear el proyecto con pnpm

```bash
pnpm create vue@latest nombre-del-proyecto
```

Durante la configuración interactiva, selecciona:

- ✅ **TypeScript**: Yes
- ✅ **JSX Support**: No (a menos que lo necesites)
- ✅ **Router**: Yes (Vue Router)
- ✅ **Pinia**: Yes (gestión de estado)
- ✅ **Vitest**: Opcional (para testing)
- ✅ **End-to-End Testing Solution**: Opcional
- ✅ **ESLint**: Yes
- ✅ **Prettier**: Yes

### Navegar al directorio del proyecto

```bash
cd nombre-del-proyecto
```

### Instalar dependencias iniciales

```bash
pnpm install
```

## Instalar Dependencias Adicionales

**Nota**: `pnpm create vue@latest` ya instala Vue, Vue Router, Pinia, Vite, TypeScript, ESLint y Prettier. Solo necesitas instalar las dependencias adicionales que no vienen por defecto.

### Dependencias de desarrollo

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

## Configurar Vite

**Nota**: El archivo `vite.config.ts` ya viene creado con el init. Solo necesitas agregar los plugins adicionales.

### Actualizar `vite.config.ts`

```typescript
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

## Configurar Tailwind CSS v4

### Archivo `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
```

### Archivo CSS principal (`src/assets/css/main.css`)

Crea el archivo CSS básico con las importaciones de Tailwind. Las variables CSS completas se configurarán junto con shadcn-vue:

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));
```

**Nota**: Las variables CSS completas para shadcn-vue se agregarán en la siguiente sección.

### Importar CSS en `src/main.ts`

Asegúrate de importar el CSS al inicio del archivo:

```typescript
import '@/assets/css/main.css'
```

## Configurar shadcn-vue

**Importante**: shadcn-vue no es una biblioteca que se instala como dependencia. Es una colección de componentes reutilizables que se copian directamente a tu proyecto, dándote control total sobre el código. Los componentes están estilizados con Tailwind CSS.

### Agregar dependencias requeridas

shadcn-vue requiere las siguientes dependencias para funcionar correctamente:

```bash
pnpm add reka-ui class-variance-authority clsx tailwind-merge lucide-vue-next tw-animate-css @vueuse/core
```

**Explicación de las dependencias**:

- **`reka-ui`**: Biblioteca de componentes primitivos que shadcn-vue usa como base. Es requerida porque los componentes de shadcn-vue dependen de los primitivos de Reka UI.
- **`class-variance-authority`**: Utilidad para crear variantes de componentes con clases CSS.
- **`clsx`** y **`tailwind-merge`**: Utilidades para combinar y fusionar clases de Tailwind CSS.
- **`lucide-vue-next`**: Biblioteca de iconos que shadcn-vue usa por defecto.
- **`tw-animate-css`**: Animaciones CSS para Tailwind.
- **`@vueuse/core`**: Biblioteca de utilidades de Vue que los componentes de shadcn-vue usan para funcionalidades como `reactiveOmit`, `useVModel`, `useEventListener`, `useMediaQuery`, entre otras. Aunque no está mencionada en la documentación oficial de shadcn-vue, los componentes copiados al proyecto la requieren.

### Configurar path aliases

Configura los path aliases en tu archivo `tsconfig.json`. Si ya tienes configurado el alias `@`, verifica que esté así:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

El alias `@` es una preferencia. Puedes usar otros aliases si lo deseas.

### Configurar estilos

Actualiza tu archivo CSS (`src/assets/css/main.css`) con las siguientes variables CSS. Puedes aprender más sobre el uso de variables CSS para theming en la [sección de theming de shadcn-vue](https://www.shadcn-vue.com/docs/theming).

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Agregar helper `cn`

Crea el archivo `src/lib/utils.ts` con el helper `cn`:

```typescript
import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Crear archivo `components.json`

Crea un archivo `components.json` en la raíz de tu proyecto:

```json
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "new-york",
  "typescript": true,
  "tailwind": {
    "config": "",
    "css": "src/assets/css/main.css",
    "baseColor": "green",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "composables": "@/composables",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib"
  },
  "iconLibrary": "lucide"
}
```

**Nota**: Ajusta la ruta `css` según la ubicación de tu archivo CSS principal. Si está en `src/assets/css/main.css`, déjalo como está. Si está en otra ubicación (por ejemplo, `src/styles/globals.css`), actualiza la ruta.

### Agregar componentes, blocks y charts

Ahora puedes empezar a agregar componentes a tu proyecto usando el CLI de shadcn-vue. Cuando ejecutas el comando `add`, shadcn-vue copia el código del componente directamente a tu proyecto en `src/components/ui/`.

**Nota**: El theme Green ya está configurado en el archivo `components.json` creado anteriormente (`"baseColor": "green"`).

#### Agregar todos los charts disponibles

Agrega todos los charts disponibles:

```bash
npx shadcn-vue@latest add chart-1
npx shadcn-vue@latest add chart-2
npx shadcn-vue@latest add chart-3
npx shadcn-vue@latest add chart-4
npx shadcn-vue@latest add chart-5
```

#### Agregar blocks

Agrega los blocks necesarios para el proyecto:

```bash
npx shadcn-vue@latest add login-05
npx shadcn-vue@latest add signup-05
npx shadcn-vue@latest add otp-05
npx shadcn-vue@latest add sidebar-07
npx shadcn-vue@latest add dashboard-01
```

**Nota**: Los componentes, blocks y charts se copian a tu proyecto, no se instalan como dependencias. Esto significa que puedes modificar el código según tus necesidades. El CLI de shadcn-vue solo facilita la adición inicial de los elementos.

## Configurar Pinia

**Nota**: Si seleccionaste Pinia durante `pnpm create vue@latest`, ya viene configurado en `src/main.ts`. Solo necesitas crear tus stores.

### Verificar configuración de Pinia en `src/main.ts`

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

### Crear tu primer store

Ejemplo de store en `src/stores/example.ts`:

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExampleStore = defineStore('example', () => {
  const count = ref(0)

  function increment() {
    count.value++
  }

  return { count, increment }
})
```


