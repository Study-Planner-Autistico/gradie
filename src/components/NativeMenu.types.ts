import type { Button } from '@expo/ui/swift-ui';
import type { ComponentProps, ReactElement } from 'react';

// Solo tipi: sul web l'import sparisce, quindi non carica @expo/ui/swift-ui.
export type NativeMenuItem = { label: string; systemImage: ComponentProps<typeof Button>['systemImage']; onPress: () => void; destructive?: boolean };
export type NativeMenuProps = { icon: ReactElement; label: string; items: NativeMenuItem[] };
