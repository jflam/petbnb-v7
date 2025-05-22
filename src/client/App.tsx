import React from 'react';
import SitterMap from './components/SitterMap';
import Header from './components/Header';
import './utils/fixLeafletIcons'; // Fix Leaflet icon paths

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <SitterMap />
      </main>
    </div>
  );
};

export default App;