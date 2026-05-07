' =============================================================================
' REAL TIME COMPONENT SYNC MREPORT.vb  —  Mreport 2.0
' cscript: realtimecomponentsync     (também serve para o commit final)
'
' Padrão portado de Mdash 2.0/REAL TIME COMPONENT SYNC.vb.
'
' Recebe: [{
'     "config": [ { "sourceTable": "MReportObject", "sourceKey": "mreportobjectstamp",
'                   "records": [ {...}, {...} ] }, ... ],
'     "recordsToDelete": [ { "table": "MReportObject", "stamp": "..." }, ... ]
' }]
' Faz UPSERT por record e DELETE pelos recordsToDelete dentro de uma única
' transacção.
' =============================================================================

Dim querySanitized = Function(ByVal sqlExpression As String)
    Dim writeKeywords As String() = {"DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE"}
    For Each keyword As String In writeKeywords
        If sqlExpression.ToUpper().Contains(keyword) Then Return False
    Next
    Return True
End Function

Dim MapToDefaultValue = Function(ByVal value)
    Return CType(value, Newtonsoft.Json.Linq.JValue).Value
End Function

Dim geTableDBSchema = Function(ByVal sourceTable As String)
    Dim schemaQuery As String = $"SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{sourceTable}'"
    Dim schemaObjects As New List(Of Object)
    If Not querySanitized(schemaQuery) Then
        Throw New Exception("Query contains unsafe keywords.")
    End If
    Dim schemaTable As DataTable = cdata.getDataTable(schemaQuery)
    For Each row As DataRow In schemaTable.Rows
        schemaObjects.Add(New With {
            .ColumnName = row("COLUMN_NAME").ToString(),
            .DataType = row("DATA_TYPE").ToString()
        })
    Next
    Return schemaObjects
End Function

Dim ConvertJObjectToDataRowComparingDbSchema = Function(jObject As Newtonsoft.Json.Linq.JObject, tabTbSchema As List(Of Object)) As DataRow
    Dim table As New DataTable()
    For Each prop In jObject.Properties()
        Dim columnName As String = prop.Name
        Dim columnExists As Boolean = tabTbSchema.Any(Function(col) col.ColumnName = columnName)
        If Not table.Columns.Contains(prop.Name) AndAlso columnExists = True Then
            table.Columns.Add(prop.Name, GetType(String))
        End If
    Next
    Dim row As DataRow = table.NewRow()
    For Each prop In jObject.Properties()
        Dim columnName As String = prop.Name
        Dim columnExists As Boolean = tabTbSchema.Any(Function(col) col.ColumnName = columnName)
        If columnExists = True Then
            row(prop.Name) = prop.Value.ToString()
        End If
    Next
    Return row
End Function

Dim BuildDynamicInsertDatarowQueryWithoutParameters = Function(ByVal dataRow As DataRow, ByVal tableName As String, ByVal recordKey As String, ByVal id As String) As String
    Dim columns As New List(Of String)
    Dim values As New List(Of String)
    Dim updateSet As New List(Of String)

    For Each column As DataColumn In dataRow.Table.Columns
        columns.Add(column.ColumnName)
        Dim rawValue = dataRow(column.ColumnName)
        Dim safeSqlValue As String
        If IsDBNull(rawValue) Then
            safeSqlValue = "NULL"
        Else
            Dim sanitized As String = rawValue.ToString().Replace("'", "''")
            safeSqlValue = $"'{sanitized}'"
        End If
        values.Add(safeSqlValue)
        updateSet.Add($"{column.ColumnName} = {safeSqlValue}")
    Next

    Dim idSanitized = id.Replace("'", "''")
    Dim queryCheck = $"SELECT * FROM {tableName} WHERE {recordKey} = '{idSanitized}'"
    Dim result = cdata.getDatatable(queryCheck)
    Dim recordExists As Boolean = result.Rows.Count > 0

    Dim queryDynamic As String
    If recordExists Then
        queryDynamic = $"UPDATE {tableName} SET {String.Join(", ", updateSet)} WHERE {recordKey} = '{idSanitized}';"
    Else
        queryDynamic = $"INSERT INTO {tableName} ({String.Join(", ", columns)}) VALUES ({String.Join(", ", values)});"
    End If
    Return queryDynamic
End Function

' Tabelas permitidas para sync (whitelist defensiva)
Dim allowedTables As String() = {
    "u_mreport", "MReportTab", "MReportLayout", "MReportSection",
    "MReportObject", "MReportObjectDetail", "MReportValorDinamico",
    "MReportFilter", "MReportFonte"
}

Dim dynamicGlobalQuery As String = ""
Dim deleteQuery As String = ""

Try
    Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
    Dim payload As Newtonsoft.Json.Linq.JObject = Newtonsoft.Json.Linq.JArray.Parse(parametro)(0)
    Dim config As Newtonsoft.Json.Linq.JArray = payload("config")
    Dim recordsToDelete As Newtonsoft.Json.Linq.JArray = payload("recordsToDelete")

    ' DELETEs (na verdade são soft-deletes via UPDATE inactivo=1, mas aceitamos também hard-delete)
    If recordsToDelete IsNot Nothing Then
        For Each delRec As Newtonsoft.Json.Linq.JObject In recordsToDelete
            Dim delTable As String = MapToDefaultValue(delRec("table"))
            Dim delStamp As String = MapToDefaultValue(delRec("stamp"))
            Dim delKey As String = If(delRec("tableKey") IsNot Nothing, MapToDefaultValue(delRec("tableKey")), delTable.ToLower() & "stamp")

            If String.IsNullOrEmpty(delTable) OrElse String.IsNullOrEmpty(delStamp) Then Continue For
            If Not allowedTables.Contains(delTable) Then Throw New Exception("Tabela não permitida para sync: " & delTable)

            ' soft-delete preferencial
            deleteQuery += $"UPDATE {delTable} SET inactivo=1 WHERE {delKey}='{delStamp.Replace("'", "''")}';" & vbCrLf
        Next
    End If

    Using connection As SqlClient.SqlConnection = SqlHelp.GetNewConnection()
        connection.Open()
        Dim transaction As System.Data.SqlClient.SqlTransaction = connection.BeginTransaction()
        Try
            If config IsNot Nothing Then
                For Each jObject As Newtonsoft.Json.Linq.JObject In config
                    Dim tableName As String = MapToDefaultValue(jObject("sourceTable"))
                    Dim sourceKey As String = MapToDefaultValue(jObject("sourceKey"))

                    If Not allowedTables.Contains(tableName) Then
                        Throw New Exception("Tabela não permitida para sync: " & tableName)
                    End If

                    Dim tableSchema = geTableDBSchema(tableName)
                    Dim records As Newtonsoft.Json.Linq.JArray = jObject("records")

                    For Each record As Newtonsoft.Json.Linq.JObject In records
                        Dim recordRow As DataRow = ConvertJObjectToDataRowComparingDbSchema(record, tableSchema)
                        dynamicGlobalQuery += BuildDynamicInsertDatarowQueryWithoutParameters(recordRow, tableName, sourceKey, record(sourceKey).ToString()) & vbCrLf
                    Next
                Next
            End If

            If Not String.IsNullOrEmpty(deleteQuery) Then
                Using command As New System.Data.SqlClient.SqlCommand(deleteQuery, connection, transaction)
                    command.ExecuteNonQuery()
                End Using
            End If

            If Not String.IsNullOrEmpty(dynamicGlobalQuery) Then
                Using command As New System.Data.SqlClient.SqlCommand(dynamicGlobalQuery, connection, transaction)
                    command.ExecuteNonQuery()
                End Using
            End If

            transaction.Commit()
        Catch ex As Exception
            transaction.Rollback()
            Throw New Exception("Erro durante a transacção: " & ex.Message)
        End Try
    End Using

    Dim responseDTO = New With {.cod = "0000", .codDesc = "Success", .message = "Success"}
    mpage.Response.ContentType = "application/json"
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Catch ex As Exception
    mpage.Response.ContentType = "application/json"
    Dim responseDTO = New With {.cod = "0007", .codDesc = "Error", .message = ex.ToString()}
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))
Finally
    mpage.Response.End()
End Try
