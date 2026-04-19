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

Try

   Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
   Dim requestArray As Newtonsoft.Json.Linq.JArray = Newtonsoft.Json.Linq.JArray.Parse(parametro)
   Dim requestObj As Newtonsoft.Json.Linq.JObject = CType(requestArray(0), Newtonsoft.Json.Linq.JObject)

   Dim bostamp As String = requestObj("bostamp").ToString()

   ' Query separada: linhas bi com dados dos fornecedores
   Dim queryBi As String = "
        SELECT bi.bistamp, bi.ref, bi.design, bi.qtt, bi.edebito, bi.no, bi.nome, bi.lordem, bi.u_codlinha
        FROM bi
        JOIN bi2 ON bi2.bi2stamp = bi.bistamp
        WHERE bi.bostamp = @bostamp
        ORDER BY bi.lordem
   "

   ' Query separada: critérios de avaliação
   Dim queryAvcrit As String = "
        SELECT u_avcrit.u_avcritstamp, u_avcrit.bistamp, u_avcrit.codcrit, u_avcrit.desccrit, u_avcrit.status
        FROM u_avcrit
        WHERE u_avcrit.bostamp = @bostamp
   "

   Dim sqlParametersBi As New List(Of System.Data.SqlClient.SqlParameter)
   sqlParametersBi.Add(New System.Data.SqlClient.SqlParameter("@bostamp", bostamp))

   Dim sqlParametersAvcrit As New List(Of System.Data.SqlClient.SqlParameter)
   sqlParametersAvcrit.Add(New System.Data.SqlClient.SqlParameter("@bostamp", bostamp))

   Dim biResult As DataTable = ExecuteQuery(queryBi, sqlParametersBi)
   Dim avcritResult As DataTable = ExecuteQuery(queryAvcrit, sqlParametersAvcrit)

   Dim responseDTO = New With {
       .cod = "0000",
       .codDesc = "Sucesso",
       .bi = biResult,
       .avcrit = avcritResult
   }
   mpage.Response.ContentType = "application/json"
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Catch ex As Exception

   mpage.Response.ContentType = "application/json"
   Dim responseDTO = New With {.cod = "0007", .codDesc = "Error", .message = ex.ToString()}
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Finally
    mpage.Response.End()
End Try
