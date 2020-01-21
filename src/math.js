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
  const [command, setCommand] = useState(
    'xinput set-prop "Wacom One by Wacom S Pen" "Coordinate Transformation Matrix" '
  );

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

function MatrixForm({matrix, updateProjection}) {
  const [formValues, setFormValues] = useState({
    scaleX: 1,
    scaleY: 1,
    offsetX: 0,
    offsetY: 0
  });

  const [overrideValues, setOverrideValues] = useState(false);

  useEffect(() => {
    if (overrideValues) {
      setFormValues(matrix);
    } else {
      setOverrideValues(true);
    }
  }, [matrix]);

  let inputs = [];

  function handleChange(e) {
    setOverrideValues(false);

    const newFormValues = {...matrix, [e.target.name]: e.target.value};
    setFormValues(newFormValues);

    if (e.target.reportValidity()) {
      let newMatrix = {...matrix};

      for (const field in newFormValues) {
        if (newFormValues[field] && !isNaN(newFormValues[field])) {
          if (!field.startsWith('scale') || (field.startsWith('scale') && Number(newFormValues[field]) !== 0)) {
            newMatrix[field] = newFormValues[field];
          }
        }
      }

      updateProjection(newMatrix);
    }
  }

  for (const element in matrix) {
    inputs.push(
      <span key={element}>
        <label htmlFor={element}>{element}: </label>
        <input
          type="text"
          name={element}
          id={element}
          value={formValues[element]}
          onChange={handleChange}
          pattern={element.startsWith('scale') ? "(0\\.\\d*[1-9]|[1-9]\\d*(\\.\\d+)?)" : "-?[0-9]*\\.?[0-9]+"}
          required={true}
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

function SensitivityForm({sensitivity, updateProjection}) {
  const [formValues, setFormValues] = useState({x: 0, y: 0});

  const [overrideValues, setOverrideValues] = useState(false);

  useEffect(() => {
    if (overrideValues) {
      setFormValues(sensitivity);
    } else {
      setOverrideValues(true);
    }
  }, [sensitivity]);

  let inputs = [];

  function handleChange(e) {
    setOverrideValues(false);

    const newFormValues = {...sensitivity, [e.target.name]: e.target.value};
    setFormValues(newFormValues);

    if (e.target.reportValidity()) {
      let newSensitivity = {...sensitivity};

      for (const field in newFormValues) {
        newSensitivity[field] = Number(newFormValues[field]);
      }

      updateProjection(newSensitivity);
    }
  }

  for (const axis in sensitivity) {
    inputs.push(
      <span key={axis}>
        <label htmlFor={axis}>sens{axis.toUpperCase()}: </label>
        <input
          type="text"
          name={axis}
          id={axis}
          value={formValues[axis] === 0 ? "undefined" : formValues[axis]}
          onChange={handleChange}
          pattern={"0\\.\\d*[1-9]|[1-9]\\d*(\\.\\d+)?"}
          required={true}
          disabled={sensitivity[axis] === 0}
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

export function TabletMath({screen, subscreen, tablet, projection, setProjection}) {
  const [matrix, setMatrix] = useState({scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0});
  const [sensitivity, setSensitivity] = useState({x: 0, y: 0});

  useEffect(() => {
    // calculate coordinate transformation matrix elements
    const scaleX = (subscreen.w / screen.w) * tablet.w / projection.w;
    const scaleY = (subscreen.h / screen.h) * tablet.h / projection.h;
    const offsetX = -(projection.x / tablet.w) * scaleX + (subscreen.x / screen.w);
    const offsetY = -(projection.y / tablet.h) * scaleY + (subscreen.y / screen.h);

    setMatrix({scaleX, scaleY, offsetX, offsetY});

    const playArea = calculatePlayArea(subscreen);

    if (playArea) {
      // osu!pixels per screen pixel (op/sp)
      const op_per_sx = 512 / playArea.w;
      const op_per_sy = 384 / playArea.h;

      // screen pixels per tablet pixel (sp/tp)
      const sx_per_tx = subscreen.w / projection.w;
      const sy_per_ty = subscreen.h / projection.h;

      // tablet pixels per mm (tp/mm)
      const tx_per_mm = tablet.w / tablet.pw;
      const ty_per_mm = tablet.h / tablet.ph;

      // sensitivity = osu!pixels per mm
      setSensitivity({
        x: op_per_sx * sx_per_tx * tx_per_mm,
        y: op_per_sy * sy_per_ty * ty_per_mm
      });
    } else {
      setSensitivity({x: 0, y: 0});
    }
  }, [screen, subscreen, tablet, projection]);

  function updateProjectionFromCTM(newMatrix) {
    setProjection({
      x: Math.round((tablet.w / newMatrix.scaleX) * (subscreen.x / screen.w - newMatrix.offsetX)),
      y: Math.round((tablet.h / newMatrix.scaleY) * (subscreen.y / screen.h - newMatrix.offsetY)),
      w: Math.round((subscreen.w / screen.w) * tablet.w / newMatrix.scaleX),
      h: Math.round((subscreen.h / screen.h) * tablet.h / newMatrix.scaleY)
    });
  }

  function updateProjectionFromSensitivity(newSensitivity) {
    setProjection({
      ...projection,
      w: Math.round(projection.w * sensitivity.x / newSensitivity.x),
      h: Math.round(sensitivity.y * projection.h / newSensitivity.y)
    });
  }

  // distance per tablet pixel (mm/tp)
  const mm_per_tx = tablet.pw / tablet.w;
  const mm_per_ty = tablet.ph / tablet.h;

  const mmX = mm_per_tx * projection.w;
  const mmY = mm_per_ty * projection.h;

  return (
    <div>
      <MatrixForm
        matrix={matrix}
        updateProjection={updateProjectionFromCTM}
      />
      <VariableDisplay mmX={mmX} mmY={mmY} />
      <SensitivityForm
        sensitivity={sensitivity}
        updateProjection={updateProjectionFromSensitivity}
      />
      <MatrixCommand matrix={matrix} />
    </div>
  );
}

// vim: ts=2:sw=2:et
