from fastapi import APIRouter
from app.schemas.quiz import QuizSubmission, QuizResultResponse

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.post("/calculate-result", response_model=QuizResultResponse)
def calculate_result(submission: QuizSubmission):
    """Calculates the Dosha percentages based on quiz answers."""
    counts = {"Vata": 0, "Pitta": 0, "Kapha": 0}

    for answer in submission.answers:
        counts[answer.dosha] += 1

    total = len(submission.answers)

    if total == 0:
        return {
            "counts": counts,
            "percentages": {"Vata": 0, "Pitta": 0, "Kapha": 0},
            "dominant_dosha": None,
        }

    percentages = {
        "Vata": round((counts["Vata"] / total) * 100, 2),
        "Pitta": round((counts["Pitta"] / total) * 100, 2),
        "Kapha": round((counts["Kapha"] / total) * 100, 2),
    }

    sorted_doshas = sorted(percentages.items(), key=lambda item: item[1], reverse=True)
    top1_dosha, top1_score = sorted_doshas[0]
    top2_dosha, top2_score = sorted_doshas[1]

    order = {"vata": 1, "pitta": 2, "kapha": 3}
    d1 = top1_dosha.lower()
    d2 = top2_dosha.lower()

    if top1_score >= 70:
        dominant_dosha = d1
    elif (top1_score - top2_score) <= 10:
        if order[d1] < order[d2]:
            dominant_dosha = f"{d1}+{d2}"
        else:
            dominant_dosha = f"{d2}+{d1}"
    else:
        dominant_dosha = d1

    return {
        "counts": counts,
        "percentages": percentages,
        "dominant_dosha": dominant_dosha,
    }
