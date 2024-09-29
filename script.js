// browser-sync start --server --files
const CONFIG = {
    TOTAL_POKEMON_COUNT: 1025,
    // Si no especificas un límite, devolverá 20 por defecto al pasar null.
    POKEMON_RESULTS_LIMIT: 4,
    BASE_URL: 'https://pokeapi.co/api/v2',

    URL_QUERY_LIMIT: function (urlNext = null) {
        if (!urlNext) {
            return `${this.BASE_URL}/pokemon?limit=${this.POKEMON_RESULTS_LIMIT}&offset=0`;
        }

        return urlNext;
    },
}

/**
 * @function fetchBasicPokemonList
 * @description - Obtiene una lista básica que incluye el nombre y 
 * la URL de cada Pokémon. 
 * @param {string} url
 * @returns {Array<Object>}
 */
// TODO: refactor, funcion que hace mas de una cosa.
const fetchBasicPokemonList = async function fetchBasicPokemonList(url) {
  try {
    const response = await fetch(CONFIG.URL_QUERY_LIMIT(url))
    const { ok, status } = response

    if (!ok) {
        throw { 
            status: response.status, 
            statusText: response.statusText,
        }
    }
    
    const json = await response.json()
    const { previous, next } = json

    createPagination('js-pagination', previous, next) 
    
    return json
  } catch (err) {
    console.error(err)
    const message = err.statusText || 'Ocurrió un error'
    renderMessage('js-pokemon-list', message)
  }
} 

const createPagination = function (id, previous, next) {
  const paginationNavEl = document.getElementById(id) 
  if (!paginationNavEl) return

  const prevLinkEl = previous ? `<a class="button  pagination-nav__prev  icon-left-arrow" href="${previous}">Prev</a>` : ''
  const nextLinkEl = next ? `<a class="button  pagination-nav__next  icon-right-arrow" href="${next}">Next</a>` : ''
  
  paginationNavEl.innerHTML = `${prevLinkEl} ${nextLinkEl}`
}


/**
 * fetchPokemonByID()
 *
 * @param {Number|String} id
 * @returns {Object}
 */
const fetchPokemonByID = async function fetchPokemonByID(id) {
    try {
        if (!id) {
            renderMessage(
                'js-pokemonContainer', 
                'ID proporcionado no es válido'
            )

            throw new Error('ID proporcionado no es válido')
        }
        
        const response = await fetch(`${CONFIG.BASE_URL}/pokemon/${id}`)
        const { ok, status } = response
        
        if (!ok) {
          renderMessage(
            'js-pokemonContainer', 
            '¡Ups! No se encontró el Pokémon que estabas buscando. 😢'
          )
    
          throw new Error('Pokémon no encontrado (404)')
        } 
        
        return await response.json();
    } catch (ex) {
        // TODO: refactorizar, cambiar por alerta.
        console.error(ex)
    }
}


/**
 *  @function fetchPokemonListByType
 *  @param {string} id
 *  @return {Object}
 */
// TTODO: Validar cuando un tipo no devuelve ningun pokemon, array vacío.
 const fetchPokemonListByType  = async function fetchPokemonListByType(id) {
    if (!id) {
        throw new Error('ID no valido')
    }
    
    try {
        const response  = await fetch(`${CONFIG.BASE_URL}/type/${id}`)
        const { ok, status } = response

        if (!ok) {
            throw new Error(`No se encontraron pokemones para el tipo con ID: ${id}`)
        }

        return response.json();
    } catch (ex) {
        console.error(ex)
    }
}  

/**
 * Obtiene el último segmento de la URL, que típicamente es un ID.
 * 
 * @function getIdUrl
 * @param {string} url
 * @returns {string} 
 */
const getIdUrl = function getIdUrl(url) {
    const id = url?.split('/').slice(-2)[0] ?? ''
    return id;
}

/**
 * @function fetchPokemonTypes
 * @returns {Array<{type: string, id: string}>} 
 */
const fetchPokemonTypes = async function fetchPokemonTypes() {
    try {
        const response = await fetch(`${CONFIG.BASE_URL}/type`)
        const { ok, status } = response

        if (!ok) {
            throw new Error(`Error ${status}: No se pudieron obtener los tipos de Pokémon. Intenta nuevamente más tarde.`)
        }
        
        const { results: types } = await response.json()
        
        return types.map(({ name, url }) => {
            return {
                type: name,
                id: getIdUrl(url),
            };
        })
    } catch (ex) {
        console.log(ex)   
    }
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
  const id = Math.ceil(Math.random()*CONFIG.TOTAL_POKEMON_COUNT)
  const pokemon = await fetchPokemonByID(id)
  if (!pokemon) return
  renderPokemon(pokemon)
}


/**
 * @function fetchDetailedPokemonList
 * @description - Obtiene una lista detallada de cada Pokémon, incluyendo 
 * información adicional como tipo, habilidades, etc.
 * @param {string} url - La URL de la API que se utiliza para obtener la lista inicial 
 * de nombres y URLs de Pokémon.
 * @returns {Array<Object>}
 */
const fetchDetailedPokemonList = async function fetchDetailedPokemonList(url) {
  const pokemonList = []
  const { results: pokemonItems } = await fetchBasicPokemonList(url)
  
  for (let pokemonItem of pokemonItems) {
    const pokemon = await fetchPokemonByID(pokemonItem.name)
    pokemonList.push(pokemon)
  }

  return pokemonList;
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

        pokemon = await fetchPokemonByID(idOrName.toLowerCase())
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
        const pokemonListByType = await fetchPokemonListByType(id)
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
 */
const renderPokemonList = async function (url) {
  const pokemonListFragment = document.createDocumentFragment()
  const pokemonListEl = document.querySelector('#js-pokemon-list .grid')
  const pokemonList = await fetchDetailedPokemonList(url)
//   console.log('renderPokemonList:', pokemonList)

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
        
        let {id, name, sprites, types} = await fetchPokemonByID(pokemon.pokemon.name)
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
    let typeList = await fetchPokemonTypes()

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
    
    if (!e.target.matches(classOfElement)) {
        return;
    }
    
    e.preventDefault()
    const link = e.target.getAttribute('href')
    
    return link
}

renderOptionElToSelect()
renderRandomPokemon()
getDataForm()
getSelect()

document.addEventListener('DOMContentLoaded', e => {
    renderPokemonList()
})
document.addEventListener('DOMContentLoaded', randomPokemon)
document.addEventListener('click', e => {
    const link = getHrefPaginationButtons(e, '.pagination-nav a')
    
    if (!link) {
        return; 
    }

    renderPokemonList(link)
})