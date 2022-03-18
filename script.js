// La api solo tiene 898 pokemon.
const TOTAL_AMOUNT_POKEMON = 898


/**
 * getPokemon()
 *
 * @param {Number} id
 *  Obtiene un unico elemento.
 */
 const fetchPokemon = async function (id) {
    if (!id) return
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    if (!response.ok) {
        renderMessage(
            'js-pokemonContainer', 
            'No se encontro el pokemon que estabas buscando😢.'
        )
        return
    } 
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
    const QUANTITY_POKEMON = 15
    let pokemonList = []
    
    for (let i = 1; i <= QUANTITY_POKEMON; i++) {
        const result = await fetchPokemon(i)
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
 const createTemplateCard = function ({
    id, 
    imageType = 'svg', 
    imageSprites: {
        front_default: imagePNG,
        other: {dream_world: {front_default: imageSVG}}
    }, 
    name, 
    types: [firstType, secondType]}) {
     // Apartir del 650 no hay imagenes svg del pokemon.
     // Por ende, devuelve svg si existe y, si no, la version 'png'.
    // let [firstType1, secondType2] = types
    let image = imageSVG || imagePNG
    firstType = firstType.type.name
    secondType = secondType ? `<span class="tag">${secondType.type.name}</span>` : ''

    let template = `
        <div class="card-pokemon__content">
            <span class="icon-pokeball card-pokemon__id">#00<span>${id}</span></span>
            <div class="card-pokemon__container-image">
                <img class="card-pokemon__image" src="${image}" alt="">
            </div>
            <h2 class="card-pokemon__name">${name}</h2>
        </div>
        <div class="card-pokemon__tags">
            <span class="tag">${firstType}</span>
            ${secondType}
        </div>
    `
    return template
}


/**
 * randomPokemon()
 *  
 */
 const randomPokemon = async function () {
    const id = Math.ceil(Math.random()*TOTAL_AMOUNT_POKEMON)
    const pokemon = await fetchPokemon(id)
    renderPokemon(pokemon)
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
        let pokemon
        const idOrName = document.getElementById('js-inputSearch').value
        if (!idOrName) return

        pokemon = await fetchPokemon(idOrName)
        if (!pokemon) {
            formEl.reset()
            return
        }

        idOrName.toLowerCase().trim()
        renderPokemon(pokemon)
        formEl.reset()
    })
}


/**
 * getPokemonLimit()
 * 
 * @param {String} id
 * @param {String} message
 */
 const renderMessage = function (id, message) {
    const containerEl = document.getElementById(id)
    const spanEl = document.createElement('span')
    if (!containerEl) return

    containerEl.innerHTML = ''
    spanEl.setAttribute('class', 'showMessageError')
    spanEl.textContent = message
    containerEl.append(spanEl)
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
    divEl.setAttribute('class', 'card-pokemon  card-pokemon--vertical')
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
 * renderRandomPokemon()
 *  
 */
const renderRandomPokemon = function () {
    const linkEl = document.getElementById('js-linkRandomGenerator')
    if (!linkEl) return

    linkEl.addEventListener('click', function (e) {
        e.preventDefault()
        randomPokemon()
    })
}


getDataForm()
renderRandomPokemon()
document.addEventListener('DOMContentLoaded', renderPokemonList)
document.addEventListener('DOMContentLoaded', randomPokemon)