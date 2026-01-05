/**
 * NEURAL FOUNDRY IDE V24.0 - EXECUTION LAYER
 * Principal Interaction & Validation Engine.
 * 
 * Components:
 * - FAB Trigger: onClick -> executeCode()
 * - Feedback Console: Slide-up output panel
 * - Validation State Machine: SUCCESS / FAILURE branching
 */

class NeuralFoundry {
    constructor() {
        this.container = document.getElementById('nf-container');
        if (!this.container) return;

        // --- CURRICULUM DATA (PURE DATA SCIENCE) ---
        this.curriculum = [
            {
                id: 1,
                title: "VECTORS (NumPy)",
                task: "Create a NumPy array containing [1, 2, 3]",
                regex: /np\.array\(\[.*1.*2.*3.*\]\)/,
                output: "array([1, 2, 3])",
                hint: "import numpy as np, then use np.array([1, 2, 3])"
            },
            {
                id: 2,
                title: "DATAFRAME (Pandas)",
                task: "Remove all rows with missing values from df",
                regex: /\.dropna\(\)/,
                output: "DataFrame cleaned. 3 rows remaining.",
                hint: "Use the .dropna() method on your DataFrame"
            },
            {
                id: 3,
                title: "CORRELATION (Stats)",
                task: "Calculate the correlation matrix of df",
                regex: /\.corr\(\)/,
                output: "Correlation matrix computed.",
                hint: "Call .corr() on the DataFrame"
            },
            {
                id: 4,
                title: "SCALING (Sklearn)",
                task: "Initialize a StandardScaler object",
                regex: /StandardScaler\(\)/,
                output: "StandardScaler initialized.",
                hint: "from sklearn.preprocessing import StandardScaler"
            },
            {
                id: 5,
                title: "SPLIT (Model Sel)",
                task: "Split X and y into train/test sets",
                regex: /train_test_split\(.*X.*,.*y.*\)/,
                output: "Data split: 80% train, 20% test.",
                hint: "train_test_split(X, y) from sklearn.model_selection"
            },
            {
                id: 6,
                title: "REGRESSION (Linear)",
                task: "Fit a LinearRegression model to X_train, y_train",
                regex: /\.fit\(.*X_train.*,.*y_train.*\)/,
                output: "Model trained successfully.",
                hint: "model.fit(X_train, y_train)"
            },
            {
                id: 7,
                title: "PREDICTION (Inference)",
                task: "Generate predictions using X_test",
                regex: /\.predict\(.*X_test.*\)/,
                output: "Predictions generated: [120.5, 98.2, ...]",
                hint: "Use model.predict(X_test)"
            },
            {
                id: 8,
                title: "METRICS (MSE)",
                task: "Calculate Mean Squared Error between y_true and y_pred",
                regex: /mean_squared_error\(.*y_true.*,.*y_pred.*\)/,
                output: "MSE: 12.45",
                hint: "mean_squared_error(y_true, y_pred)"
            },
            {
                id: 9,
                title: "CLUSTERING (KMeans)",
                task: "Create a KMeans model with 3 clusters",
                regex: /KMeans\(.*n_clusters\s*=\s*3.*\)/,
                output: "KMeans(n_clusters=3) ready.",
                hint: "KMeans(n_clusters=3)"
            },
            {
                id: 10,
                title: "ENSEMBLE (Forest)",
                task: "Instantiate a RandomForestClassifier",
                regex: /RandomForestClassifier\(\)/,
                output: "RandomForestClassifier initialized.",
                hint: "RandomForestClassifier() from sklearn.ensemble"
            }
        ];

        // --- STATE ---
        this.state = {
            unlockedIdx: 0,
            activeIdx: 0,
            xp: 0
        };

        // DOM Map
        this.els = {
            moduleList: document.getElementById('nf-module-list'),
            xpBadge: document.getElementById('nf-xp'),
            
            // Editor
            editor: document.getElementById('nf-code-editor'),
            gutter: document.getElementById('nf-gutter'),
            editorPanel: document.getElementById('nf-editor-panel'),
            
            // Toolbar Actions (Header)
            btnHintToolbar: document.getElementById('nf-btn-hint'),
            btnRunToolbar: document.getElementById('nf-btn-run'),
            
            // FAB (The Trigger)
            fabRun: document.getElementById('nf-fab-run'),
            
            // Feedback Console (The Checker)
            console: document.getElementById('nf-feedback-console'),
            consoleBody: document.getElementById('nf-console-body'),
            consoleClose: document.getElementById('nf-console-close')
        };

        this.init();
    }

    init() {
        this.loadState();
        this.loadLevel(this.state.activeIdx);
        
        // ★★★ BIND FAB (THE PRIMARY TRIGGER) ★★★
        this.els.fabRun.addEventListener('click', () => this.executeCode());
        
        // Toolbar Hint Button
        this.els.btnHintToolbar.addEventListener('click', () => this.showHint());
        
        // Toolbar Run Button (Secondary)
        this.els.btnRunToolbar.addEventListener('click', () => this.executeCode());
        
        // Console Close
        this.els.consoleClose.addEventListener('click', () => this.closeConsole());
        
        // Sync Gutter on Input
        this.els.editor.addEventListener('input', () => this.updateGutter());
        
        // Tab Indent
        this.els.editor.addEventListener('keydown', (e) => {
            if(e.key === 'Tab') {
                e.preventDefault();
                document.execCommand('insertText', false, '    ');
            }
        });
        
        // Prevent formatting paste
        this.els.editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.originalEvent || e).clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        });

        this.updateStats();
    }

    // --- STATE PERSISTENCE ---
    loadState() {
        const saved = localStorage.getItem('nf_v24_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.state.unlockedIdx = parsed.unlockedIdx || 0;
            this.state.xp = parsed.xp || 0;
        }
    }

    saveState() {
        localStorage.setItem('nf_v24_state', JSON.stringify({
            unlockedIdx: this.state.unlockedIdx,
            xp: this.state.xp
        }));
        this.updateStats();
    }

    updateStats() {
        this.els.xpBadge.innerText = `[XP: ${this.state.xp}]`;
    }

    // --- SIDEBAR RENDER ---
    renderSidebar() {
        this.els.moduleList.innerHTML = '';
        this.curriculum.forEach((mod, idx) => {
            const isLocked = idx > this.state.unlockedIdx;
            const isActive = idx === this.state.activeIdx;
            const isCompleted = idx < this.state.unlockedIdx;

            const el = document.createElement('div');
            el.className = `nf-module-item ${isActive ? 'active' : ''} ${isLocked ? 'inactive' : ''} ${isCompleted ? 'completed' : ''}`;
            
            let icon = '<i class="fa-solid fa-lock"></i>';
            if (isActive) icon = '<i class="fa-solid fa-code"></i>';
            if (isCompleted) icon = '<i class="fa-solid fa-check"></i>';

            el.innerHTML = `
                <div class="nf-mod-icon">${icon}</div>
                <div class="nf-mod-title">${idx + 1}. ${mod.title}</div>
            `;

            if (!isLocked) {
                el.addEventListener('click', () => this.loadLevel(idx));
            }
            this.els.moduleList.appendChild(el);
        });
    }

    loadLevel(idx) {
        this.state.activeIdx = idx;
        const mod = this.curriculum[idx];

        this.renderSidebar();
        
        // ★ START EMPTY - User writes the code ★
        this.renderEmptyEditor(mod.task);
        
        this.closeConsole();
        
        // Reset FAB state
        this.els.fabRun.classList.remove('processing');
        this.els.fabRun.innerHTML = '<i class="fa-solid fa-play"></i><span>RUN PROTOCOL</span>';
    }
    
    // ★ RENDER EMPTY EDITOR WITH TASK PROMPT ★
    renderEmptyEditor(task) {
        const taskPrompt = `# TASK: ${task}\n# Write your solution below:\n\n`;
        this.els.editor.innerHTML = `<div><span class="ide-com"># TASK: ${task}</span></div><div><span class="ide-com"># Write your solution below:</span></div><div><br></div>`;
        this.updateGutter();
        
        // Focus editor for immediate typing
        this.els.editor.focus();
    }

    // --- SYNTAX HIGHLIGHTING ENGINE ---
    renderEditorCode(rawCode) {
        const lines = rawCode.split('\n');
        
        let htmlBuffer = lines.map(line => {
            if (line.trim().startsWith('#')) {
                return `<span class="ide-com">${this.escapeHtml(line)}</span>`;
            }

            let processed = this.escapeHtml(line);
            
            // Strings
            processed = processed.replace(/('.*?')/g, '<span class="ide-str">$1</span>');
            processed = processed.replace(/(".*?")/g, '<span class="ide-str">$1</span>');

            // Keywords
            ['import', 'from', 'as', 'def', 'return', 'class', 'if', 'else'].forEach(kw => {
                 const re = new RegExp(`\\b${kw}\\b`, 'g');
                 processed = processed.replace(re, `<span class="ide-kwd">${kw}</span>`);
            });

            // Classes
            ['StandardScaler', 'LinearRegression', 'KMeans', 'RandomForestClassifier'].forEach(cls => {
                const re = new RegExp(`\\b${cls}\\b`, 'g');
                processed = processed.replace(re, `<span class="ide-cls">${cls}</span>`);
            });

            // Functions
            ['print', 'len', 'range', 'np', 'pd', 'fit', 'predict', 'dropna', 'corr', 'array', 'head', 'shape'].forEach(fn => {
                 const re = new RegExp(`\\b${fn}\\b`, 'g'); 
                 processed = processed.replace(re, `<span class="ide-func">${fn}</span>`);
            });

            return `<div>${processed || '<br>'}</div>`;
        }).join('');

        this.els.editor.innerHTML = htmlBuffer;
        this.updateGutter();
    }
    
    escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    updateGutter() {
        const lineCount = this.els.editor.childElementCount || 1; 
        let gutterHtml = '';
        for (let i = 1; i <= Math.max(lineCount, 1); i++) {
            gutterHtml += `<div class="ln">${i}</div>`;
        }
        this.els.gutter.innerHTML = gutterHtml;
    }

    // --- CONSOLE CONTROL ---
    openConsole() {
        this.els.console.classList.add('open');
    }
    
    closeConsole() {
        this.els.console.classList.remove('open');
    }
    
    logToConsole(message, type = 'status') {
        const line = document.createElement('div');
        line.className = `log-line log-${type}`;
        line.innerHTML = message;
        this.els.consoleBody.appendChild(line);
        this.els.consoleBody.scrollTop = this.els.consoleBody.scrollHeight;
    }
    
    clearConsole() {
        this.els.consoleBody.innerHTML = '';
    }

    // --- HINT ACTION ---
    showHint() {
        const mod = this.curriculum[this.state.activeIdx];
        this.openConsole();
        this.clearConsole();
        this.logToConsole('💡 HINT REQUESTED', 'status');
        this.logToConsole('', 'status');
        this.logToConsole(`Task: ${mod.task}`, 'status');
        this.logToConsole('', 'status');
        this.logToConsole(`Suggestion: ${mod.hint}`, 'hint');
    }

    // ★★★ EXECUTION LAYER (THE STATE MACHINE) ★★★
    executeCode() {
        const mod = this.curriculum[this.state.activeIdx];
        const userCode = this.els.editor.innerText;

        // --- STEP 1: THE TRIGGER ---
        this.openConsole();
        this.clearConsole();
        
        // Update FAB state
        this.els.fabRun.classList.add('processing');
        this.els.fabRun.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i><span>PROCESSING...</span>';
        
        this.logToConsole('[STATUS]: COMPILING...<span class="cursor-blink"></span>', 'status');

        // --- STEP 2: VALIDATION (with simulated delay) ---
        setTimeout(() => {
            // Remove blinking cursor
            const blinkEl = this.els.consoleBody.querySelector('.cursor-blink');
            if (blinkEl) blinkEl.classList.remove('cursor-blink');
            
            // --- STEP 3: BRANCHING LOGIC ---
            if (mod.regex.test(userCode)) {
                this.handleSuccess(mod);
            } else {
                this.handleFailure(mod);
            }
        }, 800);
    }

    // ★★★ SUCCESS SCENARIO ★★★
    handleSuccess(mod) {
        this.logToConsole('> Verifying syntax... OK', 'status');
        this.logToConsole('> Checking logic... OK', 'status');
        this.logToConsole('', 'status'); // Spacer
        
        // Simulated Output
        const outputLines = mod.output.split('\n');
        outputLines.forEach(line => {
            this.logToConsole(`${line}`, 'status');
        });
        
        this.logToConsole('', 'status');
        this.logToConsole('> TEST PASSED (1/1). LOGIC VERIFIED.', 'success');
        
        // XP Reward
        if (this.state.activeIdx === this.state.unlockedIdx) {
            this.state.xp += 100;
            this.logToConsole(`> +100 XP AWARDED. Total: ${this.state.xp} XP`, 'success');
            
            if (this.state.unlockedIdx < this.curriculum.length - 1) {
                this.state.unlockedIdx++;
            }
            this.saveState();
            this.renderSidebar();
        }
        
        // Reset FAB to "Completed" state
        this.els.fabRun.classList.remove('processing');
        this.els.fabRun.innerHTML = '<i class="fa-solid fa-check"></i><span>COMPLETED</span>';
    }

    // ★★★ FAILURE SCENARIO ★★★
    handleFailure(mod) {
        this.logToConsole('> Verifying syntax... FAILED', 'error');
        this.logToConsole('', 'status');
        this.logToConsole(`> ERROR: SyntaxMismatchException`, 'error');
        this.logToConsole(`> Missing keyword. See hint for guidance.`, 'error');
        this.logToConsole('', 'status');
        this.logToConsole(`[HINT]: ${mod.hint}`, 'hint');
        
        // Shake animation
        this.els.editorPanel.classList.add('shake-error');
        setTimeout(() => {
            this.els.editorPanel.classList.remove('shake-error');
        }, 500);
        
        // Reset FAB to "Retry" state
        this.els.fabRun.classList.remove('processing');
        this.els.fabRun.innerHTML = '<i class="fa-solid fa-rotate-right"></i><span>RETRY</span>';
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    window.neuralFoundry = new NeuralFoundry();
});
