Function CheckUserHasAccessToProfileByUserno(ByVal codigoDoPerfil As Integer, ByVal userno As Integer) As Boolean
    Dim query As String = ""
    query &= "select count(*) as total "
    query &= "from pf "
    query &= "join pfu on pf.pfstamp = pfu.pfstamp "
    query &= "where pf.codigo = @codigo and pfu.userno = @userno"

    Dim sqlParameters As New List(Of System.Data.SqlClient.SqlParameter)
    sqlParameters.Add(New System.Data.SqlClient.SqlParameter("@codigo", codigoDoPerfil))
    sqlParameters.Add(New System.Data.SqlClient.SqlParameter("@userno", userno))

    Return CInt(ExecuteQuery(query, sqlParameters).Rows(0).Item("total")) > 0
End Function

Function CheckUserHasAccessToProfileByUgstamp(ByVal codigoDoPerfil As Integer, ByVal ugstamp As String) As Boolean
    Dim query As String = ""
    query &= "select count(*) as total "
    query &= "from pf "
    query &= "join pfg on pf.pfstamp = pfg.pfstamp "
    query &= "where pf.codigo = @codigo and pfg.ugstamp = @ugstamp"

    Dim sqlParameters As New List(Of System.Data.SqlClient.SqlParameter)
    sqlParameters.Add(New System.Data.SqlClient.SqlParameter("@codigo", codigoDoPerfil))
    sqlParameters.Add(New System.Data.SqlClient.SqlParameter("@ugstamp", ugstamp))

    Return CInt(ExecuteQuery(query, sqlParameters).Rows(0).Item("total")) > 0
End Function

Function CheckUserHasAccessToProfile(ByVal codigoDoPerfil As Integer, ByVal userno As Integer) As Boolean
    Dim query As String = "select ugstamp from us where userno = @userno"

    Dim sqlParameters As New List(Of System.Data.SqlClient.SqlParameter)
    sqlParameters.Add(New System.Data.SqlClient.SqlParameter("@userno", userno))

    Dim dt As DataTable = ExecuteQuery(query, sqlParameters)

    If dt.Rows.Count = 0 Then
        Return False
    End If

    Dim ugstamp As String = CStr(dt.Rows(0).Item("ugstamp"))

    Return CheckUserHasAccessToProfileByUserno(codigoDoPerfil, userno) OrElse _
           CheckUserHasAccessToProfileByUgstamp(codigoDoPerfil, ugstamp)
End Function

Function CheckActualUserHasAccessToProfile(ByVal codigoDoPerfil As Integer) As Boolean
    Dim userno As Integer = CInt(XcUser.Userno())

    Return CheckUserHasAccessToProfile(codigoDoPerfil, userno)
End Function