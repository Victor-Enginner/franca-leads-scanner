"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import * as THREE from "three";
import { FRANCA } from "./util";

export type GlobeHandle = {
  /** Rotaciona o globo até Franca com easing. Resolve ao terminar ou ao skip. */
  spinToFranca: (fast: boolean, isSkipped: () => boolean) => Promise<void>;
  /** Plota um lead na posição lat/lon real, com feixe vertical e pulso. */
  addPoint: (lat: number, lon: number, color: number) => void;
  clearPoints: () => void;
  setAutoRotate: (v: boolean) => void;
  setTargetZoom: (z: number) => void;
};

function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

type GlobeState = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  globeGroup: THREE.Group;
  pointsGroup: THREE.Group;
  // Recursos compartilhados: 1 geometria de ponto + 1 material por cor,
  // em vez de um par novo por lead — centenas de leads não podem virar
  // centenas de geometrias/materiais na GPU.
  pointGeo: THREE.SphereGeometry;
  pointMats: Map<number, THREE.MeshBasicMaterial>;
  beamMats: Map<number, THREE.LineBasicMaterial>;
  raf: number;
  autoRotate: boolean;
  zoomLevel: number;
  targetZoom: number;
  dragging: boolean;
  lastX: number;
  lastY: number;
};

const Globe = forwardRef<GlobeHandle>(function Globe(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef<GlobeState | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Terra realista: imagem de satélite NASA Blue Marble (domínio
    // público, servida de public/). MeshBasicMaterial dispensa luzes —
    // visual uniforme de imagem de satélite.
    const earthMat = new THREE.MeshBasicMaterial({ color: 0x223344 });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1.5, 64, 64), earthMat);
    globeGroup.add(earth);
    new THREE.TextureLoader().load("/textures/earth-blue-marble.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      earthMat.map = tex;
      earthMat.color.set(0xffffff);
      earthMat.needsUpdate = true;
    });

    // Atmosfera azulada suave (fresnel), mais discreta que a versão neon.
    const atmMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: {
        c: { value: 0.4 },
        p: { value: 4.5 },
        glowColor: { value: new THREE.Color(0x4db2ff) },
      },
      vertexShader: `varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader: `uniform vec3 glowColor;uniform float c;uniform float p;varying vec3 vN; void main(){ float i=pow(c-dot(vN,vec3(0,0,1.0)),p); gl_FragColor=vec4(glowColor,i*0.55);}`,
    });
    globeGroup.add(
      new THREE.Mesh(new THREE.SphereGeometry(1.62, 48, 48), atmMat)
    );

    const pointsGroup = new THREE.Group();
    globeGroup.add(pointsGroup);

    globeGroup.rotation.y = (-(FRANCA.lon + 180) * Math.PI) / 180 + Math.PI;
    globeGroup.rotation.x = ((FRANCA.lat * Math.PI) / 180) * 0.6;

    // Estrelas de fundo.
    const starGeo = new THREE.BufferGeometry();
    const sp: number[] = [];
    for (let i = 0; i < 600; i++) {
      const r = 40 + Math.random() * 60;
      const t = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      sp.push(
        r * Math.sin(ph) * Math.cos(t),
        r * Math.sin(ph) * Math.sin(t),
        r * Math.cos(ph)
      );
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    scene.add(
      new THREE.Points(
        starGeo,
        new THREE.PointsMaterial({ color: 0x88aabb, size: 0.15 })
      )
    );

    const st: GlobeState = {
      scene,
      camera,
      renderer,
      globeGroup,
      pointsGroup,
      pointGeo: new THREE.SphereGeometry(0.03, 8, 8),
      pointMats: new Map(),
      beamMats: new Map(),
      raf: 0,
      autoRotate: true,
      zoomLevel: 1,
      targetZoom: 1,
      dragging: false,
      lastX: 0,
      lastY: 0,
    };
    stRef.current = st;

    function animate() {
      st.raf = requestAnimationFrame(animate);
      if (st.autoRotate && !st.dragging) st.globeGroup.rotation.y += 0.0018;
      // Trava dura de zoom a cada frame: mesmo que um estado restaurado
      // de cache (bfcache) ou qualquer bug futuro injete um zoom maior,
      // a câmera nunca chega perto da superfície (z mínimo ≈ 3.1).
      st.targetZoom = Math.max(1, Math.min(1.6, st.targetZoom));
      st.zoomLevel += (st.targetZoom - st.zoomLevel) * 0.06;
      st.zoomLevel = Math.max(1, Math.min(1.6, st.zoomLevel));
      st.camera.position.z = 5 / st.zoomLevel;
      st.pointsGroup.children.forEach((p) => {
        if (p.userData.pulse) {
          p.userData.t += 0.05;
          p.scale.setScalar(1 + Math.sin(p.userData.t) * 0.35);
        }
      });
      st.renderer.render(st.scene, st.camera);
    }
    animate();

    const onMouseDown = (e: MouseEvent) => {
      st.dragging = true;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!st.dragging) return;
      st.globeGroup.rotation.y += (e.clientX - st.lastX) * 0.005;
      st.globeGroup.rotation.x += (e.clientY - st.lastY) * 0.005;
      st.lastX = e.clientX;
      st.lastY = e.clientY;
    };
    const onMouseUp = () => {
      st.dragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      // Só com Ctrl (ou pinça no trackpad): scroll normal precisa rolar a
      // página — sequestrar a roda enterrava a câmera no oceano sem o
      // usuário perceber.
      if (!e.ctrlKey) return;
      e.preventDefault();
      // Máx 1.6: acima disso a esfera estoura o quadro e vira "parede"
      // de textura borrada.
      st.targetZoom = Math.max(1, Math.min(1.6, st.targetZoom - e.deltaY * 0.001));
    };
    const onResize = () => {
      const nw = canvas.clientWidth || 1;
      const nh = canvas.clientHeight || 1;
      st.camera.aspect = nw / nh;
      st.camera.updateProjectionMatrix();
      st.renderer.setSize(nw, nh, false);
    };
    // GPU sobrecarregada (muitas abas, stream, driver) pode descartar o
    // contexto WebGL — sem esses handlers o canvas fica preto pra sempre.
    // preventDefault permite o restore automático; o three recarrega os
    // recursos sozinho no próximo render.
    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(st.raf);
    };
    const onContextRestored = () => {
      animate();
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    return () => {
      cancelAnimationFrame(st.raf);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      st.renderer.dispose();
      stRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    spinToFranca(fast, isSkipped) {
      return new Promise<void>((res) => {
        const st = stRef.current;
        if (!st) return res();
        const tY = (-(FRANCA.lon + 180) * Math.PI) / 180 + Math.PI;
        const tX = ((FRANCA.lat * Math.PI) / 180) * 0.6;
        const sY = st.globeGroup.rotation.y % (Math.PI * 2);
        const sX = st.globeGroup.rotation.x;
        // Progresso por tempo decorrido (não por tick): timers podem ser
        // estrangulados em aba de fundo e a animação nunca terminaria.
        const dur = fast ? 500 : 1500;
        const start = performance.now();
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          clearInterval(iv);
          clearTimeout(guard);
          const g = stRef.current;
          if (g) {
            g.globeGroup.rotation.y = tY;
            g.globeGroup.rotation.x = tX;
          }
          res();
        };
        const iv = setInterval(() => {
          if (isSkipped() || !stRef.current) return finish();
          const p = Math.min(1, (performance.now() - start) / dur);
          const e = 1 - Math.pow(1 - p, 3);
          st.globeGroup.rotation.y = sY + (tY - sY) * e;
          st.globeGroup.rotation.x = sX + (tX - sX) * e;
          if (p >= 1) finish();
        }, 16);
        // Garantia: resolve mesmo com timers estrangulados.
        const guard = setTimeout(finish, dur + 150);
      });
    },
    addPoint(lat, lon, color) {
      const st = stRef.current;
      if (!st) return;
      let mat = st.pointMats.get(color);
      if (!mat) {
        mat = new THREE.MeshBasicMaterial({ color });
        st.pointMats.set(color, mat);
      }
      const v = latLonToVec3(lat, lon, 1.52);
      const dot = new THREE.Mesh(st.pointGeo, mat);
      dot.position.copy(v);
      dot.userData = { pulse: true, t: Math.random() * 6 };
      st.pointsGroup.add(dot);

      let beamMat = st.beamMats.get(color);
      if (!beamMat) {
        beamMat = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.5,
        });
        st.beamMats.set(color, beamMat);
      }
      const v2 = latLonToVec3(lat, lon, 1.85);
      st.pointsGroup.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([v, v2]),
          beamMat
        )
      );
    },
    clearPoints() {
      const st = stRef.current;
      if (!st) return;
      while (st.pointsGroup.children.length) {
        const obj = st.pointsGroup.children[0];
        st.pointsGroup.remove(obj);
        // Só os feixes têm geometria própria; a esfera de ponto é
        // compartilhada e não pode ser descartada aqui.
        if (obj instanceof THREE.Line) obj.geometry.dispose();
      }
    },
    setAutoRotate(v) {
      if (stRef.current) stRef.current.autoRotate = v;
    },
    setTargetZoom(z) {
      if (stRef.current) stRef.current.targetZoom = z;
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
    />
  );
});

export default Globe;
