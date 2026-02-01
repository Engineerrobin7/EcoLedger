import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { useMotionValue, useSpring, motion } from 'framer-motion';

export default function Globe({ className }) {
    const canvasRef = useRef();
    const pointerInteracting = useRef(null);
    const pointerInteractionMovement = useRef(0);
    const r = useMotionValue(0);
    const rs = useSpring(r, { mass: 1, damping: 50, stiffness: 280 });

    useEffect(() => {
        let phi = 0;
        let width = 0;
        const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth);
        window.addEventListener('resize', onResize);
        onResize();
        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: width * 2,
            height: width * 2,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.3, 0.3, 0.3],
            markerColor: [0.1, 0.8, 0.5], // Primary green
            glowColor: [0.1, 0.8, 0.5],
            markers: [
                { location: [37.7595, -122.4367], size: 0.03 },
                { location: [40.7128, -74.0060], size: 0.1 },
                { location: [51.5074, -0.1278], size: 0.05 },
                { location: [35.6762, 139.6503], size: 0.08 },
                { location: [12.9716, 77.5946], size: 0.08 }
            ],
            onRender: (state) => {
                if (!pointerInteracting.current) {
                    phi += 0.005;
                }
                state.phi = phi + r.get();
                state.width = width * 2;
                state.height = width * 2;
            }
        });
        setTimeout(() => (canvasRef.current.style.opacity = '1'));
        return () => globe.destroy();
    }, []);

    return (
        <div style={{
            width: '100%',
            maxWidth: 600,
            aspectRatio: 1,
            margin: 'auto',
            position: 'relative',
        }}>
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    contain: 'layout paint size',
                    opacity: 0,
                    transition: 'opacity 1s ease',
                }}
                onPointerDown={(e) => {
                    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
                    canvasRef.current.style.cursor = 'grabbing';
                }}
                onPointerUp={() => {
                    pointerInteracting.current = null;
                    canvasRef.current.style.cursor = 'grab';
                }}
                onPointerOut={() => {
                    pointerInteracting.current = null;
                    canvasRef.current.style.cursor = 'grab';
                }}
                onMouseMove={(e) => {
                    if (pointerInteracting.current !== null) {
                        const delta = e.clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = delta;
                        r.set(delta / 200);
                    }
                }}
                onTouchMove={(e) => {
                    if (pointerInteracting.current !== null && e.touches[0]) {
                        const delta = e.touches[0].clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = delta;
                        r.set(delta / 100);
                    }
                }}
            />
        </div>
    );
}
