import fs from 'fs';
const filePath = 'E:\\ruan\\src\\components\\PedidoModal.tsx';
let c = fs.readFileSync(filePath, 'utf8');
let l = c.split('\n');

// Remove the extra </div> at line 638 (index 637)
// It should be: line 635 closes both divs, line 636 is )}, line 637 is </section>, line 638 should be )} not </div>
if (l[637].trim() === '</div>' && l[638]?.trim() === ')}') {
  l.splice(637, 1); // remove the extra </div>
  console.log('Removed extra </div> at line 638');
}

fs.writeFileSync(filePath, l.join('\n'));
console.log('Done');