'use babel';

import {CompositeDisposable} from 'atom';
import view from './view';
import debounce from 'lodash.debounce';

const PAIRS = {
  '{': '}',
  '[': ']',
  '(': ')'
};

export default {

  subscriptions: null,
  markers: [],

  activate() {
    this.subscriptions = new CompositeDisposable();
    atom.workspace.observeTextEditors(editor => {
      let mark = () => this.mark(editor);
      this.unmark();
      mark();
      this.subscriptions.add(editor.onDidStopChanging(debounce(mark, 100)));
    });
  },

  unmark() {
    while (this.markers.length) {
      this.markers.pop().destroy();
    }
  },

  mark(editor) {
    let level = 0;
    editor.scan(/[\[\]{}\(\)]/g, result => {
      if (PAIRS[result.matchText]) level++;
      let marker = editor.markBufferRange(result.range);
      this.markers.push(view(editor, marker, result.matchText, level));
      if (!PAIRS[result.matchText]) level--;
    });
  },

  deactivate() {
    console.log('DEACTIVATING');
    this.subscriptions.dispose();
    this.unmark();
  },

  serialize() {
    return {};
  }

};
