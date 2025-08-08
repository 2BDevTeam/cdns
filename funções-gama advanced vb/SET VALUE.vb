Dim setValue=Function(Byval conteudo,Byval value)

    Dim obj As Object
    obj = mpage.Master.findcontrol("conteudo").findcontrol(conteudo)
    If(obj IsNot Nothing) Then
       obj.value = value
        return New With {.exists=true}
    End If

    return New With {.exists=false}
End Function