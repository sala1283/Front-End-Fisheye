async function getPhotographers() {
    const response = await fetch("./data/photographers.json")
    const photographers_data = await response.json()
    const photographers = photographers_data.photographers
    return ({photographers: [...photographers]})
}

async function displayData(photographers) {
    const photographersSection = document.querySelector(".photographer_section");
    photographers.forEach((photographer) => {
        const photographerModel = photographerTemplate(photographer);
        const userCardDOM = photographerModel.getUserCardDOM();
        photographersSection.appendChild(userCardDOM);
    });
}

async function init() {
    const { photographers } = await getPhotographers();
    displayData(photographers);
}

init();