
Try

   Dim parametro As String = System.Web.HttpContext.Current.Request.Form("__EVENTARGUMENT")
   Dim requestDr As DataRow = JsonConvert.DeserializeObject(Of DataTable)(parametro).rows(0)
 
   Dim sqlParameters as new List(Of System.Data.SqlClient.SqlParameter)
   Dim query as String="select *from bo where year(dataobra)=@ano"
   sqlParameters.add(new System.Data.SqlClient.SqlParameter("@ano",requestDr("ano")))
   Dim queryResult as DataTable= ExecuteQuery(query,sqlParameters) 

   Dim responseDTO= New With {.cod ="0000" ,.codDesc="Success",.message="Success",.data=queryResult}
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