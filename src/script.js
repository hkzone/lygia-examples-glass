import gsap from 'gsap';
import * as THREE from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Stats from 'stats.js';
import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';

import { Rendering } from './rendering';
import vertexShader from './shaders/lygia-example/vertex.glsl';
import lightingPbrGlassFrag from './shaders/lygia-example/lighting_pbrGlass.frag';
import lightingRaymarchingGlassFrag from './shaders/lygia-example/lighting_raymarching_glass.frag';
import lightingRaymarchingGlassRefraction from './shaders/lygia-example/lighting_raymarching_glass_refraction.frag';

// ************************************************************************** //
// ***************************** Setup Rendering **************************** //
// ************************************************************************** //

const rendering = new Rendering(document.querySelector('#canvas'));
rendering.controls.enableZoom = false;
// ************************************************************************** //
// ********************************* Loaders ******************************** //
// ************************************************************************** //

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// ************************************************************************** //
// ******************************* GLTF Models ****************************** //
// ************************************************************************** //

// Load Models
const gltf = await gltfLoader.loadAsync('./IridescenceSuzanne.glb');

// ************************************************************************** //
// ***************************** Enviroment Map ***************************** //
// ************************************************************************** //

const cubeTextureLoader = new THREE.CubeTextureLoader();
const cubeTexture = await cubeTextureLoader.loadAsync([
  '/environmentMaps/px.png',
  '/environmentMaps/nx.png',
  '/environmentMaps/py.png',
  '/environmentMaps/ny.png',
  '/environmentMaps/pz.png',
  '/environmentMaps/nz.png',
]);

rendering.scene.background = cubeTexture;

// ************************************************************************** //
// ******************************* Lightprobe ******************************* //
// ************************************************************************** //
const lightProbe = new THREE.LightProbe();
rendering.scene.add(lightProbe);

lightProbe.copy(LightProbeGenerator.fromCubeTexture(cubeTexture));

// ************************************************************************** //
// ******************************** Uniforms ******************************** //
// ************************************************************************** //

const uniforms = {
  u_time: new THREE.Uniform(),
  u_resolution: new THREE.Uniform(
    new THREE.Vector2(rendering.vp.canvas.width, rendering.vp.canvas.height)
  ),
  u_cubeMap: {
    value: cubeTexture,
  },
  u_light: { value: new THREE.Vector3(4, 4, 10) },
  u_lightColor: { value: new THREE.Color('yellow') },
  u_SH: { value: lightProbe.sh.coefficients },
};

// ************************************************************************** //
// ******************************* Geometries ******************************* //
// ************************************************************************** //

const geometryB = new THREE.SphereGeometry(1, 64, 32);
const geometryC = new THREE.BoxGeometry(2, 2, 2);

// ************************************************************************** //
// ******************************** Material ******************************** //
// ************************************************************************** //

const lygiaMaterialA = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader: lightingPbrGlassFrag,
});

const lygiaMaterialB = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader: lightingRaymarchingGlassFrag,
});

const lygiaMaterialC = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader: lightingRaymarchingGlassRefraction,
});

// ************************************************************************** //
// ********************************* Meshes ********************************* //
// ************************************************************************** //

const meshA = gltf.scene.children[0];
meshA.position.set(-3.5, 0, 0);
meshA.material = lygiaMaterialA;
meshA.frustumCulled = false;

const meshB = new THREE.Mesh(geometryB, lygiaMaterialB);
meshB.position.set(-0.5, 0, 0);
meshB.frustumCulled = false;

const meshC = new THREE.Mesh(geometryC, lygiaMaterialC);
meshC.position.set(2.5, 0, 0);
meshC.frustumCulled = false;

rendering.scene.add(meshA);
rendering.scene.add(meshB);
rendering.scene.add(meshC);

// ************************************************************************** //
// ********************* Handle the window resize event ********************* //
// ************************************************************************** //

function onWindowResize() {
  //update uniforms
  uniforms.u_resolution.value.x = rendering.vp.canvas.width;
  uniforms.u_resolution.value.y = rendering.vp.canvas.height;

  // Update the rendering view and camera
  rendering.onResize();
}

window.addEventListener('resize', onWindowResize);

// ************************************************************************** //
// ********************************** Stats ********************************* //
// ************************************************************************** //

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// ************************************************************************** //
// ************************ Main Render Loop Function *********************** //
// ************************************************************************** //

const tick = (time, delta) => {
  stats.begin();
  const deltaTime = delta * 0.001;

  //Uniforms Update
  uniforms.u_time.value = time;

  // Render
  rendering.render();

  stats.end();
};

gsap.ticker.add(tick);
