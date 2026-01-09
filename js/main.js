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
        this.toast = document.getElementById('achievement-toast');
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
// SYSTEM LATTICE (Global Background)
// A depth-encoded signal environment.
// Represents continuous intelligence and stable reference points.
// ============================================
class SystemLattice {
    constructor() {
        this.canvas = document.getElementById('neural-field');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.nodes = [];
        this.width = 0;
        this.height = 0;
        this.scrollY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
    }
    
    init() {
        this.resize();
        this.createNodes();
        
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

        let tickingMouse = false;
        window.addEventListener('mousemove', (e) => {
             if (!tickingMouse) {
                 window.requestAnimationFrame(() => {
                     this.mouseX = e.clientX;
                     this.mouseY = e.clientY;
                     tickingMouse = false;
                 });
                 tickingMouse = true;
             }
        });

        this.animate();
    }
    
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        // Re-initialize signal field
        this.createNodes();
    }
    
    createNodes() {
        // Density: "Sparse but intentional"
        // Reduced count to ensure calm, instrument-grade atmosphere
        // Density: "Sparse but intentional"
        // Reduced count to ensure calm, instrument-grade atmosphere
        const nodeCount = Math.min(100, Math.floor(this.width / 8));
        this.nodes = [];
        
        for (let i = 0; i < nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                z: Math.random() * 2 + 0.5, // Depth Z-Index
                size: Math.random() * 1.5,
                baseAlpha: Math.random() * 0.4 + 0.2, // Lower opacity for subtlety
                pulseSpeed: Math.random() * 0.02 + 0.005, // Very slow pulse
                pulseOffset: Math.random() * Math.PI * 2
            });
        }
    }
    
    animate() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.width, this.height);
        
        const time = Date.now() * 0.001;
        
        // Motion: Primary is Autonomous Drift.
        // User influence is <= 20% (extremely subtle).

        const parallaxY = -this.scrollY * 0.15; // Reduced vertical parallax
        // Damped user influence
        const mouseParallaxX = (this.mouseX - this.width / 2) * 0.005;
        const mouseParallaxY = (this.mouseY - this.height / 2) * 0.005;

        this.nodes.forEach(node => {
            // Autonomous Drift: Constant, slow, predictable.
            // Direction: Positive X (Left to Right) to suggest forward flow/data stream.
            node.x += 0.08 * node.z;
            
            // Calculate Render Position
            let x = node.x - mouseParallaxX * node.z;
            let y = node.y + (parallaxY * node.z) - (mouseParallaxY * node.z);
            
            // Infinite Field Wrapping
            
            // X Wrap
            const virtualX = (x % this.width);
            const actualX = virtualX < 0 ? virtualX + this.width : virtualX;

            // Y Wrap
            const virtualY = (y % this.height);
            const actualY = virtualY < 0 ? virtualY + this.height : virtualY;
            
            // Render Signal Node
            this.ctx.beginPath();
            
            // Pulse: Slow, rhythmic signal variation
            const pulse = Math.sin(time + node.pulseOffset);
            const opacity = node.baseAlpha + (pulse * 0.1);
            const finalOpacity = Math.max(0.05, Math.min(0.8, opacity));

            this.ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
            this.ctx.arc(actualX, actualY, node.size * Math.max(0.5, node.z * 0.4), 0, Math.PI * 2);
            this.ctx.fill();
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
                }
            });
        });
    }
}

// ============================================
// NEURAL BENTO INTERFACE (TACTICAL V3)
// ============================================
// ============================================
// NEURAL DIAGNOSTIC ANALYZER V4
// ============================================
// ============================================
// NEURAL DIAGNOSTIC ARCHITECT V8
// ============================================
class NeuralArchitect {
    constructor() {
        this.container = document.getElementById('bento-grid');
        this.svgLayer = document.getElementById('synapse-layer');
        this.overlay = document.getElementById('diagnostic-overlay');
        this.visitedNodes = new Set(); // Gamification State
        
        if (!this.container || !this.overlay) return;

        // V8 Knowledge Graph (Source of Truth)
        // V10 OMNI-CONNECTED JSON (Source Truth)
        this.data = {
            "DATA": {
                "label": "DATA SCIENCE / ENG",
                "color": "#06b6d4",
                "nodes": [
                    {
                        "id": "python", 
                        "name": "Python Core", 
                        "mastery": "95%", 
                        "sync": ["numpy", "torch", "transformer"], 
                        "desc": "The universal runtime. AsyncIO, Multiprocessing, & API orchestration."
                    },
                    {
                        "id": "numpy", 
                        "name": "NumPy & Pandas", 
                        "mastery": "94%", 
                        "sync": ["stats", "scikit", "torch"], 
                        "desc": "Vectorized operations, Linear Algebra (Dot Products), and Tensor manipulation."
                    },
                    {
                        "id": "stats", 
                        "name": "Statistics & Math", 
                        "mastery": "92%", 
                        "sync": ["reg_class", "viz", "scikit"], 
                        "desc": "Bayesian Inference, Hypothesis Testing (A/B), and Distribution Analysis."
                    },
                    {
                        "id": "sql_etl", 
                        "name": "SQL & Pipelines", 
                        "mastery": "82%", 
                        "sync": ["storage", "rag"], 
                        "desc": "Complex CTEs, dbt transformations, and Airflow DAG orchestration."
                    },
                    {
                        "id": "viz", 
                        "name": "Data Visualization & BI", 
                        "mastery": "89%", 
                        "sync": ["stats", "prompt"], 
                        "desc": "Diagnostic plotting (Plotly) and dimensionality reduction viz (t-SNE/UMAP)."
                    }
                ]
            },
            "ML": {
                "label": "PREDICTIVE ML",
                "color": "#8b5cf6",
                "nodes": [
                    {
                        "id": "reg_class", 
                        "name": "Regress / Classify", 
                        "mastery": "91%", 
                        "sync": ["scikit", "xgboost", "stats"], 
                        "desc": "GLMs, Logistic Regression, Decision Boundaries, and Loss Function optimization."
                    },
                    {
                        "id": "scikit", 
                        "name": "Scikit-Learn", 
                        "mastery": "93%", 
                        "sync": ["numpy", "reg_class", "deploy"], 
                        "desc": "Pipeline composition, Feature Selection, and Cross-Validation strategies."
                    },
                    {
                        "id": "xgboost", 
                        "name": "XGBoost / LGBM", 
                        "mastery": "88%", 
                        "sync": ["reg_class", "deploy"], 
                        "desc": "Gradient Boosting on Decision Trees. SOTA for structured tabular data."
                    },
                    {
                        "id": "torch", 
                        "name": "PyTorch / Deep Learning", 
                        "mastery": "87%", 
                        "sync": ["numpy", "transformer", "diffusion"], 
                        "desc": "Neural Architecture Search, Backprop, and Custom Layers (CNN/RNN)."
                    },
                    {
                        "id": "deploy", 
                        "name": "MLOps & Docker", 
                        "mastery": "79%", 
                        "sync": ["api", "python"], 
                        "desc": "Containerization, ONNX Runtime, and Model Registry management."
                    }
                ]
            },
            "GENAI": {
                "label": "GENERATIVE AI",
                "color": "#f43f5e",
                "nodes": [
                    {
                        "id": "transformer", 
                        "name": "LLM Architecture", 
                        "mastery": "90%", 
                        "sync": ["torch", "python", "prompt"], 
                        "desc": "Attention mechanisms, Quantization (GGUF), and Fine-tuning (QLoRA)."
                    },
                    {
                        "id": "rag", 
                        "name": "RAG Systems", 
                        "mastery": "92%", 
                        "sync": ["vector", "sql_etl"], 
                        "desc": "Retrieval-Augmented Generation. Hybrid Search & Context Reranking."
                    },
                    {
                        "id": "prompt", 
                        "name": "Agents & Tooling", 
                        "mastery": "94%", 
                        "sync": ["python", "api"], 
                        "desc": "Agentic workflows (LangGraph). Tool calling and ReAct loops."
                    },
                    {
                        "id": "vector", 
                        "name": "Vector DBs", 
                        "mastery": "85%", 
                        "sync": ["storage", "rag"], 
                        "desc": "Semantic Indexing (Pinecone/Milvus) & High-dim embeddings."
                    },
                    {
                        "id": "api", 
                        "name": "Inference APIs", 
                        "mastery": "86%", 
                        "sync": ["deploy", "python"], 
                        "desc": "High-throughput serving (vLLM) and FastAPI gateway integration."
                    }
                ]
            }
        };

        this.init();
    }

    init() {
        this.renderGrid();
        this.setupOverlay();
        
        // Wait for layout to stabilize for SVG drawing
        setTimeout(() => this.drawAllSynapses(), 500);
        
        let resizeTimer;
        window.addEventListener('resize', () => {
             clearTimeout(resizeTimer);
             resizeTimer = setTimeout(() => this.drawAllSynapses(), 200);
        });
    }

    renderGrid() {
        this.container.innerHTML = '';
        
        Object.keys(this.data).forEach(key => {
            const group = this.data[key];
            const col = document.createElement('div');
            col.className = 'sector-column';
            
            const nodesHtml = group.nodes.map(node => `
                <div class="neural-node" 
                     id="node-${node.id}"
                     data-id="${node.id}" 
                     data-name="${node.name}"
                     data-mastery="${node.mastery}"
                     data-sync='${JSON.stringify(node.sync)}'>
                    <div class="node-header">
                        <span class="node-name">${node.name}</span>
                        <i class="fa-solid fa-code-branch node-icon"></i>
                    </div>
                    <div class="node-mastery-track">
                        <div class="node-mastery-bar" data-width="${parseInt(node.mastery)}"></div>
                    </div>
                </div>
            `).join('');

            col.innerHTML = `
                <div class="sector-header">
                    <span class="sector-title">// ${group.label}</span>
                </div>
                <div class="sector-body">
                    ${nodesHtml}
                </div>
            `;
            
            this.container.appendChild(col);
        });

        this.animateEntrance();
        this.setupInteractions();
    }

    animateEntrance() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bars = entry.target.querySelectorAll('.node-mastery-bar');
                    bars.forEach((bar, i) => {
                        setTimeout(() => {
                            bar.style.width = bar.dataset.width + '%';
                        }, i * 50);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('.sector-column').forEach(col => observer.observe(col));
    }

    // V12 Core: Dual-Layer "Maglev" Connection Architecture
    drawAllSynapses() {
        if (!this.svgLayer) return;
        
        // Clear
        while (this.svgLayer.firstChild) {
            this.svgLayer.removeChild(this.svgLayer.firstChild);
        }

        // Create Definitions for Gradients
        if (!document.getElementById('synapse-gradient')) {
            const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            defs.innerHTML = `
                <linearGradient id="synapse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:var(--c-signal);stop-opacity:0" />
                    <stop offset="50%" style="stop-color:#ffffff;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:var(--c-signal);stop-opacity:0" />
                </linearGradient>
            `;
            this.svgLayer.appendChild(defs);
        }

        const containerRect = this.container.getBoundingClientRect();
        const nodes = Array.from(document.querySelectorAll('.neural-node'));
        const nodeMap = new Map();
        
        nodes.forEach(node => {
            nodeMap.set(node.dataset.id, node);
        });

        nodes.forEach(sourceNode => {
            const sourceId = sourceNode.dataset.id;
            const syncs = JSON.parse(sourceNode.dataset.sync);
            
            const sourceRect = sourceNode.getBoundingClientRect();
            // Start from right center
            const startX = sourceRect.right - containerRect.left;
            const startY = sourceRect.top + sourceRect.height / 2 - containerRect.top;

            syncs.forEach(targetId => {
                const targetNode = nodeMap.get(targetId);
                if (targetNode) {
                    const targetRect = targetNode.getBoundingClientRect();
                    
                    let endX, endY, c1x, c1y, c2x, c2y;
                    
                    // Logic: Omni-Connection (Adaptive Tension)
                    if (targetRect.left > sourceRect.right) {
                        // Forward Flow
                        endX = targetRect.left - containerRect.left;
                        endY = targetRect.top + targetRect.height / 2 - containerRect.top;
                        
                        // Adaptive curvature based on distance
                        const dist = endX - startX;
                        const tension = dist * 0.55; 

                        c1x = startX + tension;
                        c1y = startY;
                        c2x = endX - tension;
                        c2y = endY;
                    } else {
                        // Loopback / Same Column
                        endX = targetRect.right - containerRect.left;
                        endY = targetRect.top + targetRect.height / 2 - containerRect.top;
                        
                        const loopDist = 60; 
                        c1x = startX + loopDist;
                        c1y = startY;
                        c2x = endX + loopDist;
                        c2y = endY;
                    }

                    const d = `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;

                    // UNIFIED PATH: Handles both rail structure and energy pulse
                    // Optimized: Single DOM node per connection instead of two
                    const synapse = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    synapse.setAttribute('d', d);
                    synapse.setAttribute('class', 'synapse-link'); // Unified class
                    synapse.setAttribute('data-source', sourceId);
                    synapse.setAttribute('data-target', targetId);
                    
                    this.svgLayer.appendChild(synapse);
                }
            });
        });
    }

    setupInteractions() {
        const nodes = document.querySelectorAll('.neural-node');
        const termTitle = document.querySelector('.bar-title');
        
        // Update Terminal Ready State
        if (termTitle) termTitle.textContent = "> KERNEL CONNECTED. WAITING FOR INPUT...";

        nodes.forEach(node => {
            // HOVER
            node.addEventListener('mouseenter', () => {
                const myId = node.dataset.id;
                const myName = node.dataset.name;

                // Terminal Update
                if (termTitle) {
                    termTitle.textContent = `> DETECTING SYNAPTIC LINKAGES: [${myName.toUpperCase()}]...`;
                    termTitle.style.color = 'var(--c-signal)';
                }
                
                // 1. Highlight Nodes (Omni-Glow)
                const downstream = JSON.parse(node.dataset.sync);
                const upstream = [];
                
                nodes.forEach(n => {
                    const nSync = JSON.parse(n.dataset.sync);
                    if (nSync.includes(myId)) upstream.push(n.dataset.id);
                });
                
                const activeIds = new Set([myId, ...downstream, ...upstream]);
                
                nodes.forEach(n => {
                    if (activeIds.has(n.dataset.id)) {
                        n.classList.remove('dimmed');
                        n.classList.add('active-link');
                        // Custom Glow for Connected Nodes
                        if (n.dataset.id !== myId) {
                            n.style.borderColor = 'white';
                            n.style.boxShadow = '0 0 15px rgba(255,255,255,0.5)';
                        }
                    } else {
                        n.classList.add('dimmed');
                        n.classList.remove('active-link');
                        n.style.borderColor = '';
                        n.style.boxShadow = '';
                    }
                });

                // 2. Highlight Synapses (Unified Layer)
                const synapses = this.svgLayer.querySelectorAll('.synapse-link');
                
                // Helper to toggle
                const toggle = (el) => {
                    const s = el.getAttribute('data-source');
                    const t = el.getAttribute('data-target');
                    if (s === myId || t === myId) el.classList.add('active');
                    else el.classList.remove('active');
                };

                synapses.forEach(toggle);
            });

            node.addEventListener('mouseleave', () => {
                // Reset Terminal
                if (termTitle) {
                    termTitle.textContent = "> KERNEL CONNECTED. WAITING FOR INPUT...";
                    termTitle.style.color = '';
                }

                nodes.forEach(n => {
                    n.classList.remove('dimmed', 'active-link');
                    // Reset inline styles
                    n.style.borderColor = '';
                    n.style.boxShadow = '';
                });
                
                // Deactivate all paths
                this.svgLayer.querySelectorAll('.synapse-link').forEach(el => {
                    el.classList.remove('active');
                });
            });

            // CLICK
            node.addEventListener('click', () => {
                this.openDiagnostic(node.dataset.id);
            });
        });
    }

    setupOverlay() {
        const closeBtn = document.querySelector('.diag-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.overlay.classList.remove('active');
            });
        }
        
        this.overlay.addEventListener('click', (e) => {
             if (e.target === this.overlay) this.overlay.classList.remove('active');
        });
    }

    findData(id) {
        for (const key in this.data) {
            const found = this.data[key].nodes.find(n => n.id === id);
            if (found) return found;
        }
        return null;
    }

    openDiagnostic(id) {
        const node = this.findData(id);
        if (!node) return;

        // Track visited nodes
        if (!this.visitedNodes.has(id)) {
            this.visitedNodes.add(id);
        }

        const titleEl = document.querySelector('.diag-title');
        const descEl = document.getElementById('diag-desc-target');
        const specsContainer = document.getElementById('diag-specs');
        
        if (!titleEl || !descEl || !specsContainer) return;
        
        titleEl.textContent = `DIAGNOSTIC // ${node.name.toUpperCase()}`;
        descEl.textContent = ""; 
        
        specsContainer.innerHTML = `
            <div class="spec-item">
                <span class="spec-label">MASTERY</span>
                <span>${node.mastery}</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">ACTIVE SYNAPSES</span>
                <span>${node.sync.length} Omni-Link</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">INTEGRITY</span>
                <span>Verified 100%</span>
            </div>
            <div class="spec-item">
                <span class="spec-label">STATUS</span>
                <span style="color:var(--c-signal)">OPERATIONAL</span>
            </div>
        `;
        
        this.overlay.classList.add('active');
        
        if (this.decryptInterval) clearInterval(this.decryptInterval);
        this.decryptText(descEl, node.desc);
    }

    decryptText(element, originalText) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@";
        let iterations = 0;
        const totalDuration = 600; // ms
        const steps = originalText.length;
        const speed = totalDuration / steps + 5; 

        this.decryptInterval = setInterval(() => {
            element.innerText = originalText.split("")
                .map((letter, index) => {
                    if (index < iterations) {
                        return originalText[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join("");
            
            if (iterations >= originalText.length) clearInterval(this.decryptInterval);
            iterations += 1; 
        }, 20); // Fixed tick
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
    new TiltEffect();
    new SkillNodes();
    new ProjectCards();
    
    // Initialize Neural Architect V6
    new NeuralArchitect();
    new KineticStream(); // V2.0 Deployment Stream
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