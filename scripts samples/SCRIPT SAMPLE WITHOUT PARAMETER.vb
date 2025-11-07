
Dim ExecuteQuery = Function(ByVal fQuery As String, ByVal fSqlParameters As List(Of System.Data.SqlClient.SqlParameter)) as DataTable

    Dim table As New DataTable

    Using connection as SqlClient.SqlConnection = SqlHelp.GetNewConnection()

        Using command As New SqlClient.SqlCommand(fQuery, connection)

            if(fSqlParameters IsNot Nothing)

                For Each sqlParameter As System.Data.SqlClient.SqlParameter in fSqlParameters

                    command.Parameters.Add(sqlParameter)

                Next

            end if

            Using adapter As New SqlClient.SqlDataAdapter(command)

                adapter.Fill(table)

            End Using

        End Using

    End Using

    return table

End Function


Dim responseDTO as new Object
Try

    Dim sqlParameters as new List(Of System.Data.SqlClient.SqlParameter)
    Dim query as String="
    
    SET ANSI_NULLS OFF
GO
 
SET QUOTED_IDENTIFIER ON
GO
 
 
CREATE TABLE [dbo].[u_mdash](
	[u_mdashstamp] [char](25) NOT NULL,
	[temfiltro] [bit] NOT NULL,
	[codigo] [varchar](250) NOT NULL,
	[descricao] [varchar](250) NOT NULL,
    [filtrohorizont] [bit] NOT  NULL,
	[categoria] [varchar](250) NOT NULL,
	[ousrinis] [varchar](30) NOT NULL,
	[ousrdata] [datetime] NOT NULL,
	[ousrhora] [varchar](8) NOT NULL,
	[usrinis] [varchar](30) NOT NULL,
	[usrdata] [datetime] NOT NULL,
	[usrhora] [varchar](8) NOT NULL,
	[marcada] [bit] NOT NULL,
CONSTRAINT [pk_u_mdash] PRIMARY KEY NONCLUSTERED 
(
	[u_mdashstamp] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [u_mdashstamp]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ((0)) FOR [temfiltro]
GO
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ((0)) FOR [filtrohorizont]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [codigo]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [descricao]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [categoria]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [ousrinis]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT (getdate()) FOR [ousrdata]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [ousrhora]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [usrinis]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT (getdate()) FOR [usrdata]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ('') FOR [usrhora]
GO
 
ALTER TABLE [dbo].[u_mdash] ADD  DEFAULT ((0)) FOR [marcada]
GO
    
     "
    Dim queryResult as DataTable= ExecuteQuery(query,sqlParameters) 

   responseDTO= New With {.cod ="0000" ,.codDesc="Success",.message="Success",.data=queryResult}
   mpage.Response.ContentType = "application/json"
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))
   
Catch ex as Exception
 ' XcUtil.LogViewSource(mpage,e.toString())

   mpage.Response.ContentType = "application/json"
   responseDTO= New With {.cod ="0007" ,.codDesc="Error",.message=ex.toString()}
   mpage.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(responseDTO))


Finally
    mpage.Response.End()
End Try