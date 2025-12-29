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
// HeroCosmos removed - replaced by Global Solar System (js/bg-cosmos.js)

// ============================================
// NEURAL FIELD (Background Canvas)
// ============================================
// Deprecated: Replaced by 3D Latent Space (js/bg-neural.js)

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
                q: "What is the primary purpose of regularization (L1/L2)?",
                opts: ["Increase model bias", "Prevent overfitting", "Speed up training", "Normalize input data"],
                answer: 1
            },
            {
                q: "Which metric is most appropriate for imbalanced datasets?",
                opts: ["Accuracy", "F1-Score", "MSE", "R-Squared"],
                answer: 1
            },
            {
                q: "Which activation function helps solve the vanishing gradient problem?",
                opts: ["Sigmoid", "Tanh", "ReLU", "Linear"],
                answer: 2
            },
            {
                q: "What does Principal Component Analysis (PCA) maximize?",
                opts: ["Class Separability", "Variance", "Entropy", "Likelihood"],
                answer: 1
            },
            {
                q: "Which of the following is an ensemble learning method?",
                opts: ["SVM", "K-Means", "Random Forest", "Logistic Regression"],
                answer: 2
            },
            {
                q: "What is the core mechanism behind Transformer architectures?",
                opts: ["Convolution", "Recurrence", "Self-Attention", "Max Pooling"],
                answer: 2
            },
            {
                q: "A model with low bias and high variance is likely suffering from...",
                opts: ["Underfitting", "Overfitting", "Convergence Failure", "High Entropy"],
                answer: 1
            },
            {
                q: "Which algorithm is used for unsupervised clustering?",
                opts: ["Decision Tree", "Linear Regression", "K-Means", "Naive Bayes"],
                answer: 2
            },
            {
                q: "The goal of a Reinforcement Learning agent is to maximize...",
                opts: ["Loss", "Accuracy", "Entropy", "Expected Cumulative Reward"],
                answer: 3
            }
        ];
        this.current = 0;
        this.score = 0;
        this.locked = false;
        
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
        this.locked = false;
        this.renderQuestion();
    }
    
    renderQuestion() {
        const prompt = document.getElementById('quiz-prompt');
        const options = document.getElementById('quiz-options');
        
        if (this.current >= this.questions.length) {
            this.showResults();
            return;
        }
        
        const q = this.questions[this.current];
        prompt.textContent = `${this.current + 1}/${this.questions.length}: ${q.q}`;
        
        options.innerHTML = q.opts.map((opt, i) => 
            `<button class="quiz-btn" data-idx="${i}">>> ${opt}</button>`
        ).join('');
        
        options.querySelectorAll('.quiz-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.checkAnswer(parseInt(e.target.dataset.idx), e.target));
        });
    }
    
    checkAnswer(idx, btn) {
        if (this.locked) return;
        this.locked = true;
        
        const q = this.questions[this.current];
        const correct = idx === q.answer;
        const allBtns = document.querySelectorAll('.quiz-btn');
        
        if (correct) {
            btn.classList.add('correct');
            this.score++;
            State.addXP(50, 'Correct Answer!');
        } else {
            btn.classList.add('wrong');
            // Highlight the correct one
            if (allBtns[q.answer]) {
                allBtns[q.answer].classList.add('correct');
            }
        }
        
        setTimeout(() => {
            this.current++;
            this.locked = false;
            this.renderQuestion();
        }, 1500);
    }
    
    showResults() {
        const prompt = document.getElementById('quiz-prompt');
        const options = document.getElementById('quiz-options');
        
        const percent = Math.round((this.score / this.questions.length) * 100);
        
        prompt.innerHTML = `Protocol Complete: ${percent}% Accuracy`;
        options.innerHTML = `
            <div style="color: var(--c-text-muted); margin-bottom: 1rem;">
                Final Score: ${this.score}/${this.questions.length}
            </div>
            <button class="quiz-btn" id="restart-quiz">REINITIALIZE PROTOCOL</button>
        `;
        
        document.getElementById('restart-quiz').addEventListener('click', () => this.start());
        
        if (percent === 100) {
            State.addXP(200, 'Mastery Achievement!');
        } else if (percent >= 80) {
            State.addXP(100, 'Proficiency Achievement');
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
    // new NeuralField(); // Removed
    new CursorGlow();
    new ScrollAnimations();
    new CounterAnimation();
    new Navigation();
    new TiltEffect();
    new QuizSystem();
    new SkillNodes();
    new ProjectCards();
    
    // Initialize Three.js cosmos -> Handled by Global Solar System

    
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
