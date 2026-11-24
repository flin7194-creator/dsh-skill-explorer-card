import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] || '.');
const pkg = path.join(root, 'packages', 'dsh-skill-explorer');
const src = path.join(pkg, 'src', 'client', 'panel');
const files = ['SkillsTab.tsx', 'panel.module.css'];
const expected = ['a47b910e41c34a6b48c74fa5bea5590abca9ee46', '93373332c72a2824637ab64a169d11d9aa0cf990'];
const hash = b => crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
function replaceOnce(s, a, b) {
  if (s.split(a).length !== 2) throw Error(`Cannot locate unique anchor: ${a.slice(0, 120)}`);
  return s.replace(a,()=>b);
}
function between(s, a, b) {
  const i = s.indexOf(a), j = s.indexOf(b, i + a.length);
  if (i < 0 || j < 0) throw Error(`Missing boundary: ${a}`);
  return s.slice(i,j);
}
const raw = files.map(n => fs.readFileSync(path.join(src,n)));
if (JSON.parse(fs.readFileSync(path.join(pkg,'package.json'),'utf8')).version !== '0.4.21') throw Error('Expected package version 0.4.21. No changes made.');
for (let i=0;i<files.length;i++) {
  const normalized = Buffer.from(raw[i].toString('utf8').replace(/\r\n/g,'\n'));
  if (hash(normalized) !== expected[i]) throw Error(`Source differs from verified upstream: ${files[i]}. No changes made.`);
}
let s = raw[0].toString('utf8').replace(/\r\n/g,'\n');
const original = between(s, '  return (\n    <article className=', '\n}\n\n/** The skills tab body. */');
const badges = between(original, '        {skill.workspaceName', '        {canToggle(skill)');
const toggle = between(original, '        {canToggle(skill)', '        {canCopy &&');
const actions = between(original, '        {canCopy &&', '      </header>');
let card = fs.readFileSync(path.join(here,'card.tsx.txt'),'utf8');
card = card.replace('/* ORIGINAL_BADGES */',()=>badges.trimEnd()).replace('/* ORIGINAL_SWITCH */',()=>toggle.trimEnd()).replace('/* ORIGINAL_ACTIONS */',()=>actions.trimEnd());
s = replaceOnce(s, original, card.trimEnd());
s = replaceOnce(s, 'function SkillRow({ skill, api, onChanged, onEdit, onDuplicate }: {\n  skill: SkillEntry', 'function SkillRow({ skill, source, api, onChanged, onEdit, onDuplicate }: {\n  source: string\n  skill: SkillEntry');
s = replaceOnce(s, '  const [loading, setLoading] = useState(true)', '  const [loading, setLoading] = useState(true)\n  const [lastRefresh, setLastRefresh] = useState<Date | undefined>(undefined)');
s = replaceOnce(s, '      setPayload(next)\n      setError(undefined)', '      setPayload(next)\n      setLastRefresh(new Date())\n      setError(undefined)');
s = replaceOnce(s, '    <div className={css.fillBody}>\n      <div className={css.toolbar} data-dsh-part="filter-bar">', '    <div className={css.fillBody}>\n'+fs.readFileSync(path.join(here,'overview.tsx.txt'),'utf8').trimEnd()+'\n      <div className={css.toolbar} data-dsh-part="filter-bar">');
s = replaceOnce(s, '                  {expanded && group.skills.map(skill => (', '                  {expanded && <div className={css.skillGrid}>{group.skills.map(skill => (');
s = replaceOnce(s, '                      skill={skill}\n                      api={api}', '                      skill={skill}\n                      source={groupTitle(group)}\n                      api={api}');
s = replaceOnce(s, '                  ))}\n                </section>', '                  ))}</div>}\n                </section>');
const css = raw[1].toString('utf8').replace(/\r\n/g,'\n') + '\n' + fs.readFileSync(path.join(here,'cards.css'),'utf8');
const backup = path.join(root, '.dsh-skill-cards-backup-v0421');
if (fs.existsSync(backup)) throw Error('Backup already exists. No changes made.');
fs.mkdirSync(backup);
for (let i=0;i<files.length;i++) fs.writeFileSync(path.join(backup,files[i]),raw[i],{flag:'wx'});
try { fs.writeFileSync(path.join(src,files[0]),s); fs.writeFileSync(path.join(src,files[1]),css); }
catch(e) { for(let i=0;i<files.length;i++) fs.writeFileSync(path.join(src,files[i]),raw[i]); throw e; }
console.log('Applied to v0.4.21. Backup: '+backup+'\nBuild and test before installing.');
