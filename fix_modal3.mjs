import fs from 'fs';
const filePath = 'E:\\ruan\\src\\components\\PedidoModal.tsx';
let c = fs.readFileSync(filePath, 'utf8');
let l = c.split('\n');

// Line 384: <div><div className="space-y-4"> -> <div><>
if (l[383].includes('<div><div className="space-y-4">')) {
  l[383] = l[383].replace('<div><div className="space-y-4">', '<div><>');
  console.log('Line 384: changed to fragment');
}

// Line 635: </div></div> -> </></div>
if (l[634].trim() === '</div></div>') {
  l[634] = '              </></div>';
  console.log('Line 635: changed to fragment close');
}

// Line 638: remove extra </div>
if (l[637].trim() === '</div>' && l[638]?.trim() === ')}') {
  l.splice(637, 1);
  console.log('Removed extra </div> at line 638');
}

fs.writeFileSync(filePath, l.join('\n'));
console.log('Done');