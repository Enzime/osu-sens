import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import { TabletMath } from './math';
import { DesktopDisplay } from './desktop';
import { AspectRatioBox, BoundForm, ManagedRnd } from './util';

function TabletDisplay({subscreenImage, tablet, projection, setProjection}) {
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

function ScreenshotSelector({setImage}) {
  function handleChange(e) {
    // generate blob URL
    const url = window.URL.createObjectURL(e.target.files[0]);

    // find width and height of image
    let img = new Image();
    img.src = url;
    img.onload = () => {
      setImage({image: url, w: img.width, h: img.height});
    };
  }

  return (
    <form>
      <div>upload desktop screenshot</div>
      <input type="file" onChange={handleChange} />
    </form>
  );
}

function App() {
  const [screen, setScreen] = useState({
    image: 'http://192.168.0.3:8080/Pictures/Screenshots.phi/19-12-19_23-11-03.png',
    w: 3840,
    h: 1080
  });
  const [subscreen, setSubscreen] = useState({x: 2197, y: 165, w: 1366, h: 768});
  const [subscreenImage, setSubscreenImage] = useState();
  const [tablet, setTablet] = useState({w: 15200, h: 9500, pw: 152.0, ph: 95.0});
  const [projection, setProjection] = useState({x: 0, y: 0, w: 15200, h: 9500});

  return (
    <div className="App">
      <details>
        <summary>ScreenshotSelector</summary>
        <ScreenshotSelector setImage={setScreen} />
        <BoundForm
          data={screen}
          schema={{
            image: 'ignore',
            w: {
              min: 1,
              label: "width"
            },
            h: {
              min: 1,
              label: "height"
            }
          }}
          setter={setScreen}
        />
      </details>
      <hr />
      <details>
        <summary>DesktopDisplay</summary>
        <DesktopDisplay screen={screen} subscreen={subscreen} setSubscreen={setSubscreen} subscreenImage={subscreenImage} setSubscreenImage={setSubscreenImage} />
        <BoundForm
          data={subscreen}
          schema={{
            x: {
              min: 0,
              max: screen.w
            },
            y: {
              min: 0,
              max: screen.h
            },
            w: {
              min: 1,
              max: screen.w,
              label: "width"
            },
            h: {
              min: 1,
              max: screen.h,
              label: "height"
            }
          }}
          setter={setSubscreen}
        />
      </details>
      <hr />
      <details open>
        <summary>TabletDisplay</summary>
        <BoundForm
          data={tablet}
          schema={{
            w: {
              min: 1,
              label: "width"
            },
            h: {
              min: 1,
              label: "height"
            },
            pw: {
              min: 1,
              step: "any",
              label: "physical width (mm)"
            },
            ph: {
              min: 1,
              step: "any",
              label: "physical height (mm)"
            }
          }}
          setter={setTablet}
        />
        <TabletDisplay subscreenImage={subscreenImage} tablet={tablet} projection={projection} setProjection={setProjection} />
        <BoundForm
          data={projection}
          schema={{
            x: {
              max: tablet.w
            },
            y: {
              max: tablet.h
            },
            w: {
              min: 1,
              label: "width"
            },
            h: {
              min: 1,
              label: "height"
            }
          }}
          setter={setProjection}
        />
      </details>
      <hr />
      <details open>
        <summary>TabletMath</summary>
        <TabletMath screen={screen} subscreen={subscreen} tablet={tablet} projection={projection} />
      </details>
    </div>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

// vim: ts=2:sw=2:et
