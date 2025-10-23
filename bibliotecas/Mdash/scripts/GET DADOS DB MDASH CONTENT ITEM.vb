Dim ExecuteQuery = Function(ByVal fQuery As String, ByVal fSqlParameters As List(Of System.Data.SqlClient.SqlParameter)) as DataTable

    Dim table As New DataTable

    Using connection as SqlClient.SqlConnection = SqlHelp.GetNewConnection()

        Using command As New SqlClient.SqlCommand(fQuery, connection)

            if(fSqlParameters IsNot Nothing)

                For Each sqlParameter As System.Data.SqlClient.SqlParameter in fSqlParameters

                    command.Parameters.Add(sqlParameter)

                Next

            end if

            Using adapter As New SqlClient.SqlDataAdapter(command)

                adapter.Fill(table)

            End Using

        End Using

    End Using

    return table

End Function

 Dim querySanitized=Function(Byval sqlExpression as String )

   
   Dim writeKeywords As String() = {"DROP", "DELETE", "UPDATE", "INSERT", "ALTER","CREATE"}

    Dim containsKeyword As Boolean = False

    For Each keyword As String In writeKeywords
        If sqlExpression.ToUpper().Contains(keyword) Then
            containsKeyword = True
            Exit For ' Exit the loop once a keyword is found
        End If
    Next

    If containsKeyword Then
       return false
      'throw new Exception("The input string contains a write keyword.")
    End If

    return true
    
End Function
Dim  queryComFiltros as String=""
Try
    Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
      Dim jArray As Newtonsoft.Json.Linq.JArray = Newtonsoft.Json.Linq.JArray.Parse(parametro)

    Dim requestJObject As Newtonsoft.Json.Linq.JObject = jArray(0)
    Dim colunaQuery as String="expressaodblistagem"

    Dim queryComponent = "
        SELECT MdashContainerItem.* 
        FROM MdashContainerItem 
        JOIN MdashContainer ON MdashContainer.mdashcontainerstamp = MdashContainerItem.mdashcontainerstamp 
        JOIN u_mdash ON u_mdash.u_mdashstamp = MdashContainer.dashboardstamp
        WHERE u_mdash.codigo = @codigo 
        AND MdashContainerItem.mdashcontaineritemstamp = @mdashcontaineritemstamp 
        ORDER BY MdashContainerItem.ordem ASC
    "

    Select case requestJObject("tipoquery").ToString()

        Case "item"
            queryComponent = "
                     SELECT MdashContainerItem.* 
                     FROM MdashContainerItem 
                     JOIN MdashContainer ON MdashContainer.mdashcontainerstamp = MdashContainerItem.mdashcontainerstamp 
                     JOIN u_mdash ON u_mdash.u_mdashstamp = MdashContainer.dashboardstamp
                     WHERE u_mdash.codigo = @codigo 
                     AND MdashContainerItem.mdashcontaineritemstamp = @mdashcontaineritemstamp 
                     ORDER BY MdashContainerItem.ordem ASC
          "
          colunaQuery="expressaodblistagem"

        Case "object"

        queryComponent="
                        select MdashContainerItemObject.* from MdashContainerItemObject 
                        join u_mdash on u_mdash.u_mdashstamp=MdashContainerItemObject.dashboardstamp 
                        where u_mdash.codigo=@codigo 
                        and MdashContainerItemObject.mdashcontaineritemobjectstamp=@mdashcontaineritemobjectstamp
                        order by MdashContainerItemObject.ordem asc
                        "
            colunaQuery="objectexpressaodblistagem"

    End Select



    Dim sqlParametersComponent As New List(Of System.Data.SqlClient.SqlParameter)
    sqlParametersComponent.Add(New System.Data.SqlClient.SqlParameter("@codigo", requestJObject("codigo").ToString()))
    sqlParametersComponent.Add(New System.Data.SqlClient.SqlParameter("@mdashcontaineritemstamp", requestJObject("mdashcontaineritemstamp").ToString()))
    sqlParametersComponent.Add(New System.Data.SqlClient.SqlParameter("@mdashcontaineritemobjectstamp", requestJObject("mdashcontaineritemobjectstamp").ToString()))


    Dim queryResultContainerItem As DataTable = ExecuteQuery(queryComponent, sqlParametersComponent)

    If queryResultContainerItem.Rows.Count = 0 Then
        Throw New Exception("Dados do item do container não encontrados")
    End If

    Dim queryResult As New DataTable()

    Dim expressaodblistagem As String = queryResultContainerItem.Rows(0)(colunaQuery).ToString()


    queryComFiltros  = expressaodblistagem

 if not String.IsNullOrEmpty(queryComFiltros)   Then

    Dim regexPattern As String = "\{(.*?)\}" ' Padrão para capturar texto dentro de {}
    Dim matches As MatchCollection = Regex.Matches(expressaodblistagem, regexPattern)
    Dim filtros As Newtonsoft.Json.Linq.JObject = requestJObject("filters").ToObject(Of Newtonsoft.Json.Linq.JObject)()
    For Each match As Match In matches
        Dim key As String = match.Groups(1).Value
        
        If filtros.ContainsKey(key) Then
            Dim valorFiltro As Newtonsoft.Json.Linq.JToken = filtros(key)
    
            ' Verifica se o valor é booleano e converte para 1 ou 0
            Dim valorConvertido As String
            If valorFiltro.Type = Newtonsoft.Json.Linq.JTokenType.Boolean Then
                valorConvertido = If(valorFiltro.ToObject(Of Boolean)(), "1", "0")
            Else
                valorConvertido = valorFiltro.ToString()
            End If
    
            ' Substitui o valor no queryComFiltros
            queryComFiltros = queryComFiltros.Replace("{" & key & "}", valorConvertido)
        Else
            Throw New Exception($"Filtro '{key}' não encontrado nos filtros fornecidos")
        End If
    Next

    If Not querySanitized(queryComFiltros) Then
        Throw New Exception("A consulta contém palavras-chave de escrita proibidas.")
    End If
    

   

   End If

   if not String.IsNullOrEmpty(queryComFiltros)   Then
  
        queryResult  = ExecuteQuery(queryComFiltros, Nothing)

   End If


    Dim responseDTO = New With {
        .cod = "0000",
        .codDesc = "Success",
        .message = "Success",
        .data = queryResult
    }
    mpage.Response.ContentType = "application/json"
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Catch ex As Exception
    ' XcUtil.LogViewSource(mpage, ex.ToString())

    mpage.Response.ContentType = "application/json"
    Dim responseDTO = New With {
        .cod = "0007",
        .codDesc = "Error",
        .message = ex.ToString(),
        .queryComFiltros = queryComFiltros
    }
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Finally
    mpage.Response.End()
End Try