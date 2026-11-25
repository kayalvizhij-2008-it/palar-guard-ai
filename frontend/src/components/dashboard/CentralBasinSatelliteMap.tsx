import React from 'react';
import { BasinMap } from '../maps/BasinMap';

interface CentralBasinSatelliteMapProps {
  onSelectStation?: (stationId: number) => void;
  heightClass?: string;
  showLayerControls?: boolean;
}

export const CentralBasinSatelliteMap: React.FC<CentralBasinSatelliteMapProps> = ({
  onSelectStation,
  heightClass = "h-[380px] sm:h-[460px]",
  showLayerControls = true
}) => {
  return (
    <BasinMap 
      onSelectStation={onSelectStation} 
      heightClass={heightClass}
      showLayerControls={showLayerControls}
    />
  );
};

export default CentralBasinSatelliteMap;
