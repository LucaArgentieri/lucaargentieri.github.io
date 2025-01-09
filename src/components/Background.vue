<script setup>
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useWindowSize } from "@vueuse/core";
import { ref, computed, watch, onMounted } from 'vue'

const canvasRef = ref(null);
const { width, height } = useWindowSize();
const aspectRatio = computed(() => width.value / height.value);

let renderer = null;
let cameraControls = null;
const clock = new THREE.Clock();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, aspectRatio.value, 0.1, 1000);
camera.position.z = 5;
scene.add(camera);

const material = new THREE.ShaderMaterial({
    uniforms: {
        time: { type: "f", value: 1.0 },
        resolution: { value: new THREE.Vector2() }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
      `,
    fragmentShader: `
            uniform float time;
            varying vec2 vUv;

            void main(){
              vec2 coord = 4.0 * vUv.xy;

            for(int n = 1; n < 8; n++){
                float i = float(n);
                coord+=vec2(.3/ i * sin(i * coord.y+time+10. * i)+.10, .01 + i * sin(coord.x+time+10. * i) + 1.);
            }

            coord += vec2(0.3 /cos(coord.y + time * .1), 0.1 / sin(coord.x + time * 1.));
            vec3 color = vec3(0.894, 0.894 / sin(coord.y), 0.894);
            gl_FragColor = vec4(color, 1.);
            }`,

});

const cube = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 1),
    material
);

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
    material.uniforms.time.value = clock.getElapsedTime() * 0.1;

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
