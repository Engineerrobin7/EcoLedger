import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, GradientTexture } from '@react-three/drei';

function AnimatedSphere() {
    const meshRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        meshRef.current.rotation.x = Math.cos(time / 4) / 4;
        meshRef.current.rotation.y = Math.sin(time / 4) / 4;
        meshRef.current.rotation.z = Math.sin(time / 4) / 4;
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <Sphere ref={meshRef} args={[1, 64, 64]}>
                <MeshDistortMaterial
                    color="#10b981"
                    speed={3}
                    distort={0.4}
                    radius={1}
                >
                    <GradientTexture
                        stops={[0, 1]}
                        colors={['#10b981', '#3b82f6']}
                    />
                </MeshDistortMaterial>
            </Sphere>
        </Float>
    );
}

export default function SustainabilityScene() {
    return (
        <div style={{ height: '300px', width: '100%', marginBottom: '2rem' }}>
            <Canvas camera={{ position: [0, 0, 4], fov: 40 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <AnimatedSphere />
            </Canvas>
        </div>
    );
}
