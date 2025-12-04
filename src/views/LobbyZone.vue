<template>
	<div class="lobby-zone">
		<header class="lobby-header">
			<h2>Lobby — Zona {{ zoneId }}</h2>
			<p v-if="loading">Cargando usuarios...</p>
			<p v-if="error" class="error">{{ error }}</p>
		</header>

		<ul class="users-list">
			<li
				v-for="user in users"
				:key="user.id ?? user.uid ?? user.name"
				class="user-item"
				@click="onUserClick(user)"
			>
				<!-- slot para personalizar render de usuario -->
				<slot name="user" :user="user">
					<div class="user-default">
						<span class="user-name">{{ user.name ?? user.username ?? 'Sin nombre' }}</span>
						<span class="user-status" :class="{ online: user.online !== false }">
							{{ user.status ?? (user.online === false ? 'Desconectado' : 'Conectado') }}
						</span>
					</div>
				</slot>
			</li>
		</ul>

		<footer class="lobby-footer">
			<button type="button" @click="refresh" :disabled="loading">Refrescar</button>
		</footer>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

interface User {
	id?: string;
	uid?: string;
	name?: string;
	username?: string;
	online?: boolean;
	status?: string;
	// ...otros campos según tu API
}

const props = defineProps<{
	zoneId: string;
	wsUrl?: string; // opcional: ws://... o wss://...
	pollInterval?: number; // ms, default 5000
}>();

const emit = defineEmits<{
	(e: 'user-click', user: User): void;
}>();

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const ws = ref<WebSocket | null>(null);
let pollTimer: number | null = null;

const POLL_INTERVAL = props.pollInterval ?? 5000;

async function fetchUsersOnce() {
	if (!props.zoneId) return;
	loading.value = true;
	error.value = null;
	try {
		// Ajusta la ruta y los headers (auth) según tu backend
		const res = await fetch(`/api/zones/${props.zoneId}/users`, {
			method: 'GET',
			credentials: 'include', // si usas cookies
			// headers: { Authorization: `Bearer ${token}` } // si usas token
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		// Se asume que data.users o directamente lista
		users.value = Array.isArray(data) ? data : data.users ?? [];
	} catch (e: any) {
		error.value = e?.message ?? 'Error al obtener usuarios';
	}
	loading.value = false;
}

function startPolling() {
	stopPolling();
	pollTimer = window.setInterval(fetchUsersOnce, POLL_INTERVAL);
}

function stopPolling() {
	if (pollTimer !== null) {
		clearInterval(pollTimer);
		pollTimer = null;
	}
}

function startWebSocket(url: string) {
	try {
		stopWebSocket();
		ws.value = new WebSocket(url);
		ws.value.addEventListener('open', () => {
			// Opcional: enviar mensaje de suscripción a zona
			const msg = JSON.stringify({ type: 'subscribe', zoneId: props.zoneId });
			ws.value?.send(msg);
		});
		ws.value.addEventListener('message', (ev) => {
			try {
				const payload = JSON.parse(ev.data);
				// Asumimos payload.type === 'users' y payload.users es la lista
				if (payload.type === 'users' && Array.isArray(payload.users)) {
					users.value = payload.users;
				}
				// manejar eventos incrementales según tu protocolo
			} catch {
				// noop
			}
		});
		ws.value.addEventListener('error', () => {
			// Fallback a polling si falla
			stopWebSocket();
			startPolling();
		});
	} catch {
		startPolling();
	}
}

function stopWebSocket() {
	try {
		ws.value?.close();
	} catch {}
	ws.value = null;
}

function onUserClick(user: User) {
	emit('user-click', user);
}

function refresh() {
	fetchUsersOnce();
}

onMounted(() => {
	if (props.wsUrl) {
		startWebSocket(props.wsUrl);
	} else {
		// primero fetch inmediato, luego polling
		fetchUsersOnce();
		startPolling();
	}
});

onUnmounted(() => {
	stopPolling();
	stopWebSocket();
});

// Si cambia la zona, recargar y reasignar suscripciones
watch(
	() => props.zoneId,
	(newZone) => {
		if (!newZone) return;
		if (props.wsUrl) {
			// re-suscribir: enviar un mensaje o recrear ws según tu backend
			// aquí recreamos la conexión para simplificar
			startWebSocket(props.wsUrl!);
		} else {
			fetchUsersOnce();
			startPolling();
		}
	}
);
</script>

<style scoped>
.lobby-zone {
	padding: 12px;
	border: 1px solid #ddd;
	border-radius: 6px;
	background: #fff;
}
.lobby-header { margin-bottom: 8px; }
.users-list { list-style: none; padding: 0; margin: 0; }
.user-item {
	padding: 8px;
	border-bottom: 1px solid #f0f0f0;
	cursor: pointer;
}
.user-item:hover { background: #f9f9f9; }
.user-default { display:flex; justify-content:space-between; }
.user-name { font-weight:600; }
.user-status.online { color: green; }
.error { color: #b00020; }
.lobby-footer { margin-top: 8px; }
</style>
