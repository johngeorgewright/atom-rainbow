'use babel'

import { Range } from 'atom'
import escapeStringRegexp from 'escape-string-regexp'
import { regExpIgnoreSurroundingChar, stringToPairs } from './util'

export default class RainbowEditor {
  constructor ({
    editor,
    pairs,
    quotes
  }) {
    this.markers = []
    this.editor = editor
    this.pairs = stringToPairs(pairs)
    this.ends = Object.values(this.pairs)
    this.pairsRegExp = new RegExp(
      `[${escapeStringRegexp(pairs)}]` +
      [...quotes].map(regExpIgnoreSurroundingChar).join(''),
      'g'
    )
  }

  run () {
    this.unmark()
    this.mark()
  }

  unmark () {
    while (this.markers.length) this.markers.pop().destroy()
  }

  mark () {
    let level = 0
    const startPoints = []

    this.editor.scan(this.pairsRegExp, result => {
      if (this.pairs[result.matchText]) {
        startPoints.push(result.range.start)
        level++
        return
      }

      const start = startPoints.pop()
      const marker = this.editor.markBufferRange(new Range(start, result.range.end), {
        invalidate: 'never'
      })

      this.markers.push(marker)

      this.editor.decorateMarker(marker, {
        class: `rainbow rainbow-level-${level} rainbow-pair-${this.ends.indexOf(result.matchText) + 1}`,
        type: 'highlight'
      })

      level--
    })
  }

  deactivate () {
    this.unmark()
    this.markers.length = 0
  }

  serialize () {
    return {}
  }
}
