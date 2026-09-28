import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Avatar } from '../avatar';
import { getInitials } from '../utils/get-initials';

describe('Avatar size', () => {
  it.each([
    ['xs', 'colox-avatar--xs'],
    ['sm', 'colox-avatar--sm'],
    ['md', 'colox-avatar--md'],
    ['lg', 'colox-avatar--lg'],
  ] as const)('applies the %s preset class', (size, expectedClass) => {
    render(<Avatar name="张伟" size={size} />);
    expect(screen.getByText('张')).toHaveClass(expectedClass);
  });

  it.each(['0-5', '4', '7', '16', '360'] as const)(
    'applies the size-%s raw token key class',
    (key) => {
      render(<Avatar name="张伟" size={key} />);
      expect(screen.getByText('张')).toHaveClass(`colox-avatar--size-${key}`);
    },
  );

  it('defaults to md', () => {
    render(<Avatar name="张伟" />);
    expect(screen.getByText('张')).toHaveClass('colox-avatar--md');
  });
});

describe('Avatar shape', () => {
  it('defaults to circle', () => {
    render(<Avatar name="张伟" />);
    expect(screen.getByText('张')).toHaveClass('colox-avatar--circle');
  });

  it.each([
    ['circle', 'colox-avatar--circle'],
    ['rounded', 'colox-avatar--rounded'],
    ['square', 'colox-avatar--square'],
  ] as const)('applies the %s shape class', (shape, expectedClass) => {
    render(<Avatar name="张伟" shape={shape} />);
    expect(screen.getByText('张')).toHaveClass(expectedClass);
  });
});

describe('Avatar content priority', () => {
  it('renders children as the rich content slot, winning over src and name', () => {
    render(
      <Avatar src="https://example.com/a.png" name="张伟">
        <span data-testid="glyph">★</span>
      </Avatar>,
    );
    expect(screen.getByTestId('glyph')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders the picture avatar when src is present', () => {
    render(<Avatar src="https://example.com/a.png" alt="张伟" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/a.png');
    expect(img).toHaveAttribute('alt', '张伟');
    expect(img).toHaveAttribute('draggable', 'false');
  });

  it('falls back to the name initials when no children or src', () => {
    render(<Avatar name="张伟" />);
    expect(screen.getByText('张')).toBeInTheDocument();
  });

  it('renders an empty avatar when nothing is given', () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector('.colox-avatar')).toBeEmptyDOMElement();
  });
});

describe('Avatar image failure', () => {
  it('fires onError and falls back to the name initials', () => {
    const onError = vi.fn();
    const { container } = render(
      <Avatar src="https://example.com/broken.png" alt="张伟" name="张伟" onError={onError} />,
    );
    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(onError).toHaveBeenCalledOnce();
    // The image element is gone, the initials (a role="img" span) took
    // over.
    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(screen.getByText('张')).toBeInTheDocument();
  });

  it('renders the fallback escape hatch instead of the initials on failure', () => {
    render(
      <Avatar
        src="https://example.com/broken.png"
        alt="张伟"
        name="张伟"
        fallback={<span>!</span>}
      />,
    );
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('recovers the image when the src changes after a failure', () => {
    const { rerender } = render(
      <Avatar src="https://example.com/broken.png" alt="张伟" name="张伟" />,
    );
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByText('张')).toBeInTheDocument();

    rerender(<Avatar src="https://example.com/ok.png" alt="张伟" name="张伟" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/ok.png');
  });

  it('does not let imgProps.onError override the built-in failure detection', () => {
    const imgOnError = vi.fn();
    render(
      <Avatar
        src="https://example.com/broken.png"
        alt="张伟"
        name="张伟"
        imgProps={{ onError: imgOnError }}
      />,
    );
    fireEvent.error(screen.getByRole('img'));
    // The built-in handler owns the channel: the author's imgProps
    // onError is not wired (the top-level `onError` prop is the
    // listener).
    expect(imgOnError).not.toHaveBeenCalled();
    expect(screen.getByText('张')).toBeInTheDocument();
  });
});

describe('Avatar fallback semantics', () => {
  it('falls back to the alt initials when the image fails and no name is given', () => {
    render(<Avatar src="https://example.com/broken.png" alt="张伟" />);
    fireEvent.error(screen.getByRole('img'));
    const text = screen.getByText('张');
    expect(text).toHaveAttribute('role', 'img');
    expect(text).toHaveAttribute('aria-label', '张伟');
  });

  it('prefers the name initials over the alt on an image failure', () => {
    render(<Avatar src="https://example.com/broken.png" alt="张伟的头像" name="李四" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByText('李')).toBeInTheDocument();
  });

  it('never consults the fallback when no src is given', () => {
    render(<Avatar name="张伟" fallback={<span>!</span>} />);
    expect(screen.getByText('张')).toBeInTheDocument();
    expect(screen.queryByText('!')).not.toBeInTheDocument();
  });

  it('renders empty when no src is given and nothing else resolves', () => {
    const { container } = render(<Avatar fallback={<span>!</span>} />);
    expect(container.querySelector('.colox-avatar')).toBeEmptyDOMElement();
    expect(screen.queryByText('!')).not.toBeInTheDocument();
  });

  it('lets the fallback node own its own naming (no forced role)', () => {
    render(
      <Avatar
        src="https://example.com/broken.png"
        alt="张伟"
        name="张伟"
        fallback={<span>!</span>}
      />,
    );
    fireEvent.error(screen.getByRole('img'));
    // The fallback node owns its own naming — the library does not
    // force a role/aria-label onto it.
    const fallback = screen.getByText('!');
    expect(fallback).not.toHaveAttribute('role');
  });
});

describe('Avatar text accessibility', () => {
  it('is role="img" with the name as the accessible label', () => {
    render(<Avatar name="张伟" />);
    const text = screen.getByText('张');
    expect(text).toHaveAttribute('role', 'img');
    expect(text).toHaveAttribute('aria-label', '张伟');
  });

  it('prefers an explicit aria-label over the name', () => {
    render(<Avatar name="张伟" aria-label="张伟的头像" />);
    expect(screen.getByText('张')).toHaveAttribute('aria-label', '张伟的头像');
  });

  it('renders the picture alt when provided', () => {
    render(<Avatar src="https://example.com/a.png" alt="张伟的头像" />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', '张伟的头像');
  });
});

describe('Avatar variant', () => {
  it('defaults to plain', () => {
    render(<Avatar name="张伟" />);
    expect(screen.getByText('张')).toHaveClass('colox-avatar--plain');
  });

  it.each([
    ['plain', 'colox-avatar--plain'],
    ['subtle', 'colox-avatar--subtle'],
    ['solid', 'colox-avatar--solid'],
    ['outline', 'colox-avatar--outline'],
  ] as const)('applies the %s variant class', (variant, expectedClass) => {
    render(<Avatar name="张伟" variant={variant} />);
    expect(screen.getByText('张')).toHaveClass(expectedClass);
  });
});

describe('Avatar palette', () => {
  it('defaults to gray', () => {
    render(<Avatar name="张伟" variant="subtle" />);
    expect(screen.getByText('张')).toHaveClass('colox-avatar--gray');
  });

  it.each([
    ['gray', 'colox-avatar--gray'],
    ['primary', 'colox-avatar--primary'],
    ['info', 'colox-avatar--info'],
    ['error', 'colox-avatar--error'],
    ['warning', 'colox-avatar--warning'],
    ['success', 'colox-avatar--success'],
  ] as const)('applies the %s palette class', (palette, expectedClass) => {
    render(<Avatar name="张伟" variant="subtle" palette={palette} />);
    expect(screen.getByText('张')).toHaveClass(expectedClass);
  });

  it('applies to the failure fallback text avatar', () => {
    render(
      <Avatar
        src="https://example.com/broken.png"
        alt="张伟"
        name="张伟"
        variant="solid"
        palette="error"
      />,
    );
    fireEvent.error(screen.getByRole('img'));
    const text = screen.getByText('张');
    expect(text).toHaveClass('colox-avatar--solid', 'colox-avatar--error');
  });
});

describe('Avatar passthrough', () => {
  it('merges className and forwards native props', () => {
    render(<Avatar name="张伟" className="mine" data-testid="avatar" />);
    const avatar = screen.getByText('张');
    expect(avatar).toHaveClass('colox-avatar', 'mine');
    expect(avatar).toHaveAttribute('data-testid', 'avatar');
  });

  it('forwards imgProps to the inner image and merges its className', () => {
    render(
      <Avatar
        src="https://example.com/a.png"
        alt="张伟"
        imgProps={{ className: 'img-mine', loading: 'lazy', crossOrigin: 'anonymous' }}
      />,
    );
    const img = screen.getByRole('img');
    expect(img).toHaveClass('colox-avatar__img', 'img-mine');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('crossorigin', 'anonymous');
  });
});

describe('getInitials', () => {
  it('takes the first character of a CJK name', () => {
    expect(getInitials('张伟')).toBe('张');
    expect(getInitials('李四')).toBe('李');
    expect(getInitials('欧阳锋')).toBe('欧');
  });

  it('takes the first letters of up to two Latin words, uppercased', () => {
    expect(getInitials('john doe')).toBe('JD');
    expect(getInitials('Alice')).toBe('A');
    expect(getInitials('Jean-Luc Picard')).toBe('JP');
  });

  it('returns an empty string for whitespace-only input', () => {
    expect(getInitials('')).toBe('');
    expect(getInitials('   ')).toBe('');
  });
});
