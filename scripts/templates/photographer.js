function childConstructor(css, data, tag = "p") {
    const child = document.createElement(tag)
    child.classList.add(css)
    if (tag == "img") {
        child.setAttribute("src", data)
    }
    else {
        child.textContent = data
    }
    return child
}

function photographerTemplate(data) {
    const { name, portrait, city, country, tagline, price, id } = data
    const portrait_path = `assets/photographers/${portrait}`
    function getUserCardDOM() {
        const article = document.createElement( 'article' )
        //Link & Image
            const link = document.createElement("a")
            link.setAttribute("href", "photographer.html?id="+id)
            const img = childConstructor("portrait", portrait_path, "img")
            link.appendChild(img)
            article.appendChild(link)
        //Information
            article.appendChild(childConstructor("name", name, "h2"))
            article.appendChild(childConstructor("localisation", city + ", " + country))
            article.appendChild(childConstructor("tagline", tagline))
            article.appendChild(childConstructor("price", price + "€/jour"))
        return article
    }
    return { name, portrait_path, getUserCardDOM }
}