' ============================================================
' ACTUALIZAR MREPORT.vb
' Endpoint: actualizarmreportconfig
'
' Recebe: [{ syncstamp, config: [{ sourceTable, sourceKey, records: [...] }], recordsToDelete: [...] }]
' Upsert dinâmico comparando com o schema da BD para cada tabela de config do relatório.
' Padrão idêntico a ACTUALIZAR CONFIGURAÇÃO.vb (Mrend)
' ============================================================

Dim querySanitized = Function(ByVal sqlExpression As String)
    Dim writeKeywords As String() = {"DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE"}
    Dim containsKeyword As Boolean = False
    For Each keyword As String In writeKeywords
        If sqlExpression.ToUpper().Contains(keyword) Then
            containsKeyword = True
            Exit For
        End If
    Next
    If containsKeyword Then
        Return False
    End If
    Return True
End Function

Dim MapToDefaultValue = Function(ByVal value)
    Return CType(value, Newtonsoft.Json.Linq.JValue).Value
End Function

Dim geTableDBSchema = Function(ByVal sourceTable As String)
    Dim schemaQuery As String = $"SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{sourceTable}'"
    Dim isSanitized As Boolean = querySanitized(schemaQuery)
    Dim schemaObjects As New List(Of Object)

    If Not isSanitized Then
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
        Dim columnExistsOnTabSchema As Boolean = tabTbSchema.Any(Function(col) col.ColumnName = columnName)
        If Not table.Columns.Contains(prop.Name) AndAlso columnExistsOnTabSchema = True Then
            table.Columns.Add(prop.Name, GetType(String))
        End If
    Next
    Dim row As DataRow = table.NewRow()
    For Each prop In jObject.Properties()
        Dim columnName As String = prop.Name
        Dim columnExistsOnTbschm As Boolean = tabTbSchema.Any(Function(col) col.ColumnName = columnName)
        If columnExistsOnTbschm = True Then
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
        Dim isSanitized As Boolean = querySanitized(dataRow(column.ColumnName))
        If Not isSanitized Then
            Throw New Exception("A string de conexão contém uma keyword de escrita")
        End If
        Dim valueToSet = "'" & dataRow(column.ColumnName).ToString().Replace("'", "''") & "'"
        values.Add(valueToSet)
        updateSet.Add($"{column.ColumnName} = {valueToSet}")
    Next

    Dim queryCheck = $"SELECT * FROM {tableName} WHERE {recordKey} = '{id}'"
    Dim isSanitizedCheck As Boolean = querySanitized(queryCheck)
    If Not isSanitizedCheck Then
        Throw New Exception("A string de conexão contém uma keyword de escrita")
    End If

    Dim result = cdata.getDatatable(queryCheck)
    Dim recordExists As Boolean = result.Rows.Count > 0

    Dim queryDynamic As String
    If recordExists Then
        queryDynamic = $"UPDATE {tableName} SET {String.Join(", ", updateSet)} WHERE {recordKey} = '{id}';"
    Else
        queryDynamic = $"INSERT INTO {tableName} ({String.Join(", ", columns)}) VALUES ({String.Join(", ", values)});"
    End If

    Return queryDynamic
End Function

' ---- Main execution ----

Dim dynamicGlobalQuery = ""
Dim deleteConfigQuery = ""

Try
    Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
    Dim payload As Newtonsoft.Json.Linq.JArray = Newtonsoft.Json.Linq.JArray.Parse(parametro)

    Dim syncstamp = MapToDefaultValue(payload(0)("syncstamp"))
    Dim config As Newtonsoft.Json.Linq.JArray = payload(0)("config")

    Dim recordsToDelete As Newtonsoft.Json.Linq.JArray = Nothing
    If payload(0)("recordsToDelete") IsNot Nothing Then
        recordsToDelete = CType(payload(0)("recordsToDelete"), Newtonsoft.Json.Linq.JArray)
    End If

    Using connection As SqlClient.SqlConnection = SqlHelp.GetNewConnection()
        connection.Open()
        Dim transaction As System.Data.SqlClient.SqlTransaction = connection.BeginTransaction()

        Try
            ' Upsert each config table
            For Each jObject As Newtonsoft.Json.Linq.JObject In config
                Dim tableName As String = MapToDefaultValue(jObject("sourceTable"))
                Dim sourceKey As String = MapToDefaultValue(jObject("sourceKey"))
                Dim tableDBSchema = geTableDBSchema(tableName)
                Dim records As Newtonsoft.Json.Linq.JArray = jObject("records")

                For Each record As Newtonsoft.Json.Linq.JObject In records
                    Dim recordRow As DataRow = ConvertJObjectToDataRowComparingDbSchema(record, tableDBSchema)
                    dynamicGlobalQuery += BuildDynamicInsertDatarowQueryWithoutParameters(recordRow, tableName, sourceKey, record(sourceKey).ToString()) & vbCrLf
                Next
            Next

            ' Execute upsert queries
            If Not String.IsNullOrEmpty(dynamicGlobalQuery) Then
                Dim sqlParametersDynamic As New List(Of System.Data.SqlClient.SqlParameter)
                Using command As New System.Data.SqlClient.SqlCommand(dynamicGlobalQuery, connection, transaction)
                    command.ExecuteNonQuery()
                End Using
            End If

            ' Process recordsToDelete (optional)
            If recordsToDelete IsNot Nothing AndAlso recordsToDelete.Count > 0 Then
                For Each deleteRecord As Newtonsoft.Json.Linq.JObject In recordsToDelete
                    Dim deleteTable As String = MapToDefaultValue(deleteRecord("table"))
                    Dim deleteStamp As String = MapToDefaultValue(deleteRecord("stamp"))
                    Dim deleteTableKey As String = MapToDefaultValue(deleteRecord("tableKey"))
                    Dim deleteQuery As String = $"DELETE FROM {deleteTable} WHERE {deleteTableKey} = '{deleteStamp}'"
                    Dim isSanitizedDelete As Boolean = querySanitized(deleteQuery)
                    If Not isSanitizedDelete Then
                        Throw New Exception("Delete query contains unsafe keywords.")
                    End If
                    deleteConfigQuery += deleteQuery & vbCrLf
                Next

                If Not String.IsNullOrEmpty(deleteConfigQuery) Then
                    Using deleteCommand As New System.Data.SqlClient.SqlCommand(deleteConfigQuery, connection, transaction)
                        deleteCommand.ExecuteNonQuery()
                    End Using
                End If
            End If

            transaction.Commit()

        Catch ex As Exception
            transaction.Rollback()
            Throw New Exception("Error during transaction: " & ex.Message)
        End Try
    End Using

    mpage.Response.ContentType = "application/json"
    Dim responseDTO = New With {.cod = "0000", .codDesc = "Success", .message = "Success"}
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Catch ex As Exception
    mpage.Response.ContentType = "application/json"
    Dim responseDTO = New With {.cod = "0007", .codDesc = "Error", .message = ex.ToString(), .query = dynamicGlobalQuery}
    mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Finally
    mpage.Response.End()
End Try
