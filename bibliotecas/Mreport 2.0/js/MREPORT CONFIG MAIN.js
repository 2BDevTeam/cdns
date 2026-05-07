

    function getReportStamp() {
        // Ajustar consoante o ecrã/PHC
        return $("#ctl00_conteudo_u_mreportstamp_mLabel1").text();
    }

    function getMode() {
        return (typeof getState === "function" ? getState() : "edit");
    }

    function ensureContainer() {
        var $main = $("#maincontent");
        if (!$main.length) $main = $("#ctl00_conteudo_maincontent");
        if (!$main.length) $main = $("body");

        var $c = $("#mreport-designer-root");
        if (!$c.length) {
            $c = $('<div id="mreport-designer-root" class="mreport-editor-wrapper"></div>');
            $main.append($c);
        }
        return $c[0];
    }

    function pageLoad() {
        var stamp = getReportStamp();
        if (!stamp) {
            console.warn("[MReportMain] sem reportStamp; abort");
            return;
        }
        if (!window.MReportLib) {
            console.error("[MReportMain] MREPORT CONFIG LIB.js não carregada");
            return;
        }

        window.MReportLib.init(stamp, {
            mode: getMode(),
            container: ensureContainer()
        }).then(function () {
            console.log("[MReportMain] designer pronto");

            // Botão de commit (se existir)
            $(document).off("click.mreportcommit", "#btnGravarRelatorio")
                .on("click.mreportcommit", "#btnGravarRelatorio", function (e) {
                    e.preventDefault();
                    window.MReportLib.commit().then(function () {
                        try { alertify.success("Relatório gravado"); } catch (e) { }
                    }).catch(function (err) {
                        try { alertify.error("Erro ao gravar: " + err.message); } catch (e) { }
                    });
                });
        }).catch(function (err) {
            console.error("[MReportMain] init failed", err);
            try { alertify.error("Erro ao carregar relatório: " + err.message); } catch (e) { }
        });
    }

    // PHC ASP.NET dispara pageLoad automaticamente após postback
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", pageLoad);
    } else {
        pageLoad();
    }
    window.MReportConfigMainPageLoad = pageLoad;

