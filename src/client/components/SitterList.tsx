import React from 'react';
import { Sitter } from '../hooks/useSitters';
import SitterCard from './SitterCard';

interface SitterListProps {
  sitters: Sitter[];
  isLoading: boolean;
}

const SitterList: React.FC<SitterListProps> = ({ sitters, isLoading }) => {
  if (isLoading) {
    return (
      <div className="sitter-list">
        <h2>Loading pet sitters...</h2>
      </div>
    );
  }

  if (sitters.length === 0) {
    return (
      <div className="sitter-list">
        <h2>No pet sitters found</h2>
        <p>Try adjusting your search radius or check a different area.</p>
      </div>
    );
  }

  return (
    <div className="sitter-list">
      <h2>Available Pet Sitters ({sitters.length})</h2>
      <div className="sitter-cards">
        {sitters.map((sitter) => (
          <SitterCard key={sitter.id} sitter={sitter} />
        ))}
      </div>
    </div>
  );
};

export default SitterList;