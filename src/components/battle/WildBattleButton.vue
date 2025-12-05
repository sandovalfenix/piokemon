<script setup lang="ts">
/**
 * WildBattleButton - Button to trigger wild encounters
 * Feature: 006-battle-module-update (T041)
 *
 * Styled button that triggers a wild Pokemon encounter.
 * Combat-only, no capture mechanics.
 */
import { Button } from '@/components/ui/button'

interface Props {
  /** Whether the button is disabled */
  disabled?: boolean
  /** Button size variant */
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'lg',
})

const emit = defineEmits<{
  /** Emitted when user clicks to start wild encounter */
  (e: 'click'): void
}>()

function handleClick() {
  emit('click')
}
</script>

<template>
  <Button
    :disabled="disabled"
    :size="size"
    variant="outline"
    class="wild-battle-btn"
    @click="handleClick"
  >
    <i class="pi pi-sun icon"></i>
    <span class="label">Encuentro Salvaje</span>
  </Button>
</template>

<style scoped>
.wild-battle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  background: linear-gradient(135deg, #22c55e10 0%, #16a34a10 100%);
  border: 2px solid #22c55e;
  color: #22c55e;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.wild-battle-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #22c55e20 0%, #16a34a20 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.wild-battle-btn:active:not(:disabled) {
  transform: translateY(0);
}

.wild-battle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  font-size: 1.25rem;
}

.label {
  font-weight: 600;
}
</style>
