function validateFirstName(first_name) {
    return (first_name.length > 1)
}
function validateLastName(last_name) {
    return (last_name.length > 1)
}
function validateEmail(email) {
    const emailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/
    return emailRegex.test(email)
}
function validateMessage(message) {
    return (message.length > 1)
}
function submitModal() {
    const firstname = document.getElementById("message_firstname").value
    const lastname = document.getElementById("message_lastname").value
    const email = document.getElementById("message_email").value
    const message_content = document.getElementById("message_content").value
    const isValid = validateFirstName(firstname) && validateLastName(lastname) && validateEmail(email) && validateMessage(message_content)
    if (isValid) {
        const message = firstname + " " + lastname + " (" + email + ") sent " + message_content
        console.log(message)
        toggleDialog("contact_modal")
    }
}
document.getElementsByTagName("form")[0].addEventListener('submit', (e) => {
    e.preventDefault()
})
//Create event listeners (click or enter)
//Dialogues
    function createEventListeners(button, id) {
        button.addEventListener('click', function() {
            toggleDialog(id)
        })
        button.addEventListener("keydown", (e) => {
            if (!e.repeat && e.key == "Enter") {
                toggleDialog(id)
            }
        })
        return button
    }
//Sorting options
function createSortingEventListeners(photographer) {
    const all_options = document.getElementsByClassName("option")
    for (let i=0; i<3;i++) {
        all_options[i].addEventListener('click', function() {
            manageSortingOptions(all_options[i])
            displayGallery(photographer)
        })
        all_options[i].addEventListener("keydown", (e) => {
            if (!e.repeat && e.key == "Enter") {
                manageSortingOptions(all_options[i])
                displayGallery(photographer)
            }
        })
    }
}
//Toggle Lightbox
function toggleDialog(id) {
    const dialog = document.getElementById(id)
    if (dialog.open) {
        dialog.close()
    }
    else {
        dialog.showModal()
    }
}
//Like
function likePhoto(id) {
    const photographer_likes_display = document.getElementById("total-likes")
    const photographer_likes = parseInt(photographer_likes_display.getAttribute("data-before"))
    const photo_likes_display = document.querySelector('[data-id="'+id+'"]')
    const photo_likes = parseInt(photo_likes_display.getAttribute("data-before"))
    if (photo_likes == parseInt(photo_likes_display.getAttribute("data-likes"))) {
        photographer_likes_display.setAttribute("data-before", photographer_likes+1)
        photo_likes_display.setAttribute("data-before", photo_likes+1)
    }
    else {
        photographer_likes_display.setAttribute("data-before", photographer_likes-1)
        photo_likes_display.setAttribute("data-before", photo_likes-1)
    }
}
//Data
async function getPhotographer(id) {
    const response = await fetch("./data/photographers.json")
    const photographers_data = await response.json()
    for (const photographer of photographers_data.photographers) {
        if (photographer.id == id) {
            //Get that photographer's media
                const photographer_media = []
                for (const media of photographers_data.media) {
                    if (media.photographerId == photographer.id) {
                        photographer_media.push(media)
                    }
                }
                photographer["media"] = photographer_media
            return photographer
        }
    }
    return false
}
//Sort
function manageSortingOptions(option) {
    const sorting = document.getElementById("sorting")
    const show_options = sorting.getAttribute("data-show-options") === "true"
    if (show_options) {
        const selected = document.getElementById("selected")
        selected.setAttribute("id", "unselected")
        option.setAttribute("id", "selected")
    }
    sorting.setAttribute("data-show-options", !show_options)
    console.log(show_options)
}
function sortMedia(photographer) {
    //Get selected sorting option
        let selected = document.getElementById("selected").getAttribute("data-option")
    //Get a list of the relevant information
        let sorting = []
        for (let i = 0; i < photographer.media.length; i++) {
            let media = photographer.media[i]
            sorting.push([media[selected], media["id"]])
        }
    //Apply the relevant sorting algorithm
        if (selected == "likes") {
            sorting.sort(function(a, b){return b[0] - a[0]})
        }
        else {
            sorting.sort()
        }
    //Create an array of media based on that sorted list
        let sorted_media = []
        for (let i = 0; i<sorting.length; i++) {
            photographer.media.forEach(media => {
                if (sorting[i][1] == media.id) {
                    sorted_media.push(media)
                }
            })
        }
    return sorted_media
}
//Generate page
async function updateHeader(photographer) {
    const { name, portrait, city, country, tagline } = photographer
    const portrait_path = `assets/photographers/${portrait}`
    document.getElementById("name").innerHTML = name
    document.getElementById("localisation").innerHTML = city + ", " + country
    document.getElementById("tagline").innerHTML = tagline;
    document.getElementById("portrait").setAttribute("src", portrait_path)
    document.getElementById("portrait").setAttribute("alt", "Portrait de " + name)
    createSortingEventListeners(photographer)
}
//Create article (These contain the thumbnail, title, and like button/count.)
function createArticle(photographer, media) {
    const article = document.createElement("article")
    //Thumbnail
        let thumbnail
        if (media.image) {
            thumbnail = document.createElement("img")
            const file_path = "assets/photos/"+photographer.id+"/"+media.image
            thumbnail.setAttribute("src", file_path)
        }
        else {
            thumbnail = document.createElement("video")
            const file_path = "assets/photos/"+photographer.id+"/"+media.video
            const video_source = document.createElement("source")
            video_source.setAttribute("src", file_path)
            thumbnail.appendChild(video_source)
        }
        thumbnail.setAttribute("tabindex", "0")
        thumbnail.setAttribute("alt", media.title + " closeup")
        thumbnail.classList.add("thumbnail")
        thumbnail = createEventListeners(thumbnail, media.id)
        article.appendChild(thumbnail)
    //Title & Likes
        const information_container = document.createElement("div")
        //Title
            const title = document.createElement("p")
            title.classList.add("title")
            title.textContent = media.title
            information_container.appendChild(title)
        //Likes
            const heart = document.createElement("button")
            heart.classList.add("like-button", "heart")
            heart.setAttribute("data-before", media.likes)
            heart.setAttribute("data-likes", media.likes)
            heart.setAttribute("data-id", media.id)
            heart.setAttribute("onclick","likePhoto("+media.id+")")
            heart.setAttribute("aria-label", "likes")
            information_container.appendChild(heart)
        article.appendChild(information_container)
    return article
}

//Create lightbox
function createLightbox(photographer, media, previousID) {
    let lightbox = document.createElement("dialog")
    lightbox.setAttribute("id", media.id)
    lightbox.classList.add("lightbox")
    //Blocker
        let blocker = document.createElement("button")
        blocker.setAttribute("style","outline:none")
        lightbox.appendChild(blocker)
    //Previous
        let previous = document.createElement("img")
        previous.setAttribute("src","assets/icons/arrow.png")
        previous.setAttribute("alt","Previous")
        previous.classList.add("dialog_arrow")
        let previous_button = document.createElement("button")
        previous_button.appendChild(previous)
        previous_button.onclick = function () {
            toggleDialog(media.id)
            if (previousID) {
                toggleDialog(previousID)
            }
        }
        lightbox.appendChild(previous_button)
        lightbox.addEventListener("keydown", (e) => {
            if (!e.repeat && e.key == "ArrowLeft") {
                toggleDialog(media.id)
                if (previousID) {
                    toggleDialog(previousID)
                }
            }
        })
    //Media container
        const media_container = document.createElement("div")
        media_container.classList.add("dialog_media")
        //Media
            if (media.image) {
                const image = document.createElement("img")
                const file_path = "assets/photos/"+photographer.id+"/"+media.image
                image.setAttribute("src", file_path)
                media_container.appendChild(image)
            }
            else {
                let video = document.createElement("video")
                const file_path = "assets/photos/"+photographer.id+"/"+media.video
                const video_source = document.createElement("source")
                video_source.setAttribute("src", file_path)
                video.appendChild(video_source)
                media_container.appendChild(video)
            }
        //Title
            const title = document.createElement("p")
            title.classList.add("title")
            title.textContent = media.title
            media_container.appendChild(title)
        lightbox.appendChild(media_container)
    //Right
        const next_container = document.createElement("div")
        next_container.classList.add("dialog_right")
        //Exit
            let exit = document.createElement("img")
            exit.setAttribute("src","assets/icons/close-24px.png")
            exit.setAttribute("alt","Exit")
            let exit_button = document.createElement("button")
            exit_button.appendChild(exit)
            exit_button.onclick = function () {
                toggleDialog(media.id)
            }
            next_container.appendChild(exit_button)
        //Next
            let next = document.createElement("img")
            next.setAttribute("src","assets/icons/arrow.png")
            next.setAttribute("alt","Next")
            next.classList.add("dialog_arrow")
            let next_button = document.createElement("button")
            next_button.appendChild(next)
            next_button.onclick = function () {
                toggleDialog(media.id)
            }
            next_container.appendChild(next_button)
        //Spacer
            next_container.appendChild(document.createElement("div"))
        lightbox.appendChild(next_container)
    //Update previous Lightbox's next events
        if (previousID) {
            const previous_article = document.getElementById(previousID)
            previous_article.getElementsByClassName("dialog_arrow")[1].parentElement.onclick = function () {
                toggleDialog(previousID)
                toggleDialog(media.id)
            }
            previous_article.addEventListener("keydown", (e) => {
                if (!e.repeat && e.key == "ArrowRight") {
                    toggleDialog(previousID)
                    toggleDialog(media.id)
                }
            })
        }
    return lightbox
}

async function displayGallery(photographer) {
    const gallery = document.getElementById("gallery")
    //Empty gallery
        while (gallery.firstChild) {
            gallery.removeChild(gallery.firstChild);
        }
    const sorted_media = sortMedia(photographer)
    //previousID exists so that lightboxes can have previous and next buttons
        let previousID
    sorted_media.forEach(media => {
        gallery.appendChild(createArticle(photographer, media))
        gallery.appendChild(createLightbox(photographer, media, previousID))
        previousID = media.id
    })
}

async function updateAside(photographer) {
    const display = document.getElementById("total-likes")
    let likes = 0
    for (const media of photographer.media) {
        likes += media.likes
    }
    display.setAttribute("data-before", likes)
    document.getElementById("price").textContent = photographer.price + "€ / jour"
}

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const photographer_id = urlParams.get('id')
    const photographer = await getPhotographer(photographer_id)
    if (!photographer) {
        window.location = "index.html"
    }
    updateHeader(photographer)
    displayGallery(photographer)
    updateAside(photographer)
}

init()