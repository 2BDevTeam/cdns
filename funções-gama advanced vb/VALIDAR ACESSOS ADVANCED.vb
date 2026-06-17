
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
    Dim userno As String
    userno = CStr(XcUser.Userno())

    Return UserHasAccessToProfile(codigoDoPerfil, userno)
End Function
