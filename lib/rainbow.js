'use babel'

import {CompositeDisposable, Range} from 'atom'
import debounce from 'lodash.debounce'
import escapeRegexp from 'escape-string-regexp'

const PAIRS = {
  '{': '}',
  '[': ']',
  '(': ')'
}

const PAIRS_REG_EXP = new RegExp(`[${Object.keys(PAIRS).map(open => (
  escapeRegexp(open + PAIRS[open])
)).join('')}]`, 'g')

const DELAY = 170

export default {
  subscriptions: null,
  markers: new Map(),

  activate () {
    this.subscriptions = new CompositeDisposable()
    const disposable = atom.workspace.observeTextEditors(editor => {
      if (!this.markers.get(editor)) this.markers.set(editor, [])

      const run = debounce(() => this.run(editor), DELAY)

      run()
      this.subscriptions.add(editor.onDidStopChanging(run))
    })
    this.subscriptions.add(disposable)
  },

  run (editor) {
    this.unmark(editor)
    this.mark(editor)
  },

  unmark (editor) {
    const markers = this.markers.get(editor)
    while (markers.length) markers.pop().destroy()
  },

  unmarkAllEditors () {
    atom.workspace.getTextEditors().forEach(editor => this.unmark(editor))
  },

  mark (editor) {
    let level = 0
    const startPoints = []

    editor.scan(PAIRS_REG_EXP, result => {
      if (PAIRS[result.matchText]) {
        startPoints.push(result.range.start)
        level++
        return
      }

      const start = startPoints.pop()
      const marker = editor.markBufferRange(new Range(start, result.range.end), {
        invalidate: 'never'
      })

      this.markers.get(editor).push(marker)

      editor.decorateMarker(marker, {
        class: `rainbow rainbow-level-${level}`,
        type: 'highlight'
      })

      level--
    })
  },

  deactivate () {
    this.unmarkAllEditors()
    this.markers.clear()
    this.subscriptions.dispose()
  },

  serialize () {
    return {}
  }
}
