'use babel';

import * as grammers from './grammers';

function is(type, {classList, innerText}) {
  return Object.keys(type).find(className => (
    classList.contains(className) && innerText === type[className]
  ));
}

function manipulateElement({classList, dataset}, level) {
  classList.add('rainbow');
  dataset.rainbowLevel = level;
}

export default function(grammer, {shadowRoot}) {
  if (!grammers[grammer]) return;

  const {OPEN, CLOSE, SEARCH} = grammers[grammer];
  let elements = shadowRoot.querySelectorAll(SEARCH);
  let level = 0;

  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    if (is(OPEN, element)) {
      manipulateElement(element, level);
      level++;
    } else if (is(CLOSE, element)) {
      level--;
      manipulateElement(element, level);
    }
  }
}
