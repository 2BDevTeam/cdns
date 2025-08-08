


  Dim GenerateCollapseHTML=Function(collapseData As Object) As String
    ' Start building up the collapse HTML string with the opening div
    Dim collapseHTML As String = "<div class='home-collapse' id='" & collapseData.id & "'>"

    ' Add the collapse header
    collapseHTML &= "<div class='home-collapse-header mainformcptitulo'>"
    collapseHTML &= "<span class='glyphicon glyphicon-triangle-right'>" & collapseData.title & "</span>"
    collapseHTML &= "<div class='row'><span class='collapse-content'>" & collapseData.headerContent & "</span></div>"
    collapseHTML &= "</div>"

    ' Add the collapse body with the provided content
    collapseHTML &= "<div class='home-collapse-body hidden'>"
    collapseHTML &= "<p>" & collapseData.body & "</p>"
    collapseHTML &= "</div>"

    ' Close the collapse div
    collapseHTML &= "</div>"

    Return collapseHTML
End Function