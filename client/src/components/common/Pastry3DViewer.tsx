import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useLanguage } from '../../context/LanguageContext';

interface Pastry3DViewerProps {
  slug: string;
  fallbackImage?: string;
  className?: string;
}

// Procedural texture generators for ultra-high visual quality without external assets
function createStrawberryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Luscious strawberry ruby gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#EB3349');
  grad.addColorStop(0.35, '#DE2034');
  grad.addColorStop(0.75, '#B71524');
  grad.addColorStop(1, '#820B16');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Staggered golden seed speckles
  ctx.fillStyle = '#FFE68A';
  for (let y = 30; y < 490; y += 26) {
    const offsetX = ((y / 26) % 2) * 16;
    for (let x = 15; x < 512; x += 32) {
      const sx = (x + offsetX + Math.sin(y * 7) * 4) % 512;
      const sy = y + Math.cos(x * 5) * 3;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 2.8, 4.4, Math.PI / 10, 0, Math.PI * 2);
      ctx.fill();

      // Seed shadow indentation
      ctx.strokeStyle = 'rgba(90, 8, 16, 0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createCrustTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Golden baked pastry base
  ctx.fillStyle = '#DE9A50';
  ctx.fillRect(0, 0, 256, 256);

  // Butter flecks & baked caramelization
  ctx.fillStyle = '#BC7A30';
  for (let i = 0; i < 450; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = Math.random() * 2.5 + 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255, 230, 180, 0.4)';
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillRect(x, y, 2, 2);
  }

  return new THREE.CanvasTexture(canvas);
}

// Gingham checkered cloth texture for Jam lid
function createGinghamTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FAF0EB';
  ctx.fillRect(0, 0, 128, 128);

  const cellSize = 16;
  for (let y = 0; y < 128; y += cellSize) {
    for (let x = 0; x < 128; x += cellSize) {
      if ((x / cellSize + y / cellSize) % 2 === 0) {
        ctx.fillStyle = '#D9434E';
        ctx.fillRect(x, y, cellSize, cellSize);
      } else {
        ctx.fillStyle = 'rgba(217, 67, 78, 0.4)';
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// Organic plump strawberry lathe geometry
function createStrawberryGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0, -0.32));
  points.push(new THREE.Vector2(0.08, -0.28));
  points.push(new THREE.Vector2(0.18, -0.18));
  points.push(new THREE.Vector2(0.26, -0.04));
  points.push(new THREE.Vector2(0.30, 0.12));
  points.push(new THREE.Vector2(0.27, 0.23));
  points.push(new THREE.Vector2(0.18, 0.29));
  points.push(new THREE.Vector2(0.07, 0.31));
  points.push(new THREE.Vector2(0, 0.31));
  return new THREE.LatheGeometry(points, 32);
}

export const Pastry3DViewer: React.FC<Pastry3DViewerProps> = ({
  slug,
  fallbackImage,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // References for animation and interaction
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pastryGroupRef = useRef<THREE.Group | null>(null);
  const animFrameId = useRef<number | null>(null);

  const isDragging = useRef(false);
  const previousPointerX = useRef(0);
  const rotationVelocity = useRef(0.005);
  const lastInteractionTime = useRef(Date.now());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 300;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera: High-angle tabletop boutique perspective
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 5.2);
    camera.lookAt(0, 0.45, 0);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting (Warm patisserie ambiance)
    const ambientLight = new THREE.AmbientLight(0xfff6ec, 1.5);
    scene.add(ambientLight);

    // Key Light: warm morning sun
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.3);
    keyLight.position.set(4.5, 7.5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0008;
    scene.add(keyLight);

    // Soft fill light
    const fillLight = new THREE.DirectionalLight(0xfce7f3, 1.0);
    fillLight.position.set(-4.5, 3.5, -2);
    scene.add(fillLight);

    // Warm rim light for glossy edges
    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.9);
    rimLight.position.set(0, 5, -4.5);
    scene.add(rimLight);

    // 5. Shared Pastry Textures
    const strawberryTex = createStrawberryTexture();
    const crustTex = createCrustTexture();
    const ginghamTex = createGinghamTexture();
    const strawberryGeo = createStrawberryGeometry();

    // Leaf calyx material
    const calyxMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d4a,
      roughness: 0.55,
      metalness: 0.05,
    });

    // Strawberry glazed material with seeded texture
    const strawberryMat = new THREE.MeshStandardMaterial({
      map: strawberryTex,
      color: 0xffffff,
      roughness: 0.16,
      metalness: 0.08,
      bumpMap: strawberryTex,
      bumpScale: 0.015,
    });

    // 6. Root Rotating Pastry Group
    const pastryGroup = new THREE.Group();
    pastryGroupRef.current = pastryGroup;
    scene.add(pastryGroup);

    // Contact drop shadow plane on table
    const shadowGeo = new THREE.PlaneGeometry(5.2, 5.2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const sGrad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
    sGrad.addColorStop(0, 'rgba(80, 50, 40, 0.32)');
    sGrad.addColorStop(0.5, 'rgba(80, 50, 40, 0.10)');
    sGrad.addColorStop(1, 'rgba(80, 50, 40, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.16;
    scene.add(shadowMesh);

    // Coaster / Plate Base: Wooden Coaster for drinks & jam; Porcelain plate for cakes & tart!
    const isDrinkOrJam = slug.includes('soda') || slug.includes('jam') || slug.includes('latte');
    
    if (isDrinkOrJam) {
      // Warm artisan wooden coaster (like in clean_k_45 & clean_k_55)
      const coasterGeo = new THREE.CylinderGeometry(1.65, 1.55, 0.14, 48);
      const coasterMat = new THREE.MeshStandardMaterial({
        color: 0xd29959,
        roughness: 0.55,
        metalness: 0.05,
      });
      const coaster = new THREE.Mesh(coasterGeo, coasterMat);
      coaster.position.y = -0.07;
      coaster.receiveShadow = true;
      pastryGroup.add(coaster);
    } else {
      // Glazed white porcelain saucer (like in clean_k_62)
      const plateGeo = new THREE.CylinderGeometry(2.35, 2.05, 0.15, 64);
      const plateMat = new THREE.MeshStandardMaterial({
        color: 0xfefcf9,
        roughness: 0.16,
        metalness: 0.02,
      });
      const plate = new THREE.Mesh(plateGeo, plateMat);
      plate.position.y = -0.075;
      plate.receiveShadow = true;
      pastryGroup.add(plate);

      // Inner Dish Recess
      const innerRimGeo = new THREE.CylinderGeometry(2.0, 1.95, 0.06, 64);
      const innerRimMat = new THREE.MeshStandardMaterial({
        color: 0xfaf4eb,
        roughness: 0.22,
        metalness: 0.01,
      });
      const innerRim = new THREE.Mesh(innerRimGeo, innerRimMat);
      innerRim.position.y = 0.01;
      innerRim.receiveShadow = true;
      pastryGroup.add(innerRim);
    }

    // Helper to spawn a plump, seeded strawberry with leaf star
    const createPlumpStrawberry = (scale = 1, tiltX = 0, tiltZ = 0) => {
      const sGroup = new THREE.Group();
      const berry = new THREE.Mesh(strawberryGeo, strawberryMat);
      berry.castShadow = true;
      berry.receiveShadow = true;
      sGroup.add(berry);

      for (let l = 0; l < 4; l++) {
        const leafAngle = (l / 4) * Math.PI * 2;
        const leafGeo = new THREE.ConeGeometry(0.065, 0.22, 6);
        const leaf = new THREE.Mesh(leafGeo, calyxMat);
        leaf.position.set(Math.cos(leafAngle) * 0.1, 0.31, Math.sin(leafAngle) * 0.1);
        leaf.rotation.x = Math.sin(leafAngle) * 0.7;
        leaf.rotation.z = -Math.cos(leafAngle) * 0.7;
        sGroup.add(leaf);
      }

      const stemGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.12, 8);
      const stem = new THREE.Mesh(stemGeo, calyxMat);
      stem.position.y = 0.36;
      sGroup.add(stem);

      sGroup.scale.set(scale, scale, scale);
      sGroup.rotation.x = tiltX;
      sGroup.rotation.z = tiltZ;
      return sGroup;
    };

    // --- Build Treat by Slug ---
    if (slug === 'berry-soda' || slug === 'soda') {
      // ==========================================
      // BERRY SODA (from clean_k_45.png)
      // ==========================================
      const sodaGroup = new THREE.Group();

      // Clear Glass Cup
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.9,
        opacity: 1,
        transparent: true,
        roughness: 0.05,
        ior: 1.48,
      });
      const glassCup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.95, 0.75, 1.9, 32, 1, true),
        glassMat
      );
      glassCup.position.y = 0.95;
      sodaGroup.add(glassCup);

      // Sparkling Red Soda Liquid
      const sodaLiquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.72, 1.7, 32),
        new THREE.MeshStandardMaterial({
          color: 0xdf384b,
          roughness: 0.2,
          transparent: true,
          opacity: 0.92,
        })
      );
      sodaLiquid.position.y = 0.85;
      sodaGroup.add(sodaLiquid);

      // Cloud of Whipped Cream on top
      const cream = new THREE.Mesh(
        new THREE.SphereGeometry(0.85, 24, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 })
      );
      cream.position.y = 1.82;
      cream.scale.set(1.05, 0.42, 1.05);
      sodaGroup.add(cream);

      // Crown Strawberry on top
      const topBerry = createPlumpStrawberry(0.92, 0.1, 0.1);
      topBerry.position.set(-0.1, 2.12, 0);
      sodaGroup.add(topBerry);

      // Striped Green Paper Straw
      const straw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 2.4, 16),
        new THREE.MeshStandardMaterial({ color: 0x4a8b66, roughness: 0.3 })
      );
      straw.position.set(0.35, 1.7, -0.2);
      straw.rotation.z = -0.22;
      sodaGroup.add(straw);

      pastryGroup.add(sodaGroup);

    } else if (slug === 'homemade-jam' || slug === 'jam') {
      // ==========================================
      // HOMEMADE STRAWBERRY JAM JAR (from clean_k_55.png)
      // ==========================================
      const jamGroup = new THREE.Group();

      // Glass Jar Body
      const jar = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 0.98, 1.45, 32),
        new THREE.MeshStandardMaterial({
          color: 0xbb1426, // rich cooked strawberry jam
          roughness: 0.25,
        })
      );
      jar.position.y = 0.72;
      jamGroup.add(jar);

      // Gingham Checkered Fabric Cover
      const clothCover = new THREE.Mesh(
        new THREE.CylinderGeometry(1.22, 1.35, 0.5, 32),
        new THREE.MeshStandardMaterial({
          map: ginghamTex,
          roughness: 0.7,
        })
      );
      clothCover.position.y = 1.48;
      jamGroup.add(clothCover);

      // Cream Belly Label Ribbon
      const label = new THREE.Mesh(
        new THREE.CylinderGeometry(1.07, 1.07, 0.45, 32, 1, true),
        new THREE.MeshStandardMaterial({
          color: 0xfdf6ea,
          roughness: 0.5,
        })
      );
      label.position.y = 0.72;
      jamGroup.add(label);

      // Heart emblem on label
      const heart = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xdf2d3e })
      );
      heart.position.set(0, 0.72, 1.08);
      heart.scale.set(1.2, 0.8, 0.4);
      jamGroup.add(heart);

      pastryGroup.add(jamGroup);

    } else if (slug === 'strawberry-tart' || slug === 'tart' || !slug) {
      // ==========================================
      // ARTISAN FRENCH STRAWBERRY TART (from clean_k_62.png)
      // ==========================================
      const tartGroup = new THREE.Group();

      // Fluted Baked Shortcrust Pastry Shell
      const crustGeo = new THREE.CylinderGeometry(1.72, 1.55, 0.42, 48);
      const crustMat = new THREE.MeshStandardMaterial({
        map: crustTex,
        roughness: 0.68,
        metalness: 0.04,
      });
      const crust = new THREE.Mesh(crustGeo, crustMat);
      crust.position.y = 0.21;
      crust.castShadow = true;
      crust.receiveShadow = true;
      tartGroup.add(crust);

      // Fluted Scalloped Rim Edge
      const fluteCount = 32;
      for (let i = 0; i < fluteCount; i++) {
        const angle = (i / fluteCount) * Math.PI * 2;
        const fx = Math.cos(angle) * 1.7;
        const fz = Math.sin(angle) * 1.7;
        const fluteGeo = new THREE.CylinderGeometry(0.075, 0.06, 0.42, 10);
        const flute = new THREE.Mesh(fluteGeo, crustMat);
        flute.position.set(fx, 0.21, fz);
        flute.castShadow = true;
        tartGroup.add(flute);
      }

      // Creamy Vanilla Custard Filling
      const custardGeo = new THREE.CylinderGeometry(1.58, 1.58, 0.12, 36);
      const custardMat = new THREE.MeshStandardMaterial({
        color: 0xffefb3,
        roughness: 0.28,
        metalness: 0.04,
      });
      const custard = new THREE.Mesh(custardGeo, custardMat);
      custard.position.y = 0.42;
      custard.receiveShadow = true;
      tartGroup.add(custard);

      // 12 Outer Ring Strawberries
      const outerCount = 12;
      for (let i = 0; i < outerCount; i++) {
        const a = (i / outerCount) * Math.PI * 2;
        const rad = 1.16;
        const s = createPlumpStrawberry(
          0.96,
          Math.sin(a) * 0.26,
          -Math.cos(a) * 0.26
        );
        s.position.set(Math.cos(a) * rad, 0.65, Math.sin(a) * rad);
        tartGroup.add(s);
      }

      // 6 Inner Ring Strawberries
      const innerCount = 6;
      for (let i = 0; i < innerCount; i++) {
        const a = (i / innerCount) * Math.PI * 2 + 0.35;
        const rad = 0.58;
        const s = createPlumpStrawberry(
          1.02,
          Math.sin(a) * 0.18,
          -Math.cos(a) * 0.18
        );
        s.position.set(Math.cos(a) * rad, 0.76, Math.sin(a) * rad);
        tartGroup.add(s);
      }

      // Center Crown Strawberry with mint leaf sprig
      const centerBerry = createPlumpStrawberry(1.18, 0.05, 0);
      centerBerry.position.set(0, 0.88, 0);
      tartGroup.add(centerBerry);

      pastryGroup.add(tartGroup);

    } else if (slug === 'strawberry-love-cake' || slug === 'cake') {
      // ==========================================
      // STRAWBERRY LOVE CAKE
      // ==========================================
      const cakeGroup = new THREE.Group();

      const baseGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.72, 48);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xfffcf7, roughness: 0.32 });
      const cakeBase = new THREE.Mesh(baseGeo, baseMat);
      cakeBase.position.y = 0.4;
      cakeBase.castShadow = true;
      cakeBase.receiveShadow = true;
      cakeGroup.add(cakeBase);

      const midGeo = new THREE.CylinderGeometry(1.41, 1.41, 0.12, 48);
      const midMat = new THREE.MeshStandardMaterial({ color: 0xf5ccd2, roughness: 0.35 });
      const midRibbon = new THREE.Mesh(midGeo, midMat);
      midRibbon.position.y = 0.4;
      cakeGroup.add(midRibbon);

      const rosetteCount = 10;
      const rosetteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22 });
      for (let i = 0; i < rosetteCount; i++) {
        const a = (i / rosetteCount) * Math.PI * 2;
        const rx = Math.cos(a) * 1.12;
        const rz = Math.sin(a) * 1.12;
        const rosette = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), rosetteMat);
        rosette.position.set(rx, 0.82, rz);
        rosette.scale.set(1, 0.75, 1);
        cakeGroup.add(rosette);
      }

      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const bx = Math.cos(a) * 0.52;
        const bz = Math.sin(a) * 0.52;
        const s = createPlumpStrawberry(0.9, Math.sin(a) * 0.2, -Math.cos(a) * 0.2);
        s.position.set(bx, 0.98, bz);
        cakeGroup.add(s);
      }

      pastryGroup.add(cakeGroup);

    } else if (slug === 'chocolate-treasure-cake') {
      // ==========================================
      // CHOCOLATE TREASURE CAKE
      // ==========================================
      const chocGroup = new THREE.Group();

      const chocBaseGeo = new THREE.CylinderGeometry(1.38, 1.38, 0.75, 48);
      const chocBaseMat = new THREE.MeshStandardMaterial({
        color: 0x3d2319,
        roughness: 0.18,
        metalness: 0.15,
      });
      const chocBase = new THREE.Mesh(chocBaseGeo, chocBaseMat);
      chocBase.position.y = 0.42;
      chocBase.castShadow = true;
      chocBase.receiveShadow = true;
      chocGroup.add(chocBase);

      const glazeGeo = new THREE.CylinderGeometry(1.42, 1.4, 0.15, 48);
      const glazeMat = new THREE.MeshStandardMaterial({
        color: 0x24140e,
        roughness: 0.08,
        metalness: 0.25,
      });
      const glaze = new THREE.Mesh(glazeGeo, glazeMat);
      glaze.position.y = 0.78;
      chocGroup.add(glaze);

      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf5d061,
        roughness: 0.2,
        metalness: 0.9,
      });

      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const tx = Math.cos(a) * 0.65;
        const tz = Math.sin(a) * 0.65;
        const truffle = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24), chocBaseMat);
        truffle.position.set(tx, 0.98, tz);
        truffle.rotation.set(i, i * 2, 0);
        chocGroup.add(truffle);

        const goldPearl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), goldMat);
        goldPearl.position.set(tx + 0.05, 1.14, tz + 0.05);
        chocGroup.add(goldPearl);
      }

      pastryGroup.add(chocGroup);

    } else {
      // ==========================================
      // ARTISAN DESSERT CUP (Matcha, Latte, etc.)
      // ==========================================
      const cupGroup = new THREE.Group();

      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.88,
        opacity: 1,
        transparent: true,
        roughness: 0.06,
        ior: 1.48,
      });
      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.88, 0.68, 1.45, 32, 1, true),
        glassMat
      );
      glass.position.y = 0.75;
      glass.castShadow = true;
      cupGroup.add(glass);

      const isMatcha = slug.includes('matcha');
      const botColor = isMatcha ? 0x6e8f4f : 0xfca044;
      const botLayer = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.67, 0.55, 32),
        new THREE.MeshStandardMaterial({ color: botColor, roughness: 0.4 })
      );
      botLayer.position.y = 0.35;
      cupGroup.add(botLayer);

      const topCream = new THREE.Mesh(
        new THREE.CylinderGeometry(0.84, 0.72, 0.55, 32),
        new THREE.MeshStandardMaterial({ color: 0xfffaea, roughness: 0.25 })
      );
      topCream.position.y = 0.88;
      cupGroup.add(topCream);

      const topFruit = createPlumpStrawberry(0.85, 0.2, 0.1);
      topFruit.position.set(0, 1.35, 0);
      cupGroup.add(topFruit);

      const strawMat = new THREE.MeshStandardMaterial({
        color: isMatcha ? 0x5a8a68 : 0xee7265,
        roughness: 0.3,
      });
      const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 16), strawMat);
      straw.position.set(0.32, 1.25, -0.2);
      straw.rotation.z = -0.24;
      straw.rotation.x = 0.15;
      cupGroup.add(straw);

      pastryGroup.add(cupGroup);
    }

    // --- Animation & Interaction Loop ---
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      if (pastryGroupRef.current) {
        if (!isDragging.current) {
          const idleTime = Date.now() - lastInteractionTime.current;
          if (idleTime > 1200) {
            rotationVelocity.current += (0.005 - rotationVelocity.current) * 0.04;
          } else {
            rotationVelocity.current *= 0.94;
          }
          pastryGroupRef.current.rotation.y += rotationVelocity.current;
        }
      }

      if (rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, camera);
      }
    };

    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const newW = container.clientWidth || 300;
      const newH = container.clientHeight || 260;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width: newW, height: newH } = entry.contentRect;
          if (newW > 0 && newH > 0 && rendererRef.current) {
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            rendererRef.current.setSize(newW, newH);
          }
        }
      });
      resizeObserver.observe(container);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [slug]);

  // Pointer Drag Handlers
  const handlePointerDown = (clientX: number) => {
    isDragging.current = true;
    previousPointerX.current = clientX;
    lastInteractionTime.current = Date.now();
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDragging.current || !pastryGroupRef.current) return;
    const deltaX = clientX - previousPointerX.current;
    previousPointerX.current = clientX;
    lastInteractionTime.current = Date.now();

    const sensitivity = 0.009;
    pastryGroupRef.current.rotation.y += deltaX * sensitivity;
    rotationVelocity.current = deltaX * sensitivity;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  if (!webGlSupported) {
    return (
      <div className={`relative flex items-center justify-center bg-[#FDF9F3] rounded-3xl p-6 ${className}`}>
        {fallbackImage && (
          <img
            src={fallbackImage}
            alt="Pastry"
            className="w-56 h-56 object-contain filter drop-shadow-md"
          />
        )}
      </div>
    );
  }

  const { language } = useLanguage();

  return (
    <div className={`flex flex-col items-center justify-center w-full ${className}`}>
      {/* 3D WebGL Turntable Canvas Container */}
      <div
        className="relative w-full max-w-[280px] sm:max-w-[310px] h-[240px] sm:h-[280px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={(e) => {
          if (e.touches.length === 1) handlePointerDown(e.touches[0].clientX);
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 1) handlePointerMove(e.touches[0].clientX);
        }}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Delicate handwritten prompt matching video: "‹ drag to turn it around ›" */}
      <div className="flex items-center gap-1.5 mt-0 select-none pointer-events-none">
        <span className="text-[13px] font-script tracking-wide text-[#8C7A70] transition-opacity duration-300">
          {language === 'zh' ? '‹ 按住拖动 360° 旋转 ›' : '‹ drag to turn it around ›'}
        </span>
      </div>
    </div>
  );
};
