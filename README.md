# Application de suivi des interventions — Labo NumeriK's

Application web légère (HTML/CSS/JS) pensée pour une saisie rapide sur mobile et le suivi de productivité d'un service de réparation informatique/électronique.

## Fonctionnalités

- Saisie rapide par journée technicien:
  - date,
  - technicien,
  - interventions collectées (entrées),
  - interventions traitées (sorties),
  - heure de début / fin.
- Gestion des techniciens (ajout/suppression avec sécurité).
- Vue mensuelle de l'historique.
- Statistiques simples:
  - entrées,
  - sorties,
  - heures travaillées,
  - entrées/heure,
  - sorties/heure,
  - comparaison des sorties vs mois précédent,
  - comparaison des sorties vs même mois année précédente.
- Export/import JSON pour sauvegarder/restaurer l'historique.

## Lancer en local

Depuis ce dossier:

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000` dans le navigateur.

---

## Comment utiliser l'application ?

### 1) Démarrer

1. Lance le serveur local:

```bash
python3 -m http.server 8000
```

2. Ouvre `http://localhost:8000` dans ton navigateur (mobile ou PC).

### 2) Ajouter une intervention

1. Dans **Saisie d'une intervention**, renseigne:
   - la date,
   - le technicien,
   - le nombre d'interventions **collectées (entrées)**,
   - le nombre d'interventions **traitées (sorties)**,
   - l'heure de début et l'heure de fin.
2. Clique sur **➕ Enregistrer**.
3. L'entrée apparaît dans **Historique du mois** et les stats se mettent à jour automatiquement.

### 3) Filtrer et lire les stats

- Choisis le **mois** à analyser dans le filtre.
- Choisis **Service complet** (tous les techniciens) ou un technicien en particulier.
- Les cartes affichent:
  - entrées, sorties, heures travaillées,
  - entrées/heure et sorties/heure,
  - comparaison vs mois précédent et vs même mois de l'année précédente.

### 4) Gérer les techniciens

- Clique sur **Gérer** à côté du champ technicien.
- Ajoute un nom puis clique **Ajouter**.
- Supprime un technicien uniquement s'il n'est pas déjà utilisé dans l'historique.

### 5) Sauvegarder / restaurer les données

- **Exporter JSON**: crée un fichier de sauvegarde de tout l'historique.
- **Importer JSON**: recharge des données (même format que l'exemple en bas du README).
- Les données restent aussi en local dans le navigateur (`localStorage`).

---

## Comment tester l'appli ?

### 1) Vérification technique rapide

Vérifier que le JavaScript est valide:

```bash
node --check app.js
```

### 2) Test fonctionnel manuel (5 min)

1. Ouvrir l'application dans le navigateur.
2. Saisir une ligne avec:
   - date du jour,
   - un technicien,
   - `collectées = 5`, `traitées = 4`,
   - `début = 09:00`, `fin = 17:00`.
3. Cliquer **➕ Enregistrer**.
4. Vérifier:
   - la ligne apparaît dans le tableau,
   - les stats sont mises à jour,
   - `Heures travaillées` affiche ~`8.00 h`,
   - les ratios `Entrées / heure` et `Sorties / heure` changent.
5. Changer le filtre technicien sur **Service complet** puis sur le technicien ajouté pour vérifier la vue globale/individuelle.
6. Supprimer la ligne et confirmer que les stats reviennent à 0.

### 3) Test sauvegarde / restauration

1. Créer 1 ou 2 entrées.
2. Cliquer **📦 Exporter JSON**.
3. Recharger la page: les données restent présentes (localStorage).
4. Importer le fichier JSON exporté via **📥 Importer JSON**.
5. Vérifier que les données et techniciens sont bien restaurés.

### 4) Test mobile

Sur téléphone (ou mode responsive navigateur), vérifier:
- boutons facilement cliquables,
- formulaire lisible,
- tableau consultable en scroll horizontal.

## Données

Les données sont stockées en local dans le navigateur (`localStorage`).

Pour importer un historique existant:
1. Convertir les données vers le format JSON suivant:

```json
{
  "technicians": ["Alice", "Bob"],
  "entries": [
    {
      "id": "uuid",
      "date": "2026-01-15",
      "technician": "Alice",
      "collected": 4,
      "processed": 3,
      "startTime": "08:30",
      "endTime": "16:30"
    }
  ]
}
```

2. Utiliser le bouton **Importer JSON** dans l'application.
