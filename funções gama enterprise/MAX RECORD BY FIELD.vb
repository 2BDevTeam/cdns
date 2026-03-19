Function GetMaxRecordByField(ByVal tableName As String, ByVal fieldName As String, ByVal filters As String)

    Dim query As String
    If Not String.IsNullOrEmpty(filters) Then
        query = $"SELECT ISNULL(MAX({fieldName}), 0) + 1 AS maximo FROM {tableName} WHERE {filters}"
    Else
        query = $"SELECT ISNULL(MAX({fieldName}), 0) + 1 AS maximo FROM {tableName}"
    End If

    Dim isSanitized As Boolean = querySanitized(query)
    If Not isSanitized Then
        Throw New Exception("A string de conexão contém uma keyword de escrita")
    End If

    Dim result As DataTable = ExecuteQuery(query, Nothing)
    If result IsNot Nothing AndAlso result.Rows.Count > 0 Then
        Return result.Rows(0)("maximo")
    End If

    Return 1

End Function