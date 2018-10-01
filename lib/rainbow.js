'use babel'

import { CompositeDisposable } from 'atom'
import debounce from 'lodash.debounce'
import RainbowEditor from './rainbow-editor'

export default {
  disposables: null,

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
    colorRange: {
      name: 'Color Range Background',
      description: 'Add a touch of color between brackets.',
      type: 'boolean',
      default: false
    }
  },

  activate () {
    let delay

    this.disposables = new CompositeDisposable()
    this.editors = []

    this.disposables.add(atom.config.observe('rainbow.delay', newValue => {
      delay = newValue
    }))

    this.disposables.add(atom.workspace.observeTextEditors(editor => {
      const scope = { scope: editor.getRootScopeDescriptor() }
      const rainbowEditor = new RainbowEditor(editor)
      const disposables = []

      const run = debounce(() => {
        const markers = [...rainbowEditor.markers]
        rainbowEditor.run()
        rainbowEditor.destroyMarkers(markers)
      }, delay)

      disposables.push(atom.config.observe('rainbow.colorRange', scope, newValue => {
        rainbowEditor.colorRange = newValue
      }))

      disposables.push(atom.config.observe('rainbow.quotes', scope, newValue => {
        rainbowEditor.quotes = [...newValue.trim()]
      }))

      disposables.push(atom.config.observe('rainbow.pairs', scope, newValue => {
        rainbowEditor.pairs = newValue.trim()
      }))

      run()

      this.editors.push(rainbowEditor)
      disposables.push(editor.onDidStopChanging(run))
      this.disposables.add(...disposables)

      editor.onDidDestroy(() => {
        disposables.forEach(disposable => {
          this.disposables.remove(disposable)
          disposable.dispose()
        })
      })
    }))
  },

  deactivateAllEditors () {
    this.editors.forEach(editor => editor.deactivate())
  },

  deactivate () {
    this.deactivateAllEditors()
    this.disposables.dispose()
  }
}
