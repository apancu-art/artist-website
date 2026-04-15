const config = {
    padding: 40
};

// 1. THE MUSICAL PROGRESSION
const Sequencer = {
    // A syncopated 7/8 rhythm for testing (accent, rest, accent, etc.)
    pattern: [1.5, 0.5, 1.0, 0.5, 1.8, 0.5, 1.0],
    index: 0,
    
    nextTick: function() {
        const scaleMod = this.pattern[this.index % this.pattern.length];
        this.index++;
        return scaleMod;
    },
    reset: function() { this.index = 0; }
};

// 2. THE PATHING ENGINE (Peter de Jong Attractor)
const AttractorEngine = {
    generatePath: function(numElements, ui) {
        const path = [];
        // Randomize the strange attractor constants between -3 and 3
        const a = (Math.random() * 6) - 3;
        const b = (Math.random() * 6) - 3;
        const c = (Math.random() * 6) - 3;
        const d = (Math.random() * 6) - 3;

        let x = 0;
        let y = 0;

        for (let i = 0; i < numElements; i++) {
            // Calculate next point in the attractor orbit
            const nextX = Math.sin(a * y) - Math.cos(b * x);
            const nextY = Math.sin(c * x) - Math.cos(d * y);
            x = nextX;
            y = nextY;

            // The output is roughly between -2 and 2. 
            // We map this math domain to your physical canvas dimensions.
            const mappedX = this.mapRange(x, -2, 2, config.padding, ui.width - config.padding);
            const mappedY = this.mapRange(y, -2, 2, config.padding, ui.height - config.padding);

            path.push({ x: mappedX, y: mappedY });
        }
        return path;
    },

    mapRange: function(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }
};

// 3. THE DRAFTING ENGINE
const Generator = {
    
    createSVG: function(ui) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", `${ui.width}mm`);
        svg.setAttribute("height", `${ui.height}mm`);
        svg.setAttribute("viewBox", `0 0 ${ui.width} ${ui.height}`);
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        
        if (ui.polarity === 'negative') {
            const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            bg.setAttribute("width", "100%");
            bg.setAttribute("height", "100%");
            bg.setAttribute("fill", "#000000");
            svg.appendChild(bg);
        }
        return svg;
    },

    applyStyle: function(element, ui, forceFill = null, forceStroke = null) {
        const shapeColor = ui.polarity === 'positive' ? '#000000' : '#ffffff';
        const useStroke = forceStroke !== null ? forceStroke : ui.hasStroke;
        const useFill = forceFill !== null ? forceFill : ui.hasFill;

        if (useStroke) {
            element.setAttribute("stroke", shapeColor);
            element.setAttribute("stroke-width", ui.stroke);
            element.setAttribute("stroke-linejoin", ui.corners);
            element.setAttribute("stroke-linecap", ui.corners === 'round' ? 'round' : 'square');
        } else {
            element.setAttribute("stroke", "none");
        }
        if (useFill) {
            element.setAttribute("fill", shapeColor);
        } else {
            element.setAttribute("fill", "none");
        }
    },

    // --- RULESETS (Now plotting at specific attractor coordinates) ---
    
    mechanical: function(ui) {
        const svg = this.createSVG(ui);
        const numElements = Math.floor(100 * ui.complexity);
        const coords = AttractorEngine.generatePath(numElements, ui);
        Sequencer.reset();

        coords.forEach(coord => {
            const scale = Sequencer.nextTick() * (ui.scaleVariance ? 1 : 1);
            const step = ui.stroke * 2 * scale;
            
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.applyStyle(path, ui);

            let d = `M ${coord.x} ${coord.y} `;
            let cx = coord.x, cy = coord.y;
            
            // Draw a small clustered mechanical block at this point in the orbit
            const segments = Math.floor(Math.random() * 3) + 2;
            for(let j=0; j<segments; j++) {
                const dirs = [{x: step, y: 0}, {x: -step, y: 0}, {x: 0, y: step}, {x: 0, y: -step}];
                const dir = dirs[Math.floor(Math.random() * dirs.length)];
                cx += dir.x; cy += dir.y;
                d += ui.corners === 'round' ? `Q ${cx - dir.x/2} ${cy - dir.y/2}, ${cx} ${cy} ` : `L ${cx} ${cy} `;
            }
            
            path.setAttribute("d", d);
            svg.appendChild(path);

            // Occasional reservoir node
            if (scale > 1.2) {
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", cx); circle.setAttribute("cy", cy);
                circle.setAttribute("r", ui.stroke * 1.5);
                this.applyStyle(circle, ui, true, false); 
                svg.appendChild(circle);
            }
        });
        return svg;
    },

    midCentury: function(ui) {
        const svg = this.createSVG(ui);
        const numElements = Math.floor(40 * ui.complexity);
        const coords = AttractorEngine.generatePath(numElements, ui);
        Sequencer.reset();

        coords.forEach((coord, i) => {
            const scale = Sequencer.nextTick() * (ui.scaleVariance ? 1 : 1);
            
            // Alternate between blobs and delicate line clusters
            if (i % 3 === 0) {
                const blob = document.createElementNS("http://www.w3.org/2000/svg", "path");
                this.applyStyle(blob, ui);
                const r = 15 * scale;
                let d = `M ${coord.x} ${coord.y - r} `;
                d += `C ${coord.x + r} ${coord.y - r}, ${coord.x + r*1.5} ${coord.y + r}, ${coord.x} ${coord.y + r} `;
                d += `C ${coord.x - r*0.8} ${coord.y + r}, ${coord.x - r} ${coord.y - r}, ${coord.x} ${coord.y - r} Z`;
                blob.setAttribute("d", d);
                svg.appendChild(blob);
            } else {
                for(let k=0; k<3; k++) {
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    const offset = k * ui.stroke * 2;
                    line.setAttribute("x1", coord.x + offset);
                    line.setAttribute("y1", coord.y);
                    line.setAttribute("x2", coord.x + offset);
                    line.setAttribute("y2", coord.y + (15 * scale));
                    this.applyStyle(line, ui, false, true);
                    line.setAttribute("stroke-width", ui.stroke / 1.5);
                    svg.appendChild(line);
                }
            }
        });
        return svg;
    },

    bauhaus: function(ui) {
        const svg = this.createSVG(ui);
        const numElements = Math.floor(60 * ui.complexity);
        const coords = AttractorEngine.generatePath(numElements, ui);
        Sequencer.reset();

        coords.forEach(coord => {
            const scale = Sequencer.nextTick() * (ui.scaleVariance ? 1 : 1);
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            this.applyStyle(rect, ui);
            
            const isThick = Math.random() > 0.5;
            const w = (isThick ? 10 + Math.random() * 20 : ui.stroke) * scale;
            const h = (isThick ? 10 + Math.random() * 20 : 30 + Math.random() * 30) * scale;
            
            // Snap to localized grid
            const snapX = Math.floor(coord.x / 10) * 10;
            const snapY = Math.floor(coord.y / 10) * 10;
            
            rect.setAttribute("x", snapX);
            rect.setAttribute("y", snapY);
            rect.setAttribute("width", isThick && Math.random() > 0.5 ? h : w);
            rect.setAttribute("height", isThick && Math.random() > 0.5 ? w : h);
            
            svg.appendChild(rect);
        });
        return svg;
    },

    organic: function(ui) {
        const svg = this.createSVG(ui);
        const numElements = Math.floor(80 * ui.complexity);
        const coords = AttractorEngine.generatePath(numElements, ui);
        Sequencer.reset();

        // For organic, we connect the attractor points continuously
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.applyStyle(path, ui);
        
        let d = `M ${coords[0].x} ${coords[0].y} `;
        
        for (let i = 1; i < coords.length; i++) {
            const scale = Sequencer.nextTick();
            // We use the scale variance to manipulate the bezier control points
            const ctrlX = coords[i-1].x + (coords[i].x - coords[i-1].x) * scale;
            const ctrlY = coords[i-1].y + (coords[i].y - coords[i-1].y) * -scale;
            
            d += ui.corners === 'miter' 
                ? `L ${coords[i].x} ${coords[i].y} `
                : `Q ${ctrlX} ${ctrlY}, ${coords[i].x} ${coords[i].y} `;
        }
        
        path.setAttribute("d", d);
        svg.appendChild(path);
        
        return svg;
    }
};

// --- Controller Logic remains identical ---
const container = document.getElementById('svg-container');

function getUIConfig() {
    return {
        ruleset: document.getElementById('ruleset').value,
        polarity: document.getElementById('polarity').value,
        width: parseFloat(document.getElementById('canvas-width').value) || 100,
        height: parseFloat(document.getElementById('canvas-height').value) || 100,
        stroke: parseFloat(document.getElementById('base-stroke').value) || 1.2,
        complexity: parseFloat(document.getElementById('complexity').value),
        corners: document.getElementById('corners').value,
        scaleVariance: document.getElementById('toggle-scale-variance').checked,
        hasStroke: document.getElementById('toggle-stroke').checked,
        hasFill: document.getElementById('toggle-fill').checked
    };
}

function render() {
    container.innerHTML = '';
    const strokeToggle = document.getElementById('toggle-stroke');
    const fillToggle = document.getElementById('toggle-fill');
    if (!strokeToggle.checked && !fillToggle.checked) { strokeToggle.checked = true; }

    const uiConfig = getUIConfig();
    const displayRatio = uiConfig.width / uiConfig.height;
    let displayW = 400, displayH = 400;
    if (displayRatio > 1) { displayH = 400 / displayRatio; } 
    else { displayW = 400 * displayRatio; }

    const svgElement = Generator[uiConfig.ruleset](uiConfig);
    svgElement.style.width = `${displayW}px`;
    svgElement.style.height = `${displayH}px`;
    container.appendChild(svgElement);
}

function downloadSVG() {
    const svgData = container.innerHTML;
    const blob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const uiConfig = getUIConfig();
    link.download = `strange_attractor_${uiConfig.ruleset}_${uiConfig.width}x${uiConfig.height}mm.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const inputs = document.querySelectorAll('input, select');
inputs.forEach(input => {
    if (input.type === 'number') { input.addEventListener('change', render); } 
    else { input.addEventListener('input', render); }
});

document.getElementById('generate-btn').addEventListener('click', render);
document.getElementById('download-btn').addEventListener('click', downloadSVG);

render();