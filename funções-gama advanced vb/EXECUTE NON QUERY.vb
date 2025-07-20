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