' =============================================================================
' MREPORT 2.0 - IMPORTAR SCRIPT
' Evento "Antes de carregar o ecrã" (Mreport - configuração)
'
' Injecta CDNs + ficheiros JS da biblioteca Mreport 2.0 no maincontent.
' Carregar nesta ordem:
'   1) bibliotecas externas (jQuery, lodash, alasql, petite-vue, interact, ace, jsoneditor)
'   2) Local DB Operations.js
'   3) MREPORT DATA LAYER.js
'   4) TEMPLATE MREPORT STANDARD EXTENSION.js
'   5) MREPORT CONFIG LIB.js
'   6) MREPORT RENDERER.js
'   7) MREPORT LAYOUT BUILDER.js   (opcional)
'   8) MREPORT CONFIG MAIN.js      (bootstrap)
' =============================================================================

Try

    Dim html As String = ""

    ' --- CDNs externos --------------------------------------------------
    html += "<script src='https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js'></script>"
    html += "<script src='https://cdnjs.cloudflare.com/ajax/libs/alasql/4.1.10/alasql.min.js'></script>"
    html += "<script src='https://unpkg.com/petite-vue@0.4.1/dist/petite-vue.iife.js' defer init></script>"
    html += "<script src='https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js'></script>"

    ' ACE editor (para JSONEditor / Layout Builder)
    html += "<script src='https://cdnjs.cloudflare.com/ajax/libs/ace/1.32.6/ace.js'></script>"

    ' JSONEditor (property panel)
    html += "<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/9.10.4/jsoneditor.min.css'>"
    html += "<script src='https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/9.10.4/jsoneditor.min.js'></script>"

    ' Tabulator (tabelas)
    html += "<link rel='stylesheet' href='https://unpkg.com/tabulator-tables@5.5.2/dist/css/tabulator.min.css'>"
    html += "<script src='https://unpkg.com/tabulator-tables@5.5.2/dist/js/tabulator.min.js'></script>"

    ' Fonte Inter (Mreport v9 mockup)
    html += "<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' rel='stylesheet'>"

    ' --- Mreport 2.0 lib ------------------------------------------------
    Dim base As String = "../bibliotecas/Mreport 2.0/js/"
    html += "<script src='" & base & "Local DB Operations.js'></script>"
    html += "<script src='" & base & "MREPORT DATA LAYER.js'></script>"
    html += "<script src='" & base & "TEMPLATE MREPORT STANDARD EXTENSION.js'></script>"
    html += "<script src='" & base & "MREPORT CONFIG LIB.js'></script>"
    html += "<script src='" & base & "MREPORT RENDERER.js'></script>"
    html += "<script src='" & base & "MREPORT LAYOUT BUILDER.js'></script>"
    html += "<script src='" & base & "MREPORT CONFIG MAIN.js'></script>"

    Dim destination As Object
    destination = mpage.master.findcontrol("conteudo").findcontrol("maincontent")
    destination.Controls.Add(New LiteralControl(html))

Catch e As Exception
    XcUtil.LogViewSource(mpage, e.toString())
End Try
