

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
     Dim requestDr As DataRow = JsonConvert.DeserializeObject(Of DataTable)(parametro).rows(0)

     Dim  queryReport="select *from u_mreport where u_mreport.codigo=@codigo"
     Dim sqlParametersReport as new List(Of System.Data.SqlClient.SqlParameter)
     sqlParametersReport.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
     Dim queryResultReport as DataTable= ExecuteQuery(queryReport,sqlParametersReport)


    Dim queryMReportFilter="select MReportFilter.* from MReportFilter join u_mreport on u_mreport.u_mreportstamp=MReportFilter.mreportstamp where u_mreport.codigo=@codigo order by MReportFilter.ordem asc"
    Dim sqlParametersMReportFilter as new List(Of System.Data.SqlClient.SqlParameter)
    sqlParametersMReportFilter.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
    Dim queryResultMReportFilter as DataTable= ExecuteQuery(queryMReportFilter,sqlParametersMReportFilter)


    Dim queryMReportFonte="select MReportFonte.* from MReportFonte join u_mreport on u_mreport.u_mreportstamp=MReportFonte.mreportstamp where u_mreport.codigo=@codigo order by MReportFonte.ordem asc "
    Dim sqlParametersReportFonte as new List(Of System.Data.SqlClient.SqlParameter)
    sqlParametersReportFonte.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
    Dim queryResultReportFonte as DataTable= ExecuteQuery(queryMReportFonte,sqlParametersReportFonte)

    Dim queryMReportObject="select MReportObject.* from MReportObject join u_mreport on u_mreport.u_mreportstamp=MReportObject.mreportstamp where u_mreport.codigo=@codigo order by MReportObject.ordem asc"
    Dim sqlParametersMReportObject as new List(Of System.Data.SqlClient.SqlParameter)
    sqlParametersMReportObject.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
    Dim queryResultMReportObject as DataTable= ExecuteQuery(queryMReportObject,sqlParametersMReportObject)


    Dim dadosRelatorio as New With {
        .report = queryResultReport,
        .objects = queryResultMReportObject,
        .filters = queryResultMReportFilter,
        .fontes = queryResultReportFonte
        }
     
     Dim responseDTO= New With {.cod ="0000" ,.codDesc="Success",.message="Success",.data=dadosRelatorio}
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