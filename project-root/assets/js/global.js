

/* ---------------------------------------------------------- */
/* GLOBAL DATA: topics */
/* ---------------------------------------------------------- */

const topics = [
    {
        icon: "🌙",
        name: "Sommeil",
        investigation: 2,
        score: 42,
        tags: ["Réveils nocturnes", "Routine instable"],
        description: "Qualité globale du sommeil, continuité de nuit et stabilité des routines d’endormissement et de lever."
    },
    {
        icon: "🔥",
        name: "Addiction",
        investigation: 1,
        score: 48,
        tags: ["Craving", "Contexte social"],
        description: "Dynamique de dépendance, déclencheurs, gestion des envies et exposition aux contextes à risque."
    },
    {
        icon: "🦠",
        name: "Digestif",
        investigation: 3,
        score: 70,
        tags: ["Ballonnements", "Irritation"],
        description: "Fonction digestive, tolérances alimentaires, confort intestinal et liens avec l’inflammation systémique."
    },
    {
        icon: "🧬",
        name: "Immunitaire",
        investigation: 4,
        score: 55,
        tags: ["Inflammation", "Marqueurs IgG"],
        description: "Profil inflammatoire, réponses immunitaires et facteurs de vulnérabilité sur le moyen terme."
    },
    {
        icon: "🏃‍♂️",
        name: "Activité physique",
        investigation: 2,
        score: 82,
        tags: ["Mobilité", "Volume hebdo"],
        description: "Niveau d’activité, équilibre charge/récupération et intégration du mouvement dans le quotidien."
    },
    {
        icon: "🧠",
        name: "Neurobiologique",
        investigation: 1,
        score: 60,
        tags: ["Stress", "Régulation émotionnelle"],
        description: "Réactivité au stress, régulation des systèmes neurobiologiques et équilibre des états d’activation."
    },
    {
        icon: "💬",
        name: "Psychologique",
        investigation: 3,
        score: 73,
        tags: ["Ruminations", "Motivation"],
        description: "Schémas de pensée, dynamique motivationnelle, ruminations et ressources psychiques disponibles."
    }
];

/* ---------------------------------------------------------- */
/* HELPERS */
/* ---------------------------------------------------------- */

function colorForScore(score) {
    if (score < 55) return "#f97373";
    if (score < 70) return "#fb923c";
    if (score < 82) return "#34d399";
    return "#22c55e";
}

function priorityLevel(score){
    return score < 55 ? 1 : score < 70 ? 2 : score < 82 ? 3 : 4;
}

/* ---------------------------------------------------------- */
/* SUMMARY COMPUTATION */
/* ---------------------------------------------------------- */

function computeSummary() {
    const avgScore = 69;  // from your original logic
    const inv = topics.map(t => t.investigation);
    const avgInvestigation = (inv.reduce((a,b)=>a+b,0) / inv.length).toFixed(1);
    const priority1 = topics.filter(t => t.score < 55).length;

    const elScore = document.getElementById("globalScore");
    const elInv   = document.getElementById("investigationMean");
    const elP1    = document.getElementById("priorityCount");

    if (elScore) elScore.textContent = avgScore;
    if (elInv)   elInv.textContent = avgInvestigation;
    if (elP1)    elP1.textContent = priority1;
}

/* ---------------------------------------------------------- */
/* TOPIC GRID CREATION */
/* ---------------------------------------------------------- */

let grouped = { 1: [], 2: [], 3: [], 4: [] };

topics.forEach((t, index)=>{
    const p = priorityLevel(t.score);
    grouped[p].push({...t, index});
});

function createTopicCard(t){
    const card = document.createElement("div");
    card.className = "topic-card";

    let stepsHTML = "";
    for (let i = 0; i < 4; i++) {
        stepsHTML += `<div class="step ${i < t.investigation ? "active" : ""}"></div>`;
    }

    const barColor = colorForScore(t.score);

    card.innerHTML = `
        <div class="topic-header">
            <div class="topic-title-block">
                <div class="topic-icon">${t.icon}</div>
                <div class="topic-name">${t.name}</div>
            </div>
            <div class="topic-chip">
                ${t.investigation === 0 ? "Non exploré" :
                    t.investigation === 1 ? "Q° simple" :
                    t.investigation === 2 ? "Q° avancé" :
                    t.investigation === 3 ? "Tracking" :
                    "Bio + tracking"}
            </div>
        </div>

        <div class="investigation-row">
            <span>Niveau d’investigation</span>
            <div class="steps">${stepsHTML}</div>
        </div>

        <div class="score-row">
            <span>Niveau actuel</span>
            <div class="score-bar">
                <div class="score-fill" style="background:${barColor}; width:0%;" data-target="${t.score}"></div>
            </div>
            <div class="score-label-row">
                <span>${t.score} / 100</span>
                <span>${priorityLevel(t.score) === 1 ? "Priorité 1" :
                        priorityLevel(t.score) === 2 ? "Priorité 2" :
                        priorityLevel(t.score) === 3 ? "Priorité 3" :
                        "Zone stable"}</span>
            </div>
        </div>

        <div class="tags">
            ${t.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
        </div>
    `;
    return card;
}

function renderGrid(order="asc"){
    const grid = document.getElementById("topicGrid");
    if (!grid) return;

    grid.innerHTML = "";
    const levels = order === "asc" ? [1,2,3,4] : [4,3,2,1];

    levels.forEach(level=>{
        if(grouped[level].length){
            const rowTitle = document.createElement("h3");
            rowTitle.textContent = `Priorité ${level}`;
            rowTitle.style.marginTop = "24px";
            rowTitle.style.marginBottom = "8px";
            grid.appendChild(rowTitle);

            const row = document.createElement("div");
            row.className = "band-cards";

            grouped[level].forEach(t=>{
                row.appendChild(createTopicCard(t));
            });

            grid.appendChild(row);
        }
    });
}

/* ---------------------------------------------------------- */
/* FILTER LISTENER */
/* ---------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("priorityFilter");
    if (select){
        select.addEventListener("change", e => renderGrid(e.target.value));
    }

    renderGrid();
    computeSummary();

    document.querySelectorAll(".score-fill").forEach(el => {
        const target = parseInt(el.getAttribute("data-target"), 10) || 0;
        requestAnimationFrame(() => {
            el.style.width = `${target}%`;
        });
    });
});

/* ---------------------------------------------------------- */
/* NAVIGATION ACTIVE STATE (iframe sidebar) */
/* ---------------------------------------------------------- */

window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "activateNav"){
        const id = event.data.id;
        const links = document.querySelectorAll(".nav-item");
        links.forEach(a => a.classList.remove("active"));
        const target = document.querySelector(`.nav-item[href="${id}"]`);
        if (target) target.classList.add("active");
    }
});

/* ---------------------------------------------------------- */
/* NAVIGATION ACTIVE STATE (multipage) */
/* ---------------------------------------------------------- */

// Fonction pour initialiser le dark mode
function initThemeToggle() {
    const btn = document.getElementById("toggle-theme");
    if (btn) {
        // Retirer les anciens listeners pour éviter les doublons
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark");
            const mode = document.body.classList.contains("dark") ? "dark" : "light";
            localStorage.setItem("theme", mode);
            updateThemeButton(newBtn, mode);
        });
        
        // Mettre à jour le texte du bouton au chargement
        const currentMode = document.body.classList.contains("dark") ? "dark" : "light";
        updateThemeButton(newBtn, currentMode);
    }
}

function updateThemeButton(btn, mode) {
    if (mode === "dark") {
        btn.textContent = "☀️ Mode clair";
    } else {
        btn.textContent = "🌙 Mode sombre";
    }
}

// Appliquer le thème sauvegardé immédiatement
const saved = localStorage.getItem("theme");
if (saved === "dark") {
    document.body.classList.add("dark");
}

document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".nav-item");

    links.forEach(link => {
        const target = link.getAttribute("href");
        if (target && window.location.pathname.includes(target)) {
            link.classList.add("active");
        }
    });

    // Initialiser le toggle de thème
    initThemeToggle();
    
    // Observer pour détecter quand la sidebar est chargée
    const observer = new MutationObserver(() => {
        const btn = document.getElementById("toggle-theme");
        if (btn && !btn.hasAttribute("data-theme-initialized")) {
            btn.setAttribute("data-theme-initialized", "true");
            initThemeToggle();
        }
    });
    
    // Observer les changements dans app-sidebar
    const sidebar = document.querySelector("app-sidebar");
    if (sidebar) {
        observer.observe(sidebar, { childList: true, subtree: true });
    }
});