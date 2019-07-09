import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';
const InstancedMesh = require('three-instanced-mesh')(THREE);
import GLTFLoader from 'three-gltf-loader';
const GLTF_PATH = './gltf/thinking_emoji/scene.gltf';

class Instances {
  private _width: number;
  private _height: number;
  private _renderer: THREE.WebGLRenderer;
  private _scene: THREE.Scene;
  private _camera: THREE.PerspectiveCamera;
  private _controls: OrbitControls;
  private _loader: GLTFLoader;
  private _clock: THREE.Clock;

  constructor() {
    this._clock = new THREE.Clock();

    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._renderer = new THREE.WebGLRenderer();
    this._renderer.setSize(this._width, this._height);
    this._renderer.setClearColor(0xf3f3f3, 1.0);
    document.body.appendChild(this._renderer.domElement);

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(50, this._width / this._height, 1, 100);
    this._camera.position.set(0, 3, 5);

    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enablePan = true;
    this._controls.enableZoom = true;
    this._controls.keyPanSpeed = 0.0;
    this._controls.maxDistance = 5000.0;
    this._controls.maxPolarAngle = Math.PI * 0.495;
    this._controls.autoRotate = true;
    this._controls.autoRotateSpeed = 1.0;

    const light = new THREE.AmbientLight(0xffffff, 1);
    this._scene.add(light);

    const grid = new THREE.GridHelper(10, 5);
    this._scene.add(grid);

    this._loader = new GLTFLoader();
    this._loader.load(GLTF_PATH, data => {
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
      const cluster1 = new InstancedMesh(geometries[0], materials[0], instanceCount, false, false, true);
      const cluster2 = new InstancedMesh(geometries[1], materials[1], instanceCount, false, false, true);

      const vector3 = new THREE.Vector3();

      for (let i = 0; i < instanceCount; i++) {
        const quaternion = new THREE.Quaternion();
        // const axis = new THREE.Vector3(0, 2, 0).normalize();
        const axis = new THREE.Vector3(0, 0, 0).normalize();
        const ANY_ANGLERAD = Math.floor(Math.random() * 60);
        console.log(ANY_ANGLERAD);
        quaternion.setFromAxisAngle(axis, ANY_ANGLERAD);
        cluster1.setQuaternionAt(i, quaternion);
        cluster2.setQuaternionAt(i, quaternion);
        // Range(0 ~ 5 => -2.5 ~ 2.5)
        const x = Math.random() * 5 - 2.5;
        // Range(0 ~ 2)
        const y = Math.random() * 2;
        // Range(0 ~ 5 => -2.5 ~ 2.5)
        const z = Math.random() * 5 - 2.5;
        cluster1.setPositionAt(i, vector3.set(x, y, z));
        cluster2.setPositionAt(i, vector3.set(x - 0.1, y - 0.15, z + 0.3));
        cluster1.setScaleAt(i, vector3.set(0.003, 0.003, 0.003));
        cluster2.setScaleAt(i, vector3.set(0.2, 0.2, 0.05));
      }

      this._scene.add(cluster1);
      this._scene.add(cluster2);

      this.render();
    });
  }

  render() {
    this._renderer.render(this._scene, this._camera);
    this._controls.update();

    requestAnimationFrame(() => this.render());
  }
}

export default Instances;
