'use babel';

import {CompositeDisposable} from 'atom';
import manipulate from './manipulate';

export default {

  subscriptions: null,

  activate() {
    this.subscriptions = new CompositeDisposable();
    this.toggle();
  },

  toggle() {
    atom.workspace.observeTextEditors(editor => {
      const view = atom.views.getView(editor);
      const grammer = editor.getGrammar().name;
      const manipulateEditor = manipulate.bind(null, grammer, view);
      view.classList.toggle('rainbow');
      if (view.classList.contains('rainbow')) {
        manipulateEditor();
        this.subscriptions.add(editor.onDidStopChanging(manipulateEditor));
      }
    });
  },

  deactivate() {
    console.log('DEACTIVATING');
    this.subscriptions.dispose();
    this.toggle();
  },

  serialize() {
    return {};
  }

};
