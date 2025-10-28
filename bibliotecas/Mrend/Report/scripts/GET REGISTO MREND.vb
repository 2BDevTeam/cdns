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
    End If

    return true

End Function

Dim getRegisto=Function(ByVal tabelaPar, Byval colunaPar,ByVal registoPar)
        Dim sqlParameters as new List(Of System.Data.SqlClient.SqlParameter)
        Dim query As String=$"select *from {tabelaPar} where {colunaPar}=@registo"

        Dim isSanitized As Boolean = querySanitized(query)

        If Not isSanitized Then
            Throw New Exception("A string  contém uma keyword de escrita")
        End If
        
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@registo",registoPar))
        return ExecuteQuery(query,sqlParameters) 
End Function




Try

   Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
   Dim requestDr As DataRow = JsonConvert.DeserializeObject(Of DataTable)(parametro).rows(0)

   Dim queryResult as DataTable=getRegisto(requestDr("tabela"),requestDr("coluna"),requestDr("registo"))

   Dim responseDTO= New With {.cod ="0000" ,.codDesc="Success",.message="Success",.data=queryResult}
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