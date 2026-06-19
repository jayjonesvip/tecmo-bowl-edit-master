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

The application must be served over HTTP so the browser can load the bundled external player-data CSV.

Using Python:

```powershell
python -m http.server 8080 --directory .
```

Then open `http://localhost:8080/`.

## Main Workflow

1. Open a legally obtained supported 28-team NES football `.nes` ROM.
2. Use **Players > Roster Management** to either update rosters from external player data or run an automatic re-draft.
3. Review the staged roster changes in the player table and red/green diff.
4. Click **Finalize Roster** to rebuild the compact roster records.
5. Export the edited ROM.

Roster management actions intentionally stage changes first. This makes the dirty byte preview visible before the roster block is rebuilt.

The ROM remains a 28-team game. In **Teams**, the displayed city, nickname, and abbreviation can be renamed independently from the **External Roster Source** used by roster updates. This lets one original team slot represent a different modern roster without guessing from text changes; for example, a renamed slot only imports Jacksonville players after its External Roster Source is explicitly changed to `Jacksonville Jaguars`.

## Published Structure

```text
index.html
.nojekyll
assets/
  css/
    rom-editor.css
  data/
    data.csv
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
- `assets/data/data.csv` provides external player-data imports on static hosting.
- The bundled CSV includes jersey numbers for most players; missing numbers are filled from available team/position ranges during roster updates.
- Team-name edits do not redirect roster imports by themselves. Use **External Roster Source** on the Teams tab to choose which modern roster feeds each 28-team slot; each source can be assigned once.
- **Re-Draft** uses the loaded ROM's current roster pool and attributes, then stages the shuffled rosters for review.
- Live EA detail requests require the optional development proxy and are not used on GitHub Pages.
- Do not add or distribute copyrighted ROM files with the site.

## Updating External Player Data

Replace `assets/data/data.csv` with a newer compatible CSV:

```powershell
Invoke-WebRequest <compatible-player-data-csv-url> -OutFile assets/data/data.csv
```

The CSV should include columns for player name, team, position, overall rating, speed, strength, agility, awareness, and jersey number.

## References

- [Community NES football SET command reference](https://tecmobowl.org/forums/topic/69338-set-commands-list-for-nes-tsb-updated-91725/)
- [BAD-AL/tsbtools](https://github.com/BAD-AL/tsbtools)
