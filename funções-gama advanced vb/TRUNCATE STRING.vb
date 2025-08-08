Dim truncateString = Function(ByVal inputString As Object, ByVal maxLength As Integer) As String
    If inputString Is Nothing OrElse IsDBNull(inputString) Then
        Return ""
    End If
    
    Dim stringValue As String = inputString.ToString()
    
    If stringValue.Length <= maxLength Then
        Return stringValue
    Else
        Return stringValue.Substring(0, maxLength)
    End If
End Function