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
    colorRange: {
      name: 'Color Range Background',
      description: 'Add a touch of color between brackets.',
      type: 'boolean',
      default: false
    }
  },

  activate () {
    const delay = atom.config.get('rainbow.delay')

    this.subscriptions = new CompositeDisposable()
    this.editors = []

    const disposable = atom.workspace.observeTextEditors(editor => {
      const rootScopeDescriptor = editor.getRootScopeDescriptor()

      const settings = {
        colorRange: atom.config.get('rainbow.colorRange', { scope: rootScopeDescriptor }),
        quotes: [...atom.config.get('rainbow.quotes', { scope: rootScopeDescriptor }).trim()],
        pairs: atom.config.get('rainbow.pairs', { scope: rootScopeDescriptor }).trim()
      }

      const rainbowEditor = new RainbowEditor(editor, settings)

      const run = debounce(() => {
        const markers = [...rainbowEditor.markers]
        rainbowEditor.mark()
        rainbowEditor.destroyMarkers(markers)
        rainbowEditor.shiftMarkers(markers.length)
        console.log(rainbowEditor.markers.length)
      }, delay)

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
