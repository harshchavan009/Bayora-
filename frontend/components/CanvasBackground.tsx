"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface CanvasBackgroundProps {
  mode?: "full" | "reduced" | "off";
  dimmed?: boolean;
  videoSrc?: string;
  posterSrc?: string;
}

export default function CanvasBackground({
  mode = "full",
  dimmed = false,
  videoSrc,
  posterSrc,
}: CanvasBackgroundProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // 1. Accessibility & Performance auto-detection
    if (typeof window === "undefined") return;

    if (mode === "off") {
      setUseFallback(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isSaveData =
      (navigator as unknown as { connection?: { saveData?: boolean } }).connection
        ?.saveData === true;
    const isLowConcurrency =
      typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency <= 4;
    const isLowMemory =
      typeof (navigator as unknown as { deviceMemory?: number }).deviceMemory === "number" &&
      (navigator as unknown as { deviceMemory: number }).deviceMemory <= 4;
    const isSmallScreen = window.innerWidth < 768;

    // Check WebGL availability
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    const hasWebGL = Boolean(gl);

    if (
      prefersReducedMotion ||
      isSaveData ||
      isLowConcurrency ||
      isLowMemory ||
      isSmallScreen ||
      !hasWebGL
    ) {
      setUseFallback(true);
      return;
    }

    setUseFallback(false);

    // If videoSrc is provided, we can use HTML5 video fallback loop
    if (videoSrc) {
      return;
    }

    // 2. Initialize Three.js WebGL procedural scene
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isPaused = false;
    let lastRenderTime = performance.now();
    const targetFps = 30;
    const fpsInterval = 1000 / targetFps;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0c0f, 0.045);

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 13);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0b0c0f, 0);

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Group for mouse parallax
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 3. Central Gateway Node
    const gatewayGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const gatewayMat = new THREE.MeshBasicMaterial({
      color: 0x6e7bf2,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const gateway = new THREE.Mesh(gatewayGeo, gatewayMat);
    worldGroup.add(gateway);

    // Core glow inside gateway
    const coreGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x6e7bf2,
      transparent: true,
      opacity: 0.7,
    });
    const gatewayCore = new THREE.Mesh(coreGeo, coreMat);
    gateway.add(gatewayCore);

    // 4. Three Isolated Cells: Red (Adversarial), Blue (Defensive), Model (Target)
    const cellRadius = 4.2;
    const cellConfigs = [
      { name: "red", angle: (Math.PI * 2 * 0) / 3 - Math.PI / 6, color: 0xd9667a, innerColor: 0xe5534b },
      { name: "blue", angle: (Math.PI * 2 * 1) / 3 - Math.PI / 6, color: 0x5b8def, innerColor: 0x4c9aff },
      { name: "model", angle: (Math.PI * 2 * 2) / 3 - Math.PI / 6, color: 0xa5b4cb, innerColor: 0x6e7bf2 },
    ];

    const cellMeshes: THREE.Group[] = [];
    const pulsePositions: { line: THREE.Line; progress: number }[] = [];

    cellConfigs.forEach((cfg) => {
      const cellGroup = new THREE.Group();
      const x = Math.cos(cfg.angle) * cellRadius;
      const y = Math.sin(cfg.angle) * (cellRadius * 0.75);
      const z = (Math.sin(cfg.angle * 2) * 0.8);
      cellGroup.position.set(x, y, z);

      // Outer geodesic boundary
      const outerGeo = new THREE.IcosahedronGeometry(0.85, 1);
      const outerMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
      });
      const outer = new THREE.Mesh(outerGeo, outerMat);
      cellGroup.add(outer);

      // Inner cell nucleus
      const nucGeo = new THREE.SphereGeometry(0.28, 16, 16);
      const nucMat = new THREE.MeshBasicMaterial({
        color: cfg.innerColor,
        transparent: true,
        opacity: 0.65,
      });
      const nuc = new THREE.Mesh(nucGeo, nucMat);
      cellGroup.add(nuc);

      worldGroup.add(cellGroup);
      cellMeshes.push(cellGroup);

      // Isolated connecting line from Gateway (0,0,0) to Cell (x,y,z)
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x3d4554,
        transparent: true,
        opacity: 0.25,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      worldGroup.add(line);

      // Pulse along line
      pulsePositions.push({ line, progress: Math.random() });
    });

    // 5. Traveling Pulse Packets (one gentle pulse every ~8s)
    const pulseGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    });
    const pulsePackets: THREE.Mesh[] = [];
    cellConfigs.forEach((_, idx) => {
      const pMesh = new THREE.Mesh(pulseGeo, pulseMat);
      worldGroup.add(pMesh);
      pulsePackets.push(pMesh);
    });

    // 6. Ambient Particle Dust (180 faint particles)
    const dustCount = mode === "reduced" ? 60 : 180;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 22;
      dustPositions[i + 1] = (Math.random() - 0.5) * 16;
      dustPositions[i + 2] = (Math.random() - 0.5) * 12;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x6e7bf2,
      size: 0.04,
      transparent: true,
      opacity: 0.35,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    worldGroup.add(dust);

    // 7. Mouse Parallax (subtle: max 2-3 degrees)
    let targetRotationX = 0;
    let targetRotationY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetRotationY = normX * 0.04; // ~2.3 degrees
      targetRotationX = -normY * 0.03; // ~1.7 degrees
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 8. Visibility handling & Window resize
    const handleVisibility = () => {
      isPaused = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleResize = () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // 9. Animation Loop (Capped at 30 FPS target)
    let clockTime = 0;
    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      if (isPaused) return;

      const elapsed = currentTime - lastRenderTime;
      if (elapsed < fpsInterval) return;

      lastRenderTime = currentTime - (elapsed % fpsInterval);
      clockTime += 0.016;

      // Slow drift
      gateway.rotation.y += 0.002;
      gateway.rotation.x += 0.001;

      cellMeshes.forEach((mesh, idx) => {
        mesh.rotation.y -= 0.0025 * (idx + 1);
        mesh.rotation.z += 0.0015;
      });

      // Dust drift
      dust.rotation.y += 0.0004;

      // Parallax smooth interpolation
      worldGroup.rotation.x += (targetRotationX - worldGroup.rotation.x) * 0.05;
      worldGroup.rotation.y += (targetRotationY - worldGroup.rotation.y) * 0.05;

      // Pulse traveling along lines (8s period)
      pulsePackets.forEach((pMesh, idx) => {
        const speed = mode === "reduced" ? 0.04 : 0.08; // ~8-12s
        const t = ((clockTime * speed + idx * 0.33) % 1);
        const cellPos = cellMeshes[idx].position;
        // Travel from Gateway (0,0,0) to cellPos
        pMesh.position.set(cellPos.x * t, cellPos.y * t, cellPos.z * t);
        // Fade in/out at extremities
        const opacity = Math.sin(t * Math.PI) * 0.75;
        (pMesh.material as THREE.MeshBasicMaterial).opacity = opacity;
      });

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      gatewayGeo.dispose();
      gatewayMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
    };
  }, [mode, videoSrc]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Fallback Static Gradient & Poster */}
      {useFallback ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: posterSrc ? `url(${posterSrc})` : undefined,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(110, 123, 242, 0.08), transparent 70%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(217, 102, 122, 0.04), transparent 60%), #0B0C0F",
          }}
        />
      ) : videoSrc ? (
        <video
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            dimmed ? "opacity-35" : "opacity-75"
          }`}
          src={videoSrc}
          poster={posterSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <div
          ref={mountRef}
          className={`absolute inset-0 transition-opacity duration-500 ${
            dimmed ? "opacity-35" : "opacity-85"
          }`}
        />
      )}

      {/* Scrim Overlay: Guarantees WCAG AA readability for all panel text */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          dimmed
            ? "bg-[#0B0C0F]/90"
            : "bg-gradient-to-b from-[#0B0C0F]/75 via-[#0B0C0F]/85 to-[#0B0C0F]/94"
        }`}
      />
    </div>
  );
}
