/*
 * SQLADAPTER.js
 * =============================================================================
 * SQL dialect adapter: SQL Server (TransactSQL) <-> SQLite
 *
 * Architecture
 * ------------
 *   SqlAdapterRule            Single rewrite rule (regex-based or free function)
 *   SqlAdapter                Base: holds a rule list, applies them in order
 *   SqlServerToSQLiteAdapter  TSql -> SQLite rule set + structural transforms
 *   SQLiteToSqlServerAdapter  SQLite -> TSql rule set + structural transforms
 *   SqlAdapterFactory         Creates adapters by key string
 *
 * Usage
 * -----
 *   var adapter = SqlAdapter.SqlAdapterFactory.create('tsql>sqlite');
 *   var result  = adapter.adapt('SELECT TOP 10 [name] FROM [users]');
 *   // => SELECT "name" FROM "users" LIMIT 10
 *
 *   var adapter2 = SqlAdapter.SqlAdapterFactory.create('sqlite>tsql');
 *   var result2  = adapter2.adapt('SELECT "name" FROM "users" LIMIT 10');
 *   // => SELECT TOP 10 [name] FROM [users]
 *
 * Compatibility: ES5 (no const/let, no arrow functions, no template literals,
 *   no classes, no destructuring, no Promises, no async/await).
 *
 * Known limitations of the regex-based approach
 * -----------------------------------------------
 *   - TOP/LIMIT inside subqueries: only the outermost SELECT is converted when
 *     statements are delimited by semicolons.
 *   - DATEADD with nested function calls as the date argument may not convert
 *     correctly (bracket-depth not tracked in those patterns).
 *   - String concatenation "+" vs numeric addition cannot be distinguished by
 *     regex alone; "+" -> "||" is NOT auto-converted (tsql->sqlite direction).
 *   - REPLICATE has no native SQLite equivalent; a comment placeholder is left.
 *   - CASE WHEN passes through unchanged; functions inside it are converted by
 *     their individual rules. Type-name rules (BIT, FLOAT...) may match inside
 *     string literals — review output when values reference type names as strings.
 *   - FOR JSON PATH/AUTO: converted to json_group_array(json_object(...)).
 *     ROOT('x') wraps in json_object('x', ...). WITHOUT_ARRAY_WRAPPER removes
 *     the outer array. TOP n is converted to LIMIT n.
 *   - STUFF + FOR XML PATH: converted to GROUP_CONCAT when the classic idiom
 *     is recognised. Complex or multiply-nested variants leave a warning comment.
 *   - Very complex or non-standard T-SQL constructs may require manual review.
 * =============================================================================
 */


(function (global) {

    /* =========================================================================
     * Private helpers
     * ========================================================================= */

    /**
     * Parse the argument list of a function call starting at the opening '('.
     * Correctly handles nested parentheses (but NOT quoted strings containing '(').
     * Returns { args: [string], endPos: number } or null if unbalanced.
     *
     * @param  {string} sql        The full SQL string (original case).
     * @param  {number} openParen  Index of the '(' character.
     * @return {{ args: Array, endPos: number }|null}
     */
    function extractFunctionArgs(sql, openParen) {
        var depth = 1;
        var current = '';
        var args = [];
        var i;

        for (i = openParen + 1; i < sql.length; i++) {
            var ch = sql[i];
            if (ch === '(') {
                depth++;
                current += ch;
            } else if (ch === ')') {
                depth--;
                if (depth === 0) {
                    args.push(current.replace(/^\s+|\s+$/g, ''));
                    return { args: args, endPos: i };
                }
                current += ch;
            } else if (ch === ',' && depth === 1) {
                args.push(current.replace(/^\s+|\s+$/g, ''));
                current = '';
            } else {
                current += ch;
            }
        }
        return null; /* unbalanced parens */
    }

    /**
     * Rename a function and optionally re-order its arguments.
     * Handles nested parentheses correctly.
     *
     * @param  {string}   sql      Input SQL.
     * @param  {string}   oldName  Function name to find (case-insensitive).
     * @param  {string}   newName  Replacement function name.
     * @param  {number[]} argMap   Argument reorder map.
     *                             e.g. [1,0] swaps first two arguments.
     *                             Extra args beyond argMap length are kept as-is.
     * @return {string}
     */
    function swapFunctionArgs(sql, oldName, newName, argMap) {
        var result = '';
        var upper = sql.toUpperCase();
        var nameUpper = oldName.toUpperCase();
        var searchFrom = 0;
        var WORD_CHARS = /[A-Z0-9_]/;

        while (true) {
            var idx = upper.indexOf(nameUpper, searchFrom);
            if (idx === -1) { break; }

            /* word-boundary check before the name */
            var charBefore = idx > 0 ? upper[idx - 1] : ' ';
            if (WORD_CHARS.test(charBefore)) {
                searchFrom = idx + 1;
                continue;
            }

            /* word-boundary check after the name */
            var afterIdx = idx + nameUpper.length;
            var charAfter = afterIdx < upper.length ? upper[afterIdx] : ' ';
            if (WORD_CHARS.test(charAfter)) {
                searchFrom = idx + 1;
                continue;
            }

            /* skip whitespace to find '(' */
            var parenIdx = afterIdx;
            while (parenIdx < sql.length && sql[parenIdx] === ' ') { parenIdx++; }
            if (sql[parenIdx] !== '(') {
                searchFrom = idx + 1;
                continue;
            }

            var parsed = extractFunctionArgs(sql, parenIdx);
            if (!parsed) {
                searchFrom = idx + 1;
                continue;
            }

            /* build re-ordered arg list */
            var newArgs = [];
            var a;
            for (a = 0; a < argMap.length && a < parsed.args.length; a++) {
                var srcIdx = argMap[a];
                newArgs.push(srcIdx < parsed.args.length ? parsed.args[srcIdx] : '');
            }
            /* preserve any extra args beyond what argMap covers */
            for (a = argMap.length; a < parsed.args.length; a++) {
                newArgs.push(parsed.args[a]);
            }

            result += sql.substring(searchFrom, idx);
            result += newName + '(' + newArgs.join(', ') + ')';
            searchFrom = parsed.endPos + 1;
        }

        result += sql.substring(searchFrom);
        return result;
    }

    /**
     * Convert SELECT TOP n ... -> SELECT ... \nLIMIT n
     * Splits the input on ';' so each statement is processed independently.
     * Handles both TOP n and TOP (n).
     * NOTE: does not handle SELECT TOP inside subqueries (documented limitation).
     *
     * @param  {string} sql
     * @return {string}
     */
    function transformTopToLimit(sql) {
        var PAT_TOP    = /\bSELECT\s+TOP\s+(?:\((\d+)\)|(\d+))\s+/i;
        var PAT_TOP_G  = /\bSELECT\s+TOP\s+(?:\(\d+\)|\d+)\s+/i;
        var stmts = sql.split(';');
        var i, stmt, m, n;
        for (i = 0; i < stmts.length; i++) {
            stmt = stmts[i];
            m = PAT_TOP.exec(stmt);
            if (m) {
                n = m[1] || m[2];
                stmt = stmt.replace(PAT_TOP_G, 'SELECT ');
                stmt = stmt.replace(/\s+$/, '') + '\nLIMIT ' + n;
                stmts[i] = stmt;
            }
        }
        return stmts.join(';');
    }

    /**
     * Convert SELECT ... LIMIT n [OFFSET m] -> SELECT TOP n ... / OFFSET/FETCH NEXT
     * - LIMIT m only            -> SELECT TOP m ...
     * - LIMIT m OFFSET n        -> OFFSET n ROWS FETCH NEXT m ROWS ONLY
     *   (ORDER BY must already be in the SELECT; it remains in position)
     *
     * @param  {string} sql
     * @return {string}
     */
    function transformLimitToTop(sql) {
        return sql.replace(
            /\bSELECT\s+([\s\S]*?)\bLIMIT\s+(\d+)(\s+OFFSET\s+(\d+))?/gi,
            function (match, body, limitN, offsetClause, offsetN) {
                var trimmed = body.replace(/\s+$/, '');
                if (offsetN) {
                    /* OFFSET present: emit OFFSET/FETCH (ORDER BY must be in body) */
                    return 'SELECT ' + trimmed + 'OFFSET ' + offsetN +
                           ' ROWS FETCH NEXT ' + limitN + ' ROWS ONLY';
                }
                return 'SELECT TOP ' + limitN + ' ' + trimmed;
            }
        );
    }

    /**
     * Convert OFFSET n ROWS FETCH NEXT m ROWS ONLY -> LIMIT m OFFSET n
     * (modern T-SQL paging syntax -> SQLite paging syntax)
     * Must run before transformTopToLimit.
     *
     * @param  {string} sql
     * @return {string}
     */
    function transformOffsetFetchToLimit(sql) {
        return sql.replace(
            /\bOFFSET\s+(\d+)\s+ROWS?\s+FETCH\s+(?:NEXT|FIRST)\s+(\d+)\s+ROWS?\s+ONLY\b/gi,
            'LIMIT $2 OFFSET $1'
        );
    }

    /**
     * Convert STUFF((SELECT 'sep'+col FROM tbl [WHERE ...] FOR XML PATH('')), 1, n, '')
     * -> (SELECT GROUP_CONCAT(col, 'sep') FROM tbl [WHERE ...])
     *
     * Uses extractFunctionArgs for correct paren nesting.
     * Only converts the classic FOR XML PATH grouping idiom; unrecognised
     * STUFF patterns are left unchanged for the StuffWarning rule to flag.
     *
     * @param  {string} sql
     * @return {string}
     */
    function transformStuffForXmlToGroupConcat(sql) {
        var result = '';
        var upper = sql.toUpperCase();
        var searchFrom = 0;
        var STUFF_NAME = 'STUFF';
        var WORD_RE = /[A-Z0-9_]/;

        while (true) {
            var idx = upper.indexOf(STUFF_NAME, searchFrom);
            if (idx === -1) { break; }

            var charBefore = idx > 0 ? upper[idx - 1] : ' ';
            if (WORD_RE.test(charBefore)) { searchFrom = idx + 1; continue; }
            var afterIdx = idx + STUFF_NAME.length;
            var charAfter = afterIdx < upper.length ? upper[afterIdx] : ' ';
            if (WORD_RE.test(charAfter)) { searchFrom = idx + 1; continue; }

            var parenIdx = afterIdx;
            while (parenIdx < sql.length &&
                   (sql[parenIdx] === ' ' || sql[parenIdx] === '\t' ||
                    sql[parenIdx] === '\n' || sql[parenIdx] === '\r')) { parenIdx++; }
            if (sql[parenIdx] !== '(') { searchFrom = idx + 1; continue; }

            var parsed = extractFunctionArgs(sql, parenIdx);
            if (!parsed || parsed.args.length < 4) { searchFrom = idx + 1; continue; }

            var subqArg = parsed.args[0];

            /* Only handle the FOR XML PATH idiom */
            if (subqArg.toUpperCase().indexOf('FOR XML PATH') === -1) {
                searchFrom = idx + 1;
                continue;
            }

            /* Strip outer parens of the subquery arg */
            var inner = subqArg.replace(/^\s*\(\s*/, '').replace(/\s*\)\s*$/, '');

            /*
             * Pattern A: SELECT 'sep' + col_expr FROM tbl [WHERE cond] FOR XML PATH(...)
             */
            var sepMatch = inner.match(
                /^\s*SELECT\s+('[^']*')\s*\+\s*([\s\S]+?)\s+FROM\s+([\s\S]+?)\s*(?:WHERE\s+([\s\S]+?)\s+)?FOR\s+XML\s+PATH\s*\([^)]*\)/i
            );

            if (sepMatch) {
                var sep  = sepMatch[1];
                var col  = sepMatch[2].replace(/^\s+|\s+$/g, '');
                var from = sepMatch[3].replace(/^\s+|\s+$/g, '');
                var whr  = sepMatch[4] ? sepMatch[4].replace(/^\s+|\s+$/g, '') : null;

                var gcExpr = '(SELECT GROUP_CONCAT(' + col + ', ' + sep + ') FROM ' + from;
                if (whr) { gcExpr += ' WHERE ' + whr; }
                gcExpr += ')';
                result += sql.substring(searchFrom, idx) + gcExpr;
                searchFrom = parsed.endPos + 1;
                continue;
            }

            /*
             * Pattern B: SELECT col_expr FROM tbl [WHERE cond] FOR XML PATH(...)
             * (no separator prefix - defaults to empty)
             */
            var noSepMatch = inner.match(
                /^\s*SELECT\s+([\s\S]+?)\s+FROM\s+([\s\S]+?)\s*(?:WHERE\s+([\s\S]+?)\s+)?FOR\s+XML\s+PATH\s*\([^)]*\)/i
            );

            if (noSepMatch) {
                var ns_col  = noSepMatch[1].replace(/^\s+|\s+$/g, '');
                var ns_from = noSepMatch[2].replace(/^\s+|\s+$/g, '');
                var ns_whr  = noSepMatch[3] ? noSepMatch[3].replace(/^\s+|\s+$/g, '') : null;

                var ns_gc = '(SELECT GROUP_CONCAT(' + ns_col + ') FROM ' + ns_from;
                if (ns_whr) { ns_gc += ' WHERE ' + ns_whr; }
                ns_gc += ')';
                result += sql.substring(searchFrom, idx) + ns_gc;
                searchFrom = parsed.endPos + 1;
                continue;
            }

            /* Unrecognised STUFF pattern - leave as-is for warning rule */
            searchFrom = idx + 1;
        }

        result += sql.substring(searchFrom);
        return result;
    }

    /**
     * Split a string by commas at parenthesis depth 0.
     * @param  {string} str
     * @return {string[]}
     */
    function splitDepthZeroCommas(str) {
        var parts = [];
        var cur = '';
        var depth = 0;
        var i, ch;
        for (i = 0; i < str.length; i++) {
            ch = str[i];
            if      (ch === '(')         { depth++; cur += ch; }
            else if (ch === ')')         { depth--; cur += ch; }
            else if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; }
            else                         { cur += ch; }
        }
        if (cur) { parts.push(cur); }
        return parts;
    }

    /**
     * Find the first occurrence of a SQL keyword at parenthesis depth 0.
     * @param  {string} str
     * @param  {string} keyword
     * @param  {number} fromIdx  Start scanning from this index.
     * @return {number}          Index of the keyword, or -1.
     */
    function findKeywordAtDepthZero(str, keyword, fromIdx) {
        var depth = 0;
        var upper = str.toUpperCase();
        var kUpper = keyword.toUpperCase();
        var kLen = kUpper.length;
        var WORD = /[A-Z0-9_"]/i;
        var i, ch, before, after;
        for (i = (fromIdx || 0); i <= str.length - kLen; i++) {
            ch = str[i];
            if      (ch === '(') { depth++; continue; }
            else if (ch === ')') { depth--; continue; }
            if (depth === 0 && upper.substring(i, i + kLen) === kUpper) {
                before = i > 0            ? str[i - 1]          : ' ';
                after  = (i + kLen) < str.length ? str[i + kLen] : ' ';
                if (!WORD.test(before) && !WORD.test(after)) { return i; }
            }
        }
        return -1;
    }

    /**
     * Convert  FOR JSON PATH / FOR JSON AUTO  to SQLite json_group_array(json_object(...)).
     *
     * Runs AFTER BracketToDoubleQuote so identifiers are already in "col" form.
     *
     * Supports:
     *   FOR JSON PATH                   -> json_group_array(json_object(...))
     *   FOR JSON PATH, ROOT('name')     -> json_object('name', json_group_array(json_object(...)))
     *   FOR JSON PATH, WITHOUT_ARRAY_WRAPPER -> json_object(...)  (single-row, no outer array)
     *   SELECT TOP n ... FOR JSON PATH  -> LIMIT n appended
     *
     * Column key is taken from AS alias if present, otherwise from the last
     * identifier in the expression.
     *
     * @param  {string} sql
     * @return {string}
     */
    function transformForJsonPath(sql) {
        var stmts = sql.split(';');
        var s, stmt, fjMatch, opts, withoutWrapper, rootMatch, rootName;
        var base, depth, k, seg, cb, ca, selectIdx, prefix;
        var pos, topN, topRe, fromIdx, colsPart, fromPart;
        var cols, pairs, c, col, key, expr, asQ, asU, nm;
        var jsonObj, jsonExpr, out;

        var FOR_JSON_RE = /\bFOR\s+JSON\s+(?:PATH|AUTO)((?:\s*,\s*(?:ROOT\s*\('[^']*'\)|WITHOUT_ARRAY_WRAPPER))*)\s*$/i;
        var WORD_RE = /[A-Z0-9_"]/i;

        for (s = 0; s < stmts.length; s++) {
            stmt = stmts[s];
            fjMatch = FOR_JSON_RE.exec(stmt);
            if (!fjMatch) { continue; }

            opts           = fjMatch[1] || '';
            withoutWrapper = /WITHOUT_ARRAY_WRAPPER/i.test(opts);
            rootMatch      = /ROOT\s*\('([^']*)'\)/i.exec(opts);
            rootName       = rootMatch ? rootMatch[1] : null;

            /* strip FOR JSON clause */
            base = stmt.substring(0, fjMatch.index).replace(/\s+$/, '');

            /* find the outermost (last depth-0) SELECT */
            selectIdx = -1;
            depth = 0;
            for (k = 0; k < base.length; k++) {
                if (base[k] === '(')      { depth++; continue; }
                if (base[k] === ')')      { depth--; continue; }
                if (depth === 0) {
                    seg = base.substring(k, k + 6).toUpperCase();
                    if (seg === 'SELECT') {
                        cb = k > 0 ? base[k - 1] : ' ';
                        ca = base[k + 6] || ' ';
                        if (!WORD_RE.test(cb) && !WORD_RE.test(ca)) { selectIdx = k; }
                    }
                }
            }
            if (selectIdx === -1) { continue; }

            /* prefix = everything before outermost SELECT (e.g. WITH clause) */
            prefix = base.substring(0, selectIdx);

            /* skip past SELECT keyword + whitespace */
            pos = selectIdx + 6;
            while (pos < base.length && /\s/.test(base[pos])) { pos++; }

            /* extract optional TOP n */
            topN  = null;
            topRe = /^TOP\s+(?:\((\d+)\)|(\d+))\s+/i.exec(base.substring(pos));
            if (topRe) { topN = topRe[1] || topRe[2]; pos += topRe[0].length; }

            /* find first depth-0 FROM after the column list */
            fromIdx = findKeywordAtDepthZero(base, 'FROM', pos);
            if (fromIdx === -1) { continue; }

            colsPart = base.substring(pos, fromIdx).trim();
            fromPart = base.substring(fromIdx);

            /* parse each column to produce json_object('key', expr) pairs */
            cols  = splitDepthZeroCommas(colsPart);
            pairs = [];
            for (c = 0; c < cols.length; c++) {
                col = cols[c].trim();
                if (!col) { continue; }

                asQ = /^([\s\S]+?)\s+AS\s+"([^"]+)"\s*$/i.exec(col);
                asU = !asQ && /^([\s\S]+?)\s+AS\s+(\w+)\s*$/i.exec(col);

                if (asQ)      { expr = asQ[1].trim(); key = asQ[2]; }
                else if (asU) { expr = asU[1].trim(); key = asU[2]; }
                else {
                    expr = col;
                    nm   = /"([^"]+)"\s*$/.exec(col) || /(\w+)\s*$/.exec(col);
                    key  = nm ? nm[1] : col.replace(/\W+/g, '_');
                }
                pairs.push("'" + key.replace(/'/g, "''") + "', " + expr);
            }

            jsonObj  = 'json_object(' + pairs.join(', ') + ')';
            jsonExpr = withoutWrapper ? jsonObj : 'json_group_array(' + jsonObj + ')';
            if (rootName) {
                jsonExpr = "json_object('" + rootName.replace(/'/g, "''") + "', " + jsonExpr + ')';
            }

            out = prefix + 'SELECT ' + jsonExpr + ' AS result\n' + fromPart;
            if (topN) { out = out.replace(/\s*$/, '') + '\nLIMIT ' + topN; }
            stmts[s] = out;
        }
        return stmts.join(';');
    }


    /* =========================================================================
     * SqlAdapterRule
     * =========================================================================
     * A single transformation step.
     *
     * Constructor overloads:
     *   new SqlAdapterRule(name, regExp, replacement)
     *     -> sql.replace(regExp, replacement)
     *
     *   new SqlAdapterRule(name, fn)
     *     -> fn(sql) must return the transformed string
     * ========================================================================= */
    function SqlAdapterRule(name, matcherOrFn, replacement) {
        if (typeof name !== 'string' || !name) {
            throw new Error('SqlAdapterRule: name must be a non-empty string.');
        }
        this.name = name;

        if (typeof matcherOrFn === 'function') {
            this._fn = matcherOrFn;
        } else if (matcherOrFn instanceof RegExp) {
            if (replacement === undefined) {
                throw new Error('SqlAdapterRule "' + name + '": replacement is required when matcher is a RegExp.');
            }
            this._pattern     = matcherOrFn;
            this._replacement = replacement;
        } else {
            throw new Error('SqlAdapterRule "' + name + '": matcher must be a RegExp or a function.');
        }
    }

    /**
     * Apply this rule to a SQL string and return the result.
     * @param  {string} sql
     * @return {string}
     */
    SqlAdapterRule.prototype.apply = function (sql) {
        if (this._fn) {
            return this._fn(sql);
        }
        return sql.replace(this._pattern, this._replacement);
    };

    SqlAdapterRule.prototype.toString = function () {
        return '[SqlAdapterRule: ' + this.name + ']';
    };


    /* =========================================================================
     * SqlAdapter  (base)
     * ========================================================================= */
    /**
     * @param {string} name  Display name for this adapter instance.
     */
    function SqlAdapter(name) {
        this.name  = name || 'SqlAdapter';
        this.rules = [];
    }

    /**
     * Append a rule.
     * @param  {SqlAdapterRule} rule
     * @return {SqlAdapter}  Returns this for chaining.
     */
    SqlAdapter.prototype.addRule = function (rule) {
        if (!(rule instanceof SqlAdapterRule)) {
            throw new Error('SqlAdapter.addRule expects a SqlAdapterRule instance.');
        }
        this.rules.push(rule);
        return this;
    };

    /**
     * Apply all rules in order and return the transformed SQL.
     * @param  {string} sql
     * @return {string}
     */
    SqlAdapter.prototype.adapt = function (sql) {
        if (typeof sql !== 'string') {
            throw new Error('SqlAdapter.adapt expects a string.');
        }
        var result = sql;
        var i;
        for (i = 0; i < this.rules.length; i++) {
            result = this.rules[i].apply(result);
        }
        return result;
    };

    /**
     * Return the names of all registered rules (useful for debugging).
     * @return {string[]}
     */
    SqlAdapter.prototype.getRuleNames = function () {
        var names = [];
        var i;
        for (i = 0; i < this.rules.length; i++) {
            names.push(this.rules[i].name);
        }
        return names;
    };

    /**
     * Return a full diagnostic report string.
     * @return {string}
     */
    SqlAdapter.prototype.describe = function () {
        var lines = ['Adapter: ' + this.name, 'Rules (' + this.rules.length + '):'];
        var i;
        for (i = 0; i < this.rules.length; i++) {
            lines.push('  ' + (i + 1) + '. ' + this.rules[i].name);
        }
        return lines.join('\n');
    };


    /* =========================================================================
     * SqlServerToSQLiteAdapter
     * =========================================================================
     * Converts T-SQL (SQL Server) syntax to SQLite syntax.
     * ========================================================================= */
    function SqlServerToSQLiteAdapter() {
        SqlAdapter.call(this, 'SqlServer -> SQLite');
        this._buildRules();
    }

    SqlServerToSQLiteAdapter.prototype = Object.create(SqlAdapter.prototype);
    SqlServerToSQLiteAdapter.prototype.constructor = SqlServerToSQLiteAdapter;

    SqlServerToSQLiteAdapter.prototype._buildRules = function () {

        /* -----------------------------------------------------------------
         * 1. Identifier quoting:  [columnName] -> "columnName"
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule(
            'BracketToDoubleQuote',
            /\[([^\]]+)\]/g,
            '"$1"'
        ));

        /* -----------------------------------------------------------------
         * 1b. FOR JSON PATH/AUTO -> json_group_array(json_object(...))
         *     Runs after bracket quoting so identifiers are already "col".
         *     Handles ROOT('name') and WITHOUT_ARRAY_WRAPPER options.
         *     TOP n is detected here and added as LIMIT n.
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('ForJsonPath', transformForJsonPath));

        /* -----------------------------------------------------------------
         * 2a. Structural: OFFSET n ROWS FETCH NEXT m ROWS ONLY -> LIMIT m OFFSET n
         *     Runs before TopToLimit (OFFSET/FETCH and TOP are mutually exclusive).
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule(
            'OffsetFetchToLimit',
            transformOffsetFetchToLimit
        ));

        /* -----------------------------------------------------------------
         * 2b. Structural: SELECT TOP n ... -> SELECT ... LIMIT n
         *    (split-by-semicolon approach; subquery limitation documented)
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule(
            'TopToLimit',
            transformTopToLimit
        ));

        /* -----------------------------------------------------------------
         * 3. Query hints (remove, SQLite has no locking hints)
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('RemoveWithNolock',         /\bWITH\s*\(\s*NOLOCK\s*\)/gi,          ''));
        this.addRule(new SqlAdapterRule('RemoveWithReadUncommitted',/\bWITH\s*\(\s*READUNCOMMITTED\s*\)/gi, ''));
        this.addRule(new SqlAdapterRule('RemoveWithHoldlock',       /\bWITH\s*\(\s*HOLDLOCK\s*\)/gi,        ''));
        this.addRule(new SqlAdapterRule('RemoveNolock',             /\bNOLOCK\b/gi,                         ''));

        /* -----------------------------------------------------------------
         * 4. NULL-handling functions
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('IsNullToIfNull', /\bISNULL\s*\(/gi, 'IFNULL('));
        this.addRule(new SqlAdapterRule('NvlToIfNull',    /\bNVL\s*\(/gi,    'IFNULL('));

        /* -----------------------------------------------------------------
         * 5. Date/time: current timestamp
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('GetDate',        /\bGETDATE\s*\(\s*\)/gi,        "datetime('now')"));
        this.addRule(new SqlAdapterRule('GetUtcDate',     /\bGETUTCDATE\s*\(\s*\)/gi,     "datetime('now')"));
        this.addRule(new SqlAdapterRule('SysDateTime',    /\bSYSDATETIME\s*\(\s*\)/gi,    "datetime('now')"));
        this.addRule(new SqlAdapterRule('SysUtcDateTime', /\bSYSUTCDATETIME\s*\(\s*\)/gi, "datetime('now')"));
        this.addRule(new SqlAdapterRule('SysDateTimeOf',  /\bSYSDATETIMEOFFSET\s*\(\s*\)/gi, "datetime('now')"));

        /* -----------------------------------------------------------------
         * 6. Date/time: YEAR / MONTH / DAY shorthand
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('Year',  /\bYEAR\s*\(/gi,  "strftime('%Y', "));
        this.addRule(new SqlAdapterRule('Month', /\bMONTH\s*\(/gi, "strftime('%m', "));
        this.addRule(new SqlAdapterRule('Day',   /\bDAY\s*\(/gi,   "strftime('%d', "));

        /* -----------------------------------------------------------------
         * 7. Date/time: DATEPART(part, expr) -> strftime(fmt, expr)
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('DatePartYear',    /\bDATEPART\s*\(\s*(?:YEAR|YY|YYYY)\s*,/gi,     "strftime('%Y',"));
        this.addRule(new SqlAdapterRule('DatePartQuarter', /\bDATEPART\s*\(\s*(?:QUARTER|QQ|Q)\s*,/gi,     "strftime('%Q',"));
        this.addRule(new SqlAdapterRule('DatePartMonth',   /\bDATEPART\s*\(\s*(?:MONTH|MM|M)\s*,/gi,       "strftime('%m',"));
        this.addRule(new SqlAdapterRule('DatePartDayOfYear',/\bDATEPART\s*\(\s*(?:DAYOFYEAR|DY|Y)\s*,/gi,  "strftime('%j',"));
        this.addRule(new SqlAdapterRule('DatePartDay',     /\bDATEPART\s*\(\s*(?:DAY|DD|D)\s*,/gi,         "strftime('%d',"));
        this.addRule(new SqlAdapterRule('DatePartWeek',    /\bDATEPART\s*\(\s*(?:WEEK|WK|WW)\s*,/gi,       "strftime('%W',"));
        this.addRule(new SqlAdapterRule('DatePartWeekDay', /\bDATEPART\s*\(\s*(?:WEEKDAY|DW)\s*,/gi,       "strftime('%w',"));
        this.addRule(new SqlAdapterRule('DatePartHour',    /\bDATEPART\s*\(\s*(?:HOUR|HH)\s*,/gi,          "strftime('%H',"));
        this.addRule(new SqlAdapterRule('DatePartMinute',  /\bDATEPART\s*\(\s*(?:MINUTE|MI|N)\s*,/gi,      "strftime('%M',"));
        this.addRule(new SqlAdapterRule('DatePartSecond',  /\bDATEPART\s*\(\s*(?:SECOND|SS|S)\s*,/gi,      "strftime('%S',"));

        /* DATENAME uses same format strings as DATEPART in SQLite */
        this.addRule(new SqlAdapterRule('DateNameYear',   /\bDATENAME\s*\(\s*(?:YEAR|YY|YYYY)\s*,/gi,  "strftime('%Y',"));
        this.addRule(new SqlAdapterRule('DateNameMonth',  /\bDATENAME\s*\(\s*(?:MONTH|MM|M)\s*,/gi,    "strftime('%m',"));
        this.addRule(new SqlAdapterRule('DateNameDay',    /\bDATENAME\s*\(\s*(?:DAY|DD|D)\s*,/gi,      "strftime('%d',"));

        /* -----------------------------------------------------------------
         * 8. Date/time: DATEADD(part, n, date) -> date(date, '+n part')
         *    NOTE: date argument must be a simple expression (no nested funcs)
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('DateAddYear',   /\bDATEADD\s*\(\s*(?:YEAR|YY|YYYY)\s*,\s*(-?\d+)\s*,\s*([^,)]+(?:\([^)]*\))?)\s*\)/gi,    "date($2, '+$1 years')"));
        this.addRule(new SqlAdapterRule('DateAddQuarter',/\bDATEADD\s*\(\s*(?:QUARTER|QQ|Q)\s*,\s*(-?\d+)\s*,\s*([^,)]+(?:\([^)]*\))?)\s*\)/gi,    "date($2, '+$1 months', '$1 months', '$1 months') /* QUARTER: verify */"));
        this.addRule(new SqlAdapterRule('DateAddMonth',  /\bDATEADD\s*\(\s*(?:MONTH|MM|M)\s*,\s*(-?\d+)\s*,\s*([^,)]+(?:\([^)]*\))?)\s*\)/gi,      "date($2, '+$1 months')"));
        this.addRule(new SqlAdapterRule('DateAddDay',    /\bDATEADD\s*\(\s*(?:DAY|DD|D)\s*,\s*(-?\d+)\s*,\s*([^,)]+(?:\([^)]*\))?)\s*\)/gi,        "date($2, '+$1 days')"));
        this.addRule(new SqlAdapterRule('DateAddHour',   /\bDATEADD\s*\(\s*(?:HOUR|HH)\s*,\s*(-?\d+)\s*,\s*([^,)]+(?:\([^)]*\))?)\s*\)/gi,         "datetime($2, '+$1 hours')"));
        this.addRule(new SqlAdapterRule('DateAddMinute', /\bDATEADD\s*\(\s*(?:MINUTE|MI|N)\s*,\s*(-?\d+)\s*,\s*([^,)]+(?:\([^)]*\))?)\s*\)/gi,     "datetime($2, '+$1 minutes')"));
        this.addRule(new SqlAdapterRule('DateAddSecond', /\bDATEADD\s*\(\s*(?:SECOND|SS|S)\s*,\s*(-?\d+)\s*,\s*([^,)]+(?:\([^)]*\))?)\s*\)/gi,     "datetime($2, '+$1 seconds')"));

        /* -----------------------------------------------------------------
         * 9. String functions
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('LenToLength',         /\bLEN\s*\(/gi,       'LENGTH('));
        this.addRule(new SqlAdapterRule('SubstringToSubstr',   /\bSUBSTRING\s*\(/gi, 'SUBSTR('));
        this.addRule(new SqlAdapterRule('PatindexWarning',  /\bPATINDEX\s*\(/gi,  '/* PATINDEX: no native SQLite equivalent - convert manually */ PATINDEX('));
        this.addRule(new SqlAdapterRule('ReplicateWarning', /\bREPLICATE\s*\(/gi, '/* REPLICATE: no native SQLite equivalent - convert manually */ REPLICATE('));

        /* STUFF((SELECT sep+col FROM tbl FOR XML PATH('')), 1, n, '') -> GROUP_CONCAT */
        this.addRule(new SqlAdapterRule('StuffForXmlToGroupConcat', transformStuffForXmlToGroupConcat));
        /* Remaining STUFF calls (not FOR XML PATH) -> warning */
        this.addRule(new SqlAdapterRule('StuffWarning', /\bSTUFF\s*\(/gi, '/* STUFF: use SUBSTR()||SUBSTR() in SQLite */ STUFF('));

        /* FORMAT(val, fmt[, culture]) -> printf(fmt, val)  [args swapped] */
        this.addRule(new SqlAdapterRule('FormatToPrintf', function (sql) {
            return swapFunctionArgs(sql, 'FORMAT', 'printf', [1, 0]);
        }));

        /* -----------------------------------------------------------------
         * 9b. Aggregation: STRING_AGG -> GROUP_CONCAT
         * ----------------------------------------------------------------- */

        /* STRING_AGG(col, sep) WITHIN GROUP (ORDER BY ...) -> GROUP_CONCAT(col, sep)
         * SQLite's GROUP_CONCAT does not support ORDER BY inside aggregate;
         * the WITHIN GROUP clause is dropped with a comment. */
        this.addRule(new SqlAdapterRule(
            'StringAggWithinGroup',
            /\bSTRING_AGG\s*\(\s*([^,)]+)\s*,\s*('[^']*')\s*\)\s+WITHIN\s+GROUP\s*\([^)]+\)/gi,
            'GROUP_CONCAT($1, $2) /* WITHIN GROUP ORDER BY dropped - not supported in SQLite */'
        ));
        /* STRING_AGG(col, sep) without WITHIN GROUP */
        this.addRule(new SqlAdapterRule('StringAggToGroupConcat', /\bSTRING_AGG\s*\(/gi, 'GROUP_CONCAT('));

        /* -----------------------------------------------------------------
         * 9c. FOR XML PATH / FOR JSON PATH
         * ----------------------------------------------------------------- */

        /* FOR XML PATH: strip cleanly after STUFF conversion */
        this.addRule(new SqlAdapterRule(
            'ForXmlPathStrip',
            /\bFOR\s+XML\s+(?:PATH|AUTO|RAW|EXPLICIT)\s*(?:\([^)]*\))?(?:\s*,\s*TYPE)?/gi,
            ''
        ));

        /* FOR JSON PATH is handled by rule ForJsonPath (rule 1b).
         * Fallback: strip any FOR JSON that was not caught by the structural transform
         * (e.g. inside a subquery or otherwise unparseable structure). */
        this.addRule(new SqlAdapterRule(
            'ForJsonPathFallback',
            /\bFOR\s+JSON\s+(?:PATH|AUTO)(?:\s*,\s*(?:ROOT|WITHOUT_ARRAY_WRAPPER)(?:\s*\('[^']*'\))?)*\s*/gi,
            ''
        ));

        /* STR(n) -> CAST(n AS TEXT) */
        this.addRule(new SqlAdapterRule('StrToText', /\bSTR\s*\(\s*([^,)]+)\s*\)/gi, 'CAST($1 AS TEXT)'));

        /* NEWID() -> lower(hex(randomblob(16))) */
        this.addRule(new SqlAdapterRule('NewId', /\bNEWID\s*\(\s*\)/gi, 'lower(hex(randomblob(16)))'));

        /* CHARINDEX(needle, haystack[, start]) -> INSTR(haystack, needle)  [args swapped, start dropped] */
        this.addRule(new SqlAdapterRule('CharIndexToInstr', function (sql) {
            return swapFunctionArgs(sql, 'CHARINDEX', 'INSTR', [1, 0]);
        }));

        /* IIF(cond, a, b) -> keep as-is (SQLite also supports IIF) */

        /* -----------------------------------------------------------------
         * 10. Type conversion: CONVERT(type, expr) -> CAST(expr AS type)
         *     Only simple / common cases; complex CONVERT with style args
         *     get a warning comment.
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('ConvertToVarchar', /\bCONVERT\s*\(\s*(?:N?VARCHAR|NCHAR|CHAR)\s*(?:\([^)]*\))?\s*,\s*([^,)]+)\s*\)/gi,  'CAST($1 AS TEXT)'));
        this.addRule(new SqlAdapterRule('ConvertToInt',     /\bCONVERT\s*\(\s*(?:INT|INTEGER|BIGINT|SMALLINT|TINYINT)\s*,\s*([^,)]+)\s*\)/gi,     'CAST($1 AS INTEGER)'));
        this.addRule(new SqlAdapterRule('ConvertToFloat',   /\bCONVERT\s*\(\s*(?:FLOAT|REAL|DECIMAL|NUMERIC)\s*(?:\([^)]*\))?\s*,\s*([^,)]+)\s*\)/gi, 'CAST($1 AS REAL)'));
        this.addRule(new SqlAdapterRule('ConvertToDate',    /\bCONVERT\s*\(\s*(?:DATE|DATETIME|DATETIME2)\s*,\s*([^,)]+)\s*\)/gi,                 'CAST($1 AS TEXT)'));

        /* -----------------------------------------------------------------
         * 11. Data types (for DDL / CAST expressions)
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('TypeBit',              /\bBIT\b/gi,                                    'INTEGER'));
        this.addRule(new SqlAdapterRule('TypeTinyint',          /\bTINYINT\b/gi,                                'INTEGER'));
        this.addRule(new SqlAdapterRule('TypeSmallint',         /\bSMALLINT\b/gi,                               'INTEGER'));
        this.addRule(new SqlAdapterRule('TypeBigint',           /\bBIGINT\b/gi,                                 'INTEGER'));
        this.addRule(new SqlAdapterRule('TypeFloat',            /\bFLOAT\b/gi,                                  'REAL'));
        this.addRule(new SqlAdapterRule('TypeMoney',            /\bMONEY\b/gi,                                  'REAL'));
        this.addRule(new SqlAdapterRule('TypeSmallMoney',       /\bSMALLMONEY\b/gi,                             'REAL'));
        this.addRule(new SqlAdapterRule('TypeNVarcharMax',      /\bNVARCHAR\s*\(\s*MAX\s*\)/gi,                 'TEXT'));
        this.addRule(new SqlAdapterRule('TypeVarcharMax',       /\bVARCHAR\s*\(\s*MAX\s*\)/gi,                  'TEXT'));
        this.addRule(new SqlAdapterRule('TypeNVarchar',         /\bNVARCHAR\b/gi,                               'TEXT'));
        this.addRule(new SqlAdapterRule('TypeVarchar',          /\bVARCHAR\b/gi,                                'TEXT'));
        this.addRule(new SqlAdapterRule('TypeNChar',            /\bNCHAR\b/gi,                                  'TEXT'));
        this.addRule(new SqlAdapterRule('TypeNText',            /\bNTEXT\b/gi,                                  'TEXT'));
        this.addRule(new SqlAdapterRule('TypeDatetime2',        /\bDATETIME2\b/gi,                              'TEXT'));
        this.addRule(new SqlAdapterRule('TypeDatetime',         /\bDATETIME\b/gi,                               'TEXT'));
        this.addRule(new SqlAdapterRule('TypeSmallDatetime',    /\bSMALLDATETIME\b/gi,                          'TEXT'));
        this.addRule(new SqlAdapterRule('TypeUniqueIdentifier', /\bUNIQUEIDENTIFIER\b/gi,                       'TEXT'));
        this.addRule(new SqlAdapterRule('TypeXml',              /\bXML\b/gi,                                    'TEXT'));
        this.addRule(new SqlAdapterRule('TypeVarBinary',        /\bVARBINARY\s*(?:\([^)]*\))?/gi,               'BLOB'));
        this.addRule(new SqlAdapterRule('TypeBinary',           /\bBINARY\s*(?:\([^)]*\))?/gi,                  'BLOB'));
        this.addRule(new SqlAdapterRule('TypeImage',            /\bIMAGE\b/gi,                                  'BLOB'));

        /* -----------------------------------------------------------------
         * 12. DDL-level transformations
         * ----------------------------------------------------------------- */
        /* IDENTITY(s,i) -> AUTOINCREMENT */
        this.addRule(new SqlAdapterRule('Identity', /\bIDENTITY\s*\(\s*\d+\s*,\s*\d+\s*\)/gi, 'AUTOINCREMENT'));

        /* GO statement separator -> remove (SQLite uses ;) */
        this.addRule(new SqlAdapterRule('GoBatchSeparator', /^\s*GO\s*$/gim, ''));

        /* USE DatabaseName -> remove */
        this.addRule(new SqlAdapterRule('UseDatabase', /^\s*USE\s+\S+\s*;?\s*$/gim, ''));

        /* IF OBJECT_ID('...') IS NOT NULL DROP TABLE ... -> comment-flag */
        this.addRule(new SqlAdapterRule('DropIfExists',
            /IF\s+OBJECT_ID\s*\([^)]+\)\s+IS\s+NOT\s+NULL\s*/gi,
            '/* IF EXISTS - convert to: DROP TABLE IF EXISTS ... */ '
        ));

        /* CREATE INDEX ... INCLUDE (...) -> remove INCLUDE clause (not in SQLite) */
        this.addRule(new SqlAdapterRule('IndexInclude', /\bINCLUDE\s*\([^)]*\)/gi, ''));

        /* NONCLUSTERED / CLUSTERED keywords -> remove */
        this.addRule(new SqlAdapterRule('NonClustered', /\bNONCLUSTERED\b/gi, ''));
        this.addRule(new SqlAdapterRule('Clustered',    /\bCLUSTERED\b/gi,    ''));

        /* WITH FILLFACTOR = n -> remove */
        this.addRule(new SqlAdapterRule('FillFactor', /\bWITH\s*\(\s*FILLFACTOR\s*=\s*\d+\s*\)/gi, ''));

        /* SET NOCOUNT ON/OFF -> remove */
        this.addRule(new SqlAdapterRule('SetNoCount', /^\s*SET\s+NOCOUNT\s+(?:ON|OFF)\s*;?\s*$/gim, ''));

        /* PRINT 'message' -> remove */
        this.addRule(new SqlAdapterRule('Print', /^\s*PRINT\s+[^\n]+\n?/gim, ''));

        /* NOTE: string concatenation (+) is intentionally NOT converted to (||)
         * because + is also used for numeric addition and cannot be distinguished
         * from string concatenation without type information. */
    };


    /* =========================================================================
     * SQLiteToSqlServerAdapter
     * =========================================================================
     * Converts SQLite syntax to T-SQL (SQL Server) syntax.
     * ========================================================================= */
    function SQLiteToSqlServerAdapter() {
        SqlAdapter.call(this, 'SQLite -> SqlServer');
        this._buildRules();
    }

    SQLiteToSqlServerAdapter.prototype = Object.create(SqlAdapter.prototype);
    SQLiteToSqlServerAdapter.prototype.constructor = SQLiteToSqlServerAdapter;

    SQLiteToSqlServerAdapter.prototype._buildRules = function () {

        /* -----------------------------------------------------------------
         * 1. Identifier quoting: "columnName" -> [columnName]
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule(
            'DoubleQuoteToBracket',
            /"([^"]+)"/g,
            '[$1]'
        ));

        /* -----------------------------------------------------------------
         * 2. Structural: SELECT ... LIMIT n -> SELECT TOP n ...
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('LimitToTop', transformLimitToTop));

        /* -----------------------------------------------------------------
         * 3. NULL-handling
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('IfNullToIsNull', /\bIFNULL\s*\(/gi, 'ISNULL('));

        /* -----------------------------------------------------------------
         * 4. Date/time: SQLite datetime functions -> TSql
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('DatetimeNow',    /\bdatetime\s*\(\s*'now'\s*\)/gi, 'GETDATE()'));
        this.addRule(new SqlAdapterRule('StrftimeYear',   /\bstrftime\s*\(\s*'%Y'\s*,/gi,   'YEAR('));
        this.addRule(new SqlAdapterRule('StrftimeMonth',  /\bstrftime\s*\(\s*'%m'\s*,/gi,   'MONTH('));
        this.addRule(new SqlAdapterRule('StrftimeDay',    /\bstrftime\s*\(\s*'%d'\s*,/gi,   'DAY('));
        this.addRule(new SqlAdapterRule('StrftimeHour',   /\bstrftime\s*\(\s*'%H'\s*,/gi,   "DATEPART(hour,"));
        this.addRule(new SqlAdapterRule('StrftimeMinute', /\bstrftime\s*\(\s*'%M'\s*,/gi,   "DATEPART(minute,"));
        this.addRule(new SqlAdapterRule('StrftimeSecond', /\bstrftime\s*\(\s*'%S'\s*,/gi,   "DATEPART(second,"));

        /* date(x, '+n years') -> DATEADD(year, n, x) */
        this.addRule(new SqlAdapterRule('DateFnYears',   /\bdate\s*\(\s*([^,)]+)\s*,\s*'([+-]\d+)\s+years'\s*\)/gi,    'DATEADD(year, $2, $1)'));
        this.addRule(new SqlAdapterRule('DateFnMonths',  /\bdate\s*\(\s*([^,)]+)\s*,\s*'([+-]\d+)\s+months'\s*\)/gi,   'DATEADD(month, $2, $1)'));
        this.addRule(new SqlAdapterRule('DateFnDays',    /\bdate\s*\(\s*([^,)]+)\s*,\s*'([+-]\d+)\s+days'\s*\)/gi,     'DATEADD(day, $2, $1)'));
        this.addRule(new SqlAdapterRule('DatetimeFnHrs', /\bdatetime\s*\(\s*([^,)]+)\s*,\s*'([+-]\d+)\s+hours'\s*\)/gi,    'DATEADD(hour, $2, $1)'));
        this.addRule(new SqlAdapterRule('DatetimeFnMin', /\bdatetime\s*\(\s*([^,)]+)\s*,\s*'([+-]\d+)\s+minutes'\s*\)/gi,  'DATEADD(minute, $2, $1)'));
        this.addRule(new SqlAdapterRule('DatetimeFnSec', /\bdatetime\s*\(\s*([^,)]+)\s*,\s*'([+-]\d+)\s+seconds'\s*\)/gi,  'DATEADD(second, $2, $1)'));

        /* -----------------------------------------------------------------
         * 5. String functions
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('LengthToLen',       /\bLENGTH\s*\(/gi,       'LEN('));
        this.addRule(new SqlAdapterRule('SubstrToSubstring', /\bSUBSTR\s*\(/gi,        'SUBSTRING('));

        /* INSTR(haystack, needle) -> CHARINDEX(needle, haystack)  [args swapped] */
        this.addRule(new SqlAdapterRule('InstrToCharIndex', function (sql) {
            return swapFunctionArgs(sql, 'INSTR', 'CHARINDEX', [1, 0]);
        }));

        /* GROUP_CONCAT(col, sep) -> STRING_AGG(col, sep) */
        this.addRule(new SqlAdapterRule('GroupConcatToStringAgg', /\bGROUP_CONCAT\s*\(/gi, 'STRING_AGG('));

        /* lower(hex(randomblob(16))) -> NEWID() */
        this.addRule(new SqlAdapterRule('RandomBlobToNewId',
            /\blower\s*\(\s*hex\s*\(\s*randomblob\s*\(\s*16\s*\)\s*\)\s*\)/gi,
            'NEWID()'
        ));

        /* -----------------------------------------------------------------
         * 6. Type conversions: CAST(x AS type) -> CONVERT(type, x)
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('CastToText',    /\bCAST\s*\(\s*([^)]+?)\s+AS\s+TEXT\s*\)/gi,    'CONVERT(NVARCHAR(MAX), $1)'));
        this.addRule(new SqlAdapterRule('CastToInt',     /\bCAST\s*\(\s*([^)]+?)\s+AS\s+INTEGER\s*\)/gi, 'CONVERT(INT, $1)'));
        this.addRule(new SqlAdapterRule('CastToReal',    /\bCAST\s*\(\s*([^)]+?)\s+AS\s+REAL\s*\)/gi,    'CONVERT(FLOAT, $1)'));
        this.addRule(new SqlAdapterRule('CastToNumeric', /\bCAST\s*\(\s*([^)]+?)\s+AS\s+NUMERIC\s*\)/gi, 'CONVERT(DECIMAL(18,4), $1)'));

        /* -----------------------------------------------------------------
         * 7. String concatenation:  ||  ->  +
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('ConcatToPlus', /\|\|/g, '+'));

        /* -----------------------------------------------------------------
         * 8. Data types (DDL)
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('TypeAutoincrement', /\bAUTOINCREMENT\b/gi, 'IDENTITY(1,1)'));
        this.addRule(new SqlAdapterRule('TypeBlob',          /\bBLOB\b/gi,           'VARBINARY(MAX)'));

        /* -----------------------------------------------------------------
         * 9. Boolean literals
         * ----------------------------------------------------------------- */
        this.addRule(new SqlAdapterRule('BoolTrue',  /\bTRUE\b/gi,  '1'));
        this.addRule(new SqlAdapterRule('BoolFalse', /\bFALSE\b/gi, '0'));
    };


    /* =========================================================================
     * SqlAdapterFactory
     * =========================================================================
     * Creates pre-configured adapters by a direction key.
     *
     * Supported keys (case-insensitive, spaces ignored):
     *   'tsql>sqlite'   / 'mssql>sqlite'   / 'sqlserver>sqlite'
     *   'sqlite>tsql'   / 'sqlite>mssql'   / 'sqlite>sqlserver'
     * ========================================================================= */
    var SqlAdapterFactory = {

        /**
         * Create and return a configured adapter for the given direction.
         * @param  {string} key  Direction key.
         * @return {SqlAdapter}
         */
        create: function (key) {
            var k = key.toLowerCase().replace(/\s/g, '');

            if (k === 'tsql>sqlite' || k === 'mssql>sqlite' || k === 'sqlserver>sqlite') {
                return new SqlServerToSQLiteAdapter();
            }

            if (k === 'sqlite>tsql' || k === 'sqlite>mssql' || k === 'sqlite>sqlserver') {
                return new SQLiteToSqlServerAdapter();
            }

            throw new Error(
                '[SqlAdapterFactory] Unknown key: "' + key + '". ' +
                'Use "tsql>sqlite" or "sqlite>tsql".'
            );
        },

        /**
         * Convenience shortcut: adapt SQL in one call.
         * @param  {string} key  Direction key (see create()).
         * @param  {string} sql  Input SQL string.
         * @return {string}
         */
        adapt: function (key, sql) {
            return this.create(key).adapt(sql);
        }
    };


    /* =========================================================================
     * Public API
     * ========================================================================= */
    var exports = {
        SqlAdapterRule:            SqlAdapterRule,
        SqlAdapter:                SqlAdapter,
        SqlServerToSQLiteAdapter:  SqlServerToSQLiteAdapter,
        SQLiteToSqlServerAdapter:  SQLiteToSqlServerAdapter,
        SqlAdapterFactory:         SqlAdapterFactory
    };

    /* UMD-lite: browser global or CommonJS */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exports;
    } else {
        global.SqlAdapter = exports;
    }

}(typeof window !== 'undefined' ? window : this));
