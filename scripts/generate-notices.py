"""Collect installed npm license texts and CocoaPods acknowledgements for offline display."""
from pathlib import Path
import json, plistlib
root = Path(__file__).resolve().parents[1]
lock = json.loads((root / 'package-lock.json').read_text())
notices = []
missing = []
for rel, metadata in lock['packages'].items():
    if not rel or metadata.get('dev'):
        continue
    folder = root / rel
    manifest = folder / 'package.json'
    if not manifest.exists():
        continue
    package = json.loads(manifest.read_text())
    name = package.get('name', rel)
    texts = []
    for file in sorted(folder.iterdir()):
        if file.is_file() and file.name.lower().startswith(('license','licence','copying','notice')):
            try:
                texts.append(file.read_text(errors='replace'))
            except OSError:
                pass
    license_name = package.get('license', metadata.get('license', 'Nicht angegeben'))
    if not isinstance(license_name, str):
        license_name = json.dumps(license_name)
    if not texts:
        missing.append(name)
    notices.append({'name': name, 'version': package.get('version',''), 'license': license_name, 'text': '\n\n'.join(texts) or 'Lizenzkennzeichnung aus dem Paket: ' + license_name, 'source':'npm'})
ack = root / 'ios/Pods/Target Support Files/Pods-PhraseUNO/Pods-PhraseUNO-acknowledgements.plist'
if not ack.exists():
    raise SystemExit('Run iOS prebuild / pod install first so native acknowledgements are included.')
for item in plistlib.loads(ack.read_bytes()).get('PreferenceSpecifiers',[]):
    if item.get('Title') and item.get('FooterText'):
        notices.append({'name':item['Title'],'version':'','license':'Native Bibliothek','text':item['FooterText'],'source':'CocoaPods'})
notices.sort(key=lambda item:(item['name'].lower(),item['source']))
(root / 'src/lib/licenses.json').write_text(json.dumps(notices,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'notices':len(notices),'metadata_only':missing}))
