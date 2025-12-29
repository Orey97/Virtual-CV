/**
 * ============================================
 * GLOBAL LATENT SPACE MANIFOLD
 * High-Fidelity 3D Background for Renaldo.ai
 * Inspired by Neural Networks & High-Dimensional Data
 * ============================================
 */

class LatentSpace {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'global-neural-bg';
        Object.assign(this.container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '-10',
            pointerEvents: 'none',
            background: 'linear-gradient(to bottom, #02040a, #050810)' // Deep generic dark
        });
        document.body.prepend(this.container);

        // Core
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // Objects
        this.manifold = null;

        // Interaction
        this.mouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };

        this.init();
    }

    init() {
        if (typeof THREE === 'undefined') {
            console.error('Three.js not loaded');
            return;
        }

        this.setupScene();
        this.createManifold();

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));

        this.animate();
        console.log('Global Latent Space Online');
    }

    setupScene() {
        this.scene = new THREE.Scene();
        // this.scene.fog = new THREE.FogExp2(0x02040a, 0.02); // Distance fade

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 5, 20);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
    }

    createManifold() {
        // We will use InstancedMesh for thousands of particles
        // But to make it "flowing" without CPU overhead, we need a custom shader.
        // Or we can use PointsMaterial with custom shader. Points are faster.

        const count = 8000;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const randoms = []; // For phase offset
        const colors = [];

        // Color Palette (Cyan, Violet, Rose)
        const palette = [
            new THREE.Color('#06b6d4'),
            new THREE.Color('#8b5cf6'),
            new THREE.Color('#f43f5e')
        ];

        // Create a field of points
        const spread = 40;
        for(let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * spread * 2;
            const z = (Math.random() - 0.5) * spread * 1.5; // Depth
            const y = (Math.random() - 0.5) * 10; // Height thickness

            positions.push(x, y, z);
            randoms.push(Math.random(), Math.random(), Math.random());

            // Color based on position (Gradient across the field)
            // e.g. Left = Cyan, Center = Violet, Right = Rose
            const normX = (x / spread) * 0.5 + 0.5; // 0 to 1
            const c1 = palette[0];
            const c2 = palette[1];
            const c3 = palette[2];

            let c = new THREE.Color();
            if(normX < 0.5) {
                c.lerpColors(c1, c2, normX * 2);
            } else {
                c.lerpColors(c2, c3, (normX - 0.5) * 2);
            }
            colors.push(c.r, c.g, c.b);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('aRandom', new THREE.Float32BufferAttribute(randoms, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        // Shader Material for Vertex Animation
        // This is where the "Intelligence" motion comes from
        // Sine waves + Perlin-ish noise approximation
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: this.renderer.getPixelRatio() }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uPixelRatio;
                attribute vec3 aRandom;
                attribute vec3 color;
                varying vec3 vColor;

                void main() {
                    vColor = color;
                    vec3 pos = position;

                    // Slow undulating motion
                    // A sum of sine waves to create a non-repeating "breathing" manifold

                    float time = uTime * 0.2; // Slow down

                    // Wave 1 (Large swell)
                    pos.y += sin(pos.x * 0.1 + time) * 2.0;

                    // Wave 2 (Cross ripple)
                    pos.y += cos(pos.z * 0.15 + time * 1.3) * 1.5;

                    // Wave 3 (Local detailed noise)
                    pos.y += sin(pos.x * 0.5 + pos.z * 0.5 + time * 2.0 + aRandom.x * 10.0) * 0.5;

                    // Gentle Drift
                    // pos.x += sin(time * 0.1 + aRandom.y) * 0.2;

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

                    // Size attenuation
                    gl_PointSize = (4.0 * uPixelRatio) * (20.0 / -mvPosition.z);

                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;

                void main() {
                    // Circular soft particle
                    vec2 uv = gl_PointCoord.xy - 0.5;
                    float r = length(uv);
                    if (r > 0.5) discard;

                    // Soft edge glow
                    float alpha = 1.0 - smoothstep(0.3, 0.5, r);

                    gl_FragColor = vec4(vColor, alpha * 0.8);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.manifold = new THREE.Points(geometry, material);
        this.scene.add(this.manifold);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if(this.manifold) this.manifold.material.uniforms.uPixelRatio.value = this.renderer.getPixelRatio();
    }

    onMouseMove(e) {
        // Normalize -1 to 1
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // Update uniforms
        if (this.manifold) {
            this.manifold.material.uniforms.uTime.value = time;
        }

        // Camera Parallax (Subtle)
        // We gently rotate the manifold or move the camera based on mouse
        // "Motion must be slow... never reactive in a gimmick way"
        // So we use heavy damping.

        const targetRotX = this.mouse.y * 0.05; // Max vertical tilt
        const targetRotY = this.mouse.x * 0.05; // Max horizontal tilt

        this.targetRotation.x += (targetRotX - this.targetRotation.x) * 0.02;
        this.targetRotation.y += (targetRotY - this.targetRotation.y) * 0.02;

        this.camera.rotation.x = -0.1 + this.targetRotation.x; // Slight look down + mouse
        this.camera.rotation.y = this.targetRotation.y;

        // Slow constant camera drift to imply "process"
        // this.camera.position.z = 20 + Math.sin(time * 0.1) * 2;

        this.renderer.render(this.scene, this.camera);
    }
}

// Auto-boot
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    new LatentSpace();
} else {
    document.addEventListener('DOMContentLoaded', () => new LatentSpace());
}
