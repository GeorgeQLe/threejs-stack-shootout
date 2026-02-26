export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface OrbitCameraPathOptions {
  radius?: number;
  height?: number;
  speedRadPerSec?: number;
  center?: Vector3;
}

export interface OrbitCameraPose {
  position: Vector3;
  lookAt: Vector3;
}

export function createOrbitCameraPath(options: OrbitCameraPathOptions = {}) {
  const radius = options.radius ?? 6;
  const height = options.height ?? 2.5;
  const speedRadPerSec = options.speedRadPerSec ?? 0.4;
  const center = options.center ?? { x: 0, y: 0, z: 0 };

  return (elapsedMs: number): OrbitCameraPose => {
    const angle = (elapsedMs / 1000) * speedRadPerSec;
    return {
      position: {
        x: center.x + Math.cos(angle) * radius,
        y: center.y + height,
        z: center.z + Math.sin(angle) * radius
      },
      lookAt: center
    };
  };
}
