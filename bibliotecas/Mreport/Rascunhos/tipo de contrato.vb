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