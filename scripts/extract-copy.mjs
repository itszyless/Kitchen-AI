import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
const copy=new Set();
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){if(entry.name!=='i18n')walk(file);continue;}if(!/\.tsx?$/.test(file))continue;const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);function visit(node){if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)||ts.isJsxText(node)){const value=node.text.replace(/\s+/g,' ').trim();if(value.length>1&&/[A-Za-z]/.test(value)&&!value.includes('://')&&!value.startsWith('@/')&&!value.startsWith('./')&&!value.startsWith('../')&&!value.startsWith('#'))copy.add(value);}ts.forEachChild(node,visit);}visit(source);}}
walk('src');fs.writeFileSync('.expo/ui-copy.json',JSON.stringify([...copy].sort(),null,2));console.log(`${copy.size} source strings extracted`);
