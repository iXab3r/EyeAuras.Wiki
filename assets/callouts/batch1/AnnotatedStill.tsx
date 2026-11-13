// EA-1857 callouts: static annotated screenshot rendered with reelforge/Remotion (batch1 revision of the pilot composition).
// Register in src/Root.tsx of a `reelforge project init` project:
//   <Composition id="AnnotatedStill" component={AnnotatedStill} width={1572} height={1025} fps={30} durationInFrames={1}
//     defaultProps={props as AnnotatedStillProps} calculateMetadata={annotatedStillMetadata} />
// Put the frame's raw-*.png into public/, then:
//   npx remotion still AnnotatedStill out/<frame>.png --props=<frame>.props.json --image-format=png
// Highlight rects come from <frame>.rects.json (CDP getBoundingClientRect, DPR 1, see its "mapping").
// Batch1 changes vs pilot: label sides 'left'/'below', optional `align` for above/below plates, optional `gap` (connector length).
import React from 'react';
import {AbsoluteFill, Img, type CalculateMetadataFunction} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Inter';
import {asset} from './theme';

const {fontFamily} = loadFont('normal', {weights: ['600'], subsets: ['latin', 'cyrillic']});

/** Rect in screenshot pixels (see rects.json), plus a label placed beside, above or below it. */
export type Highlight = {x: number; y: number; width: number; height: number; label: string;
  side: 'right' | 'left' | 'above' | 'below'; labelY?: number; // labelY: plate centre for right/left
  gap?: number; // right/left: connector length in px (default 10)
  align?: 'start' | 'end'; // above/below: plate flush with the frame's left (start) or right (end, default) edge
  pad?: [number, number, number, number]}; // top, right, bottom, left; defaults to `inflate`

export type AnnotatedStillProps = {
  src: string;
  imageWidth: number;
  imageHeight: number;
  padding: {left: number; top: number; right: number; bottom: number};
  radius: number; // window corner radius
  color: string; // highlight colour
  labelColor: string;
  dim: number; // 0..1 darkening outside highlights
  inflate: number; // px added around each rect before stroking
  stroke: number;
  highlights: Highlight[];
};

export const annotatedStillMetadata: CalculateMetadataFunction<AnnotatedStillProps> = ({props}) => ({
  width: props.padding.left + props.imageWidth + props.padding.right,
  height: props.padding.top + props.imageHeight + props.padding.bottom,
  durationInFrames: 1,
  fps: 30,
});

/** Static screenshot annotation: real window capture, rounded mask, inner stroke, soft shadow, outlined rects. No animation. */
export const AnnotatedStill: React.FC<AnnotatedStillProps> = (p) => {
  const {imageWidth: w, imageHeight: h, inflate: d, stroke: s} = p;
  const boxes = p.highlights.map((hl) => {
    const [t, r, b, l] = hl.pad ?? [d, d, d, d];
    return {...hl, bx: hl.x - l, by: hl.y - t, bw: hl.width + l + r, bh: hl.height + t + b};
  });
  const pill: React.CSSProperties = {
    position: 'absolute', height: 22, padding: '0 9px', borderRadius: 5, background: p.color, color: p.labelColor,
    font: `600 13px/22px ${fontFamily}`, whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,.4)',
  };
  const plate = (b: (typeof boxes)[number]) => {
    const cy = (b.labelY ?? b.by + b.bh / 2), g = b.gap ?? 10;
    switch (b.side) {
      case 'right':
        return <>
          <div style={{position: 'absolute', left: b.bx + b.bw, top: cy - s / 2, width: g, height: s, background: p.color}} />
          <div style={{...pill, left: b.bx + b.bw + g, top: cy - 11}}>{b.label}</div>
        </>;
      case 'left':
        return <>
          <div style={{position: 'absolute', left: b.bx - g, top: cy - s / 2, width: g, height: s, background: p.color}} />
          <div style={{...pill, right: w - b.bx + g, top: cy - 11}}>{b.label}</div>
        </>;
      default: {
        const top = b.side === 'above' ? b.by - 26 : b.by + b.bh + 4;
        return b.align === 'start'
          ? <div style={{...pill, left: b.bx, top}}>{b.label}</div>
          : <div style={{...pill, right: w - (b.bx + b.bw), top}}>{b.label}</div>;
      }
    }
  };
  return (
    <AbsoluteFill style={{backgroundColor: 'transparent'}}>
      <div style={{position: 'absolute', left: p.padding.left, top: p.padding.top, width: w, height: h, borderRadius: p.radius,
        overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,.6)'}}>
        <Img src={asset(p.src)} style={{display: 'block', width: w, height: h}} />
        {p.dim > 0 && (
          <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
            <mask id="holes">
              <rect width={w} height={h} fill="white" />
              {boxes.map((b, i) => <rect key={i} x={b.bx} y={b.by} width={b.bw} height={b.bh} rx={6} fill="black" />)}
            </mask>
            <rect width={w} height={h} fill={`rgba(0,0,0,${p.dim})`} mask="url(#holes)" />
          </svg>
        )}
        {boxes.map((b, i) => (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: b.bx, top: b.by, width: b.bw, height: b.bh, boxSizing: 'border-box',
              border: `${s}px solid ${p.color}`, borderRadius: 6, boxShadow: `0 0 0 3px ${p.color}2e`}} />
            {plate(b)}
          </React.Fragment>
        ))}
        <div style={{position: 'absolute', inset: 0, borderRadius: p.radius, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.14)'}} />
      </div>
    </AbsoluteFill>
  );
};
