const burgerBtn = document.querySelector('.burger-btn')
const menu = document.querySelector('.header__menu')
const shortenInputBox = document.querySelector('.shorten__input-box')
const shortenInput = document.querySelector('.shorten__input')
const shortenBtn = document.querySelector('.shorten__search-area .btn')
const resultsContainer = document.querySelector('.shorten__results')
const localStorageShortenedLinks = JSON.parse(localStorage
    .getItem('shortenedLinks'))
const shortenedLinks = localStorage
    .getItem('shortenedLinks') !== null ? localStorageShortenedLinks : [] 



function toggleMenu() {
    menu.classList.toggle('header__menu--open')
    burgerBtn.classList.toggle('burger-btn--open')
}
burgerBtn.addEventListener('click', toggleMenu)

function saveResults(originalLink, shortenedLink) {
    shortenedLinks.push({'originalLink': originalLink, 'shortenedLink': shortenedLink})
    localStorage.setItem('shortenedLinks', JSON.stringify(shortenedLinks))
}

function render(originalLink, shortenedLink) {
    const div = document.createElement('div')
    div.classList.add('shorten__result')

    div.innerHTML = `
        <p class="shorten__result__original-link">${originalLink}</p>
        <div class="shorten__result__short">
            <p class="shorten__result__short__link">${shortenedLink}</p>
            <a href="#" class="btn">Copy</a>
        </div>
    `
    const divBtn = div.querySelector('.shorten__result__short .btn')
    const shortLink = div.querySelector('.shorten__result__short__link')

    divBtn.addEventListener('click', evt => {
        evt.preventDefault()

        const divBtns = document.querySelectorAll('.shorten__result__short .btn')
        const range = document.createRange()

        range.selectNode(shortLink)
        window.getSelection().removeAllRanges()
        window.getSelection().addRange(range)
        document.execCommand('copy')
        window.getSelection().removeAllRanges()

        divBtns.forEach( btn => {
            btn.innerHTML = 'Copy'
            btn.classList.remove('copied')
        })

        divBtn.innerText = 'Copied!'
        divBtn.classList.add('copied')
    })

    resultsContainer.appendChild(div)
}

async function getShortLink(link) {
    try {
        const response = await fetch(`https://api.shrtco.de/v2/shorten?url=${link}`)
        const data = await response.json()
        const result = await data.result
        render(result.original_link, result.full_short_link)
        saveResults(result.original_link, result.full_short_link)
    } catch {
        showError()
    }
}

function clearError() {
    const errorMessage = document.querySelector('.shorten__error-message')
    
    if (errorMessage !== null) {
        shortenInputBox.removeChild(errorMessage)
    }

    shortenInput.classList.remove('shorten__input--error')
}

function showError() {
    clearError()

    const errorMessage = document.createElement('span')
    errorMessage.classList.add('shorten__error-message')
    errorMessage.innerText = 'Please add a valid link'
    
    shortenInputBox.appendChild(errorMessage)

    shortenInput.classList.add('shorten__input--error')
}

function clearInput() {
    shortenInput.value = ''
}

function isValidLink(link) {
    const regex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
    return regex.test(link)
}

function checkInput(evt) {
    evt.preventDefault()
    let link = shortenInput.value
    if (isValidLink(link)) {        
        getShortLink(link)
        clearInput()
    } else {
        showError()
    }
}

shortenedLinks.forEach( result => {
    render(result.originalLink, result.shortenedLink)
})

shortenInput.addEventListener('click', clearError)

shortenBtn.addEventListener('click', checkInput)
