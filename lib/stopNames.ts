// Shared fuzzy name matching for venues/activities.
// Treats two names as the SAME place when one is a word-prefix of the other after
// normalization - so "Flour Bakery & Cafe" matches "Flour Bakery + Cafe (Seaport)",
// and "Arnold Arboretum" matches "Arnold Arboretum of Harvard University" -
// while genuinely different places ("Park Cafe" vs "Central Park Cafe") stay distinct.

export const normName = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // fold accents: e-acute -> e
    .replace(/['.,&()+\-\/]/g, ' ')                   // punctuation (incl. + and parens) -> space
    .replace(/’/g, ' ')                           // curly apostrophe
    .replace(/\s+/g, ' ')
    .trim()

export const sameStop = (a: string, b: string): boolean => {
  const na = normName(a), nb = normName(b)
  if (!na || !nb) return false
  if (na === nb) return true
  const [shorter, longer] = na.length <= nb.length ? [na, nb] : [nb, na]
  return longer.startsWith(shorter + ' ')
}
