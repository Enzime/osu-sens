import React, { useEffect, useState } from 'react';

import { AspectRatioBox, ManagedRnd } from './util';

export function DesktopDisplay({screen, subscreen, setSubscreen, subscreenImage, setSubscreenImage}) {
  const [scalingFactor, setScalingFactor] = useState(1);

  function handleNewWindowImage() {
    let img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = screen.image;

    let offscreen = document.createElement('canvas');
    offscreen.width = subscreen.w;
    offscreen.height = subscreen.h;
    let ctx = offscreen.getContext('2d');

    img.onload = () => {
      ctx.drawImage(img, subscreen.x, subscreen.y, subscreen.w, subscreen.h, 0, 0, subscreen.w, subscreen.h);
      offscreen.toBlob((blob) => {
        setSubscreenImage(URL.createObjectURL(blob));
      });
    };
  }

  useEffect(handleNewWindowImage, [screen.image]);

  const position = {x: Math.round(subscreen.x / scalingFactor), y: Math.round(subscreen.y / scalingFactor)};
  const size = {w: subscreen.w / screen.w, h: subscreen.h / screen.h};

  function rndPosToAbs(x, y) {
    return {
      x: Math.round(x * scalingFactor),
      y: Math.round(y * scalingFactor)
    };
  }

  function handleDrag({x, y}) {
    setSubscreen({...subscreen, ...rndPosToAbs(x, y)});
  }

  function handleResize({x, y, w, h}) {
    setSubscreen({
      ...rndPosToAbs(x, y),
      w: Math.round(w * screen.w),
      h: Math.round(h * screen.h)
    });
  }

  return (
    <AspectRatioBox
      size={{width: screen.w, height: screen.h}}
      padding={{vertical: 0, horizontal: 20}}
      style={{
        position: 'relative',
        marginLeft: '10px',
        backgroundImage: `url(${screen.image})`,
        backgroundSize: '100% 100%'
      }}
      setScalingFactor={setScalingFactor}
    >
      <ManagedRnd
        bounds="parent"
        onDragStop={handleNewWindowImage}
        onResizeStop={handleNewWindowImage}
        position={position}
        size={size}
        handleDrag={handleDrag}
        handleResize={handleResize}
      />
    </AspectRatioBox>
  );
}

export function TabletDisplay({subscreenImage, tablet, projection, setProjection}) {
  const [scalingFactor, setScalingFactor] = useState(1);

  function rndPosToAbs(x, y) {
    return {
      x: Math.round((x + 1) * scalingFactor),
      y: Math.round((y + 1) * scalingFactor)
    };
  }

  function handleDrag({x, y}) {
    setProjection({...projection, ...rndPosToAbs(x, y)});
  }

  function handleResize({x, y, w, h}) {
    setProjection({
      ...rndPosToAbs(x, y),
      w: Math.round(w * tablet.w),
      h: Math.round(h * tablet.h)
    });
  }

  const rndPos = {
    x: Math.round(projection.x / scalingFactor) + 1,
    y: Math.round(projection.y / scalingFactor) + 1
  };

  const rndSize = {
    w: projection.w / tablet.w,
    h: projection.h / tablet.h
  };

  return (
    <AspectRatioBox
      size={{width: tablet.w, height: tablet.h}}
      padding={{vertical: 0, horizontal: 20}}
      style={{
        border: '1px solid',
        position: 'relative',
        marginLeft: '10px'
      }}
      setScalingFactor={setScalingFactor}
    >
      <ManagedRnd
        size={rndSize}
        position={rndPos}
        handleDrag={handleDrag}
        handleResize={handleResize}
        style={{
          backgroundImage: `url(${subscreenImage})`,
          backgroundSize: '100% 100%'
        }}
      />
    </AspectRatioBox>
  );
}

// vim: ts=2:sw=2:et
