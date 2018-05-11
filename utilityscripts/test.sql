
-- run this with: psql -td catol < test.sql

select '------------------------------------------';

select 'count of common names', count(*) from vernacular;

select 'count of taxons with common names', count(*) 
	from (select distinct "taxonID" from vernacular) t;

select '------------------------------------------';

select 'Languages and counts of common names, top ten:';

select * from (
	select distinct
	            v1."language",
			    count(v1.*) as commonnames
	from        vernacular as "v1"
	-- where       v1."language" in ('English', 'Eng', 'Creole, English', 'En') OR v1."language" is null
	-- and			v1."language" = 'Creole, English'
	group by    v1."language"
	-- group by    v1."taxonID"
	order by    commonnames desc
) as t limit 10;