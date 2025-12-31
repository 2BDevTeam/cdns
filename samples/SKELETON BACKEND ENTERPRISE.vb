

Try

    if CType(mpage, mainform).propmainformdataset Is Nothing then
        return false
    End If    

    if CType(mpage, mainform).propmainformdataset.tables(0).rows.count=0 then
    
        return false
    
    End If

    Dim myTable=CType(mpage, mainform).propmainformdataset.tables(0).rows(0)



Catch ex As Exception

     Xcutil.LogViewSource(mpage,ex.ToString())
    
End Try
