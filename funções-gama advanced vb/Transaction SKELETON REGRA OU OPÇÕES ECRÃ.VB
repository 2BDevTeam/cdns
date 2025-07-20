
    Try
        
     
     Using connection as SqlClient.SqlConnection = SqlHelp.GetNewConnection()
         connection.Open()

        ' Start a new transaction
        Dim transaction As System.Data.SqlClient.SqlTransaction = connection.BeginTransaction()
        
      Try
     

        transaction.Commit()
        return true


       Catch ex As Exception

         transaction.Rollback()

         XcUtil.alerta(mpage,$"Erro ao gravar dados",3,15000)
         XcUtil.LogViewSource(mpage,ex.toString())
         return false
       End Try
   End Using

      return true
Catch e as Exception
      XcUtil.LogViewSource(mpage,e.toString())
       return false
End try