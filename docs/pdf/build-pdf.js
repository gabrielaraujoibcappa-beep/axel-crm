// Monta um markdown mestre a partir dos capitulos de um diretorio, para gerar o PDF.
//
// Uso: node build-pdf.js <diretorio-dos-capitulos> <arquivo-de-saida.md>
//
// Considera capitulo todo arquivo cujo nome comeca com dois digitos (01-*.md, 02-*.md, ...),
// em ordem alfabetica. README.md fica de fora: o sumario do PDF e gerado pelo Pandoc.
const fs = require('fs');
const path = require('path');

const docsDir = process.argv[2];
const outFile = process.argv[3];

if (!docsDir || !outFile) {
  console.error('Uso: node build-pdf.js <diretorio> <saida.md>');
  process.exit(1);
}

const chapters = fs
  .readdirSync(docsDir)
  .filter(f => /^\d{2}-.*\.md$/.test(f))
  .sort();

if (chapters.length === 0) {
  console.error(`Nenhum capitulo (NN-*.md) encontrado em ${docsDir}`);
  process.exit(1);
}

const anchorOf = file => 'doc-' + file.slice(0, 2);

function rewriteLinks(md) {
  // Links entre capitulos viram ancoras internas do PDF.
  for (const file of chapters) {
    md = md.split(`(${file})`).join(`(#${anchorOf(file)})`);
  }
  // Links para arquivos fora do diretorio viram texto simples (nao existem no PDF).
  md = md.replace(/\[`?\.\.\/([A-Za-z.\-]+)`?\]\(\.\.\/[^)]+\)/g, '`$1`');
  md = md.replace(/\[([^\]]+)\]\(\.\.\/[^)]+\)/g, '$1');
  return md;
}

const out = chapters.map(file => {
  const md = rewriteLinks(fs.readFileSync(path.join(docsDir, file), 'utf8').trim());
  return `<div class="chapter" id="${anchorOf(file)}"></div>\n\n${md}`;
});

fs.writeFileSync(outFile, out.join('\n\n'), 'utf8');
console.log(`markdown mestre: ${outFile} (${out.length} capitulos)`);
