const fs = require('fs');
let c = fs.readFileSync('src/components/PedidoModal.tsx', 'utf8');
let l = c.split('\n');
if (l[383].trim() === '<div>') {
  l[383] = '            <div><div className="space-y-4">';
  console.log('L384 ok');
}
for (let i = 630; i < l.length; i++) {
  if (l[i].trim() === '</div>' && l[i+1]?.trim() === ')}') {
    l[i] = '              </div></div>';
    console.log('L' + (i+1) + ' ok');
    break;
  }
}
fs.writeFileSync('src/components/PedidoModal.tsx', l.join('\n'));
console.log('Done');