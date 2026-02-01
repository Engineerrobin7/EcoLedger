import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';

function AnimatedSphere() {
    const meshRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.x = time / 4;
            meshRef.current.rotation.y = time / 4;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <Sphere ref={meshRef} args={[1, 64, 64]}>
                <MeshDistortMaterial
                    color="#10b981"
                    speed={3}
                    distort={0.4}
                    radius={1}
                    emissive="#065f46"
                    emissiveIntensity={0.5}
                />
            </Sphere>
        </Float>
    );
}

export default function SustainabilityScene() {
    return (
        <div style={{ height: '300px', width: '300px', pointerEvents: 'none', background: 'transparent' }}>
            <Suspense fallback={<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', opacity: 0.5 }}>[3D SYSTEM INITIALIZING]</div>}>
                <Canvas
                    camera={{ position: [0, 0, 4], fov: 40 }}
                    gl={{ alpha: true, antialias: true }}
                    onCreated={({ gl }) => {
                        console.log("3D Canvas initialized");
                    }}
                    onError={(e) => console.error("3D Render Error:", e)}
                >
                    <ambientLight intensity={1} />
                    <pointLight position={[10, 10, 10]} intensity={2} />
                    <AnimatedSphere />
                </Canvas>
            </Suspense>
        </div>
    );
}
