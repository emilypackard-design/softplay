// Maps each city name to a "canonical" name so slight variants group together.
// Rule: a name folds into a SHORTER name only when that shorter name is a word-prefix
// of it — e.g. "Greystones Ireland" → "Greystones", "Brattleboro VT" → "Brattleboro".
// Different qualifiers stay separate: "Cambridge England" vs "Cambridge MA" do NOT merge
// (neither is a prefix of the other). Full reconciliation (drag-and-drop) is a V2 item.

const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ')
// true when `a` is a word-prefix of `b` (same, or b starts with "a ")
const isWordPrefix = (a: string, b: string) => b === a || b.startsWith(a + ' ')

export function canonicalCityMap(cityNames: string[]): Record<string, string> {
  const unique = Array.from(new Set(cityNames))
  const map: Record<string, string> = {}
  for (const name of unique) {
    const nn = norm(name)
    let canonical = name
    let canonicalLen = nn.length
    for (const other of unique) {
      const on = norm(other)
      if (isWordPrefix(on, nn) && on.length < canonicalLen) {
        canonical = other
        canonicalLen = on.length
      }
    }
    map[name] = canonical
  }
  return map
}

// Convenience: the canonical name for one city given the full set present.
export function canonicalCity(target: string, allCityNames: string[]): string {
  return canonicalCityMap([target, ...allCityNames])[target] ?? target
}
