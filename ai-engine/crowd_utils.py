def calculate_crowd_level(people_count, low=10, medium=30):

    if people_count <= low:
        return "LOW"

    elif people_count <= medium:
        return "MEDIUM"

    else:
        return "HIGH"


def calculate_cleanliness_score(waste_count):

    score = 100 - (waste_count * 10)

    if score < 0:
        score = 0

    return score