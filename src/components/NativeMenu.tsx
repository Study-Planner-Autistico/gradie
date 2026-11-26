// Menu a tendina nativo di iOS (SwiftUI), come NativeMoreMenu di Appunti (dec. 174) ma con voci libere (dec. 213).
// Solo iOS: sul web c'è NativeMenu.web.tsx, perché @expo/ui/swift-ui lì non esiste (dec. 184).
import { Button, Host, Menu, RNHostView } from '@expo/ui/swift-ui';
import { accessibilityLabel, buttonStyle, menuIndicator, menuStyle } from '@expo/ui/swift-ui/modifiers';
import type { NativeMenuProps } from './NativeMenu.types';

export function NativeMenu({ icon, label, items }: NativeMenuProps) {
  return (
    <Host matchContents>
      <Menu label={<RNHostView matchContents>{icon}</RNHostView>} modifiers={[menuStyle('button'), buttonStyle('plain'), menuIndicator('hidden'), accessibilityLabel(label)]}>
        {items.map((it) => (
          <Button key={it.label} label={it.label} systemImage={it.systemImage} role={it.destructive ? 'destructive' : undefined} onPress={it.onPress} />
        ))}
      </Menu>
    </Host>
  );
}
