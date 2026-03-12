import argparse
import json
import requests

import cv2
from ultralytics import YOLO
from ultralytics.utils import LOGGER


BACKEND_URL = "http://localhost:5000/crowd"


def compute_counts(model, results):
    people_count = 0
    litter_count = 0

    for box in results[0].boxes:
        cls = int(box.cls)
        label = model.names[cls]

        if label == "person":
            people_count += 1

        if label in ["bottle", "cup", "wine glass"]:
            litter_count += 1

    if people_count < 10:
        crowd_level = "LOW"
    elif people_count < 25:
        crowd_level = "MEDIUM"
    else:
        crowd_level = "HIGH"

    return people_count, litter_count, crowd_level


def send_to_backend(people_count, litter_count, crowd_level):
    payload = {
        "people_count": int(people_count),
        "litter": int(litter_count),
        "crowd_level": crowd_level,
    }

    try:
        requests.post(BACKEND_URL, json=payload, timeout=0.2)
    except:
        pass


def run_on_image(model, image_path, json_only=False):
    frame = cv2.imread(image_path)
    if frame is None:
        raise RuntimeError(f"Could not read image: {image_path}")

    frame = cv2.resize(frame, (640, 360))
    results = model(frame, imgsz=320, verbose=False)

    people_count, litter_count, crowd_level = compute_counts(model, results)

    payload = {
        "people_count": int(people_count),
        "litter": int(litter_count),
        "crowd_level": crowd_level,
    }

    if json_only:
        print(json.dumps(payload))
        return

    annotated = results[0].plot()

    cv2.imshow("UrbanEye Smart Monitoring", annotated)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


def run_webcam(model, camera_index=0, json_only=False):

    cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.resize(frame, (640, 360))

        results = model(frame, imgsz=320, verbose=False)

        people_count, litter_count, crowd_level = compute_counts(model, results)

        # JSON mode (used by backend API)
        if json_only:
            print(json.dumps({
                "people_count": people_count,
                "litter": litter_count,
                "crowd_level": crowd_level
            }))
            return

        # Send AI results to backend
        send_to_backend(people_count, litter_count, crowd_level)

        if crowd_level == "LOW":
            color = (0, 255, 0)
        elif crowd_level == "MEDIUM":
            color = (0, 255, 255)
        else:
            color = (0, 0, 255)

        annotated = results[0].plot()

        cv2.putText(
            annotated,
            f"People: {people_count}",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2,
        )

        cv2.putText(
            annotated,
            f"Litter Detected: {litter_count}",
            (20, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 255),
            2,
        )

        cv2.putText(
            annotated,
            f"Crowd Level: {crowd_level}",
            (20, 120),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            color,
            3,
        )

        if crowd_level == "HIGH":
            cv2.putText(
                annotated,
                "ALERT: CROWD OVERLOAD",
                (20, 170),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255),
                3,
            )

        if litter_count > 3:
            cv2.putText(
                annotated,
                "WARNING: LITTERING DETECTED",
                (20, 210),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.9,
                (0, 165, 255),
                3,
            )

        cv2.imshow("UrbanEye Smart Monitoring", annotated)

        if cv2.waitKey(1) == 27:
            break

    cap.release()
    cv2.destroyAllWindows()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=str, default="", help="Path to input image")
    parser.add_argument("--json", action="store_true", help="Print JSON only")
    parser.add_argument("--camera", type=int, default=0, help="Webcam index")
    parser.add_argument("--weights", type=str, default="yolov8n.pt")

    args = parser.parse_args()

    LOGGER.setLevel("ERROR")
    model = YOLO(args.weights)

    if args.input:
        run_on_image(model, args.input, json_only=args.json)
        return

    run_webcam(model, camera_index=args.camera, json_only=args.json)


if __name__ == "__main__":
    main()