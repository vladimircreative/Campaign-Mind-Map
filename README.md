# Prep Map

A sheet of paper for campaign prep. Characters, places, events, the thread you planted three sessions ago and forgot. Desktop browser, wide window. Nothing leaves the machine — close the tab, open it next week, the board is still there.

Phone will just tell you to use a bigger screen. That’s on purpose.

## Get in

Double-click `index.html`. Or dump the folder on GitHub Pages / Netlify / `python3 -m http.server` if you want a URL.

Click **Prep Map** at the top of the right rail and name the campaign. Export uses that name.

After a Clear, `?demo=1` on the URL loads a sample board so you can poke at it.

---

## The table

Wheel zooms toward the cursor. Left-drag on empty paper draws a selection box. Pan with middle-mouse, right-mouse, or hold **Space** and drag.

**F** or the Fit button frames whatever is on the current page. Switching pages does that for you.

Top-right is a tiny navigator. Dots are nodes, orange box is what you’re looking at. Click or drag it when someone wandered off the edge of the map.

**Esc** drops a half-drawn link or a selection.

---

## Nodes

Double-click empty paper. That’s a node. Drag the middle to move it. Click it to open the notes sheet. Double-click it to rename.

Two sizes:

- Big disc — person, place, event, faction, note. Colour follows the type.
- Small ellipse — a beat on a line. Title only. Click a link to drop one.

New nodes shove neighbours a little so they don’t sit on top of each other. Grab several at once (drag a box) and they move as a pack.

### What the colours mean (thread)

This is “is this still in play?”, not “is this NPC dead”.

- **Live** — still in the stew.
- **Resolved** — grey, name crossed out. Use **Close thread** if you want it on the board but done.
- **Missed** — gold. The fork the table didn’t take. Leave it; you’ll thank yourself at the finale.
- **Rumor** — dashed and hatched. You heard it. You don’t know it.
- **Ghost** — empty dashed ring. A name nobody will say.

### People

Characters get a mark in front of the name. The disc colour does not change.

Heart = alive. **?** = missing. Warning = compromised. Skull = dead.

---

## Links

Grab the **ring** of A and drop it on B. Or select A and Shift-click B.

Hold **Alt** while you do that (or Alt-click a line later) for a dashed “I planted this, it hasn’t fired” link.

Click a line to drop a subnode on it. Shift-click a line to delete it. Esc cancels a link you started and thought better of.

---

## The notes sheet

Bottom left, after you click a node.

Name, type, thread, condition, who it’s tied to, tags, notes. Click a linked name to jump there. Tags: type, Enter. Stretch Notes and the sheet grows up toward the toolbar before it starts scrolling.

Hover a node for a second and you get the first line of notes under the cursor.

Delete in that sheet kills the whole selection, not just one node.

---

## Sessions

Right rail, Pages.

Each session is its own sheet. **All pages** is the whole campaign. **+** is a new session (empty, already framed). Pencil renames. Clicking the name just switches — it will not start a rename by accident.

**×** deletes that session **and everything that lived on it**. Undo if you flinch. You can’t delete the last page.

---

## Tags

Stick `#raiders` on whoever deserves it. The rail lists them.

Click a name under a tag to jump there. Click the `#RAIDERS` header to light the whole gang up and dim the rest.

---

## Steal from yourself

Box-select (or click).

- **Ctrl+C** copy
- **Ctrl+X** cut
- **Ctrl+V** paste — group lands with its center under the cursor, on the page you’re looking at. Point at Session 2, paste, they’ve moved house.

Links between the copied nodes come along. Links out to the rest of the board do not.

---

## Don’t lose the campaign

Every click saves in this browser. That’s it. No account.

**Export** downloads a JSON named after the map. Put it next to the campaign doc. **Import** replaces whatever is open (old files still load). **Clear** wipes the board; Undo will not bring a Clear back, so Export first if it’s been a long night.

Switch computers? Export on this one, Import on that one.

---

## Keys you’ll actually use

| | |
|---|---|
| **Ctrl+Z** / **Ctrl+Y** | undo / redo |
| **Ctrl+C X V** | copy / cut / paste |
| **Delete** | selection gone |
| **F** | frame this page |
| **Esc** | stop that |
| **?** | the cheat sheet |
| **Space + drag** | pan |
| Double-click paper | new node |
| Double-click a node | rename |

If you’re typing in a field, the keys stay with the field.

Top-left buttons: Undo, Redo, Fit, ?.

---

Four files: `index.html`, `styles.css`, `app.js`, this. No install, no login, no cloud.

---

Made by [Grok](https://grok.com), built by xAI.
