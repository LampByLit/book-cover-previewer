import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef, useEffect } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { initializeDataSystem } from "./utils/dataInit";

function App() {
  const experienceRef = useRef();

  useEffect(() => {
    initializeDataSystem();
  }, []);

  return (
    <>
      <UI experienceRef={experienceRef} />
      <Loader />
      <Canvas shadows camera={{
          position: [-0.5, 1, window.innerWidth > 800 ? 4 : 6],
          fov: window.innerWidth > 800 ? 45 : 60,
        }}>
        <group position-y={0}>
          <Suspense fallback={null}>
            <Experience ref={experienceRef} />
          </Suspense>
        </group>
      </Canvas>
    </>
  );
}

export default App;
