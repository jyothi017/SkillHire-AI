# SkillHire AI - Interview Preparation Website

For placement students. Plain HTML, CSS and JavaScript. No install, server, database or API.

## Open in VS Code
1. Unzip this file.
2. VS Code > File > Open Folder > choose the `SkillHire-AI` folder.
3. VS Code may suggest "Live Server". Click Install.
4. Right-click `index.html` > Open with Live Server. Or double-click `index.html` to open it in your browser.

## What is inside
- `index.html`  page structure (six pages, one visible at a time)
- `style.css`   look and layout, light and dark theme (colours are tokens at the top)
- `script.js`   question bank, role skill lists, question builder, skill coverage, repeat detection, rubrics, review
- `.vscode/`    VS Code settings and the Live Server suggestion
- `extras/skillhire-ai-single-file.html`  same website in one file (just double-click)
- `extras/prompt-engineering-study-site.html`  first version: the prompt-engineering study as a dashboard site
- `extras/project-brief.txt`  your original project brief

## Pages
Dashboard, Practice Interview, Generate Questions, Skill Coverage, Evaluation Rubrics, Review.

## Add your own questions
In `script.js` search for `const BANK`. Add entries like:
`['Question text','B','T','key point one;key point two']`
Difficulty: B basic, I intermediate, A advanced.
Type: T technical, S scenario, C coding, D system design, P project, H behavioral.

## Notes
- No live AI model is used. Questions come from the built-in bank. Unknown skills get template questions marked "needs human check".
- A person must review all questions and rubrics. Do not use this as the only basis for hiring decisions.
- The font loads from Google Fonts. Offline, a system font is used and everything else still works.
