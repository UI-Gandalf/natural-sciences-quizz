#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
Γυμνάσιο Νέας Ερυθραίας - Φυσικές Επιστήμες
Quiz Protection & Build Pipeline (SHA-256 + Minification + Obfuscation)
==============================================================================
"""
import os
import re
import hashlib
import sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEV_SRC = os.path.join(BASE_DIR, 'src', 'quiz-data.dev.js')
PROD_DEST = os.path.join(BASE_DIR, 'js', 'quiz-data.js')
INDEX_HTML = os.path.join(BASE_DIR, 'index.html')

# Secret Salt used for cryptographic SHA-256 hashing
SALT = "GNE_2026_QUIZ_SALT_9f8b2c"

def minify_js(code: str) -> str:
    """Safe JavaScript minifier removing comments and collapsing whitespace."""
    # Remove single-line comments (preserving URLs like https://)
    code = re.sub(r'(?<!:)\/\/(?![^\r\n]*[\'\"`]).*', '', code)
    # Remove block comments
    code = re.sub(r'\/\*[\s\S]*?\*\/', '', code)
    # Collapse multiple blank lines
    code = re.sub(r'\n\s*\n', '\n', code)
    # Trim line whitespace
    lines = [line.strip() for line in code.splitlines() if line.strip()]
    return '\n'.join(lines)

def bump_version_in_html():
    """Automatically increments cache-buster version query in index.html."""
    if not os.path.exists(INDEX_HTML):
        return None
    with open(INDEX_HTML, 'r', encoding='utf-8') as f:
        html = f.read()
    
    m = re.search(r'quiz-data\.js\?v=(\d+)', html)
    if m:
        current_v = int(m.group(1))
        new_v = current_v + 1
        html = re.sub(r'styles\.css\?v=\d+', f'styles.css?v={new_v}', html)
        html = re.sub(r'quiz-data\.js\?v=\d+', f'quiz-data.js?v={new_v}', html)
        html = re.sub(r'app\.js\?v=\d+', f'app.js?v={new_v}', html)
        with open(INDEX_HTML, 'w', encoding='utf-8') as f:
            f.write(html)
        return new_v
    return None

def protect():
    print("==================================================")
    print("🔒 GNE Science Quiz Protection & Build Pipeline")
    print("==================================================")
    
    if not os.path.exists(DEV_SRC):
        print(f"❌ Error: Master dev file not found at: {DEV_SRC}")
        print("   Please create src/quiz-data.dev.js with human-readable questions.")
        sys.exit(1)
        
    with open(DEV_SRC, 'r', encoding='utf-8') as f:
        src_code = f.read()

    # Pattern to match each question with "q": "<num>. ... "correct": <num>
    pattern = re.compile(r'\{\s*\"q\":\s*\"(\d+)\.\s*([\s\S]*?)\"correct\":\s*(\d+)')
    
    matches = pattern.findall(src_code)
    print(f"📋 Found {len(matches)} questions with plaintext answers.")

    def replacer(match):
        qid = match.group(1)
        body = match.group(2)
        correct_idx = match.group(3)
        raw = f"{qid}:{correct_idx}:{SALT}"
        h = hashlib.sha256(raw.encode('ascii')).hexdigest()
        return f'{{\n  "id": {qid},\n  "q": "{qid}. {body}"correctHash": "{h}"'

    protected_code = pattern.sub(replacer, src_code)
    
    remaining = re.findall(r'\"correct\":', protected_code)
    hashes = re.findall(r'\"correctHash\":', protected_code)
    
    if len(remaining) > 0:
        print(f"⚠️ Warning: {len(remaining)} questions could not be hashed!")
    else:
        print(f"✅ 100% of questions ({len(hashes)}) successfully hashed with salted SHA-256!")

    # Minify and remove comments
    print("📦 Minifying code & stripping source comments...")
    minified = minify_js(protected_code)
    
    header = "/* GNE Quiz Production Bundle - Protected by SHA-256 Hash Verification */\n"
    final_output = header + minified

    with open(PROD_DEST, 'w', encoding='utf-8') as f:
        f.write(final_output)

    print(f"💾 Production file saved to: {PROD_DEST} ({len(final_output):,} bytes)")

    # Bump version in HTML
    new_v = bump_version_in_html()
    if new_v:
        print(f"🚀 Cache-buster version updated to: v={new_v} in index.html")

    print("==================================================")
    print("🎉 Success! Quiz answers are now cryptographically secured.")
    print("==================================================")

if __name__ == '__main__':
    protect()
