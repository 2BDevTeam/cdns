' =============================================================================
' EXECUTE EXPRESSAOLISTAGEMDB MREPORT.vb  —  Mreport 2.0
' cscript: executeexpressaolistagemdb
'
' Executa a expressão SQL de uma MReportFonte, substituindo {tokens} pelos
' valores em "filters". Devolve dados + schema da query.
' Ported de Mdash 2.0/EXECUTE EXPRESSAOLISTAGEMDB.vb.
' =============================================================================

Dim ExecuteQuery = Function(ByVal fQuery As String, ByVal fSqlParameters As List(Of System.Data.SqlClient.SqlParameter)) As DataTable
    Dim table As New DataTable
    Using connection As SqlClient.SqlConnection = SqlHelp.GetNewConnection()
        Using command As New SqlClient.SqlCommand(fQuery, connection)
            If (fSqlParameters IsNot Nothing) Then
                For Each sqlParameter As System.Data.SqlClient.SqlParameter In fSqlParameters
                    command.Parameters.Add(sqlParameter)
                Next
            End If
            Using adapter As New SqlClient.SqlDataAdapter(command)
                adapter.Fill(table)
            End Using
        End Using
    End Using
    Return table
End Function

Dim querySanitized = Function(ByVal sqlExpression As String)
    Dim writeKeywords As String() = {"DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE"}
    For Each keyword As String In writeKeywords
        If sqlExpression.ToUpper().Contains(keyword) Then Return False
    Next
    Return True
End Function

Dim mquery As String = ""

Try
    Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
    Dim requestJObject As Newtonsoft.Json.Linq.JObject = Newtonsoft.Json.Linq.JArray.Parse(parametro)(0)

    Dim expressaodblistagem As String = ""
    If requestJObject("expressaodblistagem") IsNot Nothing Then
        expressaodblistagem = requestJObject("expressaodblistagem").ToString()
    ElseIf requestJObject("expressaolistagem") IsNot Nothing Then
        expressaodblistagem = requestJObject("expressaolistagem").ToString()
    End If

    Dim regexPattern As String = "\{(.*?)\}"
    Dim matches As MatchCollection = Regex.Matches(expressaodblistagem, regexPattern)
    Dim queryComFiltros As String = expressaodblistagem

    Dim queryResult As DataTable = Nothing
    Dim querySchemaResult As DataTable = Nothing

    If Not String.IsNullOrEmpty(queryComFiltros) AndAlso Not String.IsNullOrWhiteSpace(expressaodblistagem) Then
        Dim filtros As Newtonsoft.Json.Linq.JObject = Nothing
        If requestJObject("filters") IsNot Nothing Then
            filtros = requestJObject("filters").ToObject(Of Newtonsoft.Json.Linq.JObject)()
        Else
            filtros = New Newtonsoft.Json.Linq.JObject()
        End If

        For Each match As Match In matches
            Dim key As String = match.Groups(1).Value
            If filtros.ContainsKey(key) Then
                Dim valorFiltro As Newtonsoft.Json.Linq.JToken = filtros(key)
                Dim valorConvertido As String
                If valorFiltro.Type = Newtonsoft.Json.Linq.JTokenType.Boolean Then
                    valorConvertido = If(valorFiltro.ToObject(Of Boolean)(), "1", "0")
                Else
                    valorConvertido = valorFiltro.ToString()
                End If
                queryComFiltros = queryComFiltros.Replace("{" & key & "}", valorConvertido)
            Else
                ' Token sem valor → string vazia (não bloquear)
                queryComFiltros = queryComFiltros.Replace("{" & key & "}", "")
            End If
        Next

        If Not querySanitized(queryComFiltros) Then
            Throw New Exception("A consulta contém palavras-chave de escrita proibidas.")
        End If

        mquery = queryComFiltros
        queryResult = ExecuteQuery(queryComFiltros, Nothing)

        Dim safeQuery As String = queryComFiltros.Replace("'", "''")
        querySchemaResult = ExecuteQuery($"
            SELECT 
                name, 
                system_type_name
            FROM sys.dm_exec_describe_first_result_set(
                N'{safeQuery}',
                NULL, NULL);
        ", Nothing)
    End If

    Dim responseDTO = New With {
        .cod = "0000",
        .codDesc = "Success",
        .message = "Success",
        .data = queryResult,
        .schema = querySchemaResult,
        .mquery = mquery
    }
    mpage.Response.ContentType = "application/json"
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Catch ex As Exception
    mpage.Response.ContentType = "application/json"
    Dim responseDTO = New With {.cod = "0007", .codDesc = "Error", .message = ex.ToString(), .mquery = mquery}
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))
Finally
    mpage.Response.End()
End Try
