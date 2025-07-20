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
