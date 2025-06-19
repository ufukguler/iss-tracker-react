import React, {useState} from 'react';
import {MapContainer, Marker, Polyline, TileLayer} from 'react-leaflet';
import L from 'leaflet';
import {ISSPositionResult} from "../hooks/useISSPosition";

type Position = [number, number];

interface ISSTrackerMapProps {
  data: ISSPositionResult;
}

export default function ISSTrackerMap({data}: ISSTrackerMapProps) {
  const [darkMode, setDarkMode] = useState(true);
  const tileLayer = darkMode ? TILE_LAYERS.dark : TILE_LAYERS.light;
  const issIcon = new L.Icon({
    iconUrl: darkMode ? '/iss-tracker-react/ISS-white.svg' : '/iss-tracker-react/ISS.svg',
    iconSize: [50, 32],
    iconAnchor: [25, 16],
  });

  return (
    <div className="container">
      {data.velocity !== 0 && (
        <div className="iss-info">
          <div>Speed: {Math.round(data.velocity).toLocaleString()} km/h</div>
          <div>Last updated: {formatToUTCTime(data.timestamp)}</div>
        </div>
      )}
      <button
        onClick={() => setDarkMode((d) => !d)}
        className={darkMode ? 'toggleButton dark' : 'toggleButton'}
        aria-label={darkMode ? 'Switch to light map' : 'Switch to dark map'}
      >
        {darkMode ? 'Switch to Light Map' : 'Switch to Dark Map'}
      </button>
      <MapContainer maxBounds={[[-85, -180], [85, 180]]} center={[0, 0]} scrollWheelZoom zoom={2}
                    style={{height: '100%', backgroundColor: '#000000'}} maxBoundsViscosity={1.0}>
        <TileLayer url={tileLayer.url} attribution={tileLayer.attribution}/>
        {data.issPosition && <Marker position={data.issPosition} icon={issIcon as any}/>}
        {data.pastPositions.length > 1 &&
          splitPolylineByDateLine(data.pastPositions).map((segment, i) => (
            segment.length > 1 &&
            segment.slice(1).map((_, j) => {
              const factor = (j + 1) / segment.length;
              const color = darkMode ? interpolateColor('#a259f7', '#00bfff', factor) : interpolateColor('#a259f7', '#ff5ec7', factor);
              return (
                <Polyline
                  key={`${i}-${j}`}
                  positions={[segment[j], segment[j + 1]]}
                  pathOptions={{
                    color,
                    weight: 3,
                    opacity: darkMode ? 0.5 : 1,
                    lineCap: 'butt'
                  }}
                />
              );
            })
          ))
        }
      </MapContainer>
      {data.error && (
        <div className={data.error}>
          Error: {data.error}
        </div>
      )}
    </div>
  );
}

function splitPolylineByDateLine(positions: Position[]): Position[][] {
  if (positions.length < 2) return [positions];
  const segments: Position[][] = [];
  let current: Position[] = [positions[0]];
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    if (Math.abs(curr[1] - prev[1]) > 180) {
      segments.push(current);
      current = [curr];
    } else {
      current.push(curr);
    }
  }
  if (current.length) segments.push(current);
  return segments;
}

function interpolateColor(start: string, end: string, factor: number): string {
  const hexToRgb = (hex: string) => {
    const n = hex.replace('#', '');
    return [
      parseInt(n.substring(0, 2), 16),
      parseInt(n.substring(2, 4), 16),
      parseInt(n.substring(4, 6), 16)
    ];
  };
  const rgbToHex = (rgb: number[]) =>
    '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
  const s = hexToRgb(start);
  const e = hexToRgb(end);
  const result = s.map((v, i) => Math.round(v + (e[i] - v) * factor));
  return rgbToHex(result as number[]);
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

function formatToUTCTime(ts: number) {
  const d = new Date(ts * 1000);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')} UTC`;
}