import '@babylonjs/loaders/glTF';
import { AbstractMesh } from '@babylonjs/core/Meshes';
import {
  DirectionalLight,
  Engine,
  FreeCamera,
  HemisphericLight,
  Scene,
  SceneLoader,
  ShadowGenerator,
  Vector3,
} from '@babylonjs/core';
import { useLayoutEffect, useRef } from 'react';
import farm from '../assets/farm.gltf?url';
import peasant from '../assets/peasant.gltf?url';
import sound from '../assets/live-to-ser.ogg?url';

const createScene = (canvas: any) => {
  const engine = new Engine(canvas);
  const scene = new Scene(engine);

  const camera = new FreeCamera('camera1', new Vector3(11, 40, 40), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);

  SceneLoader.Append(farm);
  SceneLoader.Append(peasant, '', scene);

  const light = new DirectionalLight('dir01', new Vector3(0, -1, 1), scene);
  light.position = new Vector3(0, 50, -100);

  //const shadowGenerator = new ShadowGenerator(1024, light);

  new HemisphericLight('light', Vector3.Up(), scene);

  return scene;
};

export const SceneComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  let leftPressed = false;
  let rightPressed = false;
  let upPressed = false;
  let downPressed = false;

  const keyDownHandler = (e) => {
    e.preventDefault();
    if (e.key == 'Right' || e.key == 'ArrowRight' || e.key == 'd') {
      rightPressed = true;
    }
    if (e.key == 'Left' || e.key == 'ArrowLeft' || e.key == 'a') {
      leftPressed = true;
    }
    if (e.key == 'Up' || e.key == 'ArrowUp' || e.key == 'w') {
      upPressed = true;
    }
    if (e.key == 'Down' || e.key == 'ArrowDown' || e.key == 's') {
      downPressed = true;
    }
  };
  const keyUpHandler = (e) => {
    e.preventDefault();
    if (e.key == 'Right' || e.key == 'ArrowRight' || e.key == 'd') {
      console.log('rightup');
      rightPressed = false;
    }
    if (e.key == 'Left' || e.key == 'ArrowLeft' || e.key == 'a') {
      leftPressed = false;
    }
    if (e.key == 'Up' || e.key == 'ArrowUp' || e.key == 'w') {
      upPressed = false;
    }
    if (e.key == 'Down' || e.key == 'ArrowDown' || e.key == 's') {
      downPressed = false;
    }
  };

  document.addEventListener('keydown', keyDownHandler, false);
  document.addEventListener('keyup', keyUpHandler, false);

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

    canvas.width = 1600;
    canvas.height = 1200;

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
      document.removeEventListener('keydown', keyDownHandler, false);
      document.removeEventListener('keyup', keyUpHandler, false);
    };
  }, [canvasRef]);

  return (
    <div
      style={{
        display: 'flex',
        margin: '20px 0 20px 0',
        border: '3px solid #1d257a',
        width: '1620px',
        height: '1220px',
      }}
    >
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};
