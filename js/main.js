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
    explored: new Set(),
    scrollY: 0,
    mouseX: 0,
    mouseY: 0
};

// ============================================
// UI CONTROLLER
// ============================================
const UI = {
    init() {
        this.scrollIndicator = document.getElementById('scroll-indicator');
    }
};

// ============================================
// SYSTEM LATTICE (Global Background)
// A depth-encoded signal environment.
// Represents continuous intelligence and stable reference points.
// ============================================
// ============================================
// SYSTEM LATTICE (3D Topographic Manifold & Vector Field Engine)
// Designed for Senior Machine Learning Engineer Portfolio.
// Features a 3D Topographic Elevation Surface (Loss Function Manifold),
// Vector Field Flow Streams, Soft Gravitational Cursor Deformation,
// and Depth Fog Dissolve in a Clean Light Blue Environment.
// ============================================
class SystemLattice {
    constructor() {
        this.canvas = document.getElementById('neural-field');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.gridPoints = [];
        this.particles = [];
        this.width = 0;
        this.height = 0;
        this.scrollY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        
        // 3D Perspective Camera Setup
        this.camRotX = 0.35; // Tilt camera for topographic elevation perspective
        this.camRotY = 0;
        this.targetCamRotX = 0.35;
        this.targetCamRotY = 0;
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createTopographicGrid();
        this.createVectorParticles();
        
        window.addEventListener('resize', () => this.resize());
        let tickingScroll = false;
        window.addEventListener('scroll', () => {
             if (!tickingScroll) {
                 window.requestAnimationFrame(() => {
                     this.scrollY = window.scrollY;
                     tickingScroll = false;
                 });
                 tickingScroll = true;
             }
        });

        window.addEventListener('mousemove', (e) => {
             this.targetMouseX = e.clientX;
             this.targetMouseY = e.clientY;
             this.targetCamRotY = ((e.clientX - this.width / 2) / (this.width / 2)) * 0.16;
             this.targetCamRotX = 0.35 - ((e.clientY - this.height / 2) / (this.height / 2)) * 0.12;
        });

        this.animate();
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.targetMouseX = this.width / 2;
        this.targetMouseY = this.height / 2;
        this.mouseX = this.width / 2;
        this.mouseY = this.height / 2;
        this.createTopographicGrid();
        this.createVectorParticles();
    }
    
    createTopographicGrid() {
        // High-Precision 3D Contour Wireframe Surface
        const cols = 36;
        const rows = 24;
        const spacingX = (this.width * 1.6) / cols;
        const spacingY = (this.height * 1.6) / rows;
        this.gridPoints = [];

        for (let r = 0; r <= rows; r++) {
            const rowPoints = [];
            for (let c = 0; c <= cols; c++) {
                rowPoints.push({
                    x3d: (c * spacingX) - (this.width * 0.8),
                    y3d: (r * spacingY) - (this.height * 0.8),
                    z3d: 0,
                    c: c,
                    r: r
                });
            }
            this.gridPoints.push(rowPoints);
        }
    }
    
    createVectorParticles() {
        // Vector Field Data Stream Particles
        const count = Math.min(95, Math.floor(this.width / 14));
        this.particles = [];

        const colors = [
            'rgba(6, 182, 212, ',   // Ice Cyan (#06b6d4)
            'rgba(8, 145, 178, ',   // Deep Cyan (#0891b2)
            'rgba(56, 189, 248, '   // Sky Ice (#38bdf8)
        ];

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x3d: (Math.random() - 0.5) * this.width * 1.5,
                y3d: (Math.random() - 0.5) * this.height * 1.5,
                speed: Math.random() * 0.8 + 0.4,
                size: Math.random() * 1.3 + 0.7,
                colorPrefix: colors[Math.floor(Math.random() * colors.length)],
                baseAlpha: Math.random() * 0.35 + 0.25,
                life: Math.random() * 200 + 100
            });
        }
    }

    // Mathematical Manifold Height Function Z(x, y, t)
    getManifoldHeight(x3d, y3d, time) {
        const freq1 = 0.0020;
        const freq2 = 0.0018;
        const w1 = Math.sin(x3d * freq1 + time * 0.4) * Math.cos(y3d * freq1 + time * 0.3) * 45;
        const w2 = Math.cos(x3d * freq2 - y3d * freq2 + time * 0.25) * 28;
        return w1 + w2;
    }

    project3D(x3d, y3d, z3d, parallaxY) {
        const perspective = 950;
        const cameraDistance = 750;

        const cosY = Math.cos(this.camRotY);
        const sinY = Math.sin(this.camRotY);
        const cosX = Math.cos(this.camRotX);
        const sinX = Math.sin(this.camRotX);

        // Yaw Y
        let rx = x3d * cosY - z3d * sinY;
        let rz1 = x3d * sinY + z3d * cosY;

        // Pitch X
        let ry = y3d * cosX - rz1 * sinX;
        let rzFinal = y3d * sinX + rz1 * cosX + cameraDistance;

        const scale = perspective / Math.max(100, rzFinal);
        const screenX = (this.width / 2) + (rx * scale);
        const screenY = (this.height / 2) + ((ry + parallaxY) * scale);

        return { screenX, screenY, scale, rzFinal, rx, ry };
    }
    
    animate() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.width, this.height);
        const time = Date.now() * 0.001;
        const parallaxY = -this.scrollY * 0.10;

        // Smooth Apple Physical Damping Inertia (Ease 0.045)
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.045;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.045;

        // Convert mouse screen pos to 3D center offset
        const mouse3DX = (this.mouseX - this.width / 2) * 1.2;
        const mouse3DY = (this.mouseY - this.height / 2) * 1.2;

        // 1. Calculate & Project 3D Topographic Manifold Surface
        const projectedGrid = [];
        const rows = this.gridPoints.length;
        const cols = this.gridPoints[0].length;

        for (let r = 0; r < rows; r++) {
            const projRow = [];
            for (let c = 0; c < cols; c++) {
                const pt = this.gridPoints[r][c];

                // Procedural Loss Function Elevation
                let z = this.getManifoldHeight(pt.x3d, pt.y3d, time);

                // Localized Gravitational Mouse Perturbation (Soft Gaussian)
                const distToMouse = Math.hypot(pt.x3d - mouse3DX, pt.y3d - mouse3DY);
                const mousePerturb = Math.exp(-(distToMouse * distToMouse) / (2 * 180 * 180)) * -32;
                z += mousePerturb;

                const proj = this.project3D(pt.x3d, pt.y3d, z, parallaxY);
                projRow.push(proj);
            }
            projectedGrid.push(projRow);
        }

        // 2. Render Topographic Wireframe Contour Lines
        this.ctx.lineWidth = 0.70;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const p = projectedGrid[r][c];

                // Depth Fog Attenuation Dissolving into Light Background
                const depthFog = Math.max(0.01, Math.min(0.20, (1 - p.rzFinal / 1550) * 0.22));

                // Horizontal Contour Line
                if (c < cols - 1) {
                    const pr = projectedGrid[r][c + 1];
                    this.ctx.strokeStyle = `rgba(56, 189, 248, ${depthFog})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.screenX, p.screenY);
                    this.ctx.lineTo(pr.screenX, pr.screenY);
                    this.ctx.stroke();
                }

                // Vertical Contour Line
                if (r < rows - 1) {
                    const pd = projectedGrid[r + 1][c];
                    this.ctx.strokeStyle = `rgba(8, 145, 178, ${depthFog * 0.85})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.screenX, p.screenY);
                    this.ctx.lineTo(pd.screenX, pd.screenY);
                    this.ctx.stroke();
                }
            }
        }

        // 3. Render Dynamic Vector Field Data Stream Particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Calculate gradient flow along manifold surface
            const hCenter = this.getManifoldHeight(p.x3d, p.y3d, time);
            const hRight  = this.getManifoldHeight(p.x3d + 10, p.y3d, time);
            const hDown   = this.getManifoldHeight(p.x3d, p.y3d + 10, time);

            const dx = (hRight - hCenter) * 0.05;
            const dy = (hDown - hCenter) * 0.05;

            // Stream velocity along contour orthogonal gradient
            p.x3d += (1.2 - dy) * p.speed;
            p.y3d += (0.4 + dx) * p.speed;

            if (p.x3d > this.width * 0.8) p.x3d = -this.width * 0.8;
            if (p.y3d > this.height * 0.8) p.y3d = -this.height * 0.8;

            const pZ = hCenter + 12; // Float slightly above surface
            const proj = this.project3D(p.x3d, p.y3d, pZ, parallaxY);

            const alpha = Math.max(0.05, Math.min(0.55, p.baseAlpha * (proj.scale * 0.85)));

            this.ctx.beginPath();
            this.ctx.fillStyle = p.colorPrefix + alpha + ')';
            this.ctx.arc(proj.screenX, proj.screenY, Math.max(0.5, p.size * proj.scale), 0, Math.PI * 2);
            this.ctx.fill();
        }

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
        // Navigation scroll indicator (Debounced)
        let scrollTicking = false;
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.scrollY;
                    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                    const percent = (scrolled / maxScroll) * 100;
                    
                    const indicator = document.getElementById('scroll-indicator');
                    if (indicator) indicator.style.width = `${percent}%`;
                    
                    // Nav background
                    const nav = document.getElementById('nav-header');
                    if (nav) nav.classList.toggle('scrolled', scrolled > 50);
                    
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        });
        
        // Intersection Observer for reveals
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        
                        // Track exploration (REMOVED: Automatic XP on section reveal)
                        const section = entry.target.closest('section');
                        if (section && !State.explored.has(section.id)) {
                            State.explored.add(section.id);
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
// EXECUTIVE TECHNOLOGY MATRIX
// ============================================
class TechSkillsMatrix {
    constructor() {
        this.container = document.getElementById('bento-grid');
        if (!this.container) return;

        // Domain Competency Architecture
        this.data = {
            "DATA": {
                "label": "AI & Statistical Machine Learning",
                "color": "#0891b2",
                "nodes": [
                    {
                        "id": "python", 
                        "name": "Python Core Architecture", 
                        "tags": ["AsyncIO", "Multiprocessing", "OOP Engineering"], 
                        "desc": "High-throughput runtime design. Concurrent async execution pipelines, object-oriented system design, and performant C-extension integration."
                    },
                    {
                        "id": "numpy", 
                        "name": "NumPy & Scientific Stack", 
                        "tags": ["Vectorization", "Linear Algebra", "Tensor Math"], 
                        "desc": "Vectorized linear algebra algorithms, multi-dimensional array manipulation, and memory-efficient matrix operations."
                    },
                    {
                        "id": "stats", 
                        "name": "Statistical Inference & Math", 
                        "tags": ["Bayesian Inference", "A/B Testing", "Distribution Modeling"], 
                        "desc": "Rigorous statistical modeling, hypothesis testing, confidence interval estimation, and parameter optimization in high-dimensional feature spaces."
                    },
                    {
                        "id": "scikit", 
                        "name": "Scikit-Learn & Classical ML", 
                        "tags": ["Ensembles", "Cross-Validation", "Dimensionality Reduction"], 
                        "desc": "Production estimator pipelines, automated feature scaling, PCA/t-SNE dimensionality reduction, and robust validation strategies."
                    },
                    {
                        "id": "xgboost", 
                        "name": "XGBoost & Gradient Boosting", 
                        "tags": ["Tabular Modeling", "SHAP Explainability", "Optuna HPO"], 
                        "desc": "Gradient boosted decision trees optimized for large-scale structured tabular datasets, integrated with SHAP feature interpretability."
                    }
                ]
            },
            "ML": {
                "label": "Generative AI & Deep Learning",
                "color": "#7c3aed",
                "nodes": [
                    {
                        "id": "torch", 
                        "name": "PyTorch & Deep Learning", 
                        "tags": ["Custom Layers", "Autograd", "DDP Distributed"], 
                        "desc": "Neural network architecture design, automatic differentiation, custom CUDA operator optimization, and Distributed Data Parallel (DDP) training."
                    },
                    {
                        "id": "transformer", 
                        "name": "Transformers & Fine-Tuning", 
                        "tags": ["LoRA / QLoRA", "PEFT", "FlashAttention"], 
                        "desc": "Encoder-Decoder transformer models, parameter-efficient fine-tuning (PEFT), and GGUF/AWQ quantization deployment pipelines."
                    },
                    {
                        "id": "rag", 
                        "name": "Enterprise RAG Architecture", 
                        "tags": ["Hybrid Search", "Cross-Encoders", "Query Compression"], 
                        "desc": "Production Retrieval-Augmented Generation using semantic chunking, dense-sparse hybrid vector search, and multi-stage reranking."
                    },
                    {
                        "id": "prompt", 
                        "name": "Agentic AI & LangGraph", 
                        "tags": ["Tool Invocation", "ReAct Loops", "State Machines"], 
                        "desc": "Autonomous multi-agent workflows, stateful execution graphs, deterministic fallback strategies, and tool orchestration."
                    },
                    {
                        "id": "vector", 
                        "name": "Vector Stores & Embeddings", 
                        "tags": ["Qdrant", "Pinecone", "HNSW Indexing"], 
                        "desc": "High-dimensional vector indexing, HNSW similarity graph optimization, and low-latency payload filtering."
                    }
                ]
            },
            "GENAI": {
                "label": "Data Engineering & MLOps Infrastructure",
                "color": "#2563eb",
                "nodes": [
                    {
                        "id": "sql_etl", 
                        "name": "SQL & Polars Data Pipelines", 
                        "tags": ["Polars ETL", "Complex CTEs", "Apache Arrow"], 
                        "desc": "Vectorized Polars DataFrames and analytical SQL transformations for multi-gigabyte in-memory data processing."
                    },
                    {
                        "id": "api", 
                        "name": "High-Throughput Serving & APIs", 
                        "tags": ["FastAPI", "vLLM", "Pydantic v2"], 
                        "desc": "Asynchronous REST microservices, Pydantic data validation, continuous batching with vLLM, and OpenAPI specs."
                    },
                    {
                        "id": "deploy", 
                        "name": "MLOps, Docker & CI/CD", 
                        "tags": ["Docker", "MLflow", "GitHub Actions"], 
                        "desc": "Multi-stage containerization, automated model artifact versioning with MLflow, and automated CI/CD deployment pipelines."
                    },
                    {
                        "id": "observability", 
                        "name": "Observability & Model Monitoring", 
                        "tags": ["Evidently AI", "Telemetry", "Data Quality"], 
                        "desc": "Continuous production data drift detection, feature distribution monitoring, automated assertions, and telemetry."
                    }
                ]
            }
        };

        this.init();
    }

    init() {
        this.renderGrid();
        this.setupSearchFilter();
    }

    setupSearchFilter() {
        const searchInput = document.getElementById('skill-search-input');
        const clearBtn = document.getElementById('skill-search-clear');
        const searchWrapper = document.querySelector('.skills-search-wrapper');

        if (!searchInput) return;

        const handleFilter = (query) => {
            const trimmed = query.trim().toLowerCase();
            const cards = document.querySelectorAll('.tech-skill-card');

            if (trimmed === '') {
                if (searchWrapper) searchWrapper.classList.remove('has-value');
                cards.forEach(c => c.classList.remove('search-matched', 'dimmed'));
                return;
            }

            if (searchWrapper) searchWrapper.classList.add('has-value');

            cards.forEach(c => {
                const name = (c.dataset.name || '').toLowerCase();
                const desc = (c.dataset.desc || '').toLowerCase();
                const tags = (c.dataset.tags || '').toLowerCase();

                if (name.includes(trimmed) || desc.includes(trimmed) || tags.includes(trimmed)) {
                    c.classList.add('search-matched');
                    c.classList.remove('dimmed');
                } else {
                    c.classList.remove('search-matched');
                    c.classList.add('dimmed');
                }
            });
        };

        searchInput.addEventListener('input', (e) => handleFilter(e.target.value));

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                handleFilter('');
                searchInput.focus();
            });
        }
    }

    renderGrid() {
        this.container.innerHTML = '';
        
        Object.keys(this.data).forEach(key => {
            const group = this.data[key];
            const col = document.createElement('div');
            col.className = 'sector-column';
            
            const nodesHtml = group.nodes.map(node => {
                const tagsHtml = node.tags.map(t => `<span class="competency-tag">${t}</span>`).join('');
                return `
                    <div class="tech-skill-card" 
                         id="node-${node.id}"
                         data-id="${node.id}" 
                         data-name="${node.name}"
                         data-desc="${node.desc}"
                         data-tags="${node.tags.join(', ')}">
                        <div class="card-header">
                            <h4 class="skill-name">${node.name}</h4>
                            <span class="skill-indicator"></span>
                        </div>
                        <p class="skill-desc">${node.desc}</p>
                        <div class="skill-tags">
                            ${tagsHtml}
                        </div>
                    </div>
                `;
            }).join('');

            col.innerHTML = `
                <div class="sector-header">
                    <h3 class="sector-title">${group.label}</h3>
                </div>
                <div class="sector-body">
                    ${nodesHtml}
                </div>
            `;
            
            this.container.appendChild(col);
        });
    }
}

// ============================================
// EXECUTIVE SCHEDULING INTERFACE (V7.0)
// ============================================
// ExecutiveScheduler replaced by ContactInterface in contact-system.js

// ============================================
// ROME TIME CLOCK & DATE TICKER
// ============================================
class RomeClock {
    constructor() {
        this.clockEl = document.getElementById('sys-clock');
        this.tickerEl = document.getElementById('date-ticker');
        
        if (!this.clockEl || !this.tickerEl) return;
        
        this.timezone = 'Europe/Rome';
        this.tickerIndex = 0;
        this.tickerItems = [];
        
        this.init();
    }
    
    init() {
        // Start the clock immediately
        this.updateClock();
        
        // Update clock every second
        setInterval(() => this.updateClock(), 1000);
        
        // Update ticker every 3 seconds
        this.updateTicker();
        setInterval(() => this.cycleTicker(), 3000);
    }
    
    getRomeDate() {
        return new Date(new Date().toLocaleString("en-US", { timeZone: this.timezone }));
    }
    
    updateClock() {
        const now = this.getRomeDate();
        
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        this.clockEl.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    updateTicker() {
        const now = this.getRomeDate();
        
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        
        const dayName = days[now.getDay()];
        const date = String(now.getDate()).padStart(2, '0');
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        
        // Create dynamic ticker items
        this.tickerItems = [
            `${dayName}`,
            `${date} ${month} ${year}`,
            `ROME TIME`,
            `WEEK ${this.getWeekNumber(now)}`
        ];
        
        this.renderTicker();
    }
    
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
    
    renderTicker() {
        const currentText = this.tickerItems[this.tickerIndex];
        this.tickerEl.textContent = currentText;
        
        // Add animation class
        this.tickerEl.classList.remove('ticker-fade');
        void this.tickerEl.offsetWidth; // Trigger reflow
        this.tickerEl.classList.add('ticker-fade');
    }
    
    cycleTicker() {
        this.tickerIndex = (this.tickerIndex + 1) % this.tickerItems.length;
        this.updateTicker();
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    UI.init();
    
    // Initialize systems
    new SystemLattice();
    new CursorGlow();
    new ScrollAnimations();
    new CounterAnimation();
    new Navigation();
    
    // Initialize Technical Skills Matrix & Projects Grid
    new TechSkillsMatrix();
    new KineticStream(); // Executive Projects Grid
    new RomeClock(); // Rome timezone clock & date ticker
    // ExecutiveScheduler initialization moved to contact-system.js

    
    // Add reveal class for CSS animations
    document.querySelectorAll('[data-reveal]').forEach((el, i) => {
        el.style.transitionDelay = `${i * 50}ms`;
    });
    
    console.log('%c NEURAL ARCHITECT V6 ONLINE ', 'background: #000; color: #00f0ff;');
});

// ============================================
// PERFORMANCE: Pause animations when tab not visible
// ============================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Could pause expensive animations here
    }
});