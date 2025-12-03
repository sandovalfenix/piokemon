// src/data/gymLeaders.ts

export interface GymLeader {
  id: number
  name: string
  city: string
  badge: string
  badgeImage: string
  type: string
  difficulty: number
  team: {
    pokemon: string
    pokemonId: number
    level: number
  }[]
  trainerClass: string
  quote: string
  spriteUrl: string
}

export const gymLeaders: GymLeader[] = [
  {
    id: 1,
    name: "Brock",
    city: "Ciudad Plateada",
    badge: "Medalla Roca",
    badgeImage: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/boulder-badge.png",
    type: "Roca",
    difficulty: 1,
    team: [
      { pokemon: "geodude", pokemonId: 74, level: 10 },
      { pokemon: "geodude", pokemonId: 74, level: 11 },
      { pokemon: "onix", pokemonId: 95, level: 12 },
      { pokemon: "geodude", pokemonId: 74, level: 11 },
      { pokemon: "graveler", pokemonId: 75, level: 13 },
      { pokemon: "onix", pokemonId: 95, level: 14 }
    ],
    trainerClass: "Líder de Gimnasio",
    quote: "¡Mis Pokémon tipo Roca te harán morder el polvo!",
    spriteUrl: "https://img.pokemondb.net/sprites/black-white/normal/brock.png"
  },
  {
    id: 2,
    name: "Misty",
    city: "Ciudad Celeste",
    badge: "Medalla Cascada",
    badgeImage: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/cascade-badge.png",
    type: "Agua",
    difficulty: 2,
    team: [
      { pokemon: "psyduck", pokemonId: 54, level: 18 },
      { pokemon: "staryu", pokemonId: 120, level: 17 },
      { pokemon: "goldeen", pokemonId: 118, level: 17 },
      { pokemon: "shellder", pokemonId: 90, level: 18 },
      { pokemon: "staryu", pokemonId: 120, level: 19 },
      { pokemon: "starmie", pokemonId: 121, level: 21 }
    ],
    trainerClass: "Líder de Gimnasio",
    quote: "¡Mi política es atacar con el poder de los Pokémon tipo Agua!",
    spriteUrl: "https://img.pokemondb.net/sprites/black-white/normal/misty.png"
  },
  {
    id: 3,
    name: "Lt. Surge",
    city: "Ciudad Carmín",
    badge: "Medalla Trueno",
    badgeImage: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thunder-badge.png",
    type: "Eléctrico",
    difficulty: 3,
    team: [
      { pokemon: "voltorb", pokemonId: 100, level: 21 },
      { pokemon: "pikachu", pokemonId: 25, level: 18 },
      { pokemon: "magnemite", pokemonId: 81, level: 20 },
      { pokemon: "voltorb", pokemonId: 100, level: 21 },
      { pokemon: "magneton", pokemonId: 82, level: 22 },
      { pokemon: "raichu", pokemonId: 26, level: 24 }
    ],
    trainerClass: "Líder de Gimnasio",
    quote: "¡Mis Pokémon eléctricos te electrocutarán!",
    spriteUrl: "https://img.pokemondb.net/sprites/black-white/normal/lt-surge.png"
  },
  {
    id: 4,
    name: "Erika",
    city: "Ciudad Azulona",
    badge: "Medalla Arcoíris",
    badgeImage: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rainbow-badge.png",
    type: "Planta",
    difficulty: 4,
    team: [
      { pokemon: "tangela", pokemonId: 114, level: 29 },
      { pokemon: "weepinbell", pokemonId: 70, level: 27 },
      { pokemon: "gloom", pokemonId: 44, level: 26 },
      { pokemon: "bellsprout", pokemonId: 69, level: 24 },
      { pokemon: "victreebel", pokemonId: 71, level: 29 },
      { pokemon: "vileplume", pokemonId: 45, level: 30 }
    ],
    trainerClass: "Líder de Gimnasio",
    quote: "¡La naturaleza y yo somos uno!",
    spriteUrl: "https://img.pokemondb.net/sprites/black-white/normal/erika.png"
  },
  {
    id: 5,
    name: "Koga",
    city: "Ciudad Fucsia",
    badge: "Medalla Alma",
    badgeImage: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/soul-badge.png",
    type: "Veneno",
    difficulty: 5,
    team: [
      { pokemon: "koffing", pokemonId: 109, level: 37 },
      { pokemon: "grimer", pokemonId: 88, level: 37 },
      { pokemon: "koffing", pokemonId: 109, level: 39 },
      { pokemon: "muk", pokemonId: 89, level: 40 },
      { pokemon: "weezing", pokemonId: 110, level: 42 },
      { pokemon: "weezing", pokemonId: 110, level: 43 }
    ],
    trainerClass: "Líder de Gimnasio",
    quote: "¡El veneno es mi arte ninja!",
    spriteUrl: "https://img.pokemondb.net/sprites/black-white/normal/koga.png"
  },
  {
    id: 6,
    name: "Sabrina",
    city: "Ciudad Azafrán",
    badge: "Medalla Pantano",
    badgeImage: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/marsh-badge.png",
    type: "Psíquico",
    difficulty: 6,
    team: [
      { pokemon: "abra", pokemonId: 63, level: 38 },
      { pokemon: "kadabra", pokemonId: 64, level: 37 },
      { pokemon: "mr-mime", pokemonId: 122, level: 38 },
      { pokemon: "slowbro", pokemonId: 80, level: 39 },
      { pokemon: "venomoth", pokemonId: 49, level: 40 },
      { pokemon: "alakazam", pokemonId: 65, level: 43 }
    ],
    trainerClass: "Líder de Gimnasio",
    quote: "¡Puedo leer tu mente!",
    spriteUrl: "https://img.pokemondb.net/sprites/black-white/normal/sabrina.png"
  },
  {
    id: 7,
    name: "Blaine",
    city: "Isla Canela",
    badge: "Medalla Volcán",
    badgeImage: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/volcano-badge.png",
    type: "Fuego",
    difficulty: 7,
    team: [
      { pokemon: "growlithe", pokemonId: 58, level: 42 },
      { pokemon: "vulpix", pokemonId: 37, level: 40 },
      { pokemon: "ponyta", pokemonId: 77, level: 42 },
      { pokemon: "ninetales", pokemonId: 38, level: 43 },
      { pokemon: "rapidash", pokemonId: 78, level: 45 },
      { pokemon: "arcanine", pokemonId: 59, level: 47 }
    ],
    trainerClass: "Líder de Gimnasio",
    quote: "¡Mis Pokémon quemarán cualquier desafío!",
    spriteUrl: "https://img.pokemondb.net/sprites/black-white/normal/blaine.png"
  },
  {
    id: 8,
    name: "Giovanni",
    city: "Ciudad Verde",
    badge: "Medalla Tierra",
    badgeImage: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/earth-badge.png",
    type: "Tierra",
    difficulty: 8,
    team: [
      { pokemon: "rhyhorn", pokemonId: 111, level: 45 },
      { pokemon: "dugtrio", pokemonId: 51, level: 42 },
      { pokemon: "nidoqueen", pokemonId: 31, level: 44 },
      { pokemon: "nidoking", pokemonId: 34, level: 45 },
      { pokemon: "rhydon", pokemonId: 112, level: 48 },
      { pokemon: "rhydon", pokemonId: 112, level: 50 }
    ],
    trainerClass: "Líder de Gimnasio",
    quote: "¡El poder de la Tierra es supremo!",
    spriteUrl: "https://img.pokemondb.net/sprites/black-white/normal/giovanni.png"
  }
]

export const typeColors: Record<string, string> = {
  'Roca': '#B8A038',
  'Agua': '#6890F0',
  'Eléctrico': '#F8D030',
  'Planta': '#78C850',
  'Veneno': '#A040A0',
  'Psíquico': '#F85888',
  'Fuego': '#F08030',
  'Tierra': '#E0C068',
}
