Dim setReadOnly=Function (ByVal conteudo,Byval readonlyPar)
    Dim obj As Object
    obj = mpage.Master.findcontrol("conteudo").findcontrol(conteudo)
    obj.readonly = readonlyPar
End Function