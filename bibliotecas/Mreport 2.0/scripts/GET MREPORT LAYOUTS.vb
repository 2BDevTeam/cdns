' =============================================================================
' GET MREPORT LAYOUTS.vb  —  Mreport 2.0
' cscript: getmreportlayouts
'
' Devolve todos os MReportLayout activos (públicos / templates).
' =============================================================================

Try
    Dim queryStr As String = "SELECT * FROM MReportLayout WHERE ISNULL(inactivo,0)=0 ORDER BY ordem ASC"
    Dim layouts As DataTable
    Using connection As SqlClient.SqlConnection = SqlHelp.GetNewConnection()
        Using command As New SqlClient.SqlCommand(queryStr, connection)
            Using adapter As New SqlClient.SqlDataAdapter(command)
                layouts = New DataTable()
                adapter.Fill(layouts)
            End Using
        End Using
    End Using

    Dim responseDTO = New With {
        .cod = "0000", .codDesc = "Success", .message = "Success",
        .data = New With {.layouts = layouts}
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
