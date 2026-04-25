from __future__ import annotations

"""
Industry-standard rating aggregation.

Formula
-------
    score = ( Σ wᵢ · rᵢ + C · m ) / ( Σ wᵢ + C )

    wᵢ = exp( -ln(2) · ageᵢ_days / HALF_LIFE_DAYS )

Constants
---------
    HALF_LIFE_DAYS = 180   — a 6-month-old rating counts half as much
    PRIOR_WEIGHT   = 5     — Bayesian smoothing strength
    PRIOR_MEAN     = 4.0   — what a brand-new account starts at

Why each piece
--------------
    Time decay (wᵢ)        Older ratings fade. Reputation can recover; one
                           bad review from two years ago shouldn't dominate.
    Bayesian prior (C, m)  A user with one 5★ review can't outrank a user
                           with fifty 4.9★ reviews. New accounts converge
                           toward their true score as data accumulates.
"""

import math
from datetime import datetime, timezone
from typing import Iterable, Optional

HALF_LIFE_DAYS = 180.0
LAMBDA = math.log(2) / HALF_LIFE_DAYS
PRIOR_WEIGHT = 5.0
PRIOR_MEAN = 4.0


def _to_dt(value) -> datetime:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    s = str(value)
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    return datetime.fromisoformat(s)


def aggregate(ratings: Iterable[dict]) -> tuple[Optional[float], int]:
    """
    Returns (score, count).

    score is None when there are no ratings yet. We deliberately return
    None rather than the prior mean so the UI can render "no ratings yet"
    instead of a misleading 4.0.
    """
    rows = list(ratings)
    if not rows:
        return None, 0

    now = datetime.now(timezone.utc)
    weighted_sum = 0.0
    weight_total = 0.0
    for r in rows:
        ts = _to_dt(r["created_at"])
        age_days = max(0.0, (now - ts).total_seconds() / 86400.0)
        w = math.exp(-LAMBDA * age_days)
        weighted_sum += w * float(r["score"])
        weight_total += w

    score = (weighted_sum + PRIOR_WEIGHT * PRIOR_MEAN) / (weight_total + PRIOR_WEIGHT)
    # Clamp to [1, 5] for display safety, round to 2 decimals.
    score = max(1.0, min(5.0, score))
    return round(score, 2), len(rows)
