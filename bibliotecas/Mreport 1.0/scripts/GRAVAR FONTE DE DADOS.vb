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

Dim dynamicUpsertWithTransaction=Function(ByVal dataObject As Object, ByVal tableName As String, ByVal recordKey As String, ByVal id As String,ByVal connectionPar As SqlClient.SqlConnection,ByVal transactionPar As System.Data.SqlClient.SqlTransaction)
   Dim propertyInfo = dataObject.GetType().GetProperties()
    Dim columns As New List(Of String)
    Dim values As New List(Of String)
    Dim sqlParametersDynamic As New List(Of System.Data.SqlClient.SqlParameter)

    For Each prop In propertyInfo
        Dim paramName = "@" & prop.Name
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
        queryDynamic = $"UPDATE {tableName} SET {String.Join(", ", columns.Select(Function(c) $"{c} = @{c}"))} WHERE {recordKey} = '{id}'"
    Else
        queryDynamic = $"INSERT INTO {tableName} ({String.Join(", ", columns)}) VALUES ({String.Join(", ", values)})"
    End If
    
    ExecuteNonQueryWithTransaction(queryDynamic,connectionPar,transactionPar,sqlParametersDynamic)
End Function
Try

   Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
  
  'Dim jsonObject As Newtonsoft.Json.Linq.JObject = Newtonsoft.Json.Linq.JObject.Parse(parametro)
     Dim fontes As Newtonsoft.Json.Linq.JArray = Newtonsoft.Json.Linq.JArray.Parse(parametro)

    
   Using connection as SqlClient.SqlConnection = SqlHelp.GetNewConnection()
   
       connection.Open()
       Dim transaction As System.Data.SqlClient.SqlTransaction = connection.BeginTransaction()
    Try

    For Each fonte As Newtonsoft.Json.Linq.JObject In fontes

        Dim relFonteObj As Object = New With {
            .fontestamp = fonte("fonteId").ToString(),
            .u_relfontestamp = fonte("relFonteId").ToString(),
            .codigofonte = fonte("codigo").ToString()   ,
            .syncstamp = fonte("syncstamp").ToString()  
        }

        dim fonteObj as Object=New With {
            .basequery = fonte("basequery").ToString(),
            .filtro = fonte("filtro").ToString(),
            .codigo = fonte("codigo").ToString(),
            .u_fontedadosstamp = fonte("fonteId").ToString()
        }

    dynamicUpsertWithTransaction(relFonteObj,"u_relfonte","u_relfontestamp",fonte("relFonteId").ToString(),connection,transaction)
    dynamicUpsertWithTransaction(fonteObj,"u_fontedados","u_fontedadosstamp",fonte("fonteId").ToString(),connection,transaction)        
    Next
          
          transaction.Commit()
          
          Dim responseDTO= New With {.cod ="0000" ,.codDesc="Success",.message="Success",.parametro="parametro"}
          mpage.Response.ContentType = "application/json"
          mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

    Catch ex As Exception
        ' An error occurred, rollback the transaction
         transaction.Rollback()
       ' Console.WriteLine("Transaction rolled back: " + ex.Message)
         'XcUtil.LogViewSource(mpage,ex.toString())
         mpage.Response.ContentType = "application/json"
         Dim responseDTO= New With {.cod ="0007" ,.codDesc="Error",.message=ex.toString()}
         mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

    End Try
 End Using
       ' dynamicUpsert(naturezaRegisto,connection,transaction,"u_natureza")

  

Catch ex as Exception
 ' XcUtil.LogViewSource(mpage,e.toString())

   mpage.Response.ContentType = "application/json"
   Dim responseDTO= New With {.cod ="0007" ,.codDesc="Error",.message=ex.toString()}
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))


Finally
    mpage.Response.End()
End Try