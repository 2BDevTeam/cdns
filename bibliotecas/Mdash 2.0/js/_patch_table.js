// Patch script for table object: PHC colors, headerFilter off, no header hover
const fs = require('fs');
const path = 'c:\\Users\\dbarreto\\OneDrive - 2 Business, S.A\\2BCDNS\\bibliotecas\\Mdash 2.0\\js\\TEMPLATE DASHBOARD STANDARD EXTENSION.js';
let c = fs.readFileSync(path, 'utf8');
const origLen = c.length;
let changes = 0;

function rep(oldStr, newStr, label) {
    const idx = c.indexOf(oldStr);
    if (idx === -1) { console.log('MISS: ' + label); return; }
    c = c.substring(0, idx) + newStr + c.substring(idx + oldStr.length);
    changes++;
    console.log('OK: ' + label + ' at ' + idx);
}

// ═══════════════════════════════════════════════════════════════════
// 1. _TABLE_SAMPLE_CONFIG: headerFilter false, theme phcPrimary, styling defaults
// ═══════════════════════════════════════════════════════════════════
rep(
    "headerFilter: true,",
    "headerFilter: false,",
    "SAMPLE_CONFIG headerFilter"
);
rep(
    "theme: 'modern',",
    "theme: 'phcPrimary',",
    "SAMPLE_CONFIG theme"
);
rep(
    "headerBg: '#1e293b',\n        headerText: '#f8fafc',\n        borderRadius: 10,\n        fontSize: 13,\n        rowHeight: 'normal',\n        accentColor: '#2563eb'",
    "headerBg: '',\n        headerText: '#ffffff',\n        borderRadius: 10,\n        fontSize: 13,\n        rowHeight: 'normal',\n        accentColor: ''",
    "SAMPLE_CONFIG styling defaults"
);

// ═══════════════════════════════════════════════════════════════════
// 2. _TABLE_THEMES: Add PHC themes + _tblResolveTheme() + _tblAlpha()
// ═══════════════════════════════════════════════════════════════════
const oldThemes = `var _TABLE_THEMES = {
    modern: { name: 'Moderno', headerBg: '#1e293b', headerText: '#f8fafc', accent: '#2563eb', rowEven: '#f8fafc', rowHover: 'rgba(37,99,235,.06)', border: 'rgba(0,0,0,.06)' },
    light: { name: 'Claro', headerBg: '#f1f5f9', headerText: '#1e293b', accent: '#0ea5e9', rowEven: '#ffffff', rowHover: 'rgba(14,165,233,.05)', border: 'rgba(0,0,0,.06)' },
    corporate: { name: 'Corporativo', headerBg: '#1a3a6c', headerText: '#f5e6c8', accent: '#c8a84b', rowEven: '#fdfcfa', rowHover: 'rgba(200,168,75,.06)', border: 'rgba(26,58,108,.10)' },
    vibrant: { name: 'Vibrante', headerBg: '#7c3aed', headerText: '#faf5ff', accent: '#a78bfa', rowEven: '#faf5ff', rowHover: 'rgba(167,139,250,.06)', border: 'rgba(124,58,237,.08)' },
    earth: { name: 'Terra', headerBg: '#78350f', headerText: '#fef3c7', accent: '#b45309', rowEven: '#fffbeb', rowHover: 'rgba(180,83,9,.05)', border: 'rgba(120,53,15,.08)' },
    dark: { name: 'Escuro', headerBg: '#0f172a', headerText: '#e2e8f0', accent: '#60a5fa', rowEven: '#1e293b', rowHover: 'rgba(96,165,250,.08)', border: 'rgba(226,232,240,.08)' },
    minimal: { name: 'Minimalista', headerBg: 'transparent', headerText: '#475569', accent: '#64748b', rowEven: 'transparent', rowHover: 'rgba(0,0,0,.02)', border: 'rgba(0,0,0,.06)' }
};`;

const newThemes = `var _TABLE_THEMES = {
    phcPrimary: { name: 'PHC Primary', phcType: 'primary', headerBg: '', headerText: '#ffffff', accent: '', rowEven: '#f8fafc', rowHover: 'rgba(0,0,0,.03)', border: 'rgba(0,0,0,.06)' },
    phcSuccess: { name: 'PHC Success', phcType: 'success', headerBg: '', headerText: '#ffffff', accent: '', rowEven: '#f8fafc', rowHover: 'rgba(0,0,0,.03)', border: 'rgba(0,0,0,.06)' },
    phcInfo:    { name: 'PHC Info',    phcType: 'info',    headerBg: '', headerText: '#ffffff', accent: '', rowEven: '#f8fafc', rowHover: 'rgba(0,0,0,.03)', border: 'rgba(0,0,0,.06)' },
    phcWarning: { name: 'PHC Warning', phcType: 'warning', headerBg: '', headerText: '#ffffff', accent: '', rowEven: '#f8fafc', rowHover: 'rgba(0,0,0,.03)', border: 'rgba(0,0,0,.06)' },
    phcDanger:  { name: 'PHC Danger',  phcType: 'danger',  headerBg: '', headerText: '#ffffff', accent: '', rowEven: '#f8fafc', rowHover: 'rgba(0,0,0,.03)', border: 'rgba(0,0,0,.06)' },
    modern:     { name: 'Moderno',     headerBg: '#1e293b', headerText: '#f8fafc', accent: '#2563eb', rowEven: '#f8fafc', rowHover: 'rgba(37,99,235,.06)', border: 'rgba(0,0,0,.06)' },
    light:      { name: 'Claro',       headerBg: '#f1f5f9', headerText: '#1e293b', accent: '#0ea5e9', rowEven: '#ffffff', rowHover: 'rgba(14,165,233,.05)', border: 'rgba(0,0,0,.06)' },
    corporate:  { name: 'Corporativo', headerBg: '#1a3a6c', headerText: '#f5e6c8', accent: '#c8a84b', rowEven: '#fdfcfa', rowHover: 'rgba(200,168,75,.06)', border: 'rgba(26,58,108,.10)' },
    vibrant:    { name: 'Vibrante',    headerBg: '#7c3aed', headerText: '#faf5ff', accent: '#a78bfa', rowEven: '#faf5ff', rowHover: 'rgba(167,139,250,.06)', border: 'rgba(124,58,237,.08)' },
    earth:      { name: 'Terra',       headerBg: '#78350f', headerText: '#fef3c7', accent: '#b45309', rowEven: '#fffbeb', rowHover: 'rgba(180,83,9,.05)', border: 'rgba(120,53,15,.08)' },
    dark:       { name: 'Escuro',      headerBg: '#0f172a', headerText: '#e2e8f0', accent: '#60a5fa', rowEven: '#1e293b', rowHover: 'rgba(96,165,250,.08)', border: 'rgba(226,232,240,.08)' },
    minimal:    { name: 'Minimalista', headerBg: 'transparent', headerText: '#475569', accent: '#64748b', rowEven: 'transparent', rowHover: 'rgba(0,0,0,.02)', border: 'rgba(0,0,0,.06)' }
};

// Resolve tema PHC em runtime (getCachedColor só funciona após DOM ready)
function _tblResolveTheme(themeDef) {
    if (!themeDef || !themeDef.phcType) return themeDef;
    var color = (typeof getCachedColor === 'function') ? getCachedColor(themeDef.phcType) : '#2563eb';
    return {
        name: themeDef.name, phcType: themeDef.phcType,
        headerBg: color, headerText: themeDef.headerText, accent: color,
        rowEven: themeDef.rowEven, rowHover: themeDef.rowHover, border: themeDef.border
    };
}`;

rep(oldThemes, newThemes, "_TABLE_THEMES + _tblResolveTheme");

// ═══════════════════════════════════════════════════════════════════
// 3. _tblCSS: Add no-hover for header columns
// ═══════════════════════════════════════════════════════════════════
rep(
    "s += '.mtbl-wrap .tabulator .tabulator-cell .tabulator-data-tree-branch{display:none;}';",
    "s += '.mtbl-wrap .tabulator .tabulator-cell .tabulator-data-tree-branch{display:none;}';\n    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col:hover{background:var(--mtbl-hdr-bg) !important;cursor:default;}';\n    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col .tabulator-col-sorter{color:var(--mtbl-hdr-text,#fff);}';\n    s += '.mtbl-wrap .tabulator .tabulator-header .tabulator-col.tabulator-sortable:hover{background:var(--mtbl-hdr-bg) !important;}';",
    "tblCSS no-hover header"
);

// ═══════════════════════════════════════════════════════════════════
// 4. renderObjectTable: Use _tblResolveTheme
// ═══════════════════════════════════════════════════════════════════
rep(
    "var theme = _TABLE_THEMES[cfg.theme] || _TABLE_THEMES.modern;",
    "var theme = _tblResolveTheme(_TABLE_THEMES[cfg.theme] || _TABLE_THEMES.phcPrimary);",
    "renderObjectTable theme resolve"
);

// ═══════════════════════════════════════════════════════════════════
// 5. _tblBuildColumns: headerFilter default OFF (=== true instead of !== false)
// ═══════════════════════════════════════════════════════════════════
rep(
    "headerFilter: cfg.headerFilter !== false ? 'input' : false,",
    "headerFilter: cfg.headerFilter === true ? 'input' : false,",
    "tblBuildColumns headerFilter default off"
);

// Also fix the manual columns section (uses same pattern):
// Check for second occurrence in manual columns
const manualHF = "headerFilter: (cfg.headerFilter !== false && c.headerFilter !== false) ? 'input' : false";
const manualHFNew = "headerFilter: (cfg.headerFilter === true && c.headerFilter !== false) ? 'input' : false";
if (c.indexOf(manualHF) !== -1) {
    rep(manualHF, manualHFNew, "tblBuildColumns manual cols headerFilter");
}

// ═══════════════════════════════════════════════════════════════════
// 6. renderTablePropertiesInline: headerFilter default unchecked
// ═══════════════════════════════════════════════════════════════════
rep(
    "_mciChk('mtbl-headerfilter', 'Filtros no cabe\u00e7alho', cfg.headerFilter !== false)",
    "_mciChk('mtbl-headerfilter', 'Filtros no cabe\u00e7alho', cfg.headerFilter === true)",
    "Props headerFilter default unchecked"
);

// ═══════════════════════════════════════════════════════════════════
// 7. renderTablePropertiesInline: Theme grid — show PHC themes with resolved color swatches
// ═══════════════════════════════════════════════════════════════════
rep(
    "Object.keys(_TABLE_THEMES).forEach(function (k) {\n        var t = _TABLE_THEMES[k];",
    "Object.keys(_TABLE_THEMES).forEach(function (k) {\n        var t = _tblResolveTheme(_TABLE_THEMES[k]);",
    "Props theme grid resolve PHC"
);

// ═══════════════════════════════════════════════════════════════════
// 8. Theme button click handler: resolve PHC theme + sync style inputs
// ═══════════════════════════════════════════════════════════════════
rep(
    "var t = _TABLE_THEMES[k] || _TABLE_THEMES.modern;",
    "var t = _tblResolveTheme(_TABLE_THEMES[k] || _TABLE_THEMES.phcPrimary);",
    "Theme button click resolve PHC"
);

// ═══════════════════════════════════════════════════════════════════
// 9. _tblReadConfig: default styling to empty string for PHC themes
// ═══════════════════════════════════════════════════════════════════
rep(
    "headerBg: panel.find('.mtbl-hdrbg').val() || '#1e293b',",
    "headerBg: panel.find('.mtbl-hdrbg').val() || '',",
    "tblReadConfig headerBg default"
);
rep(
    "accentColor: panel.find('.mtbl-accent').val() || '#2563eb',",
    "accentColor: panel.find('.mtbl-accent').val() || '',",
    "tblReadConfig accentColor default"
);

// ═══════════════════════════════════════════════════════════════════
// 10. renderObjectTable: CSS vars fallback to theme for empty styling
// ═══════════════════════════════════════════════════════════════════
rep(
    "var cssVars = '--mtbl-hdr-bg:' + (stl.headerBg || theme.headerBg) + ';'",
    "var hdrBg = stl.headerBg || theme.headerBg;\n    var accentC = stl.accentColor || theme.accent;\n    var cssVars = '--mtbl-hdr-bg:' + hdrBg + ';'",
    "renderObjectTable cssVars hdrBg"
);
rep(
    "        + '--mtbl-accent:' + (stl.accentColor || theme.accent) + ';'",
    "        + '--mtbl-accent:' + accentC + ';'",
    "renderObjectTable cssVars accent"
);

// ═══════════════════════════════════════════════════════════════════
// WRITE
// ═══════════════════════════════════════════════════════════════════
fs.writeFileSync(path, c, 'utf8');
console.log('\nDONE: ' + changes + ' replacements. Original: ' + origLen + ' New: ' + c.length);
