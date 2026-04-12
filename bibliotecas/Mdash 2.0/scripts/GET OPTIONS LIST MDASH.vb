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





Try

   Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
   Dim jArray As Newtonsoft.Json.Linq.JArray = Newtonsoft.Json.Linq.JArray.Parse(parametro)
   Dim requestJObject As Newtonsoft.Json.Linq.JObject = jArray(0)

   Dim queryComFiltros As String = ""
   Dim mdashfilterstamp As String = requestJObject("mdashfilterstamp").ToString()
   Dim regexPattern As String = "\{(.*?)\}" ' Padrão para capturar texto dentro de {}
 
   Dim queryFiltro="SELECT expressaolistagem FROM MdashFilter WHERE mdashfilterstamp=@mdashfilterstamp"
    Dim sqlParametersFiltro As New List(Of System.Data.SqlClient.SqlParameter)
    sqlParametersFiltro.Add(New System.Data.SqlClient.SqlParameter("@mdashfilterstamp", mdashfilterstamp))
    Dim queryResultFiltro As DataTable = ExecuteQuery(queryFiltro, sqlParametersFiltro)

    if queryResultFiltro.rows.count=0 then
        Throw New Exception("Filtro não encontrado.")
    End If

   Dim queryResult As DataTable
   Dim querySchemaResult As DataTable
  
    If Not querySanitized(queryComFiltros) Then
             Throw New Exception("A consulta contém palavras-chave de escrita proibidas.")
    End If

    queryResult = ExecuteQuery(queryResultFiltro.Rows(0).Item("expressaolistagem").ToString(), Nothing)

   

    Dim responseDTO = New With {
        .cod = "0000",
        .codDesc = "Success",
        .message = "Success",
        .data = queryResult
    }
    mpage.Response.ContentType = "application/json"
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))
   

Catch ex as Exception
 ' XcUtil.LogViewSource(mpage,e.toString())

   mpage.Response.ContentType = "application/json"
   Dim responseDTO= New With {.cod ="0007" ,.codDesc="Error",.message=ex.toString()}
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))


Finally
    mpage.Response.End()
End Try