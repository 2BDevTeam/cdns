
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
