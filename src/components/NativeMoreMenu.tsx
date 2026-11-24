// Menu ⋮ di Appunti con il menu nativo di SwiftUI (dec. 174). Solo iOS: sul web c'è NativeMoreMenu.web.tsx,
// perché @expo/ui/swift-ui lì non esiste e bloccava l'avvio di tutta l'app (dec. 184).
import { Button, Divider, Host, Menu, RNHostView, Toggle } from '@expo/ui/swift-ui';
import { accessibilityLabel, buttonStyle, menuIndicator, menuStyle } from '@expo/ui/swift-ui/modifiers';
import { t } from '../i18n';
import type { NativeMoreMenuProps } from './NativeMoreMenu.types';

export function NativeMoreMenu({ icon, sorts, sort, plainCovers, onSort, onPlainCovers, onTrash }: NativeMoreMenuProps) {
  return (
    <Host matchContents>
      <Menu label={<RNHostView matchContents>{icon}</RNHostView>} modifiers={[menuStyle('button'), buttonStyle('plain'), menuIndicator('hidden'), accessibilityLabel(t.activitiesHub.more)]}>
        <Menu label={t.activitiesHub.sortLabel} systemImage="arrow.up.arrow.down">
          {sorts.map((m) => (
            <Button key={m} label={t.activitiesHub.sort[m]} systemImage={sort === m ? 'checkmark' : undefined} onPress={() => onSort(m)} />
          ))}
        </Menu>
        <Toggle label={t.settings.plainCovers} systemImage="paintpalette" isOn={plainCovers} onIsOnChange={onPlainCovers} />
        <Divider />
        <Button label={t.trash.title} systemImage="trash" onPress={onTrash} />
      </Menu>
    </Host>
  );
}
