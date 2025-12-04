<template>
  <nav class="bottom-nav">
    <h3 class="bottom-nav__title">Acciones de Zona</h3>
    <div class="bottom-nav__buttons">
      <RouterLink to="/explore" class="bottom-nav__button explore-btn">Explorar</RouterLink>
      <RouterLink to="/pokemon-center" class="bottom-nav__button center-btn"
        >Centro Pokémon</RouterLink
      >
      <RouterLink to="/shop" class="bottom-nav__button shop-btn">Tienda</RouterLink>
      <RouterLink to="/gym" class="bottom-nav__button gym-btn">Gimnasio</RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 40%;
  transform: translateX(-50%);
  width: min(700px, 70vw);
  height: auto;
  min-height: calc(var(--bottom-nav-height, 96px) * 0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  background-color: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(6px);
  border: 2px solid #888;
  border-radius: 12px;
  box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.bottom-nav > div {
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  width: 100%;
}

@media (prefers-color-scheme: dark) {
  .bottom-nav {
    background-color: rgba(18, 18, 18, 0.72);
  }
}

.bottom-nav__title {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  color: #333;
  font-weight: 700;
  text-align: center;
  width: 100%;
}

@media (prefers-color-scheme: dark) {
  .bottom-nav__title {
    color: #fff;
  }
}

.bottom-nav__buttons {
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.bottom-nav__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  min-width: 96px;
  padding: 0.5rem 1.25rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 12px;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.explore-btn {
  background-color: #3b82f6;
}

.explore-btn:hover {
  background-color: #2563eb;
  transform: scale(1.05);
}

.center-btn {
  background-color: #10b981;
}

.center-btn:hover {
  background-color: #059669;
  transform: scale(1.05);
}

.shop-btn {
  background-color: #f59e0b;
}

.shop-btn:hover {
  background-color: #d97706;
  transform: scale(1.05);
}

.gym-btn {
  background-color: #ef4444;
}

.gym-btn:hover {
  background-color: #dc2626;
  transform: scale(1.05);
}

.bottom-nav__button.router-link-exact-active {
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .bottom-nav {
    height: 80px;
    gap: 0.5rem;
    padding: 0.25rem;
  }

  .bottom-nav__button {
    height: 48px;
    min-width: 80px;
    font-size: 1rem;
    padding: 0.25rem 1rem;
  }
}

@media (max-width: 480px) {
  .bottom-nav {
    height: 64px;
    gap: 0.25rem;
  }

  .bottom-nav__button {
    height: 44px;
    min-width: 64px;
    font-size: 0.875rem;
    padding: 0.25rem 0.75rem;
  }
}
</style>
