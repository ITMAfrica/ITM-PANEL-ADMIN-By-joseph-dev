import { Color, type Mesh, type MeshStandardMaterial, type Object3D } from 'three';

/** Tint warm/bright materials with the pilot accent color. */
export function tintRobot(root: Object3D, accentHex: string) {
  const accent = new Color(accentHex);
  root.traverse((child) => {
    const mesh = child as Mesh;
    if (!mesh.isMesh || !mesh.material) return;

    const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const tinted = source.map((mat) => {
      const std = mat as MeshStandardMaterial;
      if (!std?.color) return mat;
      const next = std.clone();
      const { r, g, b } = next.color;
      const isWarmAccent = r > 0.45 && g > 0.2 && b < 0.5;
      const isBrightPlastic = r > 0.7 && g > 0.7 && b > 0.65;
      if (isWarmAccent) {
        next.color.copy(accent);
        if (next.emissive) {
          next.emissive.copy(accent);
          next.emissiveIntensity = 0.35;
        }
      } else if (isBrightPlastic) {
        next.color.lerp(accent, 0.15);
      }
      next.needsUpdate = true;
      return next;
    });

    mesh.material = Array.isArray(mesh.material) ? tinted : tinted[0];
  });
}
