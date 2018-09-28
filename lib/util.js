'use babel'

export const stringToPairs = str => {
  const pairs = {}

  for (let i = 0; i < str.length; i += 2) {
    const key = str[i]
    const value = str[i + 1]

    pairs[key] = value
  }

  return pairs
}

export const regExpIgnoreSurroundingChar = char =>
  `(?=([^${char}]*${char}[^${char}]*${char})*[^${char}]*$)`
