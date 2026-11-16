import json
import pathlib
import time
import urllib.request
import urllib.parse
import subprocess
import csv
import io

ROOT = pathlib.Path(__file__).resolve().parents[2] / 'sources'
OUT = ROOT / 'media'
OUT.mkdir(parents=True, exist_ok=True)


def recognize(path):
    run = subprocess.run(['tesseract', str(path.resolve()), 'stdout', '--tessdata-dir',
                          str(ROOT / 'tessdata'), '-l', 'chi_sim+eng', '-c', 'tessedit_create_tsv=1'],
                         check=True, capture_output=True, text=True, errors='replace')
    grouped = {}
    for row in csv.DictReader(io.StringIO(run.stdout), delimiter='\t', quoting=csv.QUOTE_NONE):
        if not row.get('text', '').strip():
            continue
        key = (row['block_num'], row['par_num'], row['line_num'])
        grouped.setdefault(key, []).append(row)
    return [{'text': ' '.join(x['text'] for x in words),
             'confidence': min(float(x['conf']) for x in words) / 100}
            for words in grouped.values()]


def process(source):
    note = json.loads(source.read_text())
    if note['status'] != 'read' or note.get('type') == 'video':
        return
    folder = OUT / note['id']
    folder.mkdir(exist_ok=True)
    for i, image in enumerate(note.get('images') or []):
        result = folder / f'{i + 1:02}.json'
        if result.exists() and json.loads(result.read_text()).get('version') == 2:
            continue
        path = folder / f'{i + 1:02}.webp'
        try:
            if not path.exists():
                url = image['url'].replace('http:', 'https:', 1)
                assert urllib.parse.urlparse(url).hostname.endswith('.xhscdn.com')
                with urllib.request.urlopen(url, timeout=20) as response:
                    path.write_bytes(response.read())
                time.sleep(0.15)
            lines = recognize(path)
            record = {'noteId': note['id'], 'image': i + 1, 'status': 'ocr', 'version': 2, 'lines': lines}
        except Exception as error:
            record = {'noteId': note['id'], 'image': i + 1, 'error': str(error)}
        result.write_text(json.dumps(record, ensure_ascii=False) + '\n')
        print(json.dumps({'id': note['id'], 'image': i + 1, 'error': record.get('error'),
                          'lines': len(record.get('lines', []))}), flush=True)

if __name__ == '__main__':
    import sys
    if '--test' in sys.argv:
        lines = recognize(pathlib.Path('/tmp/xhs-test.webp'))
        assert lines and any('Agent' in x['text'] or '面试' in x['text'] for x in lines), lines
        print(json.dumps(lines, ensure_ascii=False))
        raise SystemExit()
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=4) as pool:
        for _ in pool.map(process, sorted((ROOT / 'notes').glob('*.json'))):
            pass
