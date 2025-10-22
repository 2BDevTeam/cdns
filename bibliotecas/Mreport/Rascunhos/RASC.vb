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

    Dim httpApiResponse as Object
    Dim responseObject as Object

    Try

        Dim parameters as Object
        parameters = Newtonsoft.Json.JsonConvert.DeserializeObject(Of Object)(mpage.Request.Form("parameters"))

        Dim datai as Date
        datai = Date.ParseExact(parameters("datai"), "dd.MM.yyyy", Nothing)
        
        Dim dataf as Date
        dataf = Date.ParseExact(parameters("dataf"), "dd.MM.yyyy", Nothing)

        Dim anos as Object
        anos = parameters("anos")

        Dim agrupamentos as Object
        agrupamentos = parameters("agrupamentos")

        Dim projectos as Object
        projectos = parameters("projectos")

        Dim agentesImplementadores as object
        agentesImplementadores = parameters("agentesImplementadores")


        Dim dias as Integer
        dias = DateDiff(DateInterval.Day, datai, dataf)

        Dim periodo as String
        Dim periodoDeDatas as String

        Dim agruparPorAnos as Boolean
        Dim incluirEmpresa as Boolean
        Dim temProjectos as Boolean





        periodoDeDatas = datai.ToString("dd.MM.yyyy") + " - " + dataf.ToString("dd.MM.yyyy")

        If(agruparPorAnos)
            If(anos.Count > 0)
                For j As Integer = 0 To anos.Count - 1
                    periodo += anos(j).ToString()
                    If (j < anos.Count - 1) Then
                        periodo += ", "
                    End If
                Next
            Else
                periodo = periodoDeDatas
            End If
        Else
            periodo = periodoDeDatas
        End If

        Dim periodoGroup as String

        If(agruparPorAnos)
            periodoGroup = "year(data)"
        Else
            If(dias > 14)
                periodoGroup = "format(data, 'yyyy.MM')"
            Else
                periodoGroup = "format(data, 'dd.MM')"
            End If
        End If

        If(projectos.Count > 0)
            temProjectos = True
        End If

        Dim query as String
        Dim sqlParameters as new List(Of System.Data.SqlClient.SqlParameter)
        Dim paramName as String
        Dim results as DataTable

        Dim ndosOrcamento as Integer
        ndosOrcamento = 61

        Dim ndosGasto as Integer
        ndosGasto = 62

        Dim dashboardData as New List(Of Object)

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query = "Set LANGUAGE Portuguese"
        query += " select total =CONCAT(FORMAT(sum(ettdeb), 'N', 'pt-MZ'), ' MT'),mes =DATENAME(MONTH, GETDATE()),"
        query += " gasto =(select CONCAT(FORMAT(sum(etotaldeb), 'N', 'pt-MZ'), ' MT') from bo "
        query += " inner join bo2 on bo.bostamp =bo2.bo2stamp where bo.ndos =38 and  bo.dataobra between @datai and @dataf "
        
        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
                    query += "and bo.fref in ("
                    For k As Integer = 0 To agrupamentos.Count - 1
                        paramName = String.Format("@grupo_{0}", k)
                        query += paramName
                        If (k < agrupamentos.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
                    Next
                    query += ") "
                End If
        query +=" ) "
        query += " ,op=(select CONCAT(FORMAT(sum(fo.etotal), 'N', 'pt-MZ'), ' MT') from fo inner join fo2 on fo2.fo2stamp =fo.fostamp "
        query += " inner join bo on bo.bostamp =fo2.u_contrato inner join bo2 on bo2.bo2stamp =bo.bostamp "
        query += " where  fo.data between @datai and @dataf "
 
        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente3_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
                    query += "and bo.fref in ("
                    For k As Integer = 0 To agrupamentos.Count - 1
                        paramName = String.Format("@grupo1_{0}", k)
                        query += paramName
                        If (k < agrupamentos.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
                    Next
                    query += ") "
                End If
        query += " )"
        query += " from bi inner join bi2 on bi.bistamp = bi2.bi2stamp  where ndos =60 and dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bi2.u_respons in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente2_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
                    query += "and bi.bifref in ("
                    For k As Integer = 0 To agrupamentos.Count - 1
                        paramName = String.Format("@grupo2_{0}", k)
                        query += paramName
                        If (k < agrupamentos.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
                    Next
                    query += ") "
                End If
        query += "Set LANGUAGE English"


        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)

        dashboardData.add(New With {
            .titulo = "Orcamento Anual",
            .data = results.Rows(0).Item("total"),
            .mes = results.Rows(0).Item("mes"),
            .gasto = results.Rows(0).Item("gasto"),
            .op =results.Rows(0).Item("op")
        })



        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        'Agora usamos esta string na query1
        query = "Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp =bo2.bo2stamp " 
        query += " where ndos =38 and bo.dataobra between @datai and @dataf  " 
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If

        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)

        dashboardData.add(New With {
            .titulo = "Total de Processos",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)


        query = " Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp "
        query +="  where ndos =38 and BO2.U_CVISADO=''  "  
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)

        dashboardData.add(New With {
            .titulo = "Em Processo",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +=" where ndos =38 and  BO2.U_ENVIOTA= '19000101' and BO2.U_CVISADO='' "
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += " and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If
        

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "Secretario Permanente",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " & _
        " where ndos =38 and BO2.U_ENVIOTA != '19000101'  and BO2.U_CVISADO='' " & _
        " and bo.dataobra between @datai and @dataf "
        
        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "Tribunal Administrativo",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " & _
        " where ndos =38 and BO2.U_ENVIOPGR != '19000101' and BO2.U_CVISADO=''  " & _
        " and bo.dataobra between @datai and @dataf "


        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente1_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo1_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "Procuradoria Geral R.",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +=" where bo.ndos =38 and BO2.U_CVISADO !='' "
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += " and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If
        

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "Processo Finalizados",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +=" where bo.ndos =38 and BO2.U_CVISADO !='' and getdate() between BO.DATAOPEN and BO.DATAFINAL "
        query +=" and bo.dataobra between @datai and @dataf "
        
        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "Dentro do Prazo",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +=" where bo.ndos =38 and BO2.U_CVISADO ='ANOTADO' and getdate() between BO.DATAOPEN and BO.DATAFINAL "
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "DP Anotado",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +=" where bo.ndos =38 and BO2.U_CVISADO ='VISADO' and getdate() between BO.DATAOPEN and BO.DATAFINAL "
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "DP Visado",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +="    where bo.ndos =38 and BO2.U_CVISADO !='' and Datediff(day,getdate(),bo.datafinal) <=90 and  Datediff(day,getdate(),bo.datafinal) >=0 "
        query +=" and bo.dataobra between @datai and @dataf "
        
        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "Prestes a Expirar",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +="    where bo.ndos =38 and BO2.U_CVISADO ='ANOTADO' and Datediff(day,getdate(),bo.datafinal) <=90 and  Datediff(day,getdate(),bo.datafinal) >=0 "
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If

       
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "PE Anotado",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +="    where bo.ndos =38 and BO2.U_CVISADO ='VISADO' and Datediff(day,getdate(),bo.datafinal) <=90 and  Datediff(day,getdate(),bo.datafinal) >=0 "
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "PE Visado",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +=" where bo.ndos =38 and BO2.U_CVISADO !='' and getdate() > bo.datafinal "
        query +=" and bo.dataobra between @datai and @dataf "
        
        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "Expirados",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +=" where bo.ndos =38 and BO2.U_CVISADO ='ANOTADO' and getdate() > bo.datafinal "
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If
		
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "EX Anotado",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +=" where bo.ndos =38 and BO2.U_CVISADO='VISADO' and getdate() > bo.datafinal "
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If
		
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "EX Visado",
            .data = results.Rows(0).Item("total")
        })



        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query= " Select Tipo=BO.U_TIPOCONT, Total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp "
        query += " where bo.ndos =38 and bo.dataobra between  @datai and @dataf "
        query +=" and U_TIPOCONT not in ('Ajudas de Custo','Concurso Pub','') "

        If(agentesImplementadores.Count > 0)
        
            query += " and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente1_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
                    query += "and bo.fref in ("
                    For k As Integer = 0 To agrupamentos.Count - 1
                        paramName = String.Format("@grupo_{0}", k)
                        query += paramName
                        If (k < agrupamentos.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
                    Next
                    query += ") "
                End If

        query += " group by BO.U_TIPOCONT "

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)

        dashboardData.add(New With {
            .titulo = "Contratos Por Tipo",
            .data = results
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query = "select U_TIPOCONT, max(Em_processo) Em_processo,max(Em_Execucao) Em_Execucao "  
        query +=" from ( "
        query +=" select  U_TIPOCONT,count(bostamp) Em_processo, Em_Execucao='' "
        query +=" from bo(nolock) "
        query +=" inner join bo2 (nolock) on bo.bostamp=bo2.bo2stamp "
        query +=" where ndos=38 and (u_cvisado='')   and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += " and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente1_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo1_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next
            query += ") "
        End If
        query +=" group by U_TIPOCONT "
        query +=" union all "
        query +=" select  u_tipocont,Em_processo='',count(bostamp) Em_Execucao "
        query +=" from bo(nolock) "
        query +=" inner join bo2(nolock) on bo.bostamp=bo2.bo2stamp "
        query +=" where ndos=38 and (u_cvisado<>'' ) AND  bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
            query += " and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente2_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo2_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If
        query +=" group by U_TIPOCONT "
        query +=" )tmp		 where u_tipocont!='' "
        query +=" and U_TIPOCONT not in ('Ajudas de Custo','Concurso Pub','')	"
        query +=" group by U_TIPOCONT "

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)

        dashboardData.add(New With {
            .titulo = "Contratos vs Execução",
            .data = results
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query="select fref, Total =sum(total) , sum(dentro_prazo) dentro_prazo,sum(Fora_prazo) Fora_prazo,	 "
        query+=" sum(Aberto) Aberto,Fora_prazo_SemExecucao=sum(Fora_prazo_SemExecucao) 	"
        query+=" from (  "
        query+="		select total =0,fref,count(bostamp) dentro_prazo, Fora_prazo=0, Aberto=0,Fora_prazo_SemExecucao=0 "
        query+="		from bo(nolock) 																									"
        query+="		inner join bo2(nolock) on bo.bostamp=bo2.bo2stamp 																	"
        query+="		where ndos=38 																										"
        query+="		and datediff(day,getdate(),datafinal) <= 90  and datediff(day,getdate(),datafinal) >=0 								"

                If(agentesImplementadores.Count > 0)
                
                    query += " and bo2.u_rugea in ("

                    For j As Integer = 0 To agentesImplementadores.Count - 1
                        paramName = String.Format("@agente1_{0}", j)
                        query += paramName
                        If (j < agentesImplementadores.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
                    Next

                    query += ") "

                End If
                If(agrupamentos.Count > 0)
                
                    query += "and bo.fref in ("

                    For k As Integer = 0 To agrupamentos.Count - 1
                        paramName = String.Format("@grupo1_{0}", k)
                        query += paramName
                        If (k < agrupamentos.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
                    Next

                    query += ") "

                End If
        query+="		group by fref 																										"
        query+=" union all 																													"
        query+="		select Total =0,fref, dentro_prazo=0, count(bostamp) Fora_prazo, Aberto=0,Fora_prazo_SemExecucao=0 					"
        query+="		from bo(nolock) 																									"
        query+="		 	inner join bo2(nolock) on bo.bostamp=bo2.bo2stamp 																"
        query+="		where ndos=38 																										"
        query+="		and getdate() >  bo.datafinal																						"

                If(agentesImplementadores.Count > 0)
                
                    query += " and bo2.u_rugea in ("

                    For j As Integer = 0 To agentesImplementadores.Count - 1
                        paramName = String.Format("@agente2_{0}", j)
                        query += paramName
                        If (j < agentesImplementadores.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
                    Next

                    query += ") "

                End If
                If(agrupamentos.Count > 0)
                
                    query += "and bo.fref in ("

                    For k As Integer = 0 To agrupamentos.Count - 1
                        paramName = String.Format("@grupo2_{0}", k)
                        query += paramName
                        If (k < agrupamentos.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
                    Next

                    query += ") "

                End If
        query+="				group by fref 																								"
        query+=" union all 																													"
        query+=" 		select Total =0,fref, 																								"
        query+="			dentro_prazo=0, Fora_prazo=0, Aberto=count(bo.bostamp) ,Fora_prazo_SemExecucao=0 								"
        query+=" 		from bo(nolock) 																									"
        query+=" 		inner join bo2(nolock) on bo.bostamp=bo2.bo2stamp 																	"
        query+=" 		where ndos=38 and getdate() between bo.dataopen and bo.datafinal 													"

                If(agentesImplementadores.Count > 0)
                
                    query += " and bo2.u_rugea in ("

                    For j As Integer = 0 To agentesImplementadores.Count - 1
                        paramName = String.Format("@agente3_{0}", j)
                        query += paramName
                        If (j < agentesImplementadores.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
                    Next

                    query += ") "

                End If
                If(agrupamentos.Count > 0)
                
                    query += "and bo.fref in ("

                    For k As Integer = 0 To agrupamentos.Count - 1
                        paramName = String.Format("@grupo3_{0}", k)
                        query += paramName
                        If (k < agrupamentos.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
                    Next

                    query += ") "

                End If
        query+=" 		group by fref 																										"
        query+=" union all 																													"
        query+=" 		select Total =0,fref, 																								"
        query+="			dentro_prazo=0, Fora_prazo=0, Aberto=0, Fora_prazo_SemExecucao=count(bo.bostamp) 								"
        query+=" 		from bo (nolock) 																									"
        query+=" 		inner join bo2(nolock) on bo.bostamp=bo2.bo2stamp 																	"
        query+=" 		where ndos=38 and u_cvisado<>'' and getdate() >=  bo.datafinal														"
        query+=" 			and bo.dataobra between '20240101' and '20241231' and 															"
        query+=" 			(select count(props.fostamp) from fo props inner join fo2 props2 ON props2.fo2stamp=props.fosTAMP where props2.u_contrato =bo.bostamp)=0 "

                If(agentesImplementadores.Count > 0)
                
                    query += " and bo2.u_rugea in ("

                    For j As Integer = 0 To agentesImplementadores.Count - 1
                        paramName = String.Format("@agente4_{0}", j)
                        query += paramName
                        If (j < agentesImplementadores.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
                    Next

                    query += ") "

                End If
                If(agrupamentos.Count > 0)
                
                    query += "and bo.fref in ("

                    For k As Integer = 0 To agrupamentos.Count - 1
                        paramName = String.Format("@grupo4_{0}", k)
                        query += paramName
                        If (k < agrupamentos.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
                    Next

                    query += ") "

                End If
        query+="		group by fref 																										"
        query+=" union all 																													"
        query+=" 		select Total =count(bo.bostamp),fref, 																				"	
        query+="			dentro_prazo=0, Fora_prazo=0, Aberto=0, Fora_prazo_SemExecucao=0												"
        query+=" 		from bo(nolock) 																									"
        query+=" 		inner join bo2(nolock) on bo.bostamp=bo2.bo2stamp 																	"
        query+=" 		where ndos=38 "

                If(agentesImplementadores.Count > 0)
                
                    query += " and bo2.u_rugea in ("

                    For j As Integer = 0 To agentesImplementadores.Count - 1
                        paramName = String.Format("@agente5_{0}", j)
                        query += paramName
                        If (j < agentesImplementadores.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
                    Next

                    query += ") "

                End If
                If(agrupamentos.Count > 0)
                
                    query += "and bo.fref in ("

                    For k As Integer = 0 To agrupamentos.Count - 1
                        paramName = String.Format("@grupo5_{0}", k)
                        query += paramName
                        If (k < agrupamentos.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
                    Next

                    query += ") "

                End If                
        query+="		group by fref 																										"
        query+=" 	)tmp1 where fref!='' 																									"
        query+=" group by fref 																												"


        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)

        dashboardData.add(New With {
            .titulo = "Conclusão de Objectos de Contratação Por Modalidade",
            .data = results
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)
        'Tipo de contrato
        query ="SELECT "
        query +="     u_tipocont,																							"
        query +="    ( select isnull(AVG(DATEDIFF(DAY, bo2visto.U_ENVIOTA , bo2visto.U_DATVIS)),0) AS Media_Dias 						"
        query +=" 			from bo bovisto inner join bo2 bo2visto on bovisto.bostamp =bo2visto.bo2stamp					"
        query +=" 			where bovisto.u_tipocont =bo.u_tipocont and bo2visto.U_CVISADO='VISADO' "

                If(agentesImplementadores.Count > 0)             
                    query += " and bo2visto.u_rugea in ("
                    For j As Integer = 0 To agentesImplementadores.Count - 1
                        paramName = String.Format("@agente1_{0}", j)
                        query += paramName
                        If (j < agentesImplementadores.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
                    Next
                    query += ") "
                End If
        query +=") Media_Dias_Visado ,	"
        query +=" 	( select isnull(AVG(DATEDIFF(DAY, bo2visto.U_ENVIOTA , bo2visto.U_DATVIS)),0) AS Media_Dias "
        query +=" 			from bo bovisto inner join bo2 bo2visto on bovisto.bostamp =bo2visto.bo2stamp "
        query +=" 			where bovisto.u_tipocont =bo.u_tipocont and bo2visto.U_CVISADO='Anotado' "

                If(agentesImplementadores.Count > 0)
                    query += " and bo2visto.u_rugea in ("
                    For j As Integer = 0 To agentesImplementadores.Count - 1
                        paramName = String.Format("@agente2_{0}", j)
                        query += paramName
                        If (j < agentesImplementadores.Count - 1) Then
                            query += ", "
                        End If
                        sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
                    Next
                    query += ") "
                End If

        query +=" ) Media_Dias_Anotado	"
        query +=" FROM BO "
        query +=" INNER JOIN "
        query +="     BO2 ON BO.bostamp = BO2.bo2stamp "
        query +=" WHERE BO.ndos = 38 AND BO.dataobra BETWEEN @datai AND @dataf	 "
        query +=" 	and u_tipocont != '' and u_tipocont IN ('Bens', 'Obras', 'Serviços', 'Consultoria')  "
        query +=" GROUP BY  U_TIPOCONT;	"

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)

        dashboardData.add(New With {
            .titulo = "Conclusão de Objectos de Contratação Por Fundo",
            .data = results
        })

		query =  " select distinct u_fase =wtwad, acao.U_ORDEM, "
		query += " Total =(select count(wwfa.wwfastamp) from wwfa where wwfa.wtwad= acao.wtwad ), "
		query += " Abertos =(select count(wwfa.wwfastamp) from wwfa where wwfa.wtwad= acao.wtwad and fechado=0 ), " 
		query += " Fechados = (SELECT COUNT(wwfa.wwfastamp) FROM wwfa WHERE wwfa.wtwad = acao.wtwad AND fechado = 1), "
		query += " DentroPrazo =(select count(wwfa.wwfastamp) from wwfa where wwfa.wtwad= acao.wtwad and fechado=1 and datediff(day,dinicio,dfecho)<dline ), " 
		query += " Fora  =(select count(wwfa.wwfastamp) from wwfa where wwfa.wtwad= acao.wtwad and fechado=1 and datediff(day,dinicio,dfecho)>dline ), "
		query += " Medio = (SELECT case when AVG(DATEDIFF(day, dinicio, dfecho))<0 then 0 when "
		query += " 			AVG(DATEDIFF(day, dinicio, dfecho)) is null then 0 else AVG(DATEDIFF(day, dinicio, dfecho)) end  "
		query += " 			FROM wwfa WHERE wwfa.wtwad = acao.wtwad AND fechado = 1) "
		query += " from wwf   INNER JOIN wwfl ON wwfl.wwfstamp = wwf.wwfstamp	INNER JOIN wwfa acao ON acao.wwfstamp = wwf.wwfstamp "			
		query += " INNER JOIN bo BOO ON wwfl.tabstamp = BOO.bostamp "
		query += " where boo.ndos in (51,58) AND acao.wtwad!= 'Anúncio de Posicionamento' ORDER BY acao.U_ORDEM ASC "

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "Projectos por Província",
            .data = results
        })


        query  = " select Fundo =fref,Planeado =Concat(format(Planeado,'N','pt-mz'),' MT'), "
        query  += "  Adjudicado =Concat(format(Adjudicado,'N','Pt-mz'),' MT'),Executado =Concat(format(executado,'N','pt-mz'),' MT'), "
        query  += "  Saldo =Concat(format((tmp.planeado -tmp.executado),'N','pt-mz'),' MT') from ( "
        query  += "  select fref , Planeado = sum(biplano.ettdeb),Adjudicado = isnull((Select sum(u_concorrent.valormt) "
        query  += "  													from bo  "
        query  += "  														inner join u_concorrent on bo.bostamp =u_concorrent.bostamp  " 
        query  += "  													where boplano.fref =bo.fref and bo.ndos =51 and u_concorrent.Adjudicado=1),0), "
        query  += "  	Executado = isnull((select sum(total) from fo where  fo.fref =boplano.fref) ,0) "
        query  += "  from bi biplano inner join bo boplano on biplano.bostamp =boplano.bostamp where boplano.ndos =60 and boplano.dataobra between  @datai and @dataf  "
        query  += "  group by fref "
        query  += "  )tmp "

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)

        dashboardData.add(New With {
            .titulo = "Orçamento vs Execução por Área de Intervenção",
            .data = results
        })
    
        query ="SELECT DISTINCT  U_FASE , Abertos= (SELECT COUNT(BO3STAMP) FROM BO3 WHERE U_FASE =BOOO.U_FASE) , "
        query +="DentroPrazo = (SELECT COUNT(BO3STAMP) FROM BO3 INNER JOIN BI ON BI.BOSTAMP =BO3.BO3STAMP WHERE U_FASE =BOOO.U_FASE AND GETDATE() BETWEEN  dedata AND atedata), "
        query +=" Fora = (SELECT COUNT(BO3STAMP) FROM BO3 INNER JOIN BI ON BI.BOSTAMP =BO3.BO3STAMP WHERE U_FASE =BOOO.U_FASE AND GETDATE() NOT BETWEEN  dedata AND atedata), "
        query += " Medio = (SELECT COUNT(BO3STAMP) FROM BO3 WHERE U_FASE =BOOO.U_FASE) "
	    query +=" FROM BO3 BOOO INNER JOIN BO ON BO.BOSTAMP =BOOO.BO3STAMP WHERE NDOS =51 AND U_FASE != 'Solicitação da Instauração SP' and bo.dataobra between  @datai and @dataf "

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)

        dashboardData.add(New With {
            .titulo = "Orçamento vs Execução por Província (x1000)",
            .data = results
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +=" where bo.ndos =38 and BO2.U_CVISADO='VISADO' and getdate() > bo.datafinal and Year(bo.dataopen) = Year(getdate())-1 "
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If
		
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "EX Visado Transitado",
            .data = results.Rows(0).Item("total")
        })
        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +=" where bo.ndos =38 and BO2.U_CVISADO ='ANOTADO' and getdate() > bo.datafinal and Year(bo.dataopen) = Year(getdate())-1 "
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If
		
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "EX Anotado Transitado",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +=" where bo.ndos =38 and BO2.U_CVISADO ='ANOTADO' and getdate() between BO.DATAOPEN and BO.DATAFINAL "
        query +=" and Year(bo.dataopen) = Year(getdate())-1 "
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "DP Anotado Transitado",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +=" where bo.ndos =38 and BO2.U_CVISADO ='VISADO' and getdate() between BO.DATAOPEN and BO.DATAFINAL "
        query +=" and Year(bo.dataopen) = Year(getdate())-1 "
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If

        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "DP Visado Transitado",
            .data = results.Rows(0).Item("total")
        })

                sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +=" where bo.ndos =38 and BO2.U_CVISADO ='ANOTADO' and Datediff(day,getdate(),bo.datafinal) <=90 and  Datediff(day,getdate(),bo.datafinal) >=0 "
        query +=" and Year(bo.dataopen) = Year(getdate())-1 "
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If

       
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "PE Anotado Transitado",
            .data = results.Rows(0).Item("total")
        })

        sqlParameters = new List(Of System.Data.SqlClient.SqlParameter)

        query  =" Select total=count(bo.bostamp) from bo inner join bo2 on bo.bostamp = bo2.bo2stamp " 
        query +="    where bo.ndos =38 and BO2.U_CVISADO ='VISADO' and Datediff(day,getdate(),bo.datafinal) <=90 and  Datediff(day,getdate(),bo.datafinal) >=0 "
        query +=" and Year(bo.dataopen) = Year(getdate())-1 " 
        query +=" and bo.dataobra between @datai and @dataf "

        If(agentesImplementadores.Count > 0)
        
            query += "and bo2.u_rugea in ("

            For j As Integer = 0 To agentesImplementadores.Count - 1
                paramName = String.Format("@agente_{0}", j)
                query += paramName
                If (j < agentesImplementadores.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agentesImplementadores(j).ToString()))
            Next

            query += ") "

        End If
        If(agrupamentos.Count > 0)
        
            query += "and bo.fref in ("

            For k As Integer = 0 To agrupamentos.Count - 1
                paramName = String.Format("@grupo_{0}", k)
                query += paramName
                If (k < agrupamentos.Count - 1) Then
                    query += ", "
                End If
                sqlParameters.add(new System.Data.SqlClient.SqlParameter(paramName, agrupamentos(k).ToString()))
            Next

            query += ") "

        End If

       
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@datai", datai))
        sqlParameters.add(new System.Data.SqlClient.SqlParameter("@dataf", dataf))

        results = ExecuteQuery(query, sqlParameters)


        dashboardData.add(New With {
            .titulo = "PE Visado Transitado",
            .data = results.Rows(0).Item("total")
        })

        responseObject = New With {
            .success = True,
            .data = New With {
                .periodo = periodo,
                .dashboardData = dashboardData
            }
        }

    Catch e as Exception

        responseObject = New With {
            .success = False,
            .message = e.Message()
        }

    End Try

    httpApiResponse = JsonConvert.SerializeObject(responseObject)

    mpage.Response.ContentType = "application/json"
    mpage.Response.Write(httpApiResponse)
    mpage.Response.End()