import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../../src/client/components/Header';

describe('Header component', () => {
  it('renders the PetBnB title', () => {
    render(<Header />);
    const heading = screen.getByText('PetBnB');
    expect(heading).toBeDefined();
  });

  it('renders the subtitle', () => {
    render(<Header />);
    const subtitle = screen.getByText('Find trusted pet sitters in your neighborhood');
    expect(subtitle).toBeDefined();
  });
});