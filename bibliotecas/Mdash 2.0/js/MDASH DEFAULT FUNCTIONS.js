


/**
 * Devolve o stamp encriptado (XcFox.u_scrypt) chamando o backend
 * MDASH DEFAULT BACKEND FUNCIONS.vb com operacao=GET_ENCRYPTED_STAMP.
 * 
 * AJAX síncrono (async:false) — devolve directamente a string encriptada
 * para poder ser usada em expressões inline tipo: row.nome + getStampEncriptado(stamp).
 *
 * @param {string} stamp - stamp original a encriptar
 * @returns {string} stamp encriptado, ou string vazia em caso de erro
 */
function getStampEncriptado(stamp) {
    if (!stamp) return '';
    var encrypted = '';
    $.ajax({
        type: 'POST',
        url: '../programs/gensel.aspx?cscript=mdashdefaultbackendfuncions',
        async: false,
        data: {
            '__EVENTARGUMENT': JSON.stringify([{
                operacao: 'GET_ENCRYPTED_STAMP',
                parametros: { stamp: stamp }
            }])
        },
        success: function (response) {
            if (response && response.cod === '0000' && response.data) {
                encrypted = response.data.encrypted || '';
            } else {
                console.warn('[getStampEncriptado] resposta inválida:', response);
            }
        },
        error: function (xhr, status, error) {
            console.error('[getStampEncriptado] AJAX error:', error || status);
        }
    });
    return encrypted;
}

/**
 * Devolve as variáveis do utilizador PHC (XcUser.*) chamando o backend
 * MDASH DEFAULT BACKEND FUNCIONS.vb com operacao=GET_PHC_VARIABLES.
 *
 * Estratégia de cache:
 *   - 1ª chamada: AJAX síncrono ao backend, guarda em sessionStorage + window.phcVars
 *   - Chamadas seguintes: devolve directamente o objecto em memória (window.phcVars)
 *     ou recupera do sessionStorage se a página foi recarregada
 *   - Para forçar refresh, chamar getVariaveisPHC(true)
 *
 * Variáveis devolvidas:
 *   { usercode, useremail, iniciais, clnome, clno, username, userno }
 *
 * Disponíveis também em:
 *   - window.phcVars (objecto global)
 *   - sessionStorage.getItem('mdash.phcVars')  (JSON)
 *
 * @param {boolean} [forceRefresh=false] - se true, ignora cache e refaz ao backend
 * @returns {object} objecto com as variáveis PHC, ou objecto vazio em caso de erro
 */
function getVariaveisPHC(forceRefresh) {
    var CACHE_KEY = 'mdash.phcVars';

    // 1) Cache em memória (window.phcVars)
    if (!forceRefresh && window.phcVars && typeof window.phcVars === 'object') {
        return window.phcVars;
    }

    // 2) Cache em sessionStorage
    if (!forceRefresh) {
        try {
            var raw = sessionStorage.getItem(CACHE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    window.phcVars = parsed;
                    return parsed;
                }
            }
        } catch (e) { /* ignorar — recarrega do backend */ }
    }

    // 3) Buscar ao backend (síncrono para uso inline em expressões)
    var vars = {};
    $.ajax({
        type: 'POST',
        url: '../programs/gensel.aspx?cscript=mdashdefaultbackendfuncions',
        async: false,
        data: {
            '__EVENTARGUMENT': JSON.stringify([{
                operacao: 'GET_PHC_VARIABLES',
                parametros: {}
            }])
        },
        success: function (response) {
            if (response && response.cod === '0000' && response.data) {
                vars = response.data;
            } else {
                console.warn('[getVariaveisPHC] resposta inválida:', response);
            }
        },
        error: function (xhr, status, error) {
            console.error('[getVariaveisPHC] AJAX error:', error || status);
        }
    });

    // 4) Guardar em cache
    window.phcVars = vars;
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(vars)); } catch (e) { /* quota / private mode */ }
    return vars;
}

// Pré-carregar as variáveis PHC assim que o DOM estiver pronto, de modo a
// que estejam disponíveis quando o dashboard for renderizado.
(function () {
    function preload() {
        try { getVariaveisPHC(); } catch (e) { console.warn('[phcVars preload] erro:', e); }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preload);
    } else {
        preload();
    }
})();

/**
 * Constrói o dicionário de variáveis disponíveis para substituição em SQL e
 * expressões. A chave é "namespace.nome" (ex: "phcvars.usercode") e o valor
 * é o valor a substituir no texto onde aparece "#namespace.nome#".
 *
 * Namespaces actuais:
 *   - phcvars.*  → variáveis do utilizador PHC (XcUser.*)
 *
 * Para adicionar um novo namespace no futuro, basta acrescentar entradas
 * neste objecto (ex: "dashboard.id", "sessao.empresa", "custom.minhaVar").
 * O backend não precisa de saber nada sobre o namespace — apenas faz a
 * substituição textual usando o dicionário enviado no payload.
 *
 * NOTA DE SEGURANÇA: o namespace "phcvars" é sempre re-validado no backend
 * contra XcUser.* (server-side), de forma a impedir que um cliente forje
 * valores. Outros namespaces são confiáveis ao nível do client.
 *
 * @returns {object} dicionário { "namespace.nome": valor, ... }
 */
function mdashBuildVars() {
    var vars = {};

    // ── Namespace: phcvars ────────────────────────────────────────────────
    try {
        var phc = getVariaveisPHC() || {};
        for (var k in phc) {
            if (Object.prototype.hasOwnProperty.call(phc, k)) {
                vars['phcvars.' + k] = phc[k];
            }
        }
    } catch (e) { console.warn('[mdashBuildVars] phcvars erro:', e); }

    // ── Namespace: dashboard (futuro) ─────────────────────────────────────
    // try {
    //     if (typeof GMDashConfig !== 'undefined' && GMDashConfig.length > 0) {
    //         vars['dashboard.codigo'] = GMDashConfig[0].codigo || '';
    //         vars['dashboard.stamp']  = GMDashConfig[0].u_mdashstamp || '';
    //     }
    // } catch (e) { /* ignore */ }

    return vars;
}