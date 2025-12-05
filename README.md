# Piokemon - Vue 3 + Vite + Tailwind CSS + shadcn-vue

Proyecto Vue 3 configurado con Vite, Tailwind CSS v4 y shadcn-vue según las especificaciones del módulo.

## Stack Tecnológico

- **Vue 3** - Framework JavaScript progresivo
- **Vite** - Build tool y dev server
- **TypeScript** - Tipado estático
- **Vue Router** - Enrutamiento
- **Pinia** - Gestión de estado
- **Tailwind CSS v4** - Framework CSS utility-first
- **shadcn-vue** - Componentes UI reutilizables
- **ESLint** - Linter
- **Prettier** - Formateador de código

## Instalación

Las dependencias ya están instaladas. Si necesitas reinstalarlas:

```bash
pnpm install
```

## Scripts Disponibles

```bash
# Desarrollo
pnpm dev

# Build para producción
pnpm build

# Preview del build
pnpm preview

# Linting
pnpm lint
```

## Estructura del Proyecto

```
piokemon/
├── src/
│   ├── assets/
│   │   └── css/
│   │       └── main.css          # Estilos principales con variables CSS de shadcn-vue
│   ├── components/
│   │   ├── ui/                    # Componentes UI de shadcn-vue
│   │   ├── LoginForm.vue         # Block login-05
│   │   ├── SignupForm.vue        # Block signup-05
│   │   ├── OTPForm.vue           # Block otp-05
│   │   ├── AppSidebar.vue        # Block sidebar-07
│   │   └── ...                    # Otros componentes del dashboard-01
│   ├── lib/
│   │   └── utils.ts               # Helper `cn` para clases CSS
│   ├── router/
│   │   └── index.ts              # Configuración de Vue Router
│   ├── stores/
│   │   └── example.ts            # Store de ejemplo de Pinia
│   ├── views/
│   │   └── HomeView.vue          # Vista principal
│   ├── App.vue                   # Componente raíz
│   └── main.ts                   # Punto de entrada
├── components.json                # Configuración de shadcn-vue
├── tailwind.config.ts            # Configuración de Tailwind CSS
├── vite.config.ts                # Configuración de Vite
└── tsconfig.json                 # Configuración de TypeScript
```

## Componentes shadcn-vue Agregados

### Blocks
- ✅ login-05
- ✅ signup-05
- ✅ otp-05
- ✅ sidebar-07
- ✅ dashboard-01

### Nota sobre Charts
Los charts (chart-1 a chart-5) mencionados en la documentación pueden requerir configuración adicional o no estar disponibles en el registro actual de shadcn-vue. El dashboard-01 ya incluye componentes de chart que puedes usar.

## Configuración

### Tailwind CSS v4
El proyecto está configurado con Tailwind CSS v4 usando el plugin de Vite. Las variables CSS están configuradas en `src/assets/css/main.css`.

### shadcn-vue
La configuración de shadcn-vue está en `components.json`. El tema base está configurado como "slate". Puedes cambiarlo editando el archivo `components.json`.

### Pinia
Pinia está configurado en `src/main.ts`. Puedes crear nuevos stores en `src/stores/`.

## Desarrollo

Para iniciar el servidor de desarrollo:

```bash
pnpm dev
```

El proyecto estará disponible en `http://localhost:5173` (o el puerto que Vite asigne).

## Agregar Más Componentes de shadcn-vue

Para agregar más componentes de shadcn-vue:

```bash
npx shadcn-vue@latest add [nombre-del-componente]
```

Para agregar blocks:

```bash
npx shadcn-vue@latest add [nombre-del-block]
```

## Recursos

- [Documentación de Vue 3](https://vuejs.org/)
- [Documentación de Vite](https://vite.dev/)
- [Documentación de Tailwind CSS](https://tailwindcss.com/)
- [Documentación de shadcn-vue](https://www.shadcn-vue.com/)
- [Documentación de Pinia](https://pinia.vuejs.org/)


# pokemon

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
