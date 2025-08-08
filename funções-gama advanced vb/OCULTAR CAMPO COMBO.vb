Dim ocultarCampoCombo=Function(ByVal nomeConteudo)

    Dim obj As Object
    obj = mpage.Master.findcontrol("conteudo").findcontrol(nomeConteudo)
    'obj.invisivelsempre = True
    obj.visible = False


End Function
