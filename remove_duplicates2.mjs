import fs from 'fs';
const filePath = 'E:\\ruan\\src\\components\\PedidoModal.tsx';
let c = fs.readFileSync(filePath, 'utf8');
let lines = c.split('\n');

// Remove duplicate block: lines 654-831 (indices 653-830)
// Start: index 653 (line 654) - {/* ARTE ORIGINAL DO CLIENTE... */}
// End: index 830 (line 831) -               )}

console.log('Removing indices 653 to 830 (lines 654-831)');
lines.splice(653, 830 - 653 + 1);

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Done');