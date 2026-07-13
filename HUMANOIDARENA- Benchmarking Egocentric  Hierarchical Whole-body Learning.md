# HUMANOIDARENA: Benchmarking Egocentric Hierarchical Whole-body Learning

Taowen Wang<sup>1,*</sup>, Zikang Xie<sup>1,*</sup>, Bin Yang<sup>1,*</sup>, Yunheng Wang<sup>1</sup>, Zizhao Yuan<sup>1</sup>, Yuetong Fang<sup>1</sup>, Yixiao Feng<sup>1</sup>, Yichi Wang<sup>2</sup>, Xingyu Chen<sup>1</sup>, Haodong Chen<sup>3</sup>, Qiwei Wu<sup>1</sup>, Weisheng Xu<sup>1</sup>, Lihan Chen<sup>4</sup>, Lusong Li<sup>5</sup>, Zecui Zeng<sup>5</sup>, Renjing Xu<sup>1,†</sup> 

<sup>1</sup>The Hong Kong University of Science and Technology (Guangzhou), <sup>2</sup>Beijing University of Technology, <sup>3</sup>Harbin Institute of Technology, Shenzhen, <sup>4</sup>Shenzhen MSU-BIT University, <sup>5</sup>JD Explore Academy 

## Abstract

Humanoid robots promise whole-body interaction in human-centered environments, but scalable policy learning remains difficult because task-level decision-making and whole-body dynamic execution are tightly coupled. A practical solution is hierarchical control, where a high-level policy predicts intermediate whole-body actions and low-level general motion trackers (GMTs) execute them as stable hu manoid motion. However, existing benchmarks rarely evaluate the policy–tracker interface itself, leaving open whether intermediate whole-body actions are executable, robust under task distribution shifts, and transferable across different GMT backends. We introduce HUMANOIDARENA, a simulation-first benchmark for egocentric hierarchical whole-body learning. The benchmark formulates policy learning as a hierarchical decision making problem: a high-level policy converts egocentric vision, proprioception, and instructions into a compact whole-body action, which is subsequently executed by a low-level GMT. Instead of treating the legs as planar transport tools, HUMANOIDARENA emphasizes interactions where lower-body coordination is structurally necessary in task completion. We therefore design 7 leg-critical HOI/HSI tasks in which success requires foot placement, balance maintenance, posture adjustment, and whole-body reorientation. To further diagnose the hierarchical system, we evaluate policies from two complementary perspectives: perturbation-conditioned generalization and GMT-conditioned transfer. We benchmark representative imitation-learning and VLA-style policies under this shared interface. Experiments show that hierarchical control enables learned policies to solve diverse leg-critical interactions, but performance is strongly tracker-conditioned and cross-GMT transfer remains fragile. These results position HUMANOIDARENA as a benchmark for studying transferable intermediate action representations and scalable egocentric whole-body policy learning. Code and data are available at: https://humanoidarena.github.io. 

## 1 Introduction

“The body is our general medium for having a world.” 

— Maurice Merleau-Ponty [1] 

A central goal of embodied intelligence is to build agents that can perceive, reason, and act in the physical world through their bodies [2]. Humanoid robots are a natural embodiment for humancentered environments because their morphology aligns with spaces, objects, tools, and affordances designed around the human body. This alignment is most consequential in interaction tasks where the lower body is not merely a locomotion module that transports the hands to a workspace. Foot placement, support transitions, balance-aware posture, and whole-body reorientation can directly determine whether an object or scene interaction is feasible [3, 4, 5]. In such leg-critical interaction settings, lower-body coordination is structurally involved in task completion rather than reducible to planar base motion. Evaluating humanoid intelligence under this setting requires policies that act through an integrated body under egocentric perception, rather than treating locomotion and manipulation as separable subproblems. 

This whole-body requirement exposes a central tension at the interface between task intent and dynamic realization. A high-level policy must produce actions that preserve task-relevant intent, such as which object or scene affordance to approach and what interaction to attempt, while the execution layer must realize these intentions as stable, coordinated motion on a high-DoF legged body under contact and viewpoint changes. This division suggests different learning regimes: visual and semantic policy learning benefits from scalable imitation learning [6, 7], whereas dynamics-level execution benefits from fast reactive controllers trained with dense physical feedback [8, 9, 10]. Recent hierarchical humanoid systems [11, 12] make this division operational by letting high-level egocentric policies specify task-directed whole-body intent and low-level trackers realize that intent as dynamically feasible motion. This hierarchy provides a powerful abstraction for scalable humanoid control, decoupling visual-semantic decision making from high-frequency whole-body stabilization while retaining an executable intermediate representation for coordinated behavior. 

Despite this progress, existing benchmarks do not yet provide a controlled setting for studying hierarchical humanoid whole-body learning. First, according to interface, most systems evaluate an end-to-end control stack [13, 14] or a fixed action representation [11, 12], making it difficult to separate high-level policy learning from low-level execution behavior. Without an explicit policyfacing whole-body action space and GMT-conditioned execution layer, comparisons are easily confounded by controller design, tracker dynamics, and backend-specific failure modes. Second, for task, many embodied and humanoid benchmarks emphasize locomotion [13], manipulation [15, 16], or specific task diversity [17], but do not center leg-critical interactions where lower-body coordination is structurally required for success. Third, for evaluation, existing protocols rarely disentangle visual perception, semantic grounding, spatial execution, and tracker-induced deployment shifts within the same benchmark. As a result, task success under one controller and one distribution can obscure whether a policy has learned robust hierarchical whole-body behavior. 

To address this gap, we introduce HUMANOIDARENA, a simulation-first benchmark for egocentric hierarchical whole-body learning. For the interface, HUMANOIDARENA makes the hierarchical decomposition explicit: high-level policies predict compact intermediate whole-body actions from egocentric observations, proprioception, and task instructions, while low-level GMTs execute these actions as dynamically feasible humanoid motions. For the task design, the benchmark instantiates seven leg-critical Human-Object Interaction (HOI) / Human-Scene Interaction (HSI) tasks that require lower-limb participation as an essential part of interaction, rather than treating the legs merely as a navigation module. For evaluation, HUMANOIDARENA defines controlled perturbation-conditioned evaluation protocols across visual, semantic, and execution shifts and further supports in/cross-GMT deployment to assess both policy robustness and policy–tracker compatibility. Together, these design choices establish HUMANOIDARENA as a principled benchmark for egocentric hierarchical whole-body humanoid learning. Specifically, we make the following contributions. 

<sup>❶</sup> Hierarchical benchmark formulation. We introduce a shared hierarchical interface for egocentric humanoid whole-body learning, where high-level policies predict intermediate whole-body actions and low-level general motion trackers execute them as dynamically feasible motions. 

<sup>❷</sup> Leg-critical egocentric task suite and data pipeline. We design seven leg-critical HOI/HSI tasks in which successful execution requires lower-body participation, balance maintenance, posture adjustment, and whole-body coordination. Built in simulation, our GMT-based teleoperation pipeline collects closed-loop egocentric demonstrations while supporting scalable task and scene variation, failure-rich exploration, and synchronized first-person and third-person observations. 

<sup>❸</sup> Controlled hierarchical evaluation protocols. We introduce perturbation-conditioned evaluation protocols across visual, semantic, and execution shifts. Together with in/cross-GMT deployment, these protocols make policy robustness and policy–tracker compatibility measurable under a shared intermediate whole-body action interface. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/efb4101666277f9e2cbd86af3e68c3c593446005b8269a074b1cf9aefa30cdce.jpg)



Figure 1: Overview of HUMANOIDARENA. The benchmark studies leg-critical HOI/HSI tasks where success requires coordinated perception, foot placement, balance, and whole-body motion. Within this hierarchical formulation, high-level policies predict intermediate whole-body actions from egocentric visual observations, task instructions, and proprioception, while low-level GMTs stabilize and track them into feasible humanoid motions. To evaluate this interface, perturbation-conditioned evaluation and GMT-conditioned evaluation diagnose task generalization, tracker-induced distribution shifts, and policy–tracker compatibility.


<sup>❹</sup> Baselines and findings. We benchmark representative imitation-learning and VLA-style policies across tasks, trackers, and perturbations. Our results show that GMT-based hierarchy enables learned policies to complete diverse leg-critical interactions, while performance remains sensitive to the choice of execution backend. This sensitivity highlights cross-GMT transfer and transferable intermediate action representations as important open challenges for hierarchical whole-body learning. 

## 2 Related Work

Egocentric Humanoid Whole-Body Interaction. Recent advances in humanoid whole-body control have gradually transitioned from proprioceptive motion tracking toward perception-driven interaction. Prior arts [5, 18, 19] achieved significant milestones by reinforcement learning, and recent work has expanded into the field of underactuated object interaction [20]. To ensure perception accuracy, several approaches rely on external sensors [21, 22, 23], while egocentric perception has increasingly emerged for HOI [24, 25, 26, 27, 28, 29, 30]. In parallel, egocentric vision has also proven crucial for HSI, empowering humanoids to navigate various terrains [31, 32, 33, 34, 35, 36]. These works demonstrate impressive interaction capabilities, since they inherently couple visual perception, decision-making, and whole-body execution within one stack, making it difficult to evaluate the generalization of the learned intent across different execution backends. 

A second line of work makes the hierarchy explicit. TWIST2 [11] uses a general motion tracker as the execution layer for egocentric whole-body teleoperation and visuomotor policy learning, while SONIC [12] scales motion tracking into a general low-level controller that can interface with multiple input modalities. Other humanoid VLA and whole-body policy systems instantiate the high-level/low-level split through different intermediate abstractions: motion generation followed by tracking [37, 38], latent vision-language verbs with RL whole-body skills [14], or VLA/action experts paired with specialized lower-body or whole-body controllers [39, 40, 41]. Together, these works mark a clear shift toward hierarchical whole-body learning, where high-level models handle egocentric perception, language, and task intent, while low-level controllers maintain dynamic feasibility. However, hierarchical whole-body learning still lacks a dedicated benchmark. Existing systems vary in tasks, data, action spaces, and GMT backends, making it difficult to evaluate highlevel policies under a shared policy–tracker interface. HUMANOIDARENA fills this gap by turning egocentric hierarchical whole-body learning into a controlled benchmark. 

Humanoid Benchmarks and Platforms. Broader robot-learning benchmarks have greatly expanded task diversity and standardized evaluation. LIBERO [16] studies knowledge transfer in languageconditioned manipulation with 130 procedurally generated tasks, while BEHAVIOR-1K [15] scales household activity evaluation to 1,000 tasks in realistic simulation. However, they either rely on fixed-arm manipulation setups or abstract mobility into simplified navigation actions, leaving hierarchical whole-body control with humanoid full-body execution largely unstudied. A related line of work studies whole-body mobile manipulation beyond fixed-arm settings. BEHAVIOR Robot Suite [42] targets real-world household whole-body manipulation with a bimanual wheeled robot and a 4-DoF torso, emphasizing bimanual coordination, stable navigation, and end-effector reachability. AgentWorld [43] supports scalable scene construction and mobile manipulation data collection with both wheeled bases and humanoid locomotion policies. These platforms expand the scope of mobile manipulation, but their lower-body control is either wheeled or abstracted through locomotion/navigation interfaces, rather than evaluated through leg-critical humanoid execution under a GMT-based hierarchical interface. 

Furthermore, HumanoidBench [13] provides a high-dimensional simulated benchmark for humanoid locomotion and manipulation. LeVERB [14] introduces a sim-to-real-ready vision-language closedloop benchmark for humanoid whole-body control and a latent hierarchical policy, directly motivating the need for expressive high-level action interfaces. HumanoidVerse [17] studies egocentric language guided multi-object rearrangement across 350 tasks, while Humanoid Everyday [44] contributes a large real-world humanoid manipulation dataset with multimodal sensing and cloud-based evaluation. Although these resources substantially advance humanoid whole-body learning, they do not explicitly benchmark GMT-based hierarchical control. HUMANOIDARENA complements them by making the policy–tracker interface itself a benchmark axis, enabling systematic evaluation of high-level policies across task-relevant perception, grounding, spatial execution, and tracker-induced deployment shifts. 

## 3 HUMANOIDARENA

This section introduces HUMANOIDARENA by first outlining the research topics that motivate its design (Sec. 3.1). We then instantiate these topics through four benchmark components: a hierarchical whole-body protocol that couples high-level policies with low-level general motion trackers (Sec. 3.2), a closed-loop egocentric data collection pipeline for multi-GMT demonstrations (Sec. 3.3), leg-critical HOI/HSI task suites (Sec. 3.4), and evaluation protocols for perturbation-conditioned and GMTconditioned generalization (Sec. 3.5). 

## 3.1 Research Topics in HumanoidArena

(T1) Goal-directed hierarchical humanoid interaction. Humanoid robots are expected to accomplish goals through coordinated whole-body interaction rather than isolated locomotion or manipulation. In leg-critical HOI/HSI tasks, success may depend on foot placement, balance-aware posture adjustment, whole-body reorientation, and coordinated arm–leg motion. HUMANOIDARENA provides a hierarchical setting in which a high-level policy predicts intermediate whole-body actions from egocentric observations and task instructions, while a low-level general motion tracker executes them into dynamically feasible motion. 

(T2) Robust policy learning with egocentric perception. A key question is how robust policies remain when task execution depends on egocentric visual observations. HUMANOIDARENA enables this study through three controlled generalization dimensions, visual, semantic, and execution, which test robustness to lighting changes, similar distractors, and various object initializations. 

(T3) Cross-GMT generalization in hierarchical control. Hierarchical control raises the question of how policy outputs change when executed by different low-level general motion trackers. Through a shared intermediate whole-body action interface, HUMANOIDARENA offers a cross-GMT testbed where policies can be trained with one tracker and deployed with another, directly evaluating whether intermediate actions remain valid across different GMTs. 

(T4) Multimodal coordination under whole-body motion. Humanoid perception is tightly coupled with body motion. Unlike stationary-arm manipulation, humanoid egocentric and wrist cameras can undergo drastic viewpoint changes due to walking, arm swing, torso rotation, squatting, balance recovery, and contact-rich interaction. HUMANOIDARENA enables research on multimodal fusion and visual–proprioceptive alignment under rapidly changing egocentric viewpoints. 

## 3.2 Hierarchical Whole-Body Protocol

HUMANOIDARENA adopts a hierarchical whole-body control protocol that separates perceptionconditioned decision making from low-level dynamic execution. At time step t, a high-level policy receives an egocentric observation $I _ { t } ^ { \mathrm { e g o } }$ , proprioception $p _ { t }$ , and a task instruction ℓ. The proprioception $p _ { t }$ consists of the root orientation in 6D rotation representation, the 29D G1 joint positions, and their corresponding joint velocities. Then the high-level policy predicts a 40D intermediate whole-body action $u _ { t } \in \bar { \mathbb { R } } ^ { \bar { 4 } 0 }$ This action specifies root movement in the horizontal plane, root height, root orientation, 29D body joint targets, and binary open/close commands for both hands. This action serves as a tracker-compatible interface that specifies the intended whole-body motion to be executed. A low-level GMT then tracks this action and converts it into dynamically feasible humanoid motion. This separation allows HUMANOIDARENA to evaluate not only task success, but also the tracker robustness of intermediate whole-body actions under different GMT backends. 

High-level policy baselines. The high-level policy $\pi _ { \theta }$ is the main learning component evaluated in HUMANOIDARENA. At each policy step, it receives egocentric visual observations, task instructions, and a 64D canonical proprioceptive state, and predicts a 40D intermediate whole-body action: 

$$
u _ {t} \sim \pi_ {\theta} (\cdot | I _ {t} ^ {\mathrm{ego}}, p _ {t}, \ell), \quad p _ {t} \in \mathbb {R} ^ {6 4}, \quad u _ {t} \in \mathbb {R} ^ {4 0}.\tag{1}
$$

We benchmark $\pi _ { \theta }$ with four representative visuomotor policy families: ACT [45], Diffusion Policy [46], Flow Matching [47], and $\pi _ { 0 . 5 }$ [7], covering chunked action prediction, diffusion-based modeling, multi-step action prediction, and VLA-style instruction-conditioned policy learning. Since high-dimensional action spaces substantially increase learning complexity, we adopt a compact 40D canonical action interface instead of an SMPL-based action representation. This interface still requires policies to predict coordinated whole-body actions over the root, torso, arms, legs, and hands under egocentric perception, while keeping the action space tractable for systematic baseline evaluation. All baselines share the same observation space, action interface, and GMT backends, so performance differences primarily reflect policy design rather than changes in the execution interface. 

Low-level general motion tracker bank. The low-level layer contains a bank of GMTs that execute the canonical whole-body action predicted by the high-level policy. Since each GMT follows its own input protocol, $u _ { t }$ is first mapped by a GMT-specific adapter $\psi _ { m }$ before being passed to GMT $G ^ { ( m ) }$ 

$$
q _ {t + 1} ^ {(m)} = G ^ {(m)} (\psi_ {m} (u _ {t})),\tag{2}
$$

where $q _ { t + 1 } ^ { ( m ) }$ is the G1 joint-position target produced by the m-th GMT. The adapter $\psi _ { m }$ implements the required conversion from the canonical action space to the tracker-specific reference format. After this conversion, each GMT applies its own tracking policy to produce executable joint targets. Since trackers differ in motion priors, stabilization strategies, and failure modes, this bank enables evaluation of tracker robustness under a shared high-level interface. 

## 3.3 Data Collection Pipeline

HUMANOIDARENA collects data in Isaac Lab [48] through a VR-based egocentric teleoperation pipeline, where the operator receives the humanoid’s egocentric visual stream and controls the robot in closed loop via GMR [49, 50]. The retargeted robot reference motion is canonicalized into the policy facing action form defined in Section 3.2, and then executed by a selected GMT. Under the same teleoperation and action interface, switching the GMT backend yields multi-GMT data with shared policy-facing action semantics but different low-level tracking dynamics. In our implementation, to reduce retargeting errors caused by height variation across operators, both backends are conditioned on robot reference motions: TWIST2 [11] adopts a mimic-style tracking command, while SONIC [12], which supports multiple conditioning interfaces, is used in its robot motion encoder mode rather than its human motion encoder mode. The full data specification is provided in Appendix B. 

## 3.4 Leg-Critical Egocentric Task Suites

HUMANOIDARENA focuses on leg-critical egocentric tasks, by which we refer to HOI/HSI settings where lower-body coordination is directly involved in task completion rather than serving only as planar transport for the upper body. In contrast to mobile-base manipulation settings, these tasks require the policy to predict intermediate whole-body actions that jointly coordinate root motion, body posture, legs, arms, and hands. Detailed task design, including layouts, initialization ranges, success conditions, and the lower-body requirements of each task, is provided in Appendix A. 

The HOI tasks test how legged motion changes object interaction. HOI-DOUBLEDESK couples crosssurface object transfer with terrain-aware stepping across a height discontinuity. HOI-FOOTBALL evaluates coordinated leg-object interaction, where success depends on visual localization, balance, and kicking motion. HOI-P&PBOX tests leg-assisted high placement, requiring the robot to bend its legs and adjust whole-body posture to reach the target shelf height. 

The HSI tasks test how to interact with scenes. HSI-VISNAVI evaluates obstacle-aware egocentric navigation in constrained space. HSI-OPENDOOR couples handle manipulation with body turning and doorway traversal. HSI-SITSOFA requires obstacle avoidance, body alignment, and a stable sitting transition. HSI-BOXING evaluates height-adaptive striking, where low targets require crouching and whole-body adjustment. Together, these HOI and HSI tasks probe complementary forms of leg-critical interaction, from terrain-aware object transfer to posture-dependent scene interaction. 

## 3.5 Evaluation Protocols

Perturbation-conditioned evaluation. HUMANOIDARENA defines three perturbation axes for diagnosing policy generalization: visual, semantic, and execution. These axes are designed to isolate failures in scene perception, target grounding, and whole-body execution, respectively. Visual generalization changes the lighting direction while preserving the goal and object identity, testing robustness to egocentric appearance shifts. Semantic generalization introduces semantically similar distractors under the same instruction, testing whether the policy grounds the commanded target. Execution generalization expands the initialization range of task-relevant objects, requiring policies to adapt foot placement, body pose, and whole-body motion to new spatial conditions. Full perturbation configurations and rollout seeds are detailed in Appendix D. 

GMT-conditioned evaluation. Enabled by the shared whole-body action interface defined in Section 3.2, HUMANOIDARENA introduces GMT-conditioned protocols for evaluating policy–tracker compatibility. This design allows the same policy-facing action space to be executed by different low-level GMT backends, making cross-GMT transfer a measurable property rather than an implementation detail. In the in-GMT protocol, training and inference use the same GMT, measuring performance under matched tracking dynamics. In the cross-GMT protocol, policies are trained with one GMT and deployed with another, testing whether the learned intermediate actions encode tracker-transferable whole-body intent or overfit to the motion priors, behavior, and failure modes of a single GMT. Together, these protocols assess cross-GMT transfer of intermediate whole-body actions and reveal compatibility failures that are hidden under standard matched-backend evaluation. 

## 4 Experiments

In this section, we conduct experiments as an initial study of the proposed benchmark setting and hierarchical control formulation. We first introduce the evaluation protocols and then analyse empirical results across tasks, trackers, and generalization settings. Our experiments focus on the following research questions: 

Q1: How well do existing imitation-learning and VLA-style policy baselines perform on legcritical egocentric HOI/HSI tasks? 

Q2: How robust are different policy models under visual, semantic, and execution perturbations? 

Q3: How do high-level policies trained on demonstrations collected with a single GMT perform when deployed with different GMT backends? 

## 4.1 Experimental Setup

Evaluation matrix. We evaluate policies across task categories, GMT backends, policy architectures, and perturbations. The task suite contains leg-critical HOI and HSI tasks introduced in Section 3.4; 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/226bcab48b2b25476d3a64b27b1f1bf24099d344fcad0bb49b0ffd70075f3fe0.jpg)



Figure 2: Qualitative rollouts. We visualize four representative successful episodes generated by Diffusion Policy with SONIC as the low-level GMT. The examples cover both HOI and HSI tasks, showing that the high-level policy can coordinate egocentric perception, task interaction, foot placement, and whole-body motion through the shared GMT-based execution interface.


we report both category-level performance and the overall average. For each task, all methods use the same demonstration split and are evaluated on the same held-out initializations. Each experimental configuration is evaluated with 3 random seeds and 20 rollout trials per seed, resulting in 60 rollouts per configuration. To study robustness beyond the in-distribution setting, we evaluate on the visual, semantic, and execution generalization splits defined in Section 3.5. 

Policy instantiations and training. We instantiate the high-level policy with four representative policy families: ACT [45], Diffusion Policy (DP, [46]), Flow Matching (FM, [47]), and π<sub>0.5</sub> [7]. All policies receive the same egocentric RGB observation, proprioceptive state, and task instruction, and predict the same 40D intermediate whole-body action. This keeps the observation space, action interface, and GMT execution layer fixed, so that performance differences primarily reflect policy design rather than changes in the control interface. For fair comparison, all policies are trained with the same number of demonstrations per task and the same total training budget of 100k gradient steps. Model-specific training details are provided in Appendix F. 

GMT deployment protocols. We evaluate each policy under multiple GMT deployment settings. In the in-GMT protocol, training and inference use the same GMT, measuring standard task performance under a matched data-collection and GMT backend. In the cross-GMT protocol, policies are trained on demonstrations collected with one GMT and deployed with another, measuring whether the learned high-level policy and intermediate action representation transfer across GMT backends. 

Metrics. We utilize success rate (SR) as the primary metric across all tasks and evaluation protocols. For cross-GMT evaluation, we report the absolute cross-GMT drop $\Delta _ { \mathrm { c r o s s } } = \mathrm { S R } _ { \mathrm { i n } } - \mathrm { S R } _ { \mathrm { c r o s s } }$ and relative transfer retention $\mathrm { R e t } = \mathrm { \dot { S } R } _ { \mathrm { c r o s s } } / \mathrm { S R } _ { \mathrm { i n } } ,$ , where $\operatorname { S R } _ { \operatorname { i n } }$ is the matched in-GMT success rate and $\mathrm { S R } _ { \mathrm { c r o s s } }$ is the success rate after replacing the deployment GMT. For visual, semantic, and execution generalization, we report success rate on each held-out split together with the relative performance drop from the in-distribution split. In addition to task completion, we report average fall rate (AFR) as a key stability metric, since successful humanoid interaction requires not only reaching task goals but also maintaining balance and dynamically feasible whole-body motion throughout execution. 

Implementation and reproducibility. To ensure that comparisons reflect policy design rather than evaluation artifacts, all methods are evaluated with identical rollout seeds, held-out object configurations, and initial robot states. All policies share the same visual preprocessing, canonical proprioceptive input, and intermediate whole-body action interface. Detailed training and deployment settings, including policy frequency, GMT control frequency, action chunking, optimization hyperparameters, and compute resources, are provided in Appendix F. 


Table 1: In-GMT evaluation. We evaluate high-level policy baselines with matched training and inference GMTs, using TWIST2 or SONIC as the low-level execution backend. Results are reported as success rate (SR, ↑; mean ± standard deviation). AVG denotes the average SR within each HOI or HSI task suite. The best and second-best AVG are highlighted in bold and underlined, respectively.


<table><tr><td rowspan="2">Difficulty</td><td rowspan="2">Method</td><td rowspan="2">AFR (↓)</td><td colspan="4">HOI</td><td colspan="5">HSI</td></tr><tr><td>FOOTBALL</td><td>DOUBLEDESK</td><td>P&amp;PBOX</td><td>AVG (↑)</td><td>OPENDOOR</td><td>SITSOFA</td><td>BOXING</td><td>VISNAVI</td><td>AVG (↑)</td></tr><tr><td rowspan="4">TWIST2</td><td>ACT [45]</td><td>6.43%</td><td>26.7±6.2%</td><td>15.0±8.2%</td><td>43.3±8.5%</td><td>28.33±13.94%</td><td>50.0±4.1%</td><td>66.7±10.3%</td><td>58.3±10.3%</td><td>13.3±4.7%</td><td>47.08±21.84%</td></tr><tr><td>DP [46]</td><td>10.48%</td><td>46.7±6.2%</td><td>10.0±4.1%</td><td>50.0±0.0%</td><td>35.56±18.63%</td><td>68.3±6.2%</td><td>73.3±6.2%</td><td>51.7±11.8%</td><td>30.0±4.1%</td><td>55.83±18.58%</td></tr><tr><td>FM [47]</td><td>7.38%</td><td>53.3±8.5%</td><td>16.7±8.5%</td><td>38.3±8.5%</td><td>36.11±17.28%</td><td>76.7±2.4%</td><td>68.3±6.2%</td><td>63.3±9.4%</td><td>26.7±20.9%</td><td>58.75±22.56%</td></tr><tr><td><eq>\pi_{0.5}</eq>[7]</td><td>3.33%</td><td>26.7±4.7%</td><td>1.7±2.4%</td><td>46.7±8.5%</td><td>25.00±19.29%</td><td>28.3±9.4%</td><td>60.0±4.1%</td><td>51.7±8.5%</td><td>13.3±8.5%</td><td>38.33±20.14%</td></tr><tr><td rowspan="4">SONIC</td><td>ACT [45]</td><td>8.57%</td><td>16.7±6.2%</td><td>18.3±4.7%</td><td>56.7±6.2%</td><td>30.56±19.36%</td><td>78.3±9.4%</td><td>73.3±8.5%</td><td>56.7±6.2%</td><td>33.3±2.4%</td><td>60.42±18.98%</td></tr><tr><td>DP [46]</td><td>8.33%</td><td>45.0±10.8%</td><td>36.7±4.7%</td><td>75.0±4.1%</td><td>52.22±17.97%</td><td>85.0±10.8%</td><td>78.3±14.3%</td><td>76.7±2.4%</td><td>23.3±6.2%</td><td>65.83±26.52%</td></tr><tr><td>FM [47]</td><td>5.71%</td><td>13.3±2.4%</td><td>38.3±4.7%</td><td>73.3±6.2%</td><td>41.67±25.06%</td><td>70.0±4.1%</td><td>15.0±7.1%</td><td>70.0±8.2%</td><td>38.3±14.3%</td><td>48.33±24.94%</td></tr><tr><td><eq>\pi_{0.5}</eq>[7]</td><td>5.24%</td><td>10.0±4.1%</td><td>43.3±6.2%</td><td>71.7±11.8%</td><td>41.67±26.46%</td><td>66.7±6.2%</td><td>73.3±2.4%</td><td>70.0±0.0%</td><td>23.3±6.2%</td><td>58.33±20.85%</td></tr></table>

## 4.2 Main Results

In-GMT evaluation. Table 1 evaluates high-level policy baselines under matched training and inference GMTs. Overall, the results show that existing egocentric policies can complete leg-critical HOI/HSI tasks with GMT-based execution, while performance varies substantially across policy architectures and tracker backends. Under TWIST2, FM [47] achieves the best suite averages on both HOI and HSI, reaching 36.11% and 58.75%, respectively. Under SONIC, DP [46] becomes the strongest baseline on both suites, reaching 52.22% on HOI and 65.83% on HSI. Notably, π achieves the best result on DoubleDesk under SONIC, reaching 43.3% SR. This may benefit from its manipulation-oriented pretraining, since DoubleDesk involves hand-centric grasping, carrying, and placing. However, this advantage is less evident on tasks dominated by whole-body motion, where success depends on foot placement, balance, and coordinated body execution. Comparing the best results under each tracker, SONIC outperforms TWIST2 on both HOI and HSI, improving the best average SR by 16.11% and 7.08%, respectively. These results suggest that performance should be interpreted as a property of the policy–tracker pair rather than the high-level policy alone. Beyond SR, AFR provides an important safety-oriented view: $\pi _ { 0 . 5 }$ [7] achieves the lowest AFR under both TWIST2 and SONIC in the in-GMT setting, making it the most stable baseline. This highlights the need to evaluate both interaction success and physical stability in humanoid benchmarks. 

Finding 1: In-GMT performance is feasible but tracker-conditioned. The same policy family can behave differently when paired with different GMTs, and the best policy under one tracker is not always the best under another. This supports the benchmark design choice of treating the general motion tracker as a first-class evaluation axis rather than a hidden low-level controller. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/933eebe2d9357a55f2949c9fcedc99ce7c4562771b3fb02962b307b42f706acb.jpg)



Figure 3: Perturbation-conditioned evaluation. We report suite-level average success rates under the in-distribution, visual, semantic, and execution settings. Each curve denotes one high-level policy, characterizing how different policy architectures degrade under the three benchmark-defined sources of perturbation with matched GMT execution.


Perturbation-conditioned evaluation. Figure 3 summarizes in-GMT robustness using average SR under the visual, semantic, and execution settings. Overall, SR often decreases under perturbation, especially under visual shifts, but the degradation patterns are not uniform across policies and tracker backends. Visual perturbations produce the most consistent drop, especially on HOI; for example, under TWIST2-HOI, ACT [45] drops from 28.33% to 14.44% and FM from 36.11% to 18.33%. DP [46] shows the most consistent profile in SONIC settings, remaining strongest on HSI across all perturbation splits and on HOI except the semantic split, where $\pi _ { 0 . 5 }$ achieves the highest HOI average. These results show that visual, semantic, and execution perturbations expose different failure modes rather than a single notion of robustness, motivating evaluation of egocentric appearance robustness, target grounding, and spatial adaptation of whole-body actions. Full per-task results are provided in Appendix I. 


Table 2: Cross-GMT evaluation. T→S denotes policies trained on TWIST2 demonstrations and deployed with the SONIC backend, while S→T denotes the reverse direction. Each policy entry reports absolute cross-GMT drop $\Delta _ { \mathrm { c r o s s } }$ (↓) / relative transfer retention Ret (↑), computed with respect to the corresponding matched in-GMT performance. AFR (↓) denotes the task-level average fall rate under each cross-GMT deployment direction, measuring tracker-induced stability failures.


<table><tr><td rowspan="2">Task Type</td><td rowspan="2">Task</td><td colspan="5">TWIST2 → SONIC</td><td colspan="5">SONIC → TWIST2</td></tr><tr><td>ACT [45]</td><td>DP [46]</td><td>FM [47]</td><td><eq>\pi_{0.5}</eq> [7]</td><td>AFR (↓)</td><td>ACT [45]</td><td>DP [46]</td><td>FM [47]</td><td><eq>\pi_{0.5}</eq> [7]</td><td>AFR (↓)</td></tr><tr><td rowspan="3">HOI</td><td>FOOTBALL</td><td>26.70 / 0.00%</td><td>25.00 / 46.47%</td><td>46.60 / 12.57%</td><td>26.70 / 0.00%</td><td>1.25%</td><td>16.70 / 0.00%</td><td>43.30 / 3.78%</td><td>11.60 / 12.78%</td><td>10.00 / 0.00%</td><td>7.08%</td></tr><tr><td>DOUBLEDESK</td><td>15.00 / 0.00%</td><td>10.00 / 0.00%</td><td>16.70 / 0.00%</td><td>1.70 / 0.00%</td><td>2.90%</td><td>18.30 / 0.00%</td><td>36.70 / 0.00%</td><td>38.30 / 0.00%</td><td>41.60 / 3.93%</td><td>32.08%</td></tr><tr><td>P&amp;PBOX</td><td>43.30 / 0.00%</td><td>50.00 / 0.00%</td><td>38.30 / 0.00%</td><td>46.70 / 0.00%</td><td>0.00%</td><td>31.70 / 44.09%</td><td>48.30 / 35.60%</td><td>45.00 / 38.61%</td><td>21.70 / 69.74%</td><td>0.40%</td></tr><tr><td rowspan="4">HSI</td><td>OPENDOOR</td><td>50.00 / 0.00%</td><td>68.30 / 0.00%</td><td>75.00 / 2.22%</td><td>28.30 / 0.00%</td><td>0.00%</td><td>78.30 / 0.00%</td><td>81.70 / 3.88%</td><td>63.30 / 9.57%</td><td>51.70 / 22.49%</td><td>0.00%</td></tr><tr><td>SITSOFA</td><td>66.70 / 0.00%</td><td>73.30 / 0.00%</td><td>68.30 / 0.00%</td><td>60.00 / 0.00%</td><td>0.40%</td><td>45.00 / 38.61%</td><td>60.00 / 23.37%</td><td>1.00 / 93.33%</td><td>68.30 / 6.82%</td><td>1.65%</td></tr><tr><td>BOXING</td><td>58.30 / 0.00%</td><td>50.00 / 3.29%</td><td>55.00 / 13.11%</td><td>51.70 / 0.00%</td><td>2.50%</td><td>23.40 / 58.73%</td><td>31.70 / 58.67%</td><td>11.70 / 83.29%</td><td>15.00 / 78.57%</td><td>0.00%</td></tr><tr><td>VISNAVI</td><td>13.30 / 0.00%</td><td>13.30 / 55.67%</td><td>26.70 / 0.00%</td><td>13.30 / 0.00%</td><td>2.48%</td><td>33.30 / 0.00%</td><td>23.30 / 0.00%</td><td>35.00 / 8.62%</td><td>23.30 / 0.00%</td><td>11.68%</td></tr></table>

Cross-GMT evaluation. Table 2 evaluates whether intermediate whole-body actions remain transferable when replacing the deployment GMT. Each policy entry reports $\Delta _ { \mathrm { c r o s s } }$ (↓) / Ret (↑), so the two metrics should be interpreted jointly. Overall, tracker replacement causes substantial degradation in both directions: TWIST2→SONIC has a slightly larger average drop than SONIC→TWIST2 (39.9% vs. 36.0%), and it produces more zero-retention entries. For example, on Football, TWIST2→SONIC yields drops ranging from 25.0% to 46.6%, whereas SONIC→TWIST2 ranges from 10.0% to 43.3% with low retention values of 0.0%–12.78%. This shows that smaller $\Delta _ { \mathrm { c r o s s } }$ does not necessarily indicate better transfer when matched-GMT performance is already low. Furthermore, AFR provides a complementary view of tracker-induced stability. SONIC→TWIST2 has a higher average AFR than TWIST2→SONIC (7.56% vs. 1.36%), driven by instability on DoubleDesk (32.08%) and VisNavi (11.68%). In contrast, TWIST2→SONIC remains stable, with its highest AFR values on DoubleDesk (2.90%), Boxing (2.50%), and VisNavi (2.48%). However, the lower AFR of TWIST2→SONIC does not translate into improved task transfer, as retention remains low across tasks. 

Finding 2: Cross-GMT transfer is asymmetric and metric-dependent. Replacing the deployment GMT causes substantial performance drops and low retention, but the two transfer directions differ in absolute drop, retention, and fall rate. This indicates that current high-level policies do not learn fully tracker-invariant intermediate intent by default; instead, they partially specialize to the dynamics and correction behavior of the demonstration tracker. 

Qualitative Results. Figure 2 presents successful Diffusion Policy [46] rollouts on Football, DoubleDesk, SitSofa, and VisNavi. The examples show that the learned policy can generate temporally coherent intermediate whole-body actions that are executable by the low-level general motion tracker. In Football, the robot coordinates approach, stance adjustment, and leg swing to kick the ball; in DoubleDesk, it moves through constrained scene geometry while maintaining stable body orientation; in SitSofa, it aligns with the sofa and lowers its body into a seated posture; and in VisNavi, it uses egocentric observations to guide stepping and turning toward the goal region. Together, these cases illustrate that HUMANOIDARENA evaluates integrated perception, foot placement, balance, and whole-body interaction, rather than isolated manipulation or base navigation. We further provide failure case analysis in Appendix G. 

## 5 Conclusion

We presented HUMANOIDARENA, a simulation-first benchmark for egocentric hierarchical wholebody humanoid learning. Built around a shared policy–tracker interface, HUMANOIDARENA provides leg-critical HOI/HSI tasks, closed-loop multi-GMT demonstrations, and controlled evaluation proto cols across visual, semantic, execution, in-GMT, and cross-GMT settings. Our experiments show that current policies can learn diverse whole-body interactions through GMT-based execution, but also reveal that performance depends strongly on the paired general motion tracker. In particular, cross-GMT evaluation exposes substantial and asymmetric transfer failures that are hidden under matched-backend evaluation. These findings highlight the need for intermediate whole-body action representations that are robust, tracker-transferable, and physically compatible with dynamic execution. We hope HUMANOIDARENA provides a common testbed for advancing egocentric humanoid policies that coordinate perception, task interaction, balance, and whole-body motion. 

## References



[1] M. Merleau-Ponty and C. Smith. Phenomenology of Perception. Motilal Banarsidass Publishers (Pvt. Limited), 1996. 





[2] Rodney A. Brooks. Intelligence without representation. Artificial Intelligence, 1991. 





[3] Mike Stilman, Koichi Nishiwaki, and Satoshi Kagami. Humanoid teleoperation for whole body manipulation. In ICRA, 2008. 





[4] Júlia Borràs and Tamim Asfour. A whole-body pose taxonomy for loco-manipulation tasks. In IROS, 2015. 





[5] Lujie Yang, Xiaoyu Huang, Zhen Wu, Angjoo Kanazawa, Pieter Abbeel, Carmelo Sferrazza, C. Karen Liu, Rocky Duan, and Guanya Shi. Omniretarget: Interaction-preserving data generation for humanoid whole-body loco-manipulation and scene interaction. In ICRA, 2026. 





[6] Moo Jin Kim, Karl Pertsch, Siddharth Karamcheti, Ted Xiao, Ashwin Balakrishna, Suraj Nair, Rafael Rafailov, Ethan Foster, Grace Lam, Pannag Sanketi, Quan Vuong, Thomas Kollar, Benjamin Burchfiel, Russ Tedrake, Dorsa Sadigh, Sergey Levine, Percy Liang, and Chelsea Finn. Openvla: An open-source vision-language-action model. arXiv preprint arXiv:2406.09246, 2024. 





[7] Physical Intelligence, Kevin Black, Noah Brown, James Darpinian, Karan Dhabalia, Danny Driess, Adnan Esmail, Michael Equi, Chelsea Finn, Niccolo Fusai, Manuel Y. Galliker, Dibya Ghosh, Lachy Groom, Karol Hausman, Brian Ichter, Szymon Jakubczak, Tim Jones, Liyiming Ke, Devin LeBlanc, Sergey Levine, Adrian Li-Bell, Mohith Mothukuri, Suraj Nair, Karl Pertsch, Allen Z. Ren, Lucy Xiaoyang Shi, Laura Smith, Jost Tobias Springenberg, Kyle Stachowicz, James Tanner, Quan Vuong, Homer Walke, Anna Walling, Haohuan Wang, Lili Yu, and Ury Zhilinsky. π<sub>0.5</sub>: a vision-language-action model with open-world generalization. arXiv preprint arXiv:2504.16054, 2025. 





[8] Qiayuan Liao, Takara E. Truong, Xiaoyu Huang, Yuman Gao, Guy Tevet, Koushil Sreenath, and C. Karen Liu. Beyondmimic: From motion tracking to versatile humanoid control via guided diffusion. arXiv preprint arXiv:2508.08241, 2025. 





[9] Weiji Xie, Jinrui Han, Jiakun Zheng, Huanyu Li, Xinzhe Liu, Jiyuan Shi, Weinan Zhang, Chenjia Bai, and Xuelong Li. Kungfubot: Physics-based humanoid whole-body control for learning highly-dynamic skills. arXiv preprint arXiv:2506.12851, 2025. 





[10] Yunshen Wang, Shaohang Zhu, Peiyuan Zhi, Yuhan Li, Jiaxin Li, Yong-Lu Li, Yuchen Xiao, Xingxing Wang, Baoxiong Jia, and Siyuan Huang. Omnixtreme: Breaking the generality barrier in high-dynamic humanoid control. arXiv preprint arXiv:2602.23843, 2026. 





[11] Yanjie Ze, Siheng Zhao, Weizhuo Wang, Angjoo Kanazawa, Rocky Duan, Pieter Abbeel, Guanya Shi, Jiajun Wu, and C. Karen Liu. Twist2: Scalable, portable, and holistic humanoid data collection system. arXiv preprint arXiv:2511.02832, 2025. 





[12] Zhengyi Luo, Ye Yuan, Tingwu Wang, Chenran Li, Sirui Chen, Fernando Castañeda, Zi-Ang Cao, Jiefeng Li, David Minor, Qingwei Ben, Xingye Da, Runyu Ding, Cyrus Hogg, Lina Song, Edy Lim, Eugene Jeong, Tairan He, Haoru Xue, Wenli Xiao, Zi Wang, Simon Yuen, Jan Kautz, Yan Chang, Umar Iqbal, Linxi Fan, and Yuke Zhu. Sonic: Supersizing motion tracking for natural humanoid whole-body control. arXiv preprint arXiv:2511.07820, 2025. 





[13] Carmelo Sferrazza, Dun-Ming Huang, Xingyu Lin, Youngwoon Lee, and Pieter Abbeel. Humanoidbench: Simulated humanoid benchmark for whole-body locomotion and manipulation. arXiv preprint arXiv:2403.10506, 2024. 





[14] Haoru Xue, Xiaoyu Huang, Dantong Niu, Qiayuan Liao, Thomas Kragerud, Jan Tommy Gravdahl, Xue Bin Peng, Guanya Shi, Trevor Darrell, Koushil Sreenath, and Shankar Sastry. Leverb: Humanoid whole-body control with latent vision-language instruction. arXiv preprint arXiv:2506.13751, 2025. 





[15] Chengshu Li, Ruohan Zhang, Josiah Wong, Cem Gokmen, Sanjana Srivastava, Roberto Martín-Martín, Chen Wang, Gabrael Levine, Michael Lingelbach, Jiankai Sun, Mona Anvari, Minjune Hwang, Manasi Sharma, Arman Aydin, Dhruva Bansal, Samuel Hunter, Kyu-Young Kim, Alan Lou, Caleb R Matthews, Ivan Villa-Renteria, Jerry Huayang Tang, Claire Tang, Fei Xia, Silvio Savarese, Hyowon Gweon, Karen Liu, Jiajun Wu, and Li Fei-Fei. BEHAVIOR-1k: A benchmark for embodied AI with 1,000 everyday activities and realistic simulation. In CoRL, 2022. 





[16] Bo Liu, Yifeng Zhu, Chongkai Gao, Yihao Feng, Qiang Liu, Yuke Zhu, and Peter Stone. Libero: Benchmarking knowledge transfer for lifelong robot learning. arXiv preprint arXiv:2306.03310, 2023. 





[17] Haozhuo Zhang, Jingkai Sun, Michele Caprio, Jian Tang, Shanghang Zhang, Qiang Zhang, and Wei Pan. Humanoidverse: A versatile humanoid for vision-language guided multi-object rearrangement. arXiv preprint arXiv:2508.16943v1, 2025. 





[18] Haoyang Weng, Yitang Li, Nikhil Sobanbabu, Zihan Wang, Zhengyi Luo, Tairan He, Deva Ramanan, and Guanya Shi. Hdmi: Learning interactive humanoid whole-body control from human videos. arXiv preprint arXiv:2509.16757, 2025. 





[19] Siheng Zhao, Yanjie Ze, Yue Wang, C. Karen Liu, Pieter Abbeel, Guanya Shi, and Rocky Duan. Resmimic: From general motion tracking to humanoid whole-body loco-manipulation via residual learning. arXiv preprint arXiv:2510.05070, 2025. 





[20] Dongting Li, Xingyu Chen, Qianyang Wu, Bo Chen, Sikai Wu, Hanyu Wu, Guoyao Zhang, Liang Li, Mingliang Zhou, Diyun Xiang, et al. Haic: Humanoid agile object interaction control via dynamics-aware world model. arXiv preprint arXiv:2602.11758, 2026. 





[21] Yinhuai Wang, Qihan Zhao, Yuen Fui Lau, Runyi Yu, Hok Wai Tsui, Qifeng Chen, Jingbo Wang, Jiangmiao Pang, and Ping Tan. Humanx: Toward agile and generalizable humanoid interaction skills from human videos. arXiv preprint arXiv:2602.02473, 2026. 





[22] Zhi Su, Bike Zhang, Nima Rahmanian, Yuman Gao, Qiayuan Liao, Caitlin Regan, Koushil Sreenath, and S Shankar Sastry. Hitter: A humanoid table tennis robot via hierarchical planning and learning. arXiv preprint arXiv:2508.21043, 2025. 





[23] Zhikai Zhang, Haofei Lu, Yunrui Lian, Ziqing Chen, Yun Liu, Chenghuai Lin, Han Xue, Zicheng Zeng, Zekun Qi, Shaolin Zheng, et al. Learning athletic humanoid tennis skills from imperfect human motion data. arXiv preprint arXiv:2603.12686, 2026. 





[24] Huayi Wang, Wentao Zhang, Runyi Yu, Tao Huang, Junli Ren, Feiyu Jia, Zirui Wang, Xiaojie Niu, Xiao Chen, Jiahe Chen, et al. Physhsi: Towards a real-world generalizable and natural humanoid-scene interaction system. arXiv preprint arXiv:2510.11072, 2025. 





[25] Shaofeng Yin, Yanjie Ze, Hong-Xing Yu, C Karen Liu, and Jiajun Wu. Visualmimic: Visual humanoid loco-manipulation via motion tracking and generation. arXiv preprint arXiv:2509.20322, 2025. 





[26] Tairan He, Zi Wang, Haoru Xue, Qingwei Ben, Zhengyi Luo, Wenli Xiao, Ye Yuan, Xingye Da, Fernando Castañeda, Shankar Sastry, et al. Viral: Visual sim-to-real at scale for humanoid loco-manipulation. arXiv preprint arXiv:2511.15200, 2025. 





[27] Yuhang Lin, Jiyuan Shi, Dewei Wang, Jipeng Kong, Yong Liu, Chenjia Bai, and Xuelong Li. Pro-hoi: Perceptive root-guided humanoid-object interaction. arXiv preprint arXiv:2603.01126, 2026. 





[28] Yutang Lin, Jieming Cui, Yixuan Li, Baoxiong Jia, Yixin Zhu, and Siyuan Huang. Lessmimic: Long-horizon humanoid interaction with unified distance field representations. arXiv preprint arXiv:2602.21723, 2026. 





[29] Xialin He, Sirui Xu, Xinyao Li, Runpei Dong, Liuyu Bian, Yu-Xiong Wang, and Liang-Yan Gui. Ultra: Unified multimodal control for autonomous humanoid whole-body loco-manipulation. arXiv preprint arXiv:2603.03279, 2026. 





[30] Junli Ren, Yinghui Li, Kai Zhang, Penglin Fu, Haoran Jiang, Yixuan Pan, Guangjun Zeng, Tao Huang, Weizhong Guo, Peng Lu, et al. Smash: Mastering scalable whole-body skills for humanoid ping-pong with egocentric vision. arXiv preprint arXiv:2604.01158, 2026. 





[31] Nikita Rudin, Junzhe He, Joshua Aurand, and Marco Hutter. Parkour in the wild: Learning a general and extensible agile locomotion policy using multi-expert distillation and rl fine-tuning. arXiv preprint arXiv:2505.11164, 2025. 





[32] Hang Liu, Yuman Gao, Sangli Teng, Yufeng Chi, Yakun Sophia Shao, Zhongyu Li, Maani Ghaffari, and Koushil Sreenath. Ego-vision world model for humanoid contact planning. arXiv preprint arXiv:2510.11682, 2025. 





[33] Qingwei Ben, Botian Xu, Kailin Li, Feiyu Jia, Wentao Zhang, Jingping Wang, Jingbo Wang, Dahua Lin, and Jiangmiao Pang. Gallant: Voxel grid-based humanoid locomotion and localnavigation across 3d constrained terrains. arXiv preprint arXiv:2511.14625, 2025. 





[34] Shaoting Zhu, Ziwen Zhuang, Mengjie Zhao, Kun-Ying Lee, and Hang Zhao. Hiking in the wild: A scalable perceptive parkour framework for humanoids. arXiv preprint arXiv:2601.07718, 2026. 





[35] Ziwen Zhuang, Shaoting Zhu, Mengjie Zhao, and Hang Zhao. Deep whole-body parkour. arXiv preprint arXiv:2601.07701, 2026. 





[36] Zhen Wu, Xiaoyu Huang, Lujie Yang, Yuanhang Zhang, Koushil Sreenath, Xi Chen, Pieter Abbeel, Rocky Duan, Angjoo Kanazawa, Carmelo Sferrazza, et al. Perceptive humanoid parkour: Chaining dynamic human skills via motion matching. arXiv preprint arXiv:2602.15827, 2026. 





[37] Haoran Yang, Jiacheng Bao, Yucheng Xin, Haoming Song, Yuyang Tian, Bin Zhao, Dong Wang, and Xuelong Li. Zerowbc: Learning natural visuomotor humanoid control directly from human egocentric video. arXiv preprint arXiv:2603.09170, 2026. 





[38] Weikai Qin, Sichen Wu, Ci Chen, Mengfan Liu, Linxi Feng, Xinru Cui, Haoqi Han, and Hesheng Wang. Physiflow: Physics-aware humanoid whole-body vla via multi-brain latent flow matching and robust tracking. arXiv preprint arXiv:2603.05410, 2026. 





[39] Pengxiang Ding, Jianfei Ma, Xinyang Tong, Binghong Zou, Xinxin Luo, Yiguo Fan, Ting Wang, Hongchao Lu, Panzhong Mo, Jinxin Liu, Yuefan Wang, Huaicheng Zhou, Wenshuo Feng, Jiacheng Liu, Siteng Huang, and Donglin Wang. Humanoid-vla: Towards universal humanoid control with visual integration. arXiv preprint arXiv:2502.14795, 2025. 





[40] Haoran Jiang, Jin Chen, Qingwen Bu, Li Chen, Modi Shi, Yanjie Zhang, Delong Li, Chuanzhe Suo, Chuang Wang, Zhihui Peng, and Hongyang Li. Wholebodyvla: Towards unified latent vla for whole-body loco-manipulation control. arXiv preprint arXiv:2512.11047, 2025. 





[41] Songlin Wei, Hongyi Jing, Boqian Li, Zhenyu Zhao, Jiageng Mao, Zhenhao Ni, Sicheng He, Jie Liu, Xiawei Liu, Kaidi Kang, Sheng Zang, Weiduo Yuan, Marco Pavone, Di Huang, and Yue Wang. ψ<sub>0</sub>: An open foundation model towards universal humanoid loco-manipulation. arXiv preprint arXiv:2603.12263, 2026. 





[42] Yunfan Jiang, Ruohan Zhang, Josiah Wong, Chen Wang, Yanjie Ze, Hang Yin, Cem Gokmen, Shuran Song, Jiajun Wu, and Li Fei-Fei. BEHAVIOR robot suite: Streamlining real-world whole-body manipulation for everyday household activities. In CoRL, 2025. 





[43] Yizheng Zhang, Zhenjun Yu, Jiaxin Lai, Cewu Lu, and Lei Han. Agentworld: An interactive simulation platform for scene construction and mobile robotic manipulation. In CoRL, 2025. 





[44] Zhenyu Zhao, Hongyi Jing, Xiawei Liu, Jiageng Mao, Abha Jha, Hanwen Yang, Rong Xue, Sergey Zakharov, Vitor Guizilini, and Yue Wang. Humanoid everyday: A comprehensive robotic dataset for open-world humanoid manipulation. arXiv preprint arXiv:2510.08807, 2025. 





[45] Tony Z. Zhao, Vikash Kumar, Sergey Levine, and Chelsea Finn. Learning fine-grained bimanual manipulation with low-cost hardware. In RSS, 2023. 





[46] Cheng Chi, Siyuan Feng, Yilun Du, Zhenjia Xu, Eric Cousineau, Benjamin Burchfiel, and Shuran Song. Diffusion policy: Visuomotor policy learning via action diffusion. In RSS, 2023. 





[47] Boston Dynamics and TRI Research Team. Large behavior models and atlas find new footing, 2025. Blog post. 





[48] Mayank Mittal, Pascal Roth, James Tigue, Antoine Richard, Octi Zhang, Peter Du, Antonio Serrano-Muñoz, Xinjie Yao, René Zurbrügg, Nikita Rudin, Lukasz Wawrzyniak, Milad Rakhsha, Alain Denzler, Eric Heiden, Ales Borovicka, Ossama Ahmed, Iretiayo Akinola, Abrar Anwar, Mark T. Carlson, Ji Yuan Feng, Animesh Garg, Renato Gasoto, Lionel Gulich, Yijie Guo, M. Gussert, Alex Hansen, Mihir Kulkarni, Chenran Li, Wei Liu, Viktor Makoviychuk, Grzegorz Malczyk, Hammad Mazhar, Masoud Moghani, Adithyavairavan Murali, Michael Noseworthy, Alexander Poddubny, Nathan Ratliff, Welf Rehberg, Clemens Schwarke, Ritvik Singh, James Latham Smith, Bingjie Tang, Ruchik Thaker, Matthew Trepte, Karl Van Wyk, Fangzhou Yu, Alex Millane, Vikram Ramasamy, Remo Steiner, Sangeeta Subramanian, Clemens Volk, CY Chen, Neel Jawale, Ashwin Varghese Kuruttukulam, Michael A. Lin, Ajay Mandlekar, Karsten Patzwaldt, John Welsh, Huihua Zhao, Fatima Anes, Jean-Francois Lafleche, Nicolas Moënne-Loccoz, Soowan Park, Rob Stepinski, Dirk Van Gelder, Chris Amevor, Jan Carius, Jumyung Chang, Anka He Chen, Pablo de Heras Ciechomski, Gilles Daviet, Mohammad Mohajerani, Julia von Muralt, Viktor Reutskyy, Michael Sauter, Simon Schirm, Eric L. Shi, Pierre Terdiman, Kenny Vilella, Tobias Widmer, Gordon Yeoman, Tiffany Chen, Sergey Grizan, Cathy Li, Lotus Li, Connor Smith, Rafael Wiltz, Kostas Alexis, Yan Chang, David Chu, Linxi "Jim" Fan, Farbod Farshidian, Ankur Handa, Spencer Huang, Marco Hutter, Yashraj Narang, Soha Pouya, Shiwei Sheng, Yuke Zhu, Miles Macklin, Adam Moravanszky, Philipp Reist, Yunrong Guo, David Hoeller, and Gavriel State. Isaac lab: A gpu-accelerated simulation framework for multi-modal robot learning. arXiv preprint arXiv:2511.04831, 2025. 





[49] Joao Pedro Araujo, Yanjie Ze, Pei Xu, Jiajun Wu, and C. Karen Liu. Retargeting matters: General motion retargeting for humanoid motion tracking. arXiv preprint arXiv:2510.02252, 2025. 





[50] Yanjie Ze, Zixuan Chen, João Pedro Araújo, Zi ang Cao, Xue Bin Peng, Jiajun Wu, and C. Karen Liu. Twist: Teleoperated whole-body imitation system. arXiv preprint arXiv:2505.02833, 2025. 



## SUMMARY OF THE APPENDIX

This appendix contains additional experimental results and discussions of our work, organized as: 

• §A details the leg-critical HOI/HSI task suite, including task layouts, initialization ranges, success conditions, termination criteria, and why each task requires lower-body participation. 

• §B describes the data collection pipeline and dataset specification, including VR teleoperation, GMR retargeting, synchronized observations, episode format, data fields, train/test splits, and multi-GMT demonstration statistics. 

• §C explains the intermediate whole-body action interface and GMT adapters, covering the 40D canonical action, 64D proprioceptive state, tracker-specific mappings, and the SONIC/TWIST2 execution interfaces. 

• §D outlines the evaluation protocol details, including visual, semantic, and execution perturbation configurations, held-out splits, rollout seeds, in/cross-GMT settings, and metric definitions. 

• §E provides additional experimental analysis, examining representative rollout behaviors across diverse HOI/HSI tasks. 

• §F provides policy implementation and training details, including ACT, Diffusion Policy, Flow Matching, and $\pi _ { 0 . 5 }$ hyperparameters, learning rates, batch sizes, action chunk lengths, inference horizons, preprocessing, training steps, and compute resources. 

• §G analyses failure cases, separating perception failures, semantic grounding failures, execution instability, fall cases, tracker incompatibility, and compounding errors under long-horizon wholebody interaction. 

• §H provides reproducibility and release details, including code structure, dataset format, environment setup, asset dependencies, random seeds, license information, and expected compute requirements. 

• §I presents additional results, including full per-task perturbation results for in-GMT evaluation and merge-all training analysis across TWIST2, SONIC, and combined GMT datasets. 

• §J discusses limitations and future directions. 

## A Task Suite Specification

This section specifies the seven leg-critical egocentric tasks in HUMANOIDARENA, designed to evaluate whole-body robotic capabilities that require tight coordination between locomotion, percep tion, balance control, and task-oriented interaction. The task suite consists of three Human-Object Interaction (HOI) tasks and four Human-Scene Interaction (HSI) tasks. The HOI tasks include Football, where the robot kicks a soccer ball into a goal net; DoubleDesk, where it transfers a hammer from one desk to a basket on another desk; and P&PBox, where it picks up a box from a table and places it onto a shelf. The HSI tasks include OpenDoor, which requires opening an articulated door and passing through the doorway; SitSofa, which requires navigating to and sitting on a sofa; Boxing, which requires striking a randomized target mounted on a punching bag; and VisNavi, which requires visually navigating through obstacles and stepping into a target sign zone. Together, these tasks cover a diverse set of lower-body-dependent skills, including approach-and-kick motion, object transport during walking, articulated contact interaction, obstacle-aware navigation, precise foot placement, whole-body posture adjustment, and controlled sitting or striking behaviors. The task-specific success criteria, failure/termination conditions, and maximum episode lengths are summarized in Table S1. Each task is evaluated under a consistent protocol with 3 random seeds and 20 repeated trials per seed, resulting in 60 episodes for each model configuration. 

Table S1: Task-specific success and termination conditions. Fall detection uses a $6 0 ^ { \circ }$ torso tilt threshold, confirmed over 5 consecutive steps; an additional $7 5 ^ { \circ }$ hard-tilt condition or 50N body contact force with tilt triggers immediate termination. All tasks share a standing criterion of root height ≥ 0.45m and torso up-axis alignment $\geq 0 . 6 0$ 

<table><tr><td rowspan="2">Task</td><td rowspan="2">Max Steps</td><td colspan="3">Termination</td><td rowspan="2">Success Condition</td></tr><tr><td>Fall</td><td>Timeout</td><td>Note</td></tr><tr><td>FOOTBALL</td><td>1300</td><td>√</td><td>√</td><td>Ball leaves the field</td><td>Ball center crosses the goal plane and remains within the net bounds</td></tr><tr><td>DOUBLEDESK</td><td>2000</td><td>√</td><td>√</td><td>-</td><td>Hammer center of mass lies inside the basket bounding box</td></tr><tr><td>P&amp;PBOX</td><td>2000</td><td>√</td><td>√</td><td>Non-terminal box drop</td><td>Box rests on the shelf support surface, with its center within the support span</td></tr><tr><td>OPENDOOR</td><td>1800</td><td>√</td><td>√</td><td>-</td><td>Robot root passes through the door-frame plane while remaining upright</td></tr><tr><td>SITSOFA</td><td>1050</td><td>√</td><td>√</td><td>-</td><td>Pelvis or hip bodies maintain stable contact with the sofa seat surface</td></tr><tr><td>BOXING</td><td>1500</td><td>√</td><td>√</td><td>-</td><td>Hand reaches the dynamic hit radius of the target</td></tr><tr><td>VISNAVI</td><td>1800</td><td>√</td><td>√</td><td>-</td><td>Both feet are inside the target bounding box while the robot remains upright</td></tr></table>

![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/0b557154637a915301e379aa347de84a715a4f9379ef563992e2c7d33a242a81.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/b415f003fd31b789dbb8cd7ca6523042c21403ee4fc4fcf6fe72a83c89035721.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/7fb416748bc385074f829157383ed89246ff29221661b33e1591614a5d21abe2.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/e7ee77412c0ec86cc891c0929b8ad280642ddcc2310696130256f1ce159f3917.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/5c8a80ef79dfbf86f94ea3401398d17cf1cbef520406f90ad71a0f0f5a9d91b1.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/333ac9b7874ee4051c3e277ad70a0bf4e65e037e13edf3fa063d4b3a7c2c24f8.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/b7f2b0432a5bc0f226ca9a2a25ecc3b30175acf0a3ef3530343080a79f0910b6.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/fe33299d41001954db8a2acad3cee4f922c35b391701dc4d53f18fc2dd01736d.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/8cbe41b3b377ce801e0b85553502a3b486b380caec46757181a011fc53f4283f.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/d14dc0525a1f5122c6cc87ff722ddc8923273a6158acfdd09686ced795cbfab9.jpg)



Figure S1: Football successful rollout with 10 uniformly sampled frames shown in temporal order from left to right, top to bottom.


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/64513a8ef6da011f59a1d3df123c8232e46656fd2c7590ae99f4eacd68791c8d.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/4136fb82bb63afdf6dfb001d247d92e0dba3af0dbd58dfe51733986b1055fb7b.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/5e08e8a9e89dd028840cc457dfb4268024d3631ee0ce8612fd6369faa033b53b.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/458def1e67cc8525be878918399343c50fb15d1e5634b3eb00faad3cee57bca3.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/94d41ddcb2b1a399afdab13af9edbcdf2358a0e46c948c91bf77dccde1cd9c5d.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/923268759813b8ca0d0a15b8e3a812631192875d51d42ae9546ba114e161021a.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/d8a515f1ef31dd8e073ee869b3028fc5f802d2c39ad0ad22d7263a8a05af63f0.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/7c4e89d458f47d4123fdfef3c0f96ee306d0509d60e19c85cb1f2d2101288ce1.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/84adcdbcea8b87b4bda24bd6f39b0a1127c86d3ac9ccc7b72ac85a087b2b325c.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/13934e32d1223ebc7d3565d8130c546d91c09a9b0df16f279e83def0367c154f.jpg)



Figure S2: DoubleDesk successful rollout with 10 uniformly sampled frames shown in temporal order from left to right, top to bottom.


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/fce6793fb9782d2eb81fb74b7f274bfc53f3509375b2e4c95247f5908ddcbe23.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/5125c9b2bc93e6b11f65f75b520bdf8c9a1aa2b7db8fe25ff3c475cd1cf4fe7e.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/92404cca23483ce545d79e8477c480cf8f1a8632d3d3fea178f256708ada7cde.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/1aabdd99dcd588400f825c8fc4ad806d385bf2448504e4c8ef698371e934589f.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/8fa58a838d47af1aab79ce0de8b4b76d7518c9a7525c6346dab89d3b42701803.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/3f4b224cd51145c5ec5d59094d348cc611a4ad9bfefbeb4daf8ced6c3c3f67c7.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/6197c0cfd4a0ecc21ff3f357cc213371cadde1a7b39ef306881e92a79ab54730.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/fc0f5c999fa38e284e5ab8d5450efad554b698ece0112352f09a98106a2295b5.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/a1d6e609680ac71afadc3d409f6c3db652f0e5994cb0cca2e961adbf1b926b75.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/76f85efa9b529db4f10bcce628278d4e6636b5b1c799103cca584fedb37a8386.jpg)



Figure S3: P&PBox successful rollout with 10 uniformly sampled frames shown in temporal order from left to right, top to bottom.


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/618cf01c227a98a6b930a1af01bb9cdf7fe11eb24bb7c118ccf568c9c2695a88.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/b1c5e7d58253282dad5359561c9c85494f385040143133ed2719f0909d0d21bf.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/e37980aa61e850ce21e105862b7b5f06ae054edeca259a9a25cfc5f78a74e08e.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/fbe58b0e4fc1fee469f260ec84c7892b32ffc077889abe04c4f0714e615930c2.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/492de416a472f16cd76735fb7da43aa59b315cf63c13b48cf35a1876001458ed.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/fb494c2f7f028cedd51efbae36d5d85a32141c069ba8b4bc6ee14fee6ba1ffb9.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/48ed2bf4fe1733fc34cc692071722d5c275c5203b91d42150cb249e48ed26c5a.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/ad34a90dda755ab5948fa4c9dc1f9ad100641cffcd6f4d1837ecf6353a36589e.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/61260fdeb22913148ea726c6ec2b8b7e592b1407e2732ccea8364b9b3f880210.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/10a4934f60142812e90d873ced583fd3b98b6b2d59f70c773818d1cafc4396b1.jpg)



Figure S4: OpenDoor successful rollout with 10 uniformly sampled frames shown in temporal order from left to right, top to bottom.


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/2860cabe0f9e1694d7327dce64c2fd5d4479dc40fb8b466b90773d3661879d8a.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/dc541361ff431f1e6c8c4862771fa218f3b80ec953c4b624dbbe6dc96b53f5f7.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/02d9e9ea32029299d287a7cbcaa5ce6602d72ca2626a6b48383d025b65363bbc.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/448505f3015c5fbb9a5c25df86e3f2ddcbf3daaca9638c2329d2a4d40e6d5437.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/7e73eb530eb43eb3f7664c97f119fa0645c7a790e7982005c92db033d8637cab.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/f140a6949f3a74572000d31bee714f460699b46241ad87f25d0c40106bbb632b.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/0c5d31ec166a4f7500ebfb90ea36f658fb5bf44cea636530a417b344352b85c8.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/d5768011e45b71e7ef65cd6f616766dfd5240558163c214016b3851a15f4a3a7.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/c45ab43f639405c8711a0651ca7906b0fa14d78d665fd56b03681ff1c5e650de.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/de97c224a956f0350e4230f5099de58d6fc0ed40f9fb9e3bb437fbd8d59ba27c.jpg)



Figure S5: SitSofa successful rollout with 10 uniformly sampled frames shown in temporal order from left to right, top to bottom.


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/49f036f7116a7af1296d1d710a7cd2f175817b54364bae5a04ed2d505e4169e6.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/fd10660d52ec3862e31af662d71112ee4ed5b3fa54adb552812eb63293d7c0a9.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/46586f46f1b275066e0489eb0cabe5f4bde28eca6ef3b11206de4e48d1a693c8.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/a135cdff1ac9f0b5abdaea42bc0f7e9a9912053f50958aaf5fb9121895a5c766.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/cba66ca4eaa7ef644bb0073d2f0a3c0107996ed806f2602db595b2dabc3f35b3.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/e02a35f76e4a6a0aaed911581118635dd869d598b621f85ecf87077586661579.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/e2ee985c45939358e8c6415a333f44254fbcf50f2768a7dad7fd23fe16694f2a.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/bffc459f1c4f1fa6ca5e92af6dfb84ca45cfab7b38f957cdc72aa4c1223b4e56.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/fa158006da6551217228130da5233dc5f340175f5288975fc134ac7ade252d51.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/0cd3185f2d882e372d9b4df43791bac0dde086d75c759d4bf801b0822530d9fb.jpg)



Figure S6: Boxing successful rollout with 10 uniformly sampled frames shown in temporal order from left to right, top to bottom.


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/6e6ecdcf45ec6a690f67e433cebb42132b3444b2f39ed798bf630d70d04a5128.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/2cbc4e003b28f7818fea2009ba41faeded683d1447d6b995180af59555f80d8f.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/10937911cfec491842d810a3be16571815260682a84aaadf3754c37e2f941ca5.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/343eae583a170ef164b970296a5e10a3286a42f8d8843be0c6e73b646c2a6014.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/9359dc4fe45e7ea103b895eb477ecddc9815a99c21e7c235030e92eeeac14945.jpg)


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/f39085d9056fb2b91dd4bcdf450eb5e473f4a956544329561497e8f6845b0d0e.jpg)



Figure S7: VisNavi successful rollout with 10 uniformly sampled frames shown in temporal order from left to right, top to bottom.


Football (HOI). The robot must kick a soccer ball into a single goal net. The ball position is randomized within $[ - 1 . 2 , 1 . 2 ] \times [ - 1 . 2 , 1 . 2 ]$ . The scene includes four backdrop walls and a kinematic goal net at 3.0m distance. The ball has physics properties (0.43kg mass, restitution 0.1). Why leg-critical: Kicking requires the robot to (i) visually locate the ball, (ii) approach and adjust its stance, (iii) balance on the support leg, and (iv) execute a coordinated leg swing with precise impact timing. Each sub-step depends on lower-body dynamics; a stationary-base policy cannot perform the approach-kick sequence. 

DoubleDesk (HOI). The robot operates between two desks, tasked with picking up a hammer and placing it into a basket. Both the hammer and basket positions are randomized: hammer within $[ - 3 . 2 , - 2 . 4 ] \times [ - 3 . 1 5 , - 3 . 0 ]$ and basket within $[ - 3 . { \dot { 6 } } , - 2 . 0 ] \times [ - 0 . 3 , - 0 . 0 0 5 ]$ with yaw randomization. If the hammer falls to the ground, it is unrecoverable (training data does not contain ground-pickup demonstrations, and teleoperation-based ground retrieval exceeds current GMT capability boundaries), resulting in eventual timeout. Why leg-critical: The desktops are at standing height and spaced far enough apart that the robot must walk between the pickup and drop-off locations while carrying a grasped object. Whole-body coordination of locomotion, grasp stability, and target placement is essential; a fixed-station manipulator cannot cover the inter-desk distance. 

P&PBox (HOI). The robot picks up a box from a table and places it onto a shelving unit. Both the box and shelf positions are randomized. A dropped box does not cause immediate termination; the robot may attempt to recover if the box remains within reach. Success requires the box center to rest on a detected shelf support surface. Why leg-critical: The box pickup point (table) and placement target (shelf) are separated horizontally, requiring the robot to walk while holding the box. The shelf’s varied heights require the robot to adjust its stance and arm reach, combining locomotion with vertical manipulation. 

OpenDoor (HSI). The robot must approach and open an articulated door. The door position is randomized within a $[ - 0 . 7 5 4 , 0 . 5 5 ] \times [ - 0 . 8 , 0 . 1 ]$ XY range. The door uses articulation physics with configured joint friction properties. Success requires the robot’s root to pass through the door frame plane $( | x _ { \mathrm { l o c a l } } | \leq 0 . 5 5 \mathrm { m } , \bar { y } _ { \mathrm { l o c a l } } > 0 . 0 2 \mathrm { m }$ past the door) while maintaining an upright standing posture. Why leg-critical: Unlike fixed-base manipulation, successful door opening requires coordinated base placement, torso orientation, arm contact, and balance recovery under articulated contact forces. The robot must walk through the door while pushing, which demands lower-body locomotion integrated with upper-body manipulation. 

SitSofa (HSI). The robot navigates a living room environment and must sit on a sofa. Two carton obstacles are randomized in position as distractors. Success is determined when the robot’s pelvis or hip joint bodies make stable contact with the sofa seat surface. Why leg-critical: Success requires obstacle-aware navigation (lower body steers around cartons), precise body-to-sofa alignment (foot placement determines final seating position), and a controlled sitting transition that depends on coordinated leg flexion and torso rotation. A wheeled base cannot execute the sitting motion. 

Boxing (HSI). The robot stands before a punching bag and must strike a green spherical target mounted on the bag. The target’s position is randomized within a 0.15m radius cylinder around two predefined bag centers. Success is determined by the distance between the robot’s hand proxy links and the target center falling below a dynamic threshold computed from the asset’s bounding radius plus a hand-radius offset (0.08m). Why leg-critical: The target’s randomized height requires the robot to crouch for lower targets and reach high for elevated ones; arm-only motion is insufficient The dynamic hit-distance threshold depends on the target’s world-space bounding box, meaning the robot must coordinate whole-body posture to bring the hand near the target while maintaining balance on two feet. 

VisNavi (HSI). The robot must locate and walk into a target sign zone within a warehouse environment containing randomized obstacles. The target sign position is randomized with XY pose ranges, and six obstacles (two sets of three) are placed with configurable layout ranges. Success requires both feet to be within the target bounding box while the robot remains upright. Why leg-critical: The task demands egocentric visual navigation with lower-body steering through cluttered obstacle fields; foot placement accuracy directly determines whether both feet land inside the target zone. Static arm manipulation or a mobile-base abstraction cannot satisfy the dual-foot zone constraint. 

Implementation Note. To ensure reproducibility and maintain a consistent evaluation interface across tasks, HUMANOIDARENA adopts a modular task implementation. Task scenes and object layouts are specified under tasks/common_scene/, and environment configurations, including initialization ranges and task-level randomization settings, are defined under tasks/common_env_config/. The reward predicates and success/termination checks for each task are implemented in its corresponding mdp/rewards.py file. During evaluation, fall detection is handled uniformly in script/eval_scripts/*/sim_eval_vla.py, where a 60° torso-tilt thresh old is treated as a soft fall condition after 5-frame confirmation, while a 75° hard-tilt threshold or a 50N body-contact force under tilt triggers immediate termination. 

## B Data Collection Pipeline and Dataset Specification

This section describes the data collection pipeline and the resulting dataset specification. A core design principle of HUMANOIDARENA is that all demonstrations share a unified policy-facing canonical action space (the 40D intermediate whole-body action defined in §C), while the low-level execution dynamics differ depending on which GMT executes the action. This separation allows the benchmark to study whether high-level policies learn reusable whole-body intent (via the shared action interface) or overfit to tracker-specific dynamics (via cross-GMT evaluation). Switching the GMT backend under the same teleoperation interface yields multi-GMT datasets with identical policy-facing semantics but different tracking characteristics. 

## B.1 Collection Pipeline

Human demonstrations are collected through a shared upstream teleoperation pipeline, followed by backend-specific action interpretation inside Isaac Lab: 

• Shared capture and retargeting (both backends): The operator receives the humanoid’s egocentric video stream via PICO headset. Human motion is captured and retargeted through GMR to produce a 35D robot-space reference signal (mimic_obs), which is published to Redis for real-time consumption. 

• Backend-specific action interpretation: Inside Isaac Lab, the 35D mimic_obs is consumed by a backend-specific action provider — action_provider_wh_twist2 for the TWIST2 tracker, and action_provider_sonic for the SONIC tracker. Each provider interprets the shared 35D signal into executable G1 joint targets using its own policy (TWIST2: ONNX inference; SONIC: GEAR-SONIC encoder/decoder). The GMT then executes these targets in simulation. 

Within Isaac Lab, the action provider consumes poses from Redis, runs a pretrained policy, and drives the G1 humanoid robot. A RecordingManager buffers per-frame state and action data, serializing episodes into NPZ archives along with multi-camera RGB video. Teleoperation and data collection use a single egocentric front camera at 640×480 resolution; the multi-camera and camera depth recordings are generated during data re-recording and are available for training and inference. The high-level policy outputs at 50Hz for both backends; GMT-specific decimation aligns both to the same 50Hz control frequency for fair cross-GMT comparison. Data collection and teleoperation consistently operate at 50Hz. 

## B.2 Canonical State and Action Schema

All recorded demonstrations are normalized into the shared policy-facing interface defined in Appendix C. Specifically, each episode stores synchronized egocentric observations, a 64D canonical proprioceptive state, and a 40D intermediate whole-body action. The detailed state/action schema, coordinate conventions, canonical conversion procedure, and GMT-specific adapter mappings are described in Appendix C. 

## B.3 Dataset Statistics

Each task provides 100 successful demonstration episodes per GMT backend (TWIST2 and SONIC), totaling 200 episodes per task and 1,400 episodes across all tasks. Although the total demonstration duration may be modest relative to large-scale video pretraining corpora, each episode contains dense 50Hz whole-body state-action supervision, synchronized egocentric observations, and closed loop GMT-executed humanoid behavior. The dataset is therefore intended primarily for controlled evaluation of hierarchical whole-body policies rather than large-scale pretraining. 

## B.4 Dataset Format

Each recorded episode is stored as an NPZ archive containing per-frame arrays: front-camera RGB images (640×480, with additional multi-camera views available from re-recording), 64D canonical state, and 40D canonical action. Unless otherwise specified, all reported benchmark results use the front egocentric camera as the policy visual input. The NPZ archives are converted to LeRobotcompatible format using the conversion pipeline described below. Training, validation, and test splits are held constant across all evaluated policies and GMT backends. Only successful demonstrations are included in the training set. 

## B.5 Conversion Pipeline

Raw NPZ recordings are converted into LeRobot-compatible datasets using dedicated conversion tools. The canonical extraction helpers read existing canonical fields when available or reconstruct 64D state and 40D action from recorded joint arrays and root orientation. Cleaning tools filter invalid frames due to time discontinuities or held-action motion mismatches. A verification script cross-checks converted dataset rows against canonical arrays reconstructed from source recordings to detect conversion drift. 

For multi-camera datasets, re-recording tools replay NPZ episodes through Isaac Lab to generate additional viewpoint images. 

## C Intermediate Whole-Body Action Interface and GMT Adapters

This appendix defines the policy-facing canonical interface used throughout HUMANOIDARENA. All high-level policies observe the same 64D proprioceptive state and predict the same 40D intermediate whole-body action, irrespective of which GMT executes the motion. 


Table S2: Canonical 64D state and 40D intermediate whole-body action representation.


<table><tr><td>COMPONENT</td><td>DIMS</td><td>DESCRIPTION</td></tr><tr><td colspan="3">Observation State (64D)</td></tr><tr><td>ROOT_ROT6D</td><td>6</td><td>ROOT ORIENTATION IN 6D CONTINUOUS ROTATION</td></tr><tr><td>DOF_POS</td><td>29</td><td>JOINT POSITIONS FOR 29-DOF WHOLE-BODY G1</td></tr><tr><td>DOF_VEL</td><td>29</td><td>JOINT VELOCITIES</td></tr><tr><td colspan="3">Intermediate Whole-Body Action (40D)</td></tr><tr><td>ROOT_XY_DELTA</td><td>2</td><td>ROOT TRANSLATION IN XY AXIS</td></tr><tr><td>ROOT_Z</td><td>1</td><td>ROOT-HEIGHT TARGET</td></tr><tr><td>ROOT_ROT6D</td><td>6</td><td>TARGET ROOT ORIENTATION IN 6D CONTINUOUS ROTATION</td></tr><tr><td>JOINT_POS</td><td>29</td><td>TARGET JOINT POSITIONS</td></tr><tr><td>HAND_BINARY</td><td>2</td><td>LEFT/RIGHT HAND OPEN-CLOSE COMMANDS</td></tr></table>

The 40D action is intentionally structured: it encodes coordinated whole-body intent (root motion, joint targets, hands) while remaining compact enough for visuomotor policy learning. It delegates dynamic feasibility and fast stabilization to the low-level GMT rather than requiring the policy to predict torque-level commands. 

Canonical conversion. During demonstration collection and policy rollout, the reference signal from the teleoperation pipeline is normalized into the canonical interface. The conversion runs through action_provider/vla_smpl_runtime.py: 

• build_vla_observation_state() constructs the 64D proprioceptive state from root orientation, joint positions, and joint velocities. 

• build_vla_action() constructs the 40D intermediate action from root motion, orientation, joint targets, and hand commands. 

• UnifiedSMPLActionRuntime lifts tracker-specific or teleoperation-specific references into the shared canonical space when needed. 

With this conversion, policies trained on demonstrations collected with different GMTs observe and produce identical state and action formats. 

GMT adapters. Each GMT exposes a different execution interface. A GMT-specific adapter $\psi _ { m }$ maps the canonical 40D action $u _ { t }$ into the reference format required by GMT $G ^ { ( m ) }$ , producing executable G1 joint-position targets $q _ { t + 1 } ^ { ( m ) } = G ^ { ( m ) } ( \psi _ { m } ( u _ { t } ) )$ . The adapter changes only the actionto-tracker mapping; the high-level policy, observation space, and canonical action space remain unchanged across GMT backends. This design makes in-GMT and cross-GMT evaluation welldefined: cross-GMT deployment replaces only the adapter and low-level tracker, while keeping the trained policy and its output space fixed. 

HUMANOIDARENA currently instantiates two GMT backends. The TWIST2 adapter maps the canonical 40D action into a mimic-style tracking command for TWIST2’s ONNX policy. The SONIC adapter maps the same 40D action into the reference format required by the SONIC execution stack, which uses a GEAR-SONIC encoder/decoder pair for tracking. Both backends consume the same upstream 35D mimic_obs signal produced by the shared GMR retargeting pipeline (§B), ensuring consistent canonical conversion and enabling fair cross-GMT comparison. 

Implementation Note. The canonical runtime is implemented in action_provider/vla_smpl_runtime.py. The dataset-level conversion pipeline lives under tools/data_tools/, including twist2lerobot_64_40.py, sonic2lerobot_64_40.py, and shared helpers in smpl_lerobot_common.py. 

## D Evaluation Protocols and Perturbation Design

This section specifies the evaluation protocol, the three perturbation axes used for robustness testing, the in-GMT and cross-GMT deployment protocols, and the complete evaluation coverage matrix. All protocols ensure that different policies and backends are compared under identical rollout seeds, held-out object configurations, and initial robot states. 

## D.1 Evaluation Protocol

All models are evaluated under a consistent protocol: each model is tested with $N _ { \mathrm { s e e d s } } = 3$ random seeds, each seed running $N _ { \mathrm { r e p e a t s } } = 2 0$ repeated trials, totaling 60 episodes per configuration. The simulation uses persistent mode (persistent_sim = true) where the Isaac Lab environment is created once and reset between episodes. Episode seeds are derived deterministically as sha256(task_name|group_seed|repeat_idx). Success is defined as a binary reward: 1 if the taskspecific success condition is met (as defined in §A, Table S1), 0 otherwise. In addition to success rate, we report average fall rate (AFR) as a stability metric. 

## D.2 In-GMT and Cross-GMT Evaluation

HUMANOIDARENA supports two GMT deployment protocols that test the generalization of learned high-level policies across execution backends: 

• In-GMT (matched): The high-level policy is trained on demonstrations collected and executed with GMT-A and evaluated with the same GMT-A. This measures standard task performance under a matched data-collection and execution backend. 

• Cross-GMT (transferred): The high-level policy is trained on GMT-A demonstrations but deployed with GMT-B. This measures whether the intermediate whole-body action representation transfers across execution backends. 

## D.3 Test Modes

We define four test modes that systematically vary different axes of perturbation while keeping the evaluation protocol identical. Each perturbation axis is designed to change the target test variable without altering the task’s underlying semantics: 


Table S3: Four test settings and their perturbation dimensions


<table><tr><td>MODE</td><td>OBJECT POSE RANGE</td><td>ASSET</td><td>LIGHTING</td></tr><tr><td>BASE TEST</td><td>TRAINING RANGE</td><td>ORIGINAL</td><td>DOMELIGHT (UNIFORM)</td></tr><tr><td>EXECUTION TEST</td><td>Expanded</td><td>ORIGINAL</td><td>DOMELIGHT (UNIFORM)</td></tr><tr><td>SEMANTIC TEST</td><td>TRAINING RANGE</td><td>Replaced USD</td><td>DOMELIGHT (UNIFORM)</td></tr><tr><td>VISUAL TEST</td><td>TRAINING RANGE</td><td>ORIGINAL</td><td>DistantLight + random rotation</td></tr></table>

## D.4 Execution Test: Expanded Pose Randomization

The execution test increases the randomization range of object positions beyond the training distribution. For each task, the deterministic_object_resets[].pose_range is widened in the execution YAML config relative to the base test. For example, the football task’s ball XY range expands from [−1.2, 1.2] to [−1.45, 1.45], and the door position expands from x ∈ [−0.754, 0.55] to [−0.9, 0.66]. All other parameters (control frequency, decimation, physics properties) remain identical to base test. 

## D.5 Semantic Test: Asset Replacement

We use “semantic” in the benchmark sense of semantics-preserving asset substitution: the task goal and affordance remain unchanged while the visual instance, shape, or distractor configuration varies. The test evaluates robustness to appearance, geometry, and scene-clutter variations by substituting specific scene assets with pre-built variant USD files. 

The semantic variants fall into three categories: (i) geometry-preserving appearance variants where textures or colors are modified while geometry remains unchanged (OpenDoor door, Football goal net, SitSofa/DoubleDesk room walls); (ii) affordance-preserving geometry variants where the object shape changes but the functional affordance and comparable physical extent are preserved (Boxing: green sphere → green cube of equal bounding extent); (iii) scene-clutter distractor variants where additional non-target objects are introduced to test robustness under scene clutter while preserving the target goal (P&PBox: distractor objects on the desk surface). 

Asset overrides are specified in YAML test configurations using the environment configuration loader. The loader traverses the config object hierarchy and sets the asset’s usd_path attribute. No code changes are required in the evaluation pipeline — semantic testing is purely configuration-driven. All YAML configs reside under tasks/common_test_config/semantic/. 


Table S4: Semantic asset substitutions across the 7 tasks.


<table><tr><td>TASK</td><td>SCENE ATTRIBUTE</td><td>SEMANTIC VARIANT</td></tr><tr><td>FOOTBALL</td><td>goal_net</td><td>ORIGINAL GOAL → TEXTURE-MODIFIED GOAL</td></tr><tr><td>DOUBLEDESK</td><td>room_walls</td><td>ORIGINAL ROOM → TEXTURE-MODIFIED ROOM</td></tr><tr><td>P&amp;PBOX</td><td>room_walls</td><td>ORIGINAL ROOM → ROOM WITH DISTRACTOR OBJECTS</td></tr><tr><td>OPENDOOR</td><td>door</td><td>ORIGINAL DOOR → TEXTURED VARIANT</td></tr><tr><td>SITSOFA</td><td>room_walls</td><td>ORIGINAL ROOM → TEXTURE-MODIFIED ROOM</td></tr><tr><td>BOXING</td><td>boxing_target</td><td>GREEN SPHERE → GREEN CUBE</td></tr><tr><td>VISNAVI</td><td>target_sign</td><td>WET FLOOR SIGN → SEMANTIC VARIANT</td></tr></table>

## D.6 Visual Test: Lighting Randomization

The visual test evaluates robustness to illumination variations. The default DomeLight (uniform ambient illumination) is replaced at runtime with a DistantLight (directional light source) whose pose and intensity are randomized per episode. 

• Light Replacement: After simulator initialization, the existing DomeLight prim at /World/light is deleted and a DistantLight is created with default parameters: position (−4, −1, 18), intensity 5000, angle 15<sup>◦</sup>, color (0.75, 0.75, 0.75). 

• Per-Episode Randomization: Before each episode reset, the DistantLight parameters are deterministically randomized using the episode seed: 

– Rotation: pitch $\sim \mathcal { U } ( - 2 0 ^ { \circ } , + 2 0 ^ { \circ } )$ , roll $\sim \mathcal { U } ( - 2 0 ^ { \circ } , + 2 0 ^ { \circ } )$ , yaw fixed at 0<sup>◦</sup>. 

– Intensity: ∼ U(3000, 7000). 

– Color: RGB each channel ∼ U(0.65, 0.85). 

The DistantLight’s directional nature means that rotating the light changes shadow directions, highlight positions, and overall scene contrast, testing the model’s robustness to lighting variations without changing the physical task configuration. Implementation resides in tools/augmentation_utils.py (light replacement and randomization) and tasks/common_runtime/env_runtime_hooks.py (per-episode integration). 


Table S5: Evaluation matrix. <sup>✓</sup> = completed, N.E. = not evaluated for the listed mode.


<table><tr><td>CONFIGURATION</td><td>BASE TEST</td><td>EXECUTION</td><td>SEMANTIC</td><td>VISUAL</td></tr><tr><td>IN-GMT TWIST2</td><td><eq>\surd (7 \text{ tasks})</eq></td><td><eq>\surd (7)</eq></td><td><eq>\surd (7)</eq></td><td><eq>\surd (7)</eq></td></tr><tr><td>IN-GMT SONIC</td><td><eq>\surd (7 \text{ tasks})</eq></td><td><eq>\surd (7)</eq></td><td><eq>\surd (7)</eq></td><td><eq>\surd (7)</eq></td></tr><tr><td>CROSS-GMT (TWIST2 <eq>\rightarrow</eq> SONIC)</td><td><eq>\surd (7 \text{ tasks})</eq></td><td>N.E.</td><td>N.E.</td><td>N.E.</td></tr><tr><td>CROSS-GMT (SONIC <eq>\rightarrow</eq> TWIST2)</td><td><eq>\surd (7 \text{ tasks})</eq></td><td>N.E.</td><td>N.E.</td><td>N.E.</td></tr></table>

## D.7 Evaluation Matrix

Table S5 summarizes the complete evaluation coverage. All results use 3 seeds × 20 repeats = 60 episodes per entry. In-GMT denotes matched training and evaluation with the same backend; Cross-GMT denotes training on one backend’s demonstrations and deployment on the other. 

## E Additional Experiments and Rollout Analysis

## E.1 Predicted Action Distributions under Cross-GMT Observations

This section provides a qualitative analysis of why cross-GMT deployment is challenging. We ask whether a fixed policy produces similar whole-body actions when conditioned on observations collected with different general motion trackers (GMTs). Instead of visualizing ground-truth dataset actions, we visualize policy-predicted actions: each point corresponds to a 40D action predicted by a task-specific diffusion policy from one sampled egocentric observation. The policy input contains the front RGB image and the 64D proprioceptive state, while the t-SNE embedding is computed only from the predicted 40D action after policy post-processing. 

For each task and each diffusion policy, we sample 1,000 SONIC observations and 1,000 TWIST2 observations, using 10 uniformly spaced frames from each of the 100 episodes per source. We run the same inference pipeline as the HTTP policy server, including image preprocessing, policy normalization, post-processing, and action unnormalization. For diffusion policies, we use the first action from the predicted action chunk as the immediate policy output, avoiding the stateful action queue used during online select_action inference. 

Figures S8 and S9 show the predicted-action distributions of SONIC-trained and TWIST2-trained diffusion policies, respectively. Each subplot fixes one task-specific policy and compares actions induced by SONIC versus TWIST2 observations. Overlapping colors indicate that the policy maps both observation sources to similar regions of the action space, whereas separated clusters indicate a GMT-dependent shift in the predicted whole-body action distribution. Since t-SNE is fitted independently per subplot, the coordinates should only be interpreted within each subplot; absolute positions are not comparable across tasks or policies. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/48592003f63b7b99fd4cdd71f97139207e4d77ab940154b0285d3f448c024687.jpg)



Figure S8: SONIC-trained diffusion policies. t-SNE visualization of predicted 40D actions on the seven benchmark tasks. Blue and orange points denote actions induced by SONIC and TWIST2 observations, respectively, using 1,000 samples per source. Larger color separation indicates a stronger GMT-dependent shift in the immediate action distribution.


The visualized distributions show that SONIC and TWIST2 observations often form source-specific regions in the predicted action space, especially in tasks involving locomotion, contact, and wholebody coordination. This pattern is consistent with the cross-GMT rollout degradation reported in the benchmark: observations collected through different GMTs are not interchangeable inputs for a fixed policy. Instead, changing the GMT shifts the coupled image–proprioception distribution and leads the same policy to produce different immediate control outputs. These t-SNE results therefore provide qualitative evidence that the SONIC–TWIST2 gap appears not only at the execution-interface level, but also in the policy-predicted action distribution. 

## F Policy Implementations and Training Details

All policy baselines are implemented and trained on the LeRobot platform under a unified experimental pipeline. As summarized in Table S6, we report the main implementation and training configurations for ACT, Diffusion Policy, Flow Matching, and $\pi _ { 0 . 5 } ,$ covering model initialization, optimization settings, temporal prediction design, image preprocessing, training schedule, and numerical precision. To ensure a fair comparison, these baselines are trained with consistent settings whenever applicable, including the same observation length, action chunk length, inference action length, batch size, training steps, and random seed. Meanwhile, we retain the model-specific configurations required by each policy architecture, such as backbone initialization, learning rate, policy horizon, optimization objective, preprocessing pipeline, and precision format. This unified yet architecture-aware setup allows different policy baselines to be compared under controlled training conditions while preserving their standard implementation characteristics. 


Predicted Action t-SNE: TWIST2-trained Diffusion Policy


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/a8ab3d14721e151bfa91b5a762a55fa1e10657802b7105862323a2a6d303f361.jpg)



Figure S9: TWIST2-trained diffusion policies. t-SNE visualization of predicted 40D actions on the seven benchmark tasks. Blue and orange points denote actions induced by SONIC and TWIST2 observations, respectively, using 1,000 samples per source. Stronger separation provides qualitative evidence of a larger GMT-dependent shift in the policy-predicted action distribution.



Table S6: Training configurations of policy baselines. We summarize the key implementation and training settings used for ACT, Diffusion Policy, Flow Matching, and $\pi _ { 0 . 5 }$


<table><tr><td>Configuration</td><td>ACT</td><td>Diffusion Policy</td><td>Flow Matching</td><td><eq>\pi_{0.5}</eq></td></tr><tr><td>Initialization</td><td>ResNet-18</td><td>ResNet-18</td><td>CLIP ViT-B/16</td><td><eq>\pi_{0.5}</eq> base checkpoint</td></tr><tr><td>Objective</td><td>-</td><td>-</td><td>Flow matching</td><td>-</td></tr><tr><td>Observation steps</td><td>1</td><td>1</td><td>1</td><td>1</td></tr><tr><td>Action chunk length</td><td>20</td><td>20</td><td>20</td><td>20</td></tr><tr><td>Policy horizon</td><td>-</td><td>24</td><td>40</td><td>-</td></tr><tr><td>Inference action steps</td><td>20</td><td>20</td><td>20</td><td>20</td></tr><tr><td>Image preprocessing</td><td>Resize + padding</td><td>Resize + padding</td><td>Resize + padding</td><td>Image transform enabled</td></tr><tr><td>Input image size</td><td><eq>224 \times 224</eq></td><td><eq>224 \times 224</eq></td><td><eq>224 \times 224</eq></td><td>-</td></tr><tr><td>Learning rate</td><td><eq>1.0 \times 10^{-5}</eq></td><td><eq>1.0 \times 10^{-4}</eq></td><td><eq>2.0 \times 10^{-5}</eq></td><td><eq>2.5 \times 10^{-5}</eq></td></tr><tr><td>Batch size</td><td>64</td><td>64</td><td>64</td><td>64</td></tr><tr><td>Training steps</td><td>100K</td><td>100K</td><td>100K</td><td>100K</td></tr><tr><td>Random seed</td><td>42</td><td>42</td><td>42</td><td>42</td></tr><tr><td>Precision</td><td>float32</td><td>float32</td><td>float32</td><td>bfloat16</td></tr></table>

## G Failure Mode Analysis

This section analyses representative failure modes in HUMANOIDARENA. While the main text reports task success rate and average fall rate, these aggregate metrics do not fully explain where a hierarchical humanoid policy succeeds or fails. In HUMANOIDARENA, a rollout may fail because the high-level policy misinterprets the egocentric scene, fails to align the body with the task-relevant object, predicts an intermediate whole-body action that is difficult for the selected GMT to execute, or makes contact with the environment in a physically ineffective way. We therefore analyse failures at the level of rollout phases: perception and target localization, approach and body alignment, pre-contact posture preparation, contact execution, post-contact recovery, and final task completion. 

## G.1 Failure Taxonomy

We organize failures according to the stage of the hierarchical whole-body interaction pipeline at which task progress breaks down. 

Perception and target-localization failure. The policy fails to localize the task-relevant object or scene region from egocentric observations. For Football, this may appear as walking toward an incorrect direction, losing the ball after body rotation, or failing to maintain both the ball and goal in the effective field of view. 

Approach and body-alignment failure. The policy identifies the correct target but fails to bring the humanoid body into a useful interaction pose. For kicking, this includes incorrect root position relative to the ball, poor support-foot placement, or torso orientation that prevents a directed swing-leg trajectory. 

Pre-contact posture failure. The robot approaches the object but does not form a stable pre-contact posture. In Football, the robot must coordinate root displacement, support-leg balance, and swing-leg preparation. A rollout may remain upright but still fail to produce a posture from which a strong and well-directed kick is feasible. 

Contact-execution failure. The robot reaches the object but the physical contact does not produce the desired task effect. For Football, this includes weak impact, off-center foot–ball contact, incorrect kick direction, or insufficient momentum transfer. This failure mode is particularly important for leg-critical tasks because task success depends not only on reaching the object, but also on generating a physically meaningful contact event. 

Post-contact recovery failure. After an imperfect contact, the robot may need to re-localize the object, recover balance, and continue task execution. A policy that can recover from a partial contact failure demonstrates stronger closed-loop competence than one that becomes stuck after the first unsuccessful attempt. 

Tracker-induced execution failure. In cross-GMT settings, the same 40D canonical action may be realized differently by different GMT-specific adapters and low-level trackers. The resulting motion can differ in root displacement, swing-leg timing, torso stabilization, or egocentric camera motion, leading to task failure even when the high-level action encodes a plausible task intent. 

## G.2 Football Case Study: Recoverable Contact-Execution Failure

Figure S10 shows a representative Football rollout. The sequence illustrates a recoverable contactexecution failure: the robot initially approaches the ball and attempts a kick, but the first contact does not send the ball far enough to enter the goal. Instead of terminating, falling, or remaining idle, the policy continues to track the updated ball position, moves closer, re-aligns its body and feet, and performs a second kick that completes the task. 

Stage 1: target localization. At the beginning of the rollout, the ball and goal are visible from the robot’s egocentric view. The policy initiates forward movement toward the task-relevant object, indicating that the rollout does not fail at the initial perception or target-grounding stage. 

Stage 2: first approach and kick attempt. The robot walks toward the ball and forms a kicking posture. This phase requires coordinated root displacement, support-foot placement, torso stabilization, and swing-leg preparation. The behavior demonstrates that the high-level policy has learned a plausible approach-and-kick pattern from the demonstration data. 

Stage 3: partial contact failure. The first kick contacts the ball but does not complete the task. The ball moves forward but stops between the robot and the goal. This is not a pure perception failure, because the robot has reached the correct object and produced meaningful task progress. Instead, it is better categorized as a contact-execution failure: the contact direction, impact strength, or swing timing is insufficient for the ball to satisfy the goal predicate. 

![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/2026913d1095eae81a1b8d3abdcf9f691694d3130deace07b04ff14960e85aed.jpg)



(a) Initial scene


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/53d372031bbe0831e01d4cc0ed5183496bfa69fbe9886a6cc7e9412815f8f17e.jpg)



(b) First approach


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/37fe63abce0dc624695e7ad724be6193b2e6df8d3d51fe76b2211a6d2cd9a661.jpg)



(c) Partial failure


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/774920e862162e8262460fd7fe84fc3db6e8176ce2595cf2ddfff45079d7b670.jpg)



(d) Re-approach


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/0dc38a3374fab50dca812e20975a154a8b7873749bc60952d10e6f7e3d49bbba.jpg)



(e) Pre-kick alignment


![image](https://cdn-mineru.openxlab.org.cn/result/2026-07-13/5f693445-c446-47b8-9820-1f0e8b5aa02b/10df67165913dbbabe81f3043b5160560dc7668cd9b02e4055db2451343df678.jpg)



(f) Successful second kick



Figure S10: Football failure-and-recovery rollout. The robot first observes the ball and goal, approaches the ball, and attempts an initial kick. The first contact is physically ineffective: the ball moves forward but does not travel far enough to enter the goal. The policy then continues the task by re-localizing the updated ball position, reducing the distance to the ball, aligning its body and feet before contact, and executing a second kick that sends the ball into the goal. This example shows that some HUMANOIDARENA failures are phase-level and recoverable, rather than immediately terminal.


Stage 4: recovery and re-approach. After the unsuccessful kick, the robot does not remain fixed at the old ball location. It continues to move toward the new ball position. This behavior suggests that the high-level policy has learned a closed-loop recovery pattern from the demonstration distribution: when the first interaction does not finish the task, the robot can re-localize the object and continue acting on the updated scene state. 

Stage 5: pre-contact re-alignment. Before the second kick, the robot reduces its distance to the ball and re-aligns its body. This stage is important because leg-object interaction depends strongly on the relative pose between the root, support foot, swing leg, ball, and goal. The policy does not simply repeat the previous action; it adjusts the approach based on the changed ball position. 

Stage 6: successful second contact. The second kick sends the ball into the goal. This final stage indicates that the rollout contains a recoverable failure rather than an unrecoverable collapse. The policy preserves task intent after the first imperfect contact, while the GMT maintains sufficient balance and whole-body feasibility to support another attempt. 

## G.3 Implications for Hierarchical Whole-Body Learning

The failure taxonomy reveals that leg-critical HOI/HSI tasks expose diagnostic signals beyond binary success. A policy may demonstrate competent target localization and approach behavior while still failing at contact execution (e.g., Football’s timing-critical kick). Binary success hides this intermediate competence, which is valuable for understanding where a hierarchical policy breaks down. Recoverable failures — where the robot re-approaches after an imperfect contact — further indicate that the policy is not replaying a fixed trajectory but conditioning on updated observations. 

## G.4 Relation to Other Failure Modes

The same rollout can transition between failure categories. A perception error (losing the ball) may lead to an approach failure (incorrect foot placement), which then produces a contact failure (weak kick). HUMANOIDARENA’s perturbation axes help isolate these: visual perturbations primarily stress perception; execution perturbations stress alignment and contact; semantic perturbations stress target grounding. The behavior-level taxonomy above provides a consistent framework for mapping quantitative signals (timeout/fall/visual-decline) to the underlying failure stage. 

## H Reproducibility and Release Details

Data collection. All demonstration data are collected in Isaac Lab through teleoperated control. During collection, the operator receives the humanoid’s egocentric visual stream and controls the robot in closed loop; the resulting trajectories are recorded with synchronized observations, proprioceptive states, intermediate whole-body actions, task metadata, and GMT backend information. 

Compute resources. All policy models are trained on an 8-GPU NVIDIA H200 server. Validation and benchmark evaluation are performed on a 16-GPU NVIDIA RTX 4090 server. We use the RTX 4090 server for evaluation because our Isaac Lab evaluation pipeline requires graphical rendering, which is not available on the H-series training nodes in our compute environment. 

Assets and licenses. The paper cites and credits existing assets, including Isaac Lab (BSD-3-Clause, with Isaac Sim subject to NVIDIA Isaac Sim terms), Unitree simulation/G1-related resources (Apache-2.0 where derived from unitree_sim_isaaclab), GMR (MIT), TWIST2 (MIT), SONIC/GR00T-WholeBodyControl (Apache-2.0), LeRobot and Unitree-LeRobot components (Apache-2.0), ACT and Diffusion Policy baselines (MIT), Flow Matching implementations based on LeRobot or related open implementations (Apache-2.0 where applicable), π<sub>0.5</sub>/OpenPI code (Apache-2.0), XRoboToolkit teleoperation components used in the data stream (MIT), and Synthesis/Extwin scene assets, which are tracked through an asset manifest and redistributed only when permitted by the corresponding asset license or terms of use. 

## I More Results

Table S7 reports the full perturbation results for in-GMT evaluation, including per-task success rates under the in-distribution, visual, semantic, and execution settings. These results complement the suite-level robustness profiles in Figure 3 and provide detailed task-level evidence for the analysis in Section 4.2. 

Table S8 further studies whether the shared intermediate whole-body action interface enables dataset transfer across tasks and GMT backends. Compared with the base in-GMT results in Table S7, merged training brings clear gains in several settings. Under TWIST2×7, DP improves from 35.56±18.63% to 38.89±20.25% on HOI, and more substantially from 55.83±18.58% to 73.33±23.48% on HSI. π also improves on TWIST2 HSI from 38.33±20.14% to 55.00±25.50%. Under SONIC×7, π improves its HSI average from 58.33±20.85% to 65.42±21.06%. These results suggest that the canonical action interface can reuse task-level whole-body intent across tasks, supporting effective dataset transfer beyond isolated task training. 

However, the gains are not uniform. For example, SONIC×7 reduces DP on HOI from 52.22±17.97% to 29.44±23.27%, and TWIST2+SONIC×14 improves DP on HSI to 68.12±23.00% but leaves HOI at 31.67±26.11%. We attribute these drops to GMT-conditioned action distribution mismatch. Although different GMT datasets share the same 40D action space, TWIST2 [11] and SONIC [12] differ in tracking capability, motion priors, stabilization behavior, and contact response. During closed-loop teleoperation, operators therefore rely on different corrective motions, foot placements, body postures, and contact timings to complete the same task. Such GMT-specific realizations have a stronger effect on contact-rich HOI tasks, where small execution differences can affect grasp stability, kicking timing, and object-contact effectiveness. Overall, merge-all training demonstrates that the shared intermediate action interface provides a practical basis for dataset transfer, while revealing how GMT-conditioned execution diversity shapes the effectiveness of multi-GMT policy learning. 


Table S7: In-GMT evaluation. We evaluate high-level policy baselines with matched training and deployment GMTs, using either TWIST2 or SONIC as the low-level execution backend. Results are reported as success rate (SR, ↑; mean ± standard deviation) on the in-distribution setting and the visual, semantic, and execution generalization splits. AVG denotes the average performance within each HOI or HSI task suite. The best and second-best SRs for each task and suite average under the same GMT and evaluation split are highlighted in bold and underlined, respectively.


<table><tr><td rowspan="2">Difficulty</td><td rowspan="2">Method</td><td rowspan="2">AFR(↓)</td><td colspan="4">HOI</td><td colspan="5">HSI</td></tr><tr><td>FOOTBALL</td><td>DOUBLEDESK</td><td>P&amp;PBOX</td><td>AVG</td><td>OPENDOOR</td><td>SITSOFA</td><td>BOXING</td><td>VISNAVI</td><td>AVG</td></tr><tr><td colspan="12">TWIST2</td></tr><tr><td rowspan="4">Base</td><td>ACT [45]</td><td>6.43%</td><td><eq>26.7 \pm 6.2\%</eq></td><td><eq>15.0 \pm 8.2\%</eq></td><td><eq>43.3 \pm 8.5\%</eq></td><td><eq>28.33 \pm 13.94\%</eq></td><td><eq>50.0 \pm 4.1\%</eq></td><td><eq>66.7 \pm 10.3\%</eq></td><td><eq>58.3 \pm 10.3\%</eq></td><td><eq>13.3 \pm 4.7\%</eq></td><td><eq>47.08 \pm 21.84\%</eq></td></tr><tr><td>DP [46]</td><td>10.48%</td><td><eq>46.7 \pm 6.2\%</eq></td><td><eq>10.0 \pm 4.1\%</eq></td><td><eq>50.0 \pm 0.0\%</eq></td><td><eq>35.56 \pm 18.63\%</eq></td><td><eq>68.3 \pm 6.2\%</eq></td><td><eq>73.3 \pm 6.2\%</eq></td><td><eq>51.7 \pm 11.8\%</eq></td><td><eq>30.0 \pm 4.1\%</eq></td><td><eq>55.83 \pm 18.58\%</eq></td></tr><tr><td>FM [47]</td><td>7.38%</td><td><eq>53.3 \pm 8.5\%</eq></td><td><eq>16.7 \pm 8.5\%</eq></td><td><eq>38.3 \pm 8.5\%</eq></td><td><eq>36.11 \pm 17.28\%</eq></td><td><eq>76.7 \pm 2.4\%</eq></td><td><eq>68.3 \pm 6.2\%</eq></td><td><eq>63.3 \pm 9.4\%</eq></td><td><eq>26.7 \pm 20.9\%</eq></td><td><eq>58.75 \pm 22.56\%</eq></td></tr><tr><td><eq>π_{0.5}</eq>[7]</td><td>3.33%</td><td><eq>26.7 \pm 4.7\%</eq></td><td><eq>1.7 \pm 2.4\%</eq></td><td><eq>46.7 \pm 8.5\%</eq></td><td><eq>25.00 \pm 19.29\%</eq></td><td><eq>28.3 \pm 9.4\%</eq></td><td><eq>60.0 \pm 4.1\%</eq></td><td><eq>51.7 \pm 8.5\%</eq></td><td><eq>13.3 \pm 8.5\%</eq></td><td><eq>38.33 \pm 20.14\%</eq></td></tr><tr><td rowspan="4">Visual</td><td>ACT [45]</td><td>6.67%</td><td><eq>15.0 \pm 8.2\%</eq></td><td><eq>0.0 \pm 0.0\%</eq></td><td><eq>28.3 \pm 2.4\%</eq></td><td><eq>14.44 \pm 12.57\%</eq></td><td><eq>43.3 \pm 2.4\%</eq></td><td><eq>51.7 \pm 8.5\%</eq></td><td><eq>63.3 \pm 6.2\%</eq></td><td><eq>23.3 \pm 12.5\%</eq></td><td><eq>45.42 \pm 16.77\%</eq></td></tr><tr><td>DP [46]</td><td>12.38%</td><td><eq>40.0 \pm 7.1\%</eq></td><td><eq>8.3 \pm 8.5\%</eq></td><td><eq>41.7 \pm 6.2\%</eq></td><td><eq>30.00 \pm 17.00\%</eq></td><td><eq>68.3 \pm 4.7\%</eq></td><td><eq>78.3 \pm 2.4\%</eq></td><td><eq>51.7 \pm 8.5\%</eq></td><td><eq>25.0 \pm 4.1\%</eq></td><td><eq>55.83 \pm 20.90\%</eq></td></tr><tr><td>FM [47]</td><td>9.05%</td><td><eq>26.7 \pm 4.7\%</eq></td><td><eq>5.0 \pm 4.1\%</eq></td><td><eq>23.3 \pm 6.2\%</eq></td><td><eq>18.33 \pm 10.80\%</eq></td><td><eq>65.0 \pm 10.8\%</eq></td><td><eq>53.3 \pm 6.2\%</eq></td><td><eq>56.7 \pm 18.9\%</eq></td><td><eq>30.0 \pm 10.8\%</eq></td><td><eq>51.25 \pm 18.04\%</eq></td></tr><tr><td><eq>π_{0.5}</eq>[7]</td><td>1.67%</td><td><eq>25.0 \pm 4.1\%</eq></td><td><eq>1.7 \pm 2.4\%</eq></td><td><eq>33.3 \pm 11.8\%</eq></td><td><eq>20.00 \pm 15.28\%</eq></td><td><eq>31.7 \pm 2.4\%</eq></td><td><eq>43.3 \pm 10.3\%</eq></td><td><eq>43.3 \pm 13.1\%</eq></td><td><eq>5.0 \pm 4.1\%</eq></td><td><eq>30.83 \pm 17.89\%</eq></td></tr><tr><td rowspan="4">Semantic</td><td>ACT [45]</td><td>4.29%</td><td><eq>20.0 \pm 4.1\%</eq></td><td><eq>6.7 \pm 2.4\%</eq></td><td><eq>35.0 \pm 8.2\%</eq></td><td><eq>20.56 \pm 12.79\%</eq></td><td><eq>46.7 \pm 8.5\%</eq></td><td><eq>51.7 \pm 17.0\%</eq></td><td><eq>61.7 \pm 11.8\%</eq></td><td><eq>33.3 \pm 15.5\%</eq></td><td><eq>48.33 \pm 17.00\%</eq></td></tr><tr><td>DP [46]</td><td>6.43%</td><td><eq>50.0 \pm 0.0\%</eq></td><td><eq>16.7 \pm 4.7\%</eq></td><td><eq>46.7 \pm 6.2\%</eq></td><td><eq>37.78 \pm 15.65\%</eq></td><td><eq>56.7 \pm 9.4\%</eq></td><td><eq>75.0 \pm 10.8\%</eq></td><td><eq>60.0 \pm 4.1\%</eq></td><td><eq>40.0 \pm 8.2\%</eq></td><td><eq>57.92 \pm 15.06\%</eq></td></tr><tr><td>FM [47]</td><td>7.14%</td><td><eq>58.3 \pm 6.2\%</eq></td><td><eq>8.3 \pm 2.4\%</eq></td><td><eq>43.3 \pm 4.7\%</eq></td><td><eq>36.67 \pm 21.47\%</eq></td><td><eq>23.3 \pm 13.1\%</eq></td><td><eq>66.7 \pm 8.5\%</eq></td><td><eq>60.0 \pm 10.8\%</eq></td><td><eq>20.0 \pm 14.1\%</eq></td><td><eq>42.50 \pm 24.11\%</eq></td></tr><tr><td><eq>π_{0.5}</eq>[7]</td><td>1.43%</td><td><eq>13.3 \pm 9.4\%</eq></td><td><eq>0.0 \pm 0.0\%</eq></td><td><eq>61.7 \pm 12.5\%</eq></td><td><eq>25.00 \pm 27.99\%</eq></td><td><eq>6.7 \pm 2.4\%</eq></td><td><eq>50.0 \pm 4.1\%</eq></td><td><eq>55.0 \pm 4.1\%</eq></td><td><eq>16.7 \pm 9.4\%</eq></td><td><eq>32.08 \pm 21.55\%</eq></td></tr><tr><td rowspan="4">Execution</td><td>ACT [45]</td><td>5.71%</td><td><eq>26.7 \pm 13.1\%</eq></td><td><eq>13.3 \pm 2.4\%</eq></td><td><eq>33.3 \pm 13.1\%</eq></td><td><eq>24.44 \pm 13.63\%</eq></td><td><eq>48.3 \pm 15.5\%</eq></td><td><eq>65.0 \pm 4.1\%</eq></td><td><eq>55.0 \pm 12.2\%</eq></td><td><eq>35.0 \pm 10.8\%</eq></td><td><eq>50.83 \pm 15.79\%</eq></td></tr><tr><td>DP [46]</td><td>8.33%</td><td><eq>43.3 \pm 4.7\%</eq></td><td><eq>8.3 \pm 4.7\%</eq></td><td><eq>45.0 \pm 4.1\%</eq></td><td><eq>32.22 \pm 17.50\%</eq></td><td><eq>63.3 \pm 6.2\%</eq></td><td><eq>60.0 \pm 10.8\%</eq></td><td><eq>48.3 \pm 10.3\%</eq></td><td><eq>36.7 \pm 13.1\%</eq></td><td><eq>52.08 \pm 14.78\%</eq></td></tr><tr><td>FM [47]</td><td>6.67%</td><td><eq>41.7 \pm 6.2\%</eq></td><td><eq>13.3 \pm 4.7\%</eq></td><td><eq>33.3 \pm 6.2\%</eq></td><td><eq>29.44 \pm 13.22\%</eq></td><td><eq>80.0 \pm 8.2\%</eq></td><td><eq>76.7 \pm 8.5\%</eq></td><td><eq>58.3 \pm 13.1\%</eq></td><td><eq>23.3 \pm 9.4\%</eq></td><td><eq>59.58 \pm 24.62\%</eq></td></tr><tr><td><eq>π_{0.5}</eq>[7]</td><td>2.62%</td><td><eq>21.7 \pm 2.4\%</eq></td><td><eq>0.0 \pm 0.0\%</eq></td><td><eq>33.3 \pm 8.5\%</eq></td><td><eq>18.33 \pm 14.72\%</eq></td><td><eq>31.7 \pm 13.1\%</eq></td><td><eq>51.7 \pm 8.5\%</eq></td><td><eq>50.0 \pm 7.1\%</eq></td><td><eq>16.7 \pm 8.5\%</eq></td><td><eq>37.50 \pm 17.26\%</eq></td></tr><tr><td colspan="12">SONIC</td></tr><tr><td rowspan="4">Base</td><td>ACT [45]</td><td>8.57%</td><td><eq>16.7 \pm 6.2\%</eq></td><td><eq>18.3 \pm 4.7\%</eq></td><td><eq>56.7 \pm 6.2\%</eq></td><td><eq>30.56 \pm 19.36\%</eq></td><td><eq>78.3 \pm 9.4\%</eq></td><td><eq>73.3 \pm 8.5\%</eq></td><td><eq>56.7 \pm 6.2\%</eq></td><td><eq>33.3 \pm 2.4\%</eq></td><td><eq>60.42 \pm 18.98\%</eq></td></tr><tr><td>DP [46]</td><td>8.33%</td><td><eq>45.0 \pm 10.8\%</eq></td><td><eq>36.7 \pm 4.7\%</eq></td><td><eq>75.0 \pm 4.1\%</eq></td><td><eq>52.22 \pm 17.97\%</eq></td><td><eq>85.0 \pm 10.8\%</eq></td><td><eq>78.3 \pm 14.3\%</eq></td><td><eq>76.7 \pm 2.4\%</eq></td><td><eq>23.3 \pm 6.2\%</eq></td><td><eq>65.83 \pm 26.52\%</eq></td></tr><tr><td>FM [47]</td><td>5.71%</td><td><eq>13.3 \pm 2.4\%</eq></td><td><eq>38.3 \pm 4.7\%</eq></td><td><eq>73.3 \pm 6.2\%</eq></td><td><eq>41.67 \pm 25.06\%</eq></td><td><eq>70.0 \pm 4.1\%</eq></td><td><eq>15.0 \pm 7.1\%</eq></td><td><eq>70.0 \pm 8.2\%</eq></td><td><eq>38.3 \pm 14.3\%</eq></td><td><eq>48.33 \pm 24.94\%</eq></td></tr><tr><td><eq>π_{0.5}</eq>[7]</td><td>5.24%</td><td><eq>10.0 \pm 4.1\%</eq></td><td><eq>43.3 \pm 6.2\%</eq></td><td><eq>71.7 \pm 11.8\%</eq></td><td><eq>41.67 \pm 26.46\%</eq></td><td><eq>66.7 \pm 6.2\%</eq></td><td><eq>73.3 \pm 2.4\%</eq></td><td><eq>70.0 \pm 0.0\%</eq></td><td><eq>23.3 \pm 6.2\%</eq></td><td><eq>58.33 \pm 20.85\%</eq></td></tr><tr><td rowspan="4">Visual</td><td>ACT [45]</td><td>9.76%</td><td><eq>18.3 \pm 2.4\%</eq></td><td><eq>6.7 \pm 2.4\%</eq></td><td><eq>50.0 \pm 10.8\%</eq></td><td><eq>25.00 \pm 19.44\%</eq></td><td><eq>63.3 \pm 2.4\%</eq></td><td><eq>35.0 \pm 8.2\%</eq></td><td><eq>53.3 \pm 10.3\%</eq></td><td><eq>38.3 \pm 2.4\%</eq></td><td><eq>47.50 \pm 13.31\%</eq></td></tr><tr><td>DP [46]</td><td>8.33%</td><td><eq>30.0 \pm 4.1\%</eq></td><td><eq>28.3 \pm 2.4\%</eq></td><td><eq>55.0 \pm 4.1\%</eq></td><td><eq>37.78 \pm 12.72\%</eq></td><td><eq>71.7 \pm 8.5\%</eq></td><td><eq>46.7 \pm 22.5\%</eq></td><td><eq>75.0 \pm 14.1\%</eq></td><td><eq>35.0 \pm 4.1\%</eq></td><td><eq>57.08 \pm 21.93\%</eq></td></tr><tr><td>FM [47]</td><td>8.10%</td><td><eq>6.7 \pm 6.2\%</eq></td><td><eq>13.3 \pm 6.2\%</eq></td><td><eq>46.7 \pm 20.9\%</eq></td><td><eq>22.22 \pm 21.87\%</eq></td><td><eq>31.7 \pm 4.7\%</eq></td><td><eq>8.3 \pm 2.4\%</eq></td><td><eq>73.3 \pm 2.4\%</eq></td><td><eq>41.7 \pm 8.5\%</eq></td><td><eq>38.75 \pm 23.90\%</eq></td></tr><tr><td><eq>π_{0.5}</eq>[7]</td><td>5.00%</td><td><eq>15.0 \pm 0.0\%</eq></td><td><eq>13.3 \pm 2.4\%</eq></td><td><eq>73.3 \pm 10.3\%</eq></td><td><eq>33.89 \pm 28.56\%</eq></td><td><eq>63.3 \pm 2.4\%</eq></td><td><eq>35.0 \pm 10.8\%</eq></td><td><eq>63.3 \pm 13.1\%</eq></td><td><eq>18.3 \pm 6.2\%</eq></td><td><eq>45.00 \pm 21.31\%</eq></td></tr><tr><td rowspan="4">Semantic</td><td>ACT [45]</td><td>6.43%</td><td><eq>8.3 \pm 6.2\%</eq></td><td><eq>15.0 \pm 4.1\%</eq></td><td><eq>63.3 \pm 2.4\%</eq></td><td><eq>28.89 \pm 24.92\%</eq></td><td><eq>56.7 \pm 6.2\%</eq></td><td><eq>21.7 \pm 6.2\%</eq></td><td><eq>46.7 \pm 10.3\%</eq></td><td><eq>30.0 \pm 8.2\%</eq></td><td><eq>38.75 \pm 15.83\%</eq></td></tr><tr><td>DP [46]</td><td>6.67%</td><td><eq>33.3 \pm 14.3\%</eq></td><td><eq>13.3 \pm 2.4\%</eq></td><td><eq>56.7 \pm 6.2\%</eq></td><td><eq>34.44 \pm 19.92\%</eq></td><td><eq>78.3 \pm 2.4\%</eq></td><td><eq>60.0 \pm 7.1\%</eq></td><td><eq>71.7 \pm 8.5\%</eq></td><td><eq>26.7 \pm 8.5\%</eq></td><td><eq>59.17 \pm 21.10\%</eq></td></tr><tr><td>FM [47]</td><td>5.71%</td><td><eq>8.3 \pm 8.5\%</eq></td><td><eq>8.3 \pm 4.7\%</eq></td><td><eq>60.0 \pm 4.1\%</eq></td><td><eq>25.56 \pm 25.10\%</eq></td><td><eq>3.3 \pm 4.7\%</eq></td><td><eq>28.3 \pm 2.4\%</eq></td><td><eq>68.3 \pm 13.1\%</eq></td><td><eq>35.0 \pm 7.1\%</eq></td><td><eq>33.75 \pm 24.51\%</eq></td></tr><tr><td><eq>π_{0.5}</eq>[7]</td><td>2.38%</td><td><eq>16.7 \pm 8.5\%</eq></td><td><eq>25.0 \pm 0.0\%</eq></td><td><eq>75.0 \pm 7.1\%</eq></td><td><eq>38.89 \pm 26.54\%</eq></td><td><eq>8.3 \pm 4.7\%</eq></td><td><eq>41.7 \pm 13.1\%</eq></td><td><eq>65.0 \pm 4.1\%</eq></td><td><eq>16.7 \pm 2.4\%</eq></td><td><eq>32.92 \pm 23.40\%</eq></td></tr><tr><td rowspan="4">Execution</td><td>ACT [45]</td><td>6.90%</td><td><eq>23.3 \pm 6.2\%</eq></td><td><eq>11.7 \pm 8.5\%</eq></td><td><eq>65.0 \pm 4.1\%</eq></td><td><eq>33.33 \pm 23.80\%</eq></td><td><eq>68.3 \pm 13.1\%</eq></td><td><eq>50.0 \pm 4.1\%</eq></td><td><eq>46.7 \pm 6.2\%</eq></td><td><eq>36.7 \pm 6.2\%</eq></td><td><eq>50.42 \pm 14.06\%</eq></td></tr><tr><td>DP [46]</td><td>5.00%</td><td><eq>45.0 \pm 4.1\%</eq></td><td><eq>30.0 \pm 14.7\%</eq></td><td><eq>78.3 \pm 6.2\%</eq></td><td><eq>51.11 \pm 22.33\%</eq></td><td><eq>81.7 \pm 6.2\%</eq></td><td><eq>80.0 \pm 4.1\%</eq></td><td><eq>80.0 \pm 7.1\%</eq></td><td><eq>33.3 \pm 11.8\%</eq></td><td><eq>68.75 \pm 21.90\%</eq></td></tr><tr><td>FM [47]</td><td>5.24%</td><td><eq>20.0 \pm 8.2\%</eq></td><td><eq>31.7 \pm 8.5\%</eq></td><td><eq>63.3 \pm 8.5\%</eq></td><td><eq>38.33 \pm 20.14\%</eq></td><td><eq>83.3 \pm 4.7\%</eq></td><td><eq>6.7 \pm 4.7\%</eq></td><td><eq>66.7 \pm 11.8\%</eq></td><td><eq>45.0 \pm 4.1\%</eq></td><td><eq>50.42 \pm 29.54\%</eq></td></tr><tr><td><eq>π_{0.5}</eq>[7]</td><td>5.48%</td><td><eq>15.0 \pm 4.1\%</eq></td><td><eq>26.7 \pm 2.4\%</eq></td><td><eq>78.3 \pm 6.2\%</eq></td><td><eq>40.00 \pm 27.89\%</eq></td><td><eq>63.3 \pm 6.2\%</eq></td><td><eq>41.7 \pm 9.4\%</eq></td><td><eq>68.3 \pm 6.2\%</eq></td><td><eq>18.3 \pm 2.4\%</eq></td><td><eq>47.92 \pm 20.86\%</eq></td></tr></table>


Table S8: Merge-All evaluation. We evaluate high-level policy baselines trained with merged demonstrations from TWIST2-only seven task-GMT settings, SONIC-only seven task-GMT settings, or the combined TWIST2+SONIC fourteen task-GMT settings. Results are reported as success rate (SR, ↑; mean ± standard deviation). AVG denotes the average SR within each HOI or HSI task suite. The best and second-best distinct AVG are highlighted in bold and underlined, respectively.


<table><tr><td rowspan="2">Setting</td><td rowspan="2">Method</td><td rowspan="2">AFR (↓)</td><td colspan="4">HOI</td><td colspan="5">HSI</td></tr><tr><td>FOOTBALL</td><td>DOUBLEDESK</td><td>P&amp;PBOX</td><td>AVG (↑)</td><td>OPENDOOR</td><td>SITSOFA</td><td>BOXING</td><td>VISNAVI</td><td>AVG (↑)</td></tr><tr><td rowspan="4">TWIST2×7</td><td>ACT [45]</td><td>7.75%</td><td><eq>{48.3} \pm {2.4}\%</eq></td><td><eq>{3.3} \pm {2.4}\%</eq></td><td><eq>{17.5} \pm {2.5}\%</eq></td><td><eq>{23.75} \pm {19.96}\%</eq></td><td><eq>{21.7} \pm {4.7}\%</eq></td><td><eq>{78.3} \pm {6.2}\%</eq></td><td><eq>{8.3} \pm {6.2}\%</eq></td><td><eq>{18.3} \pm {16.5}\%</eq></td><td><eq>{31.67} \pm {29.04}\%</eq></td></tr><tr><td>DP [46]</td><td>7.62%</td><td><eq>{61.7} \pm {9.4}\%</eq></td><td><eq>{18.3} \pm {12.5}\%</eq></td><td><eq>{36.7} \pm {6.2}\%</eq></td><td><eq>{38.89} \pm {20.25}\%</eq></td><td><eq>{93.3} \pm {6.2}\%</eq></td><td><eq>{91.7} \pm {2.4}\%</eq></td><td><eq>{61.7} \pm {8.5}\%</eq></td><td><eq>{46.7} \pm {22.5}\%</eq></td><td><eq>{73.33} \pm {23.48}\%</eq></td></tr><tr><td>FM [47]</td><td>6.90%</td><td><eq>{35.0} \pm {4.1}\%</eq></td><td><eq>{18.3} \pm {2.4}\%</eq></td><td><eq>{30.0} \pm {4.1}\%</eq></td><td><eq>{27.78} \pm {7.86}\%</eq></td><td><eq>{68.3} \pm {6.2}\%</eq></td><td><eq>{68.3} \pm {6.2}\%</eq></td><td><eq>{55.0} \pm {8.2}\%</eq></td><td><eq>{25.0} \pm {7.1}\%</eq></td><td><eq>{54.17} \pm {19.02}\%</eq></td></tr><tr><td><eq>{\pi }_{0.5}\left\lbrack 7\right\rbrack</eq></td><td>4.52%</td><td><eq>{33.3} \pm {8.5}\%</eq></td><td><eq>{0.0} \pm {0.0}\%</eq></td><td><eq>{43.3} \pm {6.2}\%</eq></td><td><eq>{25.56} \pm {19.50}\%</eq></td><td><eq>{73.3} \pm {6.2}\%</eq></td><td><eq>{81.7} \pm {4.7}\%</eq></td><td><eq>{46.7} \pm {6.2}\%</eq></td><td><eq>{18.3} \pm {6.2}\%</eq></td><td><eq>{55.00} \pm {25.50}\%</eq></td></tr><tr><td rowspan="4">SONIC×7</td><td>ACT [45]</td><td>7.38%</td><td><eq>{20.0} \pm {4.1}\%</eq></td><td><eq>{30.0} \pm {4.1}\%</eq></td><td><eq>{60.0} \pm {12.2}\%</eq></td><td><eq>{36.67} \pm {18.71}\%</eq></td><td><eq>{58.3} \pm {2.4}\%</eq></td><td><eq>{21.7} \pm {2.4}\%</eq></td><td><eq>{58.3} \pm {10.3}\%</eq></td><td><eq>{28.3} \pm {4.7}\%</eq></td><td><eq>{41.67} \pm {17.83}\%</eq></td></tr><tr><td>DP [46]</td><td>7.14%</td><td><eq>{53.3} \pm {6.2}\%</eq></td><td><eq>{35.0} \pm {10.8}\%</eq></td><td><eq>{0.0} \pm {0.0}\%</eq></td><td><eq>{29.44} \pm {23.27}\%</eq></td><td><eq>{83.3} \pm {6.2}\%</eq></td><td><eq>{83.3} \pm {4.7}\%</eq></td><td><eq>{21.7} \pm {30.6}\%</eq></td><td><eq>{50.0} \pm {14.7}\%</eq></td><td><eq>{59.58} \pm {31.12}\%</eq></td></tr><tr><td>FM [47]</td><td>7.14%</td><td><eq>{21.7} \pm {8.5}\%</eq></td><td><eq>{20.0} \pm {7.1}\%</eq></td><td><eq>{0.0} \pm {0.0}\%</eq></td><td><eq>{13.89} \pm {11.73}\%</eq></td><td><eq>{76.7} \pm {2.4}\%</eq></td><td><eq>{48.3} \pm {6.2}\%</eq></td><td><eq>{18.3} \pm {25.9}\%</eq></td><td><eq>{38.3} \pm {6.2}\%</eq></td><td><eq>{45.42} \pm {25.12}\%</eq></td></tr><tr><td><eq>{\pi }_{0.5}\left\lbrack 7\right\rbrack</eq></td><td>6.43%</td><td><eq>{10.0} \pm {7.1}\%</eq></td><td><eq>{30.0} \pm {7.1}\%</eq></td><td><eq>{75.0} \pm {4.1}\%</eq></td><td><eq>{38.33} \pm {27.89}\%</eq></td><td><eq>{85.0} \pm {4.1}\%</eq></td><td><eq>{70.0} \pm {14.7}\%</eq></td><td><eq>{71.7} \pm {12.5}\%</eq></td><td><eq>{35.0} \pm {4.1}\%</eq></td><td><eq>{65.42} \pm {21.06}\%</eq></td></tr><tr><td rowspan="4">TWIST2+SONIC×14</td><td>ACT [45]</td><td>6.95%</td><td><eq>{32.5} \pm {18.4}\%</eq></td><td><eq>{9.2} \pm {10.2}\%</eq></td><td><eq>{36.0} \pm {12.8}\%</eq></td><td><eq>{25.29} \pm {18.67}\%</eq></td><td><eq>{10.0} \pm {2.9}\%</eq></td><td><eq>{34.2} \pm {6.7}\%</eq></td><td><eq>{53.3} \pm {16.7}\%</eq></td><td><eq>{13.3} \pm {9.0}\%</eq></td><td><eq>{27.71} \pm {20.21}\%</eq></td></tr><tr><td>DP [46]</td><td>9.40%</td><td><eq>{33.3} \pm {5.5}\%</eq></td><td><eq>{17.5} \pm {12.8}\%</eq></td><td><eq>{44.2} \pm {30.2}\%</eq></td><td><eq>{31.67} \pm {26.11}\%</eq></td><td><eq>{82.5} \pm {4.8}\%</eq></td><td><eq>{89.2} \pm {9.8}\%</eq></td><td><eq>{63.3} \pm {9.0}\%</eq></td><td><eq>{37.5} \pm {17.5}\%</eq></td><td><eq>{68.12} \pm {23.00}\%</eq></td></tr><tr><td>FM [47]</td><td>9.88%</td><td><eq>{26.7} \pm {12.1}\%</eq></td><td><eq>{18.3} \pm {13.4}\%</eq></td><td><eq>{28.3} \pm {26.9}\%</eq></td><td><eq>{24.44} \pm {19.21}\%</eq></td><td><eq>{13.3} \pm {13.1}\%</eq></td><td><eq>{40.8} \pm {24.7}\%</eq></td><td><eq>{36.7} \pm {15.5}\%</eq></td><td><eq>{10.0} \pm {7.6}\%</eq></td><td><eq>{25.21} \pm {21.38}\%</eq></td></tr><tr><td><eq>{\pi }_{0.5}\left\lbrack 7\right\rbrack</eq></td><td>8.69%</td><td><eq>{35.0} \pm {23.8}\%</eq></td><td><eq>{15.0} \pm {15.8}\%</eq></td><td><eq>{45.0} \pm {25.3}\%</eq></td><td><eq>{31.67} \pm {25.33}\%</eq></td><td><eq>{51.7} \pm {21.5}\%</eq></td><td><eq>{58.3} \pm {21.5}\%</eq></td><td><eq>{55.8} \pm {11.7}\%</eq></td><td><eq>{23.3} \pm {10.3}\%</eq></td><td><eq>{47.29} \pm {22.13}\%</eq></td></tr></table>

## J Limitations and Future Directions

Limited task and scene coverage. The current benchmark contains seven leg-critical HOI/HSI tasks covering object interaction, scene interaction, navigation, kicking, sitting, door opening, and target striking. Although these tasks expose important whole-body behaviors such as foot placement, balance maintenance, posture adjustment, and contact-rich execution, they still represent only a subset of everyday humanoid interaction. Future versions can expand the benchmark with richer household activities, multi-object rearrangement, human-robot interaction, tool use, outdoor locomotion-interaction tasks, and longer-horizon task sequences. 