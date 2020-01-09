import React, { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';

// taken from: https://stackoverflow.com/a/36862446
function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
}

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  // pass in empty array to ensure this effect only runs once
  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

export function AspectRatioBox(props) {
  const { size: unscaled, setScalingFactor } = props;
  const { padding={horizontal: 0, vertical: 0}, style={border: '1px solid'} } = props;

  const browser = useWindowDimensions();

  const widthRatio = unscaled.width / (browser.width - padding.horizontal);
  const heightRatio = unscaled.height / (browser.height - padding.vertical);
  const scalingFactor = Math.max(1, widthRatio, heightRatio);
  const div = { width: Math.round(unscaled.width / scalingFactor), height: Math.round(unscaled.height / scalingFactor) };

  useEffect(() => {
    setScalingFactor(scalingFactor);
  }, [scalingFactor, setScalingFactor]);

  return (
    <div style={{...style, ...div}}>
      {props.children}
    </div>
  );
}

export function BoundForm(props) {
  const [values, setValues] = useState(props.data);

  useEffect(() => setValues(props.data), [props.data]);

  let inputs = [];

  function handleChange(e) {
    setValues({...values, [e.target.name]: Number(e.target.value)});
    if (e.target.checkValidity())
      props.setter({...props.data, [e.target.name]: Number(e.target.value)});
  }

  for (const field in props.data) {
    if (props.schema[field] === 'ignore')
      continue;

    inputs.push(
      <label key={field}>
        {props.schema[field].label || field}: <input type="number" name={field} value={values[field]} min={props.schema[field].min} max={props.schema[field].max} step={props.schema[field].step} disabled={props.schema[field].disabled} onChange={handleChange} />
      </label>
    );
  }

  return <form>{inputs}</form>;
}
export function ManagedRnd(props) {
  const { style={border: '1px solid'} } = props;

  function handleDrag(e, {x, y}) {
    props.handleDrag({x, y});
  }

  function handleResize(e, direction, ref, delta, {x, y}) {
    let { width: cssWidth, height: cssHeight } = ref.style;

    props.handleResize({
      x: x,
      y: y,
      w: Number(cssWidth.slice(0, -1)) / 100,
      h: Number(cssHeight.slice(0, -1)) / 100
    });
  }

  // convert size to CSS
  const {size} = props;

  const cssSize = {
    width: `${size.w * 100}%`,
    height: `${size.h * 100}%`
  };

  return (
    <Rnd
      onDrag={handleDrag}
      onDragStop={props.onDragStop}
      onResize={handleResize}
      onResizeStop={props.onResizeStop}
      bounds={props.bounds}
      default={{
        x: 0,
        y: 0,
        width: '50%',
        height: '50%'
      }}
      size={cssSize}
      position={props.position}
      style={style}
    >
      {props.children}
    </Rnd>
  );
}

export function VariableDisplay(props) {
  let contents = '';

  for (const prop in props) {
    contents += `${prop}: ${props[prop]} `;
  }

  return <div>{contents}</div>;
}

// vim: ts=2:sw=2:et
