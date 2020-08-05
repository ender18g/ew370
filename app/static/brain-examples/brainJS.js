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

//get the json data via axios
const generateTable = () => {
  axios.get('mlData')
    .then((response) => {
      trainingData = response.data;
      populateTrainingDiv(trainingData);
    });
}




const populateTrainingDiv = (data) => {
  trainingDiv.innerHTML = "";
  let i = 0;
  let newElement = document.createElement('table');
  newElement.classList.add('table-striped', 'table');
  let newHTML = `
    <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Input</th>
      <th scope="col">Output</th>
      <th scope="col">Remove</th>
    </tr>
    </thead>
    <tbody>`;

  for (let c of data) {
    newHTML += `
      <tr>
      <td scope="row">${i}</th>
      <td class="inputCell" >${c.input}</td>
      <td>${c.output}</td>
      <td class="remove_icon font-weight-bold text-danger" numProp="${i}">X</td>

      </tr>`;
    i++;
  }
  newHTML += "</tbody>"
  newElement.innerHTML = newHTML;
  trainingDiv.append(newElement);

  document.querySelectorAll(".remove_icon").forEach(item => {
    item.addEventListener('click', event => {
      i = item.getAttribute('numProp');
      console.log(i);
      axios.get('mlData/remove/' + i)
        .then((response) => {
          trainingData = response.data;
          populateTrainingDiv(trainingData);
        });
    });
  });

  document.querySelectorAll(".inputCell").forEach(item => {
    item.addEventListener('click', event => {
      i = item.innerText;
      console.log(i);
      testText.value = i;
    });
  });



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
  // const data = [
  //   { input: 'I feel great about the world!', output: 'happy' },
  //   { input: 'The world is a terrible place!', output: 'sad' },
  // ];
  net.train(trainingData, {
    //   // Defaults values --> expected validation
    iterations: 600, // the maximum times to iterate the training data --> number greater than 0
    errorThresh: 0.012, // the acceptable error percentage from training data --> number between 0 and 1
    log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
    logPeriod: 100, // iterations between logging out --> number greater than 0
    //   // learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
    //   // momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
    callback: function (e) {
      counter.innerText=JSON.stringify(e);
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

const testData = () => {
  net.fromJSON(JSON.parse(JSONTextArea.value));
  brainOutput.innerText = "";
  console.log('running test');
  const output = net.run(testText.value); // 'happy'
  console.log(output);
  brainOutput.innerText = output;
}

testBtn.addEventListener('click', () => {
  testData();
})

trainBtn.addEventListener('click', () => {
  trainBtn.innerText = "Training..."
  console.log(this);
  counter.innerText = "This will take up to 15 minutes..";
  trainBtn.classList.add('disabled');
  setTimeout(trainData, 200);
});

updateDataBtn.addEventListener('click', () => {
  generateTable();
});


generateTable();


