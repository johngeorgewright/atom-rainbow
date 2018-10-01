'use babel'

import { Range } from 'atom'
import RainbowEditorScanner from './rainbow-editor-scanner'

export default class RainbowEditor {
  constructor (editor, { colorRange, pairs, quotes }) {
    this.editor = editor
    this.colorRange = colorRange
    this.markers = []
    this.pairs = pairs
    this.quotes = quotes
  }

  destroyMarkers (markers = this.markers) {
    for (const marker of markers) {
      marker.destroy()
    }
  }

  shiftMarkers (amount) {
    this.markers = this.markers.slice(amount)
  }

  unmark () {
    this.destroyMarkers()
    this.markers = []
  }

  mark () {
    const scanner = new RainbowEditorScanner(this.editor, {
      pairs: this.pairs,
      quotes: this.quotes
    })

    console.time(`rainbow scan: ${scanner.id}`)

    scanner.on('end', () => {
      console.timeEnd(`rainbow scan: ${scanner.id}`)
    })

    scanner.on('data', ({ start, end, className }) => {
      const range = new Range(start, end)
      const marker = this.editor.markBufferRange(range, { invalidate: 'never' })

      this.markers.push(marker)

      this.editor.decorateMarker(marker, {
        class: className,
        type: 'highlight'
      })
    })
  }

  deactivate () {
    this.unmark()
  }

  serialize () {
    return {}
  }
}
