import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Restaurant } from './useRestaurants';
import { Sitter } from './useSitters';

// Add declaration for missing type from leaflet.markercluster
declare module 'leaflet' {
  function markerClusterGroup(options?: any): L.MarkerClusterGroup;
  interface MarkerClusterGroup extends L.FeatureGroup {}
}

type MarkerData = Restaurant | Sitter;

function isRestaurant(item: MarkerData): item is Restaurant {
  return 'cuisine_type' in item;
}

function isSitter(item: MarkerData): item is Sitter {
  return 'title' in item && 'first_name' in item;
}

export function useCluster(map: L.Map | null, items: MarkerData[]) {
  useEffect(() => {
    if (!map || !items.length) return;
    
    // Create a marker cluster group
    const markerCluster = L.markerClusterGroup();
    
    // Add markers to the cluster
    items.forEach(item => {
      if (!item.location || !item.location.coordinates) return;
      
      const coords = item.location.coordinates;
      const marker = L.marker([coords[1], coords[0]]);
      
      let popupContent = '';
      
      if (isRestaurant(item)) {
        // Create popup content for restaurants
        popupContent = `
          <div class="restaurant-popup">
            <h3>${item.name || 'Unknown Restaurant'}</h3>
            <p><strong>Cuisine:</strong> ${item.cuisine_type || 'Various'}</p>
            ${item.specialty ? `<p><strong>Specialty:</strong> ${item.specialty}</p>` : ''}
            ${item.yelp_rating ? `<p><strong>Rating:</strong> ${item.yelp_rating} ⭐</p>` : ''}
            ${item.price_range ? `<p><strong>Price:</strong> ${item.price_range}</p>` : ''}
            ${item.address ? `<p><strong>Address:</strong> ${item.address}${item.city ? `, ${item.city}` : ''}</p>` : ''}
            ${item.distance_km ? `<p><strong>Distance:</strong> ${item.distance_km} km</p>` : ''}
          </div>
        `;
      } else if (isSitter(item)) {
        // Create popup content for sitters
        const rates = [];
        if (item.hourly_rate) rates.push(`$${item.hourly_rate}/hour`);
        if (item.daily_rate) rates.push(`$${item.daily_rate}/day`);
        const rateText = rates.join(' • ') || 'Rate negotiable';
        
        const distance = item.meters ? `${(item.meters / 1000).toFixed(1)} km away` : '';
        const rating = item.rating && item.review_count > 0 
          ? `★ ${item.rating} (${item.review_count} reviews)`
          : 'No reviews yet';
        
        popupContent = `
          <div class="sitter-popup">
            <h3>${item.title}</h3>
            <p><strong>Sitter:</strong> ${item.first_name} ${item.last_name}</p>
            ${item.description ? `<p>${item.description}</p>` : ''}
            <p><strong>Rates:</strong> ${rateText}</p>
            <p><strong>Rating:</strong> ${rating}</p>
            ${item.city ? `<p><strong>Location:</strong> ${item.city}${distance ? ` • ${distance}` : ''}</p>` : ''}
            <p><strong>Phone:</strong> ${item.phone}</p>
          </div>
        `;
      }
      
      marker.bindPopup(popupContent);
      markerCluster.addLayer(marker);
    });
    
    // Add the marker cluster to the map
    map.addLayer(markerCluster);
    
    // Cleanup when component unmounts or items change
    return () => {
      map.removeLayer(markerCluster);
    };
  }, [map, items]);
}