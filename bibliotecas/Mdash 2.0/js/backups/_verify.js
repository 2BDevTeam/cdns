const fs = require('fs');
const c = fs.readFileSync('TEMPLATE DASHBOARD STANDARD EXTENSION.js', 'utf8');
console.log('LEN=' + c.length);
console.log('headerFilter-off=' + c.indexOf('=== true ?'));
console.log('mciChk-unchecked=' + c.indexOf('headerFilter === true)'));
console.log('themeClick-resolve=' + c.indexOf('_tblResolveTheme(_TABLE_THEMES[k]'));
console.log('getCachedColor=' + c.indexOf('getCachedColor(themeDef.phcType)'));
console.log('no-hover-css=' + c.indexOf('tabulator-col:hover{background:var(--mtbl-hdr-bg)'));
console.log('phcPrimary-theme=' + c.indexOf("phcPrimary: { name:"));
console.log('resolveTheme-fn=' + c.indexOf('function _tblResolveTheme'));
console.log('SYNTAX:');
try { new Function(c); console.log('SYNTAX OK'); } catch(e) { console.log('ERROR: ' + e.message); }
