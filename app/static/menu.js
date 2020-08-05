const mainDiv = document.querySelector("#mainDiv");
const menuDiv = document.querySelector("#menuDiv");

let content;

const checkChrome = () => {
  let notChrome = !/Chrome/.test(navigator.userAgent)
  if (notChrome) {
    document.querySelector("#modalBtn").click();
  }

}




// generate each menu item
const generateMenuItem = (lesson,i) => {

  let newElement = document.createElement("a");
  newElement.classList.add('list-group-item', 'list-group-item-action');
  newElement.index=i;
  newElement.innerText = `${lesson.title}`;
  // add the event listener that listens for a click on the week
  newElement.addEventListener('click', function () {
    $(".list-group-item").removeClass("bg-success font-weight-bold");
    this.classList.add("bg-success", "font-weight-bold");
    generateMain(content[this.index]);
  })
  menuDiv.append(newElement);
}




//generate the entire menu
const generateMenu = (content) => {
  let i = 0;
  for (lesson of content) {
    generateMenuItem(lesson,i);
    i++;
  }

}




//generate each individual card
const generateMainCard = (tool) => {
  let newElement = document.createElement('a');
  newElement.href=tool.link;
  newElement.target="_blank";
  newElement.classList.add('card');
  if (tool.image==="any"){

  }

  let domString = `
  <img class="card-img-top" src="${tool.image}" alt="Card image cap">
  <div class="card-body">
    <h5 class="card-title">${tool.title}</h5>
    <p class="card-text">${tool.description}</p>
  </div>
  `;

  newElement.innerHTML = domString;
  document.querySelector('#cardDeckDiv').append(newElement);
}





//generate the jumbotron
const generateJumbotron = (lesson) => {
  mainDiv.innerHTML = "";
  let newElement = document.createElement('div');
  newElement.classList.add("jumbotron","jumbotron-fluid","shadow","rounded");
  newElement.style.backgroundImage=`url(${lesson.image})`
  newElement.id="jumbotronDiv";
  let domString = `
  <div id="jumboTitle" class="container text-black">
    <h1 class="display-5">${lesson.title}</h1>
    <p class="lead"></p>
  </div>
  `;

  newElement.innerHTML = domString;
  mainDiv.append(newElement);
  
  // now make a card deck below the jumbotron
  let divElement = document.createElement('div');
  divElement.classList.add("card-deck","mt-4");
  divElement.id = "cardDeckDiv";
  mainDiv.append(divElement);
}






// generate the jumbotron and main cards
const generateMain = async (lesson) => {
    generateJumbotron(lesson);
    for (let resource of lesson.resources) {
      generateMainCard(resource);
    }
  }





//Done with functions MAIN CODE************

checkChrome();

//get the json data via axios
axios.get('/static/content.json')
  .then((response) => {
    content = response.data;
    generateMenu(content);
  });


setTimeout(()=>{
    document.querySelector('.list-group-item').click();
},100)










