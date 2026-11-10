import fs from 'node:fs';
const standards=JSON.parse(fs.readFileSync('lib/standards.ts','utf8').split('export const standards = ')[1].split(' as const;')[0]);
const languages=['fr','es','ru','zh','ar'];const messages={};
for(const file of ['ui','standards'])for(const [lineIndex,line] of fs.readFileSync(`lib/i18n/${file}.tsv`,'utf8').trim().split('\n').entries()){
 const [key,...values]=line.split('|');if(values.length!==5||values.some(x=>!x))throw Error(`Invalid ${file} line ${lineIndex+1}`);
 let english=key;if(file==='standards'){const [id,field]=key.split('.');const s=standards[Number(id)-1];english=isNaN(Number(field))?s[field]:s.methods[Number(field)]}
 if(!english)throw Error(`Unknown translation key ${key}`);messages[english]=Object.fromEntries(languages.map((l,i)=>[l,values[i]]));
}
fs.writeFileSync('lib/i18n/messages.json',JSON.stringify(messages,null,2)+'\n');console.log(`${Object.keys(messages).length} text entries, five translations each.`);
