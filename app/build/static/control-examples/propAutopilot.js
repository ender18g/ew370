var Engine = Matter.Engine,
  Render = Matter.Render,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body;

var engine = Engine.create();

//Select everythin we need
const skyPanel = document.querySelector('#skyPanel');
const controlPanel = document.querySelector('#controlPanel');
const throttleSlider = document.querySelector('#throttleSlider');
const desiredAltSlider = document.querySelector('#desiredAltSlider');
const desiredAltText = document.querySelector('#desiredAltText');
const autoPilotBtn = document.querySelector('#autoPilotBtn');
const altitudeText = document.querySelector('#altitudeText');
const disturbanceSlider = document.querySelector('#disturbanceSlider');
const controllerEqn = document.querySelector('#controllerEqn');
const plotBtn = document.querySelector("#plotBtn");
const plotPanel = document.querySelector('#plotPanel');
const directionsPanel = document.querySelector('#directionsPanel');
const hideDirBtn = document.querySelector('#hideDirBtn');


// const width = skyPanel.clientWidth;
// const height = skyPanel.clientHeight;
const width = 500;
const height = 800;

const maxAlt = 5000;


//document.querySelector('canvas').classList.add('')


var render = Render.create({
  element: document.querySelector('#skyPanel'),
  engine: engine,
  options: {
    width,
    height,
    background: false,
    wireframes: false
  }
});



var topWall = Bodies.rectangle(width / 2, 0, width, 20, { isStatic: true, });
var leftWall = Bodies.rectangle(0, height / 2, 20, height, { isStatic: true });
var rightWall = Bodies.rectangle(width, height / 2, 20, height, { isStatic: true });
var bottomWall = Bodies.rectangle(width / 2, height, width, 20, { isStatic: true });

topWall.render.opacity = 0;
leftWall.render.opacity = 0;
rightWall.render.opacity = 0;
bottomWall.render.opacity = .5;

var heloBody = Bodies.circle(width / 2, 280, 20, {
  render: {
    sprite: {
      texture: "sh60.png",
      xScale: 0.08,
      yScale: 0.08
    }
  }
});

World.add(engine.world, [topWall, leftWall, rightWall, bottomWall, heloBody]);

Engine.run(engine);

Render.run(render);



// length of plotting in seconds
plotLength = 7;
// autopilot initiall OFF
let autoPilotOn = false;
//array of altitudes full of 0s
let altArray = Array(100 * plotLength).fill(0);
//error from last 1 second
let errArray = Array(300).fill(0);
heloBody.frictionAir = .03;
let showPlot = false;
let lastForce=0;

let helo = {
  getAltitude() {
    let altitude = (height - heloBody.position.y) / height * maxAlt;
    altitudeText.innerText = altitude.toFixed(0);
    return altitude;
  },
  getThrottle() {
    return parseFloat(throttleSlider.value);
  },
  applyForce() {
    //force factor will be applied at next iteration
    let forceFactor = (this.getThrottle() - Math.pow(this.getAltitude(), 2) * .000002)
    
    let randomFactor = (Math.random() * (2) - 1) * disturbanceSlider.value;
    Body.applyForce(
      heloBody,
      { x: heloBody.position.x, y: heloBody.position.y },
      { x: 0, y: -0.000025 * lastForce + .00001 * randomFactor }
    );
    const currentAlt = this.getAltitude();
    altArray.unshift(currentAlt);


    lastForce=forceFactor;

  },
  applyController() {
    //get the desired altitude from slider & put in Text
    const y = parseInt(desiredAltSlider.value);
    desiredAltText.innerText = y;

    //get the helos current altitude, put it in the array
    const currentAlt = this.getAltitude();
    errArray.pop();
    errArray.unshift(y - currentAlt);
    const e = errArray.reduce((acc, val) => {
      return acc += val / errArray.length;
    })
    s = altArray;
    //set the throttle per the controller output
    if (autoPilotOn) {
      //value='55+(.1*(y-s[0])+.1*(s[1]-s[0])+.1*e)
      //get gain values
      let Kt = 35;
      let Kp = parseFloat(document.querySelector("#proportional-gain").value);
      let Ki = parseFloat(document.querySelector("#integral-gain").value);
      let Kd = parseFloat(document.querySelector("#derivative-gain").value);

      throttleSlider.value = Kt+(Kp*(y-s[0])+Kd*(s[1]-s[0])+Ki*e);
    }


  }
}

//continuously applies throttle force
setInterval(() => {
  helo.applyForce();

}, 10)


//continuously applies throttle force
setInterval(() => {
  helo.applyController();
}, 30)





autoPilotBtn.addEventListener('click', () => {
  if (autoPilotOn) {
    //turn autopilot off
    autoPilotBtn.classList.add('btn-danger');
    autoPilotBtn.classList.remove('btn-success');
    autoPilotBtn.innerText = 'OFF';
    autoPilotOn = false;
  }
  else {
    //turn autopilot on
    autoPilotBtn.classList.remove('btn-danger');
    autoPilotBtn.classList.add('btn-success')
    autoPilotBtn.innerText = 'ON';
    autoPilotOn = true;
  }

});

let creating_plot = false;
// on the "create plot" button clicking
plotBtn.addEventListener('click', () => {
  if(creating_plot){
    console.log('XX Plotting'); 
    return 0;
  } 
  if (!showPlot) {
    //you want to initiate the plot, so make button show red
    creating_plot=true;
    showPlot = true;
    plotBtn.classList.add('bg-danger');
    plotBtn.classList.remove('bg-warning');
    throttleSlider.value=0;
    if (autoPilotOn) {
      //if the autopilot is alread on, turn it off
      autoPilotBtn.click();
    }
    //clear the plot panel and kill throttle to initiate
    plotPanel.innerHTML = '';
    throttleSlider.value = 0;
    //if manual fly isnt checked, then turn on auto pilot
    if(!document.querySelector("#manualFly").checked){
      autoPilotBtn.click();
      plotLength=7;
      altArray = [];
    } 
    //else change the plot length to longer for manual flying
    else{
      plotLength=15;
      altArray = [];
    }
    // setup the button to start coutning down timer
    plotBtn.innerText = plotLength;
    //make the countdownhappen on the button
    let countDownID = setInterval(() => {
      plotBtn.innerText = parseInt(plotBtn.innerText) - 1;
      if (plotBtn.innerText === '0') {
        clearInterval(countDownID);
        plotBtn.innerText = 'Remove Plot';
      }
    }, 1000);
    //autoPilotBtn.click();
    // when you are done collecting data, create the plot!
    setTimeout(() => {
      creating_plot=false;
      console.log(creating_plot)
      const plotArray=Array.from(altArray.reverse());
      plotPanel.classList.remove('d-none');
      skyPanel.classList.remove('d-none');
      makePlot(parseInt(desiredAltSlider.value), plotArray, plotPanel);
    }, plotLength * 1000);

  }
  //otherwise, if you are already seeing the plot, just remove it
  else {
    //if autopilot on, turn it off!
    if(autoPilotOn) autoPilotBtn.click();
    throttleSlider.value=0;
    showPlot = false;
    plotPanel.classList.add('d-none');
    plotBtn.classList.remove('bg-danger');
    plotBtn.classList.add('bg-warning');

    plotBtn.innerText = 'Create Plot';
  }
});


hideDirBtn.addEventListener('click', () => {
  directionsPanel.classList.add('d-none');
});


// MAKE THE PLOT *******************

const makePlot = (requestedInput, myArray, myDiv) => {
  const timeArray = [];
  const inputArray = [];
  for (let i = 0; i < myArray.length; i++) {
    timeArray.push(i * 10);
    inputArray.push(requestedInput);
  }
  var trace1 = {
    x: timeArray,
    y: myArray,
    type: 'scatter',
    name: 'Helo Altitude'
  };
  var trace2 = {
    x: timeArray,
    y: inputArray,
    type: 'scatter',
    name: 'Desired Altitude',
    line: {
      dash: 'dot',
      width: 3,
      color: 'red'
    }
  };

  var data = [trace1, trace2];
  var layout = {
    title: 'Altitude Response',
    xaxis: {
      title: 'Time (ms)'
    },
    yaxis: {
      title: 'Altitude (feet)'
    }
  };
  Plotly.newPlot(myDiv, data, layout);
}

