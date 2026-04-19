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

Try

    Dim jsonData As String = mpage.Request.Form("registoJson")
    
    Dim doc =mainformdataset.tables(0).rows(0)
   
    
    Dim jArray As Newtonsoft.Json.Linq.JArray = Newtonsoft.Json.Linq.JArray.Parse(jsonData)
      Dim cabecalhoRegisto as DataRow=mainformdataset.tables(0).rows(0)

      if cabecalhoRegisto("ndos")<>43
        return true
      End if
      Xcutil.LogViewSource(mpage,"Bostamp do registo a gravar 4333: " &jsonData)


    

Using connection as SqlClient.SqlConnection = SqlHelp.GetNewConnection()
    connection.Open()

    ' Start a new transaction
    Dim transaction As System.Data.SqlClient.SqlTransaction = connection.BeginTransaction()
    Try

       Dim sqlParameters as new List(Of System.Data.SqlClient.SqlParameter)
        Dim query as String="
        DELETE FROM bi where bostamp=@bostamp;
        DELETE FROM bi2 where bostamp=@bostamp
        DELETE FROM u_avcrit where bostamp=@bostamp

        "
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@bostamp",cabecalhoRegisto("bostamp")))

        Using command As New System.Data.SqlClient.SqlCommand(query, connection, transaction)
            If sqlParameters IsNot Nothing Then
                For Each sqlParameter As System.Data.SqlClient.SqlParameter In sqlParameters
                    command.Parameters.Add(sqlParameter)
                Next
            End If
            command.ExecuteNonQuery()
        End Using

    
      Dim mappedSourceTables As new List(Of String)()


      For Each inst As Newtonsoft.Json.Linq.JObject In jArray

        Dim instanceData =inst("data")

        'Xcutil.LogViewSource(mpage,"Dados da instância: " & instanceData.ToString())

        For Each jObject As Newtonsoft.Json.Linq.JObject In instanceData

             Dim sourceTable As String = jObject("sourceTable").ToString()
             Dim sourceKey As String = jObject("sourceKey").ToString()
             Dim linhasRegisto as DataTable=mainformdataset.tables(sourceTable)
             
             If Not mappedSourceTables.Contains(sourceTable) Then
             
             
                 linhasRegisto.Clear()
             
             End If

              If  mappedSourceTables.Contains(sourceTable) Then
             
             
             
             End If
             mappedSourceTables.Add(sourceTable)



             Dim records= jObject("records")

             For Each record As Newtonsoft.Json.Linq.JObject In records

            Dim newRow As DataRow = linhasRegisto.NewRow()

                 If newRow.Table.Columns.Contains("bostamp1") Then
      'Remove the column
      newRow.Table.Columns.Remove("bostamp1")
    End If

    If newRow.Table.Columns.Contains("ousrdata1") Then
      'Remove the column
      newRow.Table.Columns.Remove("ousrdata1")
    End If

    If newRow.Table.Columns.Contains("ousrhora1") Then
      'Remove the column
      newRow.Table.Columns.Remove("ousrhora1")
    End If

    If newRow.Table.Columns.Contains("data") Then
      'Remove the column
      newRow.Table.Columns.Remove("data")
    End If


    If newRow.Table.Columns.Contains("usrinis1") Then
      'Remove the column
      newRow.Table.Columns.Remove("usrinis1")
    End If

    If newRow.Table.Columns.Contains("usrdata1") Then
      'Remove the column
      newRow.Table.Columns.Remove("usrdata1")
    End If

    If newRow.Table.Columns.Contains("usrhora1") Then
      'Remove the column
      newRow.Table.Columns.Remove("usrhora1")
    End If

    If newRow.Table.Columns.Contains("marcada1") Then
      'Remove the column
      newRow.Table.Columns.Remove("marcada1")
    End If

    If newRow.Table.Columns.Contains("ousrinis1") Then
      'Remove the column
      newRow.Table.Columns.Remove("ousrinis1")
    End If
             
                For Each prop As Newtonsoft.Json.Linq.JProperty In record.Properties()
                    
                    if newRow.Table.Columns.Contains(prop.Name) Then
                        newRow(prop.Name) = prop.Value
                    End If

                   ' if newRow.Table.Columns.Contains("bostamp") Then

                        'Xcutil.LogViewSource(mpage,"Valor do bostamp no registo a gravar: " & cabecalhoRegisto("bostamp").ToString())
                        newRow("bostamp") = cabecalhoRegisto("bostamp")
                     
                    
                        'newRow(sourceKey)=xcfox.u_stamp()

                    'End If


                Next
           
             linhasRegisto.Rows.Add(newRow)
             Next

        
        Next
        
    
     Next 

      
   Dim totalAv=mainformdataset.tables("u_avcrit").rows.count()
    XcUtil.LogViewSource(mpage,$"AVALIACOES {totalAv}")
    transaction.Commit()

    return true


  Catch ex As Exception
        ' An error occurred, rollback the transaction
        transaction.Rollback()
       ' Console.WriteLine("Transaction rolled back: " + ex.Message)
         XcUtil.LogViewSource(mpage,ex.toString())
         return false
    End Try
End Using




Catch e as Exception
      XcUtil.LogViewSource(mpage,e.toString())
      return false
 End try