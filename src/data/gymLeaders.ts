// src/data/gymLeaders.ts
// Cali-themed Gym Leaders based on local landmarks and culture
// Source: src/assets/docs/Lider_*.md

export interface GymLeader {
  id: number
  name: string
  city: string
  location: string
  badge: string
  badgeImage: string
  badgeImageTransparent: string
  type: string
  secondaryType?: string
  difficulty: number
  team: {
    pokemon: string
    pokemonId: number
    level: number
  }[]
  signaturePokemon: string
  trainerClass: string
  quote: string
  quoteDefeat: string
  quoteBattle: string
  spriteUrl: string
  mission: string
}

export const gymLeaders: GymLeader[] = [
  {
    id: 1,
    name: "José",
    city: "Cali",
    location: "Cristo Rey",
    badge: "Medalla Valle Vivo",
    badgeImage: "src/assets/images/Medallas/Valle_Vivo.png",
    badgeImageTransparent: "src/assets/images/Medallas/bottomless/Valle_Vivo.png",
    type: "Roca",
    secondaryType: "Tierra",
    difficulty: 1,
    team: [
      { pokemon: "geodude", pokemonId: 74, level: 10 },
      { pokemon: "sandshrew", pokemonId: 27, level: 11 },
      { pokemon: "onix", pokemonId: 95, level: 12 },
      { pokemon: "rhyhorn", pokemonId: 111, level: 13 },
      { pokemon: "graveler", pokemonId: 75, level: 14 },
      { pokemon: "golem", pokemonId: 76, level: 15 } // Rocazaur representation
    ],
    signaturePokemon: "Rocazaur",
    trainerClass: "Guardián de Piedra",
    quote: "La montaña te ha aceptado. Ahora, veamos si también puedes resistir su fuerza.",
    quoteDefeat: "Has demostrado respeto por la tierra. Esta medalla te pertenece.",
    quoteBattle: "¡La tierra no se domina, la tierra protege a quienes la respetan!",
    spriteUrl: "src/assets/images/Lideres/Lider_José-Cristo_Rey.png",
    mission: "Corazón del Cerro - Reparar deslizamiento, enfrentar Pokémon salvajes tipo Roca/Tierra, rescatar Pokémon atrapado"
  },
  {
    id: 2,
    name: "Manuel",
    city: "Cali",
    location: "Parque de la Caña - Acuaparque",
    badge: "Medalla Oleada Viva",
    badgeImage: "src/assets/images/Medallas/Medalla_Oleada_Viva.png",
    badgeImageTransparent: "src/assets/images/Medallas/bottomless/Medalla_Oleada_Viva.png",
    type: "Agua",
    secondaryType: "Planta",
    difficulty: 2,
    team: [
      { pokemon: "lotad", pokemonId: 270, level: 18 },
      { pokemon: "psyduck", pokemonId: 54, level: 19 },
      { pokemon: "tentacool", pokemonId: 72, level: 20 },
      { pokemon: "lombre", pokemonId: 271, level: 21 },
      { pokemon: "golduck", pokemonId: 55, level: 22 },
      { pokemon: "ludicolo", pokemonId: 272, level: 24 } // Funplash representation
    ],
    signaturePokemon: "Funplash",
    trainerClass: "Guardián del Agua y la Diversión",
    quote: "Las piscinas ya están limpias y el parque vuelve a respirar. Si tú también estás listo para pelear con responsabilidad… entonces demuestra que tu espíritu fluye tan fuerte como el agua clara.",
    quoteDefeat: "¡Has demostrado que la diversión verdadera también exige respeto! Que esta victoria te recuerde: un buen entrenador cuida el agua antes de usarla.",
    quoteBattle: "El agua limpia corre más poderosa. Esto no es solo un combate — es proteger el parque.",
    spriteUrl: "src/assets/images/Lideres/Lider_Manuel-Parque_de_la_Caña.png",
    mission: "El agua no fluye - Abrir tres válvulas de filtración custodiadas por entrenadores acuáticos"
  },
  {
    id: 3,
    name: "Rafael",
    city: "Cali",
    location: "Plazoleta Jairo Varela",
    badge: "Medalla Ritmo Pacífico",
    badgeImage: "src/assets/images/Medallas/Medalla_del_Ritmo_Pacífico.png",
    badgeImageTransparent: "src/assets/images/Medallas/bottomless/Medalla_del_Ritmo_Pacífico.png",
    type: "Eléctrico",
    secondaryType: "Normal", // Sonido represented as Normal
    difficulty: 3,
    team: [
      { pokemon: "jigglypuff", pokemonId: 39, level: 26 },
      { pokemon: "voltorb", pokemonId: 100, level: 27 },
      { pokemon: "electrode", pokemonId: 101, level: 28 },
      { pokemon: "pikachu", pokemonId: 25, level: 29 },
      { pokemon: "wigglytuff", pokemonId: 40, level: 30 },
      { pokemon: "raichu", pokemonId: 26, level: 32 } // Melodión representation
    ],
    signaturePokemon: "Melodión",
    trainerClass: "Guardián del Ritmo del Valle",
    quote: "Aquí en Cali, la fuerza no se mide solo en golpes, sino en compás. Si pudiste seguir el ritmo de la Plazoleta, estás listo para enfrentar la música misma.",
    quoteDefeat: "Qué orgulloso estaría Jairo Varela de vos. Esta Medalla del Ritmo Pacífico te pertenece. Recordá siempre: un verdadero entrenador lucha con armonía antes que con fuerza.",
    quoteBattle: "La música nunca se rinde, siempre vuelve más fuerte. ¡Melodión, que el Valle escuche nuestro ritmo!",
    spriteUrl: "src/assets/images/Lideres/Lider_Rafael-Plazoleta_Jairo_Varela.png",
    mission: "Ensayo en la Plazoleta - Completar minijuego musical, enfrentar Pokémon tipo Sonido/Eléctrico"
  },
  {
    id: 4,
    name: "Sofía",
    city: "Cali",
    location: "La Ermita",
    badge: "Medalla Cielo Sagrado",
    badgeImage: "src/assets/images/Medallas/El_Cielo_Sagrado.jpg",
    badgeImageTransparent: "src/assets/images/Medallas/bottomless/El_Cielo_Sagrado-Photoroom.png",
    type: "Volador",
    secondaryType: "Eléctrico",
    difficulty: 4,
    team: [
      { pokemon: "pidgey", pokemonId: 16, level: 32 },
      { pokemon: "spearow", pokemonId: 21, level: 33 },
      { pokemon: "pidgeotto", pokemonId: 17, level: 34 },
      { pokemon: "fearow", pokemonId: 22, level: 35 },
      { pokemon: "zapdos", pokemonId: 145, level: 38 }, // Cielavión representation
      { pokemon: "pidgeot", pokemonId: 18, level: 40 }
    ],
    signaturePokemon: "Cielavión",
    trainerClass: "Guardiana del Viento de Cali",
    quote: "El cielo no pertenece a quien lo mira, sino a quien se atreve a volar. Has seguido las corrientes del viento, has ayudado a quien lo necesitaba y no temiste a la altura ni a la tormenta. Muéstrame si tus alas están listas.",
    quoteDefeat: "Has enfrentado la tormenta y aún sigues en pie… Eso solo lo logran quienes realmente escuchan al cielo. Acepta la Medalla Cielo Sagrado. Que nunca olvides: la verdadera fuerza es aquella que levanta a los demás.",
    quoteBattle: "El viento se vuelve más fuerte… No caeremos desde estas alturas. ¡Cielavión, vuela más alto y descarga toda tu convicción!",
    spriteUrl: "src/assets/images/Lideres/Lider_Sofia-La_Ermita.png",
    mission: "Auxilio Ascendente - Ayudar a Pokémon ave herido a llegar a la parte alta de la Ermita"
  },
  {
    id: 5,
    name: "Valeria",
    city: "Cali",
    location: "Zoológico de Cali",
    badge: "Medalla Selva Pacífica",
    badgeImage: "src/assets/images/Medallas/Medalla_Selva_Pacífica.png",
    badgeImageTransparent: "src/assets/images/Medallas/bottomless/Medalla_Selva_Pacífica.png",
    type: "Planta",
    secondaryType: "Tierra",
    difficulty: 5,
    team: [
      { pokemon: "bulbasaur", pokemonId: 1, level: 38 },
      { pokemon: "sandslash", pokemonId: 28, level: 39 },
      { pokemon: "ivysaur", pokemonId: 2, level: 40 },
      { pokemon: "nidoking", pokemonId: 34, level: 41 },
      { pokemon: "venusaur", pokemonId: 3, level: 43 },
      { pokemon: "persian", pokemonId: 53, level: 45 } // Jagualux representation (feline)
    ],
    signaturePokemon: "Jagualux",
    trainerClass: "Guardiana del Valle Vivo",
    quote: "Aquí no se lucha solo con fuerza, sino con respeto. Si fuiste capaz de ayudar a un pequeño sin esperar nada, estás listo para enfrentar a la selva misma.",
    quoteDefeat: "Qué orgulloso estaría el bosque de vos. Esta Medalla Selva Pacífica te pertenece. Recordá siempre: un verdadero entrenador protege antes de atacar.",
    quoteBattle: "La naturaleza siempre se levanta más fuerte. ¡Jagualux, contale quién somos!",
    spriteUrl: "src/assets/images/Lideres/Lider_Valeria-Zoológico_de_Cali.png",
    mission: "Rescate en el Río Lili - Resolver puzzle ambiental, enfrentar Pokémon salvajes, liberar Pokémon atrapado"
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
  'Volador': '#A890F0',
  'Normal': '#A8A878',
}
