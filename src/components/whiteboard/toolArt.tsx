import { View } from "react-native";
import Svg, { G, Line, Path, Rect } from "react-native-svg";
import { Icon, type IconName } from "../icons";

/**
 * Piccoli disegni degli strumenti della lavagna (dec. 224), nello stile della gomma: oggetti interi, forme piene e
 * morbide, una luce a sinistra, un bordo appena più scuro. Niente icone a contorno.
 */
export const ART = 40;

const EDGE = "rgba(0,0,0,0.16)";
const LIGHT = { fill: "#FFFFFF", opacity: 0.45 };

/** Blocchetto con il cappuccio più chiaro in cima, come la gomma; gli strumenti senza oggetto vi portano il loro simbolo. */
function Block({
  body,
  cap,
  glyph,
  glyphColor,
}: {
  body: string;
  cap: string;
  glyph?: IconName;
  glyphColor?: string;
}) {
  return (
    <View style={{ width: ART, height: ART }}>
      <Svg width={ART} height={ART} viewBox="0 0 32 32">
        <Rect
          x={7}
          y={4}
          width={18}
          height={25}
          rx={5}
          fill={body}
          stroke={EDGE}
        />
        <Path d="M7 13 V9 a5 5 0 0 1 5 -5 h8 a5 5 0 0 1 5 5 V13 Z" fill={cap} />
        <Rect x={9.5} y={6.5} width={3} height={20} rx={1.5} {...LIGHT} />
      </Svg>
      {glyph && (
        <View
          style={{
            position: "absolute",
            top: ART * 0.42,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          <Icon
            name={glyph}
            size={Math.round(ART * 0.42)}
            color={glyphColor ?? "#FFFFFF"}
          />
        </View>
      )}
    </View>
  );
}

function Pen({ color }: { color: string }) {
  return (
    <Svg width={ART} height={ART} viewBox="0 0 32 32">
      <Path d="M12 11 L16 2 L20 11 Z" fill="#D7D8DE" stroke={EDGE} />
      <Path d="M14.8 4.8 L16 2 L17.2 4.8 Z" fill={color} />
      <Rect
        x={11.5}
        y={10}
        width={9}
        height={20}
        rx={2.5}
        fill="#E4E5EB"
        stroke={EDGE}
      />
      <Rect x={11.5} y={10} width={9} height={4.5} rx={1.5} fill={color} />
      <Rect x={13} y={16} width={2.2} height={12} rx={1.1} {...LIGHT} />
    </Svg>
  );
}

function Pencil({ color }: { color: string }) {
  return (
    <Svg width={ART} height={ART} viewBox="0 0 32 32">
      <Path d="M11.5 10 L16 2 L20.5 10 Z" fill="#F2D4A6" stroke={EDGE} />
      <Path d="M14.6 4.6 L16 2 L17.4 4.6 Z" fill={color} />
      <Rect
        x={11.5}
        y={10}
        width={9}
        height={15}
        fill="#F7C948"
        stroke={EDGE}
      />
      <Rect x={14.6} y={10} width={2.8} height={15} fill="#E8B530" />
      <Rect
        x={11.5}
        y={24}
        width={9}
        height={2.6}
        fill="#B9BCC6"
        stroke={EDGE}
      />
      <Rect
        x={11.5}
        y={26.4}
        width={9}
        height={3.6}
        rx={1.8}
        fill="#EE8E92"
        stroke={EDGE}
      />
      <Rect x={12.6} y={11} width={1.6} height={12.5} rx={0.8} {...LIGHT} />
    </Svg>
  );
}

function Highlighter({ color }: { color: string }) {
  return (
    <Svg width={ART} height={ART} viewBox="0 0 32 32">
      <Path d="M12.5 10 V5.5 L19.5 2.5 V10 Z" fill={color} stroke={EDGE} />
      <Path d="M12.5 10 V5.5 L19.5 2.5 V10 Z" fill="#000000" opacity={0.12} />
      <Rect
        x={10}
        y={9.5}
        width={12}
        height={20.5}
        rx={3.5}
        fill={color}
        stroke={EDGE}
      />
      <Rect
        x={10}
        y={9.5}
        width={12}
        height={5}
        rx={2}
        fill="#FFFFFF"
        opacity={0.55}
      />
      <Rect x={11.8} y={16} width={2.4} height={12} rx={1.2} {...LIGHT} />
    </Svg>
  );
}

function Ruler() {
  return (
    <Svg width={ART} height={ART} viewBox="0 0 32 32">
      <Rect
        x={10.5}
        y={2.5}
        width={11}
        height={27}
        rx={2.5}
        fill="#F6D86E"
        stroke={EDGE}
      />
      <G stroke="#A07D16" strokeWidth={1} strokeLinecap="round">
        {[6, 9, 12, 15, 18, 21, 24, 27].map((y, i) => (
          <Line key={y} x1={11} y1={y} x2={i % 2 ? 14 : 16.5} y2={y} />
        ))}
      </G>
      <Rect x={17.5} y={4.5} width={2} height={23} rx={1} {...LIGHT} />
    </Svg>
  );
}

function Mic() {
  return (
    <Svg width={ART} height={ART} viewBox="0 0 32 32">
      <Path
        d="M9.5 15 a6.5 6.5 0 0 0 13 0"
        stroke="#5E5E66"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <Rect x={15} y={21} width={2} height={6} fill="#5E5E66" />
      <Rect x={11} y={27} width={10} height={2.4} rx={1.2} fill="#5E5E66" />
      <Rect
        x={12}
        y={2.5}
        width={8}
        height={16}
        rx={4}
        fill="#9A9AA4"
        stroke={EDGE}
      />
      <G stroke="#7A7A84" strokeWidth={0.9}>
        <Line x1={12.5} y1={7.5} x2={19.5} y2={7.5} />
        <Line x1={12.5} y1={10.5} x2={19.5} y2={10.5} />
        <Line x1={12.5} y1={13.5} x2={19.5} y2={13.5} />
      </G>
      <Rect x={13.4} y={4} width={2} height={12} rx={1} {...LIGHT} />
    </Svg>
  );
}

export type ArtKey =
  | "pen"
  | "pencil"
  | "highlighter"
  | "eraser"
  | "text"
  | "select"
  | "add"
  | "audio"
  | "hand"
  | "ruler"
  | "shapes";

/** Disegno di uno strumento; `color` è l'inchiostro scelto, per penna, matita ed evidenziatore. */
export function ToolArt({
  tool,
  color,
  lasso,
  eraserWhole,
}: {
  tool: ArtKey;
  color: string;
  lasso?: boolean;
  eraserWhole?: boolean;
}) {
  switch (tool) {
    case "pen":
      return <Pen color={color} />;
    case "pencil":
      return <Pencil color={color} />;
    case "highlighter":
      return <Highlighter color={color} />;
    case "ruler":
      return <Ruler />;
    case "audio":
      return <Mic />;
    case "eraser":
      return (
        <Block
          body="#EE8E92"
          cap="#F8BDBF"
          glyph={eraserWhole ? "eraser-whole" : undefined}
          glyphColor="#B5484D"
        />
      );
    case "text":
      return <Block body="#8D84F0" cap="#B9B3F7" glyph="format-text" />;
    case "select":
      return (
        <Block
          body="#5DB6F0"
          cap="#9DD3F6"
          glyph={lasso ? "lasso" : "selection-drag"}
        />
      );
    case "add":
      return <Block body="#F5B544" cap="#F9D58F" glyph="plus" />;
    case "hand":
      return (
        <Block body="#F2A27A" cap="#F8C6AC" glyph="hand-back-right-outline" />
      );
    case "shapes":
      return <Block body="#5FC98A" cap="#9EE0B8" glyph="shape-outline" />;
  }
}
