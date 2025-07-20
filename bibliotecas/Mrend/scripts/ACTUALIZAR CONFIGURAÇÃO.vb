Dim querySanitized=Function(Byval sqlExpression as String )

    Dim writeKeywords As String() = {"DROP", "DELETE", "UPDATE", "INSERT", "ALTER","CREATE"}

    Dim containsKeyword As Boolean = False

    For Each keyword As String In writeKeywords
        If sqlExpression.ToUpper().Contains(keyword) Then
            containsKeyword = True
            Exit For ' Exit the loop once a keyword is found
        End If
    Next

    If containsKeyword Then
       return false
    End If

    return true

End Function

Dim MapToDefaultValue=Function(ByVal value)


  return CType(value, Newtonsoft.Json.Linq.JValue).Value
End Function




Dim BuildDynamicInsertDatarowQueryWithoutParameters=Function(ByVal dataRow As DataRow, ByVal tableName As String, ByVal recordKey As String, ByVal id As String) As String

    Dim columns As New List(Of String)
    Dim values As New List(Of String)
    Dim updateSet As New List(Of String)

    For Each column As DataColumn In dataRow.Table.Columns
        columns.Add(column.ColumnName)
        Dim isSanitized As Boolean = querySanitized(dataRow(column.ColumnName))

        If Not isSanitized Then
            Throw New Exception("A string de conexão contém uma keyword de escrita")
        End If

        Dim valueToSet = "'" & dataRow(column.ColumnName).ToString() & "'"
        values.Add(valueToSet)
        updateSet.Add($"{column.ColumnName} = {valueToSet}")
    Next

    Dim recordExists As Boolean = False
    Dim queryCheck = $"SELECT * FROM {tableName} WHERE {recordKey} = '{id}'"
    Dim isSanitizedCheck As Boolean = querySanitized(queryCheck)

    If Not isSanitizedCheck Then
        Throw New Exception("A string de conexão contém uma keyword de escrita")
    End If

    Dim result = cdata.getDatatable(queryCheck)
    If result.Rows.Count > 0 Then
        recordExists = True
    End If

    Dim queryDynamic As String
    If recordExists=True Then
        queryDynamic = $"UPDATE {tableName} SET {String.Join(", ", updateSet)} WHERE {recordKey} = '{id}';"
    Else
    queryDynamic = $"INSERT INTO {tableName} ({String.Join(", ", columns)}) VALUES ({String.Join(", ", values)});"
    End If

    Return queryDynamic

End Function




Dim geTableDBSchema=Function(Byval sourceTable as String)
          
      Dim schemaQuery As String = $"SELECT COLUMN_NAME, DATA_TYPE,COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{sourceTable}'"
      Dim sourceDataTable As New DataTable(sourceTable)
      Dim isSanitized As Boolean = querySanitized(schemaQuery)
      Dim schemaObjects as new List(Of Object)

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
      return schemaObjects

End Function 

Dim ConvertJObjectToDataRow=Function(jObject As Newtonsoft.Json.Linq.JObject) As DataRow
        
        Dim table As New DataTable()
        For Each prop In jObject.Properties()
            If Not table.Columns.Contains(prop.Name) Then
                table.Columns.Add(prop.Name, GetType(String)) ' Adjust type as needed
            End If
        Next

        ' Create a new DataRow and populate it with JObject values
        Dim row As DataRow = table.NewRow()
        For Each prop In jObject.Properties()
            row(prop.Name) = prop.Value.ToString()
        Next

        Return row
End Function


Dim ConvertJObjectToDataRowComparingDbSchema=Function(jObject As Newtonsoft.Json.Linq.JObject,tabTbSchema as  List(Of Object)) As DataRow
        
        Dim table As New DataTable()

        For Each prop In jObject.Properties()
           Dim columnName As String = prop.Name
            Dim columnExistsOnTabSchema As Boolean = tabTbSchema.Any(Function(col) col.ColumnName = columnName)

            If Not table.Columns.Contains(prop.Name) and columnExistsOnTabSchema=true Then
                table.Columns.Add(prop.Name, GetType(String)) ' Adjust type as needed
            End If
        Next

        ' Create a new DataRow and populate it with JObject values
        Dim row As DataRow = table.NewRow()
        For Each prop In jObject.Properties()
            
            Dim columnName As String = prop.Name
            Dim columnExistsOnTbschm As Boolean = tabTbSchema.Any(Function(col) col.ColumnName = columnName)
            If columnExistsOnTbschm=true Then
                row(prop.Name) = prop.Value.ToString()
            End If
        Next

        Return row
End Function

Dim ExecuteNonQueryWithTransaction=Function(ByVal queryPar As String, ByVal connectionPar As SqlClient.SqlConnection,ByVal transactionPar As System.Data.SqlClient.SqlTransaction,ByVal sqlParametersPar As List(Of System.Data.SqlClient.SqlParameter))
    Using command As New SqlClient.SqlCommand(queryPar, connectionPar, transactionPar)
        If sqlParametersPar IsNot Nothing Then
            For Each sqlParameter As System.Data.SqlClient.SqlParameter In sqlParametersPar
                command.Parameters.Add(sqlParameter)
            Next
        End If
        
        command.ExecuteNonQuery()
    End Using
End Function

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

    XcUtil.LogViewSource(mpage,queryDynamic)
    
    ExecuteNonQueryWithTransaction(queryDynamic,connectionPar,transactionPar,sqlParametersDynamic)
End Function



 Dim dynamicGlobalQuery=""
 Dim deleteConfiguracaQuery=""

Try

   Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
   Dim result as new Object
   Dim relatoriostamp= MapToDefaultValue(Newtonsoft.Json.Linq.JArray.Parse(parametro)(0)("relatoriostamp"))
   Dim config As Newtonsoft.Json.Linq.JArray = Newtonsoft.Json.Linq.JArray.Parse(parametro)(0)("config")

 Using connection as SqlClient.SqlConnection = SqlHelp.GetNewConnection()
   
    connection.Open()
    Dim transaction As System.Data.SqlClient.SqlTransaction = connection.BeginTransaction()

    Try
        
        For Each jObject As Newtonsoft.Json.Linq.JObject In config
            Dim tableName As String = MapToDefaultValue(jObject("sourceTable"))
            Dim sourceKey As String = MapToDefaultValue(jObject("sourceKey"))
            Dim tableDBSchema = geTableDBSchema(MapToDefaultValue(jObject("sourceTable")))

            Dim records As Newtonsoft.Json.Linq.JArray = jObject("records")

            For Each record As Newtonsoft.Json.Linq.JObject In records

               Dim recordRow As DataRow = ConvertJObjectToDataRowComparingDbSchema(record,tableDBSchema)
               

                dynamicGlobalQuery+= BuildDynamicInsertDatarowQueryWithoutParameters(recordRow, tableName, sourceKey, record(sourceKey).ToString()) & vbCrLf


            Next



        Next

        'Dim sqlParametersDlt as new List(Of System.Data.SqlClient.SqlParameter)
        'Using command As New System.Data.SqlClient.SqlCommand(deleteConfiguracaQuery, connection, transaction)
        '    If sqlParametersDlt IsNot Nothing Then
        '        For Each sqlParameter As System.Data.SqlClient.SqlParameter In sqlParametersDlt
        '            command.Parameters.Add(sqlParameter)
        '        Next
        '    End If
        '    command.ExecuteNonQuery()
        'End Using

        Dim sqlParametersDynamic as new List(Of System.Data.SqlClient.SqlParameter)

        Using command As New System.Data.SqlClient.SqlCommand(dynamicGlobalQuery, connection, transaction)
            If sqlParametersDynamic IsNot Nothing Then
                For Each sqlParameter As System.Data.SqlClient.SqlParameter In sqlParametersDynamic
                    command.Parameters.Add(sqlParameter)
                Next
            End If
            command.ExecuteNonQuery()
        End Using

        transaction.Commit()

    Catch ex As Exception
        transaction.Rollback()

        throw new Exception("Error during transaction: " & ex.Message)
    End Try
 End Using

   Dim responseDTO= New With {.cod ="0000" ,.codDesc="Success",.message="Success"}
   mpage.Response.ContentType = "application/json"
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Catch ex as Exception

   mpage.Response.ContentType = "application/json"
   Dim responseDTO= New With {.cod ="0007" ,.codDesc="Error",.message=ex.toString()}
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))


Finally
    mpage.Response.End()
End Try