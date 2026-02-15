(function () {
  const state = {
    basics: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      photoUrl: "",
      photoDataUrl: "",
      summary: "",
      skills: ""
    },
    experiences: [],
    education: [],
    projects: [],
    customFields: [],
    custom: {
      layoutMode: "sidebar",
      templateMode: "modern",
      fontMode: "plex",
      headerAlign: "left",
      photoShape: "circle",
      photoFrame: "clean",
      photoZoom: "100",
      photoX: "50",
      photoY: "50",
      sectionStyle: "line",
      primaryColor: "#1767a8",
      backgroundColor: "#ffffff",
      textColor: "#1a202c",
      density: "1",
      layoutElement: "profile",
      elementDragEnabled: false,
      elementLayouts: {}
    }
  };

  const form = document.getElementById("cvForm");
  const experienceList = document.getElementById("experienceList");
  const educationList = document.getElementById("educationList");
  const projectList = document.getElementById("projectList");
  const customFieldList = document.getElementById("customFieldList");
  const previewPaper = document.getElementById("previewPaper");
  const photoFileInput = document.getElementById("photoFile");
  const clearPhotoBtn = document.getElementById("clearPhotoBtn");
  const downloadPdfBtn = document.getElementById("downloadPdfBtn");
  const resetDemoBtn = document.getElementById("resetDemoBtn");
  const layoutElementInput = document.getElementById("layoutElement");
  const elementOffsetXInput = document.getElementById("elementOffsetX");
  const elementOffsetYInput = document.getElementById("elementOffsetY");
  const elementWidthInput = document.getElementById("elementWidth");
  const elementFontSizeInput = document.getElementById("elementFontSize");
  const elementLineHeightInput = document.getElementById("elementLineHeight");
  const elementDragEnabledInput = document.getElementById("elementDragEnabled");
  const elementOffsetXValue = document.getElementById("elementOffsetXValue");
  const elementOffsetYValue = document.getElementById("elementOffsetYValue");
  const elementWidthValue = document.getElementById("elementWidthValue");
  const elementFontSizeValue = document.getElementById("elementFontSizeValue");
  const elementLineHeightValue = document.getElementById("elementLineHeightValue");
  const resetElementLayoutBtn = document.getElementById("resetElementLayoutBtn");
  const resetAllElementLayoutsBtn = document.getElementById("resetAllElementLayoutsBtn");

  if (
    !form ||
    !experienceList ||
    !educationList ||
    !projectList ||
    !customFieldList ||
    !previewPaper ||
    !photoFileInput ||
    !clearPhotoBtn ||
    !downloadPdfBtn ||
    !resetDemoBtn ||
    !layoutElementInput ||
    !elementOffsetXInput ||
    !elementOffsetYInput ||
    !elementWidthInput ||
    !elementFontSizeInput ||
    !elementLineHeightInput ||
    !elementDragEnabledInput ||
    !elementOffsetXValue ||
    !elementOffsetYValue ||
    !elementWidthValue ||
    !elementFontSizeValue ||
    !elementLineHeightValue ||
    !resetElementLayoutBtn ||
    !resetAllElementLayoutsBtn
  ) {
    return;
  }

  const layoutElementDefs = [
    { id: "headerPhoto", label: "Header: Profilbild" },
    { id: "name", label: "Header: Name" },
    { id: "headline", label: "Header: Berufsbezeichnung" },
    { id: "contact", label: "Header: Kontaktzeile" },
    { id: "profile", label: "Profilbereich" },
    { id: "experience", label: "Berufserfahrung" },
    { id: "projects", label: "Projekte" },
    { id: "skills", label: "Skills" },
    { id: "education", label: "Ausbildung" },
    { id: "customSidebar", label: "Eigene Felder (Sidebar)" },
    { id: "customContent", label: "Eigene Felder (Hauptbereich)" }
  ];
  const layoutElementIds = layoutElementDefs.map(function (item) {
    return item.id;
  });

  function uid(prefix) {
    return prefix + "-" + Math.random().toString(36).slice(2, 10);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function selectedAttr(value, expected) {
    return value === expected ? " selected" : "";
  }

  function sanitizeOption(value, allowed, fallback) {
    return allowed.includes(value) ? value : fallback;
  }

  function safeNumber(raw, fallback, min, max) {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    if (parsed < min) {
      return min;
    }
    if (parsed > max) {
      return max;
    }
    return parsed;
  }

  function defaultElementLayout() {
    return {
      x: 0,
      y: 0,
      width: 100,
      fontSize: 100,
      lineHeight: 140
    };
  }

  function createDefaultElementLayouts() {
    const map = {};
    layoutElementIds.forEach(function (id) {
      map[id] = defaultElementLayout();
    });
    return map;
  }

  function normalizeElementLayout(rawLayout) {
    const raw = rawLayout && typeof rawLayout === "object" ? rawLayout : {};
    return {
      x: Math.round(safeNumber(raw.x, 0, -220, 220)),
      y: Math.round(safeNumber(raw.y, 0, -220, 220)),
      width: Math.round(safeNumber(raw.width, 100, 45, 120)),
      fontSize: Math.round(safeNumber(raw.fontSize, 100, 70, 150)),
      lineHeight: Math.round(safeNumber(raw.lineHeight, 140, 90, 220))
    };
  }

  function ensureElementLayouts() {
    if (!state.custom.elementLayouts || typeof state.custom.elementLayouts !== "object") {
      state.custom.elementLayouts = createDefaultElementLayouts();
    }
    layoutElementIds.forEach(function (id) {
      state.custom.elementLayouts[id] = normalizeElementLayout(state.custom.elementLayouts[id]);
    });
  }

  function selectedLayoutElementId() {
    return sanitizeOption(String(state.custom.layoutElement || "profile"), layoutElementIds, "profile");
  }

  function getElementLayout(id) {
    const safeId = sanitizeOption(String(id || ""), layoutElementIds, "profile");
    ensureElementLayouts();
    return state.custom.elementLayouts[safeId];
  }

  function getElementLayoutLabel(id) {
    const found = layoutElementDefs.find(function (item) {
      return item.id === id;
    });
    return found ? found.label : id;
  }

  function resetElementLayout(id) {
    const safeId = sanitizeOption(String(id || ""), layoutElementIds, "profile");
    ensureElementLayouts();
    state.custom.elementLayouts[safeId] = defaultElementLayout();
  }

  function resetAllElementLayouts() {
    state.custom.elementLayouts = createDefaultElementLayouts();
  }

  function buildLayoutStyle(id) {
    const layout = getElementLayout(id);
    return [
      "--el-x:" + layout.x + "px",
      "--el-y:" + layout.y + "px",
      "--el-width:" + layout.width + "%",
      "--el-font-size:" + layout.fontSize + "%",
      "--el-line-height:" + (layout.lineHeight / 100).toFixed(2)
    ].join(";");
  }

  function wrapLayoutElement(id, innerMarkup) {
    const safeId = sanitizeOption(String(id || ""), layoutElementIds, "profile");
    const isActive = selectedLayoutElementId() === safeId;
    const activeClass = isActive ? " is-active-layout-element" : "";
    return `<div class="cv-layout-element${activeClass}" data-layout-id="${safeId}" style="${buildLayoutStyle(safeId)}">${innerMarkup}</div>`;
  }

  function hexToRgb(raw) {
    const value = String(raw || "").trim().replace(/^#/, "");
    if (!/^[a-fA-F0-9]{6}$/.test(value)) {
      return null;
    }
    return {
      r: Number.parseInt(value.slice(0, 2), 16),
      g: Number.parseInt(value.slice(2, 4), 16),
      b: Number.parseInt(value.slice(4, 6), 16)
    };
  }

  function rgbToCss(rgb, alpha) {
    const fallback = alpha === undefined ? "rgb(23, 103, 168)" : "rgba(23, 103, 168, " + alpha + ")";
    if (!rgb) {
      return fallback;
    }
    if (alpha === undefined) {
      return "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
    }
    return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + alpha + ")";
  }

  function mixWithWhite(rgb, colorWeight) {
    const weight = safeNumber(colorWeight, 1, 0, 1);
    if (!rgb) {
      return { r: 23, g: 103, b: 168 };
    }
    return {
      r: Math.round(rgb.r * weight + 255 * (1 - weight)),
      g: Math.round(rgb.g * weight + 255 * (1 - weight)),
      b: Math.round(rgb.b * weight + 255 * (1 - weight))
    };
  }

  function updateElementControlsFromState() {
    ensureElementLayouts();
    const activeId = selectedLayoutElementId();
    state.custom.layoutElement = activeId;
    layoutElementInput.value = activeId;

    const layout = getElementLayout(activeId);
    elementOffsetXInput.value = String(layout.x);
    elementOffsetYInput.value = String(layout.y);
    elementWidthInput.value = String(layout.width);
    elementFontSizeInput.value = String(layout.fontSize);
    elementLineHeightInput.value = String(layout.lineHeight);
    elementDragEnabledInput.checked = Boolean(state.custom.elementDragEnabled);

    elementOffsetXValue.textContent = layout.x + " px";
    elementOffsetYValue.textContent = layout.y + " px";
    elementWidthValue.textContent = layout.width + " %";
    elementFontSizeValue.textContent = layout.fontSize + " %";
    elementLineHeightValue.textContent = (layout.lineHeight / 100).toFixed(2);
  }

  function parseCommaList(value) {
    return String(value || "")
      .split(",")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function parseLineList(value) {
    return String(value || "")
      .split(/\r?\n/)
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function formatPeriod(start, end) {
    const s = String(start || "").trim();
    const e = String(end || "").trim();
    if (!s && !e) {
      return "";
    }
    if (s && e) {
      return escapeHtml(s + " - " + e);
    }
    return escapeHtml(s || e);
  }

  function safeUrl(value) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return "";
    }
    if (/^javascript:/i.test(trimmed)) {
      return "";
    }
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
      return trimmed;
    }
    return "https://" + trimmed;
  }

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(String(reader.result || ""));
      };
      reader.onerror = function () {
        reject(new Error("FileReader failed"));
      };
      reader.readAsDataURL(file);
    });
  }

  function defaultExperience() {
    return {
      id: uid("exp"),
      role: "",
      company: "",
      location: "",
      start: "",
      end: "",
      description: ""
    };
  }

  function defaultEducation() {
    return {
      id: uid("edu"),
      degree: "",
      school: "",
      start: "",
      end: "",
      description: ""
    };
  }

  function defaultProject() {
    return {
      id: uid("proj"),
      title: "",
      type: "private",
      client: "",
      role: "",
      teamSize: "",
      status: "",
      start: "",
      end: "",
      projectUrl: "",
      repoUrl: "",
      technologies: "",
      description: "",
      highlights: "",
      imageUrl: "",
      imageDataUrl: "",
      imageFrame: "clean",
      imageZoom: "100",
      imageX: "50",
      imageY: "50"
    };
  }

  function defaultCustomField() {
    return {
      id: uid("custom"),
      label: "",
      value: "",
      placement: "content",
      display: "line"
    };
  }

  function createExperienceCard(entry, index) {
    const wrapper = document.createElement("article");
    wrapper.className = "entry-card";
    wrapper.dataset.id = entry.id;
    wrapper.dataset.type = "experience";
    wrapper.innerHTML = `
      <div class="entry-head">
        <strong>Erfahrung ${index + 1}</strong>
        <button type="button" class="danger-btn" data-remove="experience" data-id="${entry.id}">Entfernen</button>
      </div>
      <div class="field-grid">
        <label>Position
          <input data-entry-field="role" data-id="${entry.id}" data-kind="experience" type="text" value="${escapeHtml(entry.role)}" placeholder="Senior Entwickler">
        </label>
        <label>Unternehmen
          <input data-entry-field="company" data-id="${entry.id}" data-kind="experience" type="text" value="${escapeHtml(entry.company)}" placeholder="Muster GmbH">
        </label>
        <label>Ort
          <input data-entry-field="location" data-id="${entry.id}" data-kind="experience" type="text" value="${escapeHtml(entry.location)}" placeholder="Hamburg">
        </label>
        <label>Zeitraum Start
          <input data-entry-field="start" data-id="${entry.id}" data-kind="experience" type="text" value="${escapeHtml(entry.start)}" placeholder="01/2022">
        </label>
        <label>Zeitraum Ende
          <input data-entry-field="end" data-id="${entry.id}" data-kind="experience" type="text" value="${escapeHtml(entry.end)}" placeholder="Heute">
        </label>
      </div>
      <label>Beschreibung
        <textarea data-entry-field="description" data-id="${entry.id}" data-kind="experience" rows="3" placeholder="Wichtige Aufgaben, Erfolge und Technologien.">${escapeHtml(entry.description)}</textarea>
      </label>
    `;
    return wrapper;
  }

  function createEducationCard(entry, index) {
    const wrapper = document.createElement("article");
    wrapper.className = "entry-card";
    wrapper.dataset.id = entry.id;
    wrapper.dataset.type = "education";
    wrapper.innerHTML = `
      <div class="entry-head">
        <strong>Ausbildung ${index + 1}</strong>
        <button type="button" class="danger-btn" data-remove="education" data-id="${entry.id}">Entfernen</button>
      </div>
      <div class="field-grid">
        <label>Abschluss
          <input data-entry-field="degree" data-id="${entry.id}" data-kind="education" type="text" value="${escapeHtml(entry.degree)}" placeholder="B.Sc. Informatik">
        </label>
        <label>Schule / Hochschule
          <input data-entry-field="school" data-id="${entry.id}" data-kind="education" type="text" value="${escapeHtml(entry.school)}" placeholder="Universitaet Musterstadt">
        </label>
        <label>Zeitraum Start
          <input data-entry-field="start" data-id="${entry.id}" data-kind="education" type="text" value="${escapeHtml(entry.start)}" placeholder="10/2018">
        </label>
        <label>Zeitraum Ende
          <input data-entry-field="end" data-id="${entry.id}" data-kind="education" type="text" value="${escapeHtml(entry.end)}" placeholder="09/2021">
        </label>
      </div>
      <label>Details
        <textarea data-entry-field="description" data-id="${entry.id}" data-kind="education" rows="3" placeholder="Schwerpunkte, Abschlussnote, besondere Leistungen.">${escapeHtml(entry.description)}</textarea>
      </label>
    `;
    return wrapper;
  }

  function createProjectCard(entry, index) {
    const wrapper = document.createElement("article");
    wrapper.className = "entry-card";
    wrapper.dataset.id = entry.id;
    wrapper.dataset.type = "project";
    wrapper.innerHTML = `
      <div class="entry-head">
        <strong>Projekt ${index + 1}</strong>
        <button type="button" class="danger-btn" data-remove="project" data-id="${entry.id}">Entfernen</button>
      </div>
      <div class="field-grid">
        <label>Projektname
          <input data-entry-field="title" data-id="${entry.id}" data-kind="project" type="text" value="${escapeHtml(entry.title)}" placeholder="Portfolio Webseite">
        </label>
        <label>Projektart
          <select data-entry-field="type" data-id="${entry.id}" data-kind="project">
            <option value="private"${selectedAttr(entry.type, "private")}>Privat</option>
            <option value="work"${selectedAttr(entry.type, "work")}>Interne Firma</option>
            <option value="client"${selectedAttr(entry.type, "client")}>Kundenprojekt</option>
          </select>
        </label>
        <label>Fuer wen war das Projekt? (optional)
          <input data-entry-field="client" data-id="${entry.id}" data-kind="project" type="text" value="${escapeHtml(entry.client)}" placeholder="Firma / Kunde">
        </label>
        <label>Deine Rolle (optional)
          <input data-entry-field="role" data-id="${entry.id}" data-kind="project" type="text" value="${escapeHtml(entry.role)}" placeholder="Lead Developer">
        </label>
        <label>Status (optional)
          <input data-entry-field="status" data-id="${entry.id}" data-kind="project" type="text" value="${escapeHtml(entry.status)}" placeholder="Live, abgeschlossen, in Arbeit">
        </label>
        <label>Teamgroesse (optional)
          <input data-entry-field="teamSize" data-id="${entry.id}" data-kind="project" type="text" value="${escapeHtml(entry.teamSize)}" placeholder="z. B. 4 Personen">
        </label>
        <label>Start (optional)
          <input data-entry-field="start" data-id="${entry.id}" data-kind="project" type="text" value="${escapeHtml(entry.start)}" placeholder="03/2024">
        </label>
        <label>Ende (optional)
          <input data-entry-field="end" data-id="${entry.id}" data-kind="project" type="text" value="${escapeHtml(entry.end)}" placeholder="08/2024">
        </label>
        <label>Projekt-URL (optional)
          <input data-entry-field="projectUrl" data-id="${entry.id}" data-kind="project" type="text" value="${escapeHtml(entry.projectUrl)}" placeholder="example.com/projekt">
        </label>
        <label>Repository-URL (optional)
          <input data-entry-field="repoUrl" data-id="${entry.id}" data-kind="project" type="text" value="${escapeHtml(entry.repoUrl)}" placeholder="github.com/name/repo">
        </label>
        <label>Technologien (kommagetrennt)
          <input data-entry-field="technologies" data-id="${entry.id}" data-kind="project" type="text" value="${escapeHtml(entry.technologies)}" placeholder="React, Node.js, PostgreSQL">
        </label>
        <label>Projektbild URL (optional)
          <input data-entry-field="imageUrl" data-id="${entry.id}" data-kind="project" type="url" value="${escapeHtml(entry.imageUrl)}" placeholder="https://...">
        </label>
        <label>Projektbild Upload (optional)
          <input data-entry-file="imageDataUrl" data-id="${entry.id}" data-kind="project" type="file" accept="image/*">
        </label>
        <label>Bildrahmen
          <select data-entry-field="imageFrame" data-id="${entry.id}" data-kind="project">
            <option value="clean"${selectedAttr(entry.imageFrame, "clean")}>Clean</option>
            <option value="double"${selectedAttr(entry.imageFrame, "double")}>Double Border</option>
            <option value="shadow"${selectedAttr(entry.imageFrame, "shadow")}>Shadow</option>
            <option value="polaroid"${selectedAttr(entry.imageFrame, "polaroid")}>Polaroid</option>
            <option value="none"${selectedAttr(entry.imageFrame, "none")}>Kein Rahmen</option>
          </select>
        </label>
        <label>Bild Zoom
          <input data-entry-field="imageZoom" data-id="${entry.id}" data-kind="project" type="range" min="80" max="180" step="5" value="${escapeHtml(entry.imageZoom)}">
        </label>
        <label>Bild Position X
          <input data-entry-field="imageX" data-id="${entry.id}" data-kind="project" type="range" min="0" max="100" step="1" value="${escapeHtml(entry.imageX)}">
        </label>
        <label>Bild Position Y
          <input data-entry-field="imageY" data-id="${entry.id}" data-kind="project" type="range" min="0" max="100" step="1" value="${escapeHtml(entry.imageY)}">
        </label>
      </div>
      <div class="inline-actions">
        <button type="button" class="secondary-btn" data-clear-image="project" data-id="${entry.id}">Upload-Projektbild entfernen</button>
        <span class="field-help">${entry.imageDataUrl ? "Upload-Bild ist aktiv." : "Tipp: Upload-Bild hat Vorrang vor URL."}</span>
      </div>
      <label>Kurzbeschreibung (optional)
        <textarea data-entry-field="description" data-id="${entry.id}" data-kind="project" rows="3" placeholder="Kurze Beschreibung des Projekts, Ziel und Ergebnis.">${escapeHtml(entry.description)}</textarea>
      </label>
      <label>Wichtige / interessante Infos (optional, eine Zeile pro Punkt)
        <textarea data-entry-field="highlights" data-id="${entry.id}" data-kind="project" rows="3" placeholder="- Performance verbessert um 40%&#10;- Multi-Tenant Architektur&#10;- Deployment automatisiert">${escapeHtml(entry.highlights)}</textarea>
      </label>
    `;
    return wrapper;
  }

  function createCustomFieldCard(entry, index) {
    const wrapper = document.createElement("article");
    wrapper.className = "entry-card";
    wrapper.dataset.id = entry.id;
    wrapper.dataset.type = "customField";
    wrapper.innerHTML = `
      <div class="entry-head">
        <strong>Eigenes Feld ${index + 1}</strong>
        <button type="button" class="danger-btn" data-remove="customField" data-id="${entry.id}">Entfernen</button>
      </div>
      <div class="field-grid">
        <label>Feldname
          <input data-entry-field="label" data-id="${entry.id}" data-kind="customField" type="text" value="${escapeHtml(entry.label)}" placeholder="Zertifizierungen">
        </label>
        <label>Position im Lebenslauf
          <select data-entry-field="placement" data-id="${entry.id}" data-kind="customField">
            <option value="content"${selectedAttr(entry.placement, "content")}>Hauptbereich</option>
            <option value="sidebar"${selectedAttr(entry.placement, "sidebar")}>Sidebar</option>
            <option value="header"${selectedAttr(entry.placement, "header")}>Header-Kontaktzeile</option>
          </select>
        </label>
        <label>Darstellung
          <select data-entry-field="display" data-id="${entry.id}" data-kind="customField">
            <option value="line"${selectedAttr(entry.display, "line")}>Textzeile</option>
            <option value="text"${selectedAttr(entry.display, "text")}>Textblock</option>
            <option value="list"${selectedAttr(entry.display, "list")}>Stichpunkte</option>
            <option value="tags"${selectedAttr(entry.display, "tags")}>Tags (kommagetrennt)</option>
          </select>
        </label>
      </div>
      <label>Inhalt
        <textarea data-entry-field="value" data-id="${entry.id}" data-kind="customField" rows="3" placeholder="Dein frei definierter Inhalt">${escapeHtml(entry.value)}</textarea>
      </label>
    `;
    return wrapper;
  }

  function renderFormLists() {
    experienceList.innerHTML = "";
    educationList.innerHTML = "";
    projectList.innerHTML = "";
    customFieldList.innerHTML = "";

    state.experiences.forEach(function (entry, index) {
      experienceList.appendChild(createExperienceCard(entry, index));
    });
    state.education.forEach(function (entry, index) {
      educationList.appendChild(createEducationCard(entry, index));
    });
    state.projects.forEach(function (entry, index) {
      projectList.appendChild(createProjectCard(entry, index));
    });
    state.customFields.forEach(function (entry, index) {
      customFieldList.appendChild(createCustomFieldCard(entry, index));
    });
  }

  function getProjectTypeLabel(type) {
    if (type === "client") {
      return "Kundenprojekt";
    }
    if (type === "work") {
      return "Interne Firma";
    }
    return "Privat";
  }

  function compactCustomValue(field) {
    if (field.display === "list") {
      return parseLineList(field.value).join(" | ");
    }
    if (field.display === "tags") {
      return parseCommaList(field.value).join(", ");
    }
    return String(field.value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function renderCustomFieldBody(field) {
    const value = String(field.value || "");
    if (field.display === "list") {
      const lines = parseLineList(value);
      if (!lines.length) {
        return '<p class="muted-empty">Kein Inhalt.</p>';
      }
      return `<ul class="cv-entry-bullets">${lines
        .map(function (line) {
          return `<li>${escapeHtml(line)}</li>`;
        })
        .join("")}</ul>`;
    }

    if (field.display === "tags") {
      const tags = parseCommaList(value);
      if (!tags.length) {
        return '<p class="muted-empty">Keine Tags vorhanden.</p>';
      }
      return `<div class="skill-list">${tags
        .map(function (tag) {
          return `<span class="skill-tag">${escapeHtml(tag)}</span>`;
        })
        .join("")}</div>`;
    }

    return `<p>${escapeHtml(value)}</p>`;
  }

  function renderCustomFieldList(items) {
    return items
      .map(function (field) {
        const title = String(field.label || "").trim() || "Eigenes Feld";
        return `
          <article class="cv-custom-item">
            <h4>${escapeHtml(title)}</h4>
            ${renderCustomFieldBody(field)}
          </article>
        `;
      })
      .join("");
  }

  function renderEntryList(items, renderer, emptyText) {
    if (!items.length) {
      return `<p class="muted-empty">${escapeHtml(emptyText)}</p>`;
    }
    return items.map(renderer).join("");
  }

  function renderPreview() {
    ensureElementLayouts();
    const shape = sanitizeOption(state.custom.photoShape, ["circle", "rounded", "square"], "circle");
    const frame = sanitizeOption(state.custom.photoFrame, ["clean", "double", "shadow", "polaroid", "none"], "clean");
    const photoScale = safeNumber(state.custom.photoZoom, 100, 80, 180) / 100;
    const photoX = safeNumber(state.custom.photoX, 50, 0, 100);
    const photoY = safeNumber(state.custom.photoY, 50, 0, 100);
    const photoSource = state.basics.photoDataUrl || state.basics.photoUrl;

    const headerCustomFields = state.customFields.filter(function (field) {
      return field.placement === "header" && String(field.value || "").trim();
    });
    const sidebarCustomFields = state.customFields.filter(function (field) {
      return field.placement === "sidebar" && String(field.value || "").trim();
    });
    const contentCustomFields = state.customFields.filter(function (field) {
      return field.placement === "content" && String(field.value || "").trim();
    });

    const metaItems = [state.basics.email, state.basics.phone, state.basics.location, state.basics.website]
      .map(function (value) {
        return String(value || "").trim();
      })
      .filter(Boolean)
      .map(function (value) {
        return `<span>${escapeHtml(value)}</span>`;
      });

    headerCustomFields.forEach(function (field) {
      const compactValue = compactCustomValue(field);
      if (!compactValue) {
        return;
      }
      const label = String(field.label || "").trim();
      const text = label ? label + ": " + compactValue : compactValue;
      metaItems.push(`<span>${escapeHtml(text)}</span>`);
    });

    const meta = metaItems.join("");

    const summaryMarkup = String(state.basics.summary || "").trim()
      ? `<p class="cv-summary">${escapeHtml(state.basics.summary)}</p>`
      : '<p class="muted-empty">Fuege einen kurzen Profiltext hinzu.</p>';

    const skillTags = parseCommaList(state.basics.skills)
      .map(function (skill) {
        return `<span class="skill-tag">${escapeHtml(skill)}</span>`;
      })
      .join("");

    const photoMarkup = photoSource
      ? wrapLayoutElement(
          "headerPhoto",
          `
        <div class="cv-photo-wrap shape-${shape} frame-${frame}" style="--photo-scale:${photoScale}; --photo-pos-x:${photoX}%; --photo-pos-y:${photoY}%;">
          <img src="${escapeHtml(photoSource)}" alt="Profilbild" crossorigin="anonymous" referrerpolicy="no-referrer">
        </div>
      `
        )
      : "";

    const expMarkup = renderEntryList(
      state.experiences,
      function (entry) {
        const period = formatPeriod(entry.start, entry.end);
        const subParts = [String(entry.company || "").trim(), String(entry.location || "").trim()].filter(Boolean);
        return `
          <article class="cv-entry">
            <h4 class="cv-entry-title">${escapeHtml(String(entry.role || "").trim() || "Position")}</h4>
            <p class="cv-entry-sub">${escapeHtml(subParts.join(" | ") || "Unternehmen")}</p>
            ${period ? `<p class="cv-entry-time">${period}</p>` : ""}
            ${String(entry.description || "").trim() ? `<p class="cv-entry-desc">${escapeHtml(entry.description)}</p>` : ""}
          </article>
        `;
      },
      "Noch keine Eintraege vorhanden."
    );

    const eduMarkup = renderEntryList(
      state.education,
      function (entry) {
        const period = formatPeriod(entry.start, entry.end);
        return `
          <article class="cv-entry">
            <h4 class="cv-entry-title">${escapeHtml(String(entry.degree || "").trim() || "Abschluss")}</h4>
            <p class="cv-entry-sub">${escapeHtml(String(entry.school || "").trim() || "Institution")}</p>
            ${period ? `<p class="cv-entry-time">${period}</p>` : ""}
            ${String(entry.description || "").trim() ? `<p class="cv-entry-desc">${escapeHtml(entry.description)}</p>` : ""}
          </article>
        `;
      },
      "Noch keine Eintraege vorhanden."
    );

    const projectMarkup = renderEntryList(
      state.projects,
      function (entry) {
        const typeLabel = getProjectTypeLabel(entry.type);
        const period = formatPeriod(entry.start, entry.end);
        const status = String(entry.status || "").trim();
        const subParts = [];
        if (String(entry.role || "").trim()) {
          subParts.push(String(entry.role || "").trim());
        }
        if (String(entry.client || "").trim()) {
          subParts.push("Fuer: " + String(entry.client || "").trim());
        }
        subParts.push(typeLabel);
        if (String(entry.teamSize || "").trim()) {
          subParts.push("Team: " + String(entry.teamSize || "").trim());
        }

        const timeline = [period, status ? "Status: " + escapeHtml(status) : ""].filter(Boolean).join(" | ");
        const technologyMarkup = parseCommaList(entry.technologies)
          .map(function (item) {
            return `<span class="skill-tag">${escapeHtml(item)}</span>`;
          })
          .join("");

        const highlightItems = parseLineList(entry.highlights);
        const highlightMarkup = highlightItems.length
          ? `<ul class="cv-entry-bullets">${highlightItems
              .map(function (item) {
                return `<li>${escapeHtml(item)}</li>`;
              })
              .join("")}</ul>`
          : "";

        const liveUrl = safeUrl(entry.projectUrl);
        const repoUrl = safeUrl(entry.repoUrl);
        const links = [
          liveUrl
            ? `<a class="cv-entry-link" href="${escapeHtml(liveUrl)}" target="_blank" rel="noreferrer">Live</a>`
            : "",
          repoUrl
            ? `<a class="cv-entry-link" href="${escapeHtml(repoUrl)}" target="_blank" rel="noreferrer">Repo</a>`
            : ""
        ]
          .filter(Boolean)
          .join("");

        const projectImageSource = String(entry.imageDataUrl || "").trim() || String(entry.imageUrl || "").trim();
        const projectFrame = sanitizeOption(entry.imageFrame, ["clean", "double", "shadow", "polaroid", "none"], "clean");
        const projectScale = safeNumber(entry.imageZoom, 100, 80, 180) / 100;
        const projectX = safeNumber(entry.imageX, 50, 0, 100);
        const projectY = safeNumber(entry.imageY, 50, 0, 100);

        return `
          <article class="cv-entry">
            <h4 class="cv-entry-title">${escapeHtml(String(entry.title || "").trim() || "Projekt")}</h4>
            <p class="cv-entry-sub">${escapeHtml(subParts.join(" | "))}</p>
            ${timeline ? `<p class="cv-entry-time">${timeline}</p>` : ""}
            ${String(entry.description || "").trim() ? `<p class="cv-entry-desc">${escapeHtml(entry.description)}</p>` : ""}
            ${technologyMarkup ? `<div class="skill-list project-tech-list">${technologyMarkup}</div>` : ""}
            ${highlightMarkup}
            ${links ? `<div class="cv-entry-links">${links}</div>` : ""}
            ${
              projectImageSource
                ? `
                <div class="project-media frame-${projectFrame}" style="--project-scale:${projectScale}; --project-pos-x:${projectX}%; --project-pos-y:${projectY}%;">
                  <img src="${escapeHtml(projectImageSource)}" alt="Projektbild" crossorigin="anonymous" referrerpolicy="no-referrer">
                </div>
              `
                : ""
            }
          </article>
        `;
      },
      "Noch keine Projekte vorhanden."
    );

    const headerClass = "header-align-" + state.custom.headerAlign;
    const layoutClass = state.custom.layoutMode === "top" ? "layout-top" : "layout-sidebar";
    const templateClass = "template-" + state.custom.templateMode;
    const fontClass = "font-" + state.custom.fontMode;
    const sectionClass = "section-" + state.custom.sectionStyle;
    const densityClass = "density-" + state.custom.density;

    previewPaper.className =
      "cv-paper " +
      [layoutClass, templateClass, fontClass, sectionClass, densityClass, state.custom.elementDragEnabled ? "layout-edit-mode" : ""]
        .filter(Boolean)
        .join(" ");
    previewPaper.style.setProperty("--cv-primary", state.custom.primaryColor);
    previewPaper.style.setProperty("--cv-bg", state.custom.backgroundColor);
    previewPaper.style.setProperty("--cv-text", state.custom.textColor);
    previewPaper.dataset.activeLayoutElement = selectedLayoutElementId();

    const primaryRgb = hexToRgb(state.custom.primaryColor) || { r: 23, g: 103, b: 168 };
    previewPaper.style.setProperty("--cv-primary-84w", rgbToCss(mixWithWhite(primaryRgb, 0.84)));
    previewPaper.style.setProperty("--cv-primary-55w", rgbToCss(mixWithWhite(primaryRgb, 0.55)));
    previewPaper.style.setProperty("--cv-primary-42w", rgbToCss(mixWithWhite(primaryRgb, 0.42)));
    previewPaper.style.setProperty("--cv-primary-35w", rgbToCss(mixWithWhite(primaryRgb, 0.35)));
    previewPaper.style.setProperty("--cv-primary-30w", rgbToCss(mixWithWhite(primaryRgb, 0.3)));
    previewPaper.style.setProperty("--cv-primary-22w", rgbToCss(mixWithWhite(primaryRgb, 0.22)));
    previewPaper.style.setProperty("--cv-primary-20w", rgbToCss(mixWithWhite(primaryRgb, 0.2)));
    previewPaper.style.setProperty("--cv-primary-16w", rgbToCss(mixWithWhite(primaryRgb, 0.16)));
    previewPaper.style.setProperty("--cv-primary-10w", rgbToCss(mixWithWhite(primaryRgb, 0.1)));
    previewPaper.style.setProperty("--cv-primary-9w", rgbToCss(mixWithWhite(primaryRgb, 0.09)));
    previewPaper.style.setProperty("--cv-primary-a35", rgbToCss(primaryRgb, 0.35));

    const skillsSection = wrapLayoutElement(
      "skills",
      `
      <section class="cv-section">
        <h3>Skills</h3>
        ${skillTags ? `<div class="skill-list">${skillTags}</div>` : '<p class="muted-empty">Keine Skills eingetragen.</p>'}
      </section>
    `
    );

    const educationSection = wrapLayoutElement(
      "education",
      `
      <section class="cv-section">
        <h3>Ausbildung</h3>
        ${eduMarkup}
      </section>
    `
    );

    const sidebarCustomSection = sidebarCustomFields.length
      ? wrapLayoutElement(
          "customSidebar",
          `
        <section class="cv-section">
          <h3>Weitere Infos</h3>
          <div class="cv-custom-list">
            ${renderCustomFieldList(sidebarCustomFields)}
          </div>
        </section>
      `
        )
      : "";

    const contentCustomSection = contentCustomFields.length
      ? wrapLayoutElement(
          "customContent",
          `
        <section class="cv-section">
          <h3>Eigene Felder</h3>
          <div class="cv-custom-list">
            ${renderCustomFieldList(contentCustomFields)}
          </div>
        </section>
      `
        )
      : "";

    const sidebarMarkup = `
      <aside class="cv-sidebar">
        ${skillsSection}
        ${educationSection}
        ${sidebarCustomSection}
      </aside>
    `;

    const profileSection = wrapLayoutElement(
      "profile",
      `
      <section class="cv-section">
        <h3>Profil</h3>
        ${summaryMarkup}
      </section>
    `
    );
    const experienceSection = wrapLayoutElement(
      "experience",
      `
      <section class="cv-section">
        <h3>Berufserfahrung</h3>
        ${expMarkup}
      </section>
    `
    );
    const projectSection = wrapLayoutElement(
      "projects",
      `
      <section class="cv-section">
        <h3>Projekte</h3>
        ${projectMarkup}
      </section>
    `
    );

    const contentMarkup = `
      <section class="cv-content">
        ${profileSection}
        ${experienceSection}
        ${projectSection}
        ${contentCustomSection}
      </section>
    `;

    const headerTextMarkup = `
      <div>
        ${wrapLayoutElement("name", `<h2 class="cv-name">${escapeHtml(state.basics.fullName || "Dein Name")}</h2>`)}
        ${wrapLayoutElement("headline", `<p class="cv-headline">${escapeHtml(state.basics.headline || "Berufsbezeichnung")}</p>`)}
        ${meta ? wrapLayoutElement("contact", `<div class="cv-meta">${meta}</div>`) : ""}
      </div>
    `;

    previewPaper.innerHTML = `
      <div class="cv-wrapper">
        <header class="cv-header ${headerClass}">
          ${
            state.custom.headerAlign === "right"
              ? `
            ${headerTextMarkup}
            ${photoMarkup}
          `
              : `
            ${photoMarkup}
            ${headerTextMarkup}
          `
          }
        </header>
        <div class="cv-main">
          ${state.custom.layoutMode === "top" ? contentMarkup + sidebarMarkup : sidebarMarkup + contentMarkup}
        </div>
      </div>
    `;
  }

  function syncBaseFormToState() {
    const formData = new FormData(form);

    state.basics.fullName = String(formData.get("fullName") || "");
    state.basics.headline = String(formData.get("headline") || "");
    state.basics.email = String(formData.get("email") || "");
    state.basics.phone = String(formData.get("phone") || "");
    state.basics.location = String(formData.get("location") || "");
    state.basics.website = String(formData.get("website") || "");
    state.basics.photoUrl = String(formData.get("photoUrl") || "");
    state.basics.summary = String(formData.get("summary") || "");
    state.basics.skills = String(formData.get("skills") || "");

    state.custom.layoutMode = String(formData.get("layoutMode") || "sidebar");
    state.custom.templateMode = String(formData.get("templateMode") || "modern");
    state.custom.fontMode = String(formData.get("fontMode") || "plex");
    state.custom.headerAlign = String(formData.get("headerAlign") || "left");
    state.custom.photoShape = String(formData.get("photoShape") || "circle");
    state.custom.photoFrame = String(formData.get("photoFrame") || "clean");
    state.custom.photoZoom = String(formData.get("photoZoom") || "100");
    state.custom.photoX = String(formData.get("photoX") || "50");
    state.custom.photoY = String(formData.get("photoY") || "50");
    state.custom.sectionStyle = String(formData.get("sectionStyle") || "line");
    state.custom.primaryColor = String(formData.get("primaryColor") || "#1767a8");
    state.custom.backgroundColor = String(formData.get("backgroundColor") || "#ffffff");
    state.custom.textColor = String(formData.get("textColor") || "#1a202c");
    state.custom.density = String(formData.get("density") || "1");
    state.custom.layoutElement = sanitizeOption(String(formData.get("layoutElement") || state.custom.layoutElement || "profile"), layoutElementIds, "profile");
    state.custom.elementDragEnabled = formData.get("elementDragEnabled") === "on";

    const selectedLayout = getElementLayout(state.custom.layoutElement);
    selectedLayout.x = Math.round(safeNumber(formData.get("elementOffsetX"), selectedLayout.x, -220, 220));
    selectedLayout.y = Math.round(safeNumber(formData.get("elementOffsetY"), selectedLayout.y, -220, 220));
    selectedLayout.width = Math.round(safeNumber(formData.get("elementWidth"), selectedLayout.width, 45, 120));
    selectedLayout.fontSize = Math.round(safeNumber(formData.get("elementFontSize"), selectedLayout.fontSize, 70, 150));
    selectedLayout.lineHeight = Math.round(safeNumber(formData.get("elementLineHeight"), selectedLayout.lineHeight, 90, 220));

    updateElementControlsFromState();
  }

  function setFormValuesFromState() {
    form.elements.fullName.value = state.basics.fullName;
    form.elements.headline.value = state.basics.headline;
    form.elements.email.value = state.basics.email;
    form.elements.phone.value = state.basics.phone;
    form.elements.location.value = state.basics.location;
    form.elements.website.value = state.basics.website;
    form.elements.photoUrl.value = state.basics.photoUrl;
    form.elements.summary.value = state.basics.summary;
    form.elements.skills.value = state.basics.skills;

    form.elements.layoutMode.value = state.custom.layoutMode;
    form.elements.templateMode.value = state.custom.templateMode;
    form.elements.fontMode.value = state.custom.fontMode;
    form.elements.headerAlign.value = state.custom.headerAlign;
    form.elements.photoShape.value = state.custom.photoShape;
    form.elements.photoFrame.value = state.custom.photoFrame;
    form.elements.photoZoom.value = state.custom.photoZoom;
    form.elements.photoX.value = state.custom.photoX;
    form.elements.photoY.value = state.custom.photoY;
    form.elements.sectionStyle.value = state.custom.sectionStyle;
    form.elements.primaryColor.value = state.custom.primaryColor;
    form.elements.backgroundColor.value = state.custom.backgroundColor;
    form.elements.textColor.value = state.custom.textColor;
    form.elements.density.value = state.custom.density;
    form.elements.layoutElement.value = selectedLayoutElementId();
    form.elements.elementDragEnabled.checked = Boolean(state.custom.elementDragEnabled);

    photoFileInput.value = "";
    updateElementControlsFromState();
  }

  function setDemoData() {
    state.basics = {
      fullName: "Maya Schneider",
      headline: "Product Designerin und Frontend Entwicklerin",
      email: "maya.schneider@mail.de",
      phone: "+49 176 45897631",
      location: "Muenchen, Deutschland",
      website: "portfolio-maya.de",
      photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
      photoDataUrl: "",
      summary:
        "Kreative Produktdesignerin mit 6+ Jahren Erfahrung in der Entwicklung digitaler Produkte. Fokus auf nutzerzentrierte Oberflaechen, klare Informationsarchitektur und saubere Zusammenarbeit mit Engineering-Teams.",
      skills: "Figma, UX Research, HTML/CSS, JavaScript, TypeScript, React, Kommunikation"
    };

    state.experiences = [
      {
        id: uid("exp"),
        role: "Senior Product Designerin",
        company: "NordTech AG",
        location: "Muenchen",
        start: "03/2022",
        end: "Heute",
        description:
          "Leitung von Designprojekten fuer B2B-Plattformen. Aufbau eines komponentenbasierten Design-Systems und enge Abstimmung mit Frontend-Teams."
      },
      {
        id: uid("exp"),
        role: "UI/UX Designerin",
        company: "Blue Pixel Studio",
        location: "Augsburg",
        start: "07/2019",
        end: "02/2022",
        description:
          "Konzeption, Prototyping und Testing fuer Web- und Mobile-Produkte. Verbesserung der Conversion im Onboarding um 18%."
      }
    ];

    state.education = [
      {
        id: uid("edu"),
        degree: "M.A. Interaction Design",
        school: "Hochschule Augsburg",
        start: "10/2017",
        end: "09/2019",
        description: "Schwerpunkt Human-Centered Design und digitale Service-Erlebnisse."
      },
      {
        id: uid("edu"),
        degree: "B.A. Kommunikationsdesign",
        school: "FH Muenchen",
        start: "10/2013",
        end: "09/2017",
        description: "Vertiefung in visuelle Systeme, Typografie und Interface-Konzeption."
      }
    ];

    state.projects = [
      {
        id: uid("proj"),
        title: "E-Commerce Plattform Relaunch",
        type: "client",
        client: "Modehaus Lenz GmbH",
        role: "UX + Frontend Lead",
        teamSize: "6 Personen",
        status: "Live",
        start: "01/2024",
        end: "08/2024",
        projectUrl: "https://example.com/case-study",
        repoUrl: "",
        technologies: "React, TypeScript, Tailwind, Storybook",
        description:
          "Neukonzeption der Plattform mit Fokus auf Checkout-Optimierung und mobile Performance.",
        highlights: "Conversion +22%\\nLighthouse Mobile 97\\nDesign-System aufgebaut",
        imageUrl:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
        imageDataUrl: "",
        imageFrame: "shadow",
        imageZoom: "100",
        imageX: "50",
        imageY: "50"
      },
      {
        id: uid("proj"),
        title: "Private Budget App",
        type: "private",
        client: "",
        role: "Full-Stack Developer",
        teamSize: "Solo",
        status: "In Arbeit",
        start: "09/2024",
        end: "",
        projectUrl: "budget-lab.dev",
        repoUrl: "github.com/maya/budget-lab",
        technologies: "Vue, Node.js, PostgreSQL, Docker",
        description: "App zur Analyse von Ausgaben mit Forecast-Ansicht und wiederkehrenden Zielen.",
        highlights: "Eigenes API Design\\nCI/CD mit Tests\\nDeployment via Docker",
        imageUrl: "",
        imageDataUrl: "",
        imageFrame: "clean",
        imageZoom: "100",
        imageX: "50",
        imageY: "50"
      }
    ];

    state.customFields = [
      {
        id: uid("custom"),
        label: "Sprachen",
        value: "Deutsch C2, Englisch C1",
        placement: "sidebar",
        display: "line"
      },
      {
        id: uid("custom"),
        label: "Zertifikate",
        value: "Google UX Certificate, Scrum Foundation",
        placement: "content",
        display: "tags"
      },
      {
        id: uid("custom"),
        label: "GitHub",
        value: "github.com/maya-dev",
        placement: "header",
        display: "line"
      }
    ];

    state.custom = {
      layoutMode: "sidebar",
      templateMode: "modern",
      fontMode: "plex",
      headerAlign: "left",
      photoShape: "circle",
      photoFrame: "double",
      photoZoom: "100",
      photoX: "50",
      photoY: "50",
      sectionStyle: "line",
      primaryColor: "#1767a8",
      backgroundColor: "#ffffff",
      textColor: "#1a202c",
      density: "1",
      layoutElement: "profile",
      elementDragEnabled: false,
      elementLayouts: createDefaultElementLayouts()
    };

    setFormValuesFromState();
    renderFormLists();
    renderPreview();
  }

  function addExperience() {
    state.experiences.push(defaultExperience());
    renderFormLists();
    renderPreview();
  }

  function addEducation() {
    state.education.push(defaultEducation());
    renderFormLists();
    renderPreview();
  }

  function addProject() {
    state.projects.push(defaultProject());
    renderFormLists();
    renderPreview();
  }

  function addCustomField() {
    state.customFields.push(defaultCustomField());
    renderFormLists();
    renderPreview();
  }

  function removeEntry(kind, id) {
    if (kind === "experience") {
      state.experiences = state.experiences.filter(function (item) {
        return item.id !== id;
      });
    } else if (kind === "education") {
      state.education = state.education.filter(function (item) {
        return item.id !== id;
      });
    } else if (kind === "project") {
      state.projects = state.projects.filter(function (item) {
        return item.id !== id;
      });
    } else if (kind === "customField") {
      state.customFields = state.customFields.filter(function (item) {
        return item.id !== id;
      });
    }
    renderFormLists();
    renderPreview();
  }

  function getListByKind(kind) {
    if (kind === "experience") {
      return state.experiences;
    }
    if (kind === "education") {
      return state.education;
    }
    if (kind === "project") {
      return state.projects;
    }
    if (kind === "customField") {
      return state.customFields;
    }
    return null;
  }

  function updateEntry(kind, id, field, value) {
    const list = getListByKind(kind);
    if (!list) {
      return;
    }
    const target = list.find(function (item) {
      return item.id === id;
    });
    if (!target) {
      return;
    }
    target[field] = value;
    renderPreview();
  }

  function isEntryValueElement(target) {
    return (
      (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) &&
      Boolean(target.dataset.entryField)
    );
  }

  function isProjectFileElement(target) {
    return (
      target instanceof HTMLInputElement &&
      target.type === "file" &&
      target.dataset.kind === "project" &&
      target.dataset.entryFile === "imageDataUrl"
    );
  }

  async function handleProfileFileUpload(fileInput) {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      window.alert("Bitte waehle eine Bilddatei aus.");
      fileInput.value = "";
      return;
    }
    try {
      state.basics.photoDataUrl = await fileToDataUrl(file);
      renderPreview();
    } catch (error) {
      console.error(error);
      window.alert("Bild konnte nicht geladen werden.");
    }
  }

  async function handleProjectFileUpload(fileInput) {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      window.alert("Bitte waehle eine Bilddatei aus.");
      fileInput.value = "";
      return;
    }
    const id = String(fileInput.dataset.id || "");
    const project = state.projects.find(function (item) {
      return item.id === id;
    });
    if (!project) {
      return;
    }
    try {
      project.imageDataUrl = await fileToDataUrl(file);
      renderFormLists();
      renderPreview();
    } catch (error) {
      console.error(error);
      window.alert("Projektbild konnte nicht geladen werden.");
    }
  }

  function clearProjectUploadImage(id) {
    const project = state.projects.find(function (item) {
      return item.id === id;
    });
    if (!project) {
      return;
    }
    project.imageDataUrl = "";
    renderFormLists();
    renderPreview();
  }

  async function waitForImages(container) {
    const images = Array.from(container.querySelectorAll("img"));
    if (!images.length) {
      return;
    }
    await Promise.all(
      images.map(function (img) {
        if (img.complete && img.naturalWidth > 0) {
          return Promise.resolve();
        }
        return new Promise(function (resolve) {
          const done = function () {
            img.removeEventListener("load", done);
            img.removeEventListener("error", done);
            resolve();
          };
          img.addEventListener("load", done);
          img.addEventListener("error", done);
        });
      })
    );
  }

  async function exportPdf(fileName) {
    const html2pdf = window.html2pdf;
    if (typeof html2pdf !== "function") {
      throw new Error("html2pdf missing");
    }

    const exportStage = document.createElement("div");
    exportStage.className = "pdf-export-stage";
    const exportPaper = previewPaper.cloneNode(true);
    exportPaper.classList.remove("layout-edit-mode");
    exportPaper.classList.add("pdf-export-mode");
    exportPaper.removeAttribute("data-active-layout-element");
    exportPaper.querySelectorAll(".is-active-layout-element").forEach(function (element) {
      element.classList.remove("is-active-layout-element");
    });
    exportStage.appendChild(exportPaper);
    document.body.appendChild(exportStage);

    try {
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready;
        } catch (fontError) {
          console.warn("Fonts not ready for export", fontError);
        }
      }
      await waitForImages(exportPaper);
      await new Promise(function (resolve) {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(resolve);
        });
      });

      await html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            windowWidth: Math.max(previewPaper.scrollWidth, 794),
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: { unit: "pt", format: "a4", orientation: "portrait" }
        })
        .from(exportPaper)
        .save();
    } finally {
      exportStage.remove();
    }
  }

  let activeDragState = null;

  function endLayoutDrag(pointerId) {
    if (!activeDragState) {
      return;
    }
    if (pointerId !== undefined && activeDragState.pointerId !== pointerId) {
      return;
    }
    activeDragState = null;
    previewPaper.classList.remove("is-layout-dragging");
  }

  form.addEventListener("input", function (event) {
    const target = event.target;
    if (isEntryValueElement(target)) {
      updateEntry(String(target.dataset.kind || ""), String(target.dataset.id || ""), String(target.dataset.entryField || ""), target.value);
      return;
    }
    if (target === layoutElementInput) {
      state.custom.layoutElement = sanitizeOption(String(layoutElementInput.value || "profile"), layoutElementIds, "profile");
      updateElementControlsFromState();
      renderPreview();
      return;
    }
    syncBaseFormToState();
    renderPreview();
  });

  form.addEventListener("change", async function (event) {
    const target = event.target;
    if (target === photoFileInput) {
      await handleProfileFileUpload(photoFileInput);
      return;
    }
    if (isProjectFileElement(target)) {
      await handleProjectFileUpload(target);
      return;
    }
    if (isEntryValueElement(target)) {
      updateEntry(String(target.dataset.kind || ""), String(target.dataset.id || ""), String(target.dataset.entryField || ""), target.value);
      return;
    }
    if (target === layoutElementInput) {
      state.custom.layoutElement = sanitizeOption(String(layoutElementInput.value || "profile"), layoutElementIds, "profile");
      updateElementControlsFromState();
      renderPreview();
      return;
    }
    syncBaseFormToState();
    renderPreview();
  });

  form.addEventListener("click", function (event) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const removeButton = target.closest("[data-remove]");
    if (removeButton) {
      const kind = String(removeButton.getAttribute("data-remove") || "");
      const id = String(removeButton.getAttribute("data-id") || "");
      if (kind && id) {
        removeEntry(kind, id);
      }
      return;
    }

    const clearProjectImageButton = target.closest("[data-clear-image='project']");
    if (clearProjectImageButton) {
      const id = String(clearProjectImageButton.getAttribute("data-id") || "");
      if (id) {
        clearProjectUploadImage(id);
      }
    }
  });

  resetElementLayoutBtn.addEventListener("click", function () {
    resetElementLayout(selectedLayoutElementId());
    updateElementControlsFromState();
    renderPreview();
  });

  resetAllElementLayoutsBtn.addEventListener("click", function () {
    resetAllElementLayouts();
    updateElementControlsFromState();
    renderPreview();
  });

  clearPhotoBtn.addEventListener("click", function () {
    state.basics.photoDataUrl = "";
    photoFileInput.value = "";
    renderPreview();
  });

  previewPaper.addEventListener("click", function (event) {
    if (!(event.target instanceof Element)) {
      return;
    }
    const element = event.target.closest("[data-layout-id]");
    if (!element || !previewPaper.contains(element)) {
      return;
    }
    const id = sanitizeOption(String(element.getAttribute("data-layout-id") || "profile"), layoutElementIds, "profile");
    state.custom.layoutElement = id;
    updateElementControlsFromState();
    renderPreview();
  });

  previewPaper.addEventListener("pointerdown", function (event) {
    if (!state.custom.elementDragEnabled) {
      return;
    }
    if (!(event.target instanceof Element)) {
      return;
    }
    const targetElement = event.target.closest("[data-layout-id]");
    if (!targetElement || !previewPaper.contains(targetElement)) {
      return;
    }

    event.preventDefault();
    const id = sanitizeOption(String(targetElement.getAttribute("data-layout-id") || "profile"), layoutElementIds, "profile");
    const layout = getElementLayout(id);
    state.custom.layoutElement = id;
    activeDragState = {
      pointerId: event.pointerId,
      id: id,
      startX: event.clientX,
      startY: event.clientY,
      originX: layout.x,
      originY: layout.y
    };
    previewPaper.classList.add("is-layout-dragging");
    try {
      previewPaper.setPointerCapture(event.pointerId);
    } catch (captureError) {
      console.warn("Pointer capture failed", captureError);
    }
    updateElementControlsFromState();
    renderPreview();
  });

  previewPaper.addEventListener("pointermove", function (event) {
    if (!activeDragState || activeDragState.pointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();
    const dx = event.clientX - activeDragState.startX;
    const dy = event.clientY - activeDragState.startY;
    const layout = getElementLayout(activeDragState.id);
    layout.x = Math.round(safeNumber(activeDragState.originX + dx, layout.x, -220, 220));
    layout.y = Math.round(safeNumber(activeDragState.originY + dy, layout.y, -220, 220));
    updateElementControlsFromState();
    renderPreview();
  });

  previewPaper.addEventListener("pointerup", function (event) {
    endLayoutDrag(event.pointerId);
  });
  previewPaper.addEventListener("pointercancel", function (event) {
    endLayoutDrag(event.pointerId);
  });
  previewPaper.addEventListener("lostpointercapture", function (event) {
    endLayoutDrag(event.pointerId);
  });

  document.getElementById("addExperienceBtn")?.addEventListener("click", addExperience);
  document.getElementById("addEducationBtn")?.addEventListener("click", addEducation);
  document.getElementById("addProjectBtn")?.addEventListener("click", addProject);
  document.getElementById("addCustomFieldBtn")?.addEventListener("click", addCustomField);
  resetDemoBtn.addEventListener("click", setDemoData);

  downloadPdfBtn.addEventListener("click", async function () {
    const originalLabel = downloadPdfBtn.textContent;
    downloadPdfBtn.disabled = true;
    downloadPdfBtn.textContent = "PDF wird erstellt...";

    const fileNameBase = String(state.basics.fullName || "lebenslauf")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w\-]/g, "");

    try {
      await exportPdf((fileNameBase || "lebenslauf") + ".pdf");
    } catch (error) {
      console.error(error);
      window.alert(
        "Beim PDF-Export ist ein Fehler aufgetreten. Falls externe Bilder genutzt werden, pruefe CORS oder nutze Upload-Bilder."
      );
    } finally {
      downloadPdfBtn.disabled = false;
      downloadPdfBtn.textContent = originalLabel;
    }
  });

  state.experiences = [defaultExperience()];
  state.education = [defaultEducation()];
  state.projects = [defaultProject()];
  state.customFields = [defaultCustomField()];
  state.custom.elementLayouts = createDefaultElementLayouts();
  state.custom.layoutElement = "profile";
  state.custom.elementDragEnabled = false;
  renderFormLists();
  setFormValuesFromState();
  renderPreview();
})();
