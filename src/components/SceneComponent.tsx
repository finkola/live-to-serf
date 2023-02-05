import '@babylonjs/loaders/glTF';
import {
  Engine,
  FreeCamera,
  HemisphericLight,
  Scene,
  SceneLoader,
  Vector3,
} from '@babylonjs/core';
import { useLayoutEffect, useRef } from 'react';
import peasant from '../assets/peasant.gltf?url';

const createScene = (canvas: any) => {
  const engine = new Engine(canvas);
  const scene = new Scene(engine);

  const camera = new FreeCamera('camera1', new Vector3(0, 2, 5), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);

  new HemisphericLight('light', Vector3.Up(), scene);

  SceneLoader.Append(peasant, '', scene);

  return scene;
};

export const SceneComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    let timerId: number;
    //Frame-rate to draw sprites at
    const renderFps = 120;
    let renderStart = 0;
    const renderFrameDuration = 1000 / renderFps;
    //Frame-rate for physics, and collision calculations
    const simFps = 60;
    let previous = 0;
    const simFrameDuration = 1000 / simFps;
    let lag = 0;

    const canvas = canvasRef.current;
    const scene = createScene(canvas);

    canvas.width = 800;
    canvas.height = 600;

    //Game Loop
    timerId = requestAnimationFrame(draw);

    function draw(timestamp: number) {
      timerId = requestAnimationFrame(draw);

      if (!timestamp) {
        timestamp = 0;
      }
      let elapsed = timestamp - previous;
      if (elapsed > 1000) {
        elapsed = simFrameDuration;
      }
      lag += elapsed;

      //Logic
      while (lag >= simFrameDuration) {
        lag -= simFrameDuration;
      }
      //Rendering
      const lagOffset = lag / simFrameDuration;
      if (timestamp >= renderStart) {
        scene.render();
        renderStart = timestamp + renderFrameDuration;
      }
      previous = timestamp;
    }
    //Cleanup function triggers when useLayoutEffect is called again.
    return () => {
      cancelAnimationFrame(timerId);
      //document.removeEventListener('keydown', keyDownHandler, false);
      //document.removeEventListener('keyup', keyUpHandler, false);
    };
  }, [canvasRef]);

  return (
    <div
      style={{
        display: 'flex',
        margin: '20px 0 20px 0',
        border: '3px solid #1d257a',
        width: '820px',
        height: '620px',
      }}
    >
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};
