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
    scriptJs+="<script src='https://unpkg.com/petite-vue'></script>"
    scriptJs+="<script src='https://cdn.jsdelivr.net/npm/@json-editor/json-editor@latest/dist/jsoneditor.min.js'></script>"
    scriptJs+="<script src='https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js'></script>"
    scriptJs+="<script src='https://fastly.jsdelivr.net/npm/echarts@5/dist/echarts.min.js'></script>"
    scriptCss+="<link rel='stylesheet' href='https://bossanova.uk/jspreadsheet/v5/jspreadsheet.css'/>"
    scriptCss+="<link rel='stylesheet' href='https://jsuites.net/v5/jsuites.css'/>"
    scriptJs+="<script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>"
    scriptJs += "<script src='https://cdnjs.cloudflare.com/ajax/libs/dexie/3.2.3/dexie.min.js' integrity='sha512-3JC1BK1bUkuBNB04s7BR4VVQUNsNbBiwe5p6UqxNjR0FfhFoKT97gJ7lw953MMlKxy4UdIbFAol1Ap1Mt5+Qcw==' crossorigin='anonymous' referrerpolicy='no-referrer'></script>"
    scriptJs+="<script src='https://cdnjs.cloudflare.com/ajax/libs/cleave.js/1.0.2/cleave.min.js' ></script>"

    scriptJs+="<script src='https://unpkg.com/tabulator-tables@5.5.0/dist/js/tabulator.min.js'></script>"
    scriptCss+=" <link href='https://unpkg.com/tabulator-tables@5.5.0/dist/css/tabulator_bootstrap5.min.css' rel='stylesheet'>"
    scriptJs +="<script src='https://cdn.jsdelivr.net/gh/2BDevTeam/cdns@master/GLOBAL.js'></script>"   
    Dim registoJSON as String="<textarea style='display:none' id='registoJson' name='registoJson' type='text'></textarea>"
    scriptJs+="<link href='https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded' rel='stylesheet' />"

scriptJs+="<link rel='stylesheet' href='https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css'>"
scriptJs+="<script src='https://code.jquery.com/ui/1.13.2/jquery-ui.min.js'></script>"


    html+=registoJSON

    html+=scriptJs
    html+=scriptCss
   

  

   
    Dim destination As Object
    destination = mpage.master.findcontrol("conteudo").findcontrol("maincontent")
    destination.Controls.Add(new LiteralControl(html))



Catch e as Exception
    XcUtil.LogViewSource(mpage,e.toString())
End try