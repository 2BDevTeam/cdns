' =============================================================================
' ACTUALIZAR CONFIGURACAO MREPORT.vb  —  Mreport 2.0
' cscript: actualizaconfiguracaomrelatorio
'
' Wrapper "amigável" para o commit final. Recebe directamente o appState do
' designer (config, sections, tabs, layouts, objects, objectDetails,
' valoresDinamicos, filters, fontes, deleteBuffer) e converte para o shape
' esperado pelo REAL TIME COMPONENT SYNC, fazendo a transacção com soft-deletes.
'
' Recebe: [{
'   "relatoriostamp": "...",
'   "config": {...},
'   "sections": [...], "tabs": [...], "layouts": [...],
'   "objects": [...], "objectDetails": [...], "valoresDinamicos": [...],
'   "filters": [...], "fontes": [...],
'   "deleteBuffer": [ {table, stamp, tableKey} ]
' }]
' =============================================================================

Dim querySanitized = Function(ByVal sqlExpression As String)
    Dim writeKeywords As String() = {"DROP", "ALTER", "CREATE"}
    For Each keyword As String In writeKeywords
        If sqlExpression.ToUpper().Contains(keyword) Then Return False
    Next
    Return True
End Function

Dim MapToDefaultValue = Function(ByVal value)
    Return CType(value, Newtonsoft.Json.Linq.JValue).Value
End Function

Dim geTableDBSchema = Function(ByVal sourceTable As String)
    Dim schemaQuery As String = $"SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{sourceTable}'"
    Dim schemaObjects As New List(Of Object)
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
        If Not table.Columns.Contains(prop.Name) AndAlso columnExists Then
            table.Columns.Add(prop.Name, GetType(String))
        End If
    Next
    Dim row As DataRow = table.NewRow()
    For Each prop In jObject.Properties()
        Dim columnName As String = prop.Name
        Dim columnExists As Boolean = tabTbSchema.Any(Function(col) col.ColumnName = columnName)
        If columnExists Then
            ' Filtrar campos runtime que começam com _
            If Not columnName.StartsWith("_") Then
                row(prop.Name) = prop.Value.ToString()
            End If
        End If
    Next
    Return row
End Function

Dim BuildUpsert = Function(ByVal dataRow As DataRow, ByVal tableName As String, ByVal recordKey As String, ByVal id As String) As String
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
            safeSqlValue = $"'{rawValue.ToString().Replace("'", "''")}'"
        End If
        values.Add(safeSqlValue)
        updateSet.Add($"{column.ColumnName} = {safeSqlValue}")
    Next
    Dim idSanitized = id.Replace("'", "''")
    Dim queryCheck = $"SELECT * FROM {tableName} WHERE {recordKey} = '{idSanitized}'"
    Dim result = cdata.getDatatable(queryCheck)
    If result.Rows.Count > 0 Then
        Return $"UPDATE {tableName} SET {String.Join(", ", updateSet)} WHERE {recordKey} = '{idSanitized}';"
    Else
        Return $"INSERT INTO {tableName} ({String.Join(", ", columns)}) VALUES ({String.Join(", ", values)});"
    End If
End Function

' (table, key, jsonProperty)
Dim tableMappings As Object() = {
    New With {.tab = "u_mreport", .key = "u_mreportstamp", .prop = "config", .isArray = False},
    New With {.tab = "MReportTab", .key = "mreporttabstamp", .prop = "tabs", .isArray = True},
    New With {.tab = "MReportLayout", .key = "mreportlayoutstamp", .prop = "layouts", .isArray = True},
    New With {.tab = "MReportSection", .key = "mreportsectionstamp", .prop = "sections", .isArray = True},
    New With {.tab = "MReportObject", .key = "mreportobjectstamp", .prop = "objects", .isArray = True},
    New With {.tab = "MReportObjectDetail", .key = "mreportobjectdetailstamp", .prop = "objectDetails", .isArray = True},
    New With {.tab = "MReportValorDinamico", .key = "mreportvalordinamicostamp", .prop = "valoresDinamicos", .isArray = True},
    New With {.tab = "MReportFilter", .key = "mreportfilterstamp", .prop = "filters", .isArray = True},
    New With {.tab = "MReportFonte", .key = "mreportfonstestamp", .prop = "fontes", .isArray = True}
}

Try
    Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
    Dim payload As Newtonsoft.Json.Linq.JObject = Newtonsoft.Json.Linq.JArray.Parse(parametro)(0)

    Dim allUpserts As String = ""
    Dim allDeletes As String = ""

    For Each m In tableMappings
        Dim tabName As String = m.tab
        Dim keyName As String = m.key
        Dim propName As String = m.prop
        Dim isArray As Boolean = m.isArray
        Dim schema = geTableDBSchema(tabName)

        Dim node As Newtonsoft.Json.Linq.JToken = payload(propName)
        If node Is Nothing OrElse node.Type = Newtonsoft.Json.Linq.JTokenType.Null Then Continue For

        If isArray Then
            For Each rec As Newtonsoft.Json.Linq.JObject In CType(node, Newtonsoft.Json.Linq.JArray)
                If rec(keyName) Is Nothing Then Continue For
                Dim row As DataRow = ConvertJObjectToDataRowComparingDbSchema(rec, schema)
                allUpserts += BuildUpsert(row, tabName, keyName, rec(keyName).ToString()) & vbCrLf
            Next
        Else
            Dim recObj As Newtonsoft.Json.Linq.JObject = CType(node, Newtonsoft.Json.Linq.JObject)
            If recObj(keyName) IsNot Nothing AndAlso Not String.IsNullOrEmpty(recObj(keyName).ToString()) Then
                Dim row As DataRow = ConvertJObjectToDataRowComparingDbSchema(recObj, schema)
                allUpserts += BuildUpsert(row, tabName, keyName, recObj(keyName).ToString()) & vbCrLf
            End If
        End If
    Next

    ' Soft-deletes (deleteBuffer)
    Dim deleteBuffer As Newtonsoft.Json.Linq.JArray = payload("deleteBuffer")
    If deleteBuffer IsNot Nothing Then
        For Each delRec As Newtonsoft.Json.Linq.JObject In deleteBuffer
            Dim delTable As String = MapToDefaultValue(delRec("table"))
            Dim delStamp As String = MapToDefaultValue(delRec("stamp"))
            Dim delKey As String = If(delRec("tableKey") IsNot Nothing, MapToDefaultValue(delRec("tableKey")), delTable.ToLower() & "stamp")
            If String.IsNullOrEmpty(delTable) OrElse String.IsNullOrEmpty(delStamp) Then Continue For
            Dim allowed As Boolean = False
            For Each m In tableMappings
                If m.tab = delTable Then allowed = True : Exit For
            Next
            If Not allowed Then Throw New Exception("Tabela não permitida: " & delTable)
            allDeletes += $"UPDATE {delTable} SET inactivo=1 WHERE {delKey}='{delStamp.Replace("'", "''")}';" & vbCrLf
        Next
    End If

    Using connection As SqlClient.SqlConnection = SqlHelp.GetNewConnection()
        connection.Open()
        Dim transaction As System.Data.SqlClient.SqlTransaction = connection.BeginTransaction()
        Try
            If Not String.IsNullOrEmpty(allDeletes) Then
                Using command As New System.Data.SqlClient.SqlCommand(allDeletes, connection, transaction)
                    command.ExecuteNonQuery()
                End Using
            End If
            If Not String.IsNullOrEmpty(allUpserts) Then
                Using command As New System.Data.SqlClient.SqlCommand(allUpserts, connection, transaction)
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
