import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three-orbitcontrols-ts';
const InstancedMesh = require('three-instanced-mesh')(THREE);
import GLTFLoader from 'three-gltf-loader';
const GLTF_PATH = './gltf/shadowman/scene.gltf';

class InstancesAnimation {
  private _width: number;
  private _height: number;
  private _renderer: THREE.WebGLRenderer;
  private _scene: THREE.Scene;
  private _camera: THREE.PerspectiveCamera;
  private _controls: OrbitControls;
  private _loader: GLTFLoader;
  private _guiControls: any;
  private _clock: THREE.Clock;
  private _mixer: THREE.AnimationMixer;
  private _animations: THREE.AnimationClip[];
  private _previousIndex: number = 0;

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
        console.dir(node);
        if (node.type === 'SkinnedMesh') {
          const mesh = node as THREE.Mesh;
          geometries[index] = mesh.geometry;
          materials[index] = mesh.material;
          index++;
        }
      });

      this._animations = gltf.animations;
      if (this._animations && this._animations.length) {
        this._mixer = new THREE.AnimationMixer(character);
        this.setupGUI();
      }

      const instanceCount = 100;
      const cluster1 = new InstancedMesh(geometries[2], materials[2], instanceCount, false, false, true);

      const vector3 = new THREE.Vector3();

      for (let i = 0; i < instanceCount; i++) {
        const quaternion = new THREE.Quaternion();
        // const axis = new THREE.Vector3(0, 2, 0).normalize();
        const axis = new THREE.Vector3(0, 0, 0).normalize();
        const ANY_ANGLERAD = Math.floor(Math.random() * 60);
        console.log(ANY_ANGLERAD);
        quaternion.setFromAxisAngle(axis, ANY_ANGLERAD);
        cluster1.setQuaternionAt(i, quaternion);
        // Range(0 ~ 5 => -2.5 ~ 2.5)
        const x = Math.random() * 5 - 2.5;
        // Range(0 ~ 2)
        const y = Math.random() * 2;
        // Range(0 ~ 5 => -2.5 ~ 2.5)
        const z = Math.random() * 5 - 2.5;
        cluster1.setPositionAt(i, vector3.set(x, y, z));
        cluster1.setScaleAt(i, vector3.set(0.003, 0.003, 0.003));
      }

      this._scene.add(cluster1);

      this.render();
    });
  }

  setupGUI() {
    this._guiControls = new (function() {
      this.animations = {};
    })();
    const gui = new dat.GUI();
    let animationNames = {};
    for (let i = 0; i < this._animations.length; i++) {
      animationNames[`'${this._animations[i].name}'`] = i;
    }
    gui.add(this._guiControls, 'animations', animationNames).onChange(index => {
      this.playAnimation(index);
    });
  }

  playAnimation(index) {
    this._mixer.clipAction(this._animations[this._previousIndex]).stop();
    this._mixer.clipAction(this._animations[index]).play();
    this._previousIndex = index;
  }

  render() {
    this._renderer.render(this._scene, this._camera);
    this._controls.update();

    requestAnimationFrame(() => this.render());
  }
}

export default InstancesAnimation;
