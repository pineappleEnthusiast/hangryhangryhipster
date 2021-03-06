
let userGlobalID = null;

window.onload = event => {
    // Firebase authentication goes here.
    firebase.auth().onAuthStateChanged(user => {
    if (user) {
        // Console log the user to confirm they are logged in
        console.log("Logged in as: " + user.displayName);
        const googleUserId = user.uid;
        userGlobalID = googleUserId;
        //recipeFeed();   
        generateRecipeFeed(); 
        loadFavStyle();  
    } else {
      // If not logged in, navigate back to login page.
      window.location = "index.html";
    }
  });
};

//for testing: apiKey = 26d5ee965b7041448718ba0f2475dc94
//for deploy: apiKey = xxx 
// function recipeFeed() {
//     //will return 5078 recipe cards for browsing
//     //
//     const spoonacularURL = "https://api.spoonacular.com/recipes/random"

//     const apiKey = "26d5ee965b7041448718ba0f2475dc94"

//     const authorizedURL = spoonacularURL + "?apiKey=" + apiKey + "&number=100"

//     fetch(authorizedURL)
//     .then(response => {
//         return response.json();
//     })
//     .then(myjson => {
//         //THIS IS WHERE YOU HANDLE THE RESPONSE JSON
//         console.log(myjson);
//         storeRecipes(myjson)
//     });
// }

//to avoid filling api request quota
// function storeRecipes(myjson){
//     console.log('entered')
//     firebase
//         .database()
//         .ref(`recipes`)
//         .push({
//             JSONObj: myjson
//         });
//     const recipes = firebase.database().ref(`recipes`);
//     recipes.on("value", snapshot => {
//         const data = snapshot.val();
//         console.log(data)
//   });
// };

let globalRecipeData = null

function generateRecipeFeed(){
    const recipes = firebase.database().ref(`recipes`);
    recipes.on("value", snapshot => {
        const data = snapshot.val();
        globalRecipeData = data;
        let recipeArray = exploreData(globalRecipeData);
        renderDataAsHTML(recipeArray);
  });
}

function exploreData(data){
    let jsonObj = null;
    for(let item in data){
        jsonObj = data[item].JSONObj.recipes;
        //console.log(jsonObj);
    };
    // console.log(jsonObj[0])
    // for(let item in jsonObj){
    //     console.log(jsonObj[item])
    // }
    return jsonObj;
}

let recipeGlobalIDArr = []

const createCard = (recipeData) => {

    let id = recipeData.id;
    recipeGlobalIDArr.push(id)
    let image = recipeData.image;
    let title = recipeData.title;
    let source = recipeData.spoonacularSourceUrl;

    if(image===undefined){
        image="https://media.istockphoto.com/photos/question-mark-made-of-corn-seeds-on-plate-picture-id467083203?k=6&m=467083203&s=612x612&w=0&h=pfMfAgrliETJB2cUsxQBIkSXNlAKT4gf4hEEz80r4Hw="
    }    
    let path = "users/"+userGlobalID+"/favorites"
  return `
            <div class="col-sm-3">
                <div class="panel d--flex align-items-stretch px-0 mb-3" style="background:white;border:none;">
                <div class="panel-heading" style="padding:0px;">
                <button type="button" class="btn" data-toggle="modal" data-target="#myModal" style="padding:0px;" onclick="fillModal(${id})"><img src="${image}" alt="${title}" style="object-fit:cover;width:100%;background-color:black;"></button></div>

                    <div class="panel-body" style="text-align:center;height:2.75vw;">
                        <a href="${source}" target="_blank" style="font-size:1.75vw;font-family:Staatliches;display: block;
                        display: -webkit-box;margin: 0 auto;-webkit-line-clamp: 3;-webkit-box-orient: vertical;overflow: hidden;
                        text-overflow: ellipsis;}">${title}</a> 
                    </div class="panel-footer">
                    <br> <br> <br> <br> <br> 
                        <button class="btn" onclick="updateFavorites(${id})"><i id="${id}" class="favme glyphicon glyphicon-heart"></i></button>    
                                     
                </div>
            </div>`      
}

function loadFavStyle(id){
    console.log('loading fav styles')
        firebase.database().ref(`users/${userGlobalID}/favorites`)
            .once('value', s => {
                if (s.exists()) {
                    for(item in recipeGlobalIDArr){
                        let id = recipeGlobalIDArr[item];
                        let favme = document.getElementById(id) 
                        //console.log(id)
                        for(let item in Object.keys(s.val())){
                            idFavs = s.val()[Object.keys(s.val())[item]].recipeID;
                            //console.log(idFavs)
                            if(idFavs==id){
                                console.log('already favorited')
                                favme.classList.add('mystyle')
                            }
                        }
                    }
                }
            })
}

const renderDataAsHTML = (data) => {
    //let cards = `<div class="card-deck"></div>`;
    //console.log(data)
    let cards = ""
    for (let item in data) {
        //console.log(data[item])
        cards+=createCard(data[item])
  }
  document.querySelector("#app").innerHTML = cards;

};


function updateFavorites(id){
    console.log('entered')
    favme = document.getElementById(id) 

    if(!favme.classList.contains('mystyle')){
        favme.classList.add('mystyle');
        console.log('favorited')
        firebase
            .database()
            .ref(`users/${userGlobalID}/favorites`)
            .push({
                recipeID: id
            });
    }
    else{
        favme.classList.remove('mystyle');
        console.log('unfavorited')
        firebase.database().ref(`users/${userGlobalID}/favorites`)
        .once('value', s => {
            if (s.exists()) {
                for(let item in Object.keys(s.val())){
                    idStored = s.val()[Object.keys(s.val())[item]].recipeID;
                    if(idStored==id){
                        console.log('match for delete')
                        let path = Object.keys(s.val())[item]
                        console.log(path)
                        s.ref.child(path).remove()
                    }
                }
                }
            })
                }
}

function fillModal(id){
    let myModalTitle = document.querySelector("#myModalTitle");
    let veg = document.querySelector("#veg");
    veg.classList.remove('hidden')
    let vegan = document.querySelector("#vegan");
    vegan.classList.remove('hidden')
    let gluten = document.querySelector("#gluten");
    gluten.classList.remove('hidden')
    let dairy = document.querySelector("#dairy");
    dairy.classList.remove('hidden')
    let healthy = document.querySelector("#healthy");
    healthy.classList.remove('hidden')
    let pop = document.querySelector("#pop");
    pop.classList.remove('hidden')
    let servings = document.querySelector("#servings");
    let ready = document.querySelector("#ready");
    let health = document.querySelector("#health");
    let price = document.querySelector("#price");
    let weight = document.querySelector("#weight");
    let summary = document.querySelector("#summary");
    let instructions = document.querySelector("#instructions");
    //console.log(id)
    const spoonacularURL = "https://api.spoonacular.com/recipes/"+id+"/information"
    const apiKey = "a1cb79d0212e4c9ead6e99ac93c0e730"
    const authorizedURL = spoonacularURL + "?apiKey=" + apiKey
    fetch(authorizedURL)
    .then(response => {
        console.log('fetching')
        return response.json();
    })
    .then(info => {
        //console.log(info)
        //THIS IS WHERE YOU HANDLE THE RESPONSE JSON
        myModalTitle.innerHTML = info.title;
        if(info.vegetarian==null || info.vegetarian==false){
            console.log('a')
            veg.classList.add("hidden")
        }
        if(info.vegan==null || info.vegan==false){
            console.log('b')
            vegan.classList.add("hidden")
        }
        if(info.glutenFree==null || info.glutenFree==false){
            console.log('c')
            gluten.classList.add("hidden")
        }
        if(info.dairyFree==null || info.dairyFree==false){
            console.log('d')
            dairy.classList.add("hidden")
        }
        if(info.veryHealthy==null || info.veryHealthy==false){
            console.log('e')
            health.classList.add("hidden")
        }
        if(info.veryPopular==null || info.veryPopular==false){
            console.log('f')
            pop.classList.add("hidden")
        }

        var table = document.querySelector("#table")
        if(info.servings!=null){
            table.rows[1].cells[0].innerHTML = info.servings;
        }
        if(info.readyInMinutes!=null){
            table.rows[1].cells[1].innerHTML = info.readyInMinutes;
        }
        if(info.healthScore!=null){
            table.rows[1].cells[3].innerHTML = info.healthScore;
        }
        if(info.pricePerServing!=null){
            table.rows[1].cells[4].innerHTML = info.pricePerServing;
        }
        if(info.weightWatcherSmartPoints!=null){
            table.rows[1].cells[2].innerHTML = info.weightWatcherSmartPoints;
        }
        if(info.summary!=null){
            summary.innerHTML=info.summary
        }
        if(info.instructions!=null){
            instructions.innerHTML=info.instructions
        }
    });
}

const searchBar = document.querySelector(".form-control");

searchBar.addEventListener(
  "keyup",
  e => {
      console.log("searching")
    const searchString = e.target.value.toLowerCase();
    //document.querySelector("#app").innerHTML = "";
        const spoonacularURL = "https://api.spoonacular.com/recipes/complexSearch"
        const apiKey = "6d3cfce4063241e5a17a8b18a188c0b0"
        const authorizedURL = spoonacularURL + "?apiKey=" + apiKey + "&query=" + searchString
        fetch(authorizedURL)
        .then(response => {
            console.log('fetching search')
            return response.json();
        })
        .then(results => {
            let arr=[];
            for(let item in results.results){
                arr.push(results.results[item])
            }
            
            if (arr.length !== 0) {
                //console.log("valid search")
            let cards = "";
            document.querySelector("#app").innerHTML = "";
            for (let result in arr) {
                cards += createCard(arr[result]);
                //console.log(arr[result]);
            }
            document.querySelector("#app").innerHTML = cards;
            } else {
            document.querySelector("#app").innerHTML = "No matches found. Try searching something else.";
            }
  });
});