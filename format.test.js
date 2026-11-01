const test = require('node:test'), assert = require('node:assert'), F = require('../portal-app/format.js');
test('php formats pesos', () => { assert.equal(F.php(1500000), '₱1,500,000'); assert.equal(F.php(0), '₱0'); assert.equal(F.php(null), '₱0'); assert.equal(F.php(1234.5), '₱1,234.5'); });
test('pct clamps 0-100', () => { assert.equal(F.pct(150), 100); assert.equal(F.pct(-5), 0); assert.equal(F.pct('45.6'), 46); assert.equal(F.pct(undefined), 0); });
test('project kinds', () => { assert.equal(F.kindLabel('New build'), 'New Construction'); assert.equal(F.kindLabel('Renovation'), 'Renovation'); assert.equal(F.kindLabel('Extension'), 'Extension'); assert.equal(F.kind('New build'), 'new'); });
test('balance is never negative', () => { assert.equal(F.balance(100, 40), 60); assert.equal(F.balance(100, 150), 0); assert.equal(F.balance(null, 0), 0); });
test('demo data is flagged as sample', () => { global.window = {}; require('../portal-app/demo-data.js'); assert.ok(window.FIX_DEMO.length > 0 && window.FIX_DEMO.every((p) => p.demo === true)); });
