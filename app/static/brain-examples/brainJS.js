const brainOutput = document.querySelector("#brainOutput");
const trainBtn = document.querySelector("#trainBtn");
const counter = document.querySelector("#counter");
const updateDataBtn = document.querySelector("#updateDataBtn");
let net = new brain.recurrent.LSTM();
let running = false;
const trainingDiv = document.querySelector('#trainingDiv');
const testText = document.querySelector('#testText');
const testBtn = document.querySelector('#testBtn');
let trainingData = [];
const JSONTextArea = document.querySelector("#JSONTextArea");
const addBtn = document.querySelector("#addBtn");
const iterationsInput = document.querySelector("#iterationsInput");
let showAll = false;
const commentsPerPage=30;
const showAllBtn = document.querySelector('#showAllBtn');

//get the json data via axios
const generateTable = () => {
  axios.get('mlData')
    .then((response) => {
      trainingData = response.data;
      populateTrainingDiv(trainingData);
    });
}

//Populate all of the comments in a table
const populateTrainingDiv = (data) => {
  trainingDiv.innerHTML = "";
  let newElement = document.createElement('table');
  newElement.classList.add('table-striped', 'table');
  let newHTML = `
    <thead>
    <tr>
      <th scope="col">ID</th>
      <th scope="col">Input</th>
      <th scope="col">Output</th>
      <th scope="col">Remove</th>
    </tr>
    </thead>
    <tbody>`;
    data=data.reverse();
  if (!showAll) {
    data = data.slice(0,commentsPerPage);
  }
  for (let c of data) {
    newHTML += `
      <tr>
      <td scope="row">${c.id}</th>
      <td class="inputCell" >${c.input}</td>
      <td>${c.output}</td>
      <td class="remove_icon font-weight-bold text-danger" commentID="${c.id}">X</td>

      </tr>`;
  }
  newHTML += "</tbody>"
  newElement.innerHTML = newHTML;
  trainingDiv.append(newElement);

  // add a listener for the delete comment button
  document.querySelectorAll(".remove_icon").forEach(item => {
    item.addEventListener('click', event => {
      i = item.getAttribute('commentID');
      console.log(i);
      axios.delete('mlData', { params: { id: i } })
        .then((response) => {
          generateTable();
        });
    });
  });
  //add a listener that will allow you to move comment to the test input
  document.querySelectorAll(".inputCell").forEach(item => {
    item.addEventListener('click', event => {
      i = item.innerText;
      console.log(i);
      testText.value = i;
      testBtn.click();
    });
  });


  //train the data 
}
const trainData = () => {
  if (running) {
    console.log('already running train');
    return 0;
  }
  else {
    running = true;
  }
  console.log('starting the train!')
  let i = 0;
  let iterations = parseInt(iterationsInput.value);
  net.train(trainingData, {
    //   // Defaults values --> expected validation
    iterations: iterations, // the maximum times to iterate the training data --> number greater than 0
    errorThresh: 0.005, // the acceptable error percentage from training data --> number between 0 and 1
    log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
    logPeriod: 100, // iterations between logging out --> number greater than 0
    //   // learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
    //   // momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
    callback: function (stats) {
      counter.innerText = `Model Error: ${stats.error}`;
    },
    callbackPeriod: 100 // the number of iterations through the training data between callback calls --> number greater than 0
    //timeout: 15000 // the max number of milliseconds to train for --> number greater than 0
  });
  console.log('Training Complete!')
  running = false;
  JSONTextArea.innerText = "";
  JSONTextArea.innerText = JSON.stringify(net.toJSON());
  testData();
}

//test the data in the test input box
const testData = () => {
  brainOutput.innerText = "Evaluating.."
  if (JSONTextArea.value.length < 1000) {
    brainOutput.innerText = "Train the Network First";
    return;
  }
  net.fromJSON(JSON.parse(JSONTextArea.value));
  brainOutput.innerText = "";
  console.log('running test');
  const output = net.run(testText.value); // 'happy'
  console.log(output);
  setTimeout(() => {
    brainOutput.innerText = output;
  }, 1000)

}



//make test button run the test
testBtn.addEventListener('click', () => {
  testData();
})

//make train button run the training
trainBtn.addEventListener('click', () => {
  trainBtn.innerText = "Training..."
  console.log(this);
  counter.innerText = "This will take up to 15 minutes..";
  trainBtn.classList.add('disabled');
  setTimeout(trainData, 200);
});

//refresh the tabl when you click update button
updateDataBtn.addEventListener('click', () => {
  generateTable();
});

showAllBtn.addEventListener('click',()=>{
  showAll=!showAll;
  showAllBtn.innerText=showAll ? "Show Recent" : "Show All";
  updateDataBtn.click();
});



//kick it off by building the entire comment table
generateTable();


