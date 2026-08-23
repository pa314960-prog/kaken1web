import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { easeOutBack, rand } from "./utils.js";

function buildHeartGeometry() {
  const shape = new THREE.Shape();
  const x = 0, y = 0;
  shape.moveTo(x, y + 0.25);
  shape.bezierCurveTo(x, y + 0.4, x - 0.3, y + 0.6, x - 0.6, y + 0.25);
  shape.bezierCurveTo(x - 1, y - 0.2, x - 0.5, y - 0.55, x, y - 1);
  shape.bezierCurveTo(x + 0.5, y - 0.55, x + 1, y - 0.2, x + 0.6, y + 0.25);
  shape.bezierCurveTo(x + 0.3, y + 0.6, x, y + 0.4, x, y + 0.25);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.35,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 4,
    curveSegments: 24
  });
  geometry.center();
  return geometry;
}

export class HeartEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 0, 6);

    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(2, 3, 4);
    const rim = new THREE.DirectionalLight(0xffe6ec, 0.5);
    rim.position.set(-2, -1, 3);
    this.scene.add(ambient, key, rim);

    this.geometry = buildHeartGeometry();
    this.material = new THREE.MeshPhysicalMaterial({
      color: 0xffb3c1,
      roughness: 0.92,
      metalness: 0,
      clearcoat: 0.12,
      clearcoatRoughness: 1,
      sheen: 1,
      sheenColor: 0xffffff,
      sheenRoughness: 0.85,
      emissive: 0x3a0010,
      transparent: true,
      opacity: 0.72
    });

    this.hearts = [];
    this.spawnTimer = 0;
    this.resize();
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.width = w;
    this.height = h;
  }

  screenToWorld(nx, ny) {
    const vh = Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z;
    const vw = vh * this.camera.aspect;
    return {
      x: (nx - 0.5) * 2 * vw,
      y: -(ny - 0.5) * 2 * vh
    };
  }

  onHold(dt, originX, originY) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 0.28;
      const pos = this.screenToWorld(originX, originY);
      const scale = 0.55 + Math.random() * 0.55;
      const mesh = new THREE.Mesh(this.geometry, this.material.clone());
      mesh.position.set(pos.x, pos.y, 0);
      mesh.scale.setScalar(0.001);
      mesh.rotation.y = Math.random() * 0.4 - 0.2;
      mesh.userData = {
        life: 0,
        maxLife: rand(2.2, 3),
        driftX: (Math.random() - 0.5) * 0.9,
        baseScale: scale,
        wobbleSeed: Math.random() * Math.PI * 2
      };
      this.scene.add(mesh);
      this.hearts.push(mesh);
    }
  }

  update(dt) {
    for (const h of this.hearts) {
      h.userData.life += dt;
      const t = h.userData.life / h.userData.maxLife;
      const growT = Math.min(1, h.userData.life / 0.32);
      const eased = easeOutBack(growT);
      h.scale.setScalar(0.001 + eased * h.userData.baseScale);
      h.position.y += dt * (1.1 + t * 2.4);
      h.position.x += h.userData.driftX * dt + Math.sin(h.userData.life * 3 + h.userData.wobbleSeed) * 0.15 * dt;
      h.rotation.y = Math.sin(h.userData.life * 2 + h.userData.wobbleSeed) * 0.35;
      h.rotation.z = Math.sin(h.userData.life * 1.5 + h.userData.wobbleSeed) * 0.12;
      h.material.opacity = t < 0.55 ? 0.72 : Math.max(0, 0.72 * (1 - (t - 0.55) / 0.45));
      const pulse = 0.08 + Math.abs(Math.sin(h.userData.life * 4)) * 0.1;
      h.material.emissive.setRGB(pulse, pulse * 0.1, pulse * 0.15);
    }
    this.hearts = this.hearts.filter((h) => {
      const alive = h.userData.life < h.userData.maxLife;
      if (!alive) this.scene.remove(h);
      return alive;
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  isEmpty() {
    return this.hearts.length === 0;
  }
}
