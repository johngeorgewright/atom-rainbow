'use babel'

import { CompositeDisposable, Range } from 'atom'
import debounce from 'lodash.debounce'
import escapeStringRegexp from 'escape-string-regexp'
import { regExpIgnoreSurroundingChar, stringToPairs } from './util'

export default {
  subscriptions: null,
  pairs: {},
  pairsRegExp: null,
  markers: new Map(),

  config: {
    delay: {
      name: 'Delay',
      description: 'An amount of milliseconds to delay re-rending. Increase this if you find there are any performance issues.',
      type: 'number',
      default: 170
    },
    pairs: {
      name: 'Opening/closing pairs',
      description: 'A string of closing and opening pairs.',
      type: 'string',
      default: '[]{}()'
    },
    quotes: {
      name: 'Quotes',
      description: 'The surrounding characters that will turn off pairing.',
      type: 'string',
      default: '\'"`'
    }
  },

  activate () {
    const pairConfig = atom.config.get('rainbow.pairs')
    this.subscriptions = new CompositeDisposable()
    this.pairs = stringToPairs(atom.config.get('rainbow.pairs'))
    this.pairsRegExp = new RegExp(
      `[${escapeStringRegexp(pairConfig)}]` +
      [...atom.config.get('rainbow.quotes')].map(regExpIgnoreSurroundingChar).join(''),
      'g'
    )

    const disposable = atom.workspace.observeTextEditors(editor => {
      if (!this.markers.get(editor)) this.markers.set(editor, [])

      const run = debounce(() => this.run(editor), parseInt(atom.config.get('rainbow.delay')))

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

    editor.scan(this.pairsRegExp, result => {
      if (this.pairs[result.matchText]) {
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
