import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
const GLTF_PATH = './gltf/thinking_emoji/scene.gltf';

class Instances {
  private width: number;
  private height: number;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;

  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xf3f3f3, 1.0);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 1, 100);
    this.camera.position.set(0, 3, 5);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.keyPanSpeed = 0.0;
    this.controls.maxDistance = 5000.0;
    this.controls.maxPolarAngle = Math.PI * 0.495;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 1.0;

    const light = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(light);

    const grid = new THREE.GridHelper(10, 5);
    this.scene.add(grid);

    const loader = new GLTFLoader();
    loader.load(GLTF_PATH, data => {
      let geometries: THREE.BufferGeometry[] | THREE.Geometry[] = [];
      let materials: THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] = [];
      let index = 0;

      const gltf = data;
      const character = gltf.scene;
      character.traverse(node => {
        if (node.type === 'Mesh') {
          const mesh = node as THREE.Mesh;
          geometries[index] = mesh.geometry;
          materials[index] = mesh.material;
          index++;
        }
      });

      const instanceCount = 100;
      const cluster1 = new THREE.InstancedMesh(geometries[0], materials[0], instanceCount);
      const cluster2 = new THREE.InstancedMesh(geometries[1], materials[1], instanceCount);

      const matrix = new THREE.Matrix4();
      const offset = new THREE.Vector3();
      const orientation = new THREE.Quaternion();
      const scale1 = new THREE.Vector3(0.003, 0.003, 0.003);
      const scale2 = new THREE.Vector3(0.2, 0.2, 0.05);

      for (let i = 0; i < instanceCount; i++) {
        // offset
        const x = Math.random() * 5 - 2.5;
        const y = Math.random() * 2;
        const z = Math.random() * 5 - 2.5;
        offset.set(x, y, z).normalize();
        offset.multiplyScalar(2.0);
        offset.set(x + offset.x, y + offset.y, z + offset.z);
        // orientations
        orientation.set(0, 0, 0, 0).normalize();

        // set martix with cluster1
        matrix.compose(offset, orientation, scale1);
        cluster1.setMatrixAt(i, matrix);
        // set matrix with cluster2
        offset.set(offset.x - 0.1, offset.y - 0.2, offset.z + 0.25);
        matrix.compose(offset, orientation, scale2);
        cluster2.setMatrixAt(i, matrix);
      }

      this.scene.add(cluster1);
      this.scene.add(cluster2);

      this.render();
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.controls.update();

    requestAnimationFrame(() => this.render());
  }
}

export default Instances;
