<template>
  <div class="lobby-wrapper" style="background-image: url('/lobbies/ermita.png')">
    <div class="overlay">
      <h1>La Ermita</h1>
      <p>Descubre la belleza histórica de La Ermita.</p>
    </div>
  </div>
</template>

<style scoped>
.lobby-wrapper {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay {
  background-color: rgba(0, 0, 0, 0.5);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  color: white;
  max-width: 500px;
}

.overlay h1 {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
}

.overlay p {
  margin: 0;
  font-size: 1.125rem;
}
</style>
