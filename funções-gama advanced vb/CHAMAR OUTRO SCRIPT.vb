Dim myCustom = New With {.nome = "Fulano", .idade = 29}
Dim user As New UserScript("teste") ' cria instância


'user.RunScript(page as Page, mstamp as String, objectpara as Object, extraId as String)
Dim usScript = user.RunScript(mpage, "MY STAMP DUDE", myCustom, "")
For Each row As DataRow In usScript.Rows
           XcUtil.LogViewSource(mpage, $"AFTER RUN SCRIPT {row("nome")}")
Next