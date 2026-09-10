import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '../input';

const renderSlots = (props: Parameters<typeof Input>[0]) => render(<Input {...props} />);

describe('Input slots', () => {
  it('renders leading and trailing content', () => {
    renderSlots({
      'aria-label': 'Search',
      leading: <span data-testid="lead">¥</span>,
      trailing: <span data-testid="tail">.00</span>,
    });
    expect(screen.getByTestId('lead')).toBeInTheDocument();
    expect(screen.getByTestId('tail')).toBeInTheDocument();
  });

  it('renders no slot spans when both slots are empty', () => {
    const { container } = renderSlots({ 'aria-label': 'Plain' });
    expect(container.querySelector('.colox-input__leading')).toBeNull();
    expect(container.querySelector('.colox-input__trailing')).toBeNull();
  });

  it('renders no leading span when only trailing is given', () => {
    const { container } = renderSlots({
      'aria-label': 'Plain',
      trailing: <span data-testid="tail">x</span>,
    });
    expect(container.querySelector('.colox-input__leading')).toBeNull();
    expect(screen.getByTestId('tail')).toBeInTheDocument();
  });

  it('auto-renders the search icon for type="search" without an explicit leading', () => {
    const { container } = renderSlots({ 'aria-label': 'Search', type: 'search' });
    const leading = container.querySelector('.colox-input__leading');
    expect(leading).not.toBeNull();
    expect(leading?.querySelector('svg')).not.toBeNull();
  });

  it('lets an explicit leading override the automatic search icon', () => {
    renderSlots({
      'aria-label': 'Search',
      type: 'search',
      leading: <span data-testid="custom">自定义</span>,
    });
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });
});
