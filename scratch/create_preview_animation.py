import os
import sys
from PIL import Image, ImageEnhance, ImageFilter

def generate_animation():
    img_6scenes_path = r"C:\Users\dhurg\.gemini\antigravity\brain\aaa57cb2-e941-4182-950e-d738fbfb4749\.user_uploaded\media_1795529845262_03d8420c.jpg"
    img_dashboard_path = r"C:\Users\dhurg\.gemini\antigravity\brain\aaa57cb2-e941-4182-950e-d738fbfb4749\.user_uploaded\media_1795537379859_33902f33.jpg"

    out_dir = r"c:\Users\dhurg\Desktop\Palar Guard AI\frontend\public\animations"
    os.makedirs(out_dir, exist_ok=True)
    out_gif = os.path.join(out_dir, "palar-hero-preview.gif")

    img_6 = Image.open(img_6scenes_path)
    img_dash = Image.open(img_dashboard_path)

    w, h = img_6.size
    print(f"6-Scene sheet size: {w}x{h}")

    # Crop the 6 sub-scenes (3 columns x 2 rows)
    col_w = w / 3.0
    row_h = h / 2.0

    scenes = []
    # Scene 1: Earth View
    scenes.append(img_6.crop((0, 0, int(col_w), int(row_h))))
    # Scene 2: India Focus
    scenes.append(img_6.crop((int(col_w), 0, int(col_w * 2), int(row_h))))
    # Scene 3: Tamil Nadu Zoom
    scenes.append(img_6.crop((int(col_w * 2), 0, w, int(row_h))))
    # Scene 4: Palar Basin Highlight
    scenes.append(img_6.crop((0, int(row_h), int(col_w), h)))
    # Scene 5: Data Visualization
    scenes.append(img_6.crop((int(col_w), int(row_h), int(col_w * 2), h)))
    # Scene 6: Reveal Brand
    scenes.append(img_6.crop((int(col_w * 2), int(row_h), w, h)))

    # Target resolution for smooth, lightweight web GIF: 720 x 405 (16:9)
    target_size = (720, 405)
    resized_scenes = [s.resize(target_size, Image.Resampling.LANCZOS) for s in scenes]
    dash_scene = img_dash.resize(target_size, Image.Resampling.LANCZOS)
    resized_scenes.append(dash_scene)

    frames = []
    durations = []

    # Build sequence with smooth cross-dissolve transitions between each scene
    num_scenes = len(resized_scenes)
    for i in range(num_scenes):
        current_scene = resized_scenes[i]
        next_scene = resized_scenes[(i + 1) % num_scenes]

        # Hold the scene for a moment
        for _ in range(4):
            frames.append(current_scene)
            durations.append(400) # 400ms hold frames (total ~1.6s per key scene)

        # 3 intermediate cross-fade frames between scenes
        for step in range(1, 4):
            alpha = step / 4.0
            blended = Image.blend(current_scene, next_scene, alpha)
            frames.append(blended)
            durations.append(120) # 120ms transition frame

    # Save animated GIF with adaptive color palette
    print(f"Total frames generated: {len(frames)}")
    frames[0].save(
        out_gif,
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        optimize=True
    )
    print(f"Successfully generated: {out_gif} (size: {os.path.getsize(out_gif)} bytes)")

if __name__ == "__main__":
    generate_animation()
