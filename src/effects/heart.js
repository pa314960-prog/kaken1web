import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

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

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(2, 3, 4);
    this.scene.add(ambient, key);

    this.geometry = buildHeartGeometry();
    this.material = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      metalness: 0.15,
      roughness: 0.35,
      emissive: 0x330008,
      transparent: true
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
      this.spawnTimer = 0.5;
      const pos = this.screenToWorld(originX, originY);
      const mesh = new THREE.Mesh(this.geometry, this.material.clone());
      mesh.position.set(pos.x, pos.y, 0);
      mesh.scale.setScalar(0.001);
      mesh.rotation.y = Math.random() * 0.4 - 0.2;
      mesh.userData = { life: 0, maxLife: 3.2, driftX: (Math.random() - 0.5) * 0.6 };
      this.scene.add(mesh);
      this.hearts.push(mesh);
    }
  }

  update(dt) {
    for (const h of this.hearts) {
      h.userData.life += dt;
      const t = h.userData.life / h.userData.maxLife;
      const growT = Math.min(1, h.userData.life / 0.5);
      h.scale.setScalar(0.001 + growT * 0.85);
      h.position.y += dt * (0.5 + t * 1.2);
      h.position.x += h.userData.driftX * dt;
      h.rotation.y += dt * 0.4;
      h.material.opacity = t < 0.6 ? 1 : Math.max(0, 1 - (t - 0.6) / 0.4);
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
