# Prep Map

A one-page, desktop-only mind map for TTRPG GMs. Nothing is sent to a server. The board lives in this browser (IndexedDB, with a localStorage fallback) and comes back when you reopen the tab.

Use a window at least ~1100px wide. There is no mobile layout.

## Open it

- Double-click `index.html`, or
- Serve the folder as static files (GitHub Pages, Netlify, or `python3 -m http.server`).

Optional URL flags:

- `?demo=1` — load a sample raid-on-the-salt-road board (useful after Clear).
- `?select=<node-id>` — open that node’s inspector after load.

Export JSON from the right rail if you switch browsers or machines.

---

## Canvas

An almost endless sheet of paper. Zoom with the mouse wheel (toward the cursor).

| Action | How |
|---|---|
| Pan | Middle-drag, right-drag, or hold **Space** and drag |
| Select several nodes | Drag empty paper (marquee). **Shift-drag** adds to the selection |
| Frame everything on the current page | **Fit** button or **F** |
| Deselect / cancel a link | **Esc**, or a click that does not move |

New nodes created on a session page stay on that page. **All pages** shows the whole campaign.

---

## Nodes

Two sizes:

- **Node** — large disc. Type icon, title, and (for characters) a condition mark in front of the name.
- **Subnode** — small ellipse. Title only. Dropped onto a link, or created as a normal node and linked by hand.

**Types:** Character, Location, Event, Faction, Note. Type tints the fill and the border.

**Double-click** empty paper to create a node. **Double-click** a node to jump into its name field.

Drag a node’s body to move it. If several nodes are selected, dragging any of them moves the group.

Nodes give each other a little space when a new one is dropped too close.

### Thread (status)

Thread is the colour language of the disc:

| Thread | Look |
|---|---|
| Live | Type colour, solid ring |
| Resolved | Grey wash, title struck through. Use **Close thread** to get here without deleting |
| Missed | Gold fill — a path the table did not take |
| Rumor | Dashed ring and hatch |
| Ghost | Empty dashed ring — a name nobody will say |

### Condition (characters only)

Condition does **not** recolour the disc. It is a small mark in front of the name (on the node, in the hover card, and beside the inspector title):

| Mark | Meaning |
|---|---|
| Heart | Alive |
| ? | Missing |
| Warning | Compromised |
| Skull | Dead |

---

## Links

| Action | How |
|---|---|
| Start a link | Drag the **ring** of node A onto node B |
| Link shortcut | Select A, **Shift-click** B |
| Planted (dashed) link | Hold **Alt** while linking, or **Alt-click** an existing line |
| Cancel | **Esc**, or click empty paper |
| Drop a subnode on a line | Click the line |
| Delete a line | **Shift-click** the line |

Planted links are the “I seeded this, it has not happened yet” kind of support.

---

## Inspector

Click a node body to open the sheet in the bottom-left.

- Title, type, thread, condition (characters), linked neighbours, tags, notes.
- Neighbour names jump the camera to that node.
- Tags: type a word and press **Enter**. Click × on a chip to drop it.
- Notes use faint ruled lines that scroll with the text. Stretch the field and the sheet grows up toward the toolbar; a scrollbar appears only after that.
- **Delete** removes the current selection (one node or many).

Hover a node (after a short pause) for a title + excerpt card. The card appears under the cursor, not at the last place it was.

---

## Pages

The right rail lists session pages.

- Click a name to show only that page.
- **All pages** shows everything.
- **+** starts a new empty session and switches to it.
- Pencil renames. Clicking the name never opens rename.
- **×** deletes the page **and every node that lived on it** (Undo brings both back). The last page cannot be deleted.

Paste lands on the page you are looking at. If you are on **All pages**, paste uses the first session.

---

## Tags

Tags live on the node and are indexed in the rail.

- Click a node name under a tag to focus it and open the inspector.
- Click the `#TAG` header to highlight every member and dim the rest.

---

## Copy and paste

Select with a marquee (or click). **Ctrl+C** copies the selection and the links *between* those nodes. **Ctrl+V** pastes a copy, offset a little, onto the current page. Paste again to stack further copies. Undo works.

---

## Persistence

Every change writes to IndexedDB (or localStorage if IndexedDB is unavailable). Close the tab, open it later — the same board is there.

| Button | What it does |
|---|---|
| Export | Download a JSON snapshot |
| Import | Replace the board with a JSON file (v1 files are migrated) |
| Clear | Empty the board. Undo will not resurrect a cleared map; Export first if you care |

---

## Keybindings

| Key | Action |
|---|---|
| **Ctrl+Z** | Undo |
| **Ctrl+Y** or **Ctrl+Shift+Z** | Redo |
| **Ctrl+C** / **Ctrl+V** | Copy / paste selection |
| **Delete** / **Backspace** | Delete selection |
| **F** | Fit all visible nodes |
| **Esc** | Cancel link, close help, or deselect |
| **?** | Toggle the shortcut card |
| **Space** (hold) + drag | Pan |
| Double-click empty paper | New node |
| Double-click a node | Edit title |

Typing in a field eats the keys; shortcuts stay off until you leave the field.

Toolbar, top-left: **Undo**, **Redo**, **Fit**, **?**.

---

## Files

```
index.html
styles.css
app.js
README.md
```

No build step. No accounts. No cloud.

---

Made by [Grok](https://grok.com), built by xAI.
