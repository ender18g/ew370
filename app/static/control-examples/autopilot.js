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
const directionsPanel=document.querySelector('#directionsPanel');
const hideDirBtn=document.querySelector('#hideDirBtn');


const width = skyPanel.clientWidth;
const height = skyPanel.clientHeight;
const maxAlt = 5000;


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

plotLength = 5;
let autoPilotOn = false;
let altArray = Array(100 * plotLength).fill(0);
let errArray = Array(1000).fill(0);
heloBody.frictionAir = .03;
let showPlot = false;
//plot length in seconds


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
    let forceFactor = (this.getThrottle() - Math.pow(this.getAltitude(), 2) * .000002)
    let randomFactor = (Math.random() * (2) - 1) * disturbanceSlider.value;
    Body.applyForce(
      heloBody,
      { x: heloBody.position.x, y: heloBody.position.y },
      { x: 0, y: -0.000015 * forceFactor + .00001 * randomFactor }
    );
  },
  applyController() {
    const y = parseInt(desiredAltSlider.value);
    desiredAltText.innerText = y;
    const currentAlt = this.getAltitude();
    altArray.pop();
    altArray.unshift(currentAlt);
    errArray.pop();
    errArray.unshift(y - currentAlt);
    const e = errArray.reduce((acc, val) => {
      return acc += val / errArray.length;
    })
    s = altArray;
    throttleSlider.value = parseInt(eval(controllerEqn.value));

  }
}


//continuously applies throttle force
setInterval(() => {
  if (autoPilotOn) {
    helo.applyController();
  }
  helo.applyForce();
}, 10)


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

plotBtn.addEventListener('click', () => {
  if (!showPlot) {
    showPlot=true;
    plotBtn.classList.add('bg-danger');
    plotBtn.classList.remove('bg-warning');
    if (autoPilotOn) {
      autoPilotBtn.click();
    }
    plotBtn.innerText = plotLength + 1;
    let countDownID = setInterval(() => {
      plotBtn.innerText = parseInt(plotBtn.innerText) - 1;
      if (plotBtn.innerText === '0') {
        clearInterval(countDownID);
        plotBtn.innerText = 'Remove Plot';
      }
    }, 1000);
    plotPanel.innerHTML = '';
    throttleSlider.value = 0;
    setTimeout(() => {
      autoPilotBtn.click();
      setTimeout(() => {
        plotPanel.classList.remove('d-none')
        skyPanel.classList.remove('d-none')
        makePlot(parseInt(desiredAltSlider.value), altArray.reverse(), plotPanel)
      }
        , plotLength * 1000);
    }, 1500);
  }
  else{
    showPlot=false;
    plotPanel.classList.add('d-none');
    plotBtn.classList.remove('bg-danger');
    plotBtn.classList.add('bg-warning');

    plotBtn.innerText='Create Plot';
  }
});


hideDirBtn.addEventListener('click',()=>{
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
    name: 'Desired Input',
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

