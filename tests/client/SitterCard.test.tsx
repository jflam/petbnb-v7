import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SitterCard from '../../src/client/components/SitterCard';
import { Sitter } from '../../src/client/hooks/useSitters';

// Mock alert
const mockAlert = vi.fn();
global.alert = mockAlert;

const mockSitter: Sitter = {
  id: 1,
  title: 'Professional Dog Walker',
  description: 'Experienced pet sitter with 5+ years caring for dogs of all sizes.',
  hourly_rate: 25,
  daily_rate: null,
  address: '123 Main St',
  city: 'Seattle',
  available: true,
  image_url: null,
  rating: 4.5,
  review_count: 12,
  first_name: 'Alice',
  last_name: 'Johnson',
  phone: '555-0101',
  location: {
    type: 'Point',
    coordinates: [-122.3321, 47.6062]
  },
  meters: 1500
};

describe('SitterCard component', () => {
  it('renders sitter information correctly', () => {
    render(<SitterCard sitter={mockSitter} />);
    
    expect(screen.getByText('Professional Dog Walker')).toBeDefined();
    expect(screen.getByText('Alice Johnson')).toBeDefined();
    expect(screen.getByText('Experienced pet sitter with 5+ years caring for dogs of all sizes.')).toBeDefined();
    expect(screen.getByText('$25/hour')).toBeDefined();
    expect(screen.getByText(/Seattle/)).toBeDefined();
    expect(screen.getByText('★ 4.5 (12 reviews)')).toBeDefined();
  });

  it('formats distance correctly', () => {
    render(<SitterCard sitter={mockSitter} />);
    expect(screen.getByText(/1.5 km away/)).toBeDefined();
  });

  it('handles contact button click', () => {
    render(<SitterCard sitter={mockSitter} />);
    
    const contactButton = screen.getByText('Contact');
    fireEvent.click(contactButton);
    
    expect(mockAlert).toHaveBeenCalledWith('Contact Alice at 555-0101');
  });

  it('shows rate negotiable when no rates provided', () => {
    const sitterNoRates = { ...mockSitter, hourly_rate: null, daily_rate: null };
    render(<SitterCard sitter={sitterNoRates} />);
    
    expect(screen.getByText('Rate negotiable')).toBeDefined();
  });

  it('shows both hourly and daily rates when available', () => {
    const sitterBothRates = { ...mockSitter, daily_rate: 60 };
    render(<SitterCard sitter={sitterBothRates} />);
    
    expect(screen.getByText('$25/hour • $60/day')).toBeDefined();
  });
});