# Assets

Everything under `assets/` is tracked in git, referenced from the page's markup or content
tables, and published with the page — there are no unused files. `docs/page.md` says which
section uses what.

## Inventory

```
assets/
├── images/
│   ├── paper-main-figure.svg                        # Hero — overview figure
│   └── orgs/                                        # Leaderboard institution marks (credits below)
│       ├── stanford.svg
│       ├── columbia.svg
│       ├── boston-dynamics.svg
│       └── physical-intelligence.png
└── media/
    ├── task_gallery/
    │   ├── sonic/                                   # Tasks — SONIC rollout per task (7)
    │   │   ├── football.mp4
    │   │   ├── doubledesk.mp4
    │   │   ├── move-pickplace-box.mp4
    │   │   ├── open-door.mp4
    │   │   ├── sitsofa-navi.mp4
    │   │   ├── move-boxing.mp4
    │   │   └── visionnavi.mp4
    │   └── twist2/                                  # Tasks — TWIST2 rollout per task (7)
    │       ├── move-boxing.mp4
    │       ├── move-football.mp4
    │       ├── move-pickplace-box.mp4
    │       ├── move-pickplace-desk.mp4
    │       ├── move-sitsofa.mp4
    │       ├── move-visnavi.mp4
    │       └── open-door.mp4
    ├── pipeline/                                    # Pipeline stage footage (5)
    │   ├── teleop-first-person.mp4                  #   capture & retargeting — ego view
    │   ├── teleop-third-person.mp4                  #   capture & retargeting — third person
    │   ├── move-sit-sofa-front_rgb.mp4              #   recording — ego camera
    │   ├── move-sit-sofa-left_wrist_rgb.mp4         #   recording — left wrist (rotated 90° CCW)
    │   └── move-sit-sofa-right_wrist_rgb.mp4        #   recording — right wrist (rotated 90° CCW)
    ├── ppbox/                                       # Evaluation — P&PBox adaptive examples (5)
    │   ├── ppbox-origin.mp4                         #   base episode, reused across the comparison slots
    │   ├── ppbox-execution-example.mp4              #   execution test (pose randomization)
    │   ├── ppbox-semantic-example.mp4               #   semantic test (asset replacement)
    │   ├── ppbox-vision-example-1.mp4               #   visual test (lighting randomization), variant 1
    │   └── ppbox-vision-example-2.mp4               #   visual test (lighting randomization), variant 2
    └── results/                                     # Results — success/failure pairs (6)
        ├── football_sonic_success.mp4               #   Football: success vs recoverable fall
        ├── football_sonic_fall.mp4
        ├── opendoor_sonic_success.mp4               #   OpenDoor: success vs timeout
        ├── opendoor_sonic_timeout.mp4
        ├── ppbox_sonic_success.mp4                  #   P&PBox: success vs timeout
        └── ppbox_sonic_timeout.mp4
```

Total: 30 MP4 clips, 1 figure SVG, 4 institution marks.

## Video conventions

- H.264 MP4, first frame removed, `muted loop playsinline controls preload="none"`. The attribute
  set is written once, in `mediaCard()` in `js/dom.js`; the absence of `autoplay` is deliberate,
  because a clip is fetched only as it nears the viewport. See [page.md](page.md).
- **Encode for the size it is displayed at.** Clips render a few hundred pixels wide, so 960×540
  H.264 at CRF 23 is ample; `teleop-third-person.mp4` is encoded that way. The task-gallery clips
  are still 1920×1080 and are the heaviest files here, so they set the per-file budget in
  `tests/baseline.json`.
- **A clip whose box is sized from the file states that size in CSS.** `preload="none"` means no
  intrinsic dimensions until load, so the recording row — which shows each clip whole at its own
  ratio — declares that ratio in `css/components.css`. Otherwise the box collapses to the default
  replaced-element size and jumps when the metadata arrives.
- Every clip plays at the rate it was captured at — the results and task-gallery clips at 30 fps,
  the recording row at about 13.6 fps. The Results footnote says so on the page, because the
  benchmark itself runs inference on the native stream.
- The task gallery pairs one SONIC and one TWIST2 rollout per task; keep filenames aligned
  across the two directories when adding a task.
- `ppbox-origin.mp4` is the shared base episode for all four perturbation examples.
- Adding a clip means dropping the file in the matching directory and adding it to the section's
  `clips` in `js/content.js` — the clips are data, not markup.

## Institution marks

Used by leaderboard rows, in `LB_MODELS` in `js/leaderboard.js`. Each mark is the first author's
institution of the cited baseline paper, and its name appears in the mark's hover tooltip.

| File | Institution | Source | Notes |
| --- | --- | --- | --- |
| `stanford.svg` | Stanford University (ACT) | Wikimedia Commons, *Stanford plain block "S" logo.svg* | Public domain |
| `columbia.svg` | Columbia University (DP) | Wikimedia Commons, *Columbia College of Columbia University Crown 2020.svg* | CC BY-SA 4.0; cropped to the crown's bounds |
| `boston-dynamics.svg` | Boston Dynamics (FM) | [bostondynamics.com](https://bostondynamics.com/wp-content/uploads/2023/03/Logo-v2.svg) | Trademark; the square mark from the official wordmark file |
| `physical-intelligence.png` | Physical Intelligence (π0.5) | [physicalintelligence.company](https://www.physicalintelligence.company/) | Trademark |

Every mark renders inside one square tile (28 px in the table, 22 px in the chart), so the
column stays uniform despite different aspect ratios. Files are cropped to their mark's content
bounds for that reason — the Boston Dynamics wordmark file, for instance, is a square canvas
holding a 4.3:1 wordmark.

The leaderboard itself has no other media: its numbers live in the `LB_MODELS` / `LB_ENTRIES`
arrays, documented in [leaderboard.md](leaderboard.md). The four marks are provisional — they
follow each cited paper's first author and are awaiting confirmation.