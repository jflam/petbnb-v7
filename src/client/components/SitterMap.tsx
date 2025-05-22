import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useUserLocation, useNearbySitters, useAllSitters, Sitter } from '../hooks/useSitters';
import SitterList from './SitterList';
import { useCluster } from '../hooks/useCluster';

// Component to recenter map when location changes
const RecenterOnChange = ({ position }: { position: L.LatLngExpression | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, 12);
    }
  }, [position, map]);
  
  return null;
};

// Component to display distance slider
const DistanceControl = ({ value, onChange }: { value: number, onChange: (value: number) => void }) => {
  return (
    <div className="controls">
      <label htmlFor="distance">Search radius: {value} km</label>
      <input
        id="distance"
        type="range"
        min="1"
        max="20"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};

const SitterMap: React.FC = () => {
  const { location, loading: locationLoading } = useUserLocation();
  const [searchDistance, setSearchDistance] = useState(5);
  const [mode, setMode] = useState<'nearby' | 'all'>('nearby');
  
  // Use either nearby or all sitters based on mode
  const {
    sitters: nearbySitters,
    isLoading: nearbyLoading,
    error: nearbyError
  } = useNearbySitters(
    location?.lng || -122.3321,
    location?.lat || 47.6062,
    searchDistance
  );
  
  const {
    sitters: allSitters,
    isLoading: allLoading,
    error: allError
  } = useAllSitters();
  
  // Determine which set of sitters to display
  const { sitters, isLoading, error } = useMemo(() => {
    return mode === 'nearby'
      ? { sitters: nearbySitters, isLoading: nearbyLoading, error: nearbyError }
      : { sitters: allSitters, isLoading: allLoading, error: allError };
  }, [
    mode,
    nearbySitters,
    nearbyLoading,
    nearbyError,
    allSitters,
    allLoading,
    allError
  ]);

  if (locationLoading) {
    return <div className="loading">Loading location...</div>;
  }

  if (error) {
    return <div className="error">Error loading sitters: {error.toString()}</div>;
  }

  const mapPosition: L.LatLngExpression = location 
    ? [location.lat, location.lng]
    : [47.6062, -122.3321]; // Seattle fallback
  
  return (
    <div className="sitter-map-container">
      <div className="map-controls">
        <button
          className={`control-button ${mode === 'nearby' ? 'active' : ''}`}
          onClick={() => setMode('nearby')}
          disabled={mode === 'nearby'}
        >
          Nearby Sitters
        </button>
        <button
          className={`control-button ${mode === 'all' ? 'active' : ''}`}
          onClick={() => setMode('all')}
          disabled={mode === 'all'}
        >
          All Sitters
        </button>
        
        {mode === 'nearby' && (
          <DistanceControl
            value={searchDistance}
            onChange={setSearchDistance}
          />
        )}
      </div>
      
      <MapContainer 
        center={mapPosition} 
        zoom={12} 
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <RecenterOnChange position={mapPosition} />
        
        {/* User location marker */}
        {location && (
          <Marker position={[location.lat, location.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        
        {/* Render sitter markers with clustering */}
        <ClusteredMarkers sitters={sitters} />
      </MapContainer>
      
      <SitterList sitters={sitters} isLoading={isLoading} />
    </div>
  );
};

// Component for clustering markers
const ClusteredMarkers: React.FC<{ sitters: Sitter[] }> = ({ sitters }) => {
  const map = useMap();
  
  // Use the clustering hook
  useCluster(map, sitters);
  
  return null;
};

export default SitterMap;