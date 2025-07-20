
Dim dynamicUpsertDataRowWithTransaction = Function (ByVal dataRow As DataRow, ByVal tableName As String, ByVal recordKey As String, ByVal id As String, ByVal connectionPar As SqlClient.SqlConnection, ByVal transactionPar As System.Data.SqlClient.SqlTransaction)
   
   
    Dim columns As New List(Of String)
    Dim values As New List(Of String)
    Dim sqlParametersDynamic As New List(Of System.Data.SqlClient.SqlParameter)

    For Each column As DataColumn In dataRow.Table.Columns
        Dim paramName = "@" & column.ColumnName
        columns.Add(column.ColumnName)
        values.Add(paramName)
        sqlParametersDynamic.Add(New System.Data.SqlClient.SqlParameter(paramName, dataRow(column.ColumnName)))
    Next

    Dim recordExists As Boolean = False
    Dim queryCheck = $"SELECT *FROM {tableName} WHERE {recordKey} = '{id}'"
    Dim isSanitized as Boolean=querySanitized(queryCheck)

     if not isSanitized Then
       throw new Exception("A string de conexão contém uma keyword de escrita")
     End if

    Dim result = cdata.getDatatable(queryCheck)
    If result.rows.count > 0 Then
        recordExists = True
    End If

    Dim queryDynamic As String
    If recordExists Then
        queryDynamic = $"UPDATE {tableName} SET {String.Join(", ", columns.Select(Function(c) $"{c} = @{c}"))} WHERE {recordKey} = '{id}'"
    Else
        queryDynamic = $"INSERT INTO {tableName} ({String.Join(", ", columns)}) VALUES ({String.Join(", ", values)})"
    End If
    
    ExecuteNonQueryWithTransaction(queryDynamic,connectionPar,transactionPar,sqlParametersDynamic)
End Function