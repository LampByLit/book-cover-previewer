import { Environment, Float, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useRef, useImperativeHandle, forwardRef } from "react";
import { Book } from "./Book";

export const Experience = forwardRef((props, ref) => {
  const { camera } = useThree();
  const controlsRef = useRef();

  // Reset camera to initial centered position
  const resetCamera = () => {
    if (controlsRef.current) {
      // Reset controls
      controlsRef.current.reset();

      // Also reset camera position to initial values
      camera.position.set(-0.5, 1, window.innerWidth > 800 ? 4 : 6);
      camera.lookAt(0, 0, 0);
      controlsRef.current.update();
    }
  };

  useImperativeHandle(ref, () => ({
    resetCamera
  }));

  return (
    <>
      <Float
        rotation-x={-Math.PI / 4}
        rotation-y={Math.PI}
        floatIntensity={0.5}
        speed={1.5}
        rotationIntensity={0.5}
      >
        <Book />
      </Float>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={1}
        maxDistance={25}
      />
      
      {/* Minimal Studio Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <directionalLight
        position={[-5, 3, -5]}
        intensity={0.5}
      />
      
      {/* Simple gray environment */}
      <Environment preset="city" />
      
      {/* Floor plane for shadows */}
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
    </>
  );
});
