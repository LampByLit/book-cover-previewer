import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { easing } from "maath";
import { useRef } from "react";
import {
  MeshStandardMaterial,
  SRGBColorSpace,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { coverAtom, bookOpenAtom, covers } from "./UI";

// Book dimensions based on actual trim size: 8" × 5" × 0.842"
// Scaling down to fit in scene (1 unit = 1 inch scaled to 0.2)
const BOOK_WIDTH = 1.6; // 8" * 0.2
const BOOK_HEIGHT = 1.0; // 5" * 0.2
const SPINE_DEPTH = 0.168; // 0.842" * 0.2
const COVER_THICKNESS = 0.008; // Thin cover material

// Cover image has front (5") + spine (0.842") + back (5") = 10.842" total width
const COVER_TOTAL_WIDTH = 2.168; // 10.842" * 0.2
const COVER_HEIGHT = 1.65; // 8.25" * 0.2 (slightly taller than book for wraparound)

const easingFactor = 0.08;

// Preload all cover textures
covers.forEach((cover) => {
  useTexture.preload(`/covers/${cover}`);
});

export const Book = ({ ...props }) => {
  const [selectedCover] = useAtom(coverAtom);
  const [bookOpen] = useAtom(bookOpenAtom);
  
  const frontCoverRef = useRef();
  const backCoverRef = useRef();
  const spineRef = useRef();

  // Load the selected cover texture
  const coverTexture = useTexture(`/covers/${covers[selectedCover]}`);
  coverTexture.colorSpace = SRGBColorSpace;

  // Animate book opening/closing
  useFrame((_, delta) => {
    const targetAngle = bookOpen ? degToRad(120) : 0;
    
    // Smooth rotation for front and back covers
    if (frontCoverRef.current) {
      easing.dampAngle(
        frontCoverRef.current.rotation,
        "y",
        bookOpen ? targetAngle / 2 : 0,
        easingFactor,
        delta
      );
    }
    
    if (backCoverRef.current) {
      easing.dampAngle(
        backCoverRef.current.rotation,
        "y",
        bookOpen ? -targetAngle / 2 : 0,
        easingFactor,
        delta
      );
    }
  });

  // Calculate UV mapping for wraparound texture
  // Cover image: 10.842" total (5" front + 0.842" spine + 5" back)
  // UV mapping splits: front (0 to ~0.461), spine (~0.461 to ~0.539), back (~0.539 to 1)
  const frontUVStart = 0;
  const frontUVEnd = 5 / 10.842; // ~0.461
  const spineUVStart = frontUVEnd;
  const spineUVEnd = (5 + 0.842) / 10.842; // ~0.539
  const backUVStart = spineUVEnd;
  const backUVEnd = 1;

  return (
    <group {...props}>
      {/* Front Cover */}
      <group ref={frontCoverRef} position-x={SPINE_DEPTH / 2}>
        <mesh castShadow receiveShadow position-z={BOOK_WIDTH / 2}>
          <boxGeometry args={[COVER_THICKNESS, BOOK_HEIGHT, BOOK_WIDTH]} />
          <meshStandardMaterial 
            map={coverTexture}
            map-repeat={[frontUVEnd - frontUVStart, 1]}
            map-offset={[frontUVStart, 0]}
          />
        </mesh>
      </group>

      {/* Back Cover */}
      <group ref={backCoverRef} position-x={-SPINE_DEPTH / 2}>
        <mesh castShadow receiveShadow position-z={BOOK_WIDTH / 2}>
          <boxGeometry args={[COVER_THICKNESS, BOOK_HEIGHT, BOOK_WIDTH]} />
          <meshStandardMaterial 
            map={coverTexture}
            map-repeat={[backUVEnd - backUVStart, 1]}
            map-offset={[backUVStart, 0]}
          />
        </mesh>
      </group>

      {/* Spine */}
      <mesh ref={spineRef} castShadow receiveShadow position-z={BOOK_WIDTH / 2}>
        <boxGeometry args={[SPINE_DEPTH, BOOK_HEIGHT, COVER_THICKNESS]} />
        <meshStandardMaterial 
          map={coverTexture}
          map-repeat={[spineUVEnd - spineUVStart, 1]}
          map-offset={[spineUVStart, 0]}
        />
      </mesh>

      {/* Pages (visible when book is open) */}
      {bookOpen && (
        <>
          {/* Left pages */}
          <group ref={frontCoverRef}>
            <mesh position={[COVER_THICKNESS, 0, BOOK_WIDTH / 2]}>
              <boxGeometry args={[SPINE_DEPTH / 2 - COVER_THICKNESS, BOOK_HEIGHT * 0.98, BOOK_WIDTH * 0.98]} />
              <meshStandardMaterial color="#f5f5f5" />
            </mesh>
          </group>
          
          {/* Right pages */}
          <group ref={backCoverRef}>
            <mesh position={[-COVER_THICKNESS, 0, BOOK_WIDTH / 2]}>
              <boxGeometry args={[SPINE_DEPTH / 2 - COVER_THICKNESS, BOOK_HEIGHT * 0.98, BOOK_WIDTH * 0.98]} />
              <meshStandardMaterial color="#f5f5f5" />
            </mesh>
          </group>
        </>
      )}
    </group>
  );
};
