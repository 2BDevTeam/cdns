 Dim queryMdashFonte="select MdashFonte.* from MdashFonte join u_Mdash on u_Mdash.u_Mdashstamp=MdashFonte.Mdashstamp where u_Mdash.codigo=@codigo order by MdashFonte.ordem asc "
 Dim sqlParametersDashFonte as new List(Of System.Data.SqlClient.SqlParameter)
 sqlParametersDashFonte.add(new System.Data.SqlClient.SqlParameter("@codigo",requestDr("codigo")))
 Dim queryResultDashFonte as DataTable= ExecuteQuery(queryMdashFonte,sqlParametersDashFonte)