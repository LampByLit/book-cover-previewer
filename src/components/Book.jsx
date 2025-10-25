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

// Book dimensions based on actual trim size: 8" (height) × 5" (width) × 0.842" (spine depth)
// The book opens along the 8" edge - spine runs along the 8" dimension
// Scaling down to fit in scene (1 unit = 1 inch scaled to 0.2)
const BOOK_HEIGHT = 1.6; // 8" * 0.2 (vertical dimension - spine runs along this)
const BOOK_WIDTH = 1.0; // 5" * 0.2 (horizontal width of each cover)
const SPINE_DEPTH = 0.168; // 0.842" * 0.2 (thickness of the spine)
const COVER_THICKNESS = 0.008; // Thin cover material

// Cover image has front (5") + spine (0.842") + back (5") = 10.842" total width
// But the HEIGHT of the cover image is 8.25" (matches the 8" book height)
const COVER_TOTAL_WIDTH = 2.168; // 10.842" * 0.2
const COVER_IMAGE_HEIGHT = 1.65; // 8.25" * 0.2

const easingFactor = 0.12; // Smoother, more responsive
const scaleEasing = 0.08; // For subtle scaling effect

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

  // Clone textures for each surface with proper UV mapping
  const frontTexture = coverTexture.clone();
  const spineTexture = coverTexture.clone();
  const backTexture = coverTexture.clone();

  // Calculate UV mapping for wraparound texture
  // Cover image: 10.842" total (5" front + 0.842" spine + 5" back)
  const frontUVWidth = 5 / 10.842; // ~0.461
  const spineUVWidth = 0.842 / 10.842; // ~0.078
  const backUVWidth = 5 / 10.842; // ~0.461

  // Set texture repeats and offsets
  frontTexture.repeat.set(frontUVWidth, 1);
  frontTexture.offset.set(0, 0);
  frontTexture.needsUpdate = true;

  spineTexture.repeat.set(spineUVWidth, 1);
  spineTexture.offset.set(frontUVWidth, 0);
  spineTexture.needsUpdate = true;

  backTexture.repeat.set(backUVWidth, 1);
  backTexture.offset.set(frontUVWidth + spineUVWidth, 0);
  backTexture.needsUpdate = true;

  // Animate book opening/closing with enhanced organic movement
  // Spine runs along Y axis (vertical), covers rotate around Y axis
  useFrame((_, delta) => {
    const targetAngle = bookOpen ? degToRad(120) : 0;
    
    // Smooth rotation for front cover with subtle stagger
    if (frontCoverRef.current) {
      // Main rotation
      easing.dampAngle(
        frontCoverRef.current.rotation,
        "y",
        bookOpen ? targetAngle / 2 : 0,
        easingFactor,
        delta
      );
      
      // Subtle scale effect for depth
      const targetScale = bookOpen ? 1.02 : 1;
      easing.damp(
        frontCoverRef.current.scale,
        "x",
        targetScale,
        scaleEasing,
        delta
      );
      
      // Slight arc/lift effect (position shift for depth)
      easing.damp(
        frontCoverRef.current.position,
        "x",
        bookOpen ? -0.03 : 0,
        easingFactor,
        delta
      );
      
      // Subtle page curl on X axis
      easing.dampAngle(
        frontCoverRef.current.rotation,
        "x",
        bookOpen ? degToRad(-2) : 0,
        easingFactor * 0.7,
        delta
      );
    }
    
    // Smooth rotation for back cover with subtle stagger (slightly delayed feel)
    if (backCoverRef.current) {
      // Main rotation
      easing.dampAngle(
        backCoverRef.current.rotation,
        "y",
        bookOpen ? -targetAngle / 2 : 0,
        easingFactor * 0.95, // Slightly slower for stagger effect
        delta
      );
      
      // Subtle scale effect for depth
      const targetScale = bookOpen ? 1.02 : 1;
      easing.damp(
        backCoverRef.current.scale,
        "x",
        targetScale,
        scaleEasing,
        delta
      );
      
      // Slight arc/lift effect (position shift for depth)
      easing.damp(
        backCoverRef.current.position,
        "x",
        bookOpen ? -0.03 : 0,
        easingFactor * 0.95,
        delta
      );

      // Subtle page curl on X axis
      easing.dampAngle(
        backCoverRef.current.rotation,
        "x",
        bookOpen ? degToRad(2) : 0,
        easingFactor * 0.7,
        delta
      );
    }
  });

  return (
    <group {...props}>
      {/* Spine - runs along the Y axis (8" / 1.6 units tall) at the binding edge */}
      <mesh ref={spineRef} castShadow receiveShadow position-x={0}>
        <boxGeometry args={[COVER_THICKNESS, BOOK_HEIGHT, SPINE_DEPTH]} />
        <meshStandardMaterial map={spineTexture} />
      </mesh>

      {/* Front Cover - pivot at spine (x=0), extends in -X direction, positioned at +Z */}
      <group ref={frontCoverRef} position={[0, 0, SPINE_DEPTH / 2]}>
        <mesh castShadow receiveShadow position-x={-BOOK_WIDTH / 2}>
          <boxGeometry args={[BOOK_WIDTH, BOOK_HEIGHT, COVER_THICKNESS]} />
          <meshStandardMaterial map={frontTexture} />
        </mesh>
        
        {/* Front pages attached to front cover - INSIDE the book */}
        <mesh position={[-BOOK_WIDTH / 2, 0, -(SPINE_DEPTH / 4 + COVER_THICKNESS / 2)]}>
          <boxGeometry args={[BOOK_WIDTH * 0.98, BOOK_HEIGHT * 0.98, SPINE_DEPTH / 2 - COVER_THICKNESS]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
      </group>

      {/* Back Cover - pivot at spine (x=0), extends in -X direction, positioned at -Z */}
      <group ref={backCoverRef} position={[0, 0, -SPINE_DEPTH / 2]}>
        <mesh castShadow receiveShadow position-x={-BOOK_WIDTH / 2}>
          <boxGeometry args={[BOOK_WIDTH, BOOK_HEIGHT, COVER_THICKNESS]} />
          <meshStandardMaterial map={backTexture} />
        </mesh>
        
        {/* Back pages attached to back cover - INSIDE the book */}
        <mesh position={[-BOOK_WIDTH / 2, 0, (SPINE_DEPTH / 4 + COVER_THICKNESS / 2)]}>
          <boxGeometry args={[BOOK_WIDTH * 0.98, BOOK_HEIGHT * 0.98, SPINE_DEPTH / 2 - COVER_THICKNESS]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
      </group>
    </group>
  );
};
