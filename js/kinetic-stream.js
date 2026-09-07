/* === EXECUTIVE CASE STUDIES ENGINE === */
class KineticStream {
    constructor() {
        this.container = document.getElementById('kinetic-stream-track');
        
        // Executive Data Architecture
        this.allProjects = [
            {
                "id": "p1",
                "title": "Predictive Supply Chain & Demand Intelligence",
                "category": "AI/ML",
                "categoryLabel": "Predictive Systems",
                "stack": ["Python", "XGBoost", "FastAPI", "Polars", "Docker"],
                "kpi": "94%",
                "kpiDesc": "Model Accuracy",
                "desc": "High-throughput time-series forecasting engine designed for multi-node retail distribution networks, reducing inventory stockout by 18% across 1,200 nodes.",
                "architecture": "Vectorized Polars ETL pipeline feeding ensemble XGBoost estimators, served asynchronously via production FastAPI endpoints with real-time SHAP feature attribution.",
                "status": "Production Live"
            },
            {
                "id": "p2",
                "title": "Enterprise RAG & Knowledge Retrieval System",
                "category": "LLM",
                "categoryLabel": "Generative AI",
                "stack": ["PyTorch", "LangChain", "Qdrant", "vLLM", "FlashAttention"],
                "kpi": "<180ms",
                "kpiDesc": "Latency p95",
                "desc": "Enterprise-grade semantic retrieval system processing 50k+ technical documents with dense/sparse hybrid vector search and multi-stage cross-encoder reranking.",
                "architecture": "Qdrant vector engine integrated with self-hosted vLLM serving quantized Llama-3 endpoints, featuring dense passage retrieval and automated context compression.",
                "status": "Production Live"
            },
            {
                "id": "p3",
                "title": "Edge Computer Vision & Quality Assurance",
                "category": "CV",
                "categoryLabel": "Computer Vision",
                "stack": ["PyTorch", "YOLOv11", "OpenCV", "TensorRT", "CUDA"],
                "kpi": "99.2%",
                "kpiDesc": "Defect Recall",
                "desc": "Edge-computing diagnostic vision pipeline for real-time manufacturing defect inspection and automated multi-class categorization operating at 120 FPS.",
                "architecture": "Custom YOLOv11 deep neural network compiled with TensorRT for edge NVIDIA Jetson nodes, delivering sub-10ms inference latency per high-resolution frame.",
                "status": "Production Live"
            },
            {
                "id": "p4",
                "title": "Behavioral Analytics & Churn Prediction Engine",
                "category": "AI/ML",
                "categoryLabel": "Predictive Systems",
                "stack": ["Scikit-Learn", "SHAP", "Optuna", "Evidently AI", "MLflow"],
                "kpi": "-23%",
                "kpiDesc": "Annual Churn Rate",
                "desc": "Predictive customer lifetime value and attrition modeling platform utilizing high-dimensional feature engineering and automated model explainability.",
                "architecture": "Gradient boosted classification pipeline tuned via Optuna hyperparameter optimization, featuring continuous data drift monitoring with Evidently AI and automated MLflow lineage tracking.",
                "status": "Production Live"
            },
            {
                "id": "p5",
                "title": "Automated Market Making via Deep Reinforcement Learning",
                "category": "RL",
                "categoryLabel": "Quantitative AI",
                "stack": ["Python", "NumPy", "RLlib", "PyTorch", "Arrow"],
                "kpi": "+14.2%",
                "kpiDesc": "Sharpe Ratio",
                "desc": "Deep Reinforcement Learning agent engineered for continuous market making and dynamic liquidity allocation across high-frequency order books.",
                "architecture": "Proximal Policy Optimization (PPO) agent trained on microsecond limit order book snapshots, featuring custom reward function shaping for inventory risk management.",
                "status": "R&D System"
            }
        ];

        this.projects = [...this.allProjects];
        this.init();
    }

    init() {
        if (!this.container) return;
        this.renderGrid();
        this.setupModal();
        this.setupFilterHud();
    }

    setupFilterHud() {
        const filterBtns = document.querySelectorAll('#stream-filter-hud .filter-btn');
        if (!filterBtns.length) return;

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');
                if (filter === 'all') {
                    this.projects = [...this.allProjects];
                } else {
                    this.projects = this.allProjects.filter(p => p.category === filter);
                }

                this.container.style.opacity = '0';
                this.container.style.transform = 'translateY(6px)';
                setTimeout(() => {
                    this.renderGrid();
                    this.container.style.opacity = '1';
                    this.container.style.transform = 'translateY(0)';
                }, 160);
            });
        });
    }

    renderGrid() {
        this.container.innerHTML = this.projects.map(p => {
            const stackHtml = p.stack.map(s => `<span class="tech-pill">${s}</span>`).join('');
            const isProd = p.status.includes('Production');
            const statusClass = isProd ? 'status-live' : 'status-research';
            
            return `
                <article class="project-bento-card" id="slate-${p.id}" tabindex="0" aria-label="View case study for ${p.title}">
                    <div class="card-top-meta">
                        <span class="category-badge">${p.categoryLabel || p.category}</span>
                        <span class="status-badge ${statusClass}">
                            <span class="status-dot"></span>
                            ${p.status}
                        </span>
                    </div>
                    
                    <div class="card-main">
                        <h3 class="card-title">${p.title}</h3>
                        <p class="card-desc">${p.desc}</p>
                    </div>
                    
                    <div class="card-footer">
                        <div class="card-kpi">
                            <span class="kpi-metric">${p.kpi}</span>
                            <span class="kpi-subtext">${p.kpiDesc || 'Key Metric'}</span>
                        </div>
                        <div class="card-action">
                            <span class="action-text">Case Study</span>
                            <i class="fa-solid fa-arrow-up-right-from-square action-icon"></i>
                        </div>
                    </div>

                    <div class="card-stack-row">
                        ${stackHtml}
                    </div>
                </article>
            `;
        }).join('');
        
        // Attach event listeners to open modal
        this.container.querySelectorAll('.project-bento-card').forEach(card => {
            const pid = card.id.replace('slate-', '');
            card.addEventListener('click', () => this.openModal(pid));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openModal(pid);
                }
            });
        });
    }

    setupModal() {
        this.modal = document.getElementById('project-modal');
        if (!this.modal) return;
        
        this.modalClose = document.getElementById('modal-close');
        this.modalBackdrop = document.getElementById('modal-backdrop');
        
        const close = () => this.closeModal();
        if (this.modalClose) this.modalClose.addEventListener('click', close);
        if (this.modalBackdrop) this.modalBackdrop.addEventListener('click', close);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                close();
            }
        });
    }

    openModal(pid) {
        const project = this.allProjects.find(p => p.id === pid);
        if (!project || !this.modal) return;

        const titleEl = document.getElementById('modal-title');
        const statusTextEl = document.getElementById('modal-status-text');
        const descEl = document.getElementById('modal-desc');
        const tagsContainer = document.getElementById('modal-tags');
        const kpisContainer = document.getElementById('modal-kpis');
        const modalIcon = document.getElementById('modal-icon');

        if (titleEl) titleEl.textContent = project.title;
        if (statusTextEl) statusTextEl.textContent = project.status;
        if (descEl) descEl.textContent = project.architecture || project.desc;
        
        if (modalIcon) {
            const iconMap = {
                'AI/ML': 'fa-solid fa-diagram-project',
                'LLM': 'fa-solid fa-microchip',
                'CV': 'fa-solid fa-eye',
                'RL': 'fa-solid fa-network-wired'
            };
            modalIcon.className = iconMap[project.category] || 'fa-solid fa-code';
        }

        if (tagsContainer) {
            tagsContainer.innerHTML = project.stack.map(tag => `<span class="modal-tag">${tag}</span>`).join('');
        }
        
        if (kpisContainer) {
            kpisContainer.innerHTML = `
                <div class="modal-kpi-item">
                    <span class="kpi-val">${project.kpi}</span>
                    <span class="kpi-label">${project.kpiDesc || 'Key Metric'}</span>
                </div>
                <div class="modal-kpi-item">
                    <span class="kpi-val">${project.categoryLabel || project.category}</span>
                    <span class="kpi-label">Domain</span>
                </div>
            `;
        }

        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

