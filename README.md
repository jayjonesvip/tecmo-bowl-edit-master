# NES Football ROM Editor

A GitHub Pages-ready browser editor for supported NES football ROMs, with roster management, player ratings, team names, uniforms, playbooks, AI tendencies, gameplay patches, graphics tools, and exportable ROM change logs.

Suggested GitHub repo description:

```text
Browser-based NES football ROM editor for rosters, ratings, teams, colors, playbooks, AI tendencies, gameplay patches, and graphics.
```

## GitHub Pages Deployment

1. Upload the contents of this folder to the root of a GitHub repository.
2. Open the repository's **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the branch containing these files and the `/ (root)` folder.
5. Open the GitHub Pages URL after deployment completes.

No build command, package installation, or server is required.

## Local Preview

The application can be served over HTTP for local testing.

Using Python:

```powershell
python -m http.server 8080 --directory .
```

Then open `http://localhost:8080/`.

## Main Workflow

1. Open a legally obtained supported 28-team NES football `.nes` ROM.
2. Use **Teams** to review team names, CPU run/pass preference, simulation strength, and playbooks.
3. Use **Draft Room** to run an automatic re-draft from the loaded ROM's current roster pool.
4. Review the staged roster changes in **Players** using the player table and red/green diff.
5. Click **Finalize Draft** in Draft Room, or **Apply Changes** in Players, to rebuild the compact roster records.
6. Export the edited ROM.

Roster management actions intentionally stage changes first. This makes the dirty byte preview visible before the roster block is rebuilt.

The ROM remains a 28-team game. Team AI settings influence re-draft behavior: rushing teams prioritize running backs and offensive linemen, passing teams prioritize quarterbacks and receivers, and the "little more" settings stay more balanced.

## Published Structure

```text
index.html
.nojekyll
assets/
  css/
    rom-editor.css
  js/
    rom-editor.js
    hacks.js
reference/
  rom-layout.md
```

## Important Notes

- Visitors must open their own legally obtained ROM file.
- ROM files are processed locally in the browser and are not uploaded.
- The application edits an in-memory copy and exports a new timestamped `.nes` file.
- **Re-Draft** uses the loaded ROM's current roster pool and attributes, then stages the shuffled rosters for review.
- Re-draft behavior uses the Teams tab's CPU run/pass preference as a drafting personality.
- Do not add or distribute copyrighted ROM files with the site.

## References

- [Community NES football SET command reference](https://tecmobowl.org/forums/topic/69338-set-commands-list-for-nes-tsb-updated-91725/)
- [BAD-AL/tsbtools](https://github.com/BAD-AL/tsbtools)
