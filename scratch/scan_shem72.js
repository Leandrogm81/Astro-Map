import fs from 'fs';

const content = fs.readFileSync('src/lib/kabbalah/shem72.ts', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes("'") || line.includes('"')) {
    // Check if there are Hebrew characters mixed with Latin characters in the same string
    const matches = line.match(/['"](.*?)['"]/g);
    if (matches) {
      matches.forEach(match => {
        const text = match.slice(1, -1);
        const hasHebrew = /[\u0590-\u05FF]/.test(text);
        const hasLatin = /[a-zA-Z]/.test(text);
        if (hasHebrew && hasLatin) {
          console.log(`Line ${index + 1}: ${line.trim()}`);
        }
      });
    }
  }
});
