from ultralytics import YOLO

# load YOLO model
model = YOLO("yolov8n.pt")

# open webcam and detect
model.predict(source=0, show=True)