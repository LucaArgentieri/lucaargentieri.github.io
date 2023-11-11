<script setup>
import { ref, computed, onMounted, watch } from "vue";
import * as THREE from "three";
import { useWindowSize } from "@vueuse/core";

const canvasRef = ref(null);
const { width, height } = useWindowSize();
const aspectRatio = computed(() => width.value / height.value);

let renderer = null;
let cameraControls = null;
const clock = new THREE.Clock();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, aspectRatio.value, 0.1, 1000);
camera.position.z = 0.3;
scene.add(camera);

const geometry = new THREE.PlaneGeometry(1, 1);
let material = new THREE.ShaderMaterial({
  uniforms: {
    time: { type: "f", value: 1.0 },
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
            vec3 color = vec3(0.7 / sin(coord.x), 0.7 / sin(coord.x), 0.5 / sin(coord.x / coord.y));
            gl_FragColor = vec4(color, 1.);
            }`,
  opacity: 1.0,
});
const cube = new THREE.Mesh(geometry, material);
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
  requestAnimationFrame(loop);
  renderer.render(scene, camera);
  material.uniforms.time.value = clock.getElapsedTime() / 2.5;
};

console.log(`
  Hello! I see that you are curious :D

  ▄█▄    ▄█ ██   ████▄ 
█▀ ▀▄  ██ █ █  █   █ 
█   ▀  ██ █▄▄█ █   █ 
█▄  ▄▀ ▐█ █  █ ▀████ 
▀███▀   ▐    █       
            █        
           ▀    
  `);
console.log("Email: %c lucaargentieri98@gmail.com", "color:white; background-color:#0000ff");
console.log("Github: %c https://github.com/LucaArgentieri", "color:white; background-color:#0000ff");
</script>

<template>
  <div
    class="flex justify-center items-center flex-col gap-5 h-screen relative bg-transparent font-sans px-5 text-center"
  >
    <h1 class="text-4xl font-bold">Ciao!</h1>
    <p class="text-2xl">
      I'm working at
      <a
        class="mix-blend-difference text-white"
        href="http://display.design/"
        target="_blank"
        rel="noopener noreferrer"
      >
        display.design
      </a>
      as front-end developer.
    </p>
    <canvas class="w-full h-full absolute left-0 top-0 -z-10" ref="canvasRef" />
  </div>
</template>
