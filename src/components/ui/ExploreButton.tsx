import React from 'react';
import { handleZoneExploration } from '../../game/movement';

type Props = {
	zoneId?: string;
	className?: string;
};

export default function ExploreButton({ zoneId, className }: Props) {
	return (
		<button
			type="button"
			className={className}
			onClick={() => handleZoneExploration(zoneId)}
		>
			Explorar
		</button>
	);
}