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