const channel = new BroadcastChannel('holyrics_channel');
const lyricsContainer = document.getElementById('lyrics-container');

let currentText = '';
let currentIsActive = false;

function hexToRgba(hex, alpha) {
    if (!hex) return 'transparent';
    let r = 0, g = 0, b = 0;
    if (hex.length == 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length == 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

channel.onmessage = (event) => {
    const data = event.data;
    applyStyles(data);
    updateDisplay(data);
};

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

function applyStyles(data) {
    const root = document.documentElement;
    
    // Load fonts
    loadGoogleFont(data.global.fontFamily);
    loadGoogleFont(data.special.style1.fontFamily);
    loadGoogleFont(data.special.style2.fontFamily);
    loadGoogleFont(data.special.style3.fontFamily);
    
    const gFont = formatFontFamily(data.global.fontFamily) || "'Inter', sans-serif";

    // Global
    root.style.setProperty('--g-font', gFont);
    root.style.setProperty('--g-size', `${data.global.fontSize}px`);
    root.style.setProperty('--g-color', data.global.color);
    root.style.setProperty('--g-shadow', data.global.shadow);
    root.style.setProperty('--g-stroke-w', `${data.global.strokeWidth}px`);
    root.style.setProperty('--g-stroke-c', data.global.strokeColor);
    root.style.setProperty('--g-letter-spacing', `${data.global.letterSpacing}px`);
    root.style.setProperty('--g-line-height', data.global.lineHeight);
    root.style.setProperty('--g-opacity', data.global.opacity / 100);
    
    // Global Formatting
    root.style.setProperty('--g-weight', data.global.bold ? '700' : '400');
    root.style.setProperty('--g-transform', data.global.uppercase ? 'uppercase' : 'none');
    root.style.setProperty('--g-style', data.global.italic ? 'italic' : 'normal');
    
    // Box (Caixa de Texto)
    if (data.global.box && data.global.box.active) {
        const bg = hexToRgba(data.global.box.color, data.global.box.opacity / 100);
        root.style.setProperty('--g-box-radius', `${data.global.box.radius}px`);
        
        if (data.global.box.type === 'block') {
            root.style.setProperty('--g-box-bg-block', bg);
            root.style.setProperty('--g-box-padding-block', `${data.global.box.padding}px`);
            root.style.setProperty('--g-box-bg-line', 'transparent');
            root.style.setProperty('--g-box-padding-line-v', '0');
            root.style.setProperty('--g-box-padding-line-h', '0');
        } else {
            root.style.setProperty('--g-box-bg-block', 'transparent');
            root.style.setProperty('--g-box-padding-block', '0');
            root.style.setProperty('--g-box-bg-line', bg);
            root.style.setProperty('--g-box-padding-line-v', `${data.global.box.padding * 0.2}px`);
            root.style.setProperty('--g-box-padding-line-h', `${data.global.box.padding}px`);
        }
    } else {
        root.style.setProperty('--g-box-bg-block', 'transparent');
        root.style.setProperty('--g-box-bg-line', 'transparent');
        root.style.setProperty('--g-box-padding-block', '0');
        root.style.setProperty('--g-box-padding-line-v', '0');
        root.style.setProperty('--g-box-padding-line-h', '0');
        root.style.setProperty('--g-box-radius', '0');
    }
    
    const getDecor = (u, s) => {
        let decors = [];
        if (u) decors.push('underline');
        if (s) decors.push('line-through');
        return decors.length > 0 ? decors.join(' ') : 'none';
    };
    
    root.style.setProperty('--g-decor', getDecor(data.global.underline, data.global.strikethrough));

    // Alignments
    let justify = 'center';
    if (data.global.alignH === 'left') justify = 'flex-start';
    if (data.global.alignH === 'right') justify = 'flex-end';

    let align = 'center';
    if (data.global.alignV === 'top') align = 'flex-start';
    if (data.global.alignV === 'bottom') align = 'flex-end';

    root.style.setProperty('--g-justify', justify);
    root.style.setProperty('--g-align-items', align);
    root.style.setProperty('--g-text-align', data.global.alignH);

    // Margins
    if (data.global.margin) {
        root.style.setProperty('--g-m-top', `${data.global.margin.top}vh`);
        root.style.setProperty('--g-m-bottom', `${data.global.margin.bottom}vh`);
        root.style.setProperty('--g-m-left', `${data.global.margin.left}vw`);
        root.style.setProperty('--g-m-right', `${data.global.margin.right}vw`);
        
        const guide = document.getElementById('margin-guide');
        if (guide) {
            guide.style.display = data.global.margin.show ? 'block' : 'none';
        }
    }

    // Resolving 'inherit' safely for fonts
    const getFont = (val) => (!val || val === 'inherit') ? gFont : formatFontFamily(val);
    
    // Helper para herdar ou usar formatação própria
    const getFmt = (styleData, prop) => styleData.inheritFormat ? data.global[prop] : styleData[prop];

    // Style 1
    root.style.setProperty('--s1-color', data.special.style1.color);
    root.style.setProperty('--s1-font', getFont(data.special.style1.fontFamily));
    root.style.setProperty('--s1-weight', getFmt(data.special.style1, 'bold') ? '700' : 'inherit');
    root.style.setProperty('--s1-transform', getFmt(data.special.style1, 'uppercase') ? 'uppercase' : 'inherit');
    root.style.setProperty('--s1-style', getFmt(data.special.style1, 'italic') ? 'italic' : 'inherit');
    root.style.setProperty('--s1-decor', getDecor(getFmt(data.special.style1, 'underline'), getFmt(data.special.style1, 'strikethrough')));

    // Style 2
    root.style.setProperty('--s2-color', data.special.style2.color);
    root.style.setProperty('--s2-font', getFont(data.special.style2.fontFamily));
    root.style.setProperty('--s2-weight', getFmt(data.special.style2, 'bold') ? '700' : 'inherit');
    root.style.setProperty('--s2-transform', getFmt(data.special.style2, 'uppercase') ? 'uppercase' : 'inherit');
    root.style.setProperty('--s2-style', getFmt(data.special.style2, 'italic') ? 'italic' : 'inherit');
    root.style.setProperty('--s2-decor', getDecor(getFmt(data.special.style2, 'underline'), getFmt(data.special.style2, 'strikethrough')));

    // Style 3
    root.style.setProperty('--s3-color', data.special.style3.color);
    root.style.setProperty('--s3-font', getFont(data.special.style3.fontFamily));
    root.style.setProperty('--s3-weight', getFmt(data.special.style3, 'bold') ? '700' : 'inherit');
    root.style.setProperty('--s3-transform', getFmt(data.special.style3, 'uppercase') ? 'uppercase' : 'inherit');
    root.style.setProperty('--s3-style', getFmt(data.special.style3, 'italic') ? 'italic' : 'inherit');
    root.style.setProperty('--s3-decor', getDecor(getFmt(data.special.style3, 'underline'), getFmt(data.special.style3, 'strikethrough')));
}

function updateDisplay(data) {
    if (!data.active) {
        if (currentIsActive) {
            // Needs to hide
            triggerExit(data.animations.exit, () => {
                lyricsContainer.innerHTML = '';
                currentText = '';
            });
        }
        currentIsActive = false;
        return;
    }

    currentIsActive = true;

    // If text changed, trigger animation
    if (data.text !== currentText) {
        if (currentText !== '') {
            // Animate out old text, then animate in new text
            triggerExit(data.animations.exit, () => {
                renderText(data.text, data.global.box);
                triggerEntry(data.animations.entry);
            });
        } else {
            // First time showing text
            renderText(data.text, data.global.box);
            triggerEntry(data.animations.entry);
        }
    } else {
        // Text is same, just ensure it's rendered in case of first load with active=true
        if (lyricsContainer.innerHTML === '') {
            renderText(data.text, data.global.box);
            triggerEntry(data.animations.entry);
        }
    }
}

function renderText(rawText, boxData) {
    currentText = rawText;
    let html = rawText;
    
    // Regex style replacements...
    html = html.replace(/\*(.*?)\*/g, '<span class="style-1">$1</span>');
    html = html.replace(/\{(.*?)\}/g, '<span class="style-2">$1</span>');
    html = html.replace(/~(.*?)~/g, '<span class="style-3">$1</span>');
    
    if (boxData && boxData.active && boxData.type === 'line') {
        html = `<span class="line-wrapper">${html}</span>`;
    }

    lyricsContainer.innerHTML = html;
}

function triggerEntry(animName) {
    lyricsContainer.className = `lyrics-container entry-${animName}`;
}

function triggerExit(animName, callback) {
    lyricsContainer.className = `lyrics-container exit-${animName}`;
    
    // Wait for animation to finish. Most are 0.5s or 0.6s. We use 600ms as safe fallback.
    setTimeout(() => {
        if (callback) callback();
    }, 600);
}
