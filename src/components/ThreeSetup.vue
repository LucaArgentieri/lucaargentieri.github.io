<script setup>
//https://www.youtube.com/watch?v=cxAfmtwZUd8&t=1127s&ab_channel=AlvaroDevLabs
import { ref, computed, onMounted, watch } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useWindowSize } from "@vueuse/core";
import * as dat from "dat.gui";

const canvasRef = ref(null);
const { width, height } = useWindowSize();
const aspectRatio = computed(() => width.value / height.value);

let renderer = null;
let cameraControls = null;
const gui = new dat.GUI();
const clock = new THREE.Clock();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, aspectRatio.value, 0.1, 1000);
camera.position.z = 5;
scene.add(camera);

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

const updateCamera = () => {
  camera.aspect = aspectRatio.value;
  camera.updateProjectionMatrix();
};

const updateRenderer = () => {
  renderer.setSize(width.value, height.value);
  renderer.render(scene, camera);
};

const setRenderer = () => {
  if (canvasRef.value) {
    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.value,
      antialias: true,
    });

    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.enableDamping = true;
    updateRenderer();
  }
};

watch(aspectRatio, () => {
  updateCamera();
  updateRenderer();
});

onMounted(() => {
  setRenderer();
  loop();
});

const loop = () => {
  // const elapsedTime = clock.getElapsedTime();

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  cameraControls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
};
</script>

<template>
  <div>
    <canvas ref="canvasRef" />
  </div>
</template>
