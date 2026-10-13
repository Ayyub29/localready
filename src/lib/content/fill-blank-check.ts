export function normalizeFillBlankAnswer(value: string): string {
  return value.trim().toLowerCase();
}

export function isFillBlankCorrect(
  input: string,
  acceptedAnswers: string[],
): boolean {
  const normalized = normalizeFillBlankAnswer(input);
  if (!normalized) return false;
  return acceptedAnswers.some(
    (a) => normalizeFillBlankAnswer(a) === normalized,
  );
}
