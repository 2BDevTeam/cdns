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

Dim UserHasAccessToProfileByUserno = Function(ByVal codigoDoPerfil As Integer, ByVal userno As String) As Boolean
    Dim query As String
    query = "select count(*) as total from pf join pfu on pf.pfstamp = pfu.pfstamp "
    query += "where pf.codigo = @codigo and pfu.userno = @userno"

    Dim sqlParameters As New List(Of System.Data.SqlClient.SqlParameter)
    sqlParameters.Add(New System.Data.SqlClient.SqlParameter("@codigo", codigoDoPerfil))
    sqlParameters.Add(New System.Data.SqlClient.SqlParameter("@userno", userno))

    Return ExecuteQuery(query, sqlParameters).Rows(0).Item("total") > 0
End Function

Dim UserHasAccessToProfileByUgstamp = Function(ByVal codigoDoPerfil As Integer, ByVal ugstamp As String) As Boolean
    Dim query As String
    query = "select count(*) as total from pf join pfg on pf.pfstamp = pfg.pfstamp "
    query += "where pf.codigo = @codigo and pfg.ugstamp = @ugstamp"

    Dim sqlParameters As New List(Of System.Data.SqlClient.SqlParameter)
    sqlParameters.Add(New System.Data.SqlClient.SqlParameter("@codigo", codigoDoPerfil))
    sqlParameters.Add(New System.Data.SqlClient.SqlParameter("@ugstamp", ugstamp))

    Return ExecuteQuery(query, sqlParameters).Rows(0).Item("total") > 0
End Function

Dim UserHasAccessToProfile = Function(ByVal codigoDoPerfil As Integer, ByVal userno As String) As Boolean
    Dim query As String
    query = "select * from us where userno = @userno"

    Dim sqlParameters As New List(Of System.Data.SqlClient.SqlParameter)
    sqlParameters.Add(New System.Data.SqlClient.SqlParameter("@userno", userno))

    Dim us As DataRow
    us = ExecuteQuery(query, sqlParameters).Rows(0)

    Dim ugstamp As String
    ugstamp = us.Item("ugstamp")

    Return UserHasAccessToProfileByUserno(codigoDoPerfil, userno) OrElse UserHasAccessToProfileByUgstamp(codigoDoPerfil, ugstamp)
End Function

Dim UserActualHasAccessToProfile = Function(ByVal codigoDoPerfil As Integer) As Boolean
    Dim userno As Integer
    userno = XcUser.Userno()

    Return UserHasAccessToProfile(codigoDoPerfil, userno)
End Function

Try
    Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
    Dim payload As Newtonsoft.Json.Linq.JArray = Newtonsoft.Json.Linq.JArray.Parse(parametro)
    Dim requestObj As Newtonsoft.Json.Linq.JObject = CType(payload(0), Newtonsoft.Json.Linq.JObject)
    Dim codigosToken As Newtonsoft.Json.Linq.JToken = requestObj("codigos")

    Dim codigos As New List(Of Integer)

    If codigosToken IsNot Nothing AndAlso codigosToken.Type = Newtonsoft.Json.Linq.JTokenType.Array Then
        For Each codigoToken As Newtonsoft.Json.Linq.JToken In codigosToken
            Dim codigoTexto As String = codigoToken.ToString().Trim()
            If Not String.IsNullOrEmpty(codigoTexto) AndAlso IsNumeric(codigoTexto) Then
                Dim codigoInt As Integer = Convert.ToInt32(codigoTexto)
                If Not codigos.Contains(codigoInt) Then
                    codigos.Add(codigoInt)
                End If
            End If
        Next
    ElseIf requestObj("perfilCodigo") IsNot Nothing Then
        Dim codigoTexto As String = requestObj("perfilCodigo").ToString().Trim()
        If Not String.IsNullOrEmpty(codigoTexto) AndAlso IsNumeric(codigoTexto) Then
            codigos.Add(Convert.ToInt32(codigoTexto))
        End If
    End If

    Dim resultados As New List(Of Object)

    For Each codigo As Integer In codigos
        Dim userTemAcesso As Boolean = UserActualHasAccessToProfile(codigo)
        resultados.Add(New With {
            .codigo = codigo,
            .hasAccess = userTemAcesso
        })
    Next

    Dim responseDTO = New With {.cod = "0000", .codDesc = "Success", .message = "Success", .data = resultados}
    mpage.Response.ContentType = "application/json"
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))
Catch ex As Exception
    mpage.Response.ContentType = "application/json"
    Dim responseDTO = New With {.cod = "0007", .codDesc = "Error", .message = ex.ToString()}
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))
Finally
    mpage.Response.End()
End Try
