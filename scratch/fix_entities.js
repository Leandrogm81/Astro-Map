const fs = require('fs');
const path = require('path');

function fixUnescapedEntities(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace unescaped quotes and apostrophes in JSX text content
    // Only replace outside of tags and curly braces
    const fixed = content.replace(/>([^<{}]+)</g, (match, text) => {
        let newText = text.replace(/"/g, '&quot;');
        newText = newText.replace(/'/g, '&apos;');
        return `>${newText}<`;
    });

    if (content !== fixed) {
        fs.writeFileSync(filePath, fixed);
        console.log(`Fixed entities in ${filePath}`);
    }
}

const files = [
    'src/components/AIReport.tsx',
    'src/components/traditional/TraditionalAIReport.tsx',
    'src/components/SolarRevolution.tsx'
];

files.forEach(f => {
    const fullPath = path.join(process.cwd(), f);
    if (fs.existsSync(fullPath)) {
        fixUnescapedEntities(fullPath);
    }
});
