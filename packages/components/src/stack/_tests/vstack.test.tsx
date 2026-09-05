import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VStack } from '../vstack';

describe('VStack', () => {
  it('renders with the direction class and the default modifier set', () => {
    render(<VStack>content</VStack>);
    expect(screen.getByText('content')).toHaveClass(
      'colox-vstack',
      'colox-stack--gap-4',
      'colox-stack--align-stretch',
      'colox-stack--justify-start',
    );
  });

  it('maps gap, align and justify onto the theme-token modifier classes', () => {
    render(
      <VStack gap="10" align="end" justify="around">
        content
      </VStack>,
    );
    expect(screen.getByText('content')).toHaveClass(
      'colox-stack--gap-10',
      'colox-stack--align-end',
      'colox-stack--justify-around',
    );
  });

  it('does not accept the wrap axis (row-only affordance)', () => {
    render(<VStack>content</VStack>);
    expect(screen.getByText('content')).not.toHaveClass('colox-hstack--wrap');
  });

  it('merges a custom className', () => {
    render(<VStack className="form-group">content</VStack>);
    expect(screen.getByText('content')).toHaveClass('form-group', 'colox-vstack');
  });
});
