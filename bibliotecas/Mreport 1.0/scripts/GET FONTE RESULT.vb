Dim querySanitized = Function(ByVal sqlExpression As String) As Boolean

    Dim writeKeywords As String() = {"DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE"}

    Dim containsKeyword As Boolean = False

    For Each keyword As String In writeKeywords
        If sqlExpression.ToUpper().Contains(keyword) Then
            containsKeyword = True
            Exit For ' Exit the loop once a keyword is found
        End If
    Next

    If containsKeyword Then
        Return False
        'throw new Exception("The input string contains a write keyword.")
    End If

    Return True

End Function

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
    Dim fontes As Newtonsoft.Json.Linq.JArray = Newtonsoft.Json.Linq.JArray.Parse(parametro)
    Dim finalQuery As String = ""
    Dim baseDadosConfig as String=$"{getBaseDadosDeConfiguracao()}.[dbo]"
    Dim resultadosFonte As New List(Of Object)

    For Each fonte As Newtonsoft.Json.Linq.JObject In fontes

        Dim queryFonte As String = $"select * from {baseDadosConfig}.u_relfonte join {baseDadosConfig}.u_fontedados on {baseDadosConfig}.u_relfonte.fontestamp={baseDadosConfig}.u_fontedados.u_fontedadosstamp where {baseDadosConfig}.u_relfonte.u_relfontestamp=@relfontestamp"
        Dim sqlParametersFonte As New List(Of System.Data.SqlClient.SqlParameter)
        sqlParametersFonte.Add(New System.Data.SqlClient.SqlParameter("@relfontestamp", fonte("fonte").ToString()))
        Dim fonteResult As DataTable = ExecuteQuery(queryFonte, sqlParametersFonte)

        Dim variaveis As New List(Of Object)()
        Dim filtro As String = fonteResult.Rows(0)("filtro").ToString()
        Dim baseQuery As String = fonteResult.Rows(0)("basequery").ToString()
        
        ' Aplicar substituição tanto no filtro quanto na basequery
        For Each variavel As Newtonsoft.Json.Linq.JObject In fonte("variaveis")
            Dim original As String = variavel("original").ToString()
            Dim preenchida As String = variavel("preenchida").ToString()
            
            filtro = filtro.Replace(original, preenchida)
            baseQuery = baseQuery.Replace(original, preenchida)
        Next

        ' Query normal sem FOR JSON PATH
        finalQuery = $"{baseQuery} {If(String.IsNullOrEmpty(filtro), "", " WHERE " + filtro)}"
        
        Dim isSanitized As Boolean = querySanitized(finalQuery)

        If Not isSanitized Then
            Throw New Exception("A string de conexão contém uma keyword de escrita")
        End If
        
        Dim fonteResultFinal = cdata.getDatatable(finalQuery)

        resultadosFonte.Add(New With {
            .fonte = fonteResult.Rows(0)("codigo"),
            .resultados = fonteResultFinal,
            .query = finalQuery,
            .fontes = fonte("variaveis")
        })

    Next

    Dim responseDTO = New With {.cod = "0000", .codDesc = "Success", .message = "Success", .data = resultadosFonte}
    mpage.Response.ContentType = "application/json"
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Catch ex As Exception
    ' XcUtil.LogViewSource(mpage,e.toString())

    mpage.Response.ContentType = "application/json"
    Dim responseDTO = New With {.cod = "0007", .codDesc = "Error", .message = ex.ToString()}
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))


Finally
    mpage.Response.End()
End Try