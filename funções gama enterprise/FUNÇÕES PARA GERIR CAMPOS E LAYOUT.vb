
Function ocultarCampo(ByVal nomeConteudo, ByVal mpage)

    Try
        Dim obj As Object
        obj = mpage.Master.FindControl("conteudo").FindControl(nomeConteudo)
        obj.Visible = False

    Catch ex As Exception

    End Try

End Function

Function setValue(ByVal conteudo, ByVal value, ByVal mpage)

    Dim obj As Object
    obj = mpage.Master.FindControl("conteudo").FindControl(conteudo)
    If obj IsNot Nothing Then
        obj.value = value
        obj.Refresh()
        Return New With {.exists = True}
    End If

    Return New With {.exists = False}

End Function

Function alteraTituloForm(ByVal nomeTitulo, ByVal mpage)

    CType(mpage, normalform).PropTitulo = nomeTitulo

End Function

Function setReadOnly(ByVal conteudo, ByVal readonlyPar, ByVal mpage)

    Dim obj As Object
    obj = mpage.Master.FindControl("conteudo").FindControl(conteudo)
    obj.readonly = readonlyPar

End Function

Function alteraTituloCampo(ByVal nomeConteudo, ByVal novoTitulo, ByVal mpage)

    Dim obj As Object
    obj = mpage.Master.FindControl("conteudo").FindControl(nomeConteudo)
    If Not obj Is Nothing Then

        obj.TituloDoCampo = novoTitulo

        ' Verificar se o objeto tem a propriedade/método RefreshTitulo
        Dim objType As Type = obj.GetType()
        Dim refreshMethod = objType.GetMethod("RefreshTitulo")

        If refreshMethod IsNot Nothing Then
            obj.RefreshTitulo()
        Else
            obj.RefreshTituloDoCampo()
        End If

    End If

End Function



