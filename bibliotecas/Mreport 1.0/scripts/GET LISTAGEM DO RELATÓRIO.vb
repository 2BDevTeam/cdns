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
 
   Dim baseDadosConfig as String=$"{getBaseDadosDeConfiguracao()}.[dbo]"
   Dim sqlParameters as new List(Of System.Data.SqlClient.SqlParameter)

   Dim query as String=$"select u_linha.ordem ordemlinha,u_linha.expressao expressaolinha,u_colunarel.ordem ordemcoluna,  u_linha.codigo codigolinha,u_colunarel.codigo codigocoluna,u_linha.valor,u_colunarel.valor valorcoluna,u_celula.valor valorcelula,* from {baseDadosConfig}.u_celula (nolock) join {baseDadosConfig}.u_linha (nolock) on {baseDadosConfig}.u_celula.stamplinha={baseDadosConfig}.u_linha.u_linhastamp join {baseDadosConfig}.u_colunarel (nolock) on {baseDadosConfig}.u_celula.stampcoluna={baseDadosConfig}.u_colunarel.u_colunarelstamp where {baseDadosConfig}.u_linha.syncstamp=@syncstamp"
   
   Dim queryGrupo as String=$"select * from {baseDadosConfig}.u_gruporel (nolock) where syncstamp=@syncstamp"
   Dim sqlParametersGrupo as new List(Of System.Data.SqlClient.SqlParameter)
   sqlParametersGrupo.add(new System.Data.SqlClient.SqlParameter("@syncstamp",requestDr("syncstamp")))
   Dim queryGrupoResult as DataTable= ExecuteQuery(queryGrupo,sqlParametersGrupo)
   
   sqlParameters.add(new System.Data.SqlClient.SqlParameter("@syncstamp",requestDr("syncstamp")))
   Dim queryResult as DataTable= ExecuteQuery(query,sqlParameters) 

   Dim responseDTO= New With {.cod ="0000" ,.codDesc="Success",.message="Success",.data=queryResult,.grupos=queryGrupoResult}
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