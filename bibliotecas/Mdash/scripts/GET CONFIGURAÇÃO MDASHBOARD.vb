

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

     Dim  queryMdashboard="select *from u_mdash where u_mdash.codigo=@codigo"
     Dim sqlParametersMdashboard as new List(Of System.Data.SqlClient.SqlParameter)
     sqlParametersMdashboard.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
     Dim queryResultMdashboard as DataTable= ExecuteQuery(queryMdashboard,sqlParametersMdashboard)

     Dim queryMdashContainer="select MdashContainer.* from MdashContainer join u_mdash on u_mdash.u_mdashstamp=MdashContainer.dashboardstamp where u_mdash.codigo=@codigo order by MdashContainer.ordem asc"
        Dim sqlParametersContainer as new List(Of System.Data.SqlClient.SqlParameter)
        sqlParametersContainer.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
        Dim queryResultContainer as DataTable= ExecuteQuery(queryMdashContainer,sqlParametersContainer)

    Dim queryMdashContainerItem="select MdashContainerItem.* from MdashContainerItem join MdashContainer on MdashContainer.mdashcontainerstamp=MdashContainerItem.mdashcontainerstamp join u_mdash on u_mdash.u_mdashstamp=MdashContainer.dashboardstamp where u_mdash.codigo=@codigo order by MdashContainerItem.ordem asc"
    Dim sqlParametersContainerItem as new List(Of System.Data.SqlClient.SqlParameter)
    sqlParametersContainerItem.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
    Dim queryResultContainerItem as DataTable= ExecuteQuery(queryMdashContainerItem,sqlParametersContainerItem)


    Dim queryMdashFilter="select MdashFilter.* from MdashFilter join u_mdash on u_mdash.u_mdashstamp=MdashFilter.dashboardstamp where u_mdash.codigo=@codigo order by MdashFilter.ordem asc "
    Dim sqlParametersFilter as new List(Of System.Data.SqlClient.SqlParameter)
    sqlParametersFilter.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
    Dim queryResultFilter as DataTable= ExecuteQuery(queryMdashFilter,sqlParametersFilter)


    Dim dadosRelatorio as New With {
        .dashboard = queryResultMdashboard,
        .containers = queryResultContainer,
        .containerItems = queryResultContainerItem,
        .filters = queryResultFilter
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