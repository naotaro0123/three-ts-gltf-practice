import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';
import GLTFLoader from 'three-gltf-loader';
const GLTF_PATH = './gltf/shadowman/scene.gltf';
const ANIM_INDEX = 2;

class Simple {
  private _width: number;
  private _height: number;
  private _renderer: THREE.WebGLRenderer;
  private _scene: THREE.Scene;
  private _camera: THREE.PerspectiveCamera;
  private _controls: OrbitControls;
  private _loader: GLTFLoader;
  private _clock: THREE.Clock;
  private _mixer: THREE.AnimationMixer;
  private _animations: THREE.AnimationClip[];

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
    this._camera.position.set(0, 1, 5);

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
      const gltf = data;
      const character = gltf.scene;
      character.position.set(0, 0, 0);
      character.scale.set(0.005, 0.005, 0.005);
      this._scene.add(character);

      this._animations = gltf.animations;

      if (this._animations && this._animations.length) {
        this._mixer = new THREE.AnimationMixer(character);
        this.playAnimation(ANIM_INDEX);
      }

      this.render();
    });
  }

  render() {
    this._renderer.render(this._scene, this._camera);
    this._controls.update();

    if (this._mixer) {
      this._mixer.update(this._clock.getDelta());
    }

    requestAnimationFrame(() => this.render());
  }

  playAnimation(index) {
    this._mixer.clipAction(this._animations[index]).play();
  }
}

export default Simple;
