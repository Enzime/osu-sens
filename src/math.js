import React, { useEffect, useState } from 'react';

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

function MatrixCommand({matrix}) {
  const [command, setCommand] = useState('xinput set-prop "Wacom One by Wacom S Pen" "Coordinate Transformation Matrix" ');

  function handleBlur(e) {
    setCommand(e.target.innerText);
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }

  const matrixString = `${matrix.scaleX} 0 ${matrix.offsetX} 0 ${matrix.scaleY} ${matrix.offsetY} 0 0 1`;

  function handleClick() {
    navigator.clipboard.writeText(`${command}${matrixString}`);
    alert('Copied command to clipboard');
  }

  return (
    <div>
      <button onClick={handleClick}>
        <span role="img" aria-label="Copy to Clipboard">
          📋
        </span>
      </button>
      <pre>
        <span
          contentEditable={true}
          suppressContentEditableWarning={true}
          spellCheck={false}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
        >
          {command}
        </span>
        {matrixString}
      </pre>
    </div>
  );
}

function MatrixForm({matrix, setMatrix}) {
  let inputs = [];

  function handleChange(e) {
    setMatrix({...matrix, [e.target.name]: Number(e.target.value)});
  }

  for (const element in matrix) {
    inputs.push(
      <span key={element}>
        <label htmlFor={element}>{element}: </label>
        <input
          type="text"
          name={element}
          id={element}
          value={matrix[element]}
          onChange={handleChange}
          disabled={true}
        />
      </span>
    );
  }

  return (
    <form>
      {inputs}
    </form>
  );
}

export function TabletMath({screen, subscreen, tablet, projection}) {
  const [matrix, setMatrix] = useState({});

  useEffect(() => {
    const scaleX = (subscreen.w / screen.w) * tablet.w / projection.w;
    const scaleY = (subscreen.h / screen.h) * tablet.h / projection.h;
    const offsetX = -(projection.x / tablet.w) * scaleX + (subscreen.x / screen.w);
    const offsetY = -(projection.y / tablet.h) * scaleY + (subscreen.y / screen.h);

    setMatrix({scaleX, scaleY, offsetX, offsetY});
  }, [screen, subscreen, tablet, projection]);

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

  return (
    <div>
      <MatrixForm matrix={matrix} setMatrix={setMatrix} />
      <VariableDisplay mmX={mmX} mmY={mmY} />
      <VariableDisplay sensX={sensX} sensY={sensY} />
      <MatrixCommand matrix={matrix} />
    </div>
  );
}

// vim: ts=2:sw=2:et
