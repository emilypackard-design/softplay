// Maps each city name to a "canonical" name so slight variants group together.
// Rule: a name folds into a SHORTER name only when that shorter name is a word-prefix
// of it — e.g. "Greystones Ireland" → "Greystones", "Brattleboro, VT" → "Brattleboro".
// Different qualifiers stay separate: "Cambridge England" vs "Cambridge MA" do NOT merge
// (neither is a prefix of the other). Full reconciliation (drag-and-drop) is a V2 item.

// Normalise so two visually-identical names match even with stray invisible characters:
// lowercase, strip zero-width chars, turn punctuation + any whitespace (incl. non-breaking
// space) into single spaces, then trim.
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[​‌‍﻿]/g, '') // zero-width chars
    .replace(/[.,/]/g, ' ') // common punctuation → space
    .replace(/[\s ]+/g, ' ') // whitespace incl. non-breaking → single space
    .trim()

// true when `a` is a word-prefix of `b` (same, or b starts with "a ")
const isWordPrefix = (a: string, b: string) => b === a || b.startsWith(a + ' ')

export function canonicalCityMap(cityNames: string[]): Record<string, string> {
  const unique = Array.from(new Set(cityNames))
  const normOf = new Map(unique.map(n => [n, norm(n)]))
  const map: Record<string, string> = {}
  for (const name of unique) {
    const nn = normOf.get(name)!
    let baseName = name
    let baseNorm = nn
    for (const other of unique) {
      const on = normOf.get(other)!
      if (!isWordPrefix(on, nn)) continue
      // Prefer the shortest normalized base; for ties (same normalized form, e.g. an
      // invisible-char or comma difference) pick a deterministic representative so they
      // all land in one group.
      if (on.length < baseNorm.length || (on.length === baseNorm.length && other < baseName)) {
        baseName = other
        baseNorm = on
      }
    }
    map[name] = baseName
  }
  return map
}

// Convenience: the canonical name for one city given the full set present.
export function canonicalCity(target: string, allCityNames: string[]): string {
  return canonicalCityMap([target, ...allCityNames])[target] ?? target
}
