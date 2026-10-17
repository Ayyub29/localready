#!/usr/bin/env python3
"""Generates LocalReady UI screens as SVG frames (import into Figma by drag-and-drop).

Run: python3 design/figma/generate.py
Outputs: design/figma/screens/*.svg, design/figma/localready-all-screens.svg, previews/*.png
"""
import os
from xml.sax.saxutils import escape

W, H = 390, 844
FONT = "Plus Jakarta Sans, Inter, Helvetica, Arial, sans-serif"
TEAL, TEAL2, DEEP = "#14b8a6", "#0d9488", "#0f766e"
INK, MUTED, LINE, BG = "#0f172a", "#64748b", "#e2e8f0", "#f4f7fb"
GOLD, GOLD_D, ROSE = "#f59e0b", "#b45309", "#e11d48"


class Frame:
    def __init__(self, name):
        self.name = name
        self.parts = []
        self._n = 0

    def add(self, s):
        self.parts.append(s)

    def rect(self, x, y, w, h, fill="#fff", r=0, stroke=None, sw=1, op=None, shadow=False):
        a = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"'
        if stroke:
            a += f' stroke="{stroke}" stroke-width="{sw}"'
        if op is not None:
            a += f' opacity="{op}"'
        if shadow:
            a += ' filter="url(#sh)"'
        self.add(a + "/>")

    def circle(self, cx, cy, r, fill, stroke=None, sw=1, shadow=False):
        a = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"'
        if stroke:
            a += f' stroke="{stroke}" stroke-width="{sw}"'
        if shadow:
            a += ' filter="url(#sh)"'
        self.add(a + "/>")

    def text(self, x, y, s, size=14, weight=500, fill=INK, anchor="start", ls=None):
        a = (f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" '
             f'font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"')
        if ls:
            a += f' letter-spacing="{ls}"'
        self.add(a + f">{escape(s)}</text>")

    def path(self, d, stroke=INK, sw=2, fill="none"):
        self.add(f'<path d="{d}" stroke="{stroke}" stroke-width="{sw}" fill="{fill}" '
                 'stroke-linecap="round" stroke-linejoin="round"/>')

    def line(self, x1, y1, x2, y2, stroke=LINE, sw=1, dash=None):
        a = f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"'
        if dash:
            a += f' stroke-dasharray="{dash}"'
        self.add(a + "/>")

    # ---- components
    def status_bar(self, light=False):
        c = "#fff" if light else INK
        self.text(24, 30, "9:41", 14, 700, c)
        self.rect(330, 20, 22, 11, "none", 3, stroke=c, sw=1.5)
        self.rect(332, 22, 14, 7, c, 1.5)

    def button(self, x, y, w, label, kind="primary", h=52):
        if kind == "primary":
            self.rect(x, y + 5, w, h, DEEP, 16)
            self.rect(x, y, w, h, TEAL2, 16)
            self.text(x + w / 2, y + h / 2 + 5, label, 16, 800, "#fff", "middle")
        elif kind == "light":
            self.rect(x, y + 4, w, h, "#cbd5e1", 16)
            self.rect(x, y, w, h, "#fff", 16, stroke=LINE)
            self.text(x + w / 2, y + h / 2 + 5, label, 16, 800, TEAL2, "middle")
        else:
            self.text(x + w / 2, y + h / 2 + 5, label, 15, 700, MUTED, "middle")

    def card(self, x, y, w, h, r=18, fill="#fff"):
        self.rect(x, y, w, h, fill, r, stroke=LINE, shadow=True)

    def chip(self, x, y, label, on=False, w=None):
        w = w or (len(label) * 7.6 + 28)
        self.rect(x, y, w, 32, TEAL2 if on else "#fff", 16, stroke=None if on else LINE)
        self.text(x + w / 2, y + 21, label, 13, 700, "#fff" if on else MUTED, "middle")
        return w

    def progress(self, x, y, w, pct, h=8):
        self.rect(x, y, w, h, "#e2e8f0", h / 2)
        self.rect(x, y, max(h, w * pct), h, TEAL, h / 2)

    def nav(self, active):
        self.rect(0, 764, W, 80, "#fff", 0, stroke=LINE)
        items = [("Learn", "home"), ("Phrases", "book"), ("Review", "check"), ("Profile", "user")]
        for i, (label, ic) in enumerate(items):
            cx = 49 + i * 97
            on = label == active
            col = TEAL2 if on else "#94a3b8"
            if on:
                self.rect(cx - 26, 774, 52, 32, "#f0fdfa", 14)
            if ic == "home":
                self.path(f"M{cx-10} {793} L{cx} {782} L{cx+10} {793} V{802} H{cx-10} Z", col, 2)
            elif ic == "book":
                self.path(f"M{cx-9} 781 H{cx+9} V803 L{cx} 798 L{cx-9} 803 Z", col, 2)
                self.path(f"M{cx-4} 787 H{cx+4}", col, 2)
            elif ic == "check":
                self.circle(cx, 792, 11, "none", col, 2)
                self.path(f"M{cx-5} 792 L{cx-1} 796 L{cx+6} 788", col, 2)
            else:
                self.circle(cx, 786, 5, "none", col, 2)
                self.path(f"M{cx-10} 804 C{cx-10} 794 {cx+10} 794 {cx+10} 804", col, 2)
            self.text(cx, 826, label, 11, 700 if on else 600, col, "middle")

    def header_back(self, title, sub=None):
        self.path("M28 66 L20 74 L28 82", INK, 2.5)
        self.text(48, 79, title, 18, 800)
        if sub:
            self.text(48, 98, sub, 12, 600, MUTED)

    def svg(self, x=0, y=0, standalone=True):
        inner = "\n".join(self.parts)
        body = (f'<g id="{self.name}" transform="translate({x},{y})">'
                f'<clipPath id="c{abs(hash(self.name))}"><rect width="{W}" height="{H}" rx="28"/></clipPath>'
                f'<g clip-path="url(#c{abs(hash(self.name))})">'
                f'<rect width="{W}" height="{H}" fill="{BG}"/>\n{inner}</g>'
                f'<rect width="{W}" height="{H}" rx="28" fill="none" stroke="#cbd5e1" stroke-width="2"/></g>')
        return body


DEFS = ('<defs><filter id="sh" x="-10%" y="-10%" width="120%" height="130%">'
        '<feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.07"/>'
        "</filter></defs>")

COUNTRIES = [
    ("Japan", "Japanese", "JP", "#fecdd3"),
    ("Korea", "Korean", "KR", "#bae6fd"),
    ("Thailand", "Thai", "TH", "#ddd6fe"),
    ("Vietnam", "Vietnamese", "VN", "#fecaca"),
    ("Indonesia", "Indonesian", "ID", "#bbf7d0"),
]


def flag(f, cx, cy, code, bg, r=22):
    f.circle(cx, cy, r, bg)
    f.text(cx, cy + 5, code, 13, 800, INK, "middle")


def onboarding(step):
    f = Frame(f"01-onboarding-{step}")
    f.rect(0, 0, W, H, TEAL2)
    f.circle(330, 120, 150, TEAL, None)
    f.circle(40, 700, 120, DEEP)
    f.status_bar(True)
    titles = [
        ("Get locally ready", "before you land.", "Short, situational lessons for the\ntrip you are about to take."),
        ("Learn real situations", "not grammar trees.", "Hotels, trains, restaurants and more:\nsee a conversation, learn the phrases,\nthen quiz yourself."),
        ("Your phrase list,", "on the ground.", "A searchable travel phrase list with\nmeanings, always one tap away."),
    ]
    a, b, c = titles[step - 1]
    f.rect(95, 170, 200, 200, "#ffffff", 100, op=0.15)
    emoji = ["Hello!", "Menu?", "Thanks"][step - 1]
    f.rect(115, 240, 160, 60, "#fff", 24)
    f.text(195, 278, emoji, 22, 800, DEEP, "middle")
    f.rect(155, 310, 80, 40, "#fff", 20, op=0.85)
    f.text(195, 462, a, 28, 800, "#fff", "middle")
    f.text(195, 498, b, 28, 800, "#ccfbf1", "middle")
    for i, ln in enumerate(c.split("\n")):
        f.text(195, 540 + i * 22, ln, 14, 500, "#e6fffb", "middle")
    for i in range(3):
        on = i == step - 1
        f.rect(165 + i * 20 - (6 if on else 0), 640, 20 if on else 8, 8, "#fff" if on else "#5eead4", 4)
    label = "Next" if step < 3 else "Get started"
    f.rect(24, 695, 342, 57, "#0b5e56", 16)
    f.rect(24, 690, 342, 52, "#fff", 16)
    f.text(195, 722, label, 16, 800, DEEP, "middle")
    if step < 3:
        f.text(195, 778, "Skip", 14, 700, "#ccfbf1", "middle")
    return f


def pick_country():
    f = Frame("02-pick-country")
    f.status_bar()
    f.text(24, 90, "Where are you going?", 26, 800)
    f.text(24, 114, "Pick a country. You can add more later.", 14, 500, MUTED)
    for i, (n, l, code, bg) in enumerate(COUNTRIES):
        y = 140 + i * 84
        sel = i == 0
        f.rect(24, y, 342, 72, "#f0fdfa" if sel else "#fff", 18, stroke=TEAL if sel else LINE, sw=2 if sel else 1, shadow=True)
        flag(f, 62, y + 36, code, bg, 24)
        f.text(100, y + 32, n, 17, 800)
        f.text(100, y + 52, l, 13, 500, MUTED)
        if sel:
            f.circle(336, y + 36, 12, TEAL2)
            f.path(f"M330 {y+36} L334 {y+40} L342 {y+31}", "#fff", 2.5)
        else:
            f.circle(336, y + 36, 12, "none", "#cbd5e1", 2)
    f.button(24, 690, 342, "Continue")
    return f


def lessons_list():
    f = Frame("03-lessons-list")
    f.status_bar()
    f.rect(24, 50, 342, 64, "#fff", 18, stroke=LINE, shadow=True)
    flag(f, 56, 82, "JP", "#fecdd3", 20)
    f.text(88, 78, "Japan", 16, 800)
    f.text(88, 97, "Japanese", 12, 500, MUTED)
    f.text(350, 78, "2 / 8", 18, 800, TEAL2, "end")
    f.text(350, 97, "lessons done", 11, 600, MUTED, "end")
    f.rect(24, 128, 342, 64, TEAL2, 18)
    f.rect(24, 128, 342, 64, "none", 18)
    f.text(44, 156, "TRIP PROGRESS", 11, 800, "#99f6e4", ls=1)
    f.text(44, 178, "25% ready for your trip", 16, 800, "#fff")
    f.rect(240, 156, 106, 8, "#0f766e", 4)
    f.rect(240, 156, 27, 8, "#fff", 4)
    nodes = [("Basics", "done", 0), ("Train", "done", 60), ("Money", "cur", 90), ("Restaurant", "lock", 40)]
    y = 238
    for i, (n, st, dx) in enumerate(nodes):
        cx = 195 + dx
        if st == "cur":
            f.rect(cx - 36, y - 40, 72, 28, "#fff", 12, stroke="#99f6e4", sw=2)
            f.text(cx, y - 21, "CONTINUE", 11, 800, DEEP, "middle", ls=0.5)
        col = {"done": (GOLD, GOLD_D), "cur": (TEAL, DEEP), "open": (TEAL, DEEP), "lock": ("#e2e8f0", "#cbd5e1")}[st]
        if st == "cur":
            f.circle(cx, y + 30, 40, "none", "#e2e8f0", 5)
            f.path(f"M{cx} {y-10} A40 40 0 1 1 {cx-28} {y+58}", TEAL2, 5)
        f.circle(cx, y + 36, 32, col[1])
        f.circle(cx, y + 30, 32, col[0])
        if st == "done":
            f.path(f"M{cx-10} {y+30} L{cx-3} {y+38} L{cx+11} {y+22}", "#fff", 4)
        elif st == "lock":
            f.rect(cx - 9, y + 28, 18, 14, "#94a3b8", 3)
            f.path(f"M{cx-5} {y+28} V{y+23} a5 5 0 0 1 10 0 V{y+28}", "#94a3b8", 2.5)
        else:
            f.text(cx, y + 38, str(i + 1), 24, 800, "#fff", "middle")
        f.text(cx, y + 84, n, 13, 800, MUTED if st == "lock" else INK, "middle")
        y += 130
    f.nav("Learn")
    return f


def lesson_detail(tab):
    names = {"conv": "04-lesson-conversation", "phrase": "05-lesson-phrases", "quiz": "06-lesson-quiz"}
    f = Frame(names[tab])
    f.status_bar()
    f.header_back("Restaurant", "Japan  -  Lesson 4")
    f.progress(24, 112, 342, 0.4)
    x = 24
    for label, key in (("Conversation", "conv"), ("Phrases", "phrase"), ("Quiz", "quiz")):
        x += f.chip(x, 130, label, key == tab, 112) + 8
    if tab == "conv":
        f.card(24, 182, 342, 70)
        f.text(40, 206, "SCENE", 11, 800, TEAL2, ls=1)
        f.text(40, 228, "You enter a small ramen shop in Tokyo.", 14, 600)
        f.text(40, 245, "The staff greets you at the door.", 14, 500, MUTED)
        rows = [("L", "Irasshaimase!", "Welcome!"), ("Y", "Futari desu.", "Table for two."),
                ("L", "Kochira e douzo.", "This way, please."), ("Y", "Menu o onegaishimasu.", "The menu, please.")]
        for i, (who, jp, en) in enumerate(rows):
            y = 272 + i * 96
            you = who == "Y"
            bx = 100 if you else 24
            f.rect(bx, y, 266, 82, TEAL2 if you else "#fff", 18, stroke=None if you else LINE, shadow=not you)
            tc = "#fff" if you else INK
            f.text(bx + 18, y + 32, jp, 17, 800, tc)
            f.text(bx + 18, y + 54, en, 13, 500, "#ccfbf1" if you else MUTED)
            f.text(bx + 18, y + 72, "Local" if not you else "You", 10, 800, "#99f6e4" if you else TEAL2, ls=1)
            f.circle(bx + 240, y + 26, 14, "#ffffff" if you else "#f0fdfa", None)
            f.path(f"M{bx+236} {y+20} L{bx+246} {y+26} L{bx+236} {y+32} Z", TEAL2, 1.5, TEAL2)
        f.button(24, 690, 342, "Next")
    elif tab == "phrase":
        ph = [("Menu o onegaishimasu", "Menu, please", "menyuu o onegaishimasu"),
              ("Osusume wa nan desu ka?", "What do you recommend?", "osusume wa nan desu ka"),
              ("Okaikei onegaishimasu", "The bill, please", "okaikei onegaishimasu"),
              ("Arerugii ga arimasu", "I have an allergy", "arerugii ga arimasu")]
        for i, (jp, en, ro) in enumerate(ph):
            y = 186 + i * 112
            f.card(24, y, 342, 98)
            f.text(44, y + 36, jp, 18, 800)
            f.text(44, y + 58, ro, 12, 500, TEAL2)
            f.text(44, y + 80, en, 14, 500, MUTED)
            f.circle(334, y + 49, 20, "#f0fdfa")
            f.path(f"M326 {y+44} H331 L337 {y+39} V{y+59} L331 {y+54} H326 Z", TEAL2, 2)
        f.button(24, 690, 342, "Start quiz")
    else:
        f.text(24, 200, "Question 2 of 5", 12, 700, MUTED)
        f.card(24, 214, 342, 110)
        f.text(195, 254, "How do you ask for", 14, 600, MUTED, "middle")
        f.text(195, 282, "\"The bill, please\"?", 22, 800, INK, "middle")
        opts = ["Menu o onegaishimasu", "Okaikei onegaishimasu", "Arigatou gozaimasu", "Sumimasen"]
        for i, o in enumerate(opts):
            y = 346 + i * 74
            sel = i == 1
            f.rect(24, y + 4, 342, 58, "#99f6e4" if sel else "#cbd5e1", 16)
            f.rect(24, y, 342, 58, "#f0fdfa" if sel else "#fff", 16, stroke=TEAL if sel else LINE, sw=2)
            f.text(44, y + 35, o, 15, 700, DEEP if sel else INK)
        f.button(24, 690, 342, "Check")
    return f


def phrase_list():
    f = Frame("07-travel-phrase-list")
    f.status_bar()
    f.text(24, 78, "Travel phrases", 26, 800)
    f.text(24, 100, "Japan  -  tap to hear", 13, 500, MUTED)
    f.rect(24, 114, 342, 44, "#fff", 14, stroke=LINE)
    f.circle(46, 136, 7, "none", "#94a3b8", 2)
    f.text(64, 141, "Search phrases", 14, 500, "#94a3b8")
    x = 24
    for i, c in enumerate(["All", "Basics", "Food", "Transit", "Help"]):
        x += f.chip(x, 172, c, i == 0) + 8
    f.rect(24, 218, 342, 30, "#fff1f2", 10)
    f.text(40, 238, "Emergency phrases are always free", 12, 700, ROSE)
    ph = [("Sumimasen", "Excuse me / Sorry", "Basics"), ("Arigatou gozaimasu", "Thank you very much", "Basics"),
          ("Toire wa doko desu ka?", "Where is the toilet?", "Help"), ("Eki wa doko desu ka?", "Where is the station?", "Transit"),
          ("Kore o kudasai", "I'll take this, please", "Food"), ("Tasukete!", "Help!", "Emergency")]
    for i, (jp, en, tag) in enumerate(ph):
        y = 262 + i * 82
        f.card(24, y, 342, 70, 16)
        f.text(40, y + 29, jp, 16, 800)
        f.text(40, y + 52, en, 13, 500, MUTED)
        f.circle(336, y + 35, 18, "#f0fdfa")
        f.path(f"M329 {y+31} H333 L338 {y+27} V{y+43} L333 {y+39} H329 Z", TEAL2, 2)
    f.nav("Phrases")
    return f


def review():
    f = Frame("08-review")
    f.status_bar()
    f.text(24, 78, "Review", 26, 800)
    f.text(24, 100, "Quizzes you've taken. Retake any time.", 13, 500, MUTED)
    f.rect(24, 118, 342, 76, TEAL2, 18)
    f.text(44, 148, "THIS WEEK", 11, 800, "#99f6e4", ls=1)
    f.text(44, 176, "6 quizzes  -  84% avg", 18, 800, "#fff")
    f.text(346, 176, "Retake weakest", 12, 800, "#ccfbf1", "end")
    qs = [("Basics", "Japan", 5, 5, "#16a34a"), ("Train", "Japan", 4, 5, "#16a34a"), ("Money", "Japan", 3, 5, GOLD),
          ("Greetings", "Korea", 2, 5, ROSE), ("Basics", "Thailand", 5, 5, "#16a34a")]
    for i, (n, c, s, t, col) in enumerate(qs):
        y = 212 + i * 100
        f.card(24, y, 342, 88)
        f.text(44, y + 34, f"{n} quiz", 16, 800)
        f.text(44, y + 54, f"{c}  -  taken 2 days ago", 12, 500, MUTED)
        f.rect(44, y + 66, 150, 6, "#e2e8f0", 3)
        f.rect(44, y + 66, 150 * s / t, 6, col, 3)
        f.text(290, y + 40, f"{s}/{t}", 18, 800, col, "end")
        f.rect(298, y + 24, 56, 32, "#f0fdfa", 12)
        f.text(326, y + 45, "Retake", 12, 800, TEAL2, "middle")
    f.nav("Review")
    return f


def profile():
    f = Frame("09-profile")
    f.status_bar()
    f.text(24, 78, "Profile", 26, 800)
    f.card(24, 98, 342, 84)
    f.circle(66, 140, 28, TEAL2)
    f.text(66, 148, "A", 22, 800, "#fff", "middle")
    f.text(108, 134, "Ayyub", 17, 800)
    f.text(108, 154, "ayyub@email.com", 13, 500, MUTED)
    f.text(24, 218, "CURRENT LESSON", 11, 800, TEAL2, ls=1)
    f.rect(24, 232, 342, 96, TEAL2, 20)
    flag(f, 62, 266, "JP", "#fecdd3", 22)
    f.text(96, 262, "Japan  -  Japanese", 16, 800, "#fff")
    f.text(96, 282, "Lesson 3: Money  -  25% ready", 12, 600, "#ccfbf1")
    f.rect(44, 304, 302, 8, "#0f766e", 4)
    f.rect(44, 304, 76, 8, "#fff", 4)
    f.rect(24, 342, 342, 52, "#fff", 16, stroke=LINE)
    f.text(44, 374, "Show current lesson", 15, 800, DEEP)
    f.text(346, 374, ">", 16, 800, "#94a3b8", "end")
    f.rect(24, 406, 342, 52, "#fff", 16, stroke=LINE)
    f.text(44, 438, "Change lesson", 15, 800, DEEP)
    f.text(346, 438, ">", 16, 800, "#94a3b8", "end")
    f.text(24, 494, "ACCOUNT", 11, 800, MUTED, ls=1)
    for i, t in enumerate(["Language: English", "Notifications", "Upgrade to Trip Pass", "Sign out"]):
        y = 508 + i * 56
        f.rect(24, y, 342, 48, "#fff", 14, stroke=LINE)
        f.text(44, y + 30, t, 14, 700, ROSE if t == "Sign out" else INK)
    f.nav("Profile")
    return f


def change_lesson():
    f = Frame("10-profile-change-lesson")
    f.status_bar()
    f.header_back("My lessons", "Switch or add a destination")
    items = [("Japan", "Japanese", "JP", "#fecdd3", 0.25, True), ("Korea", "Korean", "KR", "#bae6fd", 0.1, False)]
    for i, (n, l, code, bg, p, cur) in enumerate(items):
        y = 120 + i * 112
        f.rect(24, y, 342, 98, "#f0fdfa" if cur else "#fff", 18, stroke=TEAL if cur else LINE, sw=2 if cur else 1, shadow=True)
        flag(f, 62, y + 36, code, bg, 22)
        f.text(98, y + 34, n, 16, 800)
        f.text(98, y + 54, l, 12, 500, MUTED)
        if cur:
            f.rect(274, y + 18, 74, 24, TEAL2, 12)
            f.text(311, y + 35, "CURRENT", 10, 800, "#fff", "middle", ls=1)
        else:
            f.rect(282, y + 18, 66, 24, "#fff", 12, stroke=LINE)
            f.text(315, y + 35, "Switch", 11, 800, TEAL2, "middle")
        f.progress(44, y + 74, 302, p)
    y = 120 + 2 * 112
    f.rect(24, y, 342, 72, "none", 18, stroke="#94a3b8", sw=2)
    f.circle(62, y + 36, 18, "#f0fdfa")
    f.path(f"M62 {y+28} V{y+44} M54 {y+36} H70", TEAL2, 3)
    f.text(98, y + 42, "Add lesson", 16, 800, TEAL2)
    f.text(195, 470, "Add lesson opens Pick country", 12, 600, MUTED, "middle")
    f.nav("Profile")
    return f


def flow_labels():
    return [
        ("Onboarding 1", 0), ("Onboarding 2", 1), ("Onboarding 3", 2), ("Pick country", 3),
        ("Lessons list", 4), ("Conversation", 5), ("Phrases", 6), ("Quiz", 7),
        ("Phrase list tab", 8), ("Review tab", 9), ("Profile tab", 10), ("Change lesson", 11),
    ]


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, "screens")
    prev = os.path.join(here, "previews")
    os.makedirs(out, exist_ok=True)
    os.makedirs(prev, exist_ok=True)
    frames = [onboarding(1), onboarding(2), onboarding(3), pick_country(), lessons_list(),
              lesson_detail("conv"), lesson_detail("phrase"), lesson_detail("quiz"),
              phrase_list(), review(), profile(), change_lesson()]
    for f in frames:
        s = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{DEFS}{f.svg()}</svg>'
        open(os.path.join(out, f.name + ".svg"), "w").write(s)

    gap, cols = 60, 6
    rows = (len(frames) + cols - 1) // cols
    tw = cols * W + (cols + 1) * gap
    th = rows * (H + 70) + gap + 80
    parts = [f'<rect width="{tw}" height="{th}" fill="#eef2f7"/>',
             f'<text x="{gap}" y="52" font-family="{FONT}" font-size="30" font-weight="800" fill="{INK}">LocalReady - UI flow</text>']
    for i, f in enumerate(frames):
        x = gap + (i % cols) * (W + gap)
        y = 90 + (i // cols) * (H + 70)
        parts.append(f'<text x="{x}" y="{y-8}" font-family="{FONT}" font-size="14" font-weight="700" fill="{MUTED}">{escape(f.name)}</text>')
        parts.append(f.svg(x, y))
    allsvg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{tw}" height="{th}" viewBox="0 0 {tw} {th}">{DEFS}{"".join(parts)}</svg>'
    open(os.path.join(here, "localready-all-screens.svg"), "w").write(allsvg)

    try:
        import cairosvg
        for f in frames:
            cairosvg.svg2png(url=os.path.join(out, f.name + ".svg"), write_to=os.path.join(prev, f.name + ".png"), scale=1.5)
        cairosvg.svg2png(url=os.path.join(here, "localready-all-screens.svg"), write_to=os.path.join(prev, "overview.png"), scale=0.5)
    except ImportError:
        pass


if __name__ == "__main__":
    main()
