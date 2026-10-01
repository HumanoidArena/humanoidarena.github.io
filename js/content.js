/**
 * The page content, and the renderers that turn it into markup.
 *
 * Any collection whose blocks repeat the same structure is a table here rather than
 * copied markup, so adding a task or a resource card is one entry and the table of
 * contents follows. Prose that appears exactly once stays in `index.html`, where it
 * reads as the HTML it is.
 *
 * Plain-text fields are escaped on render. Fields carrying intentional markup — the
 * example `caption` and the contact card's `desc` — are noted below and written as HTML.
 */

import { cls, esc, mediaCard, mediaPair } from "./dom.js";

// ── Tasks ────────────────────────────────────────────────────────────────────
// Each row's clips and its table-of-contents sub-item come from the same entry, and `key`
// is what the leaderboard's rows are keyed by.

const TASKS = [
  {
    id: "task-football",
    key: "football",
    tag: "HOI",
    title: "Football",
    blurb: "Leg-object interaction with ball approach, kick timing, and balance-aware whole-body control.",
    clips: [
      { label: "TWIST2", src: "./assets/media/task_gallery/twist2/move-football.mp4" },
      { label: "SONIC", src: "./assets/media/task_gallery/sonic/football.mp4" },
    ],
  },
  {
    id: "task-doubledesk",
    key: "doubledesk",
    tag: "HOI",
    title: "DoubleDesk",
    blurb: "Cross-surface object transfer with stepping, reach planning, and whole-body reorientation.",
    clips: [
      { label: "TWIST2", src: "./assets/media/task_gallery/twist2/move-pickplace-desk.mp4" },
      { label: "SONIC", src: "./assets/media/task_gallery/sonic/doubledesk.mp4" },
    ],
  },
  {
    id: "task-ppbox",
    key: "ppbox",
    tag: "HOI",
    title: "P&PBox",
    blurb: "Leg-assisted high placement requiring crouch, posture change, and shelf-height interaction.",
    clips: [
      { label: "TWIST2", src: "./assets/media/task_gallery/twist2/move-pickplace-box.mp4" },
      { label: "SONIC", src: "./assets/media/task_gallery/sonic/move-pickplace-box.mp4" },
    ],
  },
  {
    id: "task-opendoor",
    key: "opendoor",
    tag: "HSI",
    title: "OpenDoor",
    blurb: "Handle manipulation, body turning, and doorway traversal under egocentric perception.",
    clips: [
      { label: "TWIST2", src: "./assets/media/task_gallery/twist2/open-door.mp4" },
      { label: "SONIC", src: "./assets/media/task_gallery/sonic/open-door.mp4" },
    ],
  },
  {
    id: "task-sitsofa",
    key: "sitsofa",
    tag: "HSI",
    title: "SitSofa",
    blurb: "Obstacle-aware navigation and stable sitting transition with lower-body alignment constraints.",
    clips: [
      { label: "TWIST2", src: "./assets/media/task_gallery/twist2/move-sitsofa.mp4" },
      { label: "SONIC", src: "./assets/media/task_gallery/sonic/sitsofa-navi.mp4" },
    ],
  },
  {
    id: "task-boxing",
    key: "boxing",
    tag: "HSI",
    title: "Boxing",
    blurb: "Height-adaptive striking that requires crouch control and coordinated whole-body adjustment.",
    clips: [
      { label: "TWIST2", src: "./assets/media/task_gallery/twist2/move-boxing.mp4" },
      { label: "SONIC", src: "./assets/media/task_gallery/sonic/move-boxing.mp4" },
    ],
  },
  {
    id: "task-visnavi",
    key: "visnavi",
    tag: "HSI",
    title: "VisNavi",
    blurb: "Obstacle-aware visual navigation in constrained scenes using an egocentric camera stream.",
    clips: [
      { label: "TWIST2", src: "./assets/media/task_gallery/twist2/move-visnavi.mp4" },
      { label: "SONIC", src: "./assets/media/task_gallery/sonic/visionnavi.mp4" },
    ],
  },
];

// ── Pipeline ─────────────────────────────────────────────────────────────────
// The step cards beside the pipeline prose, and the clips inside the stage cards.

const PIPELINE_STEPS = [
  { number: "01", title: "Capture", blurb: "PICO egocentric stream and human motion capture feed the shared teleop loop." },
  { number: "02", title: "Retarget", blurb: "GMR produces a robot-space reference signal with shared policy-facing semantics." },
  { number: "03", title: "Execute", blurb: "TWIST2 or SONIC interprets and tracks the action through its own backend logic." },
  { number: "04", title: "Record", blurb: "Isaac Lab stores NPZ episodes with synchronized observations, state, action, and video." },
  { number: "05", title: "Convert", blurb: "Conversion tools normalize recordings into LeRobot-compatible datasets." },
  {
    number: "06",
    title: "Benchmark",
    blurb: "Policies are trained and stress-tested across perturbation and GMT-conditioned evaluation.",
  },
];

const PIPELINE_CLIPS = {
  teleop: [
    { label: "Third-person", src: "./assets/media/pipeline/teleop-third-person.mp4" },
    { label: "Sim ego view", src: "./assets/media/pipeline/teleop-first-person.mp4" },
  ],
  recording: [
    { label: "Left wrist", src: "./assets/media/pipeline/move-sit-sofa-left_wrist_rgb.mp4" },
    { label: "Main ego", src: "./assets/media/pipeline/move-sit-sofa-front_rgb.mp4" },
    { label: "Right wrist", src: "./assets/media/pipeline/move-sit-sofa-right_wrist_rgb.mp4" },
  ],
};

// ── Evaluation protocol ──────────────────────────────────────────────────────

const PROTOCOLS = [
  {
    id: "eval-base",
    title: "Base",
    blurb: "Reference evaluation without additional perturbation, used as the default task performance baseline.",
  },
  {
    id: "eval-semantic",
    title: "Semantic",
    blurb: "Measures sensitivity to higher-level task or environment semantic variation.",
  },
  {
    id: "eval-vision",
    title: "Vision",
    blurb: "Targets robustness to visual observation shift and perception-side difficulty.",
  },
  {
    id: "eval-execution",
    title: "Execution",
    blurb: "Focuses on control-side degradation and policy-to-tracker execution mismatch.",
  },
  {
    id: "eval-crossgmt",
    title: "Cross-GMT deployment",
    wide: true,
    blurb:
      "Trains with one general motion tracker and evaluates with the other, measuring whether the intermediate " +
      "whole-body action transfers. Reported in the paper.",
  },
];

// The P&PBox example: each card pairs the base setting with one perturbed axis.
// `caption` is authored HTML — the varied term is wrapped in <strong>.
const EXAMPLES = [
  {
    title: "Execution Adaptive",
    clips: [
      { label: "Base", src: "./assets/media/ppbox/ppbox-origin.mp4" },
      { label: "Execution", src: "./assets/media/ppbox/ppbox-execution-example.mp4" },
    ],
    caption:
      "Compared with the base setting: The <strong>shelf</strong> placement range along the x-axis is " +
      "expanded, introducing larger spatial variations.",
  },
  {
    title: "Semantic Adaptive",
    clips: [
      { label: "Base", src: "./assets/media/ppbox/ppbox-origin.mp4" },
      { label: "Semantic", src: "./assets/media/ppbox/ppbox-semantic-example.mp4" },
    ],
    caption:
      "Compared with the base setting: A visually similar distractor object is added beside the target box, " +
      "evaluating target understanding beyond appearance matching.",
  },
  {
    title: "Vision Adaptive",
    clips: [
      { label: "Base", src: "./assets/media/ppbox/ppbox-origin.mp4" },
      { label: "Vision case 1", src: "./assets/media/ppbox/ppbox-vision-example-1.mp4" },
      { label: "Vision case 2", src: "./assets/media/ppbox/ppbox-vision-example-2.mp4" },
    ],
    caption:
      "Compared with the base setting: The <strong>lighting direction</strong> is randomly changed while " +
      "keeping the task layout unchanged, evaluating robustness to visual appearance variations.",
  },
];

// ── Results ──────────────────────────────────────────────────────────────────

const SCENARIOS = [
  {
    id: "results-ppbox",
    tag: "Scenario 1",
    title: "P&PBox inference",
    blurb: "Show one successful rollout and one failure case to compare posture control, shelf approach, and task completion.",
    clips: [
      { label: "Success", src: "./assets/media/results/ppbox_sonic_success.mp4" },
      { label: "Timeout", src: "./assets/media/results/ppbox_sonic_timeout.mp4" },
    ],
  },
  {
    id: "results-football",
    tag: "Scenario 2",
    title: "Football inference",
    blurb: "Contrast a successful kick sequence with a failure sequence to surface contact timing and execution sensitivity.",
    clips: [
      { label: "Success", src: "./assets/media/results/football_sonic_success.mp4" },
      { label: "Failure", src: "./assets/media/results/football_sonic_fall.mp4" },
    ],
  },
  {
    id: "results-opendoor",
    tag: "Scenario 3",
    title: "OpenDoor inference",
    blurb:
      "Compare successful door traversal against a failed or incomplete attempt that breaks at handle use or " +
      "body alignment.",
    clips: [
      { label: "Success", src: "./assets/media/results/opendoor_sonic_success.mp4" },
      { label: "Timeout", src: "./assets/media/results/opendoor_sonic_timeout.mp4" },
    ],
  },
];

// ── Resources ────────────────────────────────────────────────────────────────

const BIBTEX_LINES = [
  "@article{wang2026humanoidarena,",
  "  title={HumanoidArena: Benchmarking Egocentric Hierarchical Whole-body Learning},",
  "  author={Wang, Taowen and Xie, Zikang and Yang, Bin and others},",
  "  journal={arXiv preprint arXiv:2606.17833},",
  "  year={2026}",
  "}",
];

const RESOURCES = [
  {
    title: "Paper",
    desc: "arXiv preprint, 2026.",
    links: [{ label: "arXiv", href: "https://arxiv.org/abs/2606.17833" }],
  },
  {
    title: "Code",
    desc: "Codebase, training pipeline, and evaluation scripts.",
    links: [{ label: "GitHub", href: "https://github.com/William-wAng618/HumanoidArena/tree/release/open-source-prep" }],
  },
  {
    title: "Dataset",
    desc: "LeRobot-compatible egocentric demonstration dataset.",
    links: [
      { label: "HuggingFace", href: "https://huggingface.co/datasets/WilliamWang16/HumanoidArena_dataset_v3_1" },
      { label: "ModelScope", href: "https://www.modelscope.cn/datasets/Twang2026/HumanoidArenaV3.1", ghost: true },
    ],
  },
  {
    title: "Models",
    desc: "Released policy checkpoints for HumanoidArena evaluation.",
    links: [
      { label: "HuggingFace", href: "https://huggingface.co/WilliamWang16/HumanoidArena_models" },
      { label: "ModelScope", href: "https://www.modelscope.cn/models/Twang2026/HumanoidArena_models", ghost: true },
    ],
  },
  {
    title: "Assets",
    desc: "Simulation assets required by the Isaac Lab environments.",
    links: [{ label: "Google Drive", href: "https://drive.google.com/file/d/1TCa_aVRmFrZs_l4wlxkqanNebvDtChNk/view?usp=sharing" }],
  },
  {
    title: "Raw Data",
    desc: "Complete raw demonstration data for all tasks.",
    links: [
      { label: "Complete", href: "https://www.modelscope.cn/datasets/Twang2026/HumanoidArena_raw" },
      { label: "P&PBox", href: "https://www.modelscope.cn/datasets/Twang2026/test_raw_HOI_pp_box", ghost: true },
    ],
  },
  { kind: "bibtex", title: "BibTeX" },
  {
    kind: "contact",
    id: "contact",
    title: "Contact",
    // Authored HTML: the two WeChat handles wear a code style.
    desc:
      'Add either WeChat account (<span class="contact-id">xiezhikang2003</span> and ' +
      '<span class="contact-id">Chanw15</span>) to join the community group.',
  },
];

/** The seven task display names, keyed as the leaderboard's rows are. */
export const TASK_NAMES = Object.fromEntries(TASKS.map((task) => [task.key, task.title]));

// ── Table of contents ────────────────────────────────────────────────────────
// Derived from the collections above where it mirrors them.

const TOC = [
  { href: "#paper", label: "Abstract" },
  {
    href: "#tasks",
    label: "Task Gallery",
    children: TASKS.map((task) => ({ href: `#${task.id}`, label: task.title })),
  },
  {
    href: "#pipeline",
    label: "Pipeline",
    children: [
      { href: "#pipeline-capture", label: "Capture & retargeting" },
      { href: "#pipeline-action", label: "Action interpretation" },
      { href: "#pipeline-recording", label: "Recording" },
      { href: "#pipeline-training", label: "Training & eval" },
    ],
  },
  {
    href: "#evaluation",
    label: "Evaluation",
    children: [
      { href: "#eval-protocol", label: "Protocol" },
      { href: "#eval-example", label: "Example: P&PBox" },
    ],
  },
  {
    href: "#results",
    label: "Results",
    children: SCENARIOS.map((scenario) => ({ href: `#${scenario.id}`, label: scenario.title })),
  },
  { href: "#leaderboard", label: "Leaderboard" },
  {
    href: "#resources",
    label: "Resources",
    children: [
      { href: "#resources", label: "Links" },
      { href: "#contact", label: "Contact" },
    ],
  },
];

// ── Renderers ────────────────────────────────────────────────────────────────

/**
 * A row of copy beside a pair of clips. A task row and a result scenario are the same shape,
 * differing only in the class names their styles hang off.
 */
const ROW_CLASSES = {
  task: { row: "task-row", copy: "task-row-copy" },
  scenario: { row: "scenario-row", copy: "scenario-copy" },
};

function clipRow(kind, entry) {
  const classes = ROW_CLASSES[kind];
  return `<article class="${classes.row}" id="${esc(entry.id)}">
        <div class="${classes.copy}">
          <p class="task-tag">${esc(entry.tag)}</p>
          <h3>${esc(entry.title)}</h3>
          <p>${esc(entry.blurb)}</p>
        </div>
        ${mediaPair(entry.clips)}
      </article>`;
}

function pipelineStepCard(step) {
  return `<article class="pipeline-step-card">
        <span>${esc(step.number)}</span>
        <h3>${esc(step.title)}</h3>
        <p>${esc(step.blurb)}</p>
      </article>`;
}

function protocolCard(protocol) {
  return `<article class="${cls("protocol-card", protocol.wide && "protocol-card-wide")}" id="${esc(protocol.id)}">
        <h3>${esc(protocol.title)}</h3>
        <p>${esc(protocol.blurb)}</p>
      </article>`;
}

function exampleCard(example) {
  // Three clips are the triple (base plus two cases); two are the plain pair.
  const pair = cls("example-video-pair", example.clips.length > 2 && "example-video-pair--triple");
  return `<article class="example-card example-card-wide">
        <h3>${esc(example.title)}</h3>
        <div class="${pair}">${example.clips.map(mediaCard).join("")}</div>
        <p class="example-caption">${example.caption}</p>
      </article>`;
}

function linkCard(resource) {
  const id = resource.id ? ` id="${esc(resource.id)}"` : "";
  const actions = `<div class="resource-card-actions">${resource.links
    .map(
      (link) =>
        `<a href="${esc(link.href)}" class="${cls("btn-pill", link.ghost && "btn-pill--ghost")}" ` +
        `target="_blank" rel="noopener noreferrer">${esc(link.label)}</a>`
    )
    .join("")}</div>`;

  return `<article class="resource-card"${id}>
        <div class="resource-card-inner">
          <div class="resource-card-copy">
            <h3>${esc(resource.title)}</h3>
            <p class="resource-card-desc">${esc(resource.desc)}</p>
          </div>
          ${actions}
        </div>
      </article>`;
}

function bibtexCard(resource) {
  const lines = BIBTEX_LINES.map((line) => `<span>${esc(line)}</span>`).join("");
  return `<article class="resource-card resource-card-wide">
        <h3>${esc(resource.title)}</h3>
        <div class="bibtex-box" aria-label="BibTeX citation">${lines}</div>
      </article>`;
}

// `desc` is authored HTML here: the two WeChat handles wear a code style.
function contactCard(resource) {
  return `<article class="resource-card resource-card-wide" id="${esc(resource.id)}">
        <div class="resource-card-inner">
          <div class="resource-card-copy">
            <h3>${esc(resource.title)}</h3>
            <p class="resource-card-desc">${resource.desc}</p>
          </div>
        </div>
      </article>`;
}

const RESOURCE_KINDS = { link: linkCard, bibtex: bibtexCard, contact: contactCard };

function resourceCard(resource) {
  return RESOURCE_KINDS[resource.kind || "link"](resource);
}

function tocItem(entry) {
  const children = entry.children || [];
  const sub = children.length
    ? `<ul class="content-toc-sub">${children
        .map(
          (child) =>
            `<li><a href="${esc(child.href)}" class="content-toc-subitem">${esc(child.label)}</a></li>`
        )
        .join("")}</ul>`
    : "";
  return `<li><a href="${esc(entry.href)}" class="content-toc-item">${esc(entry.label)}</a>${sub}</li>`;
}

/**
 * One renderer per `data-render` value used in `index.html`. The container is passed in
 * so a renderer can read its own attributes — `pipelineClips` uses `data-clips` to pick
 * which set of videos it holds.
 */
const RENDERERS = {
  tasks: () => TASKS.map((task) => clipRow("task", task)),
  pipelineSteps: () => PIPELINE_STEPS.map(pipelineStepCard),
  pipelineClips: (node) => (PIPELINE_CLIPS[node.dataset.clips] || []).map(mediaCard),
  protocols: () => PROTOCOLS.map(protocolCard),
  examples: () => EXAMPLES.map(exampleCard),
  scenarios: () => SCENARIOS.map((scenario) => clipRow("scenario", scenario)),
  resources: () => RESOURCES.map(resourceCard),
  toc: () => TOC.map(tocItem),
};

/** Fill every `[data-render]` container in the document. */
export function renderPage() {
  document.querySelectorAll("[data-render]").forEach((node) => {
    const render = RENDERERS[node.dataset.render];
    if (!render) {
      console.warn(`content.js: no renderer for data-render="${node.dataset.render}"`);
      return;
    }
    node.innerHTML = render(node).join("");
  });
}
