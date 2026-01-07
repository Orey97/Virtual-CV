/* === DEPLOYMENT STREAM KERNEL (V2.0 Core) === */
class KineticStream {
    constructor() {
        this.track = document.getElementById('kinetic-stream-track');
        this.wrapper = document.getElementById('kinetic-stream-wrapper');
        this.progressBar = document.getElementById('stream-progress-bar');
        this.prevBtn = document.getElementById('stream-prev');
        this.nextBtn = document.getElementById('stream-next');
        
        // V2.0 Data Architecture
        this.projects = [
            {
                "id": "p1",
                "title": "Predictive Supply Chain v4",
                "stack": ["Python", "XGBoost", "FastAPI"],
                "kpi": "94% Accuracy",
                "desc": "High-throughput forecasting engine optimized for multi-node retail inventory networks. Reduced waste by 18%.",
                "status": "PROD_LIVE"
            },
            {
                "id": "p2",
                "title": "Neural RAG Knowledge Base",
                "stack": ["LangChain", "Pinecone", "GPT-4o"],
                "kpi": "<200ms Latency",
                "desc": "Enterprise-scale semantic retrieval system ingesting 50k+ technical whitepapers with hybrid-search reranking.",
                "status": "BETA"
            },
            {
                "id": "p3",
                "title": "Computer Vision Sentry",
                "stack": ["PyTorch", "YOLOv8", "OpenCV"],
                "kpi": "99.2% Recall",
                "desc": "Edge-computing diagnostic system for real-time manufacturing defect detection and classification.",
                "status": "STABLE"
            },
            {
                "id": "p4",
                "title": "Churn Sentinel v2",
                "stack": ["Scikit-Learn", "SHAP", "Docker"],
                "kpi": "-23% Attrition",
                "desc": "Behavioral analytics engine predicting user churn via high-dimensional feature signals and explainable AI.",
                "status": "PROD_LIVE"
            },
            {
                "id": "p5",
                "title": "Alpha-Algo Quant Agent",
                "stack": ["NumPy", "Pandas", "RLlib"],
                "kpi": "+12% Alpha",
                "desc": "Reinforcement Learning agent optimized for high-frequency cryptocurrency market making and liquidity provision.",
                "status": "RESEARCH"
            }
        ];

        // Inertial State
        this.isDown = false;
        this.startX = 0;
        this.scrollLeft = 0;
        
        this.init();
    }

    init() {
        if (!this.track || !this.wrapper) return;
        this.renderStream();
        this.setupModal(); // Initialize Modal
        this.setupKineticScroll();
        this.setupHud();
    }



    renderStream() {
        this.track.innerHTML = this.projects.map(p => {
            const stackHtml = p.stack.map(s => `<i class="fa-solid fa-code stack-icon" title="${s}"></i>`).join('');
            
            return `
                <div class="holo-slate" id="slate-${p.id}">
                    <div class="slate-status">${p.status}</div>
                    
                    <div class="slate-header">
                        <span class="slate-id">ID: ${p.id.toUpperCase()}</span>
                        <h3 class="slate-title">${p.title}</h3>
                        <p class="slate-desc">${p.desc}</p>
                    </div>
                    
                    <div class="slate-footer">
                        <div class="slate-kpi">
                            <span class="kpi-value">${p.kpi.split(' ')[0]}</span>
                            <span class="kpi-label">${p.kpi.split(' ').slice(1).join(' ')}</span>
                        </div>
                        <div class="slate-stack">
                            ${stackHtml}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add listeners to new slates
        document.querySelectorAll('.holo-slate').forEach(slate => {
            slate.addEventListener('mouseenter', () => {
                // Slate hover interaction
            });
        });
    }

    setupKineticScroll() {
        // V4.0 Inertial Drag Orchestration (The Flick Logic)
        let isDown = false;
        let startX;
        let scrollLeft;
        let velX = 0;
        let momentumID;
        let isDragging = false; 
        const VELOCITY_MULTIPLIER = 1.6; // Tuned for "Lighter" feel
        const FRICTION = 0.96; // Smooth glass feel
        let lastX = 0;
        let currentX = 0;

        // 1. Capture Phase (Mousedown)
        this.wrapper.addEventListener('mousedown', (e) => {
            isDown = true;
            isDragging = false;
            this.wrapper.classList.add('active'); 
            this.wrapper.style.transform = "scale(0.99)"; // Subtle Lift
            this.wrapper.style.cursor = "grabbing";
            
            startX = e.pageX - this.wrapper.offsetLeft;
            scrollLeft = this.wrapper.scrollLeft;
            lastX = e.pageX;
            
            cancelAnimationFrame(momentumID);
            this.wrapper.style.willChange = "scroll-position, transform";
        });

        // 2. Release Phase (Mouseup/Leave)
        const stopDrag = () => {
            if (!isDown) return;
            isDown = false;
            this.wrapper.classList.remove('active');
            this.wrapper.style.transform = "scale(1)";
            this.wrapper.style.cursor = "grab";
            this.wrapper.style.willChange = "auto";
            
            this.beginMomentumDecay();
        };

        this.wrapper.addEventListener('mouseleave', stopDrag);
        this.wrapper.addEventListener('mouseup', stopDrag);

        // 3. Tracking Phase (Mousemove)
        this.wrapper.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            
            const x = e.pageX - this.wrapper.offsetLeft;
            const walk = (x - startX); // Raw delta
            
            if (Math.abs(walk) > 5) isDragging = true;
            
            // Instant Velocity Calculation
            currentX = e.pageX;
            const delta = currentX - lastX;
            velX = delta * -1.2; // Invert for drag
            lastX = currentX;

            // Edge Resistance
            let effectiveWalk = walk * VELOCITY_MULTIPLIER;
            if (this.wrapper.scrollLeft <= 0 && walk > 0) effectiveWalk /= 3;
            if (this.wrapper.scrollLeft >= (this.wrapper.scrollWidth - this.wrapper.clientWidth) && walk < 0) effectiveWalk /= 3;

            this.wrapper.scrollLeft = scrollLeft - effectiveWalk;
            
            // FX
            this.applyVelocityFX(velX);
        });

        // 4. Momentum Loop
        this.beginMomentumDecay = () => {
            const decay = () => {
                if (Math.abs(velX) < 0.1) {
                    velX = 0;
                    this.applyVelocityFX(0);
                    return;
                }
                
                this.wrapper.scrollLeft += velX;
                velX *= FRICTION;
                
                this.applyVelocityFX(velX);
                momentumID = requestAnimationFrame(decay);
            };
            decay();
        };

        this.wrapper.querySelectorAll('.holo-slate').forEach(slate => {
            slate.addEventListener('click', (e) => {
                if (isDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                const pid = slate.id.replace('slate-', '');
                this.openModal(pid);
            });
        });

        // 5. Progress & Focus Sync
        this.wrapper.addEventListener('scroll', () => {
            const maxScroll = this.wrapper.scrollWidth - this.wrapper.clientWidth;
            const current = this.wrapper.scrollLeft;
            const pct = (current / maxScroll) * 100;
            
            if (this.progressBar) {
                this.progressBar.style.width = `${pct}%`;
            }
            
            this.checkActiveSlate();
        });
    }

    applyVelocityFX(velocity) {
        // Blur: blur(min(velocity * 0.2, 4)px)
        const blurAmount = Math.min(Math.abs(velocity) * 0.2, 5); 
        
        // Tilt: max 15deg
        const rotation = Math.max(Math.min(velocity * 0.4, 15), -15);

        document.querySelectorAll('.holo-slate').forEach(slate => {
             // Curved HUD Logic: RotateY heavily dependent on position relative to center?
             // Or keep it simple based on velocity as verified active feels good.
             // V4 Spec: "Curved HUD effect" -> handled by scroll position in requestAnimation or CSS?
             // Since scroll snap does some, let's stick to velocity tilt + blur for "High Speed" feel.
             
             if (Math.abs(velocity) > 0.5) {
                 slate.style.transform = `perspective(1000px) rotateY(${rotation}deg)`;
                 slate.style.filter = `blur(${blurAmount}px)`;
             } else {
                 slate.style.transform = '';
                 slate.style.filter = '';
             }
        });
    }
    
    checkActiveSlate() {
        const center = this.wrapper.scrollLeft + (this.wrapper.clientWidth / 2);
        const slates = document.querySelectorAll('.holo-slate');
        
        let closest = null;
        let minDist = Infinity;
        
        slates.forEach(slate => {
            const rect = slate.getBoundingClientRect();
            // Calculate center relative to wrapper scroll
            // Note: getBoundingClientRect is viewport relative, need to adjust logic or use offsetLeft
            // Simpler: Use offsetLeft of slate relative to wrapper
            const slateCenter = slate.offsetLeft + (slate.offsetWidth / 2);
            const dist = Math.abs(center - slateCenter);
            
            if (dist < minDist) {
                minDist = dist;
                closest = slate;
            }
            
            slate.classList.remove('active-slate');
        });
        
        if (closest) {
            closest.classList.add('active-slate');
        }
    }

    setupHud() {
        if (!this.prevBtn || !this.nextBtn) return;
        
        this.prevBtn.addEventListener('click', () => {
            this.wrapper.scrollBy({ left: -400, behavior: 'smooth' });
        });
        
        this.nextBtn.addEventListener('click', () => {
            this.wrapper.scrollBy({ left: 400, behavior: 'smooth' });
        });
    }

    /* === MODAL LOGIC === */
    setupModal() {
        this.modal = document.getElementById('project-modal');
        if (!this.modal) return;
        
        this.modalClose = document.getElementById('modal-close');
        this.modalBackdrop = document.getElementById('modal-backdrop');
        
        const close = () => this.closeModal();
        
        this.modalClose.addEventListener('click', close);
        this.modalBackdrop.addEventListener('click', close);
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                close();
            }
        });
    }

    openModal(pid) {
        const project = this.projects.find(p => p.id === pid);
        if (!project || !this.modal) return;

        // Populate Data
        document.getElementById('modal-title').textContent = project.title;
        document.getElementById('modal-status').textContent = project.status;
        document.getElementById('modal-desc').textContent = project.desc;
        
        // Tags
        const tagsContainer = document.getElementById('modal-tags');
        tagsContainer.innerHTML = '';
        project.stack.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'modal-tag';
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });
        
        // KPIs
        const kpisContainer = document.getElementById('modal-kpis');
        // Parse "94% Accuracy" -> val: 94%, label: Accuracy
        // Simple heuristic for demo data
        const kpiParts = project.kpi.split(' ');
        const val = kpiParts[0];
        const label = kpiParts.slice(1).join(' ');
        
        kpisContainer.innerHTML = '';
        
        const kpiItem1 = document.createElement('div');
        kpiItem1.className = 'modal-kpi-item';
        kpiItem1.innerHTML = `<span class="kpi-val">${val}</span><span class="kpi-label">${label}</span>`;
        // Since val/label come from split string of hardcoded config, fairly safe, 
        // but let's be cleaner:
        kpiItem1.innerHTML = '';
        const valSpan = document.createElement('span');
        valSpan.className = 'kpi-val';
        valSpan.textContent = val;
        const labelSpan = document.createElement('span');
        labelSpan.className = 'kpi-label';
        labelSpan.textContent = label;
        kpiItem1.append(valSpan, labelSpan);

        const kpiItem2 = document.createElement('div');
        kpiItem2.className = 'modal-kpi-item';
        kpiItem2.innerHTML = '<span class="kpi-val">Global</span><span class="kpi-label">Availability</span>';
        
        kpisContainer.append(kpiItem1, kpiItem2);

        // Animate In
        this.modal.classList.add('active');
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.classList.remove('active');
    }
}
