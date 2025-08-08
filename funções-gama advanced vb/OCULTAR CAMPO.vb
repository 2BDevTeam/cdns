


Dim ocultarCampo=Function(ByVal nomeConteudo)

    try
        Dim obj As Object
        obj = mpage.Master.findcontrol("conteudo").findcontrol(nomeConteudo)
        obj.visible = False
        
        Catch ex As Exception
               
             

        End Try
    
End Function
