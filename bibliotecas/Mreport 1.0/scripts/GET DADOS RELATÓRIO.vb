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

   Dim pattern As String = "\{\{([^{}]+)\}\}"
   Dim regex As New Regex(pattern)
   Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
   Dim requestDr As DataRow = JsonConvert.DeserializeObject(Of DataTable)(parametro).rows(0)
   Dim baseDadosConfig as String=$"{getBaseDadosDeConfiguracao()}.[dbo]"

   Dim relatorio As String=requestDr("relatorio").toString()
 
   Dim sqlParametersDadosRelatorio as new List(Of System.Data.SqlClient.SqlParameter)
   Dim queryDadosRelatorio as String=$"select *from {baseDadosConfig}.u_relatorio where codigo=@relatorio"
   sqlParametersDadosRelatorio.add(new System.Data.SqlClient.SqlParameter("@relatorio",requestDr("relatorio")))
   Dim dadosRelatorioResult as DataTable= ExecuteQuery(queryDadosRelatorio,sqlParametersDadosRelatorio) 

   Dim queryFontes as String=$"select   *  from {baseDadosConfig}.u_relfonte join  {baseDadosConfig}.u_fontedados on {baseDadosConfig}.u_fontedados.u_fontedadosstamp={baseDadosConfig}.u_relfonte.fontestamp join {baseDadosConfig}.u_relatorio on {baseDadosConfig}.u_relatorio.syncstamp={baseDadosConfig}.u_relfonte.syncstamp where {baseDadosConfig}.u_relatorio.codigo=@relatorio"
   Dim sqlParametersFontes as new List(Of System.Data.SqlClient.SqlParameter)
   sqlParametersFontes.add(new System.Data.SqlClient.SqlParameter("@relatorio",requestDr("relatorio")))
   Dim fontesResult as DataTable= ExecuteQuery(queryFontes,sqlParametersFontes)

   Dim variaveisFontes As New List(Of Object)()


   For Each fonteRel in fontesResult.Rows
      Dim variaveis As New List(Of Object)()
      Dim inputText as String=fonteRel("filtro").toString()
      Dim matches As MatchCollection = regex.Matches(inputText)

      For i As Integer = 0 To matches.Count - 1
         ' extractedTextArray(i) = matches(i).Groups(1).Value
          Dim  variavel= New With {.nome=matches(i).Groups(1).Value,.original="{{" & matches(i).Groups(1).Value & "}}"}
          variaveis.Add(variavel)
      Next

      Dim variavelFonte= New With {.fonte=fonteRel("u_relfontestamp").toString(),.variaveis=variaveis}
      variaveisFontes.Add(variavelFonte)

   Next





   Dim resultadoRelatorio= New with {.dadosRelatorio=dadosRelatorioResult,.variaveisFonte=variaveisFontes}
   Dim responseDTO= New With {.cod ="0000" ,.codDesc="Success",.message="Success",.data=resultadoRelatorio}
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