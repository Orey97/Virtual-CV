/**
 * ============================================
 * GLOBAL SOLAR SYSTEM ENGINE
 * High-Fidelity 3D Background for Renaldo.ai
 * ============================================
 */

class SolarSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'global-cosmos';
        Object.assign(this.container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '-10',
            pointerEvents: 'none',
            background: 'radial-gradient(circle at center, #0B1026 0%, #000000 100%)' // Fallback/Blend
        });
        document.body.prepend(this.container);

        // Core
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        // Objects
        this.sun = null;
        this.planets = [];
        this.orbits = [];
        this.asteroids = null;
        this.starfield = null;
        
        // Interaction
        this.mouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        this.scrollY = 0;

        this.init();
    }

    init() {
        if (typeof THREE === 'undefined') {
            console.error('Three.js not loaded');
            return;
        }

        this.setupScene();
        this.createLighting();
        this.createStarfield();
        this.createSun();
        this.createSolarSystem();
        this.createAsteroidBelt();

        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('scroll', () => this.onScroll());

        this.animate();
        console.log('Global Solar System Online');
    }

    setupScene() {
        this.scene = new THREE.Scene();
        // Fog to fade out distant stars/planets
        this.scene.fog = new THREE.FogExp2(0x000000, 0.002);

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 30, 80); // Elevated view
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

    createLighting() {
        // Sun acts as point light
        const sunlight = new THREE.PointLight(0xffffff, 2, 300);
        sunlight.position.set(0, 0, 0);
        this.scene.add(sunlight);

        // Ambient for deep shadows
        const ambient = new THREE.AmbientLight(0x404040, 0.2); // Soft shadow fill
        this.scene.add(ambient);
    }

    createStarfield() {
        const count = 5000;
        const geom = new THREE.BufferGeometry();
        const pos = [];
        const colors = [];
        const colorPalette = [0xffffff, 0xaaccff, 0xffccaa];

        for(let i=0; i<count; i++) {
            const r = 200 + Math.random() * 800; // Far field
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            
            pos.push(x, y, z);
            
            const c = new THREE.Color(colorPalette[Math.floor(Math.random()*3)]);
            colors.push(c.r, c.g, c.b);
        }

        geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        this.starfield = new THREE.Points(geom, mat);
        this.scene.add(this.starfield);
    }

    createSun() {
        // Visual Mesh
        const geom = new THREE.SphereGeometry(4, 64, 64);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffddaa });
        this.sun = new THREE.Mesh(geom, mat);
        
        // Glow Sprite (Corona)
        const spriteMat = new THREE.SpriteMaterial({ 
            map: this.makeGlowTexture(), 
            color: 0xffaa00, 
            transparent: true, 
            opacity: 0.7,
            blending: THREE.AdditiveBlending 
        });
        const glow = new THREE.Sprite(spriteMat);
        glow.scale.set(25, 25, 1);
        this.sun.add(glow);

        // Outer Haze
        const hazeMat = new THREE.SpriteMaterial({ 
            map: this.makeGlowTexture(), 
            color: 0xff4400, 
            transparent: true, 
            opacity: 0.3,
            blending: THREE.AdditiveBlending 
        });
        const haze = new THREE.Sprite(hazeMat);
        haze.scale.set(40, 40, 1);
        this.sun.add(haze);

        this.scene.add(this.sun);
    }

    createSolarSystem() {
        const planets = [
            { name: 'Mercury', r: 0.8, dist: 10, speed: 1.5, color: 0xa0a0a0 },
            { name: 'Venus',   r: 1.2, dist: 16, speed: 1.2, color: 0xe3bb76 },
            { name: 'Earth',   r: 1.3, dist: 24, speed: 1.0, color: 0x2233ff },
            { name: 'Mars',    r: 1.0, dist: 32, speed: 0.8, color: 0xff3300 },
            { name: 'Jupiter', r: 2.8, dist: 48, speed: 0.4, color: 0xdcae96 },
            { name: 'Saturn',  r: 2.4, dist: 64, speed: 0.3, color: 0xf5dfa1, ring: true },
            { name: 'Uranus',  r: 1.8, dist: 80, speed: 0.2, color: 0x99ffff },
            { name: 'Neptune', r: 1.7, dist: 95, speed: 0.1, color: 0x3333ff }
        ];

        planets.forEach(p => {
            // Group for orbit rotation (independent of planet spin)
            const orbitGroup = new THREE.Group();
            
            // 1. Orbit Path (Visual)
            const orbitCurve = new THREE.EllipseCurve(0, 0, p.dist, p.dist, 0, 2 * Math.PI, false, 0);
            const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitCurve.getPoints(128));
            const orbitMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 });
            const orbit = new THREE.Line(orbitGeom, orbitMat);
            orbit.rotation.x = Math.PI / 2;
            this.scene.add(orbit);

            // 2. Planet Mesh
            const pGeom = new THREE.SphereGeometry(p.r, 32, 32);
            const pMat = new THREE.MeshStandardMaterial({
                color: p.color,
                roughness: 0.7,
                metalness: 0.2
            });
            const mesh = new THREE.Mesh(pGeom, pMat);
            
            // Initial Pos
            const startAngle = Math.random() * Math.PI * 2;
            mesh.userData = { angle: startAngle, dist: p.dist, speed: p.speed, rotSpeed: Math.random() * 0.02 };
            
            // Saturn Ring ?
            if(p.ring) {
                const rGeom = new THREE.RingGeometry(p.r * 1.4, p.r * 2.2, 64);
                const rMat = new THREE.MeshBasicMaterial({ color: 0xcfb987, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
                const ring = new THREE.Mesh(rGeom, rMat);
                ring.rotation.x = Math.PI / 2;
                ring.rotation.y = 0.2; // Tilt
                mesh.add(ring);
            }

            this.scene.add(mesh);
            this.planets.push(mesh);
        });
    }

    createAsteroidBelt() {
        const count = 800;
        const geom = new THREE.InstancedMesh(
            new THREE.SphereGeometry(0.15, 4, 4),
            new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 }),
            count
        );

        const dummy = new THREE.Object3D();
        for(let i=0; i<count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 36 + Math.random() * 8; // Between Mars and Jupiter
            const y = (Math.random() - 0.5) * 2;
            
            dummy.position.set(
                Math.cos(angle) * dist,
                y,
                Math.sin(angle) * dist
            );
            dummy.scale.setScalar(0.5 + Math.random());
            dummy.rotation.set(Math.random(), Math.random(), Math.random());
            dummy.updateMatrix();
            geom.setMatrixAt(i, dummy.matrix);
        }
        
        this.asteroids = geom;
        this.scene.add(geom);
    }

    makeGlowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
        return new THREE.CanvasTexture(canvas);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    onScroll() {
        this.scrollY = window.scrollY;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // 1. Sun Rotation
        if(this.sun) this.sun.rotation.y = time * 0.05;

        // 2. Planets Orbit
        this.planets.forEach(p => {
            p.userData.angle += p.userData.speed * 0.1 * dt; // Scale speed down
            const { angle, dist } = p.userData;
            p.position.x = Math.cos(angle) * dist;
            p.position.z = Math.sin(angle) * dist;
            p.rotation.y += p.userData.rotSpeed; // Self rotation
        });

        // 3. Asteroid Belt Rotation
        if(this.asteroids) {
            this.asteroids.rotation.y += 0.02 * dt;
        }

        // 4. Camera Dynamics (The "Cool" interaction)
        // Mouse creates parallax tilt, Scroll moves camera down/forward slightly
        
        const scrollOffset = this.scrollY * 0.02; 
        
        // Target Camera position
        // We want to feel like we are descending or panning as we scroll
        const baseX = 0;
        const baseY = 30 + scrollOffset * 0.5; // Actually moving UP or varying Y
        const baseZ = 80 - scrollOffset; // Zooming IN slightly on scroll? Or moving along Z?
        
        // Mouse Influence
        const targetX = baseX + this.mouse.x * 5;
        const targetY = baseY + this.mouse.y * 5;
        
        // Smooth damp
        this.camera.position.x += (targetX - this.camera.position.x) * 0.05;
        this.camera.position.y += (targetY - this.camera.position.y) * 0.05;
        this.camera.position.z += (baseZ - this.camera.position.z) * 0.05;

        // Always look at center (Sun)
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }
}

// Auto-boot
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    new SolarSystem();
} else {
    document.addEventListener('DOMContentLoaded', () => new SolarSystem());
}
