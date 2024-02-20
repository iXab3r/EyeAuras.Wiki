---
title: How to extract every Nth frame from video using Python 
description: 
published: true
date: 2023-11-12T14:27:31.484Z
tags: 
editor: markdown
dateCreated: 2023-11-07T11:59:08.871Z
---

# Extracting every Nth frame from a Video with Python

This guide will walk you through extracting every Nth frame from a video using Python. We'll use a Python script with the `opencv-python` library. No prior programming experience is needed!

## Step 1: Install Python
Ensure Python is installed on your system. If not, download it from the [official Python website](https://www.python.org/).

## Step 2: Install `opencv-python`
`opencv-python` is a library that helps us process videos in Python. Install it by running:

```bash
pip install opencv-python
```

## Step 3: Prepare the Python Script
Create a Python script that takes a video path and an interval as inputs.

Open a text editor. Save it as **extract_frames.py**
Copy and paste the script below:
```python
import cv2
import os
import argparse

def main(video_path, frame_interval):
    # Extract video file name without extension and create a directory for frames
    video_name = os.path.splitext(os.path.basename(video_path))[0]
    frames_dir = os.path.join(os.path.dirname(video_path), f"{video_name}_frames")
    os.makedirs(frames_dir, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise Exception(f"Error opening video file: {video_path}")

    frame_count = 0
    saved_frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_count % frame_interval == 0:
            frame_filename = f"{video_name}_#{saved_frame_count + 1}.png"
            cv2.imwrite(os.path.join(frames_dir, frame_filename), frame)
            saved_frame_count += 1
            if saved_frame_count % 30 == 0:
                print(f"Progress: {saved_frame_count} frames saved.")
        frame_count += 1

    cap.release()
    print(f"Saved {saved_frame_count} frames to '{frames_dir}'")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract frames from video.")
    parser.add_argument("video_path", type=str, help="Path to the video file.")
    parser.add_argument("-i", "--interval", type=int, default=10, help="Interval of frames to save (default is every 10th frame).")
    args = parser.parse_args()
    main(args.video_path, args.interval)
```

## Step 4: Run the Script
Open CMD and navigate to where you saved extract_frames.py.

Run the script by typing in command:
```bash
python extract_frames.py /path/to/video.mp4 -i 10
```
Replace /path/to/video.mp4 with the path to your video file and 10 with the desired frame interval.

## Step 5: Check the Output
After running, check the frames folder for the extracted frames named like video_#0.png, video_#1.png, etc.

## Step 6: Completion
Your frames are now extracted and saved. You can change the interval or try different videos as needed.
