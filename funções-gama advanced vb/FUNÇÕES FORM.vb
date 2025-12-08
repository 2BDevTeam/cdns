Dim ocultarCampo=Function(ByVal nomeConteudo)

    try
        Dim obj As Object
        obj = mpage.Master.findcontrol("conteudo").findcontrol(nomeConteudo)
        obj.visible = False
        
        Catch ex As Exception
               
             

        End Try
    
End Function

Dim setValue=Function(Byval conteudo,Byval value)

    Dim obj As Object
    obj = mpage.Master.findcontrol("conteudo").findcontrol(conteudo)
    If(obj IsNot Nothing) Then
       obj.value = value
       obj.Refresh()
        return New With {.exists=true}
    End If

    return New With {.exists=false}
End Function

Dim alteraTituloForm=Function(ByVal nomeTitulo)

    CType(mpage, normalform).PropTitulo=nomeTitulo
End Function

Dim setReadOnly=Function (ByVal conteudo,Byval readonlyPar)
    Dim obj As Object
    obj = mpage.Master.findcontrol("conteudo").findcontrol(conteudo)
    obj.readonly = readonlyPar
End Function

Dim alteraTituloCampo=Function(ByVal nomeConteudo, ByVal novoTitulo)
    
    Dim obj As Object
    obj = mpage.Master.findcontrol("conteudo").findcontrol(nomeConteudo)
    if not obj is nothing then
        
        obj.TituloDoCampo=novoTitulo
        
        ' Verificar se o objeto tem a propriedade/método RefreshTitulo
        Dim objType As Type = obj.GetType()
        Dim refreshMethod = objType.GetMethod("RefreshTitulo")
        
        If refreshMethod IsNot Nothing Then
            obj.RefreshTitulo()
        else 
             obj.RefreshTituloDoCampo()
        End If

    end if
    
End Function

Dim getValue=Function(ByVal conteudo)

    Dim obj As Object
    obj = mpage.Master.findcontrol("conteudo").findcontrol(conteudo)
    If(obj IsNot Nothing) Then
       return obj.value
    End If

    return Nothing
End Function