const brainOutput = document.querySelector('#brainOutput');
const trainBtn = document.querySelector('#trainBtn');
const counter = document.querySelector('#counter');
const updateDataBtn = document.querySelector('#updateDataBtn');
let net = new brain.recurrent.LSTM();
let running = false;
const trainingDiv = document.querySelector('#trainingDiv');
const testText = document.querySelector('#testText');
const testBtn = document.querySelector('#testBtn');
let trainingData = [];
const JSONTextArea = document.querySelector('#JSONTextArea');
const addBtn = document.querySelector('#addBtn');
const iterationsInput = document.querySelector('#iterationsInput');
let showAll = false;
const commentsPerPage = 30;
const showAllBtn = document.querySelector('#showAllBtn');
const newInput = document.querySelector('#newInput');
const newOutput = document.querySelector('#newOutput');
const resultDiv = document.querySelector('#resultDiv');
const resultBtn = document.querySelector('#resultBtn');
const modalBtn = document.querySelector('#modalBtn');
const modalBody = document.querySelector('.modal-body');
let recentDataObj = {};
let labelData = false;

// Get a reference to the database service
const dbRef = firebase.database().ref();
const jodelRef = dbRef.child('jodels');
///create the table from snapshot
jodelRef.orderByKey().on('value', (snapshot) => {
	const jodelsObj = snapshot.val();
	recentDataObj = jodelsObj;
	populateTrainingDiv(jodelsObj);
	trainingData = Object.values(jodelsObj);
});

//https://mlbrain-855e7.firebaseio.com/

//Populate all of the comments in a table
const populateTrainingDiv = (data) => {
	let correct = 0;
	let incorrect = 0;
	trainingDiv.innerHTML = '';
	let newElement = document.createElement('table');
	newElement.classList.add('table-striped', 'table');
	let newHTML = `
    <thead>
    <tr>
      <th scope="col">Input</th>
      <th scope="col">Human Label</th>
      <th scope="col">Machine Learning Label</th>
      <th scope="col">Remove</th>
    </tr>
    </thead>
    <tbody>`;
	// data = data.reverse();
	// if (!showAll) {
	//   data = data.slice(0, commentsPerPage);
	// }
	for (let c in data) {
		const humanLabel = data[c].output;
		let machineLabel = '';
		if (labelData) {
			machineLabel = calculateOutput(data[c].input);
			humanLabel === machineLabel ? (correct += 1) : (incorrect += 1);
		}
		newHTML =
			`
      <tr>
      <td scope="row" class="inputCell">
      ${labelData
			? humanLabel === machineLabel
				? "<span class='iconSpan mr-4'>✅</span>"
				: "<span class='iconSpan mr-4'>❌</span>"
			: ''}
        ${data[c].input}</td>
      <td class="font-weight-bold ${humanLabel === 'sad' ? 'text-danger' : 'text-success'}">${humanLabel}</td>
      <td class="font-weight-bold ${machineLabel === 'sad'
			? 'text-danger'
			: machineLabel === 'happy' ? 'text-success' : 'text-warning'}">${machineLabel}</td>
      <td class="remove_icon font-weight-bold text-danger" commentID="${c}">X</td>
      </tr>` + newHTML;
	}
	newHTML += '</tbody>';
	newElement.innerHTML = newHTML;
	trainingDiv.append(newElement);
	brainOutput.innerHTML = `<pre>${correct} ✅     ${incorrect} ❌     ${(correct / (correct + incorrect)).toFixed(
		2
	)} %</pre>`;

	// add a listener for the delete comment button
	document.querySelectorAll('.remove_icon').forEach((item) => {
		item.addEventListener('click', (event) => {
			i = item.getAttribute('commentID');
			if (hashCode(newInput.value) === 1395200157) {
				jodelRef.child(i).remove();
			}
		});
	});
	//add a listener that will allow you to move comment to the test input
	document.querySelectorAll('.inputCell').forEach((item) => {
		item.addEventListener('click', (event) => {
			i = item.innerText;
			testText.value = i;
			testBtn.click();
		});
	});
};

//train the data
const trainData = () => {
	if (running) {
		console.log('already running train');
		return 0;
	} else {
		running = true;
	}
	console.log('starting the train!');
	let i = 0;
	let iterations = parseInt(iterationsInput.value);
	net.train(trainingData, {
		//   // Defaults values --> expected validation
		iterations: iterations, // the maximum times to iterate the training data --> number greater than 0
		errorThresh: 0.07, // the acceptable error percentage from training data --> number between 0 and 1
		log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
		logPeriod: 100, // iterations between logging out --> number greater than 0
		//   // learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
		//   // momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
		callback: function(stats) {
			counter.innerText = `Model Error: ${stats.error}`;
		},
		callbackPeriod: 100 // the number of iterations through the training data between callback calls --> number greater than 0
		//timeout: 15000 // the max number of milliseconds to train for --> number greater than 0
	});
	console.log('Training Complete!');
	trainBtn.classList.remove('disabled');
	trainBtn.innerText = 'Train';
	running = false;
	labelData = true;
	populateTrainingDiv(recentDataObj);
	JSONTextArea.innerText = '';
	JSONTextArea.innerText = JSON.stringify(net.toJSON());
	testData();
};

//test the data in the test input box
const testData = () => {
	if (JSONTextArea.value.length < 1000) {
		modalBody.innerText = 'Train the Network First';
		modalBtn.click();
		return;
	}
	net.fromJSON(JSON.parse(JSONTextArea.value));
	brainOutput.innerText = '';
	console.log('running test');
	const output = net.run(testText.value); // 'happy'
	setTimeout(() => {
		if (output === 'happy') modalBody.innerText = 'Happy 😃';
		else if (output === 'sad') modalBody.innerText = 'Sad 😢';
		else modalBody.innerText = 'Unable to decipher 🤖';
		modalBtn.click();
	}, 100);
};

//make test button run the test
testBtn.addEventListener('click', () => {
	testData();
});

//make train button run the training
trainBtn.addEventListener('click', () => {
	trainBtn.innerText = 'Training...';
	counter.innerText = 'This will take up to 15 minutes..';
	trainBtn.classList.add('disabled');
	setTimeout(trainData, 200);
});

// showAllBtn.addEventListener('click', () => {
//   showAll = !showAll;
//   showAllBtn.innerText = showAll ? "Show Recent" : "Show All";
//   updateDataBtn.click();
// });

// //kick it off by building the entire comment table
// generateTable();

/// this will add a new jodel to the database
addBtn.addEventListener('click', (e) => {
	e.preventDefault();
	const input = newInput.value;
	if (input.indexOf('<') > -1) {
		newInput.value = '';
		return false;
	}
	const output = newOutput.value;
	if (!output) {
		return false;
	}
	const newPostKey = jodelRef.push().key;
	const newJodel = {};
	newJodel[newPostKey] = {
		input,
		output
	};
	newInput.value = '';
	newOutput.value = '';
	return jodelRef.update(newJodel);
});

const createSVG = () => {
	let options = {
		height: 1500,
		width: 1500
	};
	if (JSONTextArea.value.length < 1000) {
		brainOutput.innerText = 'Train the Network First';
		return;
	}
	net.fromJSON(JSON.parse(JSONTextArea.value));
	resultDiv.innerHTML = brain.utilities.toSVG(net, options);
};

resultBtn.addEventListener('click', () => {
	resultDiv.innerHTML = '';
	createSVG();
});

const hashCode = (s) =>
	s.split('').reduce((a, b) => {
		a = (a << 5) - a + b.charCodeAt(0);
		return a & a;
	}, 0);

const calculateOutput = (t) => {
	if (JSONTextArea.value.length < 1000) {
		return 'No model trained';
	}
	const output = net.run(t); // 'happy'
	if (output === 'happy') return 'happy';
	else if (output === 'sad') return 'sad';
	else return 'Unable to decipher';
};

const fillModel = () => {
	axios.get('static/trainedNet_2.txt').then((res) => {
		document.querySelector('#JSONTextArea').value = JSON.stringify(res.data);
		net.fromJSON(JSON.parse(JSONTextArea.value));
		labelData = true;
		populateTrainingDiv(recentDataObj);
	});
};
