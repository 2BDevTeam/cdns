Try

    Dim html as String
    Dim scriptJs as String=""
    scriptJs+="<script src='https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js'></script>"
    scriptJs+="<script src='https://cdnjs.cloudflare.com/ajax/libs/jquery-treetable/3.2.0/jquery.treetable.min.js' integrity='sha512-2pYVakljd2zLnVvVC264Ib+XGvOvu3iFyKCIwLzn77mfbjuVi1dGJUxGjDAI8MjgPgTfSIM/vZirW04LCQmY2Q==' crossorigin='anonymous' referrerpolicy='no-referrer'></script>"
    scriptJs+="<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/jquery-treetable/3.2.0/css/jquery.treetable.css' integrity='sha512-l1bJ1VnsPD+m5ZYhfcl9PrJgbCQixXtQ/zs423QYu0w1xDGXJOSC0TmorOocaYY8md5+YMRcxZ/UgjyOSIlTYw==' crossorigin='anonymous' referrerpolicy='no-referrer' />"
    scriptJs+="<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/jquery-treetable/3.2.0/css/jquery.treetable.css' integrity='sha512-l1bJ1VnsPD+m5ZYhfcl9PrJgbCQixXtQ/zs423QYu0w1xDGXJOSC0TmorOocaYY8md5+YMRcxZ/UgjyOSIlTYw==' crossorigin='anonymous' referrerpolicy='no-referrer' />"
    scriptJs+="<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/jquery-treetable/3.2.0/css/jquery.treetable.theme.default.min.css' integrity='sha512-+QlAY2+q9M7bP5NBnGKrBO5u/asZTHsHJ8yVvw/opoi50KZube+tfc3ojM5MHa0d+vTorqu3Mf/IKyTyxWWbzg==' crossorigin='anonymous' referrerpolicy='no-referrer' />"
    scriptJs+="<script src='https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js' integrity='sha512-3JC1BK1bUkuBNB04s7BR4VVQUNsNbBiwe5p6UqxNjR0FfhFoKT97gJ7lw953MMlKxy4UdIbFAol1Ap1Mt5+Qcw==' crossorigin='anonymous' referrerpolicy='no-referrer'></script>"
    
    html+=scriptJs


   
Dim destination As Object
destination = mpage.master.findcontrol("conteudo").findcontrol("maincontent")
destination.Controls.Add(new LiteralControl(html))



Catch e as Exception
    XcUtil.LogViewSource(mpage,e.toString())
End try