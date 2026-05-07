' =============================================================================
' GET CACHE VERSION MREPORT.vb  —  Mreport 2.0
' cscript: getcacheversion
'
' Recebe: [{ "fontestamp": "..." }]
' Devolve: { data: { version: <int> } }
' =============================================================================

Try
    Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
    Dim requestDr As DataRow = JsonConvert.DeserializeObject(Of DataTable)(parametro).rows(0)

    Dim fontestamp As String = ""
    If requestDr.Table.Columns.Contains("fontestamp") Then fontestamp = requestDr("fontestamp").ToString()
    If String.IsNullOrEmpty(fontestamp) Then Throw New Exception("fontestamp em falta.")

    Dim version As Long = 0
    Dim queryStr As String = "SELECT ISNULL(MAX(version),0) AS v FROM MReportCacheDelta WHERE fontestamp=@fontestamp"
    Using connection As SqlClient.SqlConnection = SqlHelp.GetNewConnection()
        Using command As New SqlClient.SqlCommand(queryStr, connection)
            command.Parameters.Add(New System.Data.SqlClient.SqlParameter("@fontestamp", fontestamp))
            connection.Open()
            Dim r = command.ExecuteScalar()
            If r IsNot Nothing AndAlso Not IsDBNull(r) Then version = Convert.ToInt64(r)
        End Using
    End Using

    Dim responseDTO = New With {
        .cod = "0000", .codDesc = "Success", .message = "Success",
        .data = New With {.version = version, .fontestamp = fontestamp}
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
