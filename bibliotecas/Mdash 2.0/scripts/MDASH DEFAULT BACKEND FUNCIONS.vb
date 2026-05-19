' =============================================================================
' MDASH DEFAULT BACKEND FUNCIONS
' -----------------------------------------------------------------------------
' Router único para operações de backend do Mdash 2.0.
'
' Entrada (POST __EVENTARGUMENT) — JSON array com um objecto:
'   [{ "operacao": "NOME_DA_OPERACAO", "parametros": { ... } }]
'
' Cada operação é uma Func(Of JObject, Object) que recebe os "parametros"
' (JObject) e devolve o objecto a serializar no campo .data da resposta.
'
' Para adicionar uma nova operação:
'   1. Criar uma Function que aceite JObject e devolva Object
'   2. Registá-la no dicionário "operacoes" abaixo
'
' Resposta normalizada:
'   { cod, codDesc, message, data }
' =============================================================================

' ── Helper: leitura segura de parâmetros do JObject ──────────────────────────
Dim GetParam = Function(ByVal jObj As Newtonsoft.Json.Linq.JObject, ByVal nome As String) As String
    If jObj Is Nothing Then Return ""
    Dim token As Newtonsoft.Json.Linq.JToken = jObj(nome)
    If token Is Nothing OrElse token.Type = Newtonsoft.Json.Linq.JTokenType.Null Then Return ""
    Return token.ToString()
End Function

' =============================================================================
' OPERAÇÕES DISPONÍVEIS
' =============================================================================

' ── GET_ENCRYPTED_STAMP — devolve o stamp encriptado via XcFox.u_scrypt ──────
Dim OpGetEncryptedStamp = Function(ByVal parametros As Newtonsoft.Json.Linq.JObject) As Object
    Dim stamp As String = GetParam(parametros, "stamp")
    If String.IsNullOrEmpty(stamp) Then
        Throw New Exception("Stamp is required.")
    End If
    Return New With {.encrypted = XcFox.u_scrypt(stamp)}
End Function

' ── GET_PHC_VARIABLES — devolve variáveis do utilizador PHC (XcUser.*) ───────
Dim OpGetPhcVariables = Function(ByVal parametros As Newtonsoft.Json.Linq.JObject) As Object
    Return New With {
        .usercode  = XcUser.usercode(),
        .useremail = XcUser.useremail(),
        .iniciais  = XcUser.iniciais(),
        .clnome    = XcUser.clnome(),
        .clno      = XcUser.clno(),
        .username  = XcUser.username(),
        .userno    = XcUser.userno()
    }
End Function

' =============================================================================
' DISPATCHER
' =============================================================================
Try
    ' 1. Ler operação + parâmetros do __EVENTARGUMENT
    Dim parametroRaw As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
    If String.IsNullOrEmpty(parametroRaw) Then
        Throw New Exception("__EVENTARGUMENT vazio.")
    End If

    Dim jArray As Newtonsoft.Json.Linq.JArray = Newtonsoft.Json.Linq.JArray.Parse(parametroRaw)
    Dim requestObj As Newtonsoft.Json.Linq.JObject = jArray(0)
    Dim operacao As String = GetParam(requestObj, "operacao")
    Dim parametros As Newtonsoft.Json.Linq.JObject = TryCast(requestObj("parametros"), Newtonsoft.Json.Linq.JObject)

    If String.IsNullOrEmpty(operacao) Then
        Throw New Exception("Campo 'operacao' obrigatório no payload.")
    End If

    ' 2. Registar operações disponíveis
    Dim operacoes As New Dictionary(Of String, Func(Of Newtonsoft.Json.Linq.JObject, Object)) From {
        {"GET_ENCRYPTED_STAMP", OpGetEncryptedStamp},
        {"GET_PHC_VARIABLES",   OpGetPhcVariables}
    }

    ' 3. Despachar
    If Not operacoes.ContainsKey(operacao) Then
        mpage.Response.ContentType = "application/json"
        Dim respUnknown = New With {
            .cod = "0001",
            .codDesc = "UnknownOperation",
            .message = "Operação não reconhecida: " & operacao,
            .data = Nothing
        }
        mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(respUnknown))
        mpage.Response.End()
        Return false
    End If

    Dim resultado As Object = operacoes(operacao).Invoke(parametros)

    Dim responseDTO = New With {
        .cod = "0000",
        .codDesc = "Success",
        .message = "Success",
        .operacao = operacao,
        .data = resultado
    }
    mpage.Response.ContentType = "application/json"
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Catch ex As Exception
    mpage.Response.ContentType = "application/json"
    Dim responseDTO = New With {
        .cod = "0007",
        .codDesc = "Error",
        .message = ex.ToString()
    }
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))
Finally
    mpage.Response.End()
End Try
