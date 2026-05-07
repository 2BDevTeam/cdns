' =============================================================================
' GET CONFIGURACAO MREPORT.vb  —  Mreport 2.0
' cscript: getconfiguracaomreport
'
' Carrega TODA a configuração de um relatório:
'   u_mreport, MReportTab, MReportLayout, MReportSection,
'   MReportObject, MReportObjectDetail, MReportValorDinamico,
'   MReportFilter, MReportFonte
'
' Recebe (POST __EVENTARGUMENT):  [{"codigo":"REL001"}]   ou  [{"u_mreportstamp":"..."}]
' Devolve: { cod, codDesc, message, data: { config, tabs, layouts, sections,
'           objects, objectDetails, valoresDinamicos, filters, fontes } }
' =============================================================================

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
    Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
    Dim requestDr As DataRow = JsonConvert.DeserializeObject(Of DataTable)(parametro).rows(0)

    ' Aceitar ou codigo ou u_mreportstamp
    Dim codigo As String = ""
    Dim mreportstamp As String = ""
    If requestDr.Table.Columns.Contains("codigo") Then codigo = requestDr("codigo").ToString()
    If requestDr.Table.Columns.Contains("u_mreportstamp") Then mreportstamp = requestDr("u_mreportstamp").ToString()
    If requestDr.Table.Columns.Contains("relatoriostamp") AndAlso String.IsNullOrEmpty(mreportstamp) Then mreportstamp = requestDr("relatoriostamp").ToString()

    ' --- u_mreport (config) ----------------------------------------------------
    Dim queryConfig As String =
        "SELECT * FROM u_mreport " &
        "WHERE (@codigo='' OR codigo=@codigo) AND (@stamp='' OR u_mreportstamp=@stamp)"
    Dim sqlConfig As New List(Of System.Data.SqlClient.SqlParameter)
    sqlConfig.Add(New System.Data.SqlClient.SqlParameter("@codigo", codigo))
    sqlConfig.Add(New System.Data.SqlClient.SqlParameter("@stamp", mreportstamp))
    Dim resConfig As DataTable = ExecuteQuery(queryConfig, sqlConfig)

    ' Resolver stamp efectivo se veio só codigo
    If String.IsNullOrEmpty(mreportstamp) AndAlso resConfig.Rows.Count > 0 Then
        mreportstamp = resConfig.Rows(0)("u_mreportstamp").ToString()
    End If

    ' --- MReportTab ------------------------------------------------------------
    Dim queryTabs As String = "SELECT * FROM MReportTab WHERE mreportstamp=@stamp AND ISNULL(inactivo,0)=0 ORDER BY ordem ASC"
    Dim sqlTabs As New List(Of System.Data.SqlClient.SqlParameter)
    sqlTabs.Add(New System.Data.SqlClient.SqlParameter("@stamp", mreportstamp))
    Dim resTabs As DataTable = ExecuteQuery(queryTabs, sqlTabs)

    ' --- MReportLayout (públicos + os usados por este relatório) --------------
    Dim queryLayouts As String =
        "SELECT * FROM MReportLayout WHERE ISNULL(inactivo,0)=0 ORDER BY ordem ASC"
    Dim resLayouts As DataTable = ExecuteQuery(queryLayouts, Nothing)

    ' --- MReportSection --------------------------------------------------------
    Dim querySections As String =
        "SELECT * FROM MReportSection WHERE mreportstamp=@stamp AND ISNULL(inactivo,0)=0 ORDER BY ordem ASC"
    Dim sqlSections As New List(Of System.Data.SqlClient.SqlParameter)
    sqlSections.Add(New System.Data.SqlClient.SqlParameter("@stamp", mreportstamp))
    Dim resSections As DataTable = ExecuteQuery(querySections, sqlSections)

    ' --- MReportObject ---------------------------------------------------------
    Dim queryObjects As String =
        "SELECT * FROM MReportObject WHERE mreportstamp=@stamp AND ISNULL(inactivo,0)=0 ORDER BY ordem ASC"
    Dim sqlObjects As New List(Of System.Data.SqlClient.SqlParameter)
    sqlObjects.Add(New System.Data.SqlClient.SqlParameter("@stamp", mreportstamp))
    Dim resObjects As DataTable = ExecuteQuery(queryObjects, sqlObjects)

    ' --- MReportObjectDetail ---------------------------------------------------
    Dim queryDetails As String =
        "SELECT * FROM MReportObjectDetail WHERE mreportstamp=@stamp AND ISNULL(inactivo,0)=0 ORDER BY ordem ASC"
    Dim sqlDetails As New List(Of System.Data.SqlClient.SqlParameter)
    sqlDetails.Add(New System.Data.SqlClient.SqlParameter("@stamp", mreportstamp))
    Dim resDetails As DataTable = ExecuteQuery(queryDetails, sqlDetails)

    ' --- MReportValorDinamico --------------------------------------------------
    Dim queryValoresDinamicos As String =
        "SELECT * FROM MReportValorDinamico WHERE mreportstamp=@stamp AND ISNULL(inactivo,0)=0 ORDER BY ordem ASC"
    Dim sqlValores As New List(Of System.Data.SqlClient.SqlParameter)
    sqlValores.Add(New System.Data.SqlClient.SqlParameter("@stamp", mreportstamp))
    Dim resValores As DataTable = ExecuteQuery(queryValoresDinamicos, sqlValores)

    ' --- MReportFilter ---------------------------------------------------------
    Dim queryFilters As String =
        "SELECT * FROM MReportFilter WHERE mreportstamp=@stamp AND ISNULL(inactivo,0)=0 ORDER BY ordem ASC"
    Dim sqlFilters As New List(Of System.Data.SqlClient.SqlParameter)
    sqlFilters.Add(New System.Data.SqlClient.SqlParameter("@stamp", mreportstamp))
    Dim resFilters As DataTable = ExecuteQuery(queryFilters, sqlFilters)

    ' --- MReportFonte ----------------------------------------------------------
    Dim queryFontes As String =
        "SELECT * FROM MReportFonte WHERE mreportstamp=@stamp AND ISNULL(inactivo,0)=0 ORDER BY ordem ASC"
    Dim sqlFontes As New List(Of System.Data.SqlClient.SqlParameter)
    sqlFontes.Add(New System.Data.SqlClient.SqlParameter("@stamp", mreportstamp))
    Dim resFontes As DataTable = ExecuteQuery(queryFontes, sqlFontes)

    Dim dadosRelatorio As New With {
        .config = resConfig,
        .tabs = resTabs,
        .layouts = resLayouts,
        .sections = resSections,
        .objects = resObjects,
        .objectDetails = resDetails,
        .valoresDinamicos = resValores,
        .filters = resFilters,
        .fontes = resFontes
    }

    Dim responseDTO = New With {.cod = "0000", .codDesc = "Success", .message = "Success", .data = dadosRelatorio}
    mpage.Response.ContentType = "application/json"
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Catch ex As Exception
    mpage.Response.ContentType = "application/json"
    Dim responseDTO = New With {.cod = "0007", .codDesc = "Error", .message = ex.ToString()}
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))
Finally
    mpage.Response.End()
End Try
