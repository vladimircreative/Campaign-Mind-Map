/* Prep Map — local-only GM relationship board */
(() => {
  "use strict";

  const TYPES = [
    { id: "character", label: "Character" },
    { id: "location", label: "Location" },
    { id: "event", label: "Event" },
    { id: "faction", label: "Faction" },
    { id: "note", label: "Note" },
  ];

  const ICONS = {
    character: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 19.2c1.2-3.2 3.5-4.7 6.5-4.7s5.3 1.5 6.5 4.7"/></svg>`,
    location: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s6.5-5.2 6.5-11a6.5 6.5 0 1 0-13 0c0 5.8 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.2"/></svg>`,
    event: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="7.2"/><path d="M12 8.2V12l2.6 1.8"/></svg>`,
    faction: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 20V6.5L12 4.5l6 2V20"/><path d="M6 10.5h12"/></svg>`,
    note: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M7 5.5h10v13H7z"/><path d="M9.5 9h5M9.5 12.5h5M9.5 16h3.2"/></svg>`,
  };

  const LINK_MARK = `<svg class="mark" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6.2 9.8 4.4 8a2.4 2.4 0 0 1 3.4-3.4l1.3 1.3"/><path d="M9.8 6.2 11.6 8a2.4 2.4 0 0 1-3.4 3.4L6.9 10.1"/></svg>`;

  const NODE_R = 58;
  const SUB_R = 36;
  const BORDER = 12;
  const DB_NAME = "prep-map";
  const STORE = "maps";
  const KEY = "default";

  const $ = (id) => document.getElementById(id);

  const els = {
    viewport: $("viewport"),
    world: $("world"),
    edges: $("edges"),
    nodes: $("nodes"),
    overlay: $("overlay"),
    rubber: $("rubber"),
    inspector: $("inspector"),
    inspTitle: $("insp-title"),
    inspType: $("insp-type"),
    inspKind: $("insp-kind"),
    inspLinks: $("insp-links"),
    inspTags: $("insp-tags"),
    inspTagInput: $("insp-tag-input"),
    inspDesc: $("insp-desc"),
    inspClose: $("inspector-close"),
    inspDelete: $("insp-delete"),
    tagList: $("tag-list"),
    hint: $("hint"),
    toast: $("toast"),
    btnExport: $("btn-export"),
    btnImport: $("btn-import"),
    btnClear: $("btn-clear"),
    btnUndo: $("btn-undo"),
    btnRedo: $("btn-redo"),
    importFile: $("import-file"),
  };

  const state = {
    nodes: {},
    edges: {},
    view: { x: 0, y: 0, scale: 1 },
    selectedId: null,
    highlightTag: null,
    linkFrom: null,
    dragging: null,
    panning: null,
    past: [],
    future: [],
    saveTimer: null,
    ready: false,
    hintHidden: false,
  };

  function uid() {
    return crypto.randomUUID();
  }

  function radiusOf(node) {
    return node.kind === "subnode" ? SUB_R : NODE_R;
  }

  function typeLabel(id) {
    return (TYPES.find((t) => t.id === id) || TYPES[4]).label;
  }

  function emptyBoard() {
    return { version: 1, nodes: {}, edges: {}, view: { x: 0, y: 0, scale: 1 } };
  }

  function snapshot() {
    return JSON.stringify({
      nodes: state.nodes,
      edges: state.edges,
    });
  }

  function loadSnap(json) {
    const data = JSON.parse(json);
    state.nodes = data.nodes || {};
    state.edges = data.edges || {};
  }

  function pushHistory() {
    state.past.push(snapshot());
    if (state.past.length > 60) state.past.shift();
    state.future = [];
    syncHistoryButtons();
  }

  function undo() {
    if (!state.past.length) return;
    state.future.push(snapshot());
    loadSnap(state.past.pop());
    state.selectedId = validSelected();
    render();
    persist();
    syncHistoryButtons();
  }

  function redo() {
    if (!state.future.length) return;
    state.past.push(snapshot());
    loadSnap(state.future.pop());
    state.selectedId = validSelected();
    render();
    persist();
    syncHistoryButtons();
  }

  function syncHistoryButtons() {
    if (!els.btnUndo || !els.btnRedo) return;
    els.btnUndo.disabled = !state.past.length;
    els.btnRedo.disabled = !state.future.length;
  }

  function validSelected() {
    return state.selectedId && state.nodes[state.selectedId] ? state.selectedId : null;
  }

  /* ---------- persistence ---------- */

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbGet() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const r = tx.objectStore(STORE).get(KEY);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error);
    });
  }

  async function idbSet(value) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function serializeAll() {
    return {
      version: 1,
      nodes: state.nodes,
      edges: state.edges,
      view: { ...state.view },
      hintHidden: state.hintHidden,
    };
  }

  function applyAll(data) {
    if (!data || typeof data !== "object") return;
    state.nodes = data.nodes || {};
    state.edges = data.edges || {};
    if (data.view) {
      state.view.x = data.view.x || 0;
      state.view.y = data.view.y || 0;
      state.view.scale = data.view.scale || 1;
    }
    if (data.hintHidden) hideHint(true);
  }

  function persist() {
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(() => {
      const payload = serializeAll();
      try {
        localStorage.setItem("prep-map-fallback", JSON.stringify(payload));
      } catch (_) { /* quota */ }
      idbSet(payload).catch(() => {});
    }, 200);
  }

  async function restore() {
    let data = null;
    try {
      data = await idbGet();
    } catch (_) {
      data = null;
    }
    if (!data) {
      try {
        data = JSON.parse(localStorage.getItem("prep-map-fallback") || "null");
      } catch (_) {
        data = null;
      }
    }
    if (data) applyAll(data);
  }

  /* ---------- geometry ---------- */

  function screenToWorld(sx, sy) {
    const rect = els.viewport.getBoundingClientRect();
    const x = (sx - rect.left - state.view.x) / state.view.scale;
    const y = (sy - rect.top - state.view.y) / state.view.scale;
    return { x, y };
  }

  function applyView() {
    els.world.style.transform = `translate(${state.view.x}px, ${state.view.y}px) scale(${state.view.scale})`;
  }

  function focusNode(id) {
    const n = state.nodes[id];
    if (!n) return;
    const rect = els.viewport.getBoundingClientRect();
    const targetScale = 1;
    state.view.scale = targetScale;
    state.view.x = rect.width / 2 - n.x * targetScale;
    state.view.y = rect.height / 2 - n.y * targetScale;
    applyView();
    persist();
  }

  function edgeKey(a, b) {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }

  function hasEdge(a, b) {
    return Object.values(state.edges).some((e) => edgeKey(e.a, e.b) === edgeKey(a, b));
  }

  function neighbors(id) {
    const out = [];
    for (const e of Object.values(state.edges)) {
      if (e.a === id) out.push(e.b);
      else if (e.b === id) out.push(e.a);
    }
    return out;
  }

  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  function nudgeNew(id) {
    const n = state.nodes[id];
    if (!n) return;
    for (let i = 0; i < 8; i++) {
      let pushed = false;
      for (const other of Object.values(state.nodes)) {
        if (other.id === id) continue;
        const min = radiusOf(n) + radiusOf(other) + 18;
        const d = dist(n, other);
        if (d < min && d > 0.001) {
          const nx = (n.x - other.x) / d;
          const ny = (n.y - other.y) / d;
          const extra = (min - d) * 0.65;
          n.x += nx * extra;
          n.y += ny * extra;
          pushed = true;
        } else if (d === 0) {
          n.x += 24;
          n.y += 12;
          pushed = true;
        }
      }
      if (!pushed) break;
    }
  }

  /* ---------- mutations ---------- */

  function createNode({ x, y, kind, type, title }) {
    pushHistory();
    const node = {
      id: uid(),
      title: title || (kind === "subnode" ? "Link" : "New node"),
      type: type || (kind === "subnode" ? "note" : "character"),
      kind: kind || "node",
      x,
      y,
      tags: [],
      description: "",
    };
    state.nodes[node.id] = node;
    nudgeNew(node.id);
    hideHint();
    selectNode(node.id, { skipRender: true });
    render();
    persist();
    queueMicrotask(() => {
      els.inspTitle.focus();
      els.inspTitle.select();
    });
    return node;
  }

  function connect(a, b) {
    if (!a || !b || a === b) return;
    if (!state.nodes[a] || !state.nodes[b]) return;
    if (hasEdge(a, b)) {
      toast("Already linked");
      cancelLink();
      return;
    }
    pushHistory();
    const e = { id: uid(), a, b };
    state.edges[e.id] = e;
    cancelLink();
    render();
    persist();
  }

  function insertOnEdge(edgeId, world) {
    const e = state.edges[edgeId];
    if (!e) return;
    const a = state.nodes[e.a];
    const b = state.nodes[e.b];
    if (!a || !b) return;
    const mid = world || { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    pushHistory();
    delete state.edges[edgeId];
    const node = {
      id: uid(),
      title: "Link",
      type: "note",
      kind: "subnode",
      x: mid.x,
      y: mid.y,
      tags: [],
      description: "",
    };
    state.nodes[node.id] = node;
    const e1 = { id: uid(), a: e.a, b: node.id };
    const e2 = { id: uid(), a: node.id, b: e.b };
    state.edges[e1.id] = e1;
    state.edges[e2.id] = e2;
    nudgeNew(node.id);
    hideHint();
    selectNode(node.id, { skipRender: true });
    render();
    persist();
    queueMicrotask(() => {
      els.inspTitle.focus();
      els.inspTitle.select();
    });
  }

  function deleteNode(id) {
    if (!state.nodes[id]) return;
    pushHistory();
    delete state.nodes[id];
    for (const [eid, e] of Object.entries(state.edges)) {
      if (e.a === id || e.b === id) delete state.edges[eid];
    }
    if (state.selectedId === id) state.selectedId = null;
    render();
    persist();
  }

  function updateNode(id, patch) {
    const n = state.nodes[id];
    if (!n) return;
    Object.assign(n, patch);
    render();
    persist();
  }

  /* ---------- render ---------- */

  function render() {
    applyView();
    renderEdges();
    renderNodes();
    renderInspector();
    renderRail();
    if (!state.linkFrom) hideRubber();
  }

  function renderEdges() {
    const parts = [];
    for (const e of Object.values(state.edges)) {
      const a = state.nodes[e.a];
      const b = state.nodes[e.b];
      if (!a || !b) continue;
      const from = rimPoint(a, b);
      const to = rimPoint(b, a);
      parts.push(
        `<g class="edge" data-id="${e.id}">
          <line class="edge-hit" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" />
          <line class="edge-vis" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" />
        </g>`
      );
    }
    els.edges.innerHTML = parts.join("");
    els.edges.querySelectorAll("g.edge").forEach((g) => {
      g.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (state.linkFrom) {
          cancelLink();
          return;
        }
        const id = g.dataset.id;
        const e = state.edges[id];
        if (!e) return;
        if (ev.shiftKey) {
          pushHistory();
          delete state.edges[id];
          render();
          persist();
          return;
        }
        const a = state.nodes[e.a];
        const b = state.nodes[e.b];
        const world = screenToWorld(ev.clientX, ev.clientY);
        const mid = closestOnSegment(world, a, b);
        insertOnEdge(id, mid);
      });
    });
  }

  function closestOnSegment(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) return { x: a.x, y: a.y };
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = Math.max(0.2, Math.min(0.8, t));
    return { x: a.x + t * dx, y: a.y + t * dy };
  }

  function renderNodes() {
    const hot = state.highlightTag
      ? new Set(
          Object.values(state.nodes)
            .filter((n) => n.tags.some((t) => normTag(t) === state.highlightTag))
            .map((n) => n.id)
        )
      : null;

    const html = Object.values(state.nodes)
      .map((n) => {
        const cls = [
          "node",
          n.kind === "subnode" ? "sub" : "",
          n.type,
          n.id === state.selectedId ? "selected" : "",
          n.id === state.linkFrom ? "linking-src" : "",
          hot ? (hot.has(n.id) ? "tag-hot" : "dimmed") : "",
        ]
          .filter(Boolean)
          .join(" ");
        const title = escapeHtml(n.title || "Untitled");
        return `<div class="${cls}" data-id="${n.id}" style="left:${n.x}px;top:${n.y}px">
          ${ICONS[n.type] || ICONS.note}
          <div class="label">${title}</div>
        </div>`;
      })
      .join("");
    els.nodes.innerHTML = html;

    els.nodes.querySelectorAll(".node").forEach((el) => bindNode(el));
  }

  function bindNode(el) {
    const id = el.dataset.id;
    el.addEventListener("pointerdown", (ev) => {
      if (ev.button !== 0) return;
      ev.stopPropagation();
      const node = state.nodes[id];
      if (!node) return;
      const world = screenToWorld(ev.clientX, ev.clientY);
      const d = dist(world, node);
      const onBorder = d >= radiusOf(node) - BORDER;

      if (state.linkFrom) {
        ev.preventDefault();
        return;
      }

      if (onBorder && !ev.shiftKey) {
        ev.preventDefault();
        beginLink(id);
        return;
      }

      state.dragging = {
        id,
        startX: ev.clientX,
        startY: ev.clientY,
        origX: node.x,
        origY: node.y,
        moved: false,
        shift: ev.shiftKey,
      };
      el.setPointerCapture(ev.pointerId);
    });

    el.addEventListener("pointermove", (ev) => {
      if (!state.dragging || state.dragging.id !== id) return;
      const dx = ev.clientX - state.dragging.startX;
      const dy = ev.clientY - state.dragging.startY;
      if (!state.dragging.moved && Math.hypot(dx, dy) < 4) return;
      if (!state.dragging.moved) {
        state.dragging.moved = true;
        pushHistory();
      }
      const node = state.nodes[id];
      node.x = state.dragging.origX + dx / state.view.scale;
      node.y = state.dragging.origY + dy / state.view.scale;
      el.style.left = node.x + "px";
      el.style.top = node.y + "px";
      // live-update edges without full rerender
      refreshEdgesOnly();
    });

    el.addEventListener("pointerup", (ev) => {
      if (state.linkFrom) {
        if (state.linkFrom !== id) {
          connect(state.linkFrom, id);
          cancelLink();
        }
        return;
      }
      if (!state.dragging || state.dragging.id !== id) return;
      const drag = state.dragging;
      state.dragging = null;
      if (drag.moved) {
        persist();
        return;
      }
      if (drag.shift && state.selectedId && state.selectedId !== id) {
        connect(state.selectedId, id);
        selectNode(id);
        return;
      }
      selectNode(id);
    });

    el.addEventListener("pointermove", (ev) => {
      if (state.dragging || state.linkFrom) return;
      const node = state.nodes[id];
      if (!node) return;
      const world = screenToWorld(ev.clientX, ev.clientY);
      const onBorder = dist(world, node) >= radiusOf(node) - BORDER;
      el.classList.toggle("on-ring", onBorder);
    });
    el.addEventListener("pointerleave", () => el.classList.remove("on-ring"));

    el.addEventListener("dblclick", (ev) => ev.stopPropagation());
  }

  function refreshEdgesOnly() {
    els.edges.querySelectorAll("g.edge").forEach((g) => {
      const e = state.edges[g.dataset.id];
      if (!e) return;
      const a = state.nodes[e.a];
      const b = state.nodes[e.b];
      if (!a || !b) return;
      const from = rimPoint(a, b);
      const to = rimPoint(b, a);
      g.querySelectorAll("line").forEach((ln) => {
        ln.setAttribute("x1", from.x);
        ln.setAttribute("y1", from.y);
        ln.setAttribute("x2", to.x);
        ln.setAttribute("y2", to.y);
      });
    });
  }

  function renderInspector() {
    const n = state.selectedId ? state.nodes[state.selectedId] : null;
    if (!n) {
      els.inspector.hidden = true;
      return;
    }
    els.inspector.hidden = false;
    if (document.activeElement !== els.inspTitle) {
      els.inspTitle.value = n.title || "";
    }
    if (document.activeElement !== els.inspDesc) {
      els.inspDesc.value = n.description || "";
    }
    if (document.activeElement !== els.inspType) {
      els.inspType.value = n.type;
    }
    els.inspKind.textContent = n.kind === "subnode" ? "Subnode" : "Node";

    const links = neighbors(n.id)
      .map((nid) => state.nodes[nid])
      .filter(Boolean);
    if (!links.length) {
      els.inspLinks.innerHTML = `<li class="empty">No links yet</li>`;
    } else {
      els.inspLinks.innerHTML = links
        .map(
          (ln) =>
            `<li data-id="${ln.id}">${LINK_MARK}<span>${escapeHtml(ln.title || "Untitled")}</span></li>`
        )
        .join("");
      els.inspLinks.querySelectorAll("li[data-id]").forEach((li) => {
        li.addEventListener("click", () => {
          const id = li.dataset.id;
          focusNode(id);
          selectNode(id);
        });
      });
    }

    els.inspTags.innerHTML = (n.tags || [])
      .map(
        (t) =>
          `<span class="chip">${escapeHtml(t)}<button type="button" data-tag="${escapeAttr(t)}" aria-label="Remove tag">×</button></span>`
      )
      .join("");
    els.inspTags.querySelectorAll("button[data-tag]").forEach((btn) => {
      btn.addEventListener("click", () => {
        pushHistory();
        n.tags = n.tags.filter((t) => t !== btn.dataset.tag);
        render();
        persist();
      });
    });
  }

  function renderRail() {
    const groups = {};
    for (const n of Object.values(state.nodes)) {
      for (const raw of n.tags || []) {
        const t = raw.trim();
        if (!t) continue;
        const key = normTag(t);
        if (!groups[key]) groups[key] = { label: t, nodes: [] };
        groups[key].nodes.push(n);
      }
    }
    const keys = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    if (!keys.length) {
      els.tagList.innerHTML = `<p class="rail-empty">No tags yet. Add them in a node’s notes panel.</p>`;
      return;
    }
    els.tagList.innerHTML = keys
      .map((k) => {
        const g = groups[k];
        const members = g.nodes
          .slice()
          .sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        const active = state.highlightTag === k ? "active" : "";
        return `<div class="tag-group ${active}" data-tag="${escapeAttr(k)}">
          <div class="tag-group-title" data-tag="${escapeAttr(k)}"><span class="tag-hash">#</span>${escapeHtml(g.label.toUpperCase())}</div>
          <ul>${members
            .map((n) => `<li data-id="${n.id}">${escapeHtml(n.title || "Untitled")}</li>`)
            .join("")}</ul>
        </div>`;
      })
      .join("");

    els.tagList.querySelectorAll(".tag-group-title").forEach((el) => {
      el.addEventListener("click", () => {
        const tag = el.dataset.tag;
        state.highlightTag = state.highlightTag === tag ? null : tag;
        renderNodes();
        renderRail();
      });
    });
    els.tagList.querySelectorAll("li[data-id]").forEach((li) => {
      li.addEventListener("click", () => {
        const id = li.dataset.id;
        focusNode(id);
        selectNode(id);
      });
    });
  }

  function selectNode(id, { skipRender } = {}) {
    state.selectedId = id;
    if (state.highlightTag) {
      const n = state.nodes[id];
      const inGroup =
        n && (n.tags || []).some((t) => normTag(t) === state.highlightTag);
      if (!inGroup) state.highlightTag = null;
    }
    if (!skipRender) render();
  }

  function deselect() {
    state.selectedId = null;
    renderInspector();
    renderNodes();
  }

  /* ---------- linking ---------- */

  function showRubber() {
    els.rubber.removeAttribute("hidden");
    els.rubber.style.display = "";
  }

  function hideRubber() {
    els.rubber.setAttribute("hidden", "");
    els.rubber.style.display = "none";
    els.rubber.setAttribute("x1", "0");
    els.rubber.setAttribute("y1", "0");
    els.rubber.setAttribute("x2", "0");
    els.rubber.setAttribute("y2", "0");
  }

  function beginLink(id) {
    state.linkFrom = id;
    els.viewport.classList.add("linking");
    showRubber();
    const n = state.nodes[id];
    els.rubber.setAttribute("x1", n.x);
    els.rubber.setAttribute("y1", n.y);
    els.rubber.setAttribute("x2", n.x);
    els.rubber.setAttribute("y2", n.y);
    renderNodes();
  }

  function rimPoint(node, toward) {
    const r = radiusOf(node);
    const dx = toward.x - node.x;
    const dy = toward.y - node.y;
    const d = Math.hypot(dx, dy) || 1;
    return { x: node.x + (dx / d) * r, y: node.y + (dy / d) * r };
  }

  function moveRubber(clientX, clientY) {
    if (!state.linkFrom) return;
    const src = state.nodes[state.linkFrom];
    if (!src) return;
    const w = screenToWorld(clientX, clientY);
    const from = rimPoint(src, w);
    els.rubber.setAttribute("x1", from.x);
    els.rubber.setAttribute("y1", from.y);
    els.rubber.setAttribute("x2", w.x);
    els.rubber.setAttribute("y2", w.y);
  }

  function cancelLink() {
    state.linkFrom = null;
    els.viewport.classList.remove("linking");
    hideRubber();
    renderNodes();
  }

  /* ---------- viewport input ---------- */

  function setupInput() {
    els.viewport.addEventListener("pointerdown", (ev) => {
      if (ev.button !== 0 && ev.button !== 1) return;
      if (ev.target.closest(".node") || ev.target.closest("g.edge")) return;
      if (state.linkFrom) return;
      els.viewport.setPointerCapture(ev.pointerId);
      state.panning = {
        startX: ev.clientX,
        startY: ev.clientY,
        origX: state.view.x,
        origY: state.view.y,
        moved: false,
      };
      els.viewport.classList.add("panning");
    });

    els.viewport.addEventListener("pointermove", (ev) => {
      if (state.linkFrom) moveRubber(ev.clientX, ev.clientY);
      if (!state.panning) return;
      const dx = ev.clientX - state.panning.startX;
      const dy = ev.clientY - state.panning.startY;
      if (Math.hypot(dx, dy) > 3) state.panning.moved = true;
      state.view.x = state.panning.origX + dx;
      state.view.y = state.panning.origY + dy;
      applyView();
    });

    window.addEventListener("pointermove", (ev) => {
      if (state.linkFrom) moveRubber(ev.clientX, ev.clientY);
    });

    document.addEventListener("pointerdown", (ev) => {
      if (!state.linkFrom) return;
      if (els.viewport.contains(ev.target)) return;
      cancelLink();
    });

    window.addEventListener("pointerup", (ev) => {
      if (!state.linkFrom) return;
      if (ev.target.closest && ev.target.closest(".node")) return;
      if (els.viewport.contains(ev.target) || ev.target === els.viewport) {
        cancelLink();
      }
    });

    els.viewport.addEventListener("pointerup", (ev) => {
      if (state.linkFrom && !ev.target.closest(".node")) {
        cancelLink();
      }
      if (state.panning) {
        const moved = state.panning.moved;
        state.panning = null;
        els.viewport.classList.remove("panning");
        if (moved) persist();
        else if (!state.linkFrom && ev.button === 0) {
          state.highlightTag = null;
          deselect();
          renderRail();
        }
      }
    });

    els.viewport.addEventListener(
      "wheel",
      (ev) => {
        ev.preventDefault();
        const rect = els.viewport.getBoundingClientRect();
        const sx = ev.clientX - rect.left;
        const sy = ev.clientY - rect.top;
        const worldX = (sx - state.view.x) / state.view.scale;
        const worldY = (sy - state.view.y) / state.view.scale;
        const factor = ev.deltaY < 0 ? 1.08 : 1 / 1.08;
        const next = Math.min(2.6, Math.max(0.22, state.view.scale * factor));
        state.view.scale = next;
        state.view.x = sx - worldX * next;
        state.view.y = sy - worldY * next;
        applyView();
        persist();
      },
      { passive: false }
    );

    els.viewport.addEventListener("dblclick", (ev) => {
      if (ev.target.closest(".node") || ev.target.closest("g.edge")) return;
      const w = screenToWorld(ev.clientX, ev.clientY);
      createNode({ x: w.x, y: w.y, kind: "node" });
    });

    window.addEventListener("keydown", (ev) => {
      const typing =
        ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA" || ev.target.tagName === "SELECT";

      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "z") {
        ev.preventDefault();
        if (ev.shiftKey) redo();
        else undo();
        return;
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "y") {
        ev.preventDefault();
        redo();
        return;
      }
      if (ev.key === "Escape") {
        if (state.linkFrom) cancelLink();
        else {
          state.highlightTag = null;
          deselect();
          renderRail();
        }
        return;
      }
      if (typing) return;
      if ((ev.key === "Delete" || ev.key === "Backspace") && state.selectedId) {
        ev.preventDefault();
        deleteNode(state.selectedId);
      }
    });
  }

  /* ---------- inspector fields ---------- */

  function setupInspector() {
    TYPES.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.label;
      els.inspType.appendChild(opt);
    });

    els.inspClose.addEventListener("click", () => {
      state.highlightTag = null;
      deselect();
      renderRail();
    });

    els.inspTitle.addEventListener("input", () => {
      if (!state.selectedId) return;
      const n = state.nodes[state.selectedId];
      n.title = els.inspTitle.value;
      const el = els.nodes.querySelector(`.node[data-id="${n.id}"] .label`);
      if (el) el.textContent = n.title || "Untitled";
      persist();
      // rail names need refresh but not on every keystroke heavily
      clearTimeout(els.inspTitle._t);
      els.inspTitle._t = setTimeout(renderRail, 180);
    });

    els.inspTitle.addEventListener("focus", () => {
      if (!state.selectedId) return;
      // one undo unit for a rename session
      if (!els.inspTitle._hist) {
        pushHistory();
        els.inspTitle._hist = true;
      }
    });
    els.inspTitle.addEventListener("blur", () => {
      els.inspTitle._hist = false;
      renderRail();
    });

    els.inspType.addEventListener("change", () => {
      if (!state.selectedId) return;
      pushHistory();
      updateNode(state.selectedId, { type: els.inspType.value });
    });

    els.inspDesc.addEventListener("focus", () => {
      if (!els.inspDesc._hist) {
        pushHistory();
        els.inspDesc._hist = true;
      }
    });
    els.inspDesc.addEventListener("blur", () => {
      els.inspDesc._hist = false;
    });
    els.inspDesc.addEventListener("input", () => {
      if (!state.selectedId) return;
      state.nodes[state.selectedId].description = els.inspDesc.value;
      persist();
    });

    els.inspTagInput.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter") return;
      ev.preventDefault();
      const n = state.nodes[state.selectedId];
      if (!n) return;
      const tag = els.inspTagInput.value.trim().replace(/^#/, "");
      if (!tag) return;
      if (n.tags.some((t) => normTag(t) === normTag(tag))) {
        els.inspTagInput.value = "";
        return;
      }
      pushHistory();
      n.tags = [...n.tags, tag];
      els.inspTagInput.value = "";
      render();
      persist();
    });

    els.inspDelete.addEventListener("click", () => {
      if (!state.selectedId) return;
      deleteNode(state.selectedId);
    });
  }

  function setupMenu() {
    els.btnExport.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(serializeAll(), null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "prep-map.json";
      a.click();
      URL.revokeObjectURL(a.href);
      toast("Exported");
    });

    els.btnImport.addEventListener("click", () => els.importFile.click());
    els.importFile.addEventListener("change", async () => {
      const file = els.importFile.files[0];
      els.importFile.value = "";
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data || typeof data !== "object") throw new Error("bad");
        pushHistory();
        applyAll(data);
        state.selectedId = null;
        render();
        persist();
        toast("Imported");
      } catch (_) {
        toast("Could not read that file");
      }
    });

    els.btnUndo.addEventListener("click", () => undo());
    els.btnRedo.addEventListener("click", () => redo());

    els.btnClear.addEventListener("click", () => {
      if (!Object.keys(state.nodes).length) return;
      if (!confirm("Clear this map? Export first if you may want it back.")) return;
      pushHistory();
      state.nodes = {};
      state.edges = {};
      state.selectedId = null;
      state.highlightTag = null;
      render();
      persist();
    });
  }

  /* ---------- helpers ---------- */

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function normTag(s) {
    return String(s).trim().toLowerCase();
  }

  function hideHint(silent) {
    if (state.hintHidden) return;
    state.hintHidden = true;
    els.hint.classList.add("gone");
    if (!silent) persist();
  }

  let toastTimer = null;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.hidden = true;
    }, 1600);
  }

  function loadDemo() {
    const n = (title, type, kind, x, y, tags, description) => {
      const id = title.toLowerCase().replace(/\s+/g, "-");
      state.nodes[id] = {
        id,
        title,
        type,
        kind,
        x,
        y,
        tags: tags || [],
        description: description || "",
      };
      return id;
    };
    const e = (a, b) => {
      const id = uid();
      state.edges[id] = { id, a, b };
    };
    state.nodes = {};
    state.edges = {};
    const jagger = n("Jagger", "character", "node", -280, -40, ["Republic"], "");
    const tseren = n("Tseren", "character", "node", 160, -160, ["Republic"], "");
    const sonny = n("Sonny", "character", "node", 210, 90, ["Raiders"], "");
    const blackout = n("Blackout", "character", "node", -40, 80, ["Raiders"], "");
    const tsurun = n("Tsurun", "location", "node", 40, 230, ["Raiders"], "Locked waystation on the ridge.");
    const convoy = n("Convoy", "event", "node", 40, -20, [], "Convoy is ambushed on the salt road. Jagger, Tseren and Sonny are all on it.");
    const friends = n("Friends", "note", "subnode", -80, -170, [], "");
    const debt = n("Debt", "note", "subnode", -70, -90, [], "");
    const war = n("War", "note", "subnode", 280, -40, [], "");
    e(jagger, friends);
    e(friends, tseren);
    e(jagger, debt);
    e(debt, tseren);
    e(jagger, convoy);
    e(convoy, tseren);
    e(convoy, sonny);
    e(tseren, war);
    e(war, sonny);
    e(blackout, sonny);
    e(tsurun, sonny);
    state.selectedId = convoy;
    state.highlightTag = null;
    state.hintHidden = true;
    centerCamera();
  }

  function centerCamera() {
    const rail = 232;
    const w = Math.max(els.viewport.clientWidth || window.innerWidth - rail, 800);
    const h = Math.max(els.viewport.clientHeight || window.innerHeight, 600);
    state.view.scale = 1;
    state.view.x = w / 2;
    state.view.y = h / 2;
  }

  /* ---------- boot ---------- */

  async function boot() {
    setupInspector();
    setupInput();
    setupMenu();
    await restore();
    const params = new URLSearchParams(location.search);
    if (params.get("demo") === "1") {
      loadDemo();
      const hl = params.get("tag");
      if (hl) state.highlightTag = hl.toLowerCase();
    }
    // center empty board
    if (!Object.keys(state.nodes).length && state.view.x === 0 && state.view.y === 0) {
      centerCamera();
    }
    if (state.hintHidden) els.hint.classList.add("gone");
    render();
    requestAnimationFrame(() => {
      if (new URLSearchParams(location.search).get("demo") === "1") centerCamera();
      applyView();
    });
    els.viewport.focus();
    syncHistoryButtons();
    state.ready = true;
    window.PrepMap = {
      state,
      createNode,
      connect,
      selectNode,
      focusNode,
      render,
      persist,
    };
  }

  boot();
})();
