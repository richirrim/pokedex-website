/**
 * getPokemonLimit()
 * 
 * Obtiene un número limitado de Pokemon.
 */
const getPokemonLimit = async function () {
    const LIMIT = 20
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}`)
    let result = await response.json()
    let pokemonList = result.results
    let pokemonListId = []
    
    if (!pokemonList) return
    
    for (let pokemon of pokemonList) {
        let id = pokemon.url.split('/').slice(-2)[0]
        pokemonListId.push(id)
    }
    return pokemonListId

}


/**
 * getPokemon()
 *
 * @param {Number} id
 *  Obtiene un unico elemento.
 */
 const getPokemon = async function (id) {
    if (!id) return
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    const result = await response.json()
    return result
}


/**
 * getPokemonList()
 *
 * Obtiene la data de cada pokemon
 * devuelto por la función getPokemonLimit()
 */
const getPokemonList = async function () {
    let pokemonList = []
    let pokemonListLimit = await getPokemonLimit()
    
    for (let id of pokemonListLimit) {
        const result = await getPokemon(id)
        pokemonList.push(result)
    }
    return pokemonList
}


/**
 * templateCard()
 * @param {Number} id Recibe un número.
 * @param {String} name
 * @param {String} imageType Por defecto, usa 'svg' otra opción es 'png'.
 * @param {Object} imageSprties Recibe un objeto con todos los sprites.
 * @param {Object} types
 */
 const createTemplateCard = function ({id, imageType = 'svg', imageSprites, name, types}) {
    let image
    if (imageType === 'svg') image = imageSprites.other.dream_world.front_default
    else image = imageSprites.front_default

    const typeOne = types[0].type.name
    const typeTwo = types.length === 2 
        ? `<span class="tag">${types[1].type.name}</span>` 
        : ''

    let template = `
        <div class="card-pokemon__content">
            <span class="icon-pokeball card-pokemon__id">#00<span>${id}</span></span>
            <div class="card-pokemon__container-image">
                <img class="card-pokemon__image" src="${image}" alt="">
            </div>
            <h2 class="card-pokemon__name">${name}</h2>
        </div>
        <div class="card-pokemon__tags">
            <span class="tag">${typeOne}</span>
            ${typeTwo}
        </div>
    `
    return template
}


/**
 * renderPokemonList()
 *  
 * Pinta cada compoonente card con info del 
 * pokemon en el layout.
 */
const renderPokemonList = async function () {
    const pokemonListFragment = document.createDocumentFragment()
    const pokemonListEl = document.querySelector('#js-pokemon-list .grid')
    const pokemonList = await getPokemonList()

    if (!pokemonList) return

    for (let pokemon of pokemonList) {
        const articleEl = document.createElement("article")
        articleEl.setAttribute('class', 'grid__item  card  card-pokemon')

        const cardPokemon = createTemplateCard({
            id: pokemon.id,
            imageSprites: pokemon.sprites ,
            name: pokemon.name,
            types: pokemon.types
        })

        articleEl.innerHTML = cardPokemon
        pokemonListFragment.append(articleEl)
    }
    pokemonListEl.append(pokemonListFragment)
}


/**
 * renderPokemon()
 *  
 */
const renderPokemon = async function (pokemon) {
    const pokemonContainerEl = document.getElementById('js-pokemonContainer')
    if (!pokemonContainerEl) return
    const divEl = document.createElement("div")
    divEl.setAttribute('class', 'card-pokemon')
    pokemonContainerEl.innerHTML = ''
    const cardPokemon = await createTemplateCard({
        id: pokemon.id,
        imageSprites: pokemon.sprites,
        name: pokemon.name,
        types: pokemon.types
    })

    divEl.innerHTML = cardPokemon
    pokemonContainerEl.append(divEl)
}


/**
 * getDataForm()
 *  
 */
const getDataForm = function () {
    const formEl = document.getElementById('js-formSearch')
    if (!formEl) return;
    
    formEl.addEventListener('submit', async function(e) {
        e.preventDefault()
        const id = document.getElementById('js-inputSearch').value.trim()
        const pokemon = await getPokemon(id)
        renderPokemon(pokemon)
        formEl.reset()
    })
}


getDataForm()
document.addEventListener('DOMContentLoaded', renderPokemonList)