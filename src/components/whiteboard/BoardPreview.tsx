import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Image as SvgImage, Rect, Text as SvgText } from 'react-native-svg';
import type { BoardItem } from '../../state/whiteboard';
import { ink, useTheme } from '../../theme';
import { StrokeShape } from './Canvas';
import { bounds, textMetrics, union } from './geometry';

/** Anteprima in miniatura della lavagna: tutto il contenuto, ridotto per stare nella scheda. */
export function BoardPreview({ items, height }: { items: BoardItem[]; height: number }) {
  const { isDark } = useTheme();
  const [width, setWidth] = useState(0);
  const box = union(items.map(bounds));
  const pad = 10;
  const scale = box && width > 0 ? Math.min((width - pad * 2) / Math.max(box.w, 1), (height - pad * 2) / Math.max(box.h, 1), 1) : 1;
  const tx = box ? (width - box.w * scale) / 2 - box.x * scale : 0;
  const ty = box ? (height - box.h * scale) / 2 - box.y * scale : 0;
  const highlights = items.filter((i) => i.kind === 'stroke' && i.tool === 'highlighter');
  const rest = items.filter((i) => !(i.kind === 'stroke' && i.tool === 'highlighter'));

  return (
    <View
      style={{ height, backgroundColor: isDark ? ink.paper.dark : ink.paper.light }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      pointerEvents="none"
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          <G transform={`translate(${tx} ${ty}) scale(${scale})`}>
            {[...highlights, ...rest].map((i) => (
              <PreviewItem key={i.id} item={i} />
            ))}
          </G>
        </Svg>
      )}
    </View>
  );
}

function PreviewItem({ item: i }: { item: BoardItem }) {
  switch (i.kind) {
    case 'stroke':
      return <StrokeShape s={i} />;
    case 'text':
      return (
        <SvgText x={i.x} y={i.y + textMetrics.size} fontSize={textMetrics.size} fill={i.color}>
          {i.text}
        </SvgText>
      );
    case 'image':
      return <SvgImage href={{ uri: i.uri }} x={i.x} y={i.y} width={i.w} height={i.h} preserveAspectRatio="xMidYMid slice" />;
    case 'sticker':
      return (
        <SvgText x={i.x} y={i.y + i.size} fontSize={i.size}>
          {i.emoji}
        </SvgText>
      );
    case 'note': {
      const b = bounds(i);
      return <Rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6} fill={ink.sticky} />;
    }
    case 'audio':
      return <Circle cx={i.x + 22} cy={i.y + 22} r={22} fill={ink.selection} />;
  }
}
