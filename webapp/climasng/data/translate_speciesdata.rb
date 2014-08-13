
require 'csv'
require 'json'

species = {}

CSV.foreach('species_to_id.txt') do |row|
    rowsplit = row[0].split '('

    sciname = rowsplit[-1].sub ')', ''
    commonname = rowsplit[0..-2].join('(').strip

    # is it in our sample set?
    if [
        'Erythrura gouldiae',
        'Pipistrellus westralis',
        'Cryptoblepharus ruber',
        'Dasyurus hallucatus'
    ].include? sciname
        species[sciname] ||= []
        species[sciname] << commonname
    end

    puts "#{commonname} (#{sciname})"
end

File.open('testspecies.json', 'w') do |f|
    f.write(JSON.dump species)
end