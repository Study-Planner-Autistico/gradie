import { View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';
import { Icon, type IconName } from '../icons';

/** Riquadro di ogni illustrazione: l'oggetto sta in piedi e la base esce dal fondo, nascosta dal bordo della barra. */
export const ART_W = 40;
export const ART_H = 56;
/** Altezza disegnata: il corpo continua oltre la parte visibile, fino al bordo dello schermo sotto la fascia della home. */
export const ART_FULL = 100;

// Stile comune (dec. 177): forme piene e morbide, una luce a sinistra, un bordo appena più scuro, come una gomma vista di fronte.
const EDGE = 'rgba(0,0,0,0.13)';
const LIGHT = { fill: '#FFFFFF', opacity: 0.38 };

/** Blocchetto colorato con il cappuccio più chiaro in cima (la gomma); gli strumenti senza oggetto vi portano il loro simbolo. */
function Block({ body, cap, glyph, glyphColor, turn }: { body: string; cap: string; glyph?: IconName; glyphColor?: string; turn?: string }) {
  return (
    <View style={{ width: ART_W, height: ART_FULL }}>
      <Svg width={ART_W} height={ART_FULL}>
        <Rect x={7} y={12} width={26} height={88} rx={7} fill={body} stroke={EDGE} />
        <Path d="M7 26 V19 a7 7 0 0 1 7 -7 h12 a7 7 0 0 1 7 7 V26 Z" fill={cap} />
        <Rect x={10} y={15} width={5} height={81} rx={2.5} {...LIGHT} />
      </Svg>
      {glyph && (
        <View
          style={{
            position: 'absolute',
            top: 24,
            left: 0,
            right: 0,
            alignItems: 'center',
            transform: [{ rotate: turn ?? '0deg' }],
          }}
        >
          <Icon name={glyph} size={18} color={glyphColor ?? '#FFFFFF'} />
        </View>
      )}
    </View>
  );
}

function Pen({ color }: { color: string }) {
  return (
    <Svg width={ART_W} height={ART_FULL}>
      <Path d="M13 18 L20 3 L27 18 Z" fill="#D7D8DE" stroke={EDGE} />
      <Path d="M18.2 7 L20 2.5 L21.8 7 Z" fill={color} />
      <Rect x={12} y={17} width={16} height={83} rx={4} fill="#F4F4F7" stroke={EDGE} />
      <Rect x={12} y={17} width={16} height={7} rx={2} fill={color} />
      <Rect x={14.5} y={26} width={3.5} height={70} rx={1.75} {...LIGHT} />
    </Svg>
  );
}

function Pencil({ color }: { color: string }) {
  return (
    <Svg width={ART_W} height={ART_FULL}>
      <Path d="M12 19 L20 3 L28 19 Z" fill="#F2D4A6" stroke={EDGE} />
      <Path d="M17.4 8.2 L20 3 L22.6 8.2 Z" fill={color} />
      <Rect x={12} y={18} width={16} height={82} rx={2} fill="#F7C948" stroke={EDGE} />
      <Rect x={17.6} y={18} width={4.8} height={82} fill="#E8B530" />
      <Rect x={13.5} y={20} width={2.6} height={76} rx={1.3} {...LIGHT} />
    </Svg>
  );
}

function Highlighter({ color }: { color: string }) {
  return (
    <Svg width={ART_W} height={ART_FULL}>
      <Path d="M14 21 V11 L26 6 V21 Z" fill={color} stroke={EDGE} />
      <Path d="M14 21 V11 L26 6 V21 Z" fill="#000000" opacity={0.12} />
      <Rect x={10} y={20} width={20} height={80} rx={5} fill={color} stroke={EDGE} />
      <Rect x={10} y={20} width={20} height={8} rx={3} fill="#FFFFFF" opacity={0.55} />
      <Rect x={12.5} y={30} width={4} height={66} rx={2} {...LIGHT} />
    </Svg>
  );
}

function Ruler() {
  return (
    <Svg width={ART_W} height={ART_FULL}>
      <Rect x={11} y={4} width={18} height={96} rx={3} fill="#F6D86E" stroke={EDGE} />
      <G stroke="#A07D16" strokeWidth={1.2} strokeLinecap="round">
        {[10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95].map((y, i) => (
          <Line key={y} x1={11.5} y1={y} x2={i % 2 ? 16 : 19} y2={y} />
        ))}
      </G>
      <Rect x={23} y={7} width={3} height={89} rx={1.5} {...LIGHT} />
    </Svg>
  );
}

function Mic() {
  return (
    <Svg width={ART_W} height={ART_FULL}>
      <Path d="M11 25 a9 9 0 0 0 18 0" stroke="#5E5E66" strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <Rect x={18.8} y={33} width={2.4} height={67} fill="#5E5E66" />
      <Rect x={13.5} y={6} width={13} height={24} rx={6.5} fill="#9A9AA4" stroke={EDGE} />
      <G stroke="#7A7A84" strokeWidth={1}>
        <Line x1={14} y1={13} x2={26} y2={13} />
        <Line x1={14} y1={17} x2={26} y2={17} />
        <Line x1={14} y1={21} x2={26} y2={21} />
      </G>
      <Rect x={15.5} y={8} width={3} height={19} rx={1.5} {...LIGHT} />
    </Svg>
  );
}

export type ArtKey = 'pen' | 'pencil' | 'highlighter' | 'eraser' | 'text' | 'select' | 'add' | 'audio' | 'hand' | 'ruler' | 'shapes';

/** Illustrazione di uno strumento della lavagna; `color` è l'inchiostro scelto, per penna, matita ed evidenziatore. */
/** `turn`: rotazione che tiene dritto il simbolo dei blocchetti quando la barra è di lato o in alto. */
export function ToolArt({ tool, color, lasso, eraserWhole, turn }: { tool: ArtKey; color: string; lasso?: boolean; eraserWhole?: boolean; turn?: string }) {
  switch (tool) {
    case 'pen':
      return <Pen color={color} />;
    case 'pencil':
      return <Pencil color={color} />;
    case 'highlighter':
      return <Highlighter color={color} />;
    case 'ruler':
      return <Ruler />;
    case 'audio':
      return <Mic />;
    case 'eraser':
      return <Block body="#EE8E92" cap="#F8BDBF" glyph={eraserWhole ? 'eraser-whole' : undefined} glyphColor="#B5484D" turn={turn} />;
    case 'text':
      return <Block body="#8D84F0" cap="#B9B3F7" glyph="format-text" turn={turn} />;
    case 'select':
      return <Block body="#5DB6F0" cap="#9DD3F6" glyph={lasso ? 'lasso' : 'selection-drag'} turn={turn} />;
    case 'add':
      return <Block body="#F5B544" cap="#F9D58F" glyph="plus" turn={turn} />;
    case 'hand':
      return <Block body="#F2A27A" cap="#F8C6AC" glyph="hand-back-right-outline" turn={turn} />;
    case 'shapes':
      return <Block body="#5FC98A" cap="#9EE0B8" glyph="shape-outline" turn={turn} />;
  }
}
