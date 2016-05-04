'use babel';

export const SEARCH = `
  .brace,
  .brace .square,
  .parameters,
  .arguments,
  .modules
`;

export const OPEN = {
  brace: '{',
  square: '[',
  modules: '{',
  parameters: '(',
  arguments: '(',
  round: '('
};

export const CLOSE = {
  brace: '}',
  square: ']',
  modules: '}',
  parameters: ')',
  arguments: ')',
  round: ')'
};
