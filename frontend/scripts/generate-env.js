const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'http://localhost:3000/api';
const targetPath = path.join(__dirname, '../src/environments/environment.production.ts');

const contents = `export const environment = {
  production: true,
  apiUrl: '${apiUrl.replace(/'/g, "\\'")}',
};
`;

fs.writeFileSync(targetPath, contents, 'utf8');
console.log(`Generated ${targetPath} with apiUrl=${apiUrl}`);
