def mock_predict_property(descriptors: dict) -> dict:
    """
    Placeholder for a real ML model.
    This produces a simple heuristic score so the full stack works now.
    """

    score = (
        0.25 * descriptors["logp"]
        + 0.01 * descriptors["molecular_weight"]
        - 0.005 * descriptors["tpsa"]
        - 0.10 * descriptors["h_donors"]
    )

    score = max(0.0, min(1.0, round((score + 1.5) / 3.0, 3)))
    label = "likely favorable" if score >= 0.5 else "likely unfavorable"

    return {
        "property_name": "mock_druglikeness_score",
        "score": score,
        "label": label,
    }