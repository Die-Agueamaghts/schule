(() => {
  const resources = Array.isArray(window.LEARNING_RESOURCES) ? window.LEARNING_RESOURCES : [];
  const gradeDirectories = Array.isArray(window.GRADE_DIRECTORIES) ? window.GRADE_DIRECTORIES : [];
  const grid = document.querySelector("#resource-grid");
  const searchInput = document.querySelector("#search-input");
  const classFilter = document.querySelector("#class-filter");
  const subjectFilter = document.querySelector("#subject-filter");
  const sortSelect = document.querySelector("#sort-select");
  const resultTitle = document.querySelector("#results-title");
  const resultSubtitle = document.querySelector("#results-subtitle");
  const resultCount = document.querySelector("#result-count");
  const emptyState = document.querySelector("#empty-state");
  const gradeFolders = document.querySelector("#grade-folders");
  const selectedGradeTitle = document.querySelector("#selected-grade-title");
  const selectedGradeDescription = document.querySelector("#selected-grade-description");
  const subjectFolders = document.querySelector("#subject-folders");
  const categoryTabs = [...document.querySelectorAll(".category-tab")];
  const navItems = [...document.querySelectorAll(".nav-item[data-view]")];
  const favorites = new Set();
  let selectedCategory = "";
  let currentView = "all";
  let selectedGrade = gradeDirectories[0]?.grade ?? 4;

  const uniqueValues = (key) => [...new Set(resources.map((item) => item[key]).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "de", { numeric: true }));

  const populateSelect = (select, values) => {
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.append(option);
    });
  };

  const classNames = gradeDirectories.map(({ grade }) => `Klasse ${grade}`);
  populateSelect(classFilter, classNames);
  const directorySubjects = gradeDirectories.flatMap(({ subjects }) => subjects);
  populateSelect(subjectFilter, [...new Set([...uniqueValues("subject"), ...directorySubjects])]
    .sort((a, b) => a.localeCompare(b, "de")));

  const renderDirectory = () => {
    gradeFolders.innerHTML = gradeDirectories.map(({ grade, school, subjects }) =>
      `<button class="grade-folder${grade === selectedGrade ? " is-selected" : ""}" type="button" data-grade="${grade}" aria-pressed="${grade === selectedGrade}" aria-label="Klasse ${grade}, ${subjects.length} Fachordner, ${escapeHtml(school)}">
        <span class="grade-folder-icon" aria-hidden="true">▤</span>
        <span class="grade-folder-label"><strong>Klasse ${grade}</strong><small>${escapeHtml(school)}</small></span>
        <span class="grade-folder-count">${subjects.length}</span>
      </button>`).join("");

    const directory = gradeDirectories.find(({ grade }) => grade === selectedGrade);
    if (!directory) {
      selectedGradeTitle.textContent = "Keine Klassenordner vorhanden";
      selectedGradeDescription.textContent = "";
      subjectFolders.replaceChildren();
      return;
    }

    selectedGradeTitle.textContent = `Klasse ${directory.grade}`;
    selectedGradeDescription.textContent = `${directory.school} · ${directory.subjects.length} Fachordner`;
    subjectFolders.innerHTML = directory.subjects.map((subject) =>
      `<button class="subject-folder" type="button" data-subject="${escapeHtml(subject)}" aria-label="${escapeHtml(subject)} in Klasse ${directory.grade} öffnen">
        <span class="subject-folder-icon" aria-hidden="true">${escapeHtml(subject.slice(0, 1))}</span>
        <span>${escapeHtml(subject)}</span>
        <span class="subject-folder-arrow" aria-hidden="true">›</span>
      </button>`).join("");
  };

  const updateSubjectOptions = () => {
    const availableSubjects = classFilter.value
      ? gradeDirectories.find(({ grade }) => `Klasse ${grade}` === classFilter.value)?.subjects ?? []
      : [...new Set([...uniqueValues("subject"), ...directorySubjects])].sort((a, b) => a.localeCompare(b, "de"));
    const previousValue = subjectFilter.value;
    subjectFilter.replaceChildren(new Option("Alle Fächer", ""));
    populateSelect(subjectFilter, availableSubjects);
    subjectFilter.value = availableSubjects.includes(previousValue) ? previousValue : "";
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);

  const subjectClass = (subject) => {
    const knownSubjects = ["deutsch", "englisch", "biologie", "geschichte", "chemie"];
    const normalized = String(subject ?? "").toLocaleLowerCase("de");
    return knownSubjects.includes(normalized) ? normalized : "mathematik";
  };

  const matchesFilters = (item) => {
    const query = searchInput.value.trim().toLocaleLowerCase("de");
    const searchable = [item.title, item.description, item.subject, item.class, item.topic, item.type, item.source]
      .filter(Boolean).join(" ").toLocaleLowerCase("de");
    return (!query || searchable.includes(query))
      && (!classFilter.value || item.class === classFilter.value)
      && (!subjectFilter.value || item.subject === subjectFilter.value)
      && (!selectedCategory || item.type === selectedCategory)
      && (currentView !== "favorites" || favorites.has(item.url + item.title));
  };

  const updateCounters = () => {
    document.querySelector("#all-count").textContent = resources.length;
    document.querySelector("#tab-all-count").textContent = resources.length;
    document.querySelector("#favorite-count").textContent = favorites.size;
  };

  const renderCard = (item) => {
    const isFavorite = favorites.has(item.url + item.title);
    const safeUrl = escapeHtml(item.url || "#");
    const categoryClass = String(item.type ?? "").toLocaleLowerCase("de");
    return `<article class="resource-card">
      <div class="card-topline">
        <span class="card-subject"><span class="subject-mark ${subjectClass(item.subject)}">${escapeHtml((item.subject || "?").slice(0, 1))}</span>${escapeHtml(item.subject)} <span aria-hidden="true">·</span> ${escapeHtml(item.topic)}</span>
        <button class="favorite-button${isFavorite ? " is-favorite" : ""}" type="button" data-favorite="${escapeHtml(item.url + item.title)}" aria-label="${isFavorite ? "Aus Merkliste entfernen" : "Zur Merkliste hinzufügen"}" aria-pressed="${isFavorite}">${isFavorite ? "★" : "☆"}</button>
      </div>
      <h3 class="card-title">${escapeHtml(item.title)}</h3>
      <p class="card-description">${escapeHtml(item.description)}</p>
      <div class="card-tags"><span class="tag">${escapeHtml(item.topic)}</span><span class="tag type-${escapeHtml(categoryClass)}">${escapeHtml(item.type)}</span></div>
      <div class="card-footer"><span class="card-class">${escapeHtml(item.class)}${item.source ? ` · ${escapeHtml(item.source)}` : ""}</span><a class="card-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer">Öffnen <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9 3h4v4M13 3 7 9"/><path d="M11 9v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3"/></svg></a></div>
    </article>`;
  };

  const render = () => {
    let filtered = resources.filter(matchesFilters);
    if (sortSelect.value === "title") filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title, "de"));
    if (sortSelect.value === "subject") filtered = [...filtered].sort((a, b) => a.subject.localeCompare(b.subject, "de") || a.title.localeCompare(b.title, "de"));
    grid.innerHTML = filtered.map(renderCard).join("");
    grid.hidden = filtered.length === 0;
    emptyState.hidden = filtered.length !== 0;
    resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "Material" : "Materialien"}`;
    resultTitle.textContent = currentView === "favorites" ? "Deine Merkliste" : "Entdecke deine Materialien";
    resultSubtitle.textContent = currentView === "favorites"
      ? "Deine gespeicherten Materialien auf einen Blick."
      : "Alles, was du zum Lernen brauchst – an einem Platz.";
    updateCounters();
  };

  categoryTabs.forEach((tab) => tab.addEventListener("click", () => {
    selectedCategory = tab.dataset.category;
    categoryTabs.forEach((item) => item.classList.toggle("selected", item === tab));
    render();
  }));
  navItems.forEach((item) => item.addEventListener("click", () => {
    currentView = item.dataset.view;
    navItems.forEach((nav) => nav.classList.toggle("active", nav === item));
    render();
  }));
  [searchInput, classFilter, subjectFilter, sortSelect].forEach((control) => control.addEventListener("input", render));
  sortSelect.addEventListener("change", render);

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite]");
    if (!button) return;
    const key = button.dataset.favorite;
    if (favorites.has(key)) favorites.delete(key);
    else favorites.add(key);
    render();
  });

  gradeFolders.addEventListener("click", (event) => {
    const button = event.target.closest("[data-grade]");
    if (!button) return;
    selectedGrade = Number(button.dataset.grade);
    renderDirectory();
  });

  subjectFolders.addEventListener("click", (event) => {
    const button = event.target.closest("[data-subject]");
    if (!button) return;
    classFilter.value = `Klasse ${selectedGrade}`;
    updateSubjectOptions();
    subjectFilter.value = button.dataset.subject;
    render();
    document.querySelector(".results-section").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  classFilter.addEventListener("change", () => {
    updateSubjectOptions();
    render();
  });

  document.querySelector("#reset-filters").addEventListener("click", () => {
    searchInput.value = "";
    classFilter.value = "";
    subjectFilter.value = "";
    updateSubjectOptions();
    selectedCategory = "";
    currentView = "all";
    sortSelect.value = "recommended";
    categoryTabs.forEach((tab) => tab.classList.toggle("selected", tab.dataset.category === ""));
    navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === "all"));
    render();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
      event.preventDefault();
      searchInput.focus();
    }
    if (event.key === "Escape" && document.activeElement === searchInput) {
      searchInput.value = "";
      searchInput.blur();
      render();
    }
  });

  renderDirectory();
  render();
})();
