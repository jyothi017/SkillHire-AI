# SkillHire AI — Interview Preparation Website

An interview preparation website designed for college placement students. Built using plain HTML, CSS, and JavaScript.

## Open in VS Code

1. Extract the project ZIP file.
2. Open VS Code and select **File → Open Folder**.
3. Choose the `SkillHire-AI` folder.
4. Install the **Live Server** extension if VS Code suggests it.
5. Right-click `index.html` and select **Open with Live Server**.

Alternatively, double-click `index.html` to open the website directly in your browser.

## Project Structure

- `index.html` — Page structure with six sections, one visible at a time.
- `style.css` — Website styling, layout, and light/dark themes.
- `script.js` — Built-in question bank, role and skill lists, question generation, skill coverage, duplicate detection, evaluation rubrics, and review features.
- `.vscode/` — VS Code settings and Live Server recommendations.
- `extras/skillhire-ai-single-file.html` — Standalone version of the website.
- `extras/prompt-engineering-study-site.html` — An earlier dashboard-style version of the prompt-engineering study website.
- `extras/project-brief.txt` — Original project brief.

## Website Pages

1. Dashboard
2. Practice Interview
3. Generate Questions
4. Skill Coverage
5. Evaluation Rubrics
6. Review

## Add Your Own Questions

Open `script.js` and search for `const BANK`.

Add questions using this format:

```javascript
['Question text', 'B', 'T', 'key point one;key point two']
```

### Difficulty levels

- `B` — Basic
- `I` — Intermediate
- `A` — Advanced

### Question types

- `T` — Technical
- `S` — Scenario
- `C` — Coding
- `D` — System Design
- `P` — Project
- `H` — Behavioral

## AI and Limitations

- The website does not currently use a live AI model. Questions are generated from the built-in question bank and templates.
- Unknown skills may receive template-based questions marked for human review.
- Questions and evaluation rubrics should be reviewed by a person before use.
- This website should not be used as the sole basis for hiring decisions.

## Browser and Offline Support

The website can run locally without installing a backend server, database, or API.

The font is loaded from Google Fonts. When offline, a system font is used instead.

