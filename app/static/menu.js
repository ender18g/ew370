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
const generateMenuItem = async (lesson, i) => {

  let newElement = document.createElement("a");
  newElement.classList.add('list-group-item', 'list-group-item-action');
  newElement.id = `link_${i}`;
  newElement.innerText = `${lesson.title}`;
  // add the event listener that listens for a click on the week
  newElement.addEventListener('click', function () {
    $(".list-group-item").removeClass("bg-success font-weight-bold");
    this.classList.add("bg-success", "font-weight-bold");
    generateMain(content[i]);
    localStorage.setItem('curPage', this.id);
    console.log(this.id);
  })
  menuDiv.append(newElement);
  return true;
}




//generate the entire menu
const generateMenu = async (content) => {
  let i = 0;
  menuDiv.innerHTML = "";
  for (lesson of content) {
    generateMenuItem(lesson, i);
    i++;
  }
  return true;
}




//generate each individual card
const generateMainCard = (tool) => {
  let newElement = document.createElement('div');
  newElement.classList.add('card');

  let domString = `
  <a class="cardLink" href="${tool.link}"> 
  <img class="card-img-top" src="${tool.image}" alt="Card image cap">
  <div class="card-body">
    <h5 class="card-title">${tool.title}</h5>
    <p class="card-text">${tool.description}</p>
  </div></a>
  `;

  newElement.innerHTML = domString;
  document.querySelector('#cardRow').append(newElement);
}





//generate the jumbotron
const generateJumbotron = (lesson) => {
  mainDiv.innerHTML = `
  <div style="background-image:url(${lesson.image})"
  id="jumbotronDiv"
  class="jumbotron jumbotron-fluid shadow rounded">
    <div id="jumboTitle" class="container text-black">
      <h1 class="display-5">${lesson.title}</h1>
      <p class="lead"></p>
    </div>
  </div>
  <div class="container-fluid">
    <div id="cardRow" class="my-3 card-columns">
    </div>
  </div>`;

  // now make a card deck below the jumbotron
}






// generate the jumbotron and main cards
const generateMain = async (lesson) => {
  generateJumbotron(lesson);
  for (let resource of lesson.resources) {
    generateMainCard(resource);
  }
}





//Done with functions MAIN CODE************

// checkChrome();

// //get the json data via axios
// axios.get('/static/content.json')
//   .then((response) => {
//     content = response.data;
//     generateMenu(content);
//   });


// setTimeout(() => {
//   document.querySelector('.list-group-item').click();
// }, 100)






// Get a reference to the database service
const dbRef = firebase.database().ref();
const contentRef = dbRef.child('content');
///create the table from snapshot
contentRef.orderByKey().once("value", async snapshot => {
  content = snapshot.val();
  console.log(content);
  await generateMenu(content);

  let curPage = localStorage.getItem('curPage');
  if (curPage) {
    console.log(`got ${curPage} from storage`)
    document.querySelector(`#${curPage}`).click();
  }
  else {
    document.querySelector('.list-group-item').click();
  }

});

