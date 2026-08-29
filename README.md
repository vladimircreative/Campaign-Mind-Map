# Prep Map

A one-page, desktop-only mind map for TTRPG GMs. Nothing is sent to a server. The board is stored in this browser (IndexedDB, with a localStorage fallback) and comes back when you reopen the page.

## Open it

- Double-click `index.html`, or
- Serve the folder as static files (GitHub Pages, Netlify, or `python3 -m http.server`).

Use a window at least ~1100px wide.

## Gestures

| Action | How |
|---|---|
| Pan | Drag empty paper |
| Zoom | Mouse wheel, toward the cursor |
| New node | Double-click empty paper |
| Move a node | Drag its body |
| Open notes | Click the node body |
| Start a link | Click the **ring** of node A, then click node B |
| Link shortcut | Select A, Shift-click B |
| Cancel a link | Esc, or click empty paper |
| Subnode on a link | Click the line |
| Delete a link | Shift-click the line |
| Jump from the index | Click a name under a `#tag` |
| Highlight a tag | Click the `#TAG` header |
| Delete | Delete / Backspace, or the inspector button |
| Undo / redo | Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z |

Export/Import JSON from the right rail if you switch browsers or machines.