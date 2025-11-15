
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


Dim responseDTO as new Object
Try

    Dim sqlParameters as new List(Of System.Data.SqlClient.SqlParameter)
    'Dim query as String="    "
    'Dim queryResult as DataTable= ExecuteQuery(query,sqlParameters) 

   responseDTO= New With {.cod ="0000" ,.codDesc="Success",.message="Success"}
   mpage.Response.ContentType = "application/json"
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))
   
Catch ex as Exception
 ' XcUtil.LogViewSource(mpage,e.toString())

   mpage.Response.ContentType = "application/json"
   responseDTO= New With {.cod ="0007" ,.codDesc="Error",.message=ex.toString()}
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))


Finally
    mpage.Response.End()
End Try