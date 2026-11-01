(function (root, f) { if (typeof module === 'object' && module.exports) module.exports = f(); else root.FixFmt = f(); })(this, function () {
  const php = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 });
  const pct = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
  const kind = (t) => (/new/i.test(t || '') ? 'new' : 'renovation');
  const kindLabel = (t) => (kind(t) === 'new' ? 'New Construction' : /ext/i.test(t || '') ? 'Extension' : 'Renovation');
  const balance = (budget, paid) => Math.max(0, Number(budget || 0) - Number(paid || 0));
  return { php, pct, kind, kindLabel, balance };
});
