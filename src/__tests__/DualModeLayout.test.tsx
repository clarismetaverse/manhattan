import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DualModeLayout from '@/pages/UgcTiktokerProfilePinned';

import '@testing-library/jest-dom';

describe('DualModeLayout', () => {
  it('renders UGC mode by default', () => {
    const { container } = render(<DualModeLayout />);
    const sw = screen.getByRole('switch');
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('PRO')).toBeInTheDocument();
    expect(container.firstChild).not.toHaveClass('bg-black');
  });

  it('toggles to PRO and paints ring', () => {
    vi.useFakeTimers();
    const { container } = render(<DualModeLayout />);
    const sw = screen.getByRole('switch');
    fireEvent.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('UGC')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('bg-black');
    expect(document.querySelector('.sweep-ring.pro-animating')).toBeTruthy();
    vi.advanceTimersByTime(1200);
    expect(document.querySelector('.sweep-ring.pro-complete')).toBeTruthy();
    vi.useRealTimers();
  });

  it('shows labels on opposite sides', () => {
    render(<DualModeLayout />);
    const sw = screen.getByRole('switch');
    expect(sw.textContent).toBe('PRO');
    fireEvent.click(sw);
    expect(sw.textContent).toBe('UGC');
  });

  it('supports keyboard toggling', () => {
    const { container } = render(<DualModeLayout />);
    const sw = screen.getByRole('switch');
    sw.focus();
    fireEvent.keyDown(sw, { key: 'Enter' });
    expect(sw).toHaveAttribute('aria-checked', 'true');
    fireEvent.keyDown(sw, { key: ' ' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });
});
