import ts from 'typescript';import fs from 'node:fs';import {createHash} from 'node:crypto';
const messages=JSON.parse(fs.readFileSync('lib/i18n/messages.json','utf8'));const locales=['fr','es','ru','zh','ar'];
for(const [key,map] of Object.entries(messages))for(const lang of locales)if(!map[lang]?.trim())throw Error(`${lang} is missing ${key}`);
const ignored=new Set(['CHF','Cache-Control','Content-Disposition','Content-Type','DELETE','EUR','GBP','POST','PUT','Remove','Status:','USD','X-Content-Type-Options','filter active','muted small','nav-item selected','primary auth-submit','setup-card account-card','stat overall','text-button undo-inline','use client']);
for(const filename of ['app/tracker.tsx','app/auth-form.tsx','app/api/auth/route.ts','app/api/state/route.ts','app/api/evidence/route.ts','lib/validation.ts']){
 const source=ts.createSourceFile(filename,fs.readFileSync(filename,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function walk(node){let text='';if(ts.isJsxText(node))text=node.text.replace(/\s+/g,' ').trim();else if(ts.isStringLiteral(node)&&/[A-Z]|[a-z]+ [a-z]+/.test(node.text)&&!node.text.includes('/'))text=node.text.trim();if(text&&/[A-Za-z]/.test(text)&&!ignored.has(text)&&!messages[text])throw Error(`Missing UI translation in ${filename}: ${text}`);ts.forEachChild(node,walk)}walk(source);
}
const standards=JSON.parse(fs.readFileSync('lib/standards.ts','utf8').split('export const standards = ')[1].split(' as const;')[0]);for(const s of standards)for(const text of [s.title,s.summary,s.question,...s.methods])if(!messages[text])throw Error(`Missing standard content: ${text}`);
const expectedResources=JSON.parse(fs.readFileSync('lib/resources.sha256.json','utf8'));
const hash=path=>createHash('sha256').update(fs.readFileSync(path)).digest('hex');let files=0;for(const file of fs.readdirSync('public/resources')){if(hash('public/resources/'+file)!==expectedResources[file])throw Error(`A resource changed: ${file}`);files++}
console.log(JSON.stringify({translatedEntries:Object.keys(messages).length,languages:6,standardContent:'complete',unchangedSourceDocuments:files}));
