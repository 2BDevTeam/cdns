Try
 

    Dim html as String
    Dim scriptCss as String=""
    Dim scriptJs as String="<script src='https://raw.githack.com/2BDevTeam/cdns/master/2BGLOBALSTYLES.JS'></script>" 
   ' scriptJs +="<script src='https://cdn.jsdelivr.net/gh/2BDevTeam/cdns@master/GLOBAL.js'></script>"   
    scriptJs +="<script src='https://raw.githack.com/2BDevTeam/cdns/master/CUSTOMFORM.JS'></script>"   
    scriptJs +="<script src='https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/ace.js'></script>"
    scriptJs +="<script src='https://unpkg.com/prettier@2.8.8/standalone.js'></script>"

    scriptJs +="<script src='https://unpkg.com/prettier@2.8.8/parser-babel.js'></script>"

    scriptJs +="<script src='https://bossanova.uk/jspreadsheet/v5/jspreadsheet.js'></script>"   
    scriptJs +="<script src='https://jsuites.net/v5/jsuites.js'></script>" 
    scriptJs+="<script src='https://cdn.jsdelivr.net/npm/alasql'></script>"
    scriptJs+="<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'>"
    scriptJs+="<script src='https://unpkg.com/petite-vue'></script>"
    scriptJs+="<script src='https://cdn.jsdelivr.net/npm/@json-editor/json-editor@latest/dist/jsoneditor.min.js'></script>"
    scriptJs+="<script src='https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js'></script>"
    scriptJs+="<script src='https://fastly.jsdelivr.net/npm/echarts@5/dist/echarts.min.js'></script>"
    scriptCss+="<link rel='stylesheet' href='https://bossanova.uk/jspreadsheet/v5/jspreadsheet.css'/>"
    scriptCss+="<link rel='stylesheet' href='https://jsuites.net/v5/jsuites.css'/>"
    scriptJs+="<script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>"

    scriptJs+=" <script src='https://cdn.jsdelivr.net/npm/interactjs@1.10.27/dist/interact.min.js'></script>"
    scriptJs+="<script src='https://unpkg.com/tabulator-tables@5.5.0/dist/js/tabulator.min.js'></script>"
    scriptCss+="<link href='https://unpkg.com/tabulator-tables@5.5.0/dist/css/tabulator_bootstrap5.min.css' rel='stylesheet'>"

    html+=scriptJs
    html+=scriptCss
   

  

   
    Dim destination As Object
    destination = mpage.master.findcontrol("conteudo").findcontrol("maincontent")
    destination.Controls.Add(new LiteralControl(html))



Catch e as Exception
    XcUtil.LogViewSource(mpage,e.toString())
End try