import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

(delete (L as any).Icon.Default.prototype._getIconUrl);
(L as any).Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/dist/images/marker-icon-2x.png',
  iconUrl: 'leaflet/dist/images/marker-icon.png',
  shadowUrl: 'leaflet/dist/images/marker-shadow.png',
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 