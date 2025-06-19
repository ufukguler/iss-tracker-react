import React from 'react';
import ISSTrackerMap from './components/ISSTrackerMap';
import { useISSPosition } from './hooks/useISSPosition';

function App() {
  const { issPosition, pastPositions, error, loading } = useISSPosition();
  return (
    <ISSTrackerMap
      issPosition={issPosition}
      pastPositions={pastPositions}
      error={error}
      loading={loading}
    />
  );
}

export default App; 