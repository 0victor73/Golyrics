const channel = new BroadcastChannel('holyrics_channel');
let ws = null;

// Initial State
const state = {
    active: false,
    text: "O amor do Senhor\n*É maravilhoso*\n{Aleluia} ~Amém~",
    global: {
        fontFamily: "Inter",
        fontSize: 60,
        color: "#ffffff",
        shadow: "3px 3px 8px rgba(0,0,0,0.8)",
        strokeWidth: 0,
        strokeColor: "#000000",
        letterSpacing: 0,
        lineHeight: 1.3,
        margin: { top: 5, bottom: 8, left: 4, right: 4, show: false },
        alignH: "center",
        alignV: "bottom",
        uppercase: true,
        bold: true,
        italic: false,
        underline: false,
        strikethrough: false
    },
    animations: {
        entry: "fade",
        exit: "fade"
    },
    special: {
        style1: { color: "#facc15", fontFamily: "Outfit", inheritFormat: false, uppercase: false, bold: true, italic: false, underline: false, strikethrough: false },
        style2: { color: "#38bdf8", fontFamily: "", inheritFormat: true, uppercase: false, bold: false, italic: false, underline: false, strikethrough: false },
        style3: { color: "#f43f5e", fontFamily: "", inheritFormat: true, uppercase: false, bold: false, italic: false, underline: false, strikethrough: false }
    }
};

// Update State from UI and Broadcast
function loadGoogleFont(fontName) {
    if (!fontName || fontName === 'inherit' || fontName.includes(',')) return;
    
    const fontId = 'font-' + fontName.replace(/\s+/g, '-').toLowerCase();
    if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800&display=swap`;
        document.head.appendChild(link);
    }
}

function formatFontFamily(val) {
    if (!val) return null;
    if (val.includes(',')) return val;
    return `'${val}', sans-serif`;
}

function updateDisabledStates() {
    const s1 = document.getElementById('format-options-s1');
    const s2 = document.getElementById('format-options-s2');
    const s3 = document.getElementById('format-options-s3');
    
    if (s1) s1.classList.toggle('disabled', state.special.style1.inheritFormat);
    if (s2) s2.classList.toggle('disabled', state.special.style2.inheritFormat);
    if (s3) s3.classList.toggle('disabled', state.special.style3.inheritFormat);
}

function updateStateFromPath(path, value) {
    const keys = path.split('.');
    let current = state;
    for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    if (path.includes('fontFamily')) {
        loadGoogleFont(value);
    }
    
    if (path.includes('inheritFormat')) {
        updateDisabledStates();
    }
    
    broadcast();
}

function broadcast() {
    // Only broadcast if the state is active, or force broadcast
    // Actually, always broadcast so overlay can hide/show
    channel.postMessage(state);
}

// Bind Inputs to State
document.querySelectorAll('[data-bind]').forEach(el => {
    // Set initial value
    const path = el.getAttribute('data-bind');
    const eventType = el.type === 'checkbox' ? 'change' : 'input';
    
    el.addEventListener(eventType, (e) => {
        let val = e.target.value;
        if (e.target.type === 'number' || e.target.type === 'range') val = Number(val);
        if (e.target.type === 'checkbox') val = e.target.checked;
        
        updateStateFromPath(path, val);
        
        // Update associated label if it exists
        const label = document.getElementById(`${e.target.id}-val`);
        if (label) label.textContent = val;
    });
});

// Themes Logic
function loadThemesList() {
    const select = document.getElementById('theme-select');
    select.innerHTML = '<option value="">-- Selecione um tema --</option>';
    try {
        const saved = JSON.parse(localStorage.getItem('holyrics_themes')) || {};
        for (const name in saved) {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            select.appendChild(opt);
        }
    } catch (e) {}
}

function syncUIToState() {
    document.querySelectorAll('[data-bind]').forEach(el => {
        const path = el.getAttribute('data-bind');
        const keys = path.split('.');
        let val = state;
        for (let key of keys) {
            if (val === undefined) break;
            val = val[key];
        }
        
        if (val !== undefined) {
            if (el.type === 'checkbox') {
                el.checked = val;
            } else {
                el.value = val;
            }
            
            const label = document.getElementById(`${el.id}-val`);
            if (label) label.textContent = val;
        }
    });
    
    updateDisabledStates();
    loadGoogleFont(state.global.fontFamily);
    loadGoogleFont(state.special.style1.fontFamily);
    loadGoogleFont(state.special.style2.fontFamily);
    loadGoogleFont(state.special.style3.fontFamily);
}

document.getElementById('btn-save-theme').addEventListener('click', () => {
    const name = document.getElementById('theme-name').value.trim();
    if (!name) {
        alert("Por favor, digite um nome para o tema.");
        return;
    }
    
    try {
        const saved = JSON.parse(localStorage.getItem('holyrics_themes')) || {};
        saved[name] = {
            global: state.global,
            animations: state.animations,
            special: state.special
        };
        localStorage.setItem('holyrics_themes', JSON.stringify(saved));
        loadThemesList();
        document.getElementById('theme-select').value = name;
        document.getElementById('theme-name').value = '';
    } catch (e) {
        console.error(e);
        alert("Erro ao salvar tema.");
    }
});

document.getElementById('btn-load-theme').addEventListener('click', () => {
    const name = document.getElementById('theme-select').value;
    if (!name) return;
    
    try {
        const saved = JSON.parse(localStorage.getItem('holyrics_themes')) || {};
        if (saved[name]) {
            state.global = { ...state.global, ...saved[name].global };
            state.animations = { ...state.animations, ...saved[name].animations };
            state.special = { ...state.special, ...saved[name].special };
            syncUIToState();
            broadcast();
        }
    } catch (e) {
        console.error(e);
    }
});

document.getElementById('btn-delete-theme').addEventListener('click', () => {
    const name = document.getElementById('theme-select').value;
    if (!name) return;
    
    if (confirm(`Tem certeza que deseja apagar o tema "${name}"?`)) {
        try {
            const saved = JSON.parse(localStorage.getItem('holyrics_themes')) || {};
            delete saved[name];
            localStorage.setItem('holyrics_themes', JSON.stringify(saved));
            loadThemesList();
        } catch (e) {
            console.error(e);
        }
    }
});

// Run initial UI state
updateDisabledStates();
loadThemesList();

// Manual Text Update
document.getElementById('btn-update-text').addEventListener('click', () => {
    state.text = document.getElementById('preview-text').value;
    broadcast();
});

// Toggle / WebSocket Connection
let pollInterval = null;
const btnToggle = document.getElementById('btn-toggle');
const statusIndicator = document.getElementById('conn-status');

btnToggle.addEventListener('change', () => {
    if (!btnToggle.checked) {
        // Disconnect
        state.active = false;
        if (ws) {
            ws.close();
            ws = null;
        }
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
        statusIndicator.className = 'status-indicator disconnected';
        broadcast();
    } else {
        // Connect
        state.active = true;
        const url = document.getElementById('holyrics-url').value.trim();

        if (url.startsWith('ws://') || url.startsWith('wss://')) {
            startWebSocket(url);
        } else if (url.startsWith('http://') || url.startsWith('https://')) {
            startPolling(url);
        } else {
            console.error("URL inválida. Deve começar com ws:// ou http://");
            btnToggle.checked = false;
        }
        
        broadcast();
    }
});

function startWebSocket(url) {
    try {
        ws = new WebSocket(url);
        
        ws.onopen = () => {
            statusIndicator.className = 'status-indicator connected';
            console.log("Conectado via WebSocket");
            ws.send(JSON.stringify({ action: "subscribe", topic: "lyrics" }));
            ws.send(JSON.stringify({ action: "request", model: "lyrics" }));
        };

        ws.onmessage = (event) => {
            handleIncomingData(event.data);
        };
        
        ws.onerror = () => {
            statusIndicator.className = 'status-indicator disconnected';
            btnToggle.checked = false;
        };

        ws.onclose = () => {
            statusIndicator.className = 'status-indicator disconnected';
        };
    } catch (err) {
        statusIndicator.className = 'status-indicator disconnected';
        btnToggle.checked = false;
    }
}

function startPolling(url) {
    statusIndicator.className = 'status-indicator connected';
    console.log("Iniciando Polling HTTP:", url);
    
    let isFetching = false;
    
    const fetchLyrics = () => {
        if (!state.active) return;
        if (isFetching) return;
        
        isFetching = true;
        
        // Simular o comportamento do jQuery para evitar cache e preencher parâmetros base
        let finalUrl;
        try {
            // Auto-correção: se o usuário digitou a URL base sem .json
            let cleanUrl = url.split('?')[0];
            if (cleanUrl.endsWith('/view/text') || cleanUrl.endsWith('/view/alert')) {
                cleanUrl += '.json';
            }
            
            finalUrl = new URL(cleanUrl);
            if (!finalUrl.searchParams.has('html_type')) finalUrl.searchParams.append('html_type', '0');
            if (!finalUrl.searchParams.has('img_id')) finalUrl.searchParams.append('img_id', '');
            if (!finalUrl.searchParams.has('css_hash')) finalUrl.searchParams.append('css_hash', '0');
            finalUrl.searchParams.set('_', new Date().getTime()); // Cache-buster
        } catch (e) {
            document.getElementById('preview-text').value = "Erro ao processar URL: " + e.message;
            isFetching = false;
            return;
        }

        fetch(finalUrl.toString(), {
            method: 'GET',
            headers: {
                // Header seguro para CORS (não dispara OPTIONS) e força o servidor a mandar JSON
                'Accept': 'application/json, text/javascript, */*; q=0.01'
            },
            cache: 'no-store'
        })
            .then(response => {
                if (!response.ok) throw new Error("HTTP Status: " + response.status);
                return response.text();
            })
            .then(data => {
                // Se o servidor retornar o arquivo Javascript ao invés do JSON
                if (data.includes("htmlType =")) {
                    document.getElementById('preview-text').value = "Erro: O servidor retornou JS em vez das letras.";
                } else {
                    handleIncomingData(data);
                }
            })
            .catch(err => {
                console.error("Erro no Polling:", err);
                document.getElementById('preview-text').value = "Erro de conexão: " + err.message;
            })
            .finally(() => {
                isFetching = false;
            });
    };

    fetchLyrics(); // Primeira execução imediata
    pollInterval = setInterval(fetchLyrics, 100); // A cada 100ms igual ao nativo do Holyrics
}

function handleIncomingData(rawData) {
    let newText = null;
    try {
        const payload = JSON.parse(rawData);
        
        if (payload.map && payload.map.text) {
            newText = payload.map.text;
        } else if (payload.text) {
            newText = payload.text;
        } else if (payload.content) {
            newText = payload.content;
        }
    } catch (e) {
        if (typeof rawData === 'string' && rawData.trim() !== '') {
            newText = rawData;
        }
    }

    if (newText !== null) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = newText;
        
        const systemSpans = tempDiv.querySelectorAll('span[id^="text-force-update"]');
        systemSpans.forEach(s => s.remove());
        
        const cleanText = (tempDiv.innerText || tempDiv.textContent || "").trim();
        
        if (state.text !== cleanText) {
            state.text = cleanText;
            document.getElementById('preview-text').value = state.text;
            broadcast();
        }
    }
}

// Init
broadcast();
