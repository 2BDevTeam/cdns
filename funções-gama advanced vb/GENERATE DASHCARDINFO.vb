 Dim GenerateDashCardInfo=Function (cardData As Object) As String
    Dim dashCard As New MDashCard(cardData)
    
    Dim cardHTML As String = ""
    
    cardHTML &= "<div id='mdash" & dashCard.Id & "' class='c-dashboardInfo " & dashCard.Classes & "' style='height: 100%!important;" & dashCard.Styles & "'>"
    cardHTML &= "  <div class='wrap c-dashboardInfo_" & dashCard.Tipo & "'>"
    cardHTML &= "    <h4 class='heading heading5 hind-font medium-font-weight c-dashboardInfo__title'>"
    cardHTML &= dashCard.Title
    If Not String.IsNullOrEmpty(dashCard.Icon) Then
        cardHTML &= " <i class='" & dashCard.Icon & "'></i>"
    End If
    cardHTML &= "    </h4>"
    
    If Not String.IsNullOrEmpty(dashCard.Header) Then
        cardHTML &= "    <div class='" & dashCard.HeaderClasses & "'>" & dashCard.Header & "</div>"
    End If
    
    cardHTML &= "    <div class='m-dash-card-body-content dashcard-body'>"
    cardHTML &= dashCard.BodyContent
    cardHTML &= "    </div>"
    
    If Not String.IsNullOrEmpty(dashCard.Footer) Then
        cardHTML &= "    <div class='dashcard-footer'>" & dashCard.Footer & "</div>"
    End If
    
    cardHTML &= "  </div>"
    cardHTML &= "</div>"
    
    Return cardHTML
End Function