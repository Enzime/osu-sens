import React from 'react';

import { VariableDisplay } from './util';

function calculatePlayArea({x, y, w, h}) {
  if (w === 1366 && h === 768) {
    return {
      x: x + 273,
      y: y + 89,
      w: 820,
      h: 615,
    }
  }
}

export function TabletMath({screen, subscreen, tablet, projection}) {
  const playArea = calculatePlayArea(subscreen);

  // distance per tablet pixel (mm/tp)
  const mm_per_tx = tablet.pw / tablet.w;
  const mm_per_ty = tablet.ph / tablet.h;

  const mmX = mm_per_tx * projection.w;
  const mmY = mm_per_ty * projection.h;

  let sensX, sensY;

  if (playArea) {
    // tablet pixel per screen pixel (tp/sp)
    const tx_per_sx = projection.w / subscreen.w;
    const ty_per_sy = projection.h / subscreen.h;

    // screen pixel per osu!pixel (sp/op)
    const sx_per_op = playArea.w / 512;
    const sy_per_op = playArea.h / 384;

    sensX = 1/(mm_per_tx * tx_per_sx * sx_per_op);
    sensY = 1/(mm_per_ty * ty_per_sy * sy_per_op);
  }

  // calculate coordinate transformation matrix elements
  const xScale = (subscreen.w / screen.w) * tablet.w / projection.w;
  const yScale = (subscreen.h / screen.h) * tablet.h / projection.h;
  const xOffset = -(projection.x / tablet.w) * xScale + (subscreen.x / screen.w);
  const yOffset = -(projection.y / tablet.h) * yScale + (subscreen.y / screen.h);

  return (
    <div>
      <VariableDisplay scaleX={xScale} offsetX={xOffset} scaleY={yScale} offsetY={yOffset} />
      <VariableDisplay mmX={mmX} mmY={mmY} />
      <VariableDisplay sensX={sensX} sensY={sensY} />
      <pre>xinput set-prop "Wacom One by Wacom S Pen" "Coordinate Transformation Matrix" {xScale} 0 {xOffset} 0 {yScale} {yOffset} 0 0 1</pre>
    </div>
  );
}

// vim: ts=2:sw=2:et
