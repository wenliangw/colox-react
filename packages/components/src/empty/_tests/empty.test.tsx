import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Empty } from '..';

function renderEmpty(ui: ReactElement = <Empty />): HTMLElement {
  const { container } = render(ui);
  const root = container.querySelector('.colox-empty');
  if (!root) throw new Error('empty root not found');
  return container;
}

describe('Empty figure', () => {
  it('marks the wrapper with the scene per type', () => {
    expect(renderEmpty(<Empty />).querySelector('.colox-empty__figure')).toHaveAttribute(
      'data-scene',
      'empty',
    );
    expect(
      renderEmpty(<Empty type="search" />).querySelector('.colox-empty__figure'),
    ).toHaveAttribute('data-scene', 'search');
    expect(
      renderEmpty(<Empty type="error" />).querySelector('.colox-empty__figure'),
    ).toHaveAttribute('data-scene', 'error');
  });

  it('renders the built-in scene svg by default', () => {
    const figure = renderEmpty(<Empty />).querySelector('.colox-empty__figure');
    expect(figure?.querySelector('svg')).not.toBeNull();
  });

  it('renders the built-in figure decorative', () => {
    expect(renderEmpty(<Empty />).querySelector('.colox-empty__figure svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('replaces the figure with a custom figure', () => {
    const container = renderEmpty(<Empty figure={<span data-custom />} />);
    expect(container.querySelector('.colox-empty__figure [data-custom]')).not.toBeNull();
    expect(container.querySelector('.colox-empty__figure svg')).toBeNull();
  });
});

describe('Empty content', () => {
  it('renders title, description and action in their slots', () => {
    const container = renderEmpty(
      <Empty
        title="Nothing here"
        description="Try another query"
        action={<button>Reset</button>}
      />,
    );
    expect(container.querySelector('.colox-empty__title')).toHaveTextContent('Nothing here');
    expect(container.querySelector('.colox-empty__description')).toHaveTextContent(
      'Try another query',
    );
    expect(container.querySelector('.colox-empty__action button')).toHaveTextContent('Reset');
  });

  it('omits the optional slots when absent', () => {
    const container = renderEmpty(<Empty />);
    expect(container.querySelector('.colox-empty__title')).toBeNull();
    expect(container.querySelector('.colox-empty__description')).toBeNull();
    expect(container.querySelector('.colox-empty__action')).toBeNull();
  });
});

describe('Empty surface', () => {
  it('merges className and passes through native props', () => {
    const container = renderEmpty(<Empty className="my-empty" data-edge />);
    const root = container.querySelector('.colox-empty');
    expect(root).toHaveClass('colox-empty', 'my-empty');
    expect(root).toHaveAttribute('data-edge');
  });
});
