import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import UGCTiktokerProfilePinned from './UGCTiktokerProfilePinned';
import { describe, test, expect, vi } from 'vitest';

vi.mock('@/services/couponApi', () => ({
  fetchUserProfile: vi.fn().mockResolvedValue({
    name: 'Test User',
    City: 'City',
    countryCode: 'US',
    bio: 'Bio',
    promocode: 'CODE',
    xp: 100,
    back: null,
    Profile_pic: { url: 'avatar.png' },
    IG_account: null,
    Tiktok_account: null,
  }),
}));

describe('UGCTiktokerProfilePinned', () => {
  test('default UGC mode shows PRO badge and light theme', async () => {
    render(
      <MemoryRouter>
        <UGCTiktokerProfilePinned />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: 'Test User' });
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAttribute('aria-checked', 'false');

    const badge = screen.getByText('PRO');
    expect(badge).toBeInTheDocument();

    const page = screen.getByTestId('profile-page');
    expect(page.className).not.toContain('bg-black');
  });

  test('switching to PRO updates UI and ring animation', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <MemoryRouter>
        <UGCTiktokerProfilePinned />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: 'Test User' });
    const switchEl = screen.getByRole('switch');
    await user.click(switchEl);

    expect(switchEl).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('UGC')).toBeInTheDocument();
    const page = screen.getByTestId('profile-page');
    expect(page.className).toContain('bg-black');

    const ring = screen.getByLabelText('profile-avatar-ring');
    expect(ring.className).toContain('pro-animating');
    vi.advanceTimersByTime(1200);
    expect(ring.className).toContain('pro-complete');
  });

  test('labels appear on correct sides', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <UGCTiktokerProfilePinned />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: 'Test User' });
    const switchEl = screen.getByRole('switch');
    expect(within(switchEl).getByText('PRO')).toBeInTheDocument();

    await user.click(switchEl);
    expect(within(switchEl).getByText('UGC')).toBeInTheDocument();
  });

  test('keyboard toggling works', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <UGCTiktokerProfilePinned />
      </MemoryRouter>
    );

    await screen.findByRole('heading', { name: 'Test User' });
    const switchEl = screen.getByRole('switch');
    switchEl.focus();
    await user.keyboard('{Enter}');
    expect(switchEl).toHaveAttribute('aria-checked', 'true');
  });
});

