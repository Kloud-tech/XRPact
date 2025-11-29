# vision_ai.py
from __future__ import annotations

from pathlib import Path
from typing import List, Dict, Any

from PIL import Image, ImageStat

# On essaie de charger CLIP, sinon fallback heuristique
HAS_CLIP = False
try:
    import torch  # type: ignore
    from transformers import CLIPProcessor, CLIPModel  # type: ignore

    HAS_CLIP = True
except Exception as e:
    print(f"[VISION_AI] CLIP not available, fallback mode. Reason: {e}")
    CLIPProcessor = None  # type: ignore
    CLIPModel = None  # type: ignore

_MODEL_NAME = "openai/clip-vit-base-patch32"
_model = None
_processor = None


def _load_clip_model() -> None:
    global _model, _processor
    if not HAS_CLIP:
        return
    if _model is None or _processor is None:
        print("[VISION_AI] Loading CLIP model...")
        _model = CLIPModel.from_pretrained(_MODEL_NAME)
        _processor = CLIPProcessor.from_pretrained(_MODEL_NAME)
        print("[VISION_AI] CLIP model loaded.")


def _basic_stats(image: Image.Image) -> Dict[str, float]:
    """
    Calcule quelques métriques simples (luminosité / contraste approx).
    """
    gray = image.convert("L")
    stat = ImageStat.Stat(gray)
    brightness = float(stat.mean[0])  # 0–255
    variance = float(stat.var[0]) if stat.var else 0.0
    contrast = (variance ** 0.5) / 128.0 if variance > 0 else 0.0
    contrast = float(min(max(contrast, 0.0), 1.0))

    return {
        "brightness": brightness,
        "variance": variance,
        "contrast": contrast,
    }


def _clip_probs(
    image: Image.Image, prompts: List[str], labels: List[str]
) -> Dict[str, float]:
    """
    Retourne un dict {label: prob} pour une liste de prompts.
    """
    assert HAS_CLIP and _model is not None and _processor is not None

    inputs = _processor(
        text=prompts,
        images=image,
        return_tensors="pt",
        padding=True,
    )

    with torch.no_grad():
        outputs = _model(**inputs)
        logits_per_image = outputs.logits_per_image[0]
        probs = logits_per_image.softmax(dim=0).tolist()

    return {lbl: float(p) for lbl, p in zip(labels, probs)}


def explain_image(image_path: str) -> Dict[str, Any]:
    """
    Analyse détaillée d'une image locale.
    Retourne un dict avec :
      - score global ∈ [0,1]
      - axes d'analyse (humanitaire, complétion, environnement, personnes, type d'infra)
      - métriques visuelles (luminosité / contraste)
      - notes textuelles explicatives
    """
    path = Path(image_path)
    if not path.exists():
        print(f"[VISION_AI] File not found: {image_path}")
        return {
            "path": str(path),
            "score": 0.5,
            "humanitarian_confidence": 0.5,
            "infra_type_label": "Inconnu (fichier introuvable)",
            "infra_type_confidence": 0.0,
            "completion_label": "Inconnu",
            "completion_confidence": 0.0,
            "environment_label": "Inconnu",
            "environment_confidence": 0.0,
            "people_label": "Inconnu",
            "people_confidence": 0.0,
            "brightness": None,
            "contrast": None,
            "notes": ["Fichier introuvable sur le disque."],
        }

    try:
        image = Image.open(path).convert("RGB")
    except Exception as e:
        print(f"[VISION_AI] Error opening image {image_path}: {e}")
        return {
            "path": str(path),
            "score": 0.5,
            "humanitarian_confidence": 0.5,
            "infra_type_label": "Inconnu (erreur de lecture)",
            "infra_type_confidence": 0.0,
            "completion_label": "Inconnu",
            "completion_confidence": 0.0,
            "environment_label": "Inconnu",
            "environment_confidence": 0.0,
            "people_label": "Inconnu",
            "people_confidence": 0.0,
            "brightness": None,
            "contrast": None,
            "notes": [f"Erreur lors de l'ouverture de l'image: {e}"],
        }

    stats = _basic_stats(image)
    notes: List[str] = []

    humanitarian_conf = 0.5
    infra_type_label = "Inconnu"
    infra_type_conf = 0.0
    completion_label = "Inconnu"
    completion_conf = 0.0
    environment_label = "Inconnu"
    environment_conf = 0.0
    people_label = "Inconnu"
    people_conf = 0.0

    if HAS_CLIP:
        try:
            _load_clip_model()

            # Axe 1 : humanitaire vs random
            hum_prompts = [
                "a photo of a completed humanitarian project site",
                "a random photo unrelated to humanitarian projects",
            ]
            hum_labels = ["humanitarian", "random"]
            hum_probs = _clip_probs(image, hum_prompts, hum_labels)
            humanitarian_conf = hum_probs["humanitarian"]
            random_conf = hum_probs["random"]

            # Axe 2 : type d'infrastructure
            type_prompts = [
                "a photo of a completed water well humanitarian project",
                "a photo of a completed school building humanitarian project",
                "a photo of a completed solar panel humanitarian project",
                "a photo of another completed humanitarian infrastructure project",
                "a random photo unrelated to humanitarian infrastructure",
            ]
            type_labels = [
                "Puits / accès à l'eau",
                "École / infrastructure éducative",
                "Énergie solaire / infrastructure énergétique",
                "Autre infrastructure humanitaire",
                "Non infrastructure humanitaire",
            ]
            type_probs = _clip_probs(image, type_prompts, type_labels)
            infra_type_label = max(type_probs, key=type_probs.get)
            infra_type_conf = type_probs[infra_type_label]

            # Axe 3 : état de complétion
            comp_prompts = [
                "a completed construction or infrastructure site",
                "a construction site still in progress",
                "a ruined or abandoned building",
                "a natural landscape with no construction",
            ]
            comp_labels = [
                "Terminé",
                "En chantier",
                "En ruine / endommagé",
                "Sans infrastructure construite",
            ]
            comp_probs = _clip_probs(image, comp_prompts, comp_labels)
            completion_label = max(comp_probs, key=comp_probs.get)
            completion_conf = comp_probs[completion_label]

            # Axe 4 : environnement (intérieur / extérieur)
            env_prompts = [
                "an outdoor rural humanitarian project site",
                "an outdoor urban street",
                "an indoor classroom",
                "an indoor office or meeting room",
            ]
            env_labels = [
                "Extérieur rural / site de projet",
                "Extérieur urbain",
                "Intérieur (salle de classe)",
                "Intérieur (bureau / salle de réunion)",
            ]
            env_probs = _clip_probs(image, env_prompts, env_labels)
            environment_label = max(env_probs, key=env_probs.get)
            environment_conf = env_probs[environment_label]

            # Axe 5 : nombre de personnes
            people_prompts = [
                "a photo with many people",
                "a photo with a few people",
                "a photo with no people visible",
            ]
            people_labels = [
                "Beaucoup de personnes",
                "Quelques personnes",
                "Aucune personne visible",
            ]
            people_probs = _clip_probs(image, people_prompts, people_labels)
            people_label = max(people_probs, key=people_probs.get)
            people_conf = people_probs[people_label]

            notes.append("Analyse CLIP complète effectuée (plusieurs axes sémantiques).")

            # Score global : on favorise les images humanitaires, terminées, et cohérentes
            completed_conf = comp_probs.get("Terminé", 0.0)
            infra_relevant_conf = 1.0 - type_probs.get("Non infrastructure humanitaire", 0.0)

            score = (
                0.5 * humanitarian_conf
                + 0.25 * completed_conf
                + 0.15 * infra_relevant_conf
                + 0.10 * (1.0 - random_conf)
            )
            score = float(min(max(score, 0.0), 1.0))

            print(
                f"[VISION_AI][CLIP] path={image_path}, score={score:.3f}, "
                f"humanitarian={humanitarian_conf:.3f}, completed={completed_conf:.3f}, "
                f"infra_type='{infra_type_label}' ({infra_type_conf:.3f}), "
                f"people='{people_label}' ({people_conf:.3f})"
            )
        except Exception as e:
            print(f"[VISION_AI] CLIP failed, fallback. Reason: {e}")
            # fallback simple basé sur la qualité visuelle
            score = _fallback_heuristic(image)
            humanitarian_conf = score
            notes.append("CLIP indisponible, utilisation d'une heuristique visuelle.")
    else:
        score = _fallback_heuristic(image)
        humanitarian_conf = score
        notes.append("CLIP non installé, utilisation d'une heuristique visuelle.")

    # Commentaires sur la luminosité / contraste
    b = stats["brightness"]
    c = stats["contrast"]
    if b < 60:
        notes.append("Image globalement sombre (conditions de lumière faibles).")
    elif b > 200:
        notes.append("Image très lumineuse, risque de zones brûlées.")
    else:
        notes.append("Luminosité globale raisonnable.")

    if c < 0.2:
        notes.append("Contraste faible : peu de détails visibles.")
    elif c > 0.8:
        notes.append("Contraste très fort : image très marquée (ombres / zones claires).")
    else:
        notes.append("Contraste modéré (lecture confortable des détails).")

    return {
        "path": str(path),
        "score": float(score),
        "humanitarian_confidence": float(humanitarian_conf),
        "infra_type_label": infra_type_label,
        "infra_type_confidence": float(infra_type_conf),
        "completion_label": completion_label,
        "completion_confidence": float(completion_conf),
        "environment_label": environment_label,
        "environment_confidence": float(environment_conf),
        "people_label": people_label,
        "people_confidence": float(people_conf),
        "brightness": stats["brightness"],
        "contrast": stats["contrast"],
        "notes": notes,
    }


def analyze_image(image_path: str) -> float:
    """
    Version simple utilisée par le Smart Escrow :
    renvoie juste le score global ∈ [0,1].
    """
    info = explain_image(image_path)
    return float(info["score"])