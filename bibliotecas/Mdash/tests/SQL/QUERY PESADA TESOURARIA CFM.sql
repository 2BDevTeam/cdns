select  *,cast('2025-01-01' as smalldatetime) as DataI , cast('2025-12-31' as smalldatetime) as DataF
		,Tag=Case Left(Ltrim(CT),1) 
				when 'R' then '2-Receitas'
				when 'P' then '3-Pagamentos'
				when 'T' then '4-Tranferências'
			End	
		,Tipo_Codigo=Case isnull((select oltipo from oc where oc.olcodigo=tmp1.CT),0)
				when 1 then 'Recebimentos Exploração'
				when 2 then 'Pagamentos Exploração'
				when 3 then 'Recebimentos Extra Exploração'
				when 4 then 'Pagamentos Extra Exploração'
			End			
		,agrega_codigo=isnull((select u_operacao from oc where oc.olcodigo=tmp1.CT),'')												
		,olgrupo=isnull((select olgrupo from oc where oc.olcodigo=tmp1.CT),'')
		,olsgrupo=isnull((select olsgrupo from oc where oc.olcodigo=tmp1.CT),'')
		,Cambio=case when tmp1.moeda='' then 1 else (Select cambio from cb where moeda=tmp1.Moeda and data=tmp1.DataValor ) end
		,EntradaM=Entrada*case when tmp1.moeda='' then 1 else (Select cambio from cb where moeda=tmp1.Moeda and data=tmp1.DataValor ) end
		,SaidaM=Saida*case when tmp1.moeda='' then 1 else (Select cambio from cb where moeda=tmp1.Moeda and data=tmp1.DataValor ) end
		,SaldoM=Saldo*case when tmp1.moeda='' then 1 else (Select cambio from cb where moeda=tmp1.Moeda and data=tmp1.DataValor ) end
from(	select  ba.Data,ba.dvalor as DataValor
				,ltrim(rtrim(ba.Documento))+' '+ ltrim(rtrim(ba.cheque)) as Documento
				,ba.descricao as Descricao,ol.u_desc as [Descrição do Movimento]
				,(case when bl.moeda='' then ba.entrada else ba.entradam end) as Entrada
				,(case when bl.moeda='' then ba.saida else ba.saidam end) as saida
				,((case when bl.moeda='' then ba.entrada else ba.entradam end)-(case when bl.moeda='' then ba.saida else ba.saidam end)) as Saldo
				,(case when ba.reco=1 then 'Sim' else 'Não' end) as Reconciliado,ba.Extracto
				,left(ltrim(rtrim(bl.banco))+'          ',10)+' '+ltrim(rtrim(bl.conta)) as Conta, BL.MOEDA as Moeda
				,ol.olcodigo as CT
		from	bl (nolock) inner join ba(nolock) on ba.contado=bl.noconta inner join ol(nolock) on ba.olstamp=ol.olstamp
		where	ba.data>='2020-01-01' and ba.data<='2025-12-31'
				and (case when ''='' then '' else BL.MOEDA end) LIKE (case when ''='' then '' else '' end)
				and (case when ''='' then '' else (left(ltrim(rtrim(bl.banco))+'          ',10)+' '+ltrim(rtrim(bl.conta)) ) end) LIKE (case when ''='' then '' else '' end)
				and (case when ''='' then '' else BL.U_CCUSTO end) LIKE (case when ''='' then '' else ''+'%' end)
	)tmp1
order by tmp1.Moeda, tmp1.Conta, tmp1.Data