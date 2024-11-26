import { useEffect, useState } from "react";
import { fetchAllPokemon, fetchPokemonDetailsByName, fetchEvolutionChainById, fetchPokemonSpeciesByName } from "./api";

function App() {
    const [pokemonIndex, setPokemonIndex] = useState([])
    const [pokemon, setPokemon] = useState([])
    const [searchValue, setSearchValue] = useState('')
    const [pokemonDetails, setPokemonDetails] = useState()

    useEffect(() => {
        const fetchPokemon = async () => {
            const { results: pokemonList } = await fetchAllPokemon()

            setPokemon(pokemonList)
            setPokemonIndex(pokemonList)
        }

        fetchPokemon().catch(console.error)
    }, [])

    const onSearchValueChange = (event) => {
        const value = event.target.value.toLowerCase()
        setSearchValue(value)

        setPokemon(
            pokemonIndex.filter(monster => monster.name.toLowerCase().includes(value))
        )
    }

    const extractEvolutionChain = (evolutionData) => {
        const chain = [];

        function traverse(data) {
            if (!data) return;

            // Add the current species name
            chain.push(data.species.name);

            // If there are further evolutions, traverse them
            if (data.evolves_to && data.evolves_to.length > 0) {
                traverse(data.evolves_to[0]);
            }
        }

        traverse(evolutionData.chain);
        return chain;
    };

    const onGetDetails = (name) => async () => {
        try {
            console.log('Fetching details for:', name)
            const [details, species] = await Promise.all([
                fetchPokemonDetailsByName(name),
                fetchPokemonSpeciesByName(name)
            ])
            console.log('Received details:', details)
            console.log('Received species:', species)

            // Extract evolution chain ID from the URL
            const evolutionChainUrl = species.evolution_chain.url
            const evolutionChainId = evolutionChainUrl.split('/').slice(-2)[0]
            console.log('Evolution chain ID:', evolutionChainId)

            // Fetch evolution chain using the extracted ID
            const evolutionChainData = await fetchEvolutionChainById(evolutionChainId)
            console.log('Received evolution chain data:', evolutionChainData)

            // Extract the evolution chain names
            const evolutionChain = extractEvolutionChain(evolutionChainData)
            console.log('Extracted evolution chain:', evolutionChain)

            // Set the combined details
            setPokemonDetails({
                name: details.name,
                types: details.types,
                moves: details.moves,
                evolutionChain: evolutionChain,
                species: species
            })
        } catch (error) {
            console.error('Failed to fetch Pokemon details:', error)
        }
    }

    return (
        <div className={'pokedex__container'}>
            <div className={'pokedex__search-input'}>
                <input value={searchValue} onChange={onSearchValueChange} placeholder={'Search Pokemon'} />
            </div>
            <div className={'pokedex__content'}>
                {pokemon.length > 0 ? (
                    <div className={'pokedex__search-results'}>
                        {
                            pokemon.map(monster => {
                                return (
                                    <div className={'pokedex__list-item'} key={monster.name}>
                                        <div>
                                            {monster.name}
                                        </div>
                                        <button onClick={onGetDetails(monster.name)}>Get Details</button>
                                    </div>
                                )
                            })
                        }
                    </div>
                ) : (
                    <div className={'pokedex__no-results'}>No Results Found</div>
                )}
                {
                    pokemonDetails && (
                        <div className={'pokedex__details'}>
                            <h2>{pokemonDetails.name}</h2>
                            <div className="pokedex__details-row">
                                <div className="pokedex__details-section">
                                    <h3 className="pokedex_details_title">Types</h3>
                                    <div className="pokedex__types">
                                        {pokemonDetails.types.map(type => (
                                            <span key={type.type.name} className="pokedex__type-tag">{type.type.name}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="pokedex__details-section">
                                    <h3 className="pokedex_details_title">Moves</h3>
                                    <div className="pokedex__moves">
                                        {pokemonDetails.moves.slice(0, 4).map(move => (
                                            <span key={move.move.name} className="pokedex__move-tag">{move.move.name}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="pokedex__details-section">
                                <h3 className="pokedex_details_title">Evolutions</h3>
                                <div className="pokedex__evolution-chain">
                                    {pokemonDetails.evolutionChain && pokemonDetails.evolutionChain.map((pokemon, index) => (
                                        <div key={`evolution-${index}-${pokemon}`} className="pokedex__evolution-item">
                                            {pokemon}
                                            {index < pokemonDetails.evolutionChain.length - 1 && (
                                                <span className="pokedex__evolution-arrow">→</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
}

export default App;
