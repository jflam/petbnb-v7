import React from 'react';
import { Sitter } from '../hooks/useSitters';

interface SitterCardProps {
  sitter: Sitter;
}

const SitterCard: React.FC<SitterCardProps> = ({ sitter }) => {
  const formatRate = () => {
    const rates = [];
    if (sitter.hourly_rate) {
      rates.push(`$${sitter.hourly_rate}/hour`);
    }
    if (sitter.daily_rate) {
      rates.push(`$${sitter.daily_rate}/day`);
    }
    return rates.join(' • ') || 'Rate negotiable';
  };

  const formatDistance = () => {
    if (sitter.meters) {
      const km = (sitter.meters / 1000).toFixed(1);
      return `${km} km away`;
    }
    return '';
  };

  const formatRating = () => {
    if (sitter.rating && sitter.review_count > 0) {
      return `★ ${sitter.rating} (${sitter.review_count} reviews)`;
    }
    return 'No reviews yet';
  };

  return (
    <div className="sitter-card">
      <div className="sitter-card-header">
        <h3>{sitter.title}</h3>
        <div className="sitter-name">
          {sitter.first_name} {sitter.last_name}
        </div>
      </div>
      
      <div className="sitter-card-body">
        {sitter.description && (
          <p className="sitter-description">{sitter.description}</p>
        )}
        
        <div className="sitter-details">
          <div className="sitter-rate">{formatRate()}</div>
          <div className="sitter-location">
            {sitter.city}
            {sitter.meters && (
              <span className="distance"> • {formatDistance()}</span>
            )}
          </div>
          <div className="sitter-rating">{formatRating()}</div>
        </div>
      </div>
      
      <div className="sitter-card-footer">
        <button 
          className="contact-button"
          onClick={() => {
            // TODO: Implement contact functionality
            alert(`Contact ${sitter.first_name} at ${sitter.phone}`);
          }}
        >
          Contact
        </button>
      </div>
    </div>
  );
};

export default SitterCard;