export function robustParseJSON(text: string): unknown {
  let cleaned = text.replace(/```(?:json)?\n?/g, '').trim()

  const firstBrace = cleaned.indexOf('{')
  if (firstBrace === -1) {
    throw new Error('No JSON object found in Claude response')
  }

  let depth = 0
  let end = -1
  let inString = false
  let escapeNext = false

  for (let i = firstBrace; i < cleaned.length; i++) {
    const char = cleaned[i]

    if (escapeNext) {
      escapeNext = false
      continue
    }

    if (char === '\\') {
      escapeNext = true
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (!inString) {
      if (char === '{') depth++
      if (char === '}') {
        depth--
        if (depth === 0) {
          end = i + 1
          break
        }
      }
    }
  }

  if (end === -1) {
    throw new Error('No complete JSON object found in Claude response')
  }

  cleaned = cleaned.slice(firstBrace, end)

  try {
    return JSON.parse(cleaned)
  } catch {
    cleaned = cleaned
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"')
      .replace(/—/g, '-')
      .replace(/–/g, '-')

    try {
      return JSON.parse(cleaned)
    } catch (e) {
      throw new Error(`Could not parse Claude response as JSON: ${e}`)
    }
  }
}
