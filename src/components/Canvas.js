import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const Canvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let clock = new THREE.Clock();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current.appendChild(renderer.domElement);

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

    camera.position.z = 0.3;

    window.addEventListener("resize", resizeCanvas);

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);

      material.uniforms.time.value = clock.getElapsedTime() / 0.9;
    }

    function resizeCanvas() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate();
  }, [canvasRef]);

  return <div className="canvas" ref={canvasRef}></div>;
};
