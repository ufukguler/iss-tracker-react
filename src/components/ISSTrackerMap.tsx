import React, { useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

type Position = [number, number];

interface ISSTrackerMapProps {
  issPosition: Position | null;
  pastPositions: Position[];
  error: string | null;
  loading: boolean;
}

function FlyToOnce({ position, ready, onFlyEnd }: { position: Position; ready: boolean; onFlyEnd: () => void }) {
  const map = useMap();
  const hasFlown = useRef(false);
  React.useEffect(() => {
    if (position && ready && !hasFlown.current) {
      map.flyTo(position, 3, {
        animate: true,
        duration: 1,
      });
      hasFlown.current = true;
      setTimeout(() => {
        if (onFlyEnd) onFlyEnd();
      }, 1100);
    }
  }, [position, ready, map, onFlyEnd]);
  return null;
}

const TILE_LAYERS = {
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy;OpenStreetMap',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy;CARTO',
  },
};

export default function ISSTrackerMap({ issPosition, pastPositions, error, loading }: ISSTrackerMapProps) {
  const [flyEnded, setFlyEnded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const ready = !!issPosition && pastPositions && pastPositions.length > 1;
  const tileLayer = darkMode ? TILE_LAYERS.dark : TILE_LAYERS.light;

  const issIcon = new L.Icon({
    iconUrl: darkMode ? '/iss-tracker-react/ISS-white.svg' : '/iss-tracker-react/ISS.svg',
    iconSize: [50, 32],
    iconAnchor: [25, 16],
  });

  return (
    <div className="container">
      <button
        onClick={() => setDarkMode((d) => !d)}
        className={darkMode ? 'toggleButton dark' : 'toggleButton'}
        aria-label={darkMode ? 'Switch to light map' : 'Switch to dark map'}
      >
        {darkMode ? 'Switch to Light Map' : 'Switch to Dark Map'}
      </button>
      <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom style={{ height: '100%' }}>
        <TileLayer url={tileLayer.url} attribution={tileLayer.attribution} />
        {issPosition && <Marker position={issPosition} icon={issIcon as any} />}
        {ready && !flyEnded && issPosition && <FlyToOnce position={issPosition} ready={ready} onFlyEnd={() => setFlyEnded(true)} />}
        {flyEnded && pastPositions.length > 1 && <Polyline positions={pastPositions} pathOptions={{ color: 'blue' }} />}
      </MapContainer>
      {loading && <div className="loading">Loading ISS position...</div>}
      {error && (
        <div className={error}>
          Error: {error}
        </div>
      )}
    </div>
  );
} 