import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { easing } from "maath";
import { useRef, useMemo } from "react";
import {
  MeshStandardMaterial,
  SRGBColorSpace,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { coverAtom, bookOpenAtom } from "./UI";
import { getCoverById } from "../utils/coverData";
import { useCoverImageUrl } from "../utils/useCoverImageUrl";
import { inchesToUnits } from "../utils/trimSizes";

// Default fallback dimensions (5" × 8" book)
const DEFAULT_TRIM_SIZE = { width: 5.0, height: 8.0 };
const COVER_THICKNESS = 0.008; // Thin cover material
const easingFactor = 0.08;

export const Book = ({ ...props }) => {
  const [selectedCover] = useAtom(coverAtom);
  const [bookOpen] = useAtom(bookOpenAtom);

  // Get current cover data and calculate dynamic dimensions
  const coverData = useMemo(() => {
    return getCoverById(selectedCover);
  }, [selectedCover]);

  // Calculate dynamic dimensions based on trim size
  const dimensions = useMemo(() => {
    const trimSize = coverData?.trimSize || DEFAULT_TRIM_SIZE;

    // Convert inches to 3D units (0.2 units per inch)
    const bookWidth = inchesToUnits(trimSize.width);
    const bookHeight = inchesToUnits(trimSize.height);

    // For now, use a default spine depth - this will be calculated from image later
    // In a real implementation, we'd analyze the uploaded image dimensions
    const spineDepth = inchesToUnits(0.842); // Default spine depth

    // Image dimensions (these would be calculated from the actual uploaded image)
    // For now, assume a standard layout: front + spine + back
    const imageWidth = trimSize.width * 3; // Rough estimate: front + spine + back
    const imageHeight = trimSize.height * 1.03; // Slight bleed

    return {
      bookWidth,
      bookHeight,
      spineDepth,
      imageWidth,
      imageHeight,
      trimSize
    };
  }, [coverData]);

  const { bookWidth, bookHeight, spineDepth, imageWidth, imageHeight } = dimensions;
  
  const frontCoverRef = useRef();
  const backCoverRef = useRef();
  const spineRef = useRef();

  // Resolve image URL (uploaded data URL via IndexedDB or bundled asset)
  const imageUrl = useCoverImageUrl(selectedCover);

  // Load the selected cover texture
  const TRANSPARENT_PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  const coverTexture = useTexture(imageUrl || '/images/wawasensei-white.png');
  coverTexture.colorSpace = SRGBColorSpace;

  // Calculate proper spine width from image dimensions
  // Expected format: front cover + spine + back cover
  const actualImageWidth = coverTexture.image?.width || imageWidth;
  const actualImageHeight = coverTexture.image?.height || imageHeight;

  // Use metadata-driven spine width (inches) and dpi when available
  const dpi = coverData?.dpi || 300;
  const spineWidthInches = typeof coverData?.spineWidthInches === 'number' ? coverData.spineWidthInches : 0.842;
  const spineWidthPx = Math.max(0, spineWidthInches * dpi);
  const actualSpineDepth = inchesToUnits(spineWidthInches);

  // Clone textures for each surface with proper UV mapping
  const frontTexture = coverTexture.clone();
  const spineTexture = coverTexture.clone();
  const backTexture = coverTexture.clone();

  // UV mapping using pixel fractions without bleed compensation
  // Compute front/back widths in pixels: remaining area split evenly
  const frontWidthPx = Math.max(1, (actualImageWidth - spineWidthPx) / 2);
  const backWidthPx = frontWidthPx;

  // Front (left section) maps exactly to its region
  frontTexture.repeat.set(frontWidthPx / actualImageWidth, 1);
  frontTexture.offset.set(0, 0);
  frontTexture.needsUpdate = true;

  // Spine (middle section)
  const spineUVWidth = Math.max(0, spineWidthPx / actualImageWidth);
  spineTexture.repeat.set(spineUVWidth, 1);
  spineTexture.offset.set(frontWidthPx / actualImageWidth, 0);
  spineTexture.needsUpdate = true;

  // Back (right section)
  const backStartUV = (frontWidthPx + spineWidthPx) / actualImageWidth;
  const backUVWidth = Math.max(0, backWidthPx / actualImageWidth);
  backTexture.repeat.set(backUVWidth, 1);
  backTexture.offset.set(backStartUV, 0);
  backTexture.needsUpdate = true;

  // Animate book opening/closing
  // Spine runs along Y axis (vertical), covers rotate around Y axis
  useFrame((_, delta) => {
    const targetAngle = bookOpen ? degToRad(120) : 0;
    
    // Smooth rotation for front and back covers around Y axis (spine hinge)
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

  return (
    <group {...props}>
      {/* Spine - runs along the Y axis at the binding edge */}
      <mesh ref={spineRef} castShadow receiveShadow position-x={0}>
        <boxGeometry args={[COVER_THICKNESS, bookHeight, actualSpineDepth]} />
        {/* Material array: [+X, -X, +Y, -Y, +Z (front-facing), -Z (back-facing)] */}
        <meshStandardMaterial
          attach="material-0"
          map={spineTexture}
        />
        <meshStandardMaterial
          attach="material-1"
          map={spineTexture}
        />
        <meshStandardMaterial
          attach="material-2"
          map={spineTexture}
        />
        <meshStandardMaterial
          attach="material-3"
          map={spineTexture}
        />
        <meshStandardMaterial
          attach="material-4"
          color="#000000"
        />
        <meshStandardMaterial
          attach="material-5"
          color="#000000"
        />
      </mesh>

      {/* Front Cover - pivot at spine (x=0), extends in -X direction, positioned at +Z */}
      <group ref={frontCoverRef} position={[0, 0, actualSpineDepth / 2]}>
        <mesh castShadow receiveShadow position-x={-bookWidth / 2}>
          <boxGeometry args={[bookWidth, bookHeight, COVER_THICKNESS]} />
          <meshStandardMaterial map={frontTexture} />
        </mesh>

        {/* Front pages attached to front cover - INSIDE the book */}
        <mesh position={[-bookWidth / 2, 0, -(actualSpineDepth / 4 + COVER_THICKNESS / 2)]}>
          <boxGeometry args={[bookWidth * 0.98, bookHeight * 0.98, actualSpineDepth / 2 - COVER_THICKNESS]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
    </group>

      {/* Back Cover - pivot at spine (x=0), extends in -X direction, positioned at -Z */}
      <group ref={backCoverRef} position={[0, 0, -actualSpineDepth / 2]}>
        <mesh castShadow receiveShadow position-x={-bookWidth / 2}>
          <boxGeometry args={[bookWidth, bookHeight, COVER_THICKNESS]} />
          <meshStandardMaterial map={backTexture} />
        </mesh>

        {/* Back pages attached to back cover - INSIDE the book */}
        <mesh position={[-bookWidth / 2, 0, (actualSpineDepth / 4 + COVER_THICKNESS / 2)]}>
          <boxGeometry args={[bookWidth * 0.98, bookHeight * 0.98, actualSpineDepth / 2 - COVER_THICKNESS]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
      </group>
    </group>
  );
};
