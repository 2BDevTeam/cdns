Try
 

    Dim html as String
    Dim scriptCss as String=""
    Dim scriptJs as String="" 
   ' scriptJs +="<script src='https://cdn.jsdelivr.net/gh/2BDevTeam/cdns@master/GLOBAL.js'></script>"   
    Dim registoJSON as String="<textarea style='display:none' id='registoJson' name='registoJson' type='text'></textarea>"

    
    html+=registoJSON

    html+=scriptJs
    html+=scriptCss

    Dim destination As Object
    destination = mpage.master.findcontrol("conteudo").findcontrol("maincontent")
    destination.Controls.Add(new LiteralControl(html))



Catch e as Exception
    XcUtil.LogViewSource(mpage,e.toString())
End try