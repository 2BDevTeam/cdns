// Fix patch for the 3 missed items
const fs = require('fs');
const path = 'c:\\Users\\dbarreto\\OneDrive - 2 Business, S.A\\2BCDNS\\bibliotecas\\Mdash 2.0\\js\\TEMPLATE DASHBOARD STANDARD EXTENSION.js';
let c = fs.readFileSync(path, 'utf8');
let changes = 0;

function rep(oldStr, newStr, label) {
    const idx = c.indexOf(oldStr);
    if (idx === -1) { console.log('MISS: ' + label + ' (searched ' + oldStr.length + ' chars)'); return; }
    c = c.substring(0, idx) + newStr + c.substring(idx + oldStr.length);
    changes++;
    console.log('OK: ' + label + ' at ' + idx);
}

// 1. tblCSS: correct selector (no .mtbl-wrap) — insert before </style>
rep(
    "s += '.tabulator .tabulator-cell .tabulator-data-tree-branch{display:none;}';\r\n    s += '</style>';",
    "s += '.tabulator .tabulator-cell .tabulator-data-tree-branch{display:none;}';\r\n    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col:hover{background:var(--mtbl-hdr-bg) !important;cursor:default;}';\r\n    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col.tabulator-sortable:hover{background:var(--mtbl-hdr-bg) !important;}';\r\n    s += '</style>';",
    "tblCSS no-hover header"
);

// 2. _mciChk headerFilter: file has literal \u00e7 (6 chars), not ç
rep(
    "_mciChk('mtbl-headerfilter', 'Filtros no cabe\\u00e7alho', cfg.headerFilter !== false)",
    "_mciChk('mtbl-headerfilter', 'Filtros no cabe\\u00e7alho', cfg.headerFilter === true)",
    "Props headerFilter default unchecked"
);

// 3. forEach theme grid: check newline char
const feOld = "Object.keys(_TABLE_THEMES).forEach(function (k) {\n        var t = _TABLE_THEMES[k];";
const feOldCR = "Object.keys(_TABLE_THEMES).forEach(function (k) {\r\n        var t = _TABLE_THEMES[k];";
const feNew1 = "Object.keys(_TABLE_THEMES).forEach(function (k) {\n        var t = _tblResolveTheme(_TABLE_THEMES[k]);";
const feNew2 = "Object.keys(_TABLE_THEMES).forEach(function (k) {\r\n        var t = _tblResolveTheme(_TABLE_THEMES[k]);";

if (c.indexOf(feOld) !== -1) {
    rep(feOld, feNew1, "Props theme grid resolve PHC (LF)");
} else if (c.indexOf(feOldCR) !== -1) {
    rep(feOldCR, feNew2, "Props theme grid resolve PHC (CRLF)");
} else {
    console.log('MISS: forEach theme grid - neither LF nor CRLF matched');
    // Debug: find the forEach line
    const feIdx = c.indexOf("Object.keys(_TABLE_THEMES).forEach(function (k) {");
    if (feIdx !== -1) {
        const afterBrace = c.charCodeAt(feIdx + 50);
        console.log('  char after { = ' + afterBrace + ' (10=LF, 13=CR)');
        console.log('  context: ' + JSON.stringify(c.substring(feIdx, feIdx + 100)));
    }
}

fs.writeFileSync(path, c, 'utf8');
console.log('\nDONE: ' + changes + ' fixes applied. New length: ' + c.length);
