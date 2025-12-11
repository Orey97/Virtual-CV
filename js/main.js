/**
 * ============================================
 * RENALDO.AI — SUPREME INTERACTIVE ENGINE
 * Premium Portfolio Experience
 * ============================================
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    colors: {
        primary: '#3b82f6',
        accent: '#06b6d4',
        purple: '#8b5cf6',
        success: '#10b981'
    },
    motion: {
        fast: 150,
        normal: 300,
        slow: 500,
        slower: 800
    }
};

// ============================================
// STATE MANAGEMENT
// ============================================
const State = {
    depth: 1,
    xp: 0,
    explored: new Set(),
    scrollY: 0,
    mouseX: 0,
    mouseY: 0,
    
    addXP(amount, reason = '') {
        this.xp += amount;
        this.updateDepth();
        UI.updateProgress();
        if (reason) UI.showToast('Insight Acquired', reason);
    },
    
    updateDepth() {
        const newDepth = Math.floor(this.xp / 150) + 1;
        if (newDepth > this.depth) {
            this.depth = newDepth;
            UI.updateDepth(newDepth);
            UI.showToast('System Upgrade', `Neural Depth Level ${newDepth}`);
        }
    }
};

// ============================================
// UI CONTROLLER
// ============================================
const UI = {
    init() {
        this.scrollIndicator = document.getElementById('scroll-indicator');
        this.depthProgress = document.getElementById('depth-progress');
        this.depthValue = document.getElementById('depth-value');
        this.toast = document.getElementById('achievement-toast');
    },
    
    updateProgress() {
        if (!this.scrollIndicator) return;
        const percent = (State.xp % 150) / 150 * 100;
        this.scrollIndicator.style.width = `${percent}%`;
    },
    
    updateDepth(depth) {
        if (!this.depthValue) return;
        this.depthValue.textContent = depth;
        
        // Animate ring
        if (this.depthProgress) {
            const offset = 100 - (State.xp % 150) / 150 * 100;
            this.depthProgress.style.strokeDashoffset = offset;
        }
    },
    
    showToast(title, desc) {
        if (!this.toast) return;
        document.getElementById('toast-title').textContent = title;
        document.getElementById('toast-desc').textContent = desc;
        
        this.toast.classList.add('show');
        setTimeout(() => this.toast.classList.remove('show'), 3000);
    }
};

// ============================================
// THREE.JS COSMOS (Hero 3D Scene)
// ============================================
class HeroCosmos {
    constructor() {
        this.container = document.getElementById('hero-cosmos');
        if (!this.container || typeof THREE === 'undefined') return;
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        this.particles = null;
        this.orbitals = [];
        this.time = 0;
        
        this.init();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        
        // Camera position
        this.camera.position.set(0, 0, 8);
        
        // Create particle field
        this.createParticleField();
        
        // Create orbital rings
        this.createOrbitals();
        
        // Start animation
        this.animate();
        
        // Event listeners
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }
    
    createParticleField() {
        const geometry = new THREE.BufferGeometry();
        const count = 3000;
        
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Sphere distribution with bias towards center
            const radius = 4 + Math.random() * 4;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Color gradient (blue to cyan)
            const t = Math.random();
            colors[i3] = 0.23 + t * 0.02;     // R
            colors[i3 + 1] = 0.51 + t * 0.2;  // G
            colors[i3 + 2] = 0.96;             // B
            
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    createOrbitals() {
        const orbitRadii = [2.5, 3.5, 4.5];
        
        orbitRadii.forEach((radius, idx) => {
            // Create orbit ring
            const ringGeometry = new THREE.RingGeometry(radius - 0.01, radius + 0.01, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0x3b82f6,
                transparent: true,
                opacity: 0.1 + idx * 0.05,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2 + (idx * 0.2);
            this.scene.add(ring);
            
            // Create orbital node
            const nodeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
            const nodeMaterial = new THREE.MeshBasicMaterial({
                color: idx === 0 ? 0x3b82f6 : idx === 1 ? 0x06b6d4 : 0x8b5cf6
            });
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.userData = { radius, speed: 0.3 + idx * 0.1, offset: idx * 2 };
            this.orbitals.push(node);
            this.scene.add(node);
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.01;
        
        // Rotate particle field
        if (this.particles) {
            this.particles.rotation.y += 0.0003;
            this.particles.rotation.x = Math.sin(this.time * 0.1) * 0.1;
        }
        
        // Animate orbital nodes
        this.orbitals.forEach(node => {
            const { radius, speed, offset } = node.userData;
            const angle = this.time * speed + offset;
            node.position.x = Math.cos(angle) * radius;
            node.position.z = Math.sin(angle) * radius;
            node.position.y = Math.sin(angle * 2) * 0.5;
        });
        
        // Camera subtle movement
        this.camera.position.x = Math.sin(this.time * 0.2) * 0.3;
        this.camera.position.y = Math.cos(this.time * 0.15) * 0.2;
        this.camera.lookAt(0, 0, 0);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onMouseMove(e) {
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        
        // Subtle camera shift based on mouse
        this.camera.position.x += (mouseX * 0.5 - this.camera.position.x) * 0.02;
        this.camera.position.y += (mouseY * 0.3 - this.camera.position.y) * 0.02;
    }
}

// ============================================
// NEURAL FIELD (Background Canvas)
// ============================================
class NeuralField {
    constructor() {
        this.canvas = document.getElementById('neural-field');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.width = 0;
        this.height = 0;
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createNodes();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    
    createNodes() {
        const count = Math.min(80, Math.floor(this.width / 25));
        this.nodes = [];
        
        for (let i = 0; i < count; i++) {
            this.nodes.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 2 + 1,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        const time = Date.now() * 0.001;
        
        // Update and draw nodes
        this.nodes.forEach((node, i) => {
            // Update position
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce off edges
            if (node.x < 0 || node.x > this.width) node.vx *= -1;
            if (node.y < 0 || node.y > this.height) node.vy *= -1;
            
            // Keep in bounds
            node.x = Math.max(0, Math.min(this.width, node.x));
            node.y = Math.max(0, Math.min(this.height, node.y));
            
            // Pulse effect
            const pulse = Math.sin(time * 2 + node.pulseOffset) * 0.3 + 0.7;
            
            // Draw node
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(59, 130, 246, ${0.4 * pulse})`;
            this.ctx.fill();
            
            // Draw connections
            for (let j = i + 1; j < this.nodes.length; j++) {
                const other = this.nodes[j];
                const dx = node.x - other.x;
                const dy = node.y - other.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    const opacity = (1 - dist / 150) * 0.15;
                    this.ctx.beginPath();
                    this.ctx.moveTo(node.x, node.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// CURSOR GLOW
// ============================================
class CursorGlow {
    constructor() {
        this.glow = document.getElementById('cursor-glow');
        if (!this.glow) return;
        
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        this.init();
    }
    
    init() {
        document.addEventListener('mousemove', (e) => {
            this.targetX = e.clientX;
            this.targetY = e.clientY;
        });
        
        this.animate();
    }
    
    animate() {
        // Smooth follow
        this.x += (this.targetX - this.x) * 0.1;
        this.y += (this.targetY - this.y) * 0.1;
        
        this.glow.style.left = `${this.x}px`;
        this.glow.style.top = `${this.y}px`;
        
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
class ScrollAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        // Navigation scroll indicator
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const percent = (scrolled / maxScroll) * 100;
            
            const indicator = document.getElementById('scroll-indicator');
            if (indicator) indicator.style.width = `${percent}%`;
            
            // Nav background
            const nav = document.getElementById('nav-header');
            if (nav) nav.classList.toggle('scrolled', scrolled > 50);
        });
        
        // Intersection Observer for reveals
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        
                        // Track exploration
                        const section = entry.target.closest('section');
                        if (section && !State.explored.has(section.id)) {
                            State.explored.add(section.id);
                            State.addXP(25, `Explored ${section.id}`);
                        }
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        
        document.querySelectorAll('[data-reveal]').forEach(el => {
            revealObserver.observe(el);
        });
        
        // Skill bar animation
        const barObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const fills = entry.target.querySelectorAll('.bar-fill');
                        fills.forEach(fill => {
                            const width = fill.dataset.width;
                            setTimeout(() => {
                                fill.style.width = `${width}%`;
                            }, 200);
                        });
                    }
                });
            },
            { threshold: 0.3 }
        );
        
        document.querySelectorAll('.skill-detail').forEach(el => {
            barObserver.observe(el);
        });
        
        // Arc animation
        const arcObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.querySelectorAll('.arc-fill').forEach(arc => {
                            const value = parseInt(arc.dataset.value);
                            const circumference = 2 * Math.PI * 45;
                            const offset = circumference - (value / 100) * circumference;
                            arc.style.strokeDashoffset = offset;
                        });
                    }
                });
            },
            { threshold: 0.5 }
        );
        
        document.querySelectorAll('.hero-dashboard').forEach(el => {
            arcObserver.observe(el);
        });
    }
}

// ============================================
// COUNTER ANIMATION
// ============================================
class CounterAnimation {
    constructor() {
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateCounters(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );
        
        document.querySelectorAll('.hero-dashboard').forEach(el => {
            observer.observe(el);
        });
    }
    
    animateCounters(container) {
        container.querySelectorAll('[data-count]').forEach(counter => {
            const target = parseFloat(counter.dataset.count);
            const isDecimal = target % 1 !== 0;
            const duration = 2000;
            const start = performance.now();
            
            const animate = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = target * eased;
                
                counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    counter.textContent = isDecimal ? target.toFixed(1) : target;
                }
            };
            
            requestAnimationFrame(animate);
        });
    }
}

// ============================================
// NAVIGATION
// ============================================
class Navigation {
    constructor() {
        this.init();
    }
    
    init() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('section[id]');
        
        // Smooth scroll
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Active state on scroll
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        navItems.forEach(item => {
                            item.classList.toggle('active', item.getAttribute('href') === `#${id}`);
                        });
                    }
                });
            },
            { threshold: 0.3 }
        );
        
        sections.forEach(section => observer.observe(section));
    }
}

// ============================================
// TILT EFFECT
// ============================================
class TiltEffect {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('[data-tilt]').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });
            
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        });
    }
}

// ============================================
// QUIZ SYSTEM
// ============================================
class QuizSystem {
    constructor() {
        this.questions = [
            {
                q: "What loss function is optimal for binary classification?",
                opts: ["Mean Squared Error", "Binary Cross-Entropy", "Hinge Loss", "Mean Absolute Error"],
                answer: 1
            },
            {
                q: "What is the primary purpose of regularization?",
                opts: ["Increase model bias", "Prevent overfitting", "Speed up training", "Normalize input data"],
                answer: 1
            },
            {
                q: "Which metric is most appropriate for imbalanced datasets?",
                opts: ["Accuracy", "F1-Score", "MSE", "R-Squared"],
                answer: 1
            }
        ];
        this.current = 0;
        this.score = 0;
        
        this.init();
    }
    
    init() {
        const startBtn = document.getElementById('start-quiz');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }
    }
    
    start() {
        this.current = 0;
        this.score = 0;
        this.renderQuestion();
    }
    
    renderQuestion() {
        const container = document.getElementById('quiz-container');
        const prompt = document.getElementById('quiz-prompt');
        const options = document.getElementById('quiz-options');
        
        if (this.current >= this.questions.length) {
            this.showResults();
            return;
        }
        
        const q = this.questions[this.current];
        prompt.textContent = q.q;
        
        options.innerHTML = q.opts.map((opt, i) => 
            `<button class="quiz-btn" data-idx="${i}">>> ${opt}</button>`
        ).join('');
        
        options.querySelectorAll('.quiz-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.checkAnswer(parseInt(e.target.dataset.idx)));
        });
    }
    
    checkAnswer(idx) {
        const q = this.questions[this.current];
        const correct = idx === q.answer;
        
        if (correct) {
            this.score++;
            State.addXP(50, 'Correct Answer!');
        }
        
        this.current++;
        setTimeout(() => this.renderQuestion(), 500);
    }
    
    showResults() {
        const container = document.getElementById('quiz-container');
        const prompt = document.getElementById('quiz-prompt');
        const options = document.getElementById('quiz-options');
        
        const percent = Math.round((this.score / this.questions.length) * 100);
        
        prompt.innerHTML = `Protocol Complete: ${percent}% Accuracy`;
        options.innerHTML = `
            <div style="color: var(--c-text-muted); margin-bottom: 1rem;">
                Score: ${this.score}/${this.questions.length}
            </div>
            <button class="quiz-btn" id="restart-quiz">REINITIALIZE</button>
        `;
        
        document.getElementById('restart-quiz').addEventListener('click', () => this.start());
        
        if (percent === 100) {
            State.addXP(100, 'Perfect Score Achievement!');
        }
    }
}

// ============================================
// SKILL NODES INTERACTION
// ============================================
class SkillNodes {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('.skill-node').forEach(node => {
            node.addEventListener('click', () => {
                const skill = node.dataset.skill;
                if (!State.explored.has(`skill-${skill}`)) {
                    State.explored.add(`skill-${skill}`);
                    State.addXP(15, `Explored ${skill}`);
                }
            });
        });
    }
}

// ============================================
// PROJECT CARDS INTERACTION
// ============================================
class ProjectCards {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', () => {
                const project = card.dataset.project;
                if (!State.explored.has(`project-${project}`)) {
                    State.explored.add(`project-${project}`);
                    State.addXP(30, `Analyzed ${project} project`);
                }
            });
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    UI.init();
    
    // Initialize systems
    new NeuralField();
    new CursorGlow();
    new ScrollAnimations();
    new CounterAnimation();
    new Navigation();
    new TiltEffect();
    new QuizSystem();
    new SkillNodes();
    new ProjectCards();
    
    // Initialize Three.js cosmos
    if (typeof THREE !== 'undefined') {
        new HeroCosmos();
    }
    
    // Add reveal class for CSS animations
    document.querySelectorAll('[data-reveal]').forEach((el, i) => {
        el.style.transitionDelay = `${i * 50}ms`;
    });
    
    console.log('%c RENALDO.AI ', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
    console.log('%c Neural Interface Initialized ', 'color: #06b6d4;');
});

// ============================================
// PERFORMANCE: Pause animations when tab not visible
// ============================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Could pause expensive animations here
    }
});
