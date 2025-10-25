import { Environment, Float, OrbitControls } from "@react-three/drei";
import { Book } from "./Book";

export const Experience = () => {
  return (
    <>
      <Float
        rotation-x={-Math.PI / 4}
        floatIntensity={0.5}
        speed={1.5}
        rotationIntensity={0.5}
      >
        <Book />
      </Float>
      <OrbitControls 
        enablePan={false}
        minDistance={3}
        maxDistance={10}
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
        <meshStandardMaterial color="#4b5563" />
      </mesh>
    </>
  );
};
