export function handleZoneExploration(zoneId?: string) {
	// Acción mínima: emitir un evento para que otros módulos reaccionen
	const ev = new CustomEvent('start-exploration', { detail: { zoneId } });
	window.dispatchEvent(ev);

	// Ejemplo de navegación simple al mapa (ajusta según tu router)
	try {
		window.location.hash = '#map';
	} catch (e) {
		// noop
	}
}