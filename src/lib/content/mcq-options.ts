export type McqOption = {
  id: string;
  label: string;
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = hashString(`${seed}:${i}`) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function uniqueLabels(labels: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const label of labels) {
    const key = label.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

export function buildMcqOptions(
  correctLabel: string,
  distractorLabels: string[],
  optionIdPrefix: string,
  maxOptions = 4,
): { options: McqOption[]; correctOptionId: string } {
  const correct = correctLabel.trim();
  const distractors = uniqueLabels(distractorLabels).filter((d) => d !== correct);
  const picked = distractors.slice(0, Math.max(1, maxOptions - 1));
  const labels = seededShuffle(uniqueLabels([correct, ...picked]), optionIdPrefix).slice(
    0,
    maxOptions,
  );
  const options = labels.map((label, index) => ({
    id: `${optionIdPrefix}-opt-${index}`,
    label,
  }));
  const correctOptionId =
    options.find((o) => o.label === correct)?.id ?? options[0]?.id ?? "";
  return { options, correctOptionId };
}
