import fs from 'fs';
const filePath = 'E:\\ruan\\src\\components\\PedidoModal.tsx';
let c = fs.readFileSync(filePath, 'utf8');
let lines = c.split('\n');

// Find and remove the duplicated old block
// It starts around line 654 (index 653) with: {/* ARTE ORIGINAL DO CLIENTE (enviada pelo vendedor na criacao do pedido) */}
// And ends around line 830 with:               )}
// We need to find the exact boundaries

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Start of duplicate block
  if (line.includes('ARTE ORIGINAL DO CLIENTE (enviada pelo vendedor na criacao do pedido)') && i > 600) {
    startIdx = i - 1; // include the comment line before
    console.log('Found start at line', startIdx + 1);
  }
  // End of duplicate block - look for the closing pattern
  if (startIdx !== -1 && i > startIdx) {
    // The block ends with:               )}  (line 830 area)
    // followed by:               <div className="flex flex-col md:flex-row gap-3 pt-2 no-print">
    if (line.trim() === ')}' && lines[i+1]?.includes('Botoes de acao por etapa')) {
      endIdx = i;
      console.log('Found end at line', endIdx + 1);
      break;
    }
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  console.log('Removing lines', startIdx + 1, 'to', endIdx + 1);
  lines.splice(startIdx, endIdx - startIdx + 1);
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log('Done removing duplicates');
} else {
  console.log('Could not find boundaries. startIdx:', startIdx, 'endIdx:', endIdx);
}