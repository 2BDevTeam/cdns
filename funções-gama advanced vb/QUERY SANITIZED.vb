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
      'throw new Exception("The input string contains a write keyword.")
    End If

    return true
    
End Function
