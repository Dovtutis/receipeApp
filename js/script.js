const mealsEl = document.getElementById('meals');
const favoriteContainer = document.getElementById('fav-meals');
const searchTerminal =  document.getElementById('search-terminal');
const searchBtn = document.getElementById('search');
const mealPopup = document.getElementById('meal-popup');
const popupCloseBtn = document.getElementById('close-popup');
const mealInfoEl = document.getElementById('meal-info');


getRandomMeal();
fetchFavoriteMeals()

async function getRandomMeal() {
    // let randomMeal;
    //
    // await fetch('https://www.themealdb.com/api/json/v1/1/random.php') //await makes function to stop until promise is got
    //     .then(response => response.json())
    //     .then(data =>{
    //         randomMeal = data;
    //     })

    //OR

    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const responseData = await response.json();
    const randomMeal = responseData.meals[0];

    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const responseData = await response.json();
    const meal = responseData.meals[0];

    return meal;
}

async function getMealsBySearch(term) {

    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
    const responseData = await response.json();
    const meals = responseData.meals;

    return meals;
}

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add("meal");

    meal.innerHTML =
        `
                <div class="meal-header">
                    ${random ? `<span class="random">Random Recipe</span>` : ''} <!--Jei random true tada -->
                    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
                </div>
                <div class="meal-body">
                    <h4>${mealData.strMeal}</h4>
                    <button class="fav-btn">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
        `;

    const btn = meal.querySelector('.meal-body .fav-btn');
    const mealImg = meal.querySelector("img")

    btn.addEventListener("click", ()=>{
        if (btn.classList.contains('active')){
            removeMealFromLocalStorage(mealData.idMeal);
            btn.classList.remove('active');
            console.log(mealData);
        } else {
            addMealToLocalStorage(mealData.idMeal);
            btn.classList.add('active'); //Prideda arba nuema btn klase 'active'
            console.log(mealData);
        }
        fetchFavoriteMeals();
    });

    mealImg.addEventListener('click', () =>{
        showMealInfo(mealData)
    });

    meals.appendChild(meal);
}

function addMealToLocalStorage(mealId) {
    const mealIds = getMealsFromLocalStorage();
    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLocalStorage(mealId){
    const mealIds = getMealsFromLocalStorage();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)));
}

function getMealsFromLocalStorage() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return mealIds === null ? [] : mealIds;
}

async function fetchFavoriteMeals() {
    favoriteContainer.innerHTML = '';
    const mealIds = getMealsFromLocalStorage();
    const meals = [];

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);
        addMealToFavorite(meal);
    }
}

function addMealToFavorite(mealData) {
    const favoriteMeal = document.createElement('li');

    favoriteMeal.innerHTML =
        `
                    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
                    <span>${mealData.strMeal}</span>
                    <button class="clear"><i class="fas fa-window-close"></i></button>
        `;

    const btn = favoriteMeal.querySelector(".clear");
    const favMealImg = favoriteMeal.querySelector("img")

    btn.addEventListener('click', () =>{
        removeMealFromLocalStorage(mealData.idMeal);
        fetchFavoriteMeals();
    });


    favMealImg.addEventListener('click', () =>{
        showMealInfo(mealData)
    });

    favoriteContainer.appendChild(favoriteMeal);
}

function showMealInfo (mealData) {
    //clean it up
    mealInfoEl.innerHTML = '';

    //update the meal info
    const mealEl = document.createElement('div');

    //get ingredients and measures
    const ingredients = [];

    for (let i = 1; i < 20; i++) {
        if (mealData['strIngredient'+i]){
            ingredients.push(`${mealData['strIngredient'+i]} - ${mealData['strMeasure'+i]}`)
        }else {
            break;
        }
    }
    console.log(ingredients)
    mealEl.innerHTML =
        `
                <h1>${mealData.strMeal}</h1>
                <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
                <p>
                    ${mealData.strInstructions}
                </p>
                <h3>Ingredients:</h3>
                <ul>
                    ${ingredients.map(ingredient => `
                    <li>${ingredient}</li>
                    `).join('')}
                </ul>
        `

    mealInfoEl.appendChild(mealEl);

    //show the popup
    mealPopup.classList.remove('hidden');

}

searchBtn.addEventListener("click", async()=>{
    mealsEl.innerHTML = '';
    const search = searchTerminal.value;
    const meals = await getMealsBySearch(search);

    if (meals){
        meals.map(meal =>{
            addMeal(meal);
        });
    }
});

popupCloseBtn.addEventListener("click", ()=>{
    mealPopup.classList.add('hidden');
})






























