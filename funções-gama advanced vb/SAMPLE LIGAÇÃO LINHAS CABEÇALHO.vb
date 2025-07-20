
Try

    Dim cabecalho as DataRow=mainformdataset.tables(0).rows(0)
  '  Dim linha as DataTable=mainformdataset.tables(1)
    Dim linhas as DataTable=mainformdataset.tables(1)

   

     For Each row As DataRow In linhas.Rows
              If row.RowState <> DataRowState.Deleted Then
                row("[stampcabecalho]")=cabecalho("[stampcabecalho]")
              End If
     Next

    return true

Catch e as Exception
  XcUtil.LogViewSource(mpage,e.toString())
  return false
End try