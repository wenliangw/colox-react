import { forwardRef } from 'react';
import clsx from 'clsx';
import { EmptyDataFigure, ErrorEmptyFigure, SearchEmptyFigure } from './presentations';
import type { EmptyProps, EmptyRef, EmptyType } from './types';

import './styles/index.scss';

/** The built-in scene figures — each with its own ambient hue palette. */
const EMPTY_FIGURES: Record<EmptyType, typeof EmptyDataFigure> = {
  empty: EmptyDataFigure,
  search: SearchEmptyFigure,
  error: ErrorEmptyFigure,
};

/**
 * Empty — the empty-state block: a centered figure, a title and a
 * description (plus an optional action) that tell the reader a region
 * has nothing to show and what to do about it. The `type` scene picks
 * the built-in figure — a rich, multi-color atmospheric scene (a folder
 * with floating data pages, a magnifier over floating documents, a
 * ringed planet with its moon under a starfield), decorative as a whole
 * and marked with `data-scene` for CSS hooks; the semantic color still
 * belongs to the prose and any action. `figure` overrides it with a
 * custom illustration. Static display: no events, no state, not
 * closable — a page-level state, not a transient message.
 */
export const Empty = forwardRef<EmptyRef, EmptyProps>((props, ref) => {
  const { type = 'empty', figure, title, description, action, className, ...rest } = props;
  const Figure = EMPTY_FIGURES[type];
  return (
    <div ref={ref} className={clsx('colox-empty', className)} {...rest}>
      <div className="colox-empty__figure" data-scene={type}>
        {figure ?? <Figure />}
      </div>
      {title && <div className="colox-empty__title">{title}</div>}
      {description && <div className="colox-empty__description">{description}</div>}
      {action && <div className="colox-empty__action">{action}</div>}
    </div>
  );
});

Empty.displayName = 'Empty';
