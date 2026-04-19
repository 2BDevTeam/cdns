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
   ' Tabela e chave dinâmicas — por defeito u_mrendrel / u_mrendrelstamp
   Dim relatorioTable As String = "u_mrendrel"
   Dim relatorioTableKey As String = "u_mrendrelstamp"
   If requestDr.Table.Columns.Contains("relatorioTable") AndAlso requestDr("relatorioTable") IsNot DBNull.Value AndAlso requestDr("relatorioTable").ToString().Trim() <> "" Then
       relatorioTable = requestDr("relatorioTable").ToString().Trim()
   End If
   If requestDr.Table.Columns.Contains("relatorioTableKey") AndAlso requestDr("relatorioTableKey") IsNot DBNull.Value AndAlso requestDr("relatorioTableKey").ToString().Trim() <> "" Then
       relatorioTableKey = requestDr("relatorioTableKey").ToString().Trim()
   End If
   Dim relatorioTableFilterField As String = "codigo"
   If requestDr.Table.Columns.Contains("relatorioTableFilterField") AndAlso requestDr("relatorioTableFilterField") IsNot DBNull.Value AndAlso requestDr("relatorioTableFilterField").ToString().Trim() <> "" Then
       relatorioTableFilterField = requestDr("relatorioTableFilterField").ToString().Trim()
   End If
   Dim sqlParametersLinha as new List(Of System.Data.SqlClient.SqlParameter)
   Dim queryLinha as String=$"select mrendLinha.* from mrendLinha join {relatorioTable} on {relatorioTable}.{relatorioTableKey}=mrendLinha.relatoriostamp where {relatorioTable}.{relatorioTableFilterField}=@codigo order by mrendLinha.ordem asc"
   sqlParametersLinha.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
   Dim queryResultLinha as DataTable= ExecuteQuery(queryLinha,sqlParametersLinha)
   Dim sqlParametersColuna as new List(Of System.Data.SqlClient.SqlParameter)
   Dim queryColuna as String=$"select mrendColuna.* from mrendColuna join {relatorioTable} on {relatorioTable}.{relatorioTableKey}=mrendColuna.relatoriostamp where {relatorioTable}.{relatorioTableFilterField}=@codigo order by mrendColuna.ordem"
   sqlParametersColuna.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
   Dim queryResultColuna as DataTable= ExecuteQuery(queryColuna,sqlParametersColuna)
   Dim sqlParametersCelula as new List(Of System.Data.SqlClient.SqlParameter)
   Dim queryCelula as String=$"select mrendCelula.* from mrendCelula join mrendLinha on mrendLinha.linhastamp=mrendCelula.linhastamp join {relatorioTable} on {relatorioTable}.{relatorioTableKey}=mrendLinha.relatoriostamp where {relatorioTable}.{relatorioTableFilterField}=@codigo"
   sqlParametersCelula.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
   Dim queryResultCelula as DataTable= ExecuteQuery(queryCelula,sqlParametersCelula)
   Dim queryRelatorio as String=$"select {relatorioTable}.* from {relatorioTable} where {relatorioTable}.{relatorioTableFilterField}=@codigo"
   Dim sqlParametersRelatorio as new List(Of System.Data.SqlClient.SqlParameter)
   sqlParametersRelatorio.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
   Dim queryResultRelatorio as DataTable= ExecuteQuery(queryRelatorio,sqlParametersRelatorio)
   Dim queryLigacoes as String=$"select Mrendconfigligacao.* from Mrendconfigligacao join {relatorioTable} on {relatorioTable}.{relatorioTableKey}=Mrendconfigligacao.relatoriostamp where {relatorioTable}.{relatorioTableFilterField}=@codigo"
   Dim sqlParametersLigacao as new List(Of System.Data.SqlClient.SqlParameter)
   sqlParametersLigacao.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
   Dim queryResultLigacao as DataTable= ExecuteQuery(queryLigacoes,sqlParametersLigacao)
   Dim queryGrupoColunas as String=$"select MrendGrupoColuna.* from MrendGrupoColuna join {relatorioTable} on {relatorioTable}.{relatorioTableKey}=MrendGrupoColuna.relatoriostamp where {relatorioTable}.{relatorioTableFilterField}=@codigo"
   Dim sqlParametersGrupoColunas as new List(Of System.Data.SqlClient.SqlParameter)
   sqlParametersGrupoColunas.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
   Dim queryResultGrupoColunas as DataTable= ExecuteQuery(queryGrupoColunas,sqlParametersGrupoColunas)
   Dim queryGrupoColunaItems as String=$"select MrendGrupoColunaItem.* from MrendGrupoColunaItem join {relatorioTable} on {relatorioTable}.{relatorioTableKey}=MrendGrupoColunaItem.relatoriostamp where {relatorioTable}.{relatorioTableFilterField}=@codigo"
   Dim sqlParametersGrupoColunaItems as new List(Of System.Data.SqlClient.SqlParameter)
   sqlParametersGrupoColunaItems.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
   Dim queryResultGrupoColunaItems as DataTable= ExecuteQuery(queryGrupoColunaItems,sqlParametersGrupoColunaItems)
   Dim dadosRelatorio=new With{
    .relatorio=queryResultRelatorio,
    .linhas=queryResultLinha,
    .colunas=queryResultColuna,
    .celulas=queryResultCelula,
    .ligacoes=queryResultLigacao,
    .grupocolunas=queryResultGrupoColunas,
    .grupocolunaItems=queryResultGrupoColunaItems
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