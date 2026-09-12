import { Select } from '@colox/react';
import type { SelectTagTemplateProps } from '@colox/react';

/**
 * The tag template demo: a plain component typed with
 * SelectTagTemplateProps. `props` is the required-attribute bag (spread
 * first — its hidden style must win), `option` the member record,
 * `onRemove` the removal channel (custom × button visuals, library
 * behavior — the standard `onChange` payload fires).
 */
const EmojiTag = ({ props = {}, option, onRemove }: SelectTagTemplateProps) => (
  <span
    {...props}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--colox-spacing-0-5)',
      height: 'var(--colox-size-5)',
      paddingInline: 'var(--colox-spacing-1-5)',
      borderRadius: 'var(--colox-radius-full)',
      background: 'var(--colox-color-bg-muted)',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      ...props.style,
    }}
  >
    <span aria-hidden="true">{option?.value === 'apple' ? '🍎' : '🍉'}</span>
    <span>{option?.text}</span>
    <button
      type="button"
      className="colox-select__tag-remove"
      aria-label={`Remove ${option?.text ?? ''}`}
      onClick={onRemove}
    >
      ×
    </button>
  </span>
);

export const TagTemplateDemo = (
  <Select mode="multiple" defaultValue={['apple', 'date']}>
    <Select.Option value="apple" text="Apple" />
    <Select.Option value="banana" text="Banana" />
    <Select.Option value="cherry" text="Cherry" disabled />
    <Select.Option value="date" text="Date" />
    <Select.Template name="tag">
      <EmojiTag />
    </Select.Template>
  </Select>
);
