import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HomeSummary } from './home-summary';

describe('HomeSummary', () => {
  it('renders the initial product shell', () => {
    render(<HomeSummary />);

    expect(
      screen.getByRole('heading', { name: 'Álbum Cheio' })
    ).toBeInTheDocument();
    expect(screen.getByText('Next.js App Router')).toBeInTheDocument();
  });
});
