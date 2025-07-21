

Try

    Dim sqlParameters as new List(Of System.Data.SqlClient.SqlParameter)
    Dim query as String=" Select top 5 *from bo "
    Dim queryResult as DataTable= ExecuteQuery(query,sqlParameters) 

   Dim baseUrl as String=getAppBaseUrl(mpage)
   Dim responseDTO= New With {.cod ="0000" ,.codDesc="Success",.message="Success",.data=baseUrl}
   mpage.Response.ContentType = "application/json"
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))
   
Catch ex as Exception
 ' XcUtil.LogViewSource(mpage,e.toString())

   mpage.Response.ContentType = "application/json"
   Dim responseDTO= New With {.cod ="0007" ,.codDesc="Error",.message=ex.toString()}
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))


Finally
    mpage.Response.End()
End Try