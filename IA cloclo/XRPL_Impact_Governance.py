"""
XRPL Impact Governance Lab (Pro Version)
---------------------------------------

Objectif :
    Prototyper un "moteur de gouvernance" pour XRPL Impact Map, basé sur
    l'apprentissage par renforcement (PPO), dans un environnement simulé
    qui ressemble à un vrai portefeuille de projets humanitaires.

Ce script est autonome :
    - Environnement GovernanceEnv (Gymnasium) :
        * 4 régions (Africa, LatinAmerica, SouthAsia, Other)
        * À chaque période, on simule un certain nombre de projets financés
          par région, avec:
              - nombre de projets financés
              - nombre de projets réussis
              - nombre d'escrows en clawback
        * On dérive des métriques normalisées (taux de succès, clawback, etc.)
    - Entraînement rapide d'un agent PPO (Stable-Baselines3)
    - Démo d'un épisode "backtest" avec commentaires pédagogiques
      (Impact Coach) en français.

Aucune API externe n'est utilisée : tout est purement local.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Any, Tuple

import numpy as np

# --- Gymnasium / Spaces ---

try:
    import gymnasium as gym
    from gymnasium.spaces import Box
except ImportError as e:
    raise ImportError(
        "Ce script nécessite gymnasium.\n"
        "Installe-le avec : pip install gymnasium\n"
    ) from e

# --- Stable-Baselines3 PPO ---

try:
    from stable_baselines3 import PPO
    from stable_baselines3.common.vec_env import DummyVecEnv
except ImportError as e:
    raise ImportError(
        "Ce script nécessite stable-baselines3.\n"
        "Installe-le avec : pip install stable-baselines3\n"
    ) from e

# --- Progress bar optionnelle ---

try:
    from tqdm.auto import tqdm
except ImportError:
    tqdm = None


# ============================================================
# 1. Configuration de haut niveau (style "gouvernance EY")
# ============================================================

NUM_REGIONS = 4
REGION_NAMES = ("Africa", "LatinAmerica", "SouthAsia", "Other")

# Pour chaque région, l'état inclut :
# - funds_ratio      : part des fonds alloués à la région
# - success_rate     : taux de projets réussis
# - clawback_rate    : taux de projets en clawback
# - avg_delay_norm   : délai moyen normalisé (0-1)
# - validator_rep    : réputation moyenne des validateurs
N_REGION_METRICS = 5

# Métriques globales :
# - donor_retention       : fidélité des donateurs
# - impact_score_global   : impact global pondéré par les fonds
# - geographical_balance  : équilibre géographique
# - new_donors_norm       : arrivée de nouveaux donateurs (0-1)
N_GLOBAL_METRICS = 4

OBS_SIZE = NUM_REGIONS * N_REGION_METRICS + N_GLOBAL_METRICS

# Action :
# - matching_multiplier par région        (NUM_REGIONS)
# - escrow_timeout_norm                   (0-1 -> 15-90 jours)
# - escrow_stages_norm                    (0-1 -> 2-4 paliers)
# - validators_per_project_norm           (0-1 -> 1-3 validateurs)
# - min_reputation_norm                   (0-1 -> seuil 0.3-0.9)
# - highlight_impact_bias_norm            (0-1 -> + ou - focus sur l'impact)
ACTION_SIZE = NUM_REGIONS + 5

EPISODE_LENGTH = 48  # ex: 48 "mois" de vie du protocole

# Coefficients de la fonction de récompense
W_IMPACT = 3.0
W_SUCCESS = 2.0
W_CLAWBACK = 4.0
W_DELAY = 1.0
W_RETENTION = 2.0
W_BALANCE = 1.5

# Hyperparamètres PPO (réduits pour un entraînement rapide de démo)
TOTAL_TIMESTEPS = 50_000
LEARNING_RATE = 3e-4
GAMMA = 0.99
N_STEPS = 1024
BATCH_SIZE = 64
N_EPOCHS = 5
CLIP_RANGE = 0.2


# ============================================================
# 2. Environnement de gouvernance XRPL Impact
# ============================================================

@dataclass
class RegionProjectStats:
    """Statistiques de projets pour une région sur une période donnée."""
    projects_funded: int
    projects_success: int
    projects_clawback: int


class GovernanceEnv(gym.Env):
    """
    Environnement simulé pour le moteur de gouvernance XRPL Impact.

    À chaque période :
        - L'agent choisit un vecteur d'actions = paramètres de gouvernance :
            * matching par région
            * structure des escrows
            * nombre de validateurs
            * seuil de réputation, etc.
        - L'environnement simule, pour chaque région :
            * le nombre de projets financés
            * combien réussissent
            * combien finissent en clawback
        - On en déduit des métriques de pilotage (taux, impact, équilibre, etc)
          et une récompense globale.

    Note : ce n'est PAS une modélisation parfaite de l'humanitaire.
    C'est un sandbox cohérent pour entraîner et démontrer un agent RL de gouvernance.
    """

    metadata = {"render_modes": []}

    def __init__(self, seed: int | None = None):
        super().__init__()

        self.observation_space = Box(
            low=0.0, high=1.0, shape=(OBS_SIZE,), dtype=np.float32
        )
        self.action_space = Box(
            low=-1.0, high=1.0, shape=(ACTION_SIZE,), dtype=np.float32
        )

        self.rng = np.random.default_rng(seed)

        # État par région
        self.funds_ratio = np.zeros(NUM_REGIONS, dtype=np.float32)
        self.success_rate = np.zeros(NUM_REGIONS, dtype=np.float32)
        self.clawback_rate = np.zeros(NUM_REGIONS, dtype=np.float32)
        self.avg_delay_norm = np.zeros(NUM_REGIONS, dtype=np.float32)
        self.validator_rep = np.zeros(NUM_REGIONS, dtype=np.float32)

        # Paramètres "structurels" (inhérents à la région, style contexte pays)
        self.base_success = np.zeros(NUM_REGIONS, dtype=np.float32)
        self.base_clawback = np.zeros(NUM_REGIONS, dtype=np.float32)
        self.base_demand = np.zeros(NUM_REGIONS, dtype=np.float32)

        # Métriques globales
        self.donor_retention = 0.5
        self.impact_score_global = 0.0
        self.geographical_balance = 0.0
        self.new_donors_norm = 0.0

        # Statistiques projets (par période)
        self.last_project_stats: list[RegionProjectStats] = []

        self.episode_step = 0

    # ---------- Helpers internes ----------

    def _init_latent_params(self) -> None:
        """Initialise les paramètres structurels par région (type "réalité locale")."""
        self.base_success = self.rng.uniform(0.55, 0.8, size=NUM_REGIONS).astype(np.float32)
        self.base_clawback = self.rng.uniform(0.05, 0.2, size=NUM_REGIONS).astype(np.float32)
        self.base_demand = self.rng.uniform(0.3, 1.0, size=NUM_REGIONS).astype(np.float32)

        weights = self.base_demand + self.rng.uniform(0.0, 0.3, size=NUM_REGIONS)
        weights = np.clip(weights, 1e-3, None)
        self.funds_ratio = (weights / weights.sum()).astype(np.float32)

        self.success_rate = self.base_success.copy()
        self.clawback_rate = self.base_clawback.copy()
        self.avg_delay_norm = np.full(NUM_REGIONS, 0.3, dtype=np.float32)
        self.validator_rep = np.full(NUM_REGIONS, 0.7, dtype=np.float32)

        self._update_global_metrics()
        self.last_project_stats = [
            RegionProjectStats(0, 0, 0) for _ in range(NUM_REGIONS)
        ]

    def _update_global_metrics(self) -> None:
        impact_raw = float(np.sum(self.success_rate * self.funds_ratio))
        self.impact_score_global = float(np.clip(impact_raw, 0.0, 1.0))

        clawback_global = float(self.clawback_rate.mean())
        delay_global = float(self.avg_delay_norm.mean())

        retention = 0.4 + 0.4 * self.impact_score_global - 0.5 * clawback_global
        self.donor_retention = float(np.clip(retention, 0.0, 1.0))

        self.new_donors_norm = float(
            np.clip(0.3 + 0.5 * self.impact_score_global - 0.3 * delay_global, 0.0, 1.0)
        )

        std_funds = float(np.std(self.funds_ratio))
        balance = 1.0 - np.clip(std_funds * np.sqrt(NUM_REGIONS), 0.0, 1.0)
        self.geographical_balance = float(balance)

    def _build_obs(self) -> np.ndarray:
        per_region_feats = []
        for r in range(NUM_REGIONS):
            per_region_feats.append(
                np.array(
                    [
                        self.funds_ratio[r],
                        self.success_rate[r],
                        self.clawback_rate[r],
                        self.avg_delay_norm[r],
                        self.validator_rep[r],
                    ],
                    dtype=np.float32,
                )
            )
        per_region_feats = np.concatenate(per_region_feats, axis=0)
        global_feats = np.array(
            [
                self.donor_retention,
                self.impact_score_global,
                self.geographical_balance,
                self.new_donors_norm,
            ],
            dtype=np.float32,
        )
        obs = np.concatenate([per_region_feats, global_feats], axis=0)
        assert obs.shape[0] == OBS_SIZE
        return obs.astype(np.float32)

    def _decode_action(self, action: np.ndarray) -> Dict[str, Any]:
        """Mappe l'action [-1,1] -> paramètres de gouvernance concrets."""
        a = np.clip(action, -1.0, 1.0).astype(np.float32)
        a_match = a[:NUM_REGIONS]
        a_timeout = a[NUM_REGIONS]
        a_stages = a[NUM_REGIONS + 1]
        a_validators = a[NUM_REGIONS + 2]
        a_min_rep = a[NUM_REGIONS + 3]
        a_highlight = a[NUM_REGIONS + 4]

        matching_multiplier = 0.5 + (a_match + 1.0) * 0.75  # 0.5–2.0
        escrow_timeout_days = 15.0 + (a_timeout + 1.0) * 37.5  # 15–90

        escrow_stages = int(np.round(2.0 + (a_stages + 1.0) * 1.0))
        escrow_stages = int(np.clip(escrow_stages, 2, 4))

        validators_per_project = int(np.round(1.0 + (a_validators + 1.0) * 1.0))
        validators_per_project = int(np.clip(validators_per_project, 1, 3))

        min_reputation = float(0.3 + (a_min_rep + 1.0) * 0.3)  # 0.3–0.9
        highlight_impact_bias = float((a_highlight + 1.0) * 0.5)  # 0–1

        return {
            "matching_multiplier": matching_multiplier,
            "escrow_timeout_days": escrow_timeout_days,
            "escrow_stages": escrow_stages,
            "validators_per_project": validators_per_project,
            "min_reputation": min_reputation,
            "highlight_impact_bias": highlight_impact_bias,
        }

    def _simulate_projects_for_period(
        self, params: Dict[str, Any]
    ) -> list[RegionProjectStats]:
        """
        Simule un portefeuille de projets pour chaque région sur une période.

        On utilise:
            - base_demand : intensité moyenne de demande de projets
            - funds_ratio : part de fonds réellement allouée
            - success_rate / clawback_rate : probabilités de résultat

        Retourne une liste RegionProjectStats par région.
        """
        matching = np.asarray(params["matching_multiplier"], dtype=np.float32)

        # Demande brute corrigée par les fonds alloués et le matching
        demand_intensity = self.base_demand * (0.5 + self.funds_ratio) * (0.7 + 0.6 * matching)
        demand_intensity = np.clip(demand_intensity, 0.1, None)

        project_stats: list[RegionProjectStats] = []
        new_success_rate = np.zeros(NUM_REGIONS, dtype=np.float32)
        new_clawback_rate = np.zeros(NUM_REGIONS, dtype=np.float32)

        for i in range(NUM_REGIONS):
            # Nombre de projets financés ~ Poisson
            lam = float(10.0 * demand_intensity[i])  # 10 = échelle "projets / période"
            projects_funded = int(self.rng.poisson(lam=lam))
            if projects_funded <= 0:
                projects_funded = 0
                projects_success = 0
                projects_clawback = 0
            else:
                # Probas effectives = base +- bonus gouvernance + bruit
                p_success = float(
                    self.base_success[i]
                    + 0.10 * (matching[i] - 1.0)
                    - 0.20 * self.base_clawback[i]
                    + self.rng.normal(0.0, 0.03)
                )
                p_success = float(np.clip(p_success, 0.0, 1.0))

                p_claw = float(
                    self.base_clawback[i]
                    + 0.05 * (1.5 - matching[i])
                    + self.rng.normal(0.0, 0.02)
                )
                p_claw = float(np.clip(p_claw, 0.0, 1.0))

                # Tirages binomiaux
                projects_success = int(self.rng.binomial(projects_funded, p_success))
                remaining = max(projects_funded - projects_success, 0)
                projects_clawback = int(self.rng.binomial(remaining, p_claw))

            # Taux agrégés pour l'état
            if projects_funded > 0:
                new_success_rate[i] = projects_success / projects_funded
                new_clawback_rate[i] = projects_clawback / projects_funded
            else:
                # Pas de projets => on garde une mémoire amortie
                new_success_rate[i] = self.success_rate[i]
                new_clawback_rate[i] = self.clawback_rate[i]

            project_stats.append(
                RegionProjectStats(
                    projects_funded=projects_funded,
                    projects_success=projects_success,
                    projects_clawback=projects_clawback,
                )
            )

        # Mise à jour des métriques par région
        self.success_rate = np.clip(0.7 * self.success_rate + 0.3 * new_success_rate, 0.0, 1.0)
        self.clawback_rate = np.clip(0.7 * self.clawback_rate + 0.3 * new_clawback_rate, 0.0, 1.0)

        # Délai moyen : dépend vaguement du nombre de validateurs & des escrows,
        # mais on garde une approximation globale (0.3–0.6)
        delay = float(
            0.25 + 0.02 * params["validators_per_project"] + 0.03 * (params["escrow_stages"] - 2)
        )
        delay = np.clip(delay, 0.2, 0.6)
        self.avg_delay_norm = np.full(NUM_REGIONS, delay, dtype=np.float32)

        # Réputation des validateurs: monte si succès >> clawbacks
        rep_update = self.success_rate - self.clawback_rate
        self.validator_rep = 0.9 * self.validator_rep + 0.1 * rep_update
        self.validator_rep = np.clip(self.validator_rep, 0.0, 1.0)

        # Répartition des fonds : les régions avec plus de succès et moins de clawbacks
        # attirent plus de flux.
        preference = self.base_demand * (0.5 + self.success_rate - 0.5 * self.clawback_rate)
        preference = np.clip(preference, 1e-4, None)
        new_funds = preference / preference.sum()
        self.funds_ratio = (0.7 * self.funds_ratio + 0.3 * new_funds).astype(np.float32)
        self.funds_ratio = (self.funds_ratio / self.funds_ratio.sum()).astype(np.float32)

        return project_stats

    # ---------- API Gym ----------

    def reset(self, seed: int | None = None, options=None):
        if seed is not None:
            self.rng = np.random.default_rng(seed)
        self.episode_step = 0
        self._init_latent_params()
        obs = self._build_obs()
        return obs, {}

    def step(self, action: np.ndarray):
        self.episode_step += 1
        terminated = self.episode_step >= EPISODE_LENGTH
        truncated = False

        params = self._decode_action(action)
        self.last_project_stats = self._simulate_projects_for_period(params)
        self._update_global_metrics()

        obs = self._build_obs()

        mean_success = float(self.success_rate.mean())
        clawback_global = float(self.clawback_rate.mean())
        delay_global = float(self.avg_delay_norm.mean())

        reward = (
            W_IMPACT * self.impact_score_global
            + W_SUCCESS * mean_success
            - W_CLAWBACK * clawback_global
            - W_DELAY * delay_global
            + W_RETENTION * self.donor_retention
            + W_BALANCE * self.geographical_balance
        )

        info = {
            "step": self.episode_step,
            "impact_score_global": self.impact_score_global,
            "mean_success": mean_success,
            "clawback_global": clawback_global,
            "delay_global": delay_global,
            "donor_retention": self.donor_retention,
            "geographical_balance": self.geographical_balance,
            "funds_ratio": self.funds_ratio.copy(),
            "success_rate": self.success_rate.copy(),
            "clawback_rate": self.clawback_rate.copy(),
            "project_stats": self.last_project_stats,
            "params": params,
        }

        return obs, float(reward), terminated, truncated, info

    def render(self):
        pass


# ============================================================
# 3. Impact Coach (pseudo LLM local, éducatif)
# ============================================================

@dataclass
class ImpactCoachContext:
    step: int
    region_names: Tuple[str, ...]
    impact: float
    success: float
    clawback: float
    delay: float
    retention: float
    balance: float
    funds_ratio: np.ndarray
    project_stats: list[RegionProjectStats]
    params: Dict[str, Any]


def impact_coach_explain(ctx: ImpactCoachContext, language: str = "fr") -> str:
    """
    "Mini LLM" basé sur des règles et le contexte chiffré.
    Rôle : expliquer ce qui se passe dans la période de manière pédagogique.
    """
    total_projects = sum(s.projects_funded for s in ctx.project_stats)
    total_success = sum(s.projects_success for s in ctx.project_stats)
    total_claw = sum(s.projects_clawback for s in ctx.project_stats)

    max_idx = int(np.argmax(ctx.funds_ratio))
    min_idx = int(np.argmin(ctx.funds_ratio))
    region_max = ctx.region_names[max_idx]
    region_min = ctx.region_names[min_idx]

    if language == "fr":
        lines: list[str] = []
        lines.append(f"Période {ctx.step} – Lecture par le moteur de gouvernance IA")
        lines.append(
            f"- Projets financés ce tour : {total_projects} "
            f"(succès : {total_success}, clawbacks : {total_claw})."
        )
        lines.append(
            f"- Impact global : {ctx.impact:.2f}, taux de succès moyen ≈ {ctx.success:.2f}, "
            f"taux de clawback ≈ {ctx.clawback:.2f}."
        )
        if ctx.clawback > 0.2:
            lines.append(
                "  → Le taux de clawback est relativement élevé : le protocole pourrait envisager "
                "de durcir les conditions d'escrow ou d'augmenter le seuil de réputation des "
                "validateurs dans certaines zones."
            )
        else:
            lines.append(
                "  → Les clawbacks restent sous contrôle : la structure d'escrow et la sélection "
                "des validateurs semblent globalement saines."
            )

        lines.append(
            f"- Répartition des fonds : {region_max} est la région la plus financée "
            f"(~{ctx.funds_ratio[max_idx]:.2f} du total), tandis que {region_min} reste "
            f"plus sous-financée (~{ctx.funds_ratio[min_idx]:.2f})."
        )
        if ctx.balance > 0.8:
            lines.append(
                "  → L'équilibre géographique est bon : aucune région ne capte "
                "toute la liquidité, ce qui renforce la légitimité du protocole."
            )
        else:
            lines.append(
                "  → L'équilibre géographique est perfectible : une ou deux régions attirent "
                "une part disproportionnée des flux."
            )

        lines.append(
            f"- Rétention estimée des donateurs : {ctx.retention:.2f}. "
            "Plus l'impact reste élevé et les clawbacks bas, plus cette métrique a vocation "
            "à augmenter dans le temps."
        )
        lines.append(
            "- Rappel important : ces paramètres de gouvernance (matching, escrows, validateurs) "
            "sont des suggestions de l'IA. Ils doivent être validés par un comité humain et "
            "peuvent être archivés on-chain comme 'AI Governance Proposals' pour transparence."
        )

        return "\n".join(lines)

    # Version anglaise simple (au cas où)
    lines = []
    lines.append(f"Period {ctx.step} – Governance AI reading")
    lines.append(
        f"- Projects funded: {total_projects} (success: {total_success}, "
        f"clawbacks: {total_claw})."
    )
    lines.append(
        f"- Global impact: {ctx.impact:.2f}, average success rate ≈ {ctx.success:.2f}, "
        f"clawback rate ≈ {ctx.clawback:.2f}."
    )
    if ctx.clawback > 0.2:
        lines.append(
            "  → Clawbacks are relatively high: the protocol may want to tighten escrow "
            "conditions or increase validator reputation thresholds in certain regions."
        )
    else:
        lines.append(
            "  → Clawbacks are under control: escrow structure and validator selection "
            "seem reasonably healthy."
        )
    lines.append(
        f"- Funds allocation: {region_max} receives the largest share "
        f"(~{ctx.funds_ratio[max_idx]:.2f}), while {region_min} remains "
        f"underfunded (~{ctx.funds_ratio[min_idx]:.2f})."
    )
    if ctx.balance > 0.8:
        lines.append(
            "  → Geographical balance is good: no single region captures all the liquidity."
        )
    else:
        lines.append(
            "  → Geographical balance could be improved: one or two regions dominate inflows."
        )
    lines.append(
        f"- Estimated donor retention: {ctx.retention:.2f}. "
        "Higher impact and lower clawbacks should drive this metric up over time."
    )
    lines.append(
        "- Important: these governance parameters are AI suggestions only. "
        "They must be reviewed by a human committee and can be stored on-chain as "
        "'AI Governance Proposals' for transparency."
    )
    return "\n".join(lines)


# ============================================================
# 4. Entraînement PPO + Backtest de démo
# ============================================================

def make_env():
    def _init():
        return GovernanceEnv()
    return _init


def train_demo_model() -> PPO:
    """Entraîne rapidement un PPO sur GovernanceEnv (local only)."""
    env = DummyVecEnv([make_env()])

    model = PPO(
        "MlpPolicy",
        env,
        learning_rate=LEARNING_RATE,
        n_steps=N_STEPS,
        batch_size=BATCH_SIZE,
        n_epochs=N_EPOCHS,
        gamma=GAMMA,
        clip_range=CLIP_RANGE,
        verbose=1,
    )

    if tqdm is not None:
        pbar = tqdm(total=TOTAL_TIMESTEPS, desc="Training PPO Governance Agent")
    else:
        pbar = None

    remaining = TOTAL_TIMESTEPS
    chunk = 10_000
    while remaining > 0:
        step_chunk = min(chunk, remaining)
        model.learn(total_timesteps=step_chunk, reset_num_timesteps=False)
        remaining -= step_chunk
        if pbar is not None:
            pbar.update(step_chunk)

    if pbar is not None:
        pbar.close()

    return model


def run_demo_episode_with_coach(model: PPO, language: str = "fr") -> None:
    """Lance un épisode complet + imprime les métriques et les explications coach."""
    env = GovernanceEnv(seed=123)
    obs, _ = env.reset()

    print("\n=== XRPL Impact Governance Backtest (Pro) ===\n")
    header = (
        "step | impact | success | clawback | delay | retention | balance | "
        + "funds " + " ".join(r[:3] for r in REGION_NAMES)
    )
    print(header)
    print("-" * len(header))

    total_reward = 0.0

    for t in range(EPISODE_LENGTH):
        action, _ = model.predict(obs, deterministic=True)
        obs, reward, terminated, truncated, info = env.step(action)
        total_reward += reward

        impact = info["impact_score_global"]
        success = info["mean_success"]
        clawback = info["clawback_global"]
        delay = info["delay_global"]
        retention = info["donor_retention"]
        balance = info["geographical_balance"]
        funds_ratio = info["funds_ratio"]
        stats: list[RegionProjectStats] = info["project_stats"]

        funds_str = " ".join(f"{x:.2f}" for x in funds_ratio)
        print(
            f"{t+1:4d} | "
            f"{impact:.3f} | "
            f"{success:.3f} | "
            f"{clawback:.3f} | "
            f"{delay:.3f} | "
            f"{retention:.3f} | "
            f"{balance:.3f} | "
            f"{funds_str}"
        )

        ctx = ImpactCoachContext(
            step=t + 1,
            region_names=REGION_NAMES,
            impact=impact,
            success=success,
            clawback=clawback,
            delay=delay,
            retention=retention,
            balance=balance,
            funds_ratio=funds_ratio,
            project_stats=stats,
            params=info["params"],
        )

        # Tous les 8 pas, on affiche un bloc d'explication "LLM-like"
        if (t + 1) % 8 == 0:
            print("\n--- Impact Coach (explication pédagogique) ---")
            print(impact_coach_explain(ctx, language=language))
            print("------------------------------------------------\n")

        if terminated or truncated:
            break

    print("\n[DEMO] Épisode terminé")
    print(f"[DEMO] Récompense totale sur l'épisode : {total_reward:.3f}\n")


# ============================================================
# 5. Entrée principale
# ============================================================

if __name__ == "__main__":
    # 1) Entraînement rapide du modèle de gouvernance
    model = train_demo_model()

    # 2) Backtest + explications pédagogiques
    run_demo_episode_with_coach(model, language="fr")