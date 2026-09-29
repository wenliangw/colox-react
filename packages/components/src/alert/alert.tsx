import { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import type { AnimationEvent } from 'react';
import { IconError, IconInfo, IconSuccess, IconWarning, IconX } from '@colox/icons';
import { IconButton } from '../icon-button';
import type { AlertProps, AlertRef, AlertType } from './types';
import { alertVariants } from './variants';

import './styles/index.scss';

/**
 * The type → semantic icon map, shared with the message system's
 * palette icons (`IconInfo`/`IconSuccess`/`IconWarning`/`IconError`).
 */
const ALERT_TYPE_ICONS: Record<AlertType, typeof IconInfo> = {
  info: IconInfo,
  success: IconSuccess,
  warning: IconWarning,
  error: IconError,
};

/**
 * Alert — the inline status message: a persistent, in-flow,
 * declarative status block (the flow-in sibling of the transient
 * Toast/Notify message system — it lives in the page, the parent
 * decides whether it shows, and the words are JSX).
 *
 * `type` (info/success/warning/error, default info) picks the semantic
 * icon glyph and the default palette family; `palette` (six families,
 * defaulting to the type's family) picks the color; `variant`
 * (plain/subtle/solid/outline, default subtle) picks the surface
 * strength. `message` is the primary line, `description` the optional
 * secondary line — both ReactNode, so rich content fits directly (no
 * dot-part: content simple enough for props). `showIcon` gates the
 * semantic icon (default on), `action` is the trailing CTA slot (a
 * persistent inline block is the proper host for a status + CTA,
 * unlike a 3s transient hint), and `closeable` + `onClose` is the
 * controlled close.
 *
 * The close is controlled and animated: clicking the ✕ fades the block
 * out (an internal exit-window state, not a hidden state — the alert
 * still never hides itself), and `onClose` fires when the fade ends, at
 * which point the parent conditionally renders it away. The live region
 * follows the type: error/warning announce assertively (`role="alert"`),
 * info/success politely (`role="status"`).
 */
export const Alert = forwardRef<AlertRef, AlertProps>((props, ref) => {
  const {
    type = 'info',
    palette,
    variant,
    message,
    description,
    showIcon = true,
    action,
    closeable,
    className,
    onClose,
    ...rest
  } = props;

  // The palette defaults to the type's own family — the type values
  // are a subset of the palette values, so `palette ?? type` resolves
  // both the explicit override and the derived default in one step.
  const resolvedPalette = palette ?? type;
  const TypeIcon = ALERT_TYPE_ICONS[type];

  // The exit window: clicking the ✕ flips this once, the fade-out
  // plays, and `onClose` fires on its end — the parent then unmounts.
  // A state, not a hidden state: the alert still never hides itself.
  const [exiting, setExiting] = useState(false);

  const handleClose = () => {
    if (exiting) return;
    setExiting(true);
  };

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    // Only the root's own exit animation hands control back — a bubbled
    // child animation (an icon press-scale, say) must not notify the
    // parent. The `exiting` guard scopes this to the close fade.
    if (exiting && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      ref={ref}
      role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
      className={clsx(
        alertVariants({ palette: resolvedPalette, variant }),
        exiting && 'colox-alert--exiting',
        className,
      )}
      onAnimationEnd={handleAnimationEnd}
      {...rest}
    >
      {showIcon && <TypeIcon className="colox-alert__icon" aria-hidden="true" />}
      <div className="colox-alert__body">
        <div className="colox-alert__message">{message}</div>
        {description != null && <div className="colox-alert__description">{description}</div>}
      </div>
      {action != null && <div className="colox-alert__action">{action}</div>}
      {closeable && (
        <IconButton
          size="4"
          variant="muted"
          className="colox-alert__close"
          aria-label="Close"
          onClick={handleClose}
        >
          <IconX aria-hidden="true" />
        </IconButton>
      )}
    </div>
  );
});

Alert.displayName = 'Alert';
