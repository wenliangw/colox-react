#!/usr/bin/env python3
"""Generate the Colox palette scales (proposal) with perceptual QA.

- Chromatic scales (indigo/purple/blue/green/orange/red) share ONE
  lightness+saturation staircase; only the hue differs. This makes all hues
  equal in visual weight and guarantees the same WCAG behavior at each step.
  Base palette names are COLOR NOUNS only — usage semantics (primary /
  success / warning / danger / info) live in the semantic layer.
- gray is a dedicated neutral ramp (keeps pure white at 50, dark end deep enough
  for dark-mode surfaces).
- primary also gets an extra "anchored" variant that keeps the brand value
  #4F46E5 at 500 exactly.

Run: python3 packages/components/scripts/generate_color_scales.py
Output: styles/meta/color-scales.proposal.md
"""
import colorsys
import math

# ---- perceptual QA helpers -------------------------------------------------

def hls_hex(h, l, s):
    r, g, b = colorsys.hls_to_rgb(h / 360, l, s)
    return "#%02X%02X%02X" % (round(r * 255), round(g * 255), round(b * 255))

def lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def luminance(hexv):
    h = hexv.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)

def contrast(l1, l2):
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)

def qa(hexv):
    """Return QC string like '✅ 白字AA 4.9 / 黑字AA 12.1'."""
    L = luminance(hexv)
    w = contrast(1.0, L)
    d = contrast(L, luminance("#1A1A1A"))
    parts = []
    parts.append("白字 %.1f%s" % (w, " AA✅" if w >= 4.5 else ""))
    parts.append("黑字 %.1f%s" % (d, " AA✅" if d >= 4.5 else ""))
    return " / ".join(parts)

# ---- shared staircase (approved red template) ------------------------------

STAIRCASE = [
    # (lightness, saturation)  50 -> 900 — 与已认可的 red 阶梯严格一致
    (0.97, 0.45), (0.94, 0.60), (0.89, 0.80), (0.80, 0.85), (0.68, 0.83),
    (0.55, 0.80), (0.47, 0.75), (0.40, 0.70), (0.33, 0.64), (0.26, 0.58),
]

# hue choices: indigo=243 (was #4F46E5), purple=268 (violet candidate for the
# semantic "primary" role), green=152 (their mint), orange=28 (warning),
# blue=215 (azure info), red=354 (their crimson)
HUES = {"indigo": 243, "purple": 268, "green": 152, "orange": 28, "blue": 215, "red": 354}

STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

def build_chromatic(hue):
    return {step: hls_hex(hue, l, s) for step, (l, s) in zip(STEPS, STAIRCASE)}

# ---- gray: dedicated neutral ramp (keep white 50, deep dark 900) ------------

def sgray(lin_l):
    c = 1.055 * lin_l ** (1 / 2.4) - 0.055
    v = round(max(0.0, min(255.0, c * 255)))
    return f"#{v:02X}{v:02X}{v:02X}"

# 800 ≈ #383838、900 ≈ #1A1A1A（与你原 gray 深色端一致，适配暗色表面）
GRAY_TARGETS = [1.0, 0.964, 0.905, 0.820, 0.680, 0.510, 0.325, 0.175, 0.040, 0.010]

# ---- indigo anchored variant (keep existing brand #4F46E5 at 500) ----------

INDIGO_ANCHORED = {
    50: "#E8E7FC", 100: "#D7D5F9", 200: "#B5B1F4", 300: "#938EEF",
    400: "#716AEA", 500: "#4F46E5",  # keep the original brand value
    # smoothed dark half (same hue/sat family as original 600-900)
    600: hls_hex(243, 0.47, 0.73), 700: hls_hex(243, 0.38, 0.71),
    800: hls_hex(243, 0.28, 0.67), 900: hls_hex(243, 0.19, 0.62),
}

# ---- assemble + markdown output --------------------------------------------

SCALES = {name: build_chromatic(hue) for name, hue in HUES.items()}
SCALES["gray"] = {step: sgray(l) for step, l in zip(STEPS, GRAY_TARGETS)}

lines = []
lines.append("# Colox 色阶提案（家族统一阶梯）\n")
lines.append("> 生成脚本：`packages/components/scripts/generate_color_scales.py`\n")
lines.append("> 规则：彩色阶共享同一明度/饱和度阶梯（仅 hue 不同）；gray 为独立中性阶梯（50 保留纯白）。\n")

for name in ["indigo", "purple", "blue", "green", "orange", "red", "gray"]:
    scale = SCALES[name]
    ls = [luminance(v) for v in scale.values()]
    mono = "单调 ✅" if all(ls[i] > ls[i + 1] for i in range(len(ls) - 1)) else "⚠️ 非单调"
    lines.append(f"\n## {name}\n")
    lines.append(f"`{ ' '.join(scale.values()) }`  （{mono}）\n")
    lines.append("\n| 阶 | Hex | 对比度 |\n|---|---|---|")
    for step in STEPS:
        lines.append(f"| {step} | {scale[step]} | {qa(scale[step])} |")

if INDIGO_ANCHORED:
    lines.append("\n## indigo（锚定版，500=#4F46E5）\n")
    lines.append(f"`{ ' '.join(INDIGO_ANCHORED[s] for s in STEPS) }`\n")

with open("packages/components/src/styles/meta/color-scales.proposal.md", "w") as f:
    f.write("\n".join(lines) + "\n")

# ---- console report ---------------------------------------------------------

for name in ["indigo", "purple", "blue", "green", "orange", "red", "gray"]:
    print(f"\n### {name}")
    prev = None
    for step in STEPS:
        v = SCALES[name][step]
        L = luminance(v)
        flag = " ⚠️非单调" if prev and L >= prev else ""
        print(f"  {step:>3} {v}  L={L*100:5.1f}%  {qa(v)}{flag}")
        prev = L
if INDIGO_ANCHORED:
    print("\n### indigo (anchored #4F46E5)")
    prev = None
    for step in STEPS:
        v = INDIGO_ANCHORED[step]
        L = luminance(v)
        flag = " ⚠️非单调" if prev and L >= prev else ""
        print(f"  {step:>3} {v}  L={L*100:5.1f}%  {qa(v)}{flag}")
        prev = L
print("\n[ok] proposal written to styles/meta/color-scales.proposal.md")