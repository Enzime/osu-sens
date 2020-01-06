import React from 'react';

import { VariableDisplay } from './util';

export function TabletMath({screen, subscreen, tablet, projection}) {
  // calculate coordinate transformation matrix elements
  const xScale = (subscreen.w / screen.w) * tablet.w / projection.w;
  const yScale = (subscreen.h / screen.h) * tablet.h / projection.h;
  const xOffset = -(projection.x / tablet.w) * xScale + (subscreen.x / screen.w);
  const yOffset = -(projection.y / tablet.h) * yScale + (subscreen.y / screen.h);

  return (
    <div>
      <VariableDisplay scaleX={xScale} offsetX={xOffset} scaleY={yScale} offsetY={yOffset} />
      <VariableDisplay sensX={1} sensY={1} />
      <pre>xinput set-prop "Wacom One by Wacom S Pen" "Coordinate Transformation Matrix" {xScale} 0 {xOffset} 0 {yScale} {yOffset} 0 0 1</pre>
    </div>
  );
}

// vim: ts=2:sw=2:et
