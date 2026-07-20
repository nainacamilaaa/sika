export function buildChecklist(
  items: string[],
  state: Record<number, string | null | undefined>
): { label: string; value: string | null }[] {
  return items.map((label, i) => ({ label, value: state[i] ?? null }));
}