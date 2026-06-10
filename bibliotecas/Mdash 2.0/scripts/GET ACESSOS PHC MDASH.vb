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

Try
    Dim queryPf As String = "select pfstamp, cast(codigo as varchar(50)) as codigo, resumo as nome, descricao from pf order by codigo asc, resumo asc"
    Dim queryResultPf As DataTable = ExecuteQuery(queryPf, Nothing)

    Dim responseDTO = New With {.cod = "0000", .codDesc = "Success", .message = "Success", .data = queryResultPf}
    mpage.Response.ContentType = "application/json"
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))
Catch ex As Exception
    mpage.Response.ContentType = "application/json"
    Dim responseDTO = New With {.cod = "0007", .codDesc = "Error", .message = ex.ToString()}
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))
Finally
    mpage.Response.End()
End Try
