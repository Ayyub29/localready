# LocalReady Figma screens

Figma has no import API here, so the screens are generated as SVG frames (390x844).

In Figma: drag `localready-all-screens.svg` (whole flow) or any file in `screens/` onto the canvas.
Text stays editable; ungroup once and use Frame (F) around each screen.

Regenerate after edits: `python3 design/figma/generate.py` (needs `pip install cairosvg` only for PNG previews).
