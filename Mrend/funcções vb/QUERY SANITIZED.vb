 Dim querySanitized=Function(Byval sqlExpression as String )

    Dim writeKeywords As String() = {"DROP", "DELETE", "UPDATE", "INSERT", "ALTER","CREATE","TRUNCATE","EXEC","EXECUTE","GRANT","REVOKE","MERGE","CALL"}

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
