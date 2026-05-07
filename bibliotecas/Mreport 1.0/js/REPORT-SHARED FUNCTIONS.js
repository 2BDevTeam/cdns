// ============================================================
// MREPORT-SHARED.js
// Funções partilhadas — versões actualizadas extraídas de
// Balanço e DR.html (mais recentes que GLOBAL MREPORT.js)
// ============================================================


/**
 * Calcula o valor de uma célula do relatório somando o valor
 * estático (getCelulaValue) com o valor dinâmico (getValorDinamicoCelula).
 * Versão com try/catch, verificação de nulo e validação isNaN/isFinite.
 *
 * @param {Array}  confRelatorio - configuração completa do relatório
 * @param {string} celulaId     - stamp da célula a calcular
 * @returns {string} resultado numérico como string, ou "0" em caso de erro
 */
function calcularValorCelula(confRelatorio, celulaId) {
    try {
        var celula = _.find(confRelatorio, function (o) {
            return o.u_celulastamp == celulaId;
        });

        if (!celula) {
            console.warn("Célula não encontrada:", celulaId);
            return "0";
        }

        var celulaValue = getCelulaValue(celula);
        var valorDinamicoResult = getValorDinamicoCelula(celula, confRelatorio);
        var valorDinamico = 0;
        var valor = 0;

        if (celulaValue && celulaValue.erro != true && celulaValue.unformatted) {
            var parsedValue = Number(celulaValue.unformatted);
            if (!isNaN(parsedValue) && isFinite(parsedValue)) {
                valor = parsedValue;
            }
        }

        if (valorDinamicoResult && valorDinamicoResult.erro != true && valorDinamicoResult.unformatted) {
            var parsedDynamic = Number(valorDinamicoResult.unformatted);
            if (!isNaN(parsedDynamic) && isFinite(parsedDynamic)) {
                valorDinamico = parsedDynamic;
            }
        }

        var resultado = valor + valorDinamico;
        return (!isNaN(resultado) && isFinite(resultado)) ? resultado.toString() : "0";
    } catch (error) {
        console.error("Erro em calcularValorCelula:", error, "celulaId:", celulaId);
        return "0";
    }
}


/**
 * Resolve o valor dinâmico de uma célula avaliando a expressão composta
 * por entradas do tipo "Standard" (literal) e "Celula" (referência recursiva).
 * Versão com validação de strings vazias, NaN e try/catch.
 *
 * @param {Object} celula        - objecto de configuração da célula
 * @param {Array}  confRelatorio - configuração completa do relatório
 * @returns {{ erro: boolean, unformatted: string, valor: string }}
 */
function getValorDinamicoCelula(celula, confRelatorio) {
    var result = 0;
    var expressao = "";

    try {
        if (celula.valordinamico && celula.valordinamico != "") {
            var dadosValoresDinamicos = JSON.parse(celula.valordinamico);

            dadosValoresDinamicos.forEach(function (valorDinamico) {
                switch (valorDinamico.tipo) {
                    case "Standard":
                        var valorStd = valorDinamico.valor;
                        if (valorStd && valorStd.trim() !== "") {
                            expressao += valorStd;
                        }
                        break;

                    case "Celula":
                        var valorCelula = calcularValorCelula(confRelatorio, valorDinamico.valor);
                        if (valorCelula && !isNaN(valorCelula) && valorCelula !== "NaN") {
                            expressao += valorCelula;
                        } else {
                            expressao += "0";
                        }
                        break;
                }
            });

            if (expressao != "" && expressao != undefined) {
                result = eval(expressao);
                if (isNaN(result) || !isFinite(result)) {
                    result = 0;
                }
            }
        }

        return {
            erro: false,
            unformatted: parseFloat(result).toFixed(2),
            valor: formatInputValue(parseFloat(result).toFixed(2))
        };
    } catch (error) {
        console.error("Erro em getValorDinamicoCelula:", error, "celula:", celula);
        return { erro: true, unformatted: 0, valor: "0" };
    }
}


/**
 * Insere os botões de impressão (previsão, PDF e Excel) na barra de acções.
 * Idêntica em ambos os ficheiros de origem.
 */
function generateImpressaoButtons() {
    var btnImpressao = "<button type='button' style='margin-right:1.3em' id='previsaoImpressao' class=' btn btn-default btn-sm' >Previsão da impressão</button>";
    btnImpressao += "<button type='button' style='margin-right:1.3em' id='downloadImpressao' class=' btn btn-default btn-sm' ><i class='fa fa-print'></i></button>";
    btnImpressao += "<button type='button' style='margin-right:1.3em' id='downloadImpressaoExcel' class=' btn btn-default btn-sm' ><i class='fa fa-file-excel-o'></i></button>";
    $("#OptionsRecordDropDown > button").before(btnImpressao);
}


/**
 * Mostra um alerta "Sem resultados" / "Erro ao trazer resultados" no contentor
 * principal do relatório.
 *
 * NOTA: As duas origens usam contentores diferentes:
 *   - GLOBAL MREPORT.js  → #ImpressaoContainer  / "Sem resultados"
 *   - Balanço e DR.html  → #kpiContainer         / "Erro ao trazer resultados"
 * Esta versão adopta o padrão do Balanço e DR.html. Ajuste o selector e a
 * mensagem conforme o contexto da página onde for incluída.
 */
function generateSemResultadosAlert() {
    var alertHtml = buildAlert("alert-info", "Erro ao trazer resultados");
    $("#kpiContainer").empty();
    $("#kpiContainer").append(alertHtml);
}


// ============================================================
// Funções de cálculo/query de células de relatório
// (verifyCellReferences, extractCellQuery, fillQueryResults,
//  fillQueryVariables, cellQuery)
// ============================================================

/**
 * Substitui referências a células (ex: <A1>) na expressão pelos seus valores
 * calculados, com suporte a recursividade e valor dinâmico.
 */
function verifyCellReferences(expression, celula) {
    //console.log("Expression", expression, "CelulaXX", celula)
    var regex = /<([^>]+)>/g; // Find all values between angle brackets
    var match;
    var orgExpr = expression;

    while ((match = regex.exec(expression)) !== null) {
        var extracted = match[1];
        var celulaData = configuracaoModelo.find(function (obj) {
            return obj.codigocoluna == extracted && obj.u_linhastamp == configuracaoLinha.u_linhastamp
        });

        var valorCelula = "";
        if (celulaData) {
            // Recursivo para valorcelula
            var valorCelulaBase = celulaData.valorcelula ? verifyCellReferences(celulaData.valorcelula, celulaData) : "0";
            // Calcula valorDinamico se existir
            var valorDinamicoObj = getValorDinamicoCelula(celulaData, configuracaoModelo);
            var valorDinamico = (valorDinamicoObj && valorDinamicoObj.erro != true) ? Number(valorDinamicoObj.unformatted) : 0;
            valorCelula = ("(" + valorCelulaBase + ")" + "+" + "(" + valorDinamico + ")").toString();
        }

        orgExpr = orgExpr.replaceAll("<" + extracted + ">", valorCelula);
    }

    return orgExpr;
}

/**
 * Extrai todos os valores entre parênteses retos (queries) de uma expressão.
 * Retorna array de { extracted, original }.
 */
function extractCellQuery(expression) {
    var regex = /\[([^\]]+)]/g; // Encontrar todos os valores entre parênteses retos
    var matches = [];
    var match;

    while ((match = regex.exec(expression)) !== null) {
        var extracted = match[1]; // O valor extraído entre parênteses retos
        matches.push({ extracted: extracted, original: "[" + extracted + "]" });
    }

    return matches;
}

/**
 * Substitui na expressão original os placeholders de query pelo resultado
 * calculado por cellQuery.
 */
function fillQueryResults(expressions, originalExpression) {
    expressions.forEach(function (expression) {
        var value = cellQuery(expression.extracted);
        originalExpression = originalExpression.replace(expression.original, value);
    });
    return originalExpression;
}

/**
 * Resolve variáveis entre chavetas ({var}) numa query substituindo pelo
 * valor actual da variável via eval.
 */
function fillQueryVariables(query) {
    var regex = /\{([^}]+)\}/g;
    var match;
    var finalQueryExpression = query;
    while ((match = regex.exec(query)) !== null) {
        finalQueryExpression = finalQueryExpression.replaceAll("{" + match[1] + "}", eval(match[1]));
    }
    return finalQueryExpression;
}

/**
 * Executa uma query alasql (após resolver variáveis) e devolve o primeiro
 * valor do primeiro resultado, ou 0 se não houver resultados.
 */
function cellQuery(query) {
    var queryResult = alasql(fillQueryVariables(query))[0];
    if (!queryResult) {
        return 0;
    }
    return Object.values(queryResult)[0];
}


// ============================================================
// Funções de base de dados local alasql (relatorioDb)
// (buildLocalDatabaseTablesSync, buildLocalDatabaseTables)
// ============================================================

/**
 * Versão síncrona — cria/recria as tabelas alasql a partir dos dados de fonte.
 * Usada em contextos onde async não é suportado (ex: getReportConfigByCodigo).
 */
function buildLocalDatabaseTablesSync(data) {
    if (!localDataBaseExists("relatorioDb")) {
        alasql('CREATE DATABASE relatorioDb; USE relatorioDb;');
    }
    for (const fonte of data) {
        var codigoFonte = fonte.fonte;
        if (localTableExists("relatorioDb", codigoFonte) == true) {
            alasql(`DROP TABLE ${codigoFonte};`);
        }
        try {
            alasql(`DROP TABLE ${codigoFonte};`);
        } catch (error) { }

        if (fonte.resultados.length > 0) {
            var dadosSchema = fonte.resultados[0];
            var resultados = fonte.resultados;
            const typeMap = {
                number: 'NUMERIC',
                string: 'VARCHAR(max)',
                boolean: "BIT",
            };

            const tableSchema = Object.entries(dadosSchema)
                .map(([key, value]) => `${key} ${typeMap[typeof value]}`)
                .join(', ');

            if (localTableExists("relatorioDb", codigoFonte) != true) {
                const createTableQuery = `CREATE TABLE ${codigoFonte} (${tableSchema});`;
                alasql(createTableQuery);
            }

            alasql.tables[codigoFonte].data = resultados;
        }
    }
}

/**
 * Versão assíncrona — cria/recria as tabelas alasql a partir dos dados de fonte.
 * Usada no fluxo principal async (ex: initRelatorio).
 */
async function buildLocalDatabaseTables(data) {
    if (!localDataBaseExists("relatorioDb")) {
        alasql('CREATE DATABASE relatorioDb; USE relatorioDb;');
    }
    for (const fonte of data) {
        var codigoFonte = fonte.fonte;
        if (localTableExists("relatorioDb", codigoFonte) == true) {
            alasql(`DROP TABLE ${codigoFonte};`);
        }
        try {
            alasql(`DROP TABLE ${codigoFonte};`);
        } catch (error) { }

        if (fonte.resultados.length > 0) {
            var dadosSchema = fonte.resultados[0];
            var resultados = fonte.resultados;
            const typeMap = {
                number: 'NUMERIC',
                string: 'VARCHAR(max)',
                boolean: "BIT",
            };

            const tableSchema = Object.entries(dadosSchema)
                .map(([key, value]) => `${key} ${typeMap[typeof value]}`)
                .join(', ');

            if (localTableExists("relatorioDb", codigoFonte) != true) {
                const createTableQuery = `CREATE TABLE ${codigoFonte} (${tableSchema});`;
                await alasql(createTableQuery);
            }

            alasql.tables[codigoFonte].data = resultados;
        }
    }
}


// ============================================================
// getReporReference
// ============================================================

/**
 * Resolve o valor de uma célula de outro relatório referenciado.
 * Recebe a descrição da linha/coluna, o código da coluna e o código
 * do relatório externo, e devolve o valor calculado (string numérica).
 */
function getReporReference(linhaColDesc, coluna, report) {
    var result = getReportConfigByCodigo(report);

    var celulaEncontrada = getCelulaReferencedByAnother(linhaColDesc, coluna, result.dadosListagem, result.colunas);

    var celulaValue = getCelulaValue(celulaEncontrada);
    var valorDinamico = getValorDinamicoCelula(celulaEncontrada, result.dadosListagem);

    var celulaResult = 0;
    var valorDinamicoResult = 0;

    if (celulaValue.erro != true) {
        celulaResult = Number(celulaValue.unformatted);
    }
    if (valorDinamico.erro != true) {
        valorDinamicoResult = Number(valorDinamico.unformatted);
    }

    return (valorDinamicoResult + celulaResult).toFixed(2);
}


// ============================================================
// Funções AJAX síncronas e utilitários gerais de relatório
// (getListagemSync, getFonteResultSync, showSpinner,
//  getUserData, getDadosRelatorioSync)
// ============================================================

/**
 * Obtém a configuração de listagem de forma síncrona pelo syncstamp.
 */
function getListagemSync(syncstamp) {
    var listagem;
    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getlistagemrelatorio",
        async: false,
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ syncstamp: syncstamp }]),
        },
        success: function (response) {
            listagem = response;
        }
    });
    return listagem;
}

/**
 * Obtém o resultado de uma fonte de dados de forma síncrona.
 */
function getFonteResultSync(variaveisFontePreenchida) {
    var fonteResult;
    $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getfonteresult",
        async: false,
        data: {
            '__EVENTARGUMENT': JSON.stringify(variaveisFontePreenchida),
        },
        success: function (response) {
            fonteResult = response;
        }
    });
    return fonteResult;
}

/**
 * Mostra o spinner de carregamento.
 */
async function showSpinner() {
    console.log("Spinner loading....")
    return mainSpinner("show")
}

/**
 * Obtém os dados do utilizador actual.
 */
async function getUserData() {
    return $.ajax({
        type: "POST",
        url: "../programs/gensel.aspx?cscript=getuserdata",
    })
}

/**
 * Obtém os dados de configuração de um relatório de forma síncrona.
 */
function getDadosRelatorioSync(relatorio) {
    var dadosRelatorio;
    $.ajax({
        type: "POST",
        async: false,
        url: "../programs/gensel.aspx?cscript=getdadosrelatorio",
        data: {
            '__EVENTARGUMENT': JSON.stringify([{ relatorio: relatorio }]),
        },
        success: function (response) {
            dadosRelatorio = response;
        }
    })
    return dadosRelatorio;
}


// ============================================================
// Utilitários de células e estilos de relatório
// (getCelulaReferencedByAnother, handleStylesBasedOnTipoListagem,
//  actualizarTotaisReport)
// ============================================================

/**
 * Dado o código de uma célula fonte e de uma coluna, encontra a célula
 * correspondente na configuração do relatório (confRelatorio + dadosColunas).
 */
function getCelulaReferencedByAnother(sourceCelula, codigocoluna, confRelatorio, dadosColunas) {
    var celula = _.find(confRelatorio, function (o) {
        return o.valorcelula == sourceCelula
    });

    var linhastamp = "";
    var colunastamp = "";

    if (!celula) {
        console.log("CELULA REFERENCIADA BY ANOTHER NOT FOUND", sourceCelula)
        return
    }

    var coluna = dadosColunas.find(function (col) {
        return col.codigocoluna == codigocoluna
    });

    if (!coluna) {
        console.log("Colunas existentes", dadosColunas)
        console.log("COLUNA REFERENCIADA NOT FOUND", codigocoluna)
        return;
    }

    linhastamp = celula.u_linhastamp;
    colunastamp = coluna.u_colunarelstamp;

    var celulaEncontrada = _.find(confRelatorio, function (o) {
        return o.u_linhastamp == linhastamp && o.u_colunarelstamp == colunastamp
    });

    return celulaEncontrada;
}

/**
 * Aplica estilos CSS à tabela do relatório conforme o tipo de listagem.
 */
function handleStylesBasedOnTipoListagem(tipoListagem) {
    switch (tipoListagem) {
        case "Dinâmica":
            $(".report-table-2b").css({ "max-width": "1400px" })
            $(".report-table-2b tbody td").css({ "font-size": "9px" })
            break;

        case "Grupo-Fixa":
            $(".report-table-2b").css({ "max-width": "880px" });
            $(".coluna-conf").css({
                "font-size": "13px",
                "width": "6%"
            })
            break;

        default:
            break;
    }
}

/**
 * Actualiza as linhas de totais (subgrupo e grupo) recalculando a soma
 * das colunas definidas em gruposRelatorio.colunastotais.
 */
function actualizarTotaisReport() {
    gruposRelatorio.filter(function (obj) {
        return obj.parent == false
    }).forEach(function (grupo) {
        if (grupo.temtotais == true) {
            var colunasTotais = grupo.colunastotais.split(",")
            var grupoId = grupo.u_gruporelstamp

            colunasTotais.forEach(function (coluna) {
                var totalColunaGrupo = 0
                $(".linha-item[grupoid='" + grupoId + "'] td[codigo-coluna='" + coluna + "']").each(function () {
                    var unformatted = $(this).data("unformatted")
                    var valor = (isNaN(unformatted) ? 0 : Number(unformatted));

                    totalColunaGrupo += valor;
                })

                $(".total-subgrupo-row[grupoid='" + grupoId + "'] td[codigo-coluna='" + coluna + "']").attr("data-unformatted", totalColunaGrupo.toString())
                $(".total-subgrupo-row[grupoid='" + grupoId + "'] td[codigo-coluna='" + coluna + "']").text(formatInputValue(parseFloat(totalColunaGrupo).toFixed(2)))
            })
        }
    })

    gruposRelatorio.filter(function (obj) {
        return obj.parent == true
    }).forEach(function (grupo) {
        if (grupo.temtotais == true) {
            var colunasTotais = grupo.colunastotais.split(",")
            var grupoId = grupo.u_gruporelstamp

            colunasTotais.forEach(function (coluna) {
                var numberOfChilds = $(".total-subgrupo-row[tot-noderef='" + grupoId + "'] td[codigo-coluna='" + coluna + "']").length

                if (numberOfChilds == 0) {
                    var totalColunaGrupo = 0
                    $(".linha-item[grupoid='" + grupoId + "'] td[codigo-coluna='" + coluna + "']").each(function () {
                        var unformatted = $(this).data("unformatted")
                        var valor = (isNaN(unformatted) ? 0 : Number(unformatted));

                        totalColunaGrupo += valor;
                    })
                } else {
                    var totalColunaGrupo = 0
                    $(".total-subgrupo-row[tot-noderef='" + grupoId + "'] td[codigo-coluna='" + coluna + "']").each(function () {
                        var unformatted = $(this).data("unformatted")
                        var valor = (isNaN(unformatted) ? 0 : Number(unformatted));

                        totalColunaGrupo += valor;
                    })
                }

                $(".total-grupo-row[grupoid='" + grupoId + "'] td[codigo-coluna='" + coluna + "']").attr("data-unformatted", totalColunaGrupo.toString())
                $(".total-grupo-row[grupoid='" + grupoId + "'] td[codigo-coluna='" + coluna + "']").text(formatInputValue(parseFloat(totalColunaGrupo).toFixed(2)))
            })
        }
    })
}
