'use babel'

import { Readable } from 'stream'
import escapeStringRegexp from 'escape-string-regexp'
import { regExpIgnoreSurroundingChar, stringToPairs } from './util'

export default class RainbowEditorScanner extends Readable {
  constructor (editor, { colorRange, pairs, quotes, ...options }) {
    super({
      objectMode: true,
      ...options
    })

    this.id = ++RainbowEditorScanner.id
    this.editor = editor
    this.level = 0
    this.colorRange = colorRange
    this.pairs = stringToPairs(pairs)
    this.ends = Object.values(this.pairs)
    this.stop = () => {}
    this.pairsRegExp = new RegExp(
      `[${escapeStringRegexp(pairs)}]` +
      quotes.map(regExpIgnoreSurroundingChar).join(''),
      'g'
    )
  }

  getClassName (text) {
    let className =
      'rainbow ' +
      `rainbow-level-${this.level} ` +
      `rainbow-pair-${this.ends.indexOf(text) + 1}`

    if (this.colorRange) {
      className += ' rainbow-color-range'
    }

    return className
  }

  _read () {
    const startPoints = []

    this.editor.scan(this.pairsRegExp, result => {
      this.stop = result.stop

      if (this.pairs[result.matchText]) {
        startPoints.push(result.range.start)
        this.level++
        return
      }

      this.push({
        start: startPoints.pop(),
        end: result.range.end,
        className: this.getClassName(result.matchText)
      })

      this.level--
    })

    this.stop = () => {}
    this.push(null)
  }

  _destroy (_err, callback) {
    this.stop()
    callback()
  }
}

RainbowEditorScanner.id = 0
