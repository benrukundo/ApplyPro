const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, '..', 'node_modules', 'pdf-parse', 'test');
const testFile = path.join(testDir, 'data', 'test.pdf');

// Create test directory if it doesn't exist
if (!fs.existsSync(path.join(testDir, 'data'))) {
  fs.mkdirSync(path.join(testDir, 'data'), { recursive: true });
}

// Create empty test file if it doesn't exist
if (!fs.existsSync(testFile)) {
  fs.writeFileSync(testFile, '');
}

console.log('pdf-parse test directory fixed');
