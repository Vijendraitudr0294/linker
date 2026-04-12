const fs = require('fs');
const path = 'src/pages/dashboard/LinkEditor.tsx';
let content = fs.readFileSync(path, 'utf8');

// The weird strings as seen in view_file
const bad1 = "{([`'`pill`'`, `'`rounded`'`, `'`square`'`, `'`outline`'`] as const).map(style => (";
const good1 = "{(['pill', 'rounded', 'square', 'outline'] as const).map(style => (";

const bad2 = "className={`h-7 px-3 text-[9px] font-black uppercase border-2 transition-all ${extractedTheme?.buttonStyle === style ? `'`bg-black text-white border-black`'` : `'`bg-white text-black/50 border-black/20 hover:border-black`'`} ${style === `'`pill`'` ? `'`rounded-full`'` : style === `'`rounded`'` ? `'`rounded-lg`'` : `'`rounded-none`'`}`}>";
const good2 = "className={`h-7 px-3 text-[9px] font-black uppercase border-2 transition-all ${extractedTheme?.buttonStyle === style ? 'bg-black text-white border-black' : 'bg-white text-black/50 border-black/20 hover:border-black'} ${style === 'pill' ? 'rounded-full' : style === 'rounded' ? 'rounded-lg' : 'rounded-none'}`}>";

const bad3 = "{([`'`classic`'`, `'`glass`'`, `'`glass-premium`'`] as const).map(style => (";
const good3 = "{(['classic', 'glass', 'glass-premium'] as const).map(style => (";

const bad4 = "className={`h-7 px-3 text-[9px] font-black uppercase rounded-lg border-2 transition-all ${extractedTheme?.cardStyle === style ? `'`bg-black text-white border-black`'` : `'`bg-white text-black/50 border-black/20 hover:border-black`'`}`}";
const good4 = "className={`h-7 px-3 text-[9px] font-black uppercase rounded-lg border-2 transition-all ${extractedTheme?.cardStyle === style ? 'bg-black text-white border-black' : 'bg-white text-black/50 border-black/20 hover:border-black'}`}";

// We use trim() and replace to be safe against indentation issues
content = content.replace(bad1, good1);
content = content.replace(bad2, good2);
content = content.replace(bad3, good3);
content = content.replace(bad4, good4);

// Just in case it wasIndentation slightly different, try substrings
if (content.includes("`'`pill`''`")) {
  content = content.split("`'`pill`''`").join("'pill'");
}
if (content.includes("`'`pill`'`")) {
  content = content.split("`'`pill`'`").join("'pill'");
}
if (content.includes("`'`")) {
  content = content.split("`'`").join("'");
}
if (content.includes("â€")) {
    content = content.split("â€”").join("—");
}

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed syntax successfully');
