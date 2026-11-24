import type { ReactElement } from 'react';
import type { SortMode } from '../state/notebooks';

export type NativeMoreMenuProps = {
  icon: ReactElement;
  sorts: SortMode[];
  sort: SortMode;
  plainCovers: boolean;
  onSort: (m: SortMode) => void;
  onPlainCovers: (v: boolean) => void;
  onTrash: () => void;
};
