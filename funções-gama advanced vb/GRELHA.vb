Try
 If(Not CType(mpage, mainform).PropEstadoDoMainForm.tostring() = "Consultando")
        Return True
    End If
  
  
    Dim bimoeda as String
    bimoeda = mpage.Request.QueryString("bimoeda")
    If(Not bimoeda = "true")
        Return True
    End If
Dim isbimoedactivo as boolean
   Dim MyGrid as WebControlLib.NossoGrid = mpage.Master.findcontrol("conteudo").FindControl("GridFn")
  
   Dim ColunaParaRemover As Integer = -1
  For index As Integer = 0 To MyGrid.Columns.Count - 1
           'xcutil.logviewsource(mpage, index.tostring())
          'xcutil.logviewsource(mpage, MyGrid.Columns(index).HeaderText.tostring())
    if index=6 or index=11
     'MyGrid.Columns(index).visible=false
  end if 
    if MyGrid.Columns(index).HeaderText.tostring()="Pr.Unit.(USD)"
              isbimoedactivo=true
    end if
 Next
  
if isbimoedactivo
         return true
end if 
    
  Dim myCol as New BoundColumn()
    myCol.HeaderText = "Pr.Unit.(USD)"
    myCol.DataField = "pv"
    myCol.Visible = True
    myCol.DataFormatString = "{0:N2}"
    MyGrid.Columns.AddAt(7,myCol)

    myCol= New BoundColumn()
    myCol.HeaderText = "Total(USD)"
    myCol.DataField = "tiliquido"
    myCol.Visible = True
    myCol.DataFormatString = "{0:N2}"
    MyGrid.Columns.AddAt(12,myCol)

catch e as exception
    xcutil.logviewsource(mpage, e.tostring())
end try