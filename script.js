// La api solo tiene 1126 pokemon.
const TOTAL_AMOUNT_POKEMON = 1126
const URL_POKEMON_LIMIT = 'https://pokeapi.co/api/v2/pokemon?limit=12'


/**
 * fetchPokemon()
 * Obtiene una lista de elementos
 * con un limite.
 */
const fetchPokemonWithLimit = async function (url) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw { status: response.status, statusText: response.statusText }
    const json = await response.json()
    createPagination('js-pagination', json.previous, json.next) 

    return json
  } catch (err) {
    console.log(err)
    const message = err.statusText || 'Ocurrió un error'
    renderMessage('js-pokemon-list', message)
  }
} 

const createPagination = function (id, previous, next) {
  const paginationNavEl = document.getElementById(id) 
  if (!paginationNavEl) return

  const prevLinkEl = previous ? `<a class="button  pagination-nav__prev" href="${previous}">◀️ Prev</a>` : ''
  const nextLinkEl = next ? `<a class="button  pagination-nav__next" href="${next}">Next ▶️</a>` : ''
  paginationNavEl.innerHTML = `${prevLinkEl} ${nextLinkEl}`
}


/**
 * fetchPokemon()
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
 * fetchListType()
 *  @param {string} id
 *  Devuelve un unico elemento.
 */
 const fetchType = async function (id) {
    if (!id) return
    const response = await fetch(`https://pokeapi.co/api/v2/type/${id}`)
    const result = await response.json()
    return result
}


/**
 * fetchTypeList()
 * Devuelve una lista de elementos.
 */
const fetchTypeList = async function () {
    const NUMBER_OF_TOTAL_TYPES = 18
    let typeList = []
    
    for (let i = 1; i <= NUMBER_OF_TOTAL_TYPES; i++) {
        const result = await fetchType(i)
        let pokemonType = {
            type: result.name,
            id: result.id
        }
        typeList.push(pokemonType)
    }
    return typeList
}


/**
 * createTemplateCard()
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

    let image = imageSVG || imagePNG
    firstType = firstType.type.name
    secondType = secondType ? `<span class="tag">${secondType.type.name}</span>` : ''
    
    if (id < 10) id = `00${id}`
    else if (id >= 10 && id < 100) id = `0${id}`

    let template = `
        <div class="card-pokemon__content">
            <span class="icon-pokeball card-pokemon__id"><span>#${id}</span></span>
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
 * getPokemonList()
 *
 * Obtiene la data de cada pokemon
 * devuelto por la función getPokemonLimit()
 */
const getPokemonList = async function (url) {
  const pokemonList = []
  const { results: pokemonItems } = await fetchPokemonWithLimit(url)
  
  for (let pokemonItem of pokemonItems) {
    const pokemon = await fetchPokemon(pokemonItem.name)
    pokemonList.push(pokemon)
  }
  return pokemonList
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
        const idOrName = document.getElementById('js-inputSearch').value.trim()
        if (!idOrName) return

        pokemon = await fetchPokemon(idOrName.toLowerCase())
        if (!pokemon) {
            formEl.reset()
            return
        }

        renderPokemon(pokemon)
        formEl.reset()
    })
}


/**
 * getOptionFromSelect()
 *  
 */
 const getOptionFromSelect = function (selectEl) {
    const currentOptionEl = selectEl.options[selectEl.selectedIndex]
    const id = currentOptionEl.value
    return id
}


/**
 * getSelect()
 *  
 */
const getSelect  = function () {
    const selectEl = document.getElementById('js-select')
    if (!selectEl) return

    selectEl.addEventListener('change', async function (e) {
        e.preventDefault()
        const id = getOptionFromSelect(e.target)
        const pokemonListByType = await fetchType(id)
        renderPokemonListByType(pokemonListByType)
    })

}


/**
 * renderMessage()
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
const renderPokemonList = async function (url) {
  const pokemonListFragment = document.createDocumentFragment()
  const pokemonListEl = document.querySelector('#js-pokemon-list .grid')
  const pokemonList = await getPokemonList(url)

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
  pokemonListEl.innerHTML = ''
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


/**
 * renderPokemonListByType()
 *  
 */
const renderPokemonListByType = async function ({ pokemon: pokemonList }) {
    const pokemonListByTypeFragment = document.createDocumentFragment()
    const pokemonListEl = document.querySelector('#js-pokemon-list .grid')
    if (!pokemonListEl) return

    for (let pokemon of pokemonList) {
        const articleEl = document.createElement("article")
        articleEl.setAttribute('class', 'grid__item  card  card-pokemon')
        
        let {id, name, sprites, types} = await fetchPokemon(pokemon.pokemon.name)
        const pokemonCard = await createTemplateCard({id, imageSprites: sprites, name, types})
        
        articleEl.innerHTML = pokemonCard
        pokemonListByTypeFragment.append(articleEl)
    }
    pokemonListEl.innerHTML = ''
    pokemonListEl.append(pokemonListByTypeFragment)
}


/**
 * renderOptionElToSelect()
 *  
 */
const renderOptionElToSelect = async function () {
    let optionListFragment = document.createDocumentFragment()
    let selectEl = document.getElementById('js-select')
    let typeList = await fetchTypeList()
    if (!selectEl) return
    if (!typeList.length > 0 ) return
    
    for (let type of typeList) {
        let optionEl = document.createElement('option')
        optionEl.setAttribute('class', 'select__item')
        optionEl.setAttribute('value', type.id)
        optionEl.textContent = type.type
        optionListFragment.append(optionEl)
    }
  
    selectEl.append(optionListFragment)
}

/**
 * renderOptionElToSelect()
 * @param {Event} e
 * @param {String} classOfElement
 */
const getHrefPaginationButtons = function (e, classOfElement) {
  if (e.target.matches(classOfElement)) {
    e.preventDefault()
    const link = e.target.getAttribute('href')
    return link
  }
}

renderOptionElToSelect()
renderRandomPokemon()
getDataForm()
getSelect()

document.addEventListener('DOMContentLoaded', e => {
  renderPokemonList(URL_POKEMON_LIMIT)
})
document.addEventListener('DOMContentLoaded', randomPokemon)
document.addEventListener('click', e => {
  const link = getHrefPaginationButtons(e, '.pagination-nav a')
  renderPokemonList(link)
})