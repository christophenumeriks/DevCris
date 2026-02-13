const STORAGE_KEY = "labonumeriks-interventions-v1";

const state = {
  technicians: ["Technicien 1"],
  entries: [],
};

const els = {
  form: document.getElementById("entry-form"),
  date: document.getElementById("date"),
  technician: document.getElementById("technician"),
  collected: document.getElementById("collected"),
  processed: document.getElementById("processed"),
  startTime: document.getElementById("startTime"),
  endTime: document.getElementById("endTime"),
  monthFilter: document.getElementById("monthFilter"),
  statsTechnician: document.getElementById("statsTechnician"),
  entriesBody: document.getElementById("entriesBody"),
  stats: document.getElementById("stats"),
  resetForm: document.getElementById("reset-form"),
  exportBtn: document.getElementById("export-btn"),
  importFile: document.getElementById("import-file"),
  manageTechs: document.getElementById("manage-techs"),
  techDialog: document.getElementById("tech-dialog"),
  techList: document.getElementById("tech-list"),
  newTech: document.getElementById("new-tech"),
  addTech: document.getElementById("add-tech"),
};

function load() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed.technicians) && parsed.technicians.length) {
      state.technicians = parsed.technicians;
    }
    if (Array.isArray(parsed.entries)) {
      state.entries = parsed.entries;
    }
  } catch {
    console.warn("Données locales corrompues, initialisation propre.");
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function defaultValues() {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const month = now.toISOString().slice(0, 7);
  els.date.value = day;
  els.monthFilter.value = month;
  els.startTime.value = "09:00";
  els.endTime.value = "17:00";
}

function renderTechnicians() {
  const options = state.technicians.map((t) => `<option value="${t}">${t}</option>`).join("");
  els.technician.innerHTML = options;
  els.statsTechnician.innerHTML = `<option value="all">Service complet</option>${options}`;

  els.techList.innerHTML = "";
  state.technicians.forEach((tech, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${tech}</span><button class="remove" data-tech-index="${index}">Supprimer</button>`;
    els.techList.appendChild(li);
  });
}

function durationHours(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes += 24 * 60;
  return minutes / 60;
}

function currentFilterEntries() {
  const month = els.monthFilter.value;
  return state.entries.filter((entry) => entry.date.startsWith(month));
}

function comparePeriod(entries, refMonth, technician) {
  const filtered = entries.filter((e) => e.date.startsWith(refMonth));
  const scope = technician === "all" ? filtered : filtered.filter((e) => e.technician === technician);
  return aggregate(scope);
}

function aggregate(entries) {
  return entries.reduce(
    (acc, e) => {
      acc.collected += Number(e.collected);
      acc.processed += Number(e.processed);
      acc.hours += durationHours(e.startTime, e.endTime);
      return acc;
    },
    { collected: 0, processed: 0, hours: 0 }
  );
}

function pctDiff(current, previous) {
  if (previous === 0) return current === 0 ? "0%" : "+100%";
  const diff = ((current - previous) / previous) * 100;
  return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
}

function renderStats() {
  const allMonthEntries = currentFilterEntries();
  const tech = els.statsTechnician.value;
  const monthEntries = tech === "all" ? allMonthEntries : allMonthEntries.filter((e) => e.technician === tech);
  const current = aggregate(monthEntries);

  const [year, month] = els.monthFilter.value.split("-").map(Number);
  const prevMonthDate = new Date(year, month - 2, 1);
  const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const prevYearMonth = `${year - 1}-${String(month).padStart(2, "0")}`;

  const prevM = comparePeriod(state.entries, prevMonth, tech);
  const prevY = comparePeriod(state.entries, prevYearMonth, tech);

  const collectedHour = current.hours ? (current.collected / current.hours).toFixed(2) : "0.00";
  const processedHour = current.hours ? (current.processed / current.hours).toFixed(2) : "0.00";

  els.stats.innerHTML = `
    <article class="stat"><small>Entrées</small><strong>${current.collected}</strong></article>
    <article class="stat"><small>Sorties</small><strong>${current.processed}</strong></article>
    <article class="stat"><small>Heures travaillées</small><strong>${current.hours.toFixed(2)} h</strong></article>
    <article class="stat"><small>Entrées / heure</small><strong>${collectedHour}</strong></article>
    <article class="stat"><small>Sorties / heure</small><strong>${processedHour}</strong></article>
    <article class="stat"><small>Vs mois précédent (sorties)</small><strong>${pctDiff(current.processed, prevM.processed)}</strong></article>
    <article class="stat"><small>Vs année précédente (sorties)</small><strong>${pctDiff(current.processed, prevY.processed)}</strong></article>
  `;
}

function renderTable() {
  const entries = currentFilterEntries().sort((a, b) => b.date.localeCompare(a.date));
  els.entriesBody.innerHTML = "";

  for (const entry of entries) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.technician}</td>
      <td>${entry.collected}</td>
      <td>${entry.processed}</td>
      <td>${entry.startTime}</td>
      <td>${entry.endTime}</td>
      <td>${durationHours(entry.startTime, entry.endTime).toFixed(2)}</td>
      <td><button class="remove" data-id="${entry.id}">Supprimer</button></td>
    `;
    els.entriesBody.appendChild(tr);
  }
}

function refresh() {
  renderTechnicians();
  renderTable();
  renderStats();
}

els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const entry = {
    id: crypto.randomUUID(),
    date: els.date.value,
    technician: els.technician.value,
    collected: Number(els.collected.value),
    processed: Number(els.processed.value),
    startTime: els.startTime.value,
    endTime: els.endTime.value,
  };
  state.entries.push(entry);
  save();
  renderTable();
  renderStats();
  els.collected.value = 0;
  els.processed.value = 0;
});

els.entriesBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  state.entries = state.entries.filter((entry) => entry.id !== btn.dataset.id);
  save();
  renderTable();
  renderStats();
});

els.monthFilter.addEventListener("change", () => {
  renderTable();
  renderStats();
});

els.statsTechnician.addEventListener("change", renderStats);

els.resetForm.addEventListener("click", () => {
  els.form.reset();
  defaultValues();
});

els.exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `labonumeriks-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

els.importFile.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const content = await file.text();
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.entries) || !Array.isArray(parsed.technicians)) {
      alert("Format invalide.");
      return;
    }
    state.entries = parsed.entries;
    state.technicians = parsed.technicians;
    save();
    refresh();
  } catch {
    alert("JSON invalide.");
  }
});

els.manageTechs.addEventListener("click", () => {
  renderTechnicians();
  els.techDialog.showModal();
});

els.addTech.addEventListener("click", () => {
  const name = els.newTech.value.trim();
  if (!name || state.technicians.includes(name)) return;
  state.technicians.push(name);
  els.newTech.value = "";
  save();
  renderTechnicians();
});

els.techList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-tech-index]");
  if (!btn) return;
  if (state.technicians.length <= 1) {
    alert("Il faut conserver au moins un technicien.");
    return;
  }
  const index = Number(btn.dataset.techIndex);
  const removed = state.technicians[index];
  const isUsed = state.entries.some((entry) => entry.technician === removed);
  if (isUsed) {
    alert("Ce technicien est utilisé dans l'historique. Renommez plutôt qu'effacer.");
    return;
  }
  state.technicians.splice(index, 1);
  save();
  renderTechnicians();
});

load();
defaultValues();
refresh();
