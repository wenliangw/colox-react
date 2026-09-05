import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../button';

describe('Button shadow', () => {
  it('renders without the shadow class by default', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button')).not.toHaveClass('colox-button--shadow');
  });

  it('adds the shadow class when shadow is set', () => {
    render(<Button shadow>Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('colox-button--shadow');
  });

  it('keeps the shadow class alongside the axe classes', () => {
    render(
      <Button shadow size="lg" variant="outline" intent="danger">
        Save
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveClass(
      'colox-button--shadow',
      'colox-button--lg',
      'colox-button--outline',
      'colox-button--danger',
    );
  });
});
