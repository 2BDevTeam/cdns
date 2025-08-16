Dim myCustom = New With {.nome = "Fulano", .idade = 29}
Dim user As New UserScript("teste") ' cria instância


'user.RunScript(page as Page, mstamp as String, objectpara as Object, extraId as String)
Dim usScript = user.RunScript(mpage, "", myCustom, "")
