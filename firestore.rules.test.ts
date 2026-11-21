import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesContent = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8');
const blueprint = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'firebase-blueprint.json'), 'utf8')
) as { firestore: Record<string, unknown> };

test('firestore.rules begins with global default-deny safety net', () => {
  assert.match(rulesContent, /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;/);
});

test('every collection declared in firebase-blueprint.json has a matching rules block', () => {
  const collectionNames = Object.keys(blueprint.firestore).map((p) => {
    const segments = p.split('/').filter(Boolean);
    return segments[segments.length - 2];
  });
  for (const col of collectionNames) {
    assert.ok(
      rulesContent.includes(`match /${col}/`),
      `Missing match block for collection /${col}/`
    );
  }
});

test('firestore.rules enforces email_verified on admin and write operations', () => {
  assert.ok(rulesContent.includes('request.auth.token.email_verified == true'));
  assert.ok(rulesContent.includes("request.auth.token.email == 'harshitkumar810271@gmail.com'"));
});

test('firestore.rules blocks self-assigned admin role and enforces strict allowlists', () => {
  assert.ok(rulesContent.includes("incoming().role == 'student'"));
  assert.ok(rulesContent.includes('affectedKeys().hasOnly('));
  assert.ok(rulesContent.includes('data.keys().hasOnly('));
  assert.ok(rulesContent.includes('isValidId('));
});

test('firestore.rules enforces terminal state lock on roommateRequests', () => {
  assert.ok(rulesContent.includes("existing().status == 'pending'"));
  assert.ok(rulesContent.includes("incoming().status in ['accepted', 'declined']"));
  assert.ok(rulesContent.includes("incoming().status == 'withdrawn'"));
});
