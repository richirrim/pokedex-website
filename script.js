/**
 * getPokemonLimit()
 * 
 * Obtiene un número limitado de Pokemon.
 */
const getPokemonLimit = async function() {
    const LIMIT = 20
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}`)
    let result = await response.json()
    let pokemonList = result.results
    let pokemonListId = []
    
    if (!pokemonList) console.info('No hay elmentos en el array.')
    
    for (let pokemon of pokemonList) {
        let id = pokemon.url.split('/').slice(-2)[0]
        pokemonListId.push(id)
    }
    return pokemonListId

}

/**
 * getPokemonList()
 *
 * Obtiene la data de cada pokemon
 * devuelto por la función getPokemonLimit()
 */
const getPokemonList = async function() {
    let pokemonList = []
    let pokemonListLimit = await getPokemonLimit()
    
    for (let id of pokemonListLimit) {
        let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        let result = await response.json()
        pokemonList.push(result)
    }
    return pokemonList
}

/**
 * renderUI()
 *  
 * Pinta cada compoonente card con info del 
 * pokemon en el layout.
 */
const renderUI = async function () {
    let templateCard = ``
    const pokemonListFragment = document.createDocumentFragment()
    const pokemonListEl = document.querySelector('#js-pokemon-list .grid')
    const pokemonList = await getPokemonList()

    if (!pokemonList) console.info('No hay elmentos en el array.')

    for (let pokemon of pokemonList) {
        const articleEl = document.createElement("article")
        articleEl.setAttribute('class', 'grid__item  card  card-pokemon')
        articleEl.innerHTML = `
            <div class="card-pokemon__content">
                <span class="card-pokemon__id">#00<span>${pokemon.id}</span></span>
                <div class="card-pokemon__container-image">
                    <img class="card-pokemon__image" src="${pokemon.sprites.other.dream_world.front_default}" alt="">
                </div>
                <h2 class="card-pokemon__name">${pokemon.name}</h2>
            </div>
            <div class="card-pokemon__tags">
                <span class="tag">${pokemon.types[0].type.name}</span>
                ${pokemon.types.length === 2 ? `<span class="tag">${pokemon.types[1].type.name}</span>` : ''}
            </div>
        `
        console.log(pokemon)
        pokemonListFragment.append(articleEl)
    }
    pokemonListEl.append(pokemonListFragment)
}

document.addEventListener('DOMContentLoaded', renderUI)