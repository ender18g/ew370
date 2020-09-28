const gun = document.querySelector('#gun');
const rotationReadout = document.querySelector('#rotationB');
const inputSignal = document.querySelector('#degInput');
const resetBtn = document.querySelector('#resetBtn');
const controlSignalReadout = document.querySelector('#controlSignal');
const controlEqnInput = document.querySelector('#controllerInput')
const applyBtn = document.querySelector('#applyBtn');
const helo = document.querySelector('#heloImg')
const moveHeloBtn = document.querySelector('#moveHeloBtn');
const fireBtn = document.querySelector('#fireBtn');
const targetAngleReadout = document.querySelector('#readoutAngle');
const continuousCheck = document.querySelector('#continuousCheck');
const plotDiv = document.querySelector('#plotDiv');
const seeChartBtn = document.querySelector('#seeChartBtn');
const shot = document.querySelector('.shot');



let currentDeg = 0;
let controlSignal = 0;
let signalArray = [];
let gunPosition = [];



inputSignal.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    applyBtn.click();
  }
  if (e.key === 'r') {
    resetBtn.click();
    inputSignal.value = '';
  }
});

resetBtn.addEventListener('click', () => {
  moveGun(0, 0);
  controlSignalReadout.innerText = 0;
  centerGun();
  console.clear();
  shot.style.opacity=0;
});

applyBtn.addEventListener('click', () => {
  const requestedInput = parseInt(inputSignal.value);
  gun.style.transitionDuration = continuousCheck.checked ? '.1s' : '.5s';
  gunPosition = [];
  const calcAndMove = (i) => {
    setTimeout(function () {
      if (continuousCheck.checked || i === 100) {
        controlSignal = getControlSignal(requestedInput);
      }
      else {
        controlSignal = 0;
      }
      controlSignalReadout.innerText = controlSignal;
      moveGun(controlSignal);
      gunPosition.push(currentDeg);
      if (--i) calcAndMove(i);
      else makePlot(requestedInput, gunPosition, plotDiv);
    }, 1);
  }
  signalArray = [];
  calcAndMove(100);


})


moveHeloBtn.addEventListener('click', () => {
  moveGun(0, 0);
  inputSignal.value = moveHelo(); 
});


seeChartBtn.addEventListener('click', () =>{
  plotDiv.classList.toggle('d-none');
  seeChartBtn.classList.toggle('btn-success');
  seeChartBtn.classList.toggle('btn-light');

})




const moveHelo = () => {
  let x = Math.floor(Math.random() * (window.innerWidth-150));
  let y = Math.floor(Math.random() * (window.innerHeight-150));
  let r = Math.floor(Math.random() * 360);
  helo.style.top = `${y}px`;
  helo.style.left = `${x}px`;
  let roundedAngle = Math.round(getAngle() * 10) / 10;
  targetAngleReadout.innerText = `${roundedAngle} `;
  helo.style.transform = `rotate(${roundedAngle}deg)`
  return roundedAngle
}



const moveGun = (ctrlSig, degOutput = false) => {
  if (degOutput === false) {
    signalArray.push(ctrlSig)
    reductionRate = .5
    reducedVal = signalArray.slice(-4).reduce((acc, cur, ind) => {
      return acc + cur * ind / Math.pow(ind, 2)
    })

    degOutput = currentDeg + reducedVal * .05;
  }
  gun.style.transform = `rotate(${degOutput}deg)`
  shot.style.transform = `rotate(${degOutput+90}deg)`
  rotationReadout.innerText = `${Math.round(degOutput)} `
  currentDeg = degOutput;

}

const getControlSignal = (requestedInput) => {
  let y = requestedInput;
  let s = currentDeg;
  let result = parseInt(eval(controlEqnInput.value));
  return result;
}


const centerGun = () => {
  let x = Math.floor(.5 * (window.innerWidth - gun.width));
  let y = Math.floor(.5 * (window.innerHeight - gun.height));
  gun.style.top = `${y}px`;
  gun.style.left = `${x}px`;


}





const getAngle = () => {
  let y = parseInt(gun.style.top.slice(0, -2)) - parseInt(helo.style.top.slice(0, -2))
  let x = parseInt(helo.style.left.slice(0, -2)) - parseInt(gun.style.left.slice(0, -2))
  let angle = Math.atan(y / x) * 180 / Math.PI;
  if (x > 0) {
    angle = 90 - angle;
  }
  if (x < 0) {
    angle = 270 - angle;
  }
  return angle;
}


const makePlot = (requestedInput,myArray, myDiv) => {
  const timeArray = [];
  const inputArray = [];
  for (let i = 0; i < myArray.length; i++) {
    timeArray.push(i);
    inputArray.push(requestedInput);
  }
  var trace1 = {
    x: timeArray,
    y: myArray,
    type: 'scatter',
    name: 'Gun Rotation'
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

  var data = [trace1,trace2];
  var layout = {
    title: 'CIWS Response',
    xaxis: {
      title: 'Time (ms)'
    },
    yaxis: {
      title: 'Rotation (degrees)'
    }
  };
  seeChartBtn.classList.remove('disabled');
  Plotly.newPlot(myDiv, data,layout);
}




// var is_touching = function( $div1, $div2 ) {
// 	// Div 1 data
// 	var d1_offset             = $div1.offset();
// 	var d1_height             = $div1.outerHeight( true );
// 	var d1_width              = $div1.outerWidth( true );
// 	var d1_distance_from_top  = d1_offset.top + d1_height;
// 	var d1_distance_from_left = d1_offset.left + d1_width;

// 	// Div 2 data
// 	var d2_offset             = $div2.offset();
// 	var d2_height             = $div2.outerHeight( true );
// 	var d2_width              = $div2.outerWidth( true );
// 	var d2_distance_from_top  = d2_offset.top + d2_height;
// 	var d2_distance_from_left = d2_offset.left + d2_width;

// 	var not_colliding = ( d1_distance_from_top < d2_offset.top || d1_offset.top > d2_distance_from_top || d1_distance_from_left < d2_offset.left || d1_offset.left > d2_distance_from_left );

// 	// Return whether it IS colliding
// 	return ! not_colliding;
// };

const is_touching = () =>{
  const error = 80;
  const heloPos = getCurrentPos(helo);
  const shotPos = getCurrentPos(shot);

  for(let i=0;i<heloPos.length;i++){
    if(!is_within(heloPos[i],shotPos[i],error)) return false;
  }
  return true;
}

const is_within = (a,b,o)=>{
  if(a>=b-o && a<=b+o) return true;
  return false;
}



function move(point, angle, unit) {
  var x = point[0];
  var y = point[1];
  var rad = angle/180*Math.PI;

  x += unit*Math.sin(rad);
  y -= unit*Math.cos(rad);
  return [x, y];
}

const getCurrentPos = (el) =>{
  let x = el.offsetLeft;
  let y = el.offsetTop;
  return [x,y];
}

const setPos = (el,newPos) =>{
  el.style.left = `${newPos[0]}px`;
  el.style.top = `${newPos[1]}px`;
}


const explode = ()=>{
  helo.src='explode.png';
  helo.style.opacity=0;
  setTimeout(()=>{
    helo.src='helo.png'
    helo.style.opacity=1;
  
  }
    ,2000);


}

fireBtn.addEventListener('click', () =>{
  shot.style.opacity=.6;
  shot.style.top = `${gun.offsetTop+gun.height/2-20}px`;
  shot.style.left = `${gun.offsetLeft+gun.width/2}px`;
  const shotPath = setInterval(function(){
    let currPos = getCurrentPos(shot);
    let newPos = move(currPos,currentDeg,4);
    setPos(shot,newPos);
    if (is_touching()){
      console.log('TOUCHED!!')
      explode();
    }
  },2);

  setTimeout(function(){
    clearInterval(shotPath);
    shot.style.opacity = 0;
  },1000)

})

const hideDirBtn = document.querySelector('#hideDir');
const directionsDiv = document.querySelector('#directionsDiv');

hideDirBtn.addEventListener('click',()=>{
  
  directionsDiv.classList.toggle('d-none')
  resetBtn.click();
})