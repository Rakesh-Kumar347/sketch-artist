"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/useMediaQuery";

// Inline vertex shader
const vertexShader = `
  uniform float uTime;
  uniform float uStrength;
  varying vec3 vNormal;
  varying vec3 vPosition;

  vec3 mod289v3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289v4(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289v4(((x*34.0)+10.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289v3(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vNormal = normal;
    vPosition = position;
    float noise = snoise(position * 0.9 + vec3(uTime * 0.25, uTime * 0.18, uTime * 0.12));
    vec3 displaced = position + normal * noise * uStrength;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    float fresnel = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 2.5);
    float t = uTime * 0.35;
    float wave = sin(vPosition.x * 3.2 + t) * cos(vPosition.y * 2.1 + t * 0.7) * 0.5 + 0.5;

    vec3 goldColor = vec3(0.788, 0.663, 0.431);
    vec3 roseColor = vec3(0.831, 0.647, 0.647);
    vec3 darkColor = vec3(0.04, 0.032, 0.028);

    vec3 color = mix(darkColor, goldColor, fresnel * wave);
    color = mix(color, roseColor, fresnel * (1.0 - wave) * 0.55);

    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.6));
    float spec = pow(max(dot(normal, lightDir), 0.0), 48.0) * 0.9;
    color += vec3(spec * 0.95, spec * 0.82, spec * 0.5);
    color += goldColor * fresnel * 0.35;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function Sculpture({ mouseXRef, mouseYRef }: { mouseXRef: React.MutableRefObject<number>; mouseYRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uStrength: { value: 0.22 },
  }), []);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    meshRef.current.rotation.y += (mouseXRef.current * 0.8 - meshRef.current.rotation.y) * 0.05;
    meshRef.current.rotation.x += (mouseYRef.current * 0.5 - meshRef.current.rotation.x) * 0.05;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={meshRef} scale={2.2}>
        <icosahedronGeometry args={[1, 4]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
    </Float>
  );
}

export default function HeroCanvas() {
  const isMobile = useIsMobile();
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);

  return (
    <div
      className="absolute inset-0"
      onMouseMove={(e) => {
        mouseXRef.current = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseYRef.current = -(e.clientY / window.innerHeight - 0.5) * 2;
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, isMobile ? 1.5 : 2]}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[5, 5, 5]} color="#c9a96e" intensity={2} />
        <pointLight position={[-5, -3, -5]} color="#6e4fc9" intensity={1.5} />
        <Environment preset="night" />

        <Sculpture mouseXRef={mouseXRef} mouseYRef={mouseYRef} />

        <EffectComposer>
          <Bloom intensity={isMobile ? 0.5 : 1.2} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
          <Vignette offset={0.3} darkness={0.8} blendFunction={BlendFunction.NORMAL} />
          <Noise opacity={0.04} blendFunction={BlendFunction.ADD} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
