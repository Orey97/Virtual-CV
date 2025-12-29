/**
 * ============================================
 * ARSENAL COSMOS — HIGH-FIDELITY BACKGROUND
 * Cinematic, fixed-scale, research-grade visualization
 * ============================================
 */

class ArsenalCosmos {
    constructor() {
        this.container = document.querySelector('.arsenal-bg');
        if (!this.container) {
            console.error('ArsenalCosmos: .arsenal-bg not found');
            return;
        }

        // Configuration
        this.config = {
            starCount: 2000,
            simSpeed: 0.2, // Global time multiplier
            cameraZ: 65,   // Fixed distance, slightly further for vastness
            fov: 28        // Cinematic narrow FOV
        };

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        // Scene Objects
        this.sun = null;
        this.orbitSystem = new THREE.Group(); // Container for all orbits
        this.starSystem = null;
        this.orbitGroups = []; // To track for precession
        
        // State
        this.isRunning = true;
        this.mouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.setupScene();
        
        this.createSun();
        this.createPlanets(); // Re-engineered for precession
        this.createStarfield();
        this.createAmbientDust();

        // Scene Graph Organization
        this.scene.add(this.orbitSystem);

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        // Visibility API to pause performance when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.pause();
            else if (this.isVisible) this.resume();
        });

        // Intersection Observer to pause when scrolled away
        this.isVisible = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
                if (this.isVisible && !document.hidden) {
                    this.resume();
                } else {
                    this.pause();
                }
            });
        }, { threshold: 0 });
        
        observer.observe(this.container);

        // 4. Start Loop
        // Initial check triggers observer, or we start if assumed visible
        // We'll let observer handle the start

        console.log("ArsenalCosmos: Initialized (Orbital Mechanics v2)");
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#030508'); 
        this.scene.fog = new THREE.FogExp2(0x030508, 0.02);

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera = new THREE.PerspectiveCamera(this.config.fov, width / height, 0.1, 1000);
        this.camera.position.z = this.config.cameraZ;
        this.camera.position.y = 12; // High angle observatory view
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        if (this.container.firstChild) {
            this.container.insertBefore(this.renderer.domElement, this.container.firstChild);
        } else {
            this.container.appendChild(this.renderer.domElement);
        }
    }

    createSun() {
        // Central Star - The anchor
        const geometry = new THREE.SphereGeometry(2.5, 64, 64);
        const material = new THREE.MeshBasicMaterial({
            color: 0xfff5e0, // Solar white
        });
        this.sun = new THREE.Mesh(geometry, material);
        
        // CORONA (Glow)
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: this.createGlowTexture(0xffaa44), 
            color: 0xffaa44, 
            transparent: true, 
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Sprite(spriteMaterial);
        glow.scale.set(15, 15, 1);
        this.sun.add(glow);

        // Core Shine
        const coreGlowMat = new THREE.SpriteMaterial({
            map: this.createGlowTexture(0xffffff),
            color: 0xffffff,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        const coreGlow = new THREE.Sprite(coreGlowMat);
        coreGlow.scale.set(6, 6, 1);
        this.sun.add(coreGlow);

        this.scene.add(this.sun);
    }

    createPlanets() {
        const planetData = [
            { r: 10, s: 0.5, c: 0x3b82f6, speed: 0.8, ecc: 0.9, inc: 0.05 }, // Data
            { r: 16, s: 0.8, c: 0x8b5cf6, speed: 0.5, ecc: 0.85, inc: -0.08 }, // Model
            { r: 24, s: 1.1, c: 0x10b981, speed: 0.3, ecc: 0.95, inc: 0.12 }, // Synth
            { r: 34, s: 0.4, c: 0xf43f5e, speed: 0.15, ecc: 0.8, inc: -0.04 } // Deploy
        ];

        planetData.forEach((data, i) => {
            // HIERARCHY: OrbitGroup (Precession) -> [Planet, Trail]
            const orbitGroup = new THREE.Group();
            
            // Randomize visual inclination slightly
            orbitGroup.rotation.z = data.inc;
            orbitGroup.rotation.x = Math.PI / 2; // Lay flat on basic plane
            
            // Precession speed (very slow rotation of the entire orbit)
            orbitGroup.userData = {
                precessionSpeed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1)
            };

            // 1. Visual Orbit Path
            const curve = new THREE.EllipseCurve(
                0, 0,
                data.r, data.r * data.ecc,
                0, 2 * Math.PI,
                false, 0
            );
            const pts = curve.getPoints(100);
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.05, transparent: true });
            const orbitLine = new THREE.Line(geo, mat);
            orbitGroup.add(orbitLine);

            // 2. Planet Logic
            const pGeo = new THREE.SphereGeometry(data.s, 16, 16);
            const pMat = new THREE.MeshStandardMaterial({
                color: data.c,
                emissive: data.c,
                emissiveIntensity: 0.2,
                roughness: 0.4
            });
            const planet = new THREE.Mesh(pGeo, pMat);
            
            // State for orbital position
            planet.userData = {
                angle: Math.random() * Math.PI * 2,
                speed: data.speed,
                radiusX: data.r,
                radiusY: data.r * data.ecc
            };
            
            orbitGroup.add(planet);

            // Add to systems
            this.orbitSystem.add(orbitGroup);
            this.orbitGroups.push({ group: orbitGroup, planet: planet });
        });

        // Sun light
        const light = new THREE.PointLight(0xffffff, 2, 100);
        this.scene.add(light);
    }

    createStarfield() {
        const geo = new THREE.BufferGeometry();
        const pos = [];
        const sizes = [];
        const cols = [];

        const colorPalette = [
            new THREE.Color('#88ccff'),
            new THREE.Color('#ffffff'),
            new THREE.Color('#ccccff') 
        ];

        for(let i=0; i<this.config.starCount; i++) {
            // Cylindrical distribution
            const r = 20 + Math.random() * 100; // Keep area near sun clear
            const theta = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 60;
            
            pos.push(r * Math.cos(theta), y, r * Math.sin(theta));
            sizes.push(Math.random() * 0.4);
            
            const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            cols.push(c.r, c.g, c.b);
        }

        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));

        const mat = new THREE.PointsMaterial({
            vertexColors: true,
            size: 0.5,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true
        });

        this.starSystem = new THREE.Points(geo, mat);
        this.scene.add(this.starSystem);
    }

    createAmbientDust() {
        // Subtle fog-like particles
    }

    createGlowTexture(colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        
        const col = new THREE.Color(colorHex);
        const r = Math.floor(col.r * 255);
        const g = Math.floor(col.g * 255);
        const b = Math.floor(col.b * 255);

        grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},0.2)`);
        grad.addColorStop(1, `rgba(0,0,0,0)`);
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(canvas);
    }

    onResize() {
        if (!this.camera || !this.renderer) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    onMouseMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 - 1;
    }

    pause() { this.isRunning = false; }
    resume() { 
        if (!this.isRunning) {
            this.isRunning = true; 
            this.animate();
        }
    }

    animate() {
        if (!this.isRunning) return;
        requestAnimationFrame(() => this.animate());

        const dt = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // 1. Sun Rotation
        if (this.sun) this.sun.rotation.y = time * 0.05;

        // 2. Orbital Dynamics
        this.orbitGroups.forEach(obj => {
            const { group, planet } = obj;
            
            // Precession (Rotate the whole orbit plane slowly)
            // Rotate around Z axis (which is vertical in local frame before we rotated X=90)
            // But we rotated X=90... so local Z is World Y?
            // Actually, we rotate around the Z axis of the Group to spin the ellipse on its flat face.
            group.rotation.z += group.userData.precessionSpeed * dt;

            // Planet Revolution (Move along the ellipse)
            planet.userData.angle += planet.userData.speed * dt * this.config.simSpeed;
            const a = planet.userData.angle;
            
            planet.position.x = Math.cos(a) * planet.userData.radiusX;
            planet.position.y = Math.sin(a) * planet.userData.radiusY; 
            // Note: In the group's local space (rotated X=90), 'y' is the other ellipse axis. 'z' is up/down relative to orbit plane.
            // Wait, EllipseCurve creates on XY plane.
            // So planet.position.y is correct for the ellipse width.
            // z is height.
            
            // Add slight bobbing
            planet.position.z = Math.sin(time + planet.userData.radiusX) * 0.5; 
        });

        // 3. Camera Observatory Motion (Parallax)
        // Damped mouse follow
        this.targetRotation.x += (this.mouse.x * 0.5 - this.targetRotation.x) * 0.02;
        this.targetRotation.y += (this.mouse.y * 0.2 - this.targetRotation.y) * 0.02;

        const maxRot = 0.05; // RADIANS (~3 degrees) - Very strict
        const currX = THREE.MathUtils.clamp(this.targetRotation.x, -maxRot, maxRot);
        const currY = THREE.MathUtils.clamp(this.targetRotation.y, -maxRot, maxRot);

        // Apply rotation to camera group equivalent effect
        // We move camera slightly on X/Y plane
        this.camera.position.x = currX * 10; 
        this.camera.position.y = 12 + currY * 5;
        this.camera.lookAt(0, 0, 0);

        // 4. Starfield Drift (Veeeery slow rotation)
        if (this.starSystem) {
            this.starSystem.rotation.y = time * 0.01;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.arsenal-bg')) {
        window.ArsenalCosmosInstance = new ArsenalCosmos();
    }
});
