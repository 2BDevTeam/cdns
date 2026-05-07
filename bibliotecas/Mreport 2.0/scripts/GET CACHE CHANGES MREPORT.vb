' =============================================================================
' GET CACHE CHANGES MREPORT.vb  —  Mreport 2.0
' cscript: getcachechanges
'
' Recebe: [{ "fontestamp":"...", "fromVersion": 123 }]
' Devolve: { data: { version, changes:[ {op,key,row,...} ] } }
'   - changes ordenados por version asc
'   - version = MAX(version) devolvido
' =============================================================================

Dim ExecuteQuery = Function(ByVal fQuery As String, ByVal fSqlParameters As List(Of System.Data.SqlClient.SqlParameter)) As DataTable
    Dim table As New DataTable
    Using connection As SqlClient.SqlConnection = SqlHelp.GetNewConnection()
        Using command As New SqlClient.SqlCommand(fQuery, connection)
            If fSqlParameters IsNot Nothing Then
                For Each p As System.Data.SqlClient.SqlParameter In fSqlParameters
                    command.Parameters.Add(p)
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
    Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
    Dim requestDr As DataRow = JsonConvert.DeserializeObject(Of DataTable)(parametro).rows(0)

    Dim fontestamp As String = ""
    If requestDr.Table.Columns.Contains("fontestamp") Then fontestamp = requestDr("fontestamp").ToString()
    Dim fromVersion As Long = 0
    If requestDr.Table.Columns.Contains("fromVersion") AndAlso Not IsDBNull(requestDr("fromVersion")) Then
        Long.TryParse(requestDr("fromVersion").ToString(), fromVersion)
    End If
    If String.IsNullOrEmpty(fontestamp) Then Throw New Exception("fontestamp em falta.")

    Dim queryStr As String =
        "SELECT * FROM MReportCacheDelta " &
        "WHERE fontestamp=@fontestamp AND version > @fromVersion " &
        "ORDER BY version ASC"
    Dim sqlParams As New List(Of System.Data.SqlClient.SqlParameter)
    sqlParams.Add(New System.Data.SqlClient.SqlParameter("@fontestamp", fontestamp))
    sqlParams.Add(New System.Data.SqlClient.SqlParameter("@fromVersion", fromVersion))
    Dim changes As DataTable = ExecuteQuery(queryStr, sqlParams)

    Dim maxVersion As Long = fromVersion
    For Each r As DataRow In changes.Rows
        If Not IsDBNull(r("version")) Then
            Dim v As Long = Convert.ToInt64(r("version"))
            If v > maxVersion Then maxVersion = v
        End If
    Next

    Dim responseDTO = New With {
        .cod = "0000", .codDesc = "Success", .message = "Success",
        .data = New With {.version = maxVersion, .fontestamp = fontestamp, .changes = changes}
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
