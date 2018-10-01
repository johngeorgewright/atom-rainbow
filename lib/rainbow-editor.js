'use babel'

import { Range } from 'atom'
import RainbowEditorScanner from './rainbow-editor-scanner'

export default class RainbowEditor {
  constructor (editor) {
    this.editor = editor
    this.colorRange = false
    this.markers = []
    this.pairs = ''
    this.quotes = []
    this.mark = this.mark.bind(this)
  }

  destroyMarkers (markers = this.markers) {
    for (const marker of markers) {
      marker.destroy()
    }

    this.markers = this.markers.slice(markers.length)
  }

  mark ({ start, end, className }) {
    const range = new Range(start, end)
    const marker = this.editor.markBufferRange(range, { invalidate: 'never' })

    this.markers.push(marker)
    this.editor.decorateMarker(marker, {
      class: className,
      type: 'highlight'
    })
  }

  run () {
    const scanner = new RainbowEditorScanner(this.editor, {
      colorRange: this.colorRange,
      pairs: this.pairs,
      quotes: this.quotes
    })

    console.time(`rainbow scan: ${scanner.id}`)

    scanner.on('end', () => {
      console.timeEnd(`rainbow scan: ${scanner.id}`)
    })

    scanner.on('data', this.mark)
  }

  deactivate () {
    this.destroyMarkers()
  }
}
