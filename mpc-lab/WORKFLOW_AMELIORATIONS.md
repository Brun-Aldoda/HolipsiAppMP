# 🚀 Cockpit IA — Workflow Socle v2 — Améliorations

## 📋 Vue d'ensemble

Le workflow **"Cockpit IA — Workflow Socle v2 (Complet)"** a été entièrement refactoré pour implémenter un système complet de clarification d'intuitions avec persistance dans Notion et logique décisionnelle.

## ✨ Améliorations principales

### 1. **Ordre d'exécution optimisé**

**AVANT** : L'intuition était créée APRÈS la clarification (impossible de relier)

**MAINTENANT** : 
- ✅ L'intuition est créée **EN PREMIER** dans Notion
- ✅ Son ID et URL sont capturés
- ✅ Ces informations sont transmises à toutes les étapes suivantes

### 2. **Node "Prepare AI Input" complété**

**AVANT** : Node vide, pas de contexte projet

**MAINTENANT** :
- ✅ Capture `intuition_text` depuis "Capture Intuition"
- ✅ Capture `intuition_id` et `intuition_url` depuis "Create Intuition in Notion (First)"
- ✅ Capture `project_context` depuis "Load Project Context" (sérialisé en JSON)
- ✅ Toutes ces données sont transmises à l'IA

### 3. **Schéma JSON strict pour l'IA**

**AVANT** : Prompt vague, réponse non structurée

**MAINTENANT** :
- ✅ Utilisation de `response_format: {"type": "json_object"}` (OpenAI)
- ✅ Schéma JSON strict défini dans le prompt système :
  ```json
  {
    "subject": "Synthèse courte (max 100 caractères)",
    "reformulation": "Reformulation claire et structurée",
    "questions_ouvertes": "Liste des questions (une par ligne)",
    "hypotheses": "Hypothèses sur ce que l'utilisateur veut",
    "niveau_clarte": "Faible" | "Moyen" | "Élevé",
    "needs_clarification": true | false,
    "recommandation": "Continuer" | "Clarifier" | "Implémenter"
  }
  ```

### 4. **Parsing robuste de la réponse IA**

**AVANT** : Parsing basique avec regex simple

**MAINTENANT** :
- ✅ Tentative de parsing JSON direct
- ✅ Fallback : extraction depuis markdown code blocks
- ✅ Valeurs par défaut pour tous les champs
- ✅ Préservation de `intuition_id` et `intuition_url` à travers toutes les étapes

### 5. **Création complète de la Clarification dans Notion**

**AVANT** : Clarification créée sans propriétés complètes, pas de relation

**MAINTENANT** :
- ✅ **Titre** : `subject` de l'IA
- ✅ **Contenu structuré** : Markdown avec sections Reformulation, Questions ouvertes, Hypothèses
- ✅ **Propriétés** :
  - `Sujet` : Synthèse courte
  - `Clarification` : Reformulation complète
  - `Statut` : Dynamique selon `needs_clarification` ("En cours" si besoin, "À valider" si prêt)
  - `Version` : 1
  - `Date` : Date actuelle
- ✅ **Relation** : Liée à l'Intuition via "Intuitions liées"

### 6. **Logique décisionnelle complète**

**AVANT** : Switch basique, pas de logique claire

**MAINTENANT** :
- ✅ **La clarification est créée dans TOUS les cas** (pas seulement si `needs_clarification=true`)
- ✅ **Switch "Needs Clarification ?"** :
  - **Sortie "true"** (besoin de clarification) → "Prepare Cursor Context" (pour suivi)
  - **Sortie "false"** (prêt) → "Update Intuition Status" (marque comme "Clarifié") puis "Prepare Cursor Context"

### 7. **Mise à jour du statut de l'Intuition**

**AVANT** : Pas de mise à jour automatique

**MAINTENANT** :
- ✅ Si `needs_clarification = false` → Statut passe de "Brut" à "Clarifié"
- ✅ L'intuition reste "Brut" si clarification nécessaire

### 8. **Préparation du contexte Cursor**

**AVANT** : Pas de préparation pour Cursor

**MAINTENANT** :
- ✅ Node "Prepare Cursor Context" qui prépare :
  - `intuition_id` et `intuition_url`
  - `clarification_subject` et `clarification_reformulation`
  - `ready_for_implementation` (booléen)
  - `recommandation` (Continuer/Clarifier/Implémenter)
- ✅ Prêt pour intégration future avec Cursor

## 🔄 Flux d'exécution

```
1. Manual Trigger
   ↓
2. Capture Intuition (Set)
   ↓
3. Create Intuition in Notion (First) ← CRÉATION IMMÉDIATE
   ↓
4. Load Project Context (Notion getAll)
   ↓
5. Prepare AI Input (Set) ← CONTEXTE COMPLET
   ↓
6. AI Clarifier (HTTP) ← PROMPT STRICT + JSON
   ↓
7. Parse AI Response (Code) ← PARSING ROBUSTE
   ↓
8. Create Clarification in Notion ← CRÉATION COMPLÈTE + RELATION
   ↓
9. Needs Clarification ? (Switch)
   ├─ true → Prepare Cursor Context (suivi)
   └─ false → Update Intuition Status → Prepare Cursor Context (prêt)
```

## 📊 Structure des données

### Données transmises entre nodes

**Après "Prepare AI Input"** :
```json
{
  "intuition_text": "...",
  "intuition_id": "uuid",
  "intuition_url": "https://notion.so/...",
  "project_context": "{...}"
}
```

**Après "Parse AI Response"** :
```json
{
  "subject": "...",
  "reformulation": "...",
  "questions_ouvertes": "...",
  "hypotheses": "...",
  "niveau_clarte": "Faible|Moyen|Élevé",
  "needs_clarification": true|false,
  "recommandation": "Continuer|Clarifier|Implémenter",
  "intuition_id": "uuid",
  "intuition_url": "https://notion.so/..."
}
```

**Après "Prepare Cursor Context"** :
```json
{
  "intuition_id": "uuid",
  "intuition_url": "https://notion.so/...",
  "clarification_subject": "...",
  "clarification_reformulation": "...",
  "ready_for_implementation": true|false,
  "recommandation": "..."
}
```

## 🎯 Points d'attention

### 1. **Node "Load Project Context"**

⚠️ **Attention** : Le node utilise `operation: "getAll"` sans spécifier de base de données.

**Recommandation** : 
- Soit spécifier une base de données précise (si vous avez une base "Contexte Projet")
- Soit filtrer les résultats pour ne garder que les données pertinentes
- Soit créer une base dédiée "Contexte Projet" avec les informations importantes

### 2. **Gestion des erreurs**

Le workflow actuel ne gère pas explicitement les erreurs. **Recommandations** :
- Ajouter des nodes "Error Trigger" pour capturer les erreurs
- Logger les erreurs dans Notion ou un système de logs
- Ajouter des fallbacks si l'IA ne répond pas correctement

### 3. **Boucle de clarification**

Actuellement, si `needs_clarification = true`, le workflow s'arrête. **Pour une boucle** :
- Ajouter un node qui demande des clarifications supplémentaires à l'utilisateur
- Relancer le workflow avec les nouvelles informations
- Créer une nouvelle version de la clarification (incrémenter `Version`)

### 4. **Intégration Telegram**

Pour ajouter Telegram comme source d'input :
- Remplacer "Manual Trigger" par "Telegram Trigger"
- Extraire le message Telegram dans "Capture Intuition"
- Adapter le format selon le type de message (texte, voix, image)

### 5. **Intégration Cursor**

Le node "Prepare Cursor Context" prépare les données, mais il faudra :
- Créer un webhook ou une API pour déclencher Cursor
- Transmettre le contexte préparé
- Gérer la réponse de Cursor (succès/échec)

## 🔧 Améliorations futures possibles

1. **Versioning des clarifications** : Créer une nouvelle version si clarification nécessaire
2. **Notifications** : Notifier l'utilisateur quand une clarification est prête
3. **Métriques** : Tracker le nombre de clarifications nécessaires vs prêtes
4. **Templates** : Créer des templates de clarification selon le type d'intuition
5. **Multi-langue** : Adapter le workflow pour gérer plusieurs langues

## ✅ Checklist de validation

- [x] Intuition créée en premier dans Notion
- [x] Contexte projet chargé et transmis à l'IA
- [x] Schéma JSON strict défini et utilisé
- [x] Parsing robuste avec fallbacks
- [x] Clarification créée avec toutes les propriétés
- [x] Relation Clarification ↔ Intuition établie
- [x] Statut dynamique selon `needs_clarification`
- [x] Mise à jour du statut de l'Intuition si prêt
- [x] Contexte Cursor préparé
- [x] Logique conditionnelle complète

## 📝 Notes techniques

- **Credentials Notion** : Tous les nodes Notion utilisent le même credential (`OS2ZpzTAq4IhTxLB`)
- **API Key OpenAI** : Actuellement hardcodée dans le node HTTP (à sécuriser avec credentials n8n)
- **Version n8n** : Compatible avec n8n 1.12x
- **Nodes utilisés** : Manual Trigger, Set, Notion, HTTP Request, Code, Switch

---

**Workflow ID** : `68WpVheLmyAsbxer`  
**Version** : v2 (Complet)  
**Dernière mise à jour** : 2025-12-16

