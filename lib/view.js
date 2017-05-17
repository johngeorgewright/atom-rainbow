'use babel'

function createElement (text, level) {
  let element = document.createElement('span')
  element.classList.add('rainbow-item')
  element.classList.add(`rainbow-level-${level}`)
  element.innerText = text
  return element
}

export default function (editor, marker, text, level) {
  let item = createElement(text, level)
  return editor.decorateMarker(marker, {
    class: 'rainbow',
    item,
    type: 'overlay'
  })
}
