Try

  Dim inputText As String = "u_consid='{{$('#consolid').val()}}' and u_name='{{$('#username').val()}}'"

  ' Define a regular expression pattern to match text within curly braces
  Dim pattern As String = "\{\{([^{}]+)\}\}"

  ' Create a regex object and find all matches in the input text
  Dim regex As New Regex(pattern)
  Dim matches As MatchCollection = regex.Matches(inputText)

    Dim variaveis As New List(Of Object)()
  ' Create an array to store the extracted text
  Dim extractedTextArray(matches.Count - 1) As String

  ' Iterate through the matches and store them in the array
  For i As Integer = 0 To matches.Count - 1
    extractedTextArray(i) = matches(i).Groups(1).Value

  Dim  variavel= New With {.nome=matches(i).Groups(1).Value,.original="{{" & matches(i).Groups(1).Value & "}}"}
    variaveis.Add(variavel)

  Next

  Dim responseDTO= New With {.cod ="0000" ,.codDesc="Success",.message="Success",.data=variaveis}
  mpage.Response.ContentType = "application/json"
  mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))

Catch ex as Exception
  
  mpage.Response.ContentType = "application/json"
  Dim responseDTO= New With {.cod ="0007" ,.codDesc="Error",.message=ex.toString()}
  mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))


  Finally
  mpage.Response.End()
End Try