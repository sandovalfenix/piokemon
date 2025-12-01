# Pokemon MMO - Team Builder

A Pokemon battle simulator with team builder powered by PokeAPI.

## Features

### 🎮 Battle System (Feature 001)
- Turn-based Pokemon battles
- Type effectiveness calculations
- Strategic AI opponent
- Real-time battle UI with animations

### 🔍 Type Chart Integration (Feature 002)
- Complete 18-type Pokemon type chart
- Real-time effectiveness calculations
- Integrated with PokeAPI v2

### 👥 Team Builder (Feature 003)
- **Browse Pokemon Catalog**: Explore 1000+ Pokemon from PokeAPI with pagination
- **Select Moves**: View and choose up to 4 moves per Pokemon from their full movepool
- **Build Teams**: Create custom teams of 1-6 Pokemon
- **Team Management**: Drag-and-drop reordering, remove Pokemon, persistent storage
- **Start Battles**: Launch battles with your custom team as the lead Pokemon

## Getting Started

### Prerequisites
- Node.js 20.19.0+ or 22.12.0+
- npm (comes with Node.js)

### Installation

```sh
npm install
```

### Development

Start the development server with hot-reload:

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```sh
npm run build
```

## Using the Team Builder

1. **Navigate to Team Builder** from the home screen
2. **Browse Pokemon**: Scroll through the paginated catalog (20 per page)
3. **Select a Pokemon**: Click on any Pokemon card to view its available moves
4. **Choose Moves**: Select 1-4 moves for your Pokemon
5. **Add to Team**: Click "Add to Team" to add the Pokemon to your roster
6. **Manage Team**: 
   - Drag Pokemon cards to reorder (position 1 is your team lead)
   - Remove Pokemon with the "Remove from Team" button
   - Your team is automatically saved to localStorage
7. **Start Battle**: Click "Start Battle" when you have at least 1 Pokemon with moves

## Architecture

### Tech Stack
- **Frontend**: Vue 3.5+ with Composition API
- **State Management**: Pinia 3+
- **Routing**: Vue Router 4+
- **Build Tool**: Vite 7+
- **TypeScript**: 5.9+ (strict mode)
- **Styling**: Tailwind CSS 3+
- **Testing**: Vitest

### Project Structure
```
src/
├── components/
│   ├── teamBuilder/          # Team builder components
│   │   ├── PokemonCatalog.vue
│   │   ├── PokemonCard.vue
│   │   ├── MoveSelector.vue
│   │   ├── MoveCard.vue
│   │   ├── TeamRoster.vue
│   │   └── TeamMemberCard.vue
│   └── BattleUI.vue          # Battle system UI
├── models/
│   └── teamBuilder.ts        # TypeScript interfaces
├── services/
│   ├── teamBuilder/          # Team builder services
│   │   ├── pokemonService.ts
│   │   ├── moveService.ts
│   │   └── teamCache.ts
│   └── typeChart/            # Type chart integration
├── stores/
│   ├── team.ts               # Team roster state
│   ├── battle.ts             # Battle state
│   └── typeChart.ts          # Type effectiveness data
├── views/
│   ├── TeamBuilderView.vue
│   ├── BattleView.vue
│   └── HomeView.vue
└── domain/
    └── battle/               # Battle engine logic
```

## Data Sources

- **PokeAPI v2**: https://pokeapi.co/api/v2
  - Pokemon data (stats, types, sprites)
  - Move data (power, accuracy, type, category)
  - Type effectiveness chart

## Performance

- **Bundle Size**: ~187 KB (gzipped: ~65 KB)
- **Pokemon Page Load**: <5 seconds
- **Team Persistence**: localStorage with 100% reliability
- **Caching**: In-memory session cache for Pokemon/moves

## Development Commands

### Type Checking

```sh
npm run type-check
```

### Linting

```sh
npm run lint
```

### Testing

```sh
npm run test
```

### Code Formatting

```sh
npm run format
```

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

## License

This project is for educational purposes.

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
