# Tecmo ROM Workshop

A GitHub Pages-ready browser editor for the original 28-team NES Tecmo Super Bowl ROM, with roster imports, player ratings, team names, uniforms, playbooks, AI tendencies, gameplay patches, and exportable ROM change logs.

Suggested GitHub repo description:

```text
Browser-based Tecmo Super Bowl NES ROM editor for rosters, ratings, teams, colors, playbooks, AI tendencies, gameplay patches, and Madden roster imports.
```

## GitHub Pages Deployment

1. Upload the contents of this folder to the root of a GitHub repository.
2. Open the repository's **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the branch containing these files and the `/ (root)` folder.
5. Open the GitHub Pages URL after deployment completes.

No build command, package installation, or server is required.

## Local Preview

The application must be served over HTTP so the browser can load the bundled Madden ratings CSV.

Using Python:

```powershell
python -m http.server 8080 --directory github-pages
```

Then open `http://localhost:8080/`.

## Published Structure

```text
index.html
.nojekyll
assets/
  css/
    tecmo-editor.css
  data/
    data.csv
  js/
    tecmo-editor.js
    tsb-hacks.js
reference/
  rom-layout.md
```

## Important Notes

- Visitors must open their own legally obtained Tecmo Super Bowl ROM.
- The application edits an in-memory copy and exports a new timestamped `.nes` file.
- `assets/data/data.csv` provides Madden roster imports on static hosting.
- The bundled CSV includes Madden jersey numbers for most players, and the editor applies them to Tecmo roster records.
- Live EA detail requests require the optional development proxy and are not used on GitHub Pages.
- Do not add or distribute copyrighted ROM files with the site.

## Updating Madden Ratings

Replace `assets/data/data.csv` with a newer compatible CSV:

```powershell
Invoke-WebRequest https://madden-ratings-data.vercel.app/data.csv -OutFile github-pages/assets/data/data.csv
```

To rebuild jersey numbers from EA detail pages in the development workspace, run:

```powershell
node work/enrich_madden_jersey_numbers.js
```

## References

- [TecmoBowl.org NES TSB SET commands](https://tecmobowl.org/forums/topic/69338-set-commands-list-for-nes-tsb-updated-91725/)
- [BAD-AL/tsbtools](https://github.com/BAD-AL/tsbtools)
