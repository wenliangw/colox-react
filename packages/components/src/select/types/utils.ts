import type { ReactNode } from 'react';
import type { SelectOptionRecord } from './component';

export type SelectFilterFn = (query: string, option: SelectOptionRecord) => boolean;

export interface ResolveInputValueParams {
  isMultiple: boolean;
  isOpen: boolean;
  query: string;
  selectedText: string | undefined;
}

export interface ResolveControlLabelParams {
  ariaLabel: string | undefined;
  isMultiple: boolean;
  selectedRecord: SelectOptionRecord | undefined;
  currentSingle: string;
  placeholder: ReactNode;
}

export interface ResolveButtonDisplayParams {
  selectedRecord: SelectOptionRecord | undefined;
  currentSingle: string;
  placeholder: ReactNode;
}
