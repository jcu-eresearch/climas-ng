/*
 *
 * SQL used to query the Catalogue of Life data
 *
 */

/*

Query used to join the taxon table to the vernacular (common name) table, 
but restricting the number of common names retrieved to just the top 5 
(the ` vernacular."rowindex" <= 5 ` bit chooses how many).

Getting a "top 5" per taxonID, for multiple taxonIDs, is surprisingly hard
for SQL. The trick here is to:

- do an inner subquery that sorts all the vernacularName values according 
    to our preference.
- run another subquery on that result, using row_number() -- which is a 
    "window" function available in postgres but not MySQL -- to add a 
    rowIndex, but when partitioned by taxonID, which means each individual 
    taxonID's set of vernacularNames gets numbered, starting at 1 for the 
    taxon's most preferred vernacularName, then 2 etc.
- now finally you can take the result of that outer subquery, which includes
    all taxonIDs and vernacularNames but now the vernacularNames are numbered,
    match on taxonID to get your species, and filter out the less-preferred 
    names by selecting only small values of rowIndex. Phew!

*/

select array_to_json(array_agg(row_to_json(t))) from (

	select 
		-- *
		-- vernacular."rowindex",
		-- vernacular."taxonID",
		vernacular."vernacularName" as "commonName",
		concat(taxon."genus", '_', taxon."specificEpithet") as "spp"

	from
		/* this subquery takes the ordered common names from the inner subquery and adds
		   a row number for that common name **within its taxon**. Later we can use that
		   row number to get only the five (or whatever) most "popular" common names. */
		(select	row_number() over (partition by v2."taxonID") as rowindex,
				v2."taxonID",
				v2."vernacularName" 
		from
			/* this innermost subquery adds votes (number of countries that use a common name)
			   and a tie-breaking priority rank if AU, GB, US, or CA use that common name,
			   and then uses votes and priority to sort all the common names. */
			(select   v1."taxonID",
					count(v1.*) as votes, 
					/* votes is a count of the countries that use this particular common name */
			     	min((case v1."countryCode" when 'AU' then 1 when 'GB' then 2 when 'US' then 3 when 'CA' then 4 else 10 end)) as priority,
			     	/* priority is the "best" priority number across all the countries that use this name */
			     	v1."vernacularName" /* the common name we're rating */
			from      vernacular as "v1"
			where     v1."language" = 'English'
			group by  v1."taxonID", v1."vernacularName"
			order by  votes desc, priority
			) as "v2"
		) as "vernacular"
		natural inner join "taxon"
	where
		taxon."taxonID" = vernacular."taxonID"
		and vernacular."rowindex" <= 5

		/* to do mammals only */
		-- and taxon."class" = 'Mammalia'

		/* to exclude fish */
		and taxon."class" not in ('Actinopterygii', 'Cephalaspidomorphi', 'Elasmobranchii', 'Myxini', 'Sarcopterygii', 'Holocephali')	

		/* to do one specific fish with lots of common names */
		-- and taxon."taxonID" = 32665252

) t
;

