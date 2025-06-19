import React from 'react';
import ISSTrackerMap from './components/ISSTrackerMap';
import {ISSPositionResult, useISSPosition} from './hooks/useISSPosition';

function App() {
  const issPositionResult: ISSPositionResult = useISSPosition();
  return (
    <ISSTrackerMap data={issPositionResult}/>
  );
}

export default App; 