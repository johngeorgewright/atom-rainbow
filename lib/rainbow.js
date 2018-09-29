'use babel'

import { CompositeDisposable } from 'atom'
import debounce from 'lodash.debounce'
import RainbowEditor from './rainbow-editor'

export default {
  subscriptions: null,

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
    },
    languageSettings: {
      type: 'object',
      default: {}
    }
  },

  activate () {
    const pairs = atom.config.get('rainbow.pairs').trim()
    const quotes = atom.config.get('rainbow.quotes').trim()
    const delay = atom.config.get('rainbow.delay')
    const languageSettings = atom.config.get('rainbow.languageSettings') || {}

    this.subscriptions = new CompositeDisposable()
    this.editors = []

    const disposable = atom.workspace.observeTextEditors(editor => {
      const rainbowEditor = new RainbowEditor(Object.assign({
        editor,
        pairs,
        quotes
      }, languageSettings[editor.getGrammar().name] || {}))

      const run = debounce(() => rainbowEditor.run(), delay)

      run()

      this.editors.push(rainbowEditor)
      this.subscriptions.add(editor.onDidStopChanging(run))
    })

    this.subscriptions.add(disposable)
  },

  deactivateAllEditors () {
    this.editors.forEach(editor => editor.deactivate())
  },

  deactivate () {
    this.deactivateAllEditors()
    this.subscriptions.dispose()
  },

  serialize () {
    return {}
  }
}
