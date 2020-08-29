import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// const GLTF_PATH = './gltf/shadowman/scene.gltf';
const GLTF_PATH = './gltf/cube.gltf';
const characterInfo = {
  position: [0, 0, 0],
  // scale: [0.005, 0.005, 0.005]
  scale: [0.5, 0.5, 0.5]
};

class Simple {
  private width: number;
  private height: number;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private clock: THREE.Clock;
  private mixer: THREE.AnimationMixer;
  private animations: THREE.AnimationClip[];
  private previousIndex: number = 0;

  constructor() {
    this.clock = new THREE.Clock();
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
      const gltf = data;
      const character = gltf.scene;
      const [posX, posY, posZ] = characterInfo.position;
      character.position.set(posX, posY, posZ);
      const [scaleX, scaleY, scaleZ] = characterInfo.scale;
      character.scale.set(scaleX, scaleY, scaleZ);
      this.scene.add(character);

      const skeltonHelper = new THREE.SkeletonHelper(character.children[0]);
      this.scene.add(skeltonHelper);

      this.animations = gltf.animations;

      if (this.animations && this.animations.length) {
        this.mixer = new THREE.AnimationMixer(character);
        this.setupGUI();
      }

      this.render();
    });
  }

  setupGUI() {
    let animationNames = {};
    this.animations.forEach((value, index) => {
      animationNames[`'${value.name}'`] = index;
    });
    const guiControls = {
      animations: animationNames
    };
    const gui = new dat.GUI();
    gui.add(guiControls, 'animations', animationNames).onChange(index => {
      this.playAnimation(index);
    });
  }

  playAnimation(index) {
    this.mixer.clipAction(this.animations[this.previousIndex]).stop();
    this.mixer.clipAction(this.animations[index]).play();
    this.previousIndex = index;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.controls.update();

    if (this.mixer) {
      this.mixer.update(this.clock.getDelta());
    }

    requestAnimationFrame(() => this.render());
  }
}

export default Simple;
