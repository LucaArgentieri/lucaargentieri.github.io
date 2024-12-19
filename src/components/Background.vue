<script setup>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { useWindowSize } from "@vueuse/core";
import { ref, computed, watch, onMounted } from 'vue'

const canvasRef = ref(null);
const { width, height } = useWindowSize();
const aspectRatio = computed(() => width.value / height.value);

let renderer = null;
let cameraControls = null;
let model = null;
const clock = new THREE.Clock();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, aspectRatio.value, 0.1, 1000);
camera.position.z = 3;
scene.add(camera);

const ambientLight = new THREE.AmbientLight(0xE53D00, 5);
scene.add(ambientLight);

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);


gltfLoader.load(
    "/model/scene.gltf",
    (gltf) => {
        model = gltf.scene;
        scene.add(model);
    }
);


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
            alpha: true,
        });

        cameraControls = new OrbitControls(camera, renderer.domElement);
        cameraControls.enableDamping = true;
        cameraControls.enableZoom = false;
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
    const elapsedTime = clock.getElapsedTime();

    if (model) {
        model.rotation.y += 0.001;
        model.rotation.x += 0.001;

    }

    cameraControls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
};
</script>

<template>
    <div class="fixed left-0 top-0 w-full h-full -z-10">
        <canvas ref="canvasRef" />
    </div>
</template>
