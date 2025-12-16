
// RADAR (homemade)
let radarConfig = null;

function initRadar() {
    const canvas = document.getElementById("radarCanvas");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth * dpr;
    canvas.width = size;
    canvas.height = size;

    const center = { x: size / 2, y: size / 2 };
    const maxRadius = size * 0.34;
    const levels = 4;

    const scores = topics.map(t => t.score);
    const angles = topics.map((_, i) => (Math.PI * 2 * i / topics.length) - Math.PI / 2);

    radarConfig = { canvas, ctx, size, center, maxRadius, levels, scores, angles };

    const startTime = performance.now();
    const duration = 900;

    function draw(now) {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);

        drawRadarBase();
        drawRadarPolygon(eased);

        if (progress < 1) requestAnimationFrame(draw);
    }

    function drawRadarBase() {
        const { ctx, size, center, maxRadius, levels, angles } = radarConfig;
        ctx.clearRect(0,0,size,size);

        ctx.save();
        ctx.strokeStyle = "rgba(148,163,184,0.4)";
        ctx.lineWidth = 1;
        for (let l = 1; l <= levels; l++) {
            const r = maxRadius * l / levels;
            ctx.beginPath();
            ctx.arc(center.x, center.y, r, 0, Math.PI*2);
            ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "rgba(148,163,184,0.25)";
        ctx.lineWidth = 1;
        angles.forEach(angle => {
            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(center.x + maxRadius * Math.cos(angle), center.y + maxRadius * Math.sin(angle));
            ctx.stroke();
        });
        ctx.restore();
    }

    function drawRadarPolygon(eased = 1) {
        const { ctx, center, maxRadius, scores, angles } = radarConfig;

        ctx.save();
        const gradient = ctx.createLinearGradient(center.x - maxRadius, center.y - maxRadius, center.x + maxRadius, center.y + maxRadius);
        gradient.addColorStop(0, "rgba(56,189,248,0.38)");
        gradient.addColorStop(0.5, "rgba(34,197,94,0.45)");
        gradient.addColorStop(1, "rgba(59,130,246,0.48)");

        ctx.beginPath();
        scores.forEach((score, i) => {
            const ratio = (score / 100) * eased;
            const r = maxRadius * (0.15 + 0.85 * ratio);
            const x = center.x + r * Math.cos(angles[i]);
            const y = center.y + r * Math.sin(angles[i]);
            if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        });
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = "rgba(15,23,42,0.55)";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        scores.forEach((score, i) => {
            const ratio = (score / 100) * eased;
            const r = maxRadius * (0.15 + 0.85 * ratio);
            const x = center.x + r * Math.cos(angles[i]);
            const y = center.y + r * Math.sin(angles[i]);
            const pointColor = colorForScore(score);

            ctx.beginPath();
            ctx.arc(x,y,5,0,Math.PI*2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x,y,4,0,Math.PI*2);
            ctx.fillStyle = pointColor;
            ctx.fill();
        });

        ctx.restore();
    }

    radarConfig.drawBase = () => {
        const { ctx, size } = radarConfig;
        ctx.clearRect(0,0,size,size);
        const { center, maxRadius, levels, angles } = radarConfig;
        ctx.save();
        ctx.strokeStyle = "rgba(148,163,184,0.4)";
        ctx.lineWidth = 1;
        for (let l = 1; l <= levels; l++) {
            const r = maxRadius * l / levels;
            ctx.beginPath();
            ctx.arc(center.x, center.y, r, 0, Math.PI*2);
            ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "rgba(148,163,184,0.25)";
        ctx.lineWidth = 1;
        angles.forEach(angle => {
            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(center.x + maxRadius * Math.cos(angle), center.y + maxRadius * Math.sin(angle));
            ctx.stroke();
        });
        ctx.restore();
        drawRadarPolygon(1);
    };

    requestAnimationFrame(draw);

    // legend
    const legend = document.getElementById("radarLegend");
    if (legend) {
        legend.innerHTML = topics.map((t) => `
            <div class="legend-item">
                <span class="legend-color" style="background:${colorForScore(t.score)}"></span>
                <span>${t.name}</span>
            </div>
        `).join("");
    }
}

// ICONES AUTOUR DU RADAR + FOCUS PANEL
let currentFocusIndex = null;

function buildRadarIcons() {
    const radarIconsRing = document.getElementById("radarIconsRing");
    if (!radarIconsRing) return;
    
    const rect = radarIconsRing.getBoundingClientRect();
    const cx = 50;
    const cy = 50;
    const radius = 35; // en pourcentage du conteneur

    radarIconsRing.innerHTML = "";

    topics.forEach((t, i) => {
        const angle = (360 / topics.length) * i - 90; // start at top
        const rad = angle * Math.PI / 180;
        const x = cx + radius * Math.cos(rad);
        const y = cy + radius * Math.sin(rad);

        const btn = document.createElement("button");
        btn.className = "radar-icon-btn";
        btn.style.left = x + "%";
        btn.style.top = y + "%";
        btn.innerHTML = t.icon;
        btn.setAttribute("data-index", i.toString());
        btn.style.width = "32px";
        btn.style.height = "32px";
        btn.style.fontSize = "18px";

        btn.addEventListener("click", () => enterFocus(i));

        radarIconsRing.appendChild(btn);
    });
}

function enterFocus(index) {
    currentFocusIndex = index;
    const t = topics[index];

    const focusIcon = document.getElementById("focusIcon");
    const focusTitle = document.getElementById("focusTitle");
    const focusChip = document.getElementById("focusChip");
    const focusBody = document.getElementById("focusBody");
    const focusTags = document.getElementById("focusTags");
    const focusMetrics = document.getElementById("focusMetrics");
    const focusPanel = document.getElementById("focusPanel");

    if (!focusPanel) return;

    // maj contenu
    if (focusIcon) focusIcon.textContent = t.icon;
    if (focusTitle) focusTitle.textContent = t.name;
    if (focusChip) {
        focusChip.textContent =
            t.investigation === 0 ? "Non exploré" :
            t.investigation === 1 ? "Questionnaire simple" :
            t.investigation === 2 ? "Questionnaire avancé" :
            t.investigation === 3 ? "Tracking en cours" :
            "Analyses bio + tracking";
    }
    if (focusBody) focusBody.textContent = t.description;
    if (focusTags) {
        focusTags.innerHTML = t.tags.map(tag => `<span class="focus-tag">${tag}</span>`).join("");
    }

    const color = colorForScore(t.score);
    if (focusMetrics) {
        focusMetrics.innerHTML = `
            <div class="focus-metric-pill">Score actuel : ${t.score} / 100</div>
            <div class="focus-metric-pill">Priorité : ${
                t.score < 55 ? "Niveau 1 (à suivre de près)" :
                t.score < 70 ? "Niveau 2" :
                "Zone stable"
            }</div>
            <div class="focus-metric-pill" style="border-color:${color};">Couleur clinique : ${color}</div>
        `;
    }

    // visuel : activer bouton
    document.querySelectorAll(".radar-icon-btn").forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`.radar-icon-btn[data-index="${index}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    // afficher panneau focus (le quart du radar qui devient carré)
    focusPanel.classList.add("visible");
}

function exitFocus() {
    currentFocusIndex = null;
    const focusPanel = document.getElementById("focusPanel");
    if (focusPanel) focusPanel.classList.remove("visible");
    document.querySelectorAll(".radar-icon-btn").forEach(btn => btn.classList.remove("active"));
}

// Initialisation
window.addEventListener("load", () => {
    initRadar();
    buildRadarIcons();
    
    const focusBackBtn = document.getElementById("focusBackBtn");
    if (focusBackBtn) {
        focusBackBtn.addEventListener("click", exitFocus);
    }
});
