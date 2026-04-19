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

   Dim requisicao As String = requestObj("requisicao").ToString()

   Dim query As String = "
        select bi.ref, bi.design, bi.qtt, bi.edebito, bi.no, bi.nome
        from bo
        join bo2 on bo.bostamp=bo2.bo2stamp
        join bo3 on bo.bostamp=bo3.bo3stamp
        join bi on bo.bostamp=bi.bostamp
        join bi2 on bi2.bi2stamp=bi.bistamp
        where bo3.u_requis=@requisicao
   "

   Dim sqlParameters As New List(Of System.Data.SqlClient.SqlParameter)
   sqlParameters.Add(New System.Data.SqlClient.SqlParameter("@requisicao", requisicao))

   Dim queryResult As DataTable = ExecuteQuery(query, sqlParameters)

   Dim responseDTO = New With {.cod = "0000", .codDesc = "Sucesso", .data = queryResult}
   mpage.Response.ContentType = "application/json"
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Catch ex As Exception

   mpage.Response.ContentType = "application/json"
   Dim responseDTO = New With {.cod = "0007", .codDesc = "Error", .message = ex.ToString()}
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Finally
    mpage.Response.End()
End Try
