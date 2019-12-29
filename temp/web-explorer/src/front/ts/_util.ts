let id = 0;
export function getId() {
  id += 1;
  return id;
}

export function formatCode(code: string) {
  // Remove useless indentation
  let lines = code.split('\n');
  const indent = lines.reduce((idt, currLine) => {
    if (currLine) {
      const currIndent = (currLine.match(/^[\s]+/) || [''])[0].length;
      idt = idt === -1 ? currIndent : Math.min(idt, currIndent);
    }
    return idt;
  }, -1);
  if (indent > 0) lines = lines.map(line => line.substr(indent));
  return lines.join('\n').trim().replace(/\n{2,}/g, '\n\n');
}
