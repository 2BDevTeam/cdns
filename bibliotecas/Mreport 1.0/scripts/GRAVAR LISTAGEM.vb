Dim querySanitized = Function(Byval sqlExpression as String )

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
      'throw new Exception("The input string contains a write keyword.")
    End If

    return true

End Function


Dim ExecuteQuery = Function(ByVal fQuery As String, ByVal fSqlParameters As List(Of System.Data.SqlClient.SqlParameter)) as DataTable

    Dim table As New DataTable

    Using connection as SqlClient.SqlConnection = SqlHelp.GetNewConnection()

        Using command As New SqlClient.SqlCommand(fQuery, connection)

            if(fSqlParameters IsNot Nothing)

                For Each sqlParameter As System.Data.SqlClient.SqlParameter in fSqlParameters

                    command.Parameters.Add(sqlParameter)

                Next

            end if

            Using adapter As New SqlClient.SqlDataAdapter(command)

                adapter.Fill(table)

            End Using

        End Using

    End Using

    return table

End Function

Dim ExecuteNonQuery = Function(ByVal fQuery As String, ByVal fSqlParameters As List(Of System.Data.SqlClient.SqlParameter)) as Integer
    Dim rowsAffected as Integer
    Using connection as SqlClient.SqlConnection = SqlHelp.GetNewConnection()
        connection.open()
		Using command As New SqlClient.SqlCommand(fQuery, connection)
            if(fSqlParameters IsNot Nothing)
                For Each sqlParameter As System.Data.SqlClient.SqlParameter in fSqlParameters
                    command.Parameters.Add(sqlParameter)
                Next
            end if
            rowsAffected = command.ExecuteNonQuery()
		End Using
	End Using
    return rowsAffected
End Function




Dim buildDynamicUpsertQuery=Function(Byval countPar as Integer,ByVal dataObject As Object, ByVal tableName As String, ByVal recordKey As String, ByVal id As String,ByVal  sqlParametersDynamic As  List(Of System.Data.SqlClient.SqlParameter))

   Dim propertyInfo = dataObject.GetType().GetProperties()
    Dim columns As New List(Of String)
    Dim values As New List(Of String)
    

    For Each prop In propertyInfo
        Dim paramName = "@" & prop.Name+countPar.toString()
        columns.Add(prop.Name)
        values.Add(paramName)
        sqlParametersDynamic.Add(New System.Data.SqlClient.SqlParameter(paramName, prop.GetValue(dataObject)))
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
        
        queryDynamic = $"UPDATE {tableName} SET {String.Join(", ", columns.Select(Function(c) $"{c} = @{c}{countPar.toString()}"))} WHERE {recordKey} = '{id}' "
    Else
        queryDynamic = $"INSERT INTO {tableName} ({String.Join(", ", columns)}) VALUES ({String.Join(", ", values)}) "
    End If

   

    return queryDynamic



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

        Dim valueToSet = "'" & dataRow(column.ColumnName).ToString().Replace("'", "''") & "'"
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


Dim GetTransactionQuery = Function(ByVal fQuery As String)
    Dim transactionQuery As String
    transactionQuery = " BEGIN TRANSACTION "
    transactionQuery += " BEGIN TRY "
    transactionQuery += fQuery
    transactionQuery += "END TRY "
    transactionQuery += "BEGIN CATCH "
    transactionQuery += "IF @@TRANCOUNT > 0  ROLLBACK TRANSACTION; THROW "
    transactionQuery += "END CATCH "
    transactionQuery += "IF @@TRANCOUNT > 0 COMMIT TRANSACTION "
    Return transactionQuery
   End Function
 Dim dynamicGlobalQuery as String=""
Try

   Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
  
  'Dim jsonObject As Newtonsoft.Json.Linq.JObject = Newtonsoft.Json.Linq.JObject.Parse(parametro)
     Dim listagem As Newtonsoft.Json.Linq.JArray = Newtonsoft.Json.Linq.JArray.Parse(parametro)

     Dim dadosListagem=listagem(0)
     Dim colunas=dadosListagem("colunas")
     Dim celulas=dadosListagem("celulas")
     Dim linhas=dadosListagem("linhas")
     Dim grupos=dadosListagem("grupos")
     Dim syncstamp as String=dadosListagem("syncstamp").toString()
     Dim sqlParametersDynamic as new List(Of System.Data.SqlClient.SqlParameter)
    

    
   Dim sqlParametersDelete as new List(Of System.Data.SqlClient.SqlParameter)
    Dim deleteCelula=""


    Dim globalCounter as Integer=0
   
    For Each celula As Newtonsoft.Json.Linq.JObject In celulas

     Dim celulaObj= New With {
        .u_celulastamp=celula("u_celulastamp").ToString(),
        .stamplinha=celula("stamplinha").ToString(),
        .stampcoluna=celula("stampcoluna").ToString(),
        .valordinamico=celula("valordinamico").ToString(),
        .valor=celula("valor").ToString(),
        .calculo=celula("calculo").ToString(),
        .tipocelula=celula("tipocelula").ToString()
     }

     Dim tableDBSchema = geTableDBSchema("u_celula")
     
     Dim recordRow As DataRow = ConvertJObjectToDataRowComparingDbSchema(celula,tableDBSchema)
     
     dynamicGlobalQuery+=BuildDynamicInsertDatarowQueryWithoutParameters(recordRow,"u_celula","u_celulastamp",celula("u_celulastamp").ToString())

     globalCounter+=1
    'dynamicUpsertWithTransaction(celulaObj,"u_celula","u_celulastamp",celula("u_celulastamp").ToString(),connection,transaction)    
    Next

    For Each grupo As Newtonsoft.Json.Linq.JObject In grupos
         Dim grupoObj= New With {
         .u_gruporelstamp=grupo("u_gruporelstamp").ToString(),
         .syncstamp=grupo("syncstamp").ToString(),
         .descricao=grupo("descricao").ToString(),
         .tipodado=grupo("tipodado").ToString(),
         .parent=grupo("parent").toString(),
         .noderef=grupo("noderef").ToString(),
         .ordem=grupo("ordem").ToString(),
         .temcalculo=grupo("temcalculo").ToString(),
         .temtotais=grupo("temtotais").ToString(),
         .colunastotais=grupo("colunastotais").ToString(),
         .expressaogrupo=grupo("expressaogrupo").ToString()
         }
       
         Dim tableDBSchema = geTableDBSchema("u_gruporel")
         Dim recordRow As DataRow = ConvertJObjectToDataRowComparingDbSchema(grupo,tableDBSchema)
         dynamicGlobalQuery+=BuildDynamicInsertDatarowQueryWithoutParameters(recordRow,"u_gruporel","u_gruporelstamp",grupo("u_gruporelstamp").ToString())
         globalCounter+=1
       'dynamicUpsertWithTransaction(grupoObj,"u_gruporel","u_gruporelstamp",grupo("u_gruporelstamp").ToString(),connection,transaction)


    Next

    For Each linha As Newtonsoft.Json.Linq.JObject In linhas

        Dim linhaObj= New With {
        .u_linhastamp=linha("u_linhastamp").ToString(),
        .syncstamp=linha("syncstamp").ToString(),
        .ordem=linha("ordem").ToString(),
        .temgrupo=linha("temgrupo").ToString(),
        .campoagrupamento=linha("campoagrupamento").ToString(),
        .expressao=linha("expressao").ToString(),
         .grupostamp=linha("grupostamp").ToString()
        }

      Dim tableDBSchema = geTableDBSchema("u_linha")
      Dim recordRow As DataRow = ConvertJObjectToDataRowComparingDbSchema(linha,tableDBSchema)
      dynamicGlobalQuery+=BuildDynamicInsertDatarowQueryWithoutParameters(recordRow,"u_linha","u_linhastamp",linha("u_linhastamp").ToString())
      globalCounter+=1
     'dynamicUpsertWithTransaction(linhaObj,"u_linha","u_linhastamp",linha("u_linhastamp").ToString(),connection,transaction)
    
    Next

    For Each coluna As Newtonsoft.Json.Linq.JObject In colunas

        Dim colunaObj= New With {
        .u_colunarelstamp=coluna("u_colunarelstamp").ToString(),
        .syncstamp=coluna("syncstamp").ToString(),
        .valor=coluna("valor").ToString(),
        .codigo=coluna("codigo").ToString(),
        .ordem=coluna("ordem").ToString()
        }

      Dim tableDBSchema = geTableDBSchema("u_colunarel")
      Dim recordRow As DataRow = ConvertJObjectToDataRowComparingDbSchema(coluna,tableDBSchema)
      dynamicGlobalQuery+=BuildDynamicInsertDatarowQueryWithoutParameters(recordRow,"u_colunarel","u_colunarelstamp",coluna("u_colunarelstamp").ToString())
      globalCounter+=1
   '  dynamicUpsertWithTransaction(colunaObj,"u_colunarel","u_colunarelstamp",coluna("u_colunarelstamp").ToString(),connection,transaction)
    Next
   	        dynamicGlobalQuery = GetTransactionQuery(dynamicGlobalQuery)
           ExecuteNonQuery(dynamicGlobalQuery,Nothing)
          'ExecuteNonQueryWithTransaction(dynamicGlobalQuery,connection,transaction,sqlParametersDynamic)
         ' transaction.Commit()
          
        '  Dim responseDTO= New With {.cod ="0000" ,.codDesc="Success",.message="Success",.parametro=dynamicGlobalQuery,.totalParametros=sqlParametersDynamic.count}
          Dim responseDTO= New With {.cod ="0000" ,.codDesc="Success",.message="Success",.dynamicGlobalQuery=dynamicGlobalQuery}
          mpage.Response.ContentType = "application/json"
          mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

       ' dynamicUpsert(naturezaRegisto,connection,transaction,"u_natureza")

Catch ex as Exception
 ' XcUtil.LogViewSource(mpage,e.toString())

   mpage.Response.ContentType = "application/json"
   Dim responseDTO= New With {.cod ="0007" ,.codDesc="Error",.message=ex.toString(),.dynamicGlobalQuery=dynamicGlobalQuery}
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))


Finally
    mpage.Response.End()
End Try