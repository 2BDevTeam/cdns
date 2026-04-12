

select *from ft2_cache join ft_cache on ft2_cache.ft2stamp=ft_cache.ftstamp where year(ft_cache.fdata)=2026

select *from cache_control


select *from ft join ft2 on ft.ftstamp=ft2.ft2stamp where year(ft.fdata)=2026