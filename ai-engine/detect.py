from ultralytics import YOLO
import cv2

# Load YOLO model
model = YOLO("yolov8n.pt")

cap = cv2.VideoCapture(0)

while True:

    ret, frame = cap.read()

    if not ret:
        break

    frame = cv2.resize(frame,(640,360))

    results = model(frame, imgsz=320)

    people_count = 0
    litter_count = 0

    for box in results[0].boxes:

        cls = int(box.cls)
        label = model.names[cls]

        # Crowd detection
        if label == "person":
            people_count += 1

        # Waste detection
        if label in ["bottle","cup","wine glass"]:
            litter_count += 1

    # Crowd density levels
    if people_count < 10:
        crowd_level = "LOW"
        color = (0,255,0)

    elif people_count < 25:
        crowd_level = "MEDIUM"
        color = (0,255,255)

    else:
        crowd_level = "HIGH"
        color = (0,0,255)

    annotated = results[0].plot()

    cv2.putText(
        annotated,
        f"People: {people_count}",
        (20,40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0,255,0),
        2
    )

    cv2.putText(
        annotated,
        f"Litter Detected: {litter_count}",
        (20,80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0,255,255),
        2
    )

    cv2.putText(
        annotated,
        f"Crowd Level: {crowd_level}",
        (20,120),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        color,
        3
    )

    # Alert for unsafe crowd
    if crowd_level == "HIGH":
        cv2.putText(
            annotated,
            "ALERT: CROWD OVERLOAD",
            (20,170),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0,0,255),
            3
        )

    # Alert for garbage dumping
    if litter_count > 3:
        cv2.putText(
            annotated,
            "WARNING: LITTERING DETECTED",
            (20,210),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.9,
            (0,165,255),
            3
        )

    cv2.imshow("UrbanEye Smart Monitoring", annotated)

    if cv2.waitKey(1) == 27:
        break

cap.release()
cv2.destroyAllWindows()