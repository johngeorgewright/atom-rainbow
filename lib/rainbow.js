'use babel'

import {CompositeDisposable} from 'atom'
import view from './view'
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
    let disposable = atom.workspace.observeTextEditors(editor => {
      if (!this.markers.get(editor)) this.markers.set(editor, [])
      let run = debounce(() => this.run(editor), DELAY)
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
    let markers = this.markers.get(editor)
    while (markers.length) markers.pop().destroy()
  },

  unmarkAllEditors () {
    atom.workspace.getTextEditors().forEach(editor => this.unmark(editor))
  },

  mark (editor) {
    let level = 0
    editor.scan(PAIRS_REG_EXP, result => {
      if (PAIRS[result.matchText]) level++
      let marker = editor.markBufferRange(result.range, {
        invalidate: 'never'
      })
      this.markers.get(editor).push(marker)
      view(editor, marker, result.matchText, level)
      if (!PAIRS[result.matchText]) level--
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
