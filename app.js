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

  const STATUSES = [
    { id: "live", label: "Live" },
    { id: "resolved", label: "Resolved" },
    { id: "missed", label: "Missed" },
    { id: "rumor", label: "Rumor" },
    { id: "ghost", label: "Ghost" },
  ];

  const VITALS = [
    { id: "alive", label: "Alive" },
    { id: "missing", label: "Missing" },
    { id: "compromised", label: "Compromised" },
    { id: "dead", label: "Dead" },
  ];

  const VITAL_ICONS = {
    alive: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 13.2S2.8 9.6 2.8 6.2A2.8 2.8 0 0 1 8 4.6a2.8 2.8 0 0 1 5.2 1.6c0 3.4-5.2 7-5.2 7z"/></svg>`,
    missing: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="5.4"/><path d="M8 5.2v.3M8 7.2V11"/></svg>`,
    compromised: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2.6 14.2 13H1.8L8 2.6z"/><path d="M8 6.6v3.1M8 11.4v.3"/></svg>`,
    dead: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="7.2" r="3.6"/><path d="M5.4 6.6h.1M10.5 6.6h.1M5.8 8.4c.7.8 1.7 1.2 2.2 1.2s1.5-.4 2.2-1.2M4.6 11.4c1 .9 2.2 1.4 3.4 1.4s2.4-.5 3.4-1.4"/></svg>`,
  };

  const PENCIL = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.2 3.2 12.8 5.8 6 12.6H3.4V10z"/><path d="M9 4.4 11.6 7"/></svg>`;

  function vitalIcon(id) {
    return `<span class="cond-icon" title="${escapeAttr(id || "alive")}">${VITAL_ICONS[id] || VITAL_ICONS.alive}</span>`;
  }

  const LINK_MARK = `<svg class="mark" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6.2 9.8 4.4 8a2.4 2.4 0 0 1 3.4-3.4l1.3 1.3"/><path d="M9.8 6.2 11.6 8a2.4 2.4 0 0 1-3.4 3.4L6.9 10.1"/></svg>`;

  const NODE_R = 58;
  const SUB_RX = 54;
  const SUB_RY = 24;
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
    inspTitleIcon: $("insp-title-icon"),
    inspType: $("insp-type"),
    inspStatus: $("insp-status"),
    inspVital: $("insp-vital"),
    inspVitalWrap: $("insp-vital-wrap"),
    inspCloseThread: $("insp-close-thread"),
    inspKind: $("insp-kind"),
    inspPage: $("insp-page"),
    pageList: $("page-list"),
    btnNewPage: $("btn-new-page"),
    btnFit: $("btn-fit"),
    btnHelp: $("btn-help"),
    help: $("help"),
    hovercard: $("hovercard"),
    mapTitle: $("map-title"),
    minimap: $("minimap"),
    marquee: $("marquee"),
    inspVitalIcon: $("insp-vital-icon"),
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
    pages: [],
    currentPageId: "all",
    linkPlanted: false,
    hoverTimer: null,
    hoverId: null,
    pointer: { x: 0, y: 0 },
    selectedIds: new Set(),
    clipboard: null,
    pasteN: 1,
    renamingPage: null,
    marquee: null,
    spaceDown: false,
    mini: null,
    miniDrag: false,
    title: "Prep Map",
  };

  function uid() {
    return crypto.randomUUID();
  }

  function radiusOf(node) {
    return node.kind === "subnode" ? Math.max(SUB_RX, SUB_RY) : NODE_R;
  }

  function radiiOf(node) {
    return node && node.kind === "subnode"
      ? { rx: SUB_RX, ry: SUB_RY }
      : { rx: NODE_R, ry: NODE_R };
  }

  function typeLabel(id) {
    return (TYPES.find((t) => t.id === id) || TYPES[4]).label;
  }

  function fileSlug(name) {
    const s = String(name || "Prep Map").trim() || "Prep Map";
    return s.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").slice(0, 60);
  }

  function syncMapTitle() {
    const title = state.title || "Prep Map";
    if (els.mapTitle && document.activeElement !== els.mapTitle) {
      els.mapTitle.value = title;
    }
    document.title = title + " — Prep Map";
  }

  function setMapTitle(raw) {
    const next = String(raw || "").trim() || "Prep Map";
    if (next === state.title) {
      syncMapTitle();
      return;
    }
    pushHistory();
    state.title = next;
    syncMapTitle();
    persist();
  }

  function emptyBoard() {
    return { version: 1, nodes: {}, edges: {}, view: { x: 0, y: 0, scale: 1 } };
  }

  function snapshot() {
    return JSON.stringify({
      nodes: state.nodes,
      edges: state.edges,
      pages: state.pages,
      currentPageId: state.currentPageId,
      title: state.title,
    });
  }

  function loadSnap(json) {
    const data = JSON.parse(json);
    state.nodes = data.nodes || {};
    state.edges = data.edges || {};
    if (data.pages) state.pages = data.pages;
    if (data.currentPageId) state.currentPageId = data.currentPageId;
    if (data.title) state.title = data.title;
    normalizeBoard();
    syncMapTitle();
  }

  function normalizeNode(n) {
    if (!n.status) n.status = "live";
    if (!n.vitality) n.vitality = "alive";
    if (!n.pageId && state.pages[0]) n.pageId = state.pages[0].id;
    if (typeof n.seen !== "boolean") n.seen = true;
    return n;
  }

  function normalizeEdge(e) {
    if (!e.style) e.style = "solid";
    return e;
  }

  function ensurePages() {
    if (!Array.isArray(state.pages) || !state.pages.length) {
      const p = { id: uid(), title: "Session 1" };
      state.pages = [p];
    }
    if (!state.currentPageId) state.currentPageId = "all";
  }

  function normalizeBoard() {
    ensurePages();
    for (const n of Object.values(state.nodes)) normalizeNode(n);
    for (const e of Object.values(state.edges)) normalizeEdge(e);
  }

  function visibleNode(n) {
    if (!n) return false;
    if (state.currentPageId === "all") return true;
    return n.pageId === state.currentPageId;
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
      version: 2,
      nodes: state.nodes,
      edges: state.edges,
      pages: state.pages,
      currentPageId: state.currentPageId,
      title: state.title || "Prep Map",
      view: { ...state.view },
      hintHidden: state.hintHidden,
    };
  }

  function applyAll(data) {
    if (!data || typeof data !== "object") return;
    state.nodes = data.nodes || {};
    state.edges = data.edges || {};
    state.pages = data.pages || [];
    state.currentPageId = data.currentPageId || "all";
    if (data.title) state.title = data.title;
    syncMapTitle();
    if (data.view) {
      state.view.x = data.view.x || 0;
      state.view.y = data.view.y || 0;
      state.view.scale = data.view.scale || 1;
    }
    if (data.hintHidden) hideHint(true);
    normalizeBoard();
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
    renderMinimap();
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
      status: "live",
      vitality: "alive",
      seen: false,
      pageId:
        state.currentPageId !== "all"
          ? state.currentPageId
          : (state.pages[0] && state.pages[0].id) || null,
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

  function connect(a, b, style) {
    if (!a || !b || a === b) return;
    if (!state.nodes[a] || !state.nodes[b]) return;
    if (hasEdge(a, b)) {
      toast("Already linked");
      cancelLink();
      return;
    }
    pushHistory();
    const e = {
      id: uid(),
      a,
      b,
      style: style || (state.linkPlanted ? "planted" : "solid"),
    };
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
      status: "live",
      vitality: "alive",
      seen: false,
      pageId: a.pageId || (state.pages[0] && state.pages[0].id) || null,
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

  function deleteNode(id, { history } = { history: true }) {
    if (!state.nodes[id]) return;
    if (history !== false) pushHistory();
    delete state.nodes[id];
    for (const [eid, e] of Object.entries(state.edges)) {
      if (e.a === id || e.b === id) delete state.edges[eid];
    }
    if (state.selectedId === id) state.selectedId = null;
    if (state.selectedIds) state.selectedIds.delete(id);
    if (history !== false) {
      render();
      persist();
    }
  }

  function deleteSelected() {
    const ids = [...selectedSet()];
    if (!ids.length) return;
    pushHistory();
    ids.forEach((id) => deleteNode(id, { history: false }));
    render();
    persist();
  }

  function copySelection({ quiet } = {}) {
    const ids = selectedSet();
    if (!ids.size) return false;
    const nodes = [...ids]
      .map((id) => state.nodes[id])
      .filter(Boolean)
      .map((n) => JSON.parse(JSON.stringify(n)));
    const edges = Object.values(state.edges)
      .filter((e) => ids.has(e.a) && ids.has(e.b))
      .map((e) => JSON.parse(JSON.stringify(e)));
    state.clipboard = { nodes, edges };
    state.pasteN = 1;
    if (!quiet) toast("Copied " + nodes.length);
    return true;
  }

  function cutSelection() {
    if (!copySelection({ quiet: true })) return;
    const n = state.clipboard.nodes.length;
    deleteSelected();
    toast("Cut " + n);
  }

  function pasteSelection() {
    if (!state.clipboard || !state.clipboard.nodes.length) return;
    pushHistory();
    const map = {};
    const pageId =
      state.currentPageId !== "all"
        ? state.currentPageId
        : (state.pages[0] && state.pages[0].id) || null;
    const src = state.clipboard.nodes;
    const srcPages = new Set(src.map((n) => n.pageId).filter(Boolean));
    const pasteInPlace = pageId && !srcPages.has(pageId);
    let dx = 0;
    let dy = 0;
    if (!pasteInPlace) {
      let cx = 0;
      let cy = 0;
      src.forEach((n) => {
        cx += n.x;
        cy += n.y;
      });
      cx /= src.length;
      cy /= src.length;
      const rect = els.viewport.getBoundingClientRect();
      const px = state.pointer.x;
      const py = state.pointer.y;
      const onPaper =
        px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom;
      const target = onPaper
        ? screenToWorld(px, py)
        : screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
      dx = target.x - cx;
      dy = target.y - cy;
    }
    const fresh = new Set();
    for (const n of src) {
      const id = uid();
      map[n.id] = id;
      state.nodes[id] = Object.assign(JSON.parse(JSON.stringify(n)), {
        id,
        x: n.x + dx,
        y: n.y + dy,
        pageId,
        seen: true,
      });
      fresh.add(id);
    }
    for (const e of state.clipboard.edges) {
      const a = map[e.a];
      const b = map[e.b];
      if (!a || !b) continue;
      const id = uid();
      state.edges[id] = { id, a, b, style: e.style || "solid" };
    }
    state.selectedIds = fresh;
    state.selectedId = [...fresh][0] || null;
    render();
    persist();
    toast("Pasted");
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
    renderMinimap();
  }

  function tagMemberIds() {
    if (!state.highlightTag) return null;
    return new Set(
      Object.values(state.nodes)
        .filter((n) => (n.tags || []).some((t) => normTag(t) === state.highlightTag))
        .map((n) => n.id)
    );
  }

  function renderEdges() {
    const hot = tagMemberIds();
    const parts = [];
    for (const e of Object.values(state.edges)) {
      const a = state.nodes[e.a];
      const b = state.nodes[e.b];
      if (!a || !b) continue;
      if (!visibleNode(a) || !visibleNode(b)) continue;
      const from = rimPoint(a, b);
      const to = rimPoint(b, a);
      const planted = e.style === "planted" ? "planted" : "";
      const tagCls = hot ? (hot.has(e.a) && hot.has(e.b) ? "tag-hot" : "dimmed") : "";
      parts.push(
        `<g class="edge ${tagCls}" data-id="${e.id}">
          <line class="edge-hit ${planted}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" />
          <line class="edge-vis ${planted} ${tagCls}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" />
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
        if (ev.altKey) {
          pushHistory();
          e.style = e.style === "planted" ? "solid" : "planted";
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
    const hot = tagMemberIds();

    const html = Object.values(state.nodes)
      .filter(visibleNode)
      .map((n) => {
        const cls = [
          "node",
          n.kind === "subnode" ? "sub" : n.type,
          "status-" + (n.status || "live"),
          n.id === state.selectedId || (state.selectedIds && state.selectedIds.has(n.id)) ? "selected" : "",
          n.id === state.linkFrom ? "linking-src" : "",
          hot ? (hot.has(n.id) ? "tag-hot" : "dimmed") : "",
        ]
          .filter(Boolean)
          .join(" ");
        const title = escapeHtml(n.title || "Untitled");
        const unread = n.seen === false ? `<span class="unread" title="Unread"></span>` : "";
        const icon = n.kind === "subnode" ? "" : ICONS[n.type] || ICONS.note;
        const cond =
          n.kind !== "subnode" && n.type === "character"
            ? vitalIcon(n.vitality || "alive") + " "
            : "";
        return `<div class="${cls}" data-id="${n.id}" style="left:${n.x}px;top:${n.y}px">
          ${unread}
          ${icon}
          <div class="label">${cond}${title}</div>
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
      const onBorder = ellipseNorm(world, node) >= 0.78;

      if (state.linkFrom) {
        ev.preventDefault();
        return;
      }

      hideHover();
      if (onBorder && !ev.shiftKey) {
        ev.preventDefault();
        state.linkPlanted = ev.altKey;
        beginLink(id);
        return;
      }

      const inGroup = selectedSet().has(id) && selectedSet().size > 1;
      const ids = inGroup ? [...selectedSet()] : [id];
      const origins = {};
      ids.forEach((nid) => {
        const nn = state.nodes[nid];
        if (nn) origins[nid] = { x: nn.x, y: nn.y };
      });
      state.dragging = {
        id,
        ids,
        origins,
        startX: ev.clientX,
        startY: ev.clientY,
        origX: node.x,
        origY: node.y,
        moved: false,
        shift: ev.shiftKey,
        alt: ev.altKey,
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
      const scale = state.view.scale || 1;
      const ids = state.dragging.ids || [id];
      for (const nid of ids) {
        const n = state.nodes[nid];
        const orig = state.dragging.origins && state.dragging.origins[nid];
        if (!n || !orig) continue;
        n.x = orig.x + dx / scale;
        n.y = orig.y + dy / scale;
        const nel = els.nodes.querySelector(`.node[data-id="${nid}"]`);
        if (nel) {
          nel.style.left = n.x + "px";
          nel.style.top = n.y + "px";
        }
      }
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
        state.linkPlanted = drag.alt;
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
      const onBorder = ellipseNorm(world, node) >= 0.78;
      el.classList.toggle("on-ring", onBorder);
    });
    el.addEventListener("pointerleave", () => {
      el.classList.remove("on-ring");
      hideHover();
    });
    el.addEventListener("mouseenter", () => scheduleHover(id));
    el.addEventListener("mousemove", (ev) => placeHover(ev.clientX, ev.clientY));
    el.addEventListener("dblclick", (ev) => {
      ev.stopPropagation();
      selectNode(id);
      els.inspTitle.focus();
      els.inspTitle.select();
    });

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
    renderMinimap();
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
    if (els.inspTitleIcon) {
      const show = n.type === "character";
      els.inspTitleIcon.hidden = !show;
      if (show) els.inspTitleIcon.innerHTML = VITAL_ICONS[n.vitality || "alive"] || "";
    }
    if (document.activeElement !== els.inspDesc) {
      els.inspDesc.value = n.description || "";
    }
    if (els.inspDesc) {
      els.inspDesc.style.backgroundPosition = "0 " + -els.inspDesc.scrollTop + "px";
    }
    if (document.activeElement !== els.inspType) {
      els.inspType.value = n.type;
    }
    if (els.inspStatus && document.activeElement !== els.inspStatus) {
      els.inspStatus.value = n.status || "live";
    }
    els.inspKind.textContent = n.kind === "subnode" ? "Subnode" : "";
    els.inspKind.hidden = n.kind !== "subnode";
    if (els.inspCloseThread) {
      els.inspCloseThread.hidden = (n.status || "live") === "resolved";
    }
    if (els.inspVitalWrap) {
      const showVital = n.type === "character";
      els.inspVitalWrap.hidden = !showVital;
      if (showVital && document.activeElement !== els.inspVital) {
        els.inspVital.value = n.vitality || "alive";
      }
    }

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
    renderPages();
    const groups = {};
    for (const n of Object.values(state.nodes)) {
      if (!visibleNode(n)) continue;
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
      el.addEventListener("click", () => selectTag(el.dataset.tag));
    });
    els.tagList.querySelectorAll("li[data-id]").forEach((li) => {
      li.addEventListener("click", () => {
        const id = li.dataset.id;
        focusNode(id);
        selectNode(id);
      });
    });
  }

  function pageCount(id) {
    return Object.values(state.nodes).filter((n) => n.pageId === id).length;
  }

  function renderPages() {
    if (!els.pageList) return;
    ensurePages();
    const allCount = Object.keys(state.nodes).length;
    const rows = [`<div class="page-item ${state.currentPageId === "all" ? "active" : ""}" data-id="all">
      <span class="page-name">All pages</span>
      <span class="page-count">${allCount}</span>
    </div>`];
    for (const p of state.pages) {
      const active = state.currentPageId === p.id ? "active" : "";
      const editing = state.renamingPage === p.id;
      const name = editing
        ? `<input class="page-name" data-id="${p.id}" value="${escapeAttr(p.title)}" maxlength="32" />`
        : `<span class="page-title">${escapeHtml(p.title)}</span>
           <button type="button" class="page-edit" data-id="${p.id}" title="Rename">${PENCIL}</button>`;
      rows.push(`<div class="page-item ${active}" data-id="${p.id}">
        ${name}
        <span class="page-count">${pageCount(p.id)}</span>
        ${state.pages.length > 1 ? `<button type="button" class="page-x" data-id="${p.id}" title="Delete page and its nodes">×</button>` : ""}
      </div>`);
    }
    els.pageList.innerHTML = rows.join("");
    els.pageList.querySelectorAll(".page-item").forEach((el) => {
      el.addEventListener("click", (ev) => {
        if (ev.target.closest("button") || ev.target.tagName === "INPUT") return;
        state.currentPageId = el.dataset.id;
        state.highlightTag = null;
        state.renamingPage = null;
        render();
        persist();
        requestAnimationFrame(fitView);
      });
    });
    els.pageList.querySelectorAll(".page-edit").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        state.renamingPage = btn.dataset.id;
        renderPages();
        const inp = els.pageList.querySelector("input.page-name");
        if (inp) {
          inp.focus();
          inp.select();
        }
      });
    });
    els.pageList.querySelectorAll("input.page-name").forEach((inp) => {
      const commit = () => {
        const page = state.pages.find((p) => p.id === inp.dataset.id);
        if (page) {
          pushHistory();
          page.title = inp.value.trim() || page.title;
        }
        state.renamingPage = null;
        renderRail();
        persist();
      };
      inp.addEventListener("change", commit);
      inp.addEventListener("blur", commit);
      inp.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") inp.blur();
        if (ev.key === "Escape") {
          state.renamingPage = null;
          renderPages();
        }
      });
      inp.addEventListener("click", (ev) => ev.stopPropagation());
    });
    els.pageList.querySelectorAll(".page-x").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        deletePage(btn.dataset.id);
      });
    });
  }

  function deletePage(id) {
    if (state.pages.length < 2) return;
    const page = state.pages.find((p) => p.id === id);
    if (!page) return;
    pushHistory();
    const doomed = Object.values(state.nodes).filter((n) => n.pageId === id);
    const ids = new Set(doomed.map((n) => n.id));
    doomed.forEach((n) => delete state.nodes[n.id]);
    for (const [eid, e] of Object.entries(state.edges)) {
      if (ids.has(e.a) || ids.has(e.b)) delete state.edges[eid];
    }
    if (state.selectedIds) {
      ids.forEach((nid) => state.selectedIds.delete(nid));
    }
    if (ids.has(state.selectedId)) state.selectedId = null;
    state.pages = state.pages.filter((p) => p.id !== id);
    if (state.currentPageId === id) state.currentPageId = "all";
    render();
    persist();
    toast(page.title + " deleted" + (doomed.length ? " · " + doomed.length + " nodes" : ""));
    requestAnimationFrame(fitView);
  }

  function addPage() {
    pushHistory();
    ensurePages();
    const n = state.pages.length + 1;
    const page = { id: uid(), title: "Session " + n };
    state.pages.push(page);
    state.currentPageId = page.id;
    render();
    persist();
    toast("New page");
    requestAnimationFrame(fitView);
  }

  function selectTag(tag) {
    if (!tag) return;
    if (state.highlightTag === tag) {
      state.highlightTag = null;
      render();
      persist();
      return;
    }
    state.highlightTag = tag;
    const members = Object.values(state.nodes).filter(
      (n) => visibleNode(n) && (n.tags || []).some((t) => normTag(t) === tag)
    );
    state.selectedIds = new Set(members.map((n) => n.id));
    state.selectedId = members[0] ? members[0].id : null;
    render();
    persist();
  }

  function selectNode(id, { skipRender, add } = {}) {
    const n = state.nodes[id];
    if (!n) return;
    if (n.seen === false) n.seen = true;
    if (add) {
      state.selectedIds.add(id);
      state.selectedId = id;
    } else {
      state.selectedIds = new Set([id]);
      state.selectedId = id;
    }
    if (state.highlightTag) {
      const inGroup = (n.tags || []).some((t) => normTag(t) === state.highlightTag);
      if (!inGroup) state.highlightTag = null;
    }
    if (!skipRender) render();
  }

  function selectedSet() {
    const ids = new Set(state.selectedIds || []);
    if (state.selectedId) ids.add(state.selectedId);
    return ids;
  }

  function deselect() {
    state.selectedId = null;
    state.selectedIds = new Set();
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
    els.rubber.classList.toggle("planted", !!state.linkPlanted);
    renderNodes();
  }

  function rimPoint(node, toward) {
    const dx = toward.x - node.x;
    const dy = toward.y - node.y;
    const d = Math.hypot(dx, dy) || 1;
    const ux = dx / d;
    const uy = dy / d;
    const { rx, ry } = radiiOf(node);
    const t = 1 / Math.sqrt((ux * ux) / (rx * rx) + (uy * uy) / (ry * ry));
    return { x: node.x + ux * t, y: node.y + uy * t };
  }

  function ellipseNorm(p, node) {
    const { rx, ry } = radiiOf(node);
    return Math.hypot((p.x - node.x) / rx, (p.y - node.y) / ry);
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
    state.linkPlanted = false;
    els.viewport.classList.remove("linking");
    hideRubber();
    els.rubber.classList.remove("planted");
    renderNodes();
  }

  function scheduleHover(id) {
    clearTimeout(state.hoverTimer);
    state.hoverTimer = setTimeout(() => showHover(id), 220);
  }

  function showHover(id) {
    if (state.dragging || state.linkFrom || state.panning) return;
    const n = state.nodes[id];
    if (!n || !els.hovercard) return;
    state.hoverId = id;
    const st = STATUSES.find((s) => s.id === (n.status || "live"));
    const bits = [typeLabel(n.type), st ? st.label : "Live"];
    if (n.type === "character") bits.push(n.vitality || "alive");
    const body = (n.description || "").trim();
    const cond = n.type === "character" ? vitalIcon(n.vitality || "alive") : "";
    els.hovercard.innerHTML = `<div class="hc-title">${cond}<span>${escapeHtml(n.title || "Untitled")}</span></div>
      <div class="hc-meta">${escapeHtml(bits.join(" · "))}</div>
      <div class="hc-body">${escapeHtml(body ? body.slice(0, 180) + (body.length > 180 ? "…" : "") : "No notes yet")}</div>`;
    els.hovercard.hidden = false;
    placeHover(state.pointer.x, state.pointer.y);
  }

  function placeHover(x, y) {
    if (!els.hovercard || els.hovercard.hidden) return;
    els.hovercard.style.left = x + 16 + "px";
    els.hovercard.style.top = y + 16 + "px";
  }

  function hideHover() {
    clearTimeout(state.hoverTimer);
    state.hoverId = null;
    if (els.hovercard) els.hovercard.hidden = true;
  }

  function fitView() {
    const nodes = Object.values(state.nodes).filter(visibleNode);
    const rail = 232;
    const w = Math.max(els.viewport.clientWidth || window.innerWidth - rail, 640);
    const h = Math.max(els.viewport.clientHeight || window.innerHeight, 480);
    if (!nodes.length) {
      state.view.scale = 1;
      state.view.x = w / 2;
      state.view.y = h / 2;
      applyView();
      persist();
      return;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      const r = radiusOf(n) + 24;
      minX = Math.min(minX, n.x - r);
      minY = Math.min(minY, n.y - r);
      maxX = Math.max(maxX, n.x + r);
      maxY = Math.max(maxY, n.y + r);
    }
    const bw = Math.max(maxX - minX, 200);
    const bh = Math.max(maxY - minY, 200);
    const insp = els.inspector && !els.inspector.hidden ? els.inspector.getBoundingClientRect().width : 0;
    const help = els.help && !els.help.hidden ? els.help.getBoundingClientRect().width : 0;
    const padL = 48 + Math.max(insp, help);
    const padR = 48;
    const padT = 72;
    const padB = 48;
    const scale = Math.min(1.25, Math.max(0.35, Math.min((w - padL - padR) / bw, (h - padT - padB) / bh)));
    state.view.scale = scale;
    state.view.x = padL + (w - padL - padR) / 2 - ((minX + maxX) / 2) * scale;
    state.view.y = padT + (h - padT - padB) / 2 - ((minY + maxY) / 2) * scale;
    applyView();
    persist();
  }

  function miniColor(n) {
    const st = n.status || "live";
    if (st === "resolved") return "#8a8478";
    if (st === "missed") return "#c4a035";
    if (st === "ghost") return null;
    if (st === "rumor") return "#b39a62";
    return (
      {
        character: "#2f4f46",
        location: "#6b4a24",
        event: "#7a3030",
        faction: "#33415f",
        note: "#5a5348",
      }[n.type] || "#5a5348"
    );
  }

  function renderMinimap() {
    const canvas = els.minimap;
    if (!canvas) return;
    const cssW = 196;
    const cssH = 132;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "#efe6d0";
    ctx.fillRect(0, 0, cssW, cssH);

    const nodes = Object.values(state.nodes).filter(visibleNode);
    const pad = 10;
    let minX = 0, minY = 0, maxX = 400, maxY = 260;
    if (nodes.length) {
      minX = Infinity;
      minY = Infinity;
      maxX = -Infinity;
      maxY = -Infinity;
      for (const n of nodes) {
        const r = radiusOf(n);
        minX = Math.min(minX, n.x - r);
        minY = Math.min(minY, n.y - r);
        maxX = Math.max(maxX, n.x + r);
        maxY = Math.max(maxY, n.y + r);
      }
    }
    const spanX = Math.max(maxX - minX, 240);
    const spanY = Math.max(maxY - minY, 160);
    const extra = Math.max(spanX, spanY) * 0.08;
    minX -= extra;
    minY -= extra;
    maxX += extra;
    maxY += extra;
    const worldW = maxX - minX;
    const worldH = maxY - minY;
    const scale = Math.min((cssW - pad * 2) / worldW, (cssH - pad * 2) / worldH);
    const ox = pad + ((cssW - pad * 2) - worldW * scale) / 2;
    const oy = pad + ((cssH - pad * 2) - worldH * scale) / 2;
    state.mini = { minX, minY, scale, ox, oy, cssW, cssH };

    const toMap = (x, y) => ({
      x: ox + (x - minX) * scale,
      y: oy + (y - minY) * scale,
    });

    ctx.lineWidth = 0.7;
    ctx.strokeStyle = "rgba(42,36,28,0.28)";
    for (const e of Object.values(state.edges)) {
      const a = state.nodes[e.a];
      const b = state.nodes[e.b];
      if (!a || !b || !visibleNode(a) || !visibleNode(b)) continue;
      const pa = toMap(a.x, a.y);
      const pb = toMap(b.x, b.y);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      if (e.style === "planted") ctx.setLineDash([2, 2]);
      else ctx.setLineDash([]);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    for (const n of nodes) {
      const p = toMap(n.x, n.y);
      const r = n.kind === "subnode" ? 1.6 : 2.6;
      const fill = miniColor(n);
      const selected = n.id === state.selectedId || (state.selectedIds && state.selectedIds.has(n.id));
      if (fill) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = "#8a7f70";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (selected) {
        ctx.strokeStyle = "#c45a2a";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const rect = els.viewport.getBoundingClientRect();
    const tl = screenToWorld(rect.left, rect.top);
    const br = screenToWorld(rect.right, rect.bottom);
    const a = toMap(tl.x, tl.y);
    const b = toMap(br.x, br.y);
    const vx = Math.min(a.x, b.x);
    const vy = Math.min(a.y, b.y);
    const vw = Math.abs(b.x - a.x);
    const vh = Math.abs(b.y - a.y);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cssW, cssH);
    ctx.clip();
    ctx.strokeStyle = "#c45a2a";
    ctx.lineWidth = 1.3;
    ctx.strokeRect(vx + 0.5, vy + 0.5, Math.max(vw, 4), Math.max(vh, 4));
    ctx.fillStyle = "rgba(196,90,42,0.08)";
    ctx.fillRect(vx, vy, Math.max(vw, 4), Math.max(vh, 4));
    ctx.restore();
  }

  function miniToWorld(clientX, clientY) {
    const m = state.mini;
    if (!m || !els.minimap) return null;
    const r = els.minimap.getBoundingClientRect();
    const mx = ((clientX - r.left) / r.width) * m.cssW;
    const my = ((clientY - r.top) / r.height) * m.cssH;
    return {
      x: m.minX + (mx - m.ox) / m.scale,
      y: m.minY + (my - m.oy) / m.scale,
    };
  }

  function centerViewOn(wx, wy, persistAfter) {
    const rect = els.viewport.getBoundingClientRect();
    state.view.x = rect.width / 2 - wx * state.view.scale;
    state.view.y = rect.height / 2 - wy * state.view.scale;
    applyView();
    if (persistAfter) persist();
  }

  function setupMinimap() {
    if (!els.minimap) return;
    els.minimap.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      els.minimap.setPointerCapture(ev.pointerId);
      state.miniDrag = true;
      const w = miniToWorld(ev.clientX, ev.clientY);
      if (w) centerViewOn(w.x, w.y, false);
    });
    els.minimap.addEventListener("pointermove", (ev) => {
      if (!state.miniDrag) return;
      const w = miniToWorld(ev.clientX, ev.clientY);
      if (w) centerViewOn(w.x, w.y, false);
    });
    els.minimap.addEventListener("pointerup", () => {
      if (state.miniDrag) persist();
      state.miniDrag = false;
    });
    els.minimap.addEventListener("pointercancel", () => {
      state.miniDrag = false;
    });
  }

  /* ---------- viewport input ---------- */

  function setupInput() {
    els.viewport.addEventListener("pointerdown", (ev) => {
      if (ev.button !== 0 && ev.button !== 1 && ev.button !== 2) return;
      if (ev.target.closest(".node") || ev.target.closest("g.edge")) return;
      if (state.linkFrom) return;
      hideHover();
      const rect = els.viewport.getBoundingClientRect();
      const pan = ev.button === 1 || ev.button === 2 || state.spaceDown;
      els.viewport.setPointerCapture(ev.pointerId);
      if (pan) {
        state.panning = {
          startX: ev.clientX,
          startY: ev.clientY,
          origX: state.view.x,
          origY: state.view.y,
          moved: false,
        };
        els.viewport.classList.add("panning");
        return;
      }
      state.marquee = {
        x0: ev.clientX - rect.left,
        y0: ev.clientY - rect.top,
        x1: ev.clientX - rect.left,
        y1: ev.clientY - rect.top,
        add: ev.shiftKey,
      };
      showMarquee();
    });

    els.viewport.addEventListener("pointermove", (ev) => {
      state.pointer.x = ev.clientX;
      state.pointer.y = ev.clientY;
      if (state.linkFrom) moveRubber(ev.clientX, ev.clientY);
      if (state.marquee) {
        const rect = els.viewport.getBoundingClientRect();
        state.marquee.x1 = ev.clientX - rect.left;
        state.marquee.y1 = ev.clientY - rect.top;
        showMarquee();
        return;
      }
      if (!state.panning) return;
      const dx = ev.clientX - state.panning.startX;
      const dy = ev.clientY - state.panning.startY;
      if (Math.hypot(dx, dy) > 3) state.panning.moved = true;
      state.view.x = state.panning.origX + dx;
      state.view.y = state.panning.origY + dy;
      applyView();
    });

    window.addEventListener("pointermove", (ev) => {
      state.pointer.x = ev.clientX;
      state.pointer.y = ev.clientY;
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
      if (state.marquee) {
        finishMarquee();
        return;
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

    els.viewport.addEventListener("contextmenu", (ev) => ev.preventDefault());

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
        else if (els.help && !els.help.hidden) els.help.hidden = true;
        else {
          state.highlightTag = null;
          deselect();
          renderRail();
        }
        return;
      }
      if (ev.key === " ") {
        state.spaceDown = true;
        if (!typing) ev.preventDefault();
      }
      if (ev.key === "?" || (ev.shiftKey && ev.key === "/")) {
        if (els.help) els.help.hidden = !els.help.hidden;
        return;
      }
      if (typing) return;
      if ((ev.key === "f" || ev.key === "F") && !ev.ctrlKey && !ev.metaKey) {
        ev.preventDefault();
        fitView();
        return;
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "c") {
        ev.preventDefault();
        copySelection();
        return;
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "x") {
        ev.preventDefault();
        cutSelection();
        return;
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "v") {
        ev.preventDefault();
        pasteSelection();
        return;
      }
      if ((ev.key === "Delete" || ev.key === "Backspace") && selectedSet().size) {
        ev.preventDefault();
        deleteSelected();
      }
    });
    window.addEventListener("keyup", (ev) => {
      if (ev.key === " ") state.spaceDown = false;
    });
  }

  function showMarquee() {
    if (!els.marquee || !state.marquee) return;
    const m = state.marquee;
    const x = Math.min(m.x0, m.x1);
    const y = Math.min(m.y0, m.y1);
    const w = Math.abs(m.x1 - m.x0);
    const h = Math.abs(m.y1 - m.y0);
    els.marquee.hidden = false;
    els.marquee.style.left = x + "px";
    els.marquee.style.top = y + "px";
    els.marquee.style.width = w + "px";
    els.marquee.style.height = h + "px";
  }

  function hideMarquee() {
    state.marquee = null;
    if (els.marquee) {
      els.marquee.hidden = true;
      els.marquee.style.width = "0";
      els.marquee.style.height = "0";
    }
  }

  function finishMarquee() {
    const m = state.marquee;
    hideMarquee();
    if (!m) return;
    const w = Math.abs(m.x1 - m.x0);
    const h = Math.abs(m.y1 - m.y0);
    if (w < 6 && h < 6) {
      if (!m.add) {
        state.highlightTag = null;
        deselect();
        renderRail();
      }
      return;
    }
    const rect = els.viewport.getBoundingClientRect();
    const a = screenToWorld(rect.left + Math.min(m.x0, m.x1), rect.top + Math.min(m.y0, m.y1));
    const b = screenToWorld(rect.left + Math.max(m.x0, m.x1), rect.top + Math.max(m.y0, m.y1));
    const hit = Object.values(state.nodes).filter((n) => {
      if (!visibleNode(n)) return false;
      return n.x >= a.x && n.x <= b.x && n.y >= a.y && n.y <= b.y;
    });
    if (!m.add) state.selectedIds = new Set();
    hit.forEach((n) => state.selectedIds.add(n.id));
    state.selectedId = hit[0] ? hit[0].id : m.add ? state.selectedId : null;
    render();
  }

  /* ---------- inspector fields ---------- */

  function setupInspector() {
    TYPES.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.label;
      els.inspType.appendChild(opt);
    });
    STATUSES.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.label;
      els.inspStatus.appendChild(opt);
    });
    VITALS.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.label;
      els.inspVital.appendChild(opt);
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
    els.inspStatus.addEventListener("change", () => {
      if (!state.selectedId) return;
      pushHistory();
      updateNode(state.selectedId, { status: els.inspStatus.value });
    });
    els.inspVital.addEventListener("change", () => {
      if (!state.selectedId) return;
      pushHistory();
      updateNode(state.selectedId, { vitality: els.inspVital.value });
    });
    els.inspCloseThread.addEventListener("click", () => {
      if (!state.selectedId) return;
      pushHistory();
      updateNode(state.selectedId, { status: "resolved" });
      toast("Thread closed");
    });
    /* condition icon lives on the title, not in the dropdown row */

    const syncNoteRules = () => {
      els.inspDesc.style.backgroundPosition = "0 " + -els.inspDesc.scrollTop + "px";
    };
    els.inspDesc.addEventListener("scroll", syncNoteRules);
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
      syncNoteRules();
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
      deleteSelected();
    });
  }

  function setupMenu() {
    if (els.mapTitle) {
      els.mapTitle.addEventListener("change", () => setMapTitle(els.mapTitle.value));
      els.mapTitle.addEventListener("blur", () => setMapTitle(els.mapTitle.value));
      els.mapTitle.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") els.mapTitle.blur();
        if (ev.key === "Escape") {
          els.mapTitle.value = state.title || "Prep Map";
          els.mapTitle.blur();
        }
      });
    }

    els.btnExport.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(serializeAll(), null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileSlug(state.title) + ".json";
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
        if (!data.title && file.name) {
          state.title = file.name.replace(/\.json$/i, "").trim() || state.title;
          syncMapTitle();
        }
        state.selectedId = null;
        render();
        persist();
        toast("Imported");
      } catch (_) {
        toast("Could not read that file");
      }
    });

    if (els.btnNewPage) els.btnNewPage.addEventListener("click", addPage);
    if (els.btnFit) els.btnFit.addEventListener("click", fitView);
    if (els.btnHelp) {
      els.btnHelp.addEventListener("click", () => {
        if (!els.help) return;
        els.help.hidden = !els.help.hidden;
      });
    }
    els.btnUndo.addEventListener("click", () => undo());
    els.btnRedo.addEventListener("click", () => redo());

    els.btnClear.addEventListener("click", () => {
      const hasNodes = Object.keys(state.nodes).length > 0;
      const hasExtraPages = (state.pages || []).length > 1;
      const titled = (state.title || "") !== "New Map" && (state.title || "") !== "Prep Map";
      if (!hasNodes && !hasExtraPages && !Object.keys(state.edges).length && !titled) return;
      if (!confirm("Clear this map? Export first if you may want it back.")) return;
      pushHistory();
      state.nodes = {};
      state.edges = {};
      state.selectedId = null;
      state.selectedIds = new Set();
      state.highlightTag = null;
      state.clipboard = null;
      state.linkFrom = null;
      const page = { id: uid(), title: "Session 1" };
      state.pages = [page];
      state.currentPageId = "all";
      state.renamingPage = null;
      state.title = "New Map";
      syncMapTitle();
      hideRubber();
      render();
      persist();
      centerCamera();
      applyView();
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
    const session1 = { id: "page-s1", title: "Session 1" };
    const session2 = { id: "page-s2", title: "Session 2" };
    state.pages = [session1, session2];
    state.currentPageId = "all";
    const n = (title, type, kind, x, y, tags, description, extra) => {
      const id = title.toLowerCase().replace(/\s+/g, "-");
      state.nodes[id] = Object.assign(
        {
          id,
          title,
          type,
          kind,
          x,
          y,
          tags: tags || [],
          description: description || "",
          status: "live",
          vitality: "alive",
          seen: true,
          pageId: session1.id,
        },
        extra || {}
      );
      return id;
    };
    const e = (a, b, style) => {
      const id = uid();
      state.edges[id] = { id, a, b, style: style || "solid" };
    };
    state.nodes = {};
    state.edges = {};
    const jagger = n("Jagger", "character", "node", -280, -40, ["Republic"], "Pays his debts in favors.", { vitality: "alive" });
    const tseren = n("Tseren", "character", "node", 160, -160, ["Republic"], "Thinks the convoy was a test.", { vitality: "compromised" });
    const sonny = n("Sonny", "character", "node", 210, 90, ["Raiders"], "Last seen riding east.", { vitality: "missing" });
    const blackout = n("Blackout", "character", "node", -40, 80, ["Raiders"], "Died holding the ridge.", { vitality: "dead", status: "resolved" });
    const tsurun = n("Tsurun", "location", "node", 40, 230, ["Raiders"], "Locked waystation on the ridge.", { status: "resolved" });
    const convoy = n("Convoy", "event", "node", 40, -20, ["Tag"], "Convoy is ambushed on the salt road. Jagger, Tseren and Sonny are all on it.");
    const rumor = n("Salt ledger", "note", "node", -260, 160, ["Republic"], "Someone in the Republic keeps a second book.", { status: "rumor", seen: false });
    const ghost = n("The third rider", "character", "node", 320, 220, ["Raiders"], "A name nobody will say.", { status: "ghost", seen: false, vitality: "missing", pageId: session2.id });
    const missed = n("Ask the widow", "event", "node", -160, 240, [], "They never stopped at her house.", { status: "missed" });
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
    e(jagger, rumor, "planted");
    e(sonny, ghost, "planted");
    e(jagger, missed);
    state.selectedId = convoy;
    state.highlightTag = null;
    state.hintHidden = true;
    state.title = "Salt Road";
    syncMapTitle();
    centerCamera();
  }

  function loadStory(step) {
    step = Math.max(1, Math.min(8, Number(step) || 1));
    const session1 = { id: "page-s1", title: "Session 1" };
    const session2 = { id: "page-s2", title: "Session 2" };
    state.pages = step >= 6 ? [session1, session2] : [session1];
    state.currentPageId = step === 6 ? session2.id : step >= 7 ? "all" : session1.id;
    state.nodes = {};
    state.edges = {};
    state.selectedId = null;
    state.selectedIds = new Set();
    state.highlightTag = null;
    state.hintHidden = true;
    state.title = "Salt Road";
    const n = (id, title, type, kind, x, y, extra) => {
      state.nodes[id] = Object.assign(
        {
          id,
          title,
          type,
          kind,
          x,
          y,
          tags: [],
          description: "",
          status: "live",
          vitality: "alive",
          seen: true,
          pageId: session1.id,
        },
        extra || {}
      );
      return id;
    };
    const e = (a, b, style) => {
      const id = a + "--" + b;
      state.edges[id] = { id, a, b, style: style || "solid" };
    };

    if (step >= 2) {
      n("jagger", "Jagger", "character", "node", -260, -80, {
        description: "Pays his debts in favors.",
        vitality: "alive",
      });
      n("sonny", "Sonny", "character", "node", 230, -70, {
        description: "Last seen riding east.",
        vitality: step >= 3 ? "dead" : "alive",
        status: step >= 3 ? "resolved" : "live",
      });
      n("ambush", "Ambush", "event", "node", -10, 10, {
        description: "The convoy is hit on the salt road. Jagger and Sonny are both on it.",
        status: step >= 3 ? "resolved" : "live",
      });
      n("salt-road", "Salt road", "location", "node", -10, 210, {
        description: "Packed white earth. No cover.",
      });
      e("jagger", "ambush");
      e("sonny", "ambush");
      e("ambush", "salt-road");
    }

    if (step >= 4) {
      const tag = ["aftermath"];
      n("burn", "Burn the wagons", "event", "node", -300, 170, {
        tags: tag,
        description: "Leave nothing the raiders can haul.",
      });
      n("hunt", "Hunt the rider", "event", "node", 270, 170, {
        tags: tag,
        description: "One got away east. Follow the dust.",
      });
      n("widow", "Ask the widow", "event", "node", 150, 300, {
        tags: tag,
        description: "She saw the third horse. They never stopped.",
      });
      e("ambush", "burn");
      if (step >= 8) {
        n("dust", "Dust trail", "note", "subnode", 130, 90, {
          description: "Hoofprints leave the road after the second wagon. One horse. No pack.",
        });
        e("ambush", "dust");
        e("dust", "hunt");
      } else {
        e("ambush", "hunt");
      }
      e("ambush", "widow");
    }

    if (step >= 6) {
      const copies = [
        ["burn", "Burn the wagons", -300, 170, "Leave nothing the raiders can haul."],
        ["hunt", "Hunt the rider", 270, 170, "One got away east. Follow the dust."],
        ["widow", "Ask the widow", 150, 300, "She saw the third horse. They never stopped."],
      ];
      for (const [src, title, x, y, desc] of copies) {
        n(src + "-s2", title, "event", "node", x, y, {
          tags: ["aftermath"],
          description: desc,
          pageId: session2.id,
        });
      }
      n("ash-field", "Ash field", "location", "node", -300, 340, {
        description: "Black rings where the wagons stood.",
        pageId: session2.id,
      });
      n("watch-post", "Watch post", "location", "node", 270, 340, {
        description: "A ridge the rider has to crest.",
        pageId: session2.id,
      });
      n("cottage", "Widow's house", "location", "node", 150, 460, {
        description: "Shutters closed since the raid.",
        pageId: session2.id,
      });
      e("burn-s2", "ash-field");
      e("hunt-s2", "watch-post");
      e("widow-s2", "cottage");
    }

    if (step === 1) {
      state.hintHidden = false;
      state.currentPageId = "all";
      if (els.help) els.help.hidden = false;
    } else if (step === 2 || step === 3) {
      state.selectedId = "ambush";
      state.selectedIds = new Set(["ambush"]);
    } else if (step === 4) {
      state.selectedId = "widow";
      state.selectedIds = new Set(["widow"]);
    } else if (step === 5) {
      state.highlightTag = "aftermath";
      state.selectedIds = new Set(["burn", "hunt", "widow"]);
      state.selectedId = "burn";
    } else if (step === 6) {
      state.highlightTag = null;
      state.selectedIds = new Set(["burn-s2", "hunt-s2", "widow-s2"]);
      state.selectedId = "burn-s2";
    } else if (step === 7) {
      state.highlightTag = null;
      state.selectedId = null;
      state.selectedIds = new Set();
    } else if (step === 8) {
      state.highlightTag = null;
      state.selectedId = "dust";
      state.selectedIds = new Set(["dust"]);
    }

    syncMapTitle();
    if (els.hint) {
      if (state.hintHidden) els.hint.classList.add("gone");
      else els.hint.classList.remove("gone");
    }
  }

  function centerCamera() {
    const rail = 232;
    const w = Math.max(els.viewport.clientWidth || window.innerWidth - rail, 800);
    const h = Math.max(els.viewport.clientHeight || window.innerHeight, 600);
    state.view.scale = 1;
    state.view.x = w / 2;
    state.view.y = h / 2;
  }

  function frameBoard() {
    const inspW = els.inspector && !els.inspector.hidden ? els.inspector.getBoundingClientRect().width : 0;
    const helpW = els.help && !els.help.hidden ? els.help.getBoundingClientRect().width : 0;
    const left = Math.max(inspW, helpW);
    const w = Math.max(els.viewport.clientWidth || window.innerWidth - 232, 800);
    const h = Math.max(els.viewport.clientHeight || window.innerHeight, 600);
    const vis = Object.values(state.nodes).filter(visibleNode);
    if (!vis.length) {
      state.view.scale = 1;
      state.view.x = w / 2;
      state.view.y = h / 2;
      applyView();
      return;
    }
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of vis) {
      const r = radiusOf(n) + 28;
      minX = Math.min(minX, n.x - r);
      minY = Math.min(minY, n.y - r);
      maxX = Math.max(maxX, n.x + r);
      maxY = Math.max(maxY, n.y + r);
    }
    const bw = Math.max(maxX - minX, 240);
    const bh = Math.max(maxY - minY, 240);
    const padL = 36 + left;
    const padR = 36;
    const padT = 80;
    const padB = 36;
    const scale = Math.min(1.15, Math.max(0.55, Math.min((w - padL - padR) / bw, (h - padT - padB) / bh)));
    state.view.scale = scale;
    state.view.x = padL + (w - padL - padR) / 2 - ((minX + maxX) / 2) * scale;
    state.view.y = padT + (h - padT - padB) / 2 - ((minY + maxY) / 2) * scale;
    applyView();
  }

  function applyShot(q) {
    const shot = q.get("shot") || "";
    if (shot === "empty") {
      state.nodes = {};
      state.edges = {};
      state.pages = [{ id: "page-s1", title: "Session 1" }];
      state.currentPageId = "all";
      state.selectedId = null;
      state.selectedIds = new Set();
      state.highlightTag = null;
      state.title = "Prep Map";
      state.hintHidden = false;
      if (els.hint) {
        els.hint.hidden = false;
        els.hint.classList.remove("gone");
      }
      if (els.help) els.help.hidden = true;
      if (els.inspector) els.inspector.hidden = true;
      syncMapTitle();
      render();
      frameBoard();
      return;
    }
    if (q.get("demo") === "1" || Object.keys(state.nodes).length) {
      if (shot === "help" && els.help) els.help.hidden = false;
      else if (els.help && shot) els.help.hidden = true;
      if (shot === "board") {
        state.selectedId = null;
        state.selectedIds = new Set();
        if (els.inspector) els.inspector.hidden = true;
        render();
      }
      frameBoard();
    } else {
      applyView();
    }
    if (shot === "hover") {
      const id = q.get("select") || "convoy";
      state.selectedId = null;
      state.selectedIds = new Set();
      if (els.inspector) els.inspector.hidden = true;
      render();
      frameBoard();
      showHover(id);
      const node = state.nodes[id];
      if (node) {
        const sx = state.view.x + node.x * state.view.scale;
        const sy = state.view.y + node.y * state.view.scale - 86;
        placeHover(Math.max(420, sx), Math.max(140, sy));
      } else {
        placeHover(640, 340);
      }
    }
  }

  /* ---------- boot ---------- */

  async function boot() {
    setupInspector();
    setupInput();
    setupMenu();
    setupMinimap();
    const params = new URLSearchParams(location.search);
    const wantDemo = params.get("demo") === "1";
    const wantEmpty = params.get("shot") === "empty";
    const story = params.get("story");
    if (wantDemo || wantEmpty || story) {
      // Skip restore so screenshots / demo URLs are not poisoned by the last board.
    } else {
      await restore();
    }
    normalizeBoard();
    if (story) {
      loadStory(story);
    } else if (wantDemo) {
      loadDemo();
      const hl = params.get("tag");
      if (hl) state.highlightTag = hl.toLowerCase();
      const page = params.get("page");
      if (page) state.currentPageId = page;
      const sel = params.get("select");
      if (sel && state.nodes[sel]) {
        state.selectedId = sel;
        state.selectedIds = new Set([sel]);
      }
    }
    // center empty board
    if (!Object.keys(state.nodes).length && state.view.x === 0 && state.view.y === 0) {
      centerCamera();
    }
    if (state.hintHidden) els.hint.classList.add("gone");
    syncMapTitle();
    render();
    requestAnimationFrame(() => {
      const q = new URLSearchParams(location.search);
      applyShot(q);
    });
    els.viewport.focus();
    syncHistoryButtons();
    state.ready = true;
    document.documentElement.dataset.ready = "1";
    window.PrepMap = {
      state,
      createNode,
      connect,
      selectNode,
      focusNode,
      render,
      persist,
      fitView,
      applyView,
      showHover,
      placeHover,
      loadDemo,
      loadStory,
      selectTag,
    };
  }

  boot();
})();
