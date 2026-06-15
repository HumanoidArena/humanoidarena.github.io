# Design

- Status: Draft — last refreshed 2026-06-15
- Product: GitHub Pages project homepage for HumanoidArena

## Structure

```
index.html               # Single-page homepage
css/
  base.css               # Tokens, reset, typography
  layout.css             # Grid systems, responsive
  components.css         # Cards, buttons, media
assets/
  images/paper-main-figure.svg
  media/
    task_gallery/sonic/  # Task demonstration videos (SONIC)
    pipeline/            # Multi-camera recording (left wrist, ego, right wrist)
.github/workflows/static.yml
```

## Brand
- Personality: technical, research-forward, grounded, legible
- Trust signals: clear benchmark framing, real repo structure, concrete task media, direct links to paper/code/data
- Avoid: generic startup look, excessive ornament, vague claims without benchmark evidence

## Product goals
- Goals:
  - Explain what `HumanoidArena` is within one screen.
  - Show benchmark tasks and embodied interaction diversity quickly.
  - Clarify the full pipeline from teleoperation to evaluation.
  - Reserve prominent space for paper, dataset, benchmark results, and code links.
- Non-goals:
  - Full documentation replacement
  - Interactive 3D or heavy client-side app behavior
- Success signals:
  - A visitor can identify benchmark scope, task types, and repo entry points in under 2 minutes.
  - The page is publishable on GitHub Pages without a build step.

## Personas and jobs
- Primary personas:
  - Robotics researchers evaluating benchmark relevance
  - Prospective users trying to reproduce training/evaluation
  - Reviewers or readers seeking quick project orientation
- User jobs:
  - Understand benchmark novelty
  - Inspect representative tasks
  - Find paper/code/dataset/demo quickly
  - Understand how teleop, simulation, training, and evaluation connect
- Key contexts of use:
  - Desktop browsing from paper or social links
  - Fast scan before reading repo docs in depth

## Information architecture
- Primary navigation: Overview, Tasks, Framework, Evaluation, Pipeline, Resources
- Core routes/screens:
  - Single-page project homepage
- Content hierarchy:
  - Benchmark claim
  - Visual task evidence
  - Framework explanation
  - Evaluation protocol
  - Repository entry points
  - Resources and citation

## Design principles
- Principle 1: Put benchmark identity before implementation detail.
- Principle 2: Use task media as proof, not decoration.
- Principle 3: Keep the page static and publication-friendly.
- Tradeoffs:
  - Prioritize clarity and research credibility over flashy interactions.
  - Ship placeholders for unavailable paper/result assets rather than inventing claims.

## Visual language
- Color: warm off-white base, slate/ink text, muted blue with orange accents
- Typography: serif display for section headlines, sans-serif body for dense technical text
- Spacing/layout rhythm: large hero, compact research cards, consistent section gutters
- Shape/radius/elevation: medium radius cards, subtle borders, light shadows
- Motion: only lightweight hover and scroll-linked emphasis
- Imagery/iconography: large task media, framework figures, minimal icon usage

## Components
- Existing components to reuse: repository images and clips only; no UI component library exists
- New/changed components:
  - Hero with headline and quick links
  - Task showcase cards
  - Framework/evaluation split panels
  - Pipeline cards
  - Placeholder result/resource cards
- Variants and states:
  - Link pills
  - Available vs coming-soon resource states
  - Video card vs image card
- Token/component ownership: page-local CSS variables in `docs/styles.css`

## Accessibility
- Target standard: practical WCAG AA-minded baseline
- Keyboard/focus behavior: visible focus styles for all links and controls
- Contrast/readability: dark text on light background, avoid low-contrast overlays
- Screen-reader semantics: landmark sections, alt text, descriptive link labels
- Reduced motion and sensory considerations: no autoplay with audio; subtle motion only

## Responsive behavior
- Supported breakpoints/devices: mobile, tablet, desktop
- Layout adaptations:
  - Hero collapses to one column on narrow screens
  - Task/media grid reduces from 2 columns to 1
  - Pipeline becomes stacked cards on mobile
- Touch/hover differences: hover polish is optional; cards remain readable without hover

## Interaction states
- Loading: browser-native media loading; no custom loader
- Empty: placeholder cards for missing paper/results/dataset content
- Error: graceful fallback to poster-like figure/image blocks if videos fail
- Success: clear external-link actions in hero/resources
- Disabled: unavailable resources marked `Coming soon`
- Offline/slow network, if applicable: GIF and PNG remain functional without JS

## Content voice
- Tone: concise, technical, research-lab style
- Terminology: use benchmark, egocentric, HOI/HSI, GMT, teleoperation, perturbation-conditioned evaluation consistently
- Microcopy rules: prefer short claim lines, concrete nouns, no hype adjectives

## Implementation constraints
- Framework/styling system: plain HTML/CSS/JS only
- Design-token constraints: CSS custom properties scoped in one stylesheet
- Performance constraints: keep page light enough for GitHub Pages static hosting
- Compatibility constraints: static relative paths only, no build tooling required
- Test/screenshot expectations: local browser preview via static server before publish

## Open questions
- [ ] Public paper URL to replace placeholder link
- [ ] Public dataset URL to replace placeholder link
- [ ] Official author/affiliation block and citation text
- [ ] Benchmark result plots/tables for the evaluation section
