import React, { useState } from 'react';

import { BoundForm } from './util';

const TABLET_DATA = {
  'CTL-472': {
    name: 'One by Wacom (CTL-472)',
    data: {
      w: 15200,
      h: 9500,
      pw: 152,
      ph: 95
    }
  },
  'Huion-420': {
    name: 'Huion 420/osu!tablet',
    data: {
      w: 8340,
      h: 4680,
      pw: 105.918,
      ph: 59.436
    }
  }
};

export function TabletSelector({tablet, setTablet, projection, setProjection}) {
  const [model, setModel] = useState('CTL-472');

  function handleChange(e) {
    const tabletModel = e.target.selectedOptions[0].value;

    setModel(tabletModel);

    if (tabletModel !== 'custom') {
      const tabletData = TABLET_DATA[tabletModel].data;
      const hScalingFactor = tabletData.w / tablet.w;
      const vScalingFactor = tabletData.h / tablet.h;

      setTablet(tabletData);
      setProjection({
        x: Math.round(projection.x * hScalingFactor),
        y: Math.round(projection.y * vScalingFactor),
        w: Math.round(projection.w * hScalingFactor),
        h: Math.round(projection.h * vScalingFactor)
      });
    }
  }

  let options = [];

  for (const tablet_model in TABLET_DATA) {
    options.push(<option key={tablet_model} value={tablet_model}>{TABLET_DATA[tablet_model].name}</option>);
  }

  return (
    <div>
      <label htmlFor="tablet-select">Select your tablet: </label>
      <select name="tablet" id="tablet-select" onChange={handleChange}>
        {options}
        <option value="custom">Custom</option>
      </select>

      <BoundForm
        data={tablet}
        schema={{
          w: {
            min: 1,
            label: "width",
            disabled: model !== 'custom'
          },
          h: {
            min: 1,
            label: "height",
            disabled: model !== 'custom'
          },
          pw: {
            min: 1,
            step: "any",
            label: "physical width (mm)",
            disabled: model !== 'custom'
          },
          ph: {
            min: 1,
            step: "any",
            label: "physical height (mm)",
            disabled: model !== 'custom'
          }
        }}
        setter={setTablet}
      />
    </div>
  );
}

// vim: ts=2:sw=2:et
