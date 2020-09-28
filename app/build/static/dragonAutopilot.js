// a bunch of helper functions for clicking and getting values.

function trigger_button(keyCode) {
	document.dispatchEvent(new KeyboardEvent("keydown", {which: keyCode, keyCode: keyCode}));

	setTimeout(function() {
		document.dispatchEvent(new KeyboardEvent("keyup", {which: keyCode, keyCode: keyCode}));
	}, 0.5)
}

function pitch_up() {
	// $("#pitch-up-button").click();
	trigger_button(104);
}

function pitch_down() {
	// $("#pitch-down-button").click();
	trigger_button(101);
}

function yaw_left() {
	// $("#yaw-left-button").click();
	trigger_button(100);
}

function yaw_right() {
	//$("#yaw-right-button").click();
	trigger_button(102);
}

function roll_left() {
	//$("#roll-left-button").click();
	trigger_button(103);
}

function roll_right() {
	//$("#roll-right-button").click();
	trigger_button(105);
}

function translate_left() {
	//$("#translate-left-button").click();
	trigger_button(65);
}

function translate_right() {
	//$("#translate-right-button").click();
	trigger_button(68);
}

function translate_up() {
	//$("#translate-up-button").click();
	trigger_button(87);
}

function translate_down() {
	//$("#translate-down-button").click();
	trigger_button(83);
}

function translate_forward() {
	//$("#translate-forward-button").click();
	trigger_button(69);
}

function translate_backward() {
	//$("#translate-backward-button").click();
	trigger_button(81);
}

function getPitchRate() {
	return parseFloat($("#pitch .rate").innerText);
}

function getYawRate() {
	return parseFloat($("#yaw .rate").innerText);
}

function getRollRate() {
	return parseFloat($("#roll .rate").innerText);
}

function getPitch() {
	return parseFloat($("#pitch .error").innerText);
}

function getYaw() {
	return parseFloat($("#yaw .error").innerText);
}

function getRoll() {
	return parseFloat($("#roll .error").innerText);;
}

// get position
function getPos() {
	var x = parseFloat($("#x-range > div").innerText);
	var y = parseFloat($("#y-range > div").innerText);
	var z = parseFloat($("#z-range > div").innerText);
	return new THREE.Vector3(x,y,z);
}

function getRate() {
	return parseFloat($("#rate > div.rate").innerText);
}

function randomPos() {
	// randomizes the current position and velocity
	rx=(Math.random()-0.5) * 100;ry=(Math.random()-0.5) * 100;rz=(Math.random()-0.5) * 100;
	rateRotationX=Math.round(rx);
	targetRotationX=Math.round(rx)/2*toRAD;
	rateRotationY=Math.round(ry);
	targetRotationY=Math.round(ry)/2*toRAD;
	rateRotationZ=Math.round(rz);
	targetRotationZ=Math.round(rz)/2*toRAD;
	camera.position.x = (Math.random()-0.5) * 150;
	camera.position.y = (Math.random()-0.5) * 100;
	camera.position.x = (Math.random()-0.5) * 100;
	camera.position.z = (Math.random()-0.5) * 70;
	motionVector.x = (Math.random()-0.5)*0.1;
	motionVector.y = (Math.random()-0.5)*0.1;
	motionVector.z = (Math.random()-0.5)*0.1
}

var autoEnabled = false;

function toggleAuto() {
	autoEnabled = ! autoEnabled;
	$("#auto-toggle").innerText = autoEnabled ? "DISABLE AUTOPILOT":"ENABLE AUTOPILOT";
 rollArr=new Array(100).fill(0);
 pitchArr=new Array(100).fill(0);
 yawArr=new Array(100).fill(0);
 clearInterval(timerID);
 time=0;
 timerID = setInterval(()=>{
	time+=1;
	document.querySelector("#dispTimer").innerText=time;
 },1000)

}



let Kp=0;
let Ki=0;
let Kd=0;

const setGain= (k,val)=>{
    if (k==='p'){
    	Kp+=val;
    	document.querySelector("#Kp").value=Kp;
    	document.querySelector("#KpDisp").innerText=Kp.toFixed(3);
    }
        if (k==='i'){
    	Ki+=val;
    	document.querySelector("#Ki").value=Ki;
    	document.querySelector("#KiDisp").innerText=Ki.toFixed(3);
    }
        if (k==='d'){
    	Kd+=val;
    	document.querySelector("#Kd").value=Kd;
    	document.querySelector("#KdDisp").innerText=Kd.toFixed(3);
    }

}
// quick and dirty control button injection
document.getElementById("options").insertAdjacentHTML('beforeend', `<div style="position: fixed;left: 50%;margin-left: -215px;top:0px">
    <div onclick="toggleAuto()" id="auto-toggle" class="message-button" style="display: inline-block;text-align: center;margin: 15px;">ENABLE AUTOPILOT</div>
    <div onclick="randomPos()" class="message-button" style="display: inline-block;text-align: center;margin: 15px;">RANDOM POSITION</div>
   </div> 
  <div>

    <div class="message-button" style="display: inline-block;text-align: center;margin: 2px;">
		<h1>Kp: <span id="KpDisp"></span></h1>
		<h2 onclick="setGain('p',.05)">+</h2>
		<input id="Kp" type="range" min="0" max="2" value="0" step="any"/>
		<h2 onclick="setGain('p',-.05)">-</h2>
    </div>


        <div class="message-button" style="display: inline-block;text-align: center;margin: 2px;">
		<h1>Ki: <span id="KiDisp"></span></h1>
		<h2 onclick="setGain('i',.001)">+</h2>
		<input id="Ki" type="range" min="0" max=".1" value="0" step="any"/>
		<h2 onclick="setGain('i',-.001)">-</h2>
    </div>



    <div class="message-button" style="display: inline-block;text-align: center;margin: 2px;">
		<h1>Kd: <span id="KdDisp"></span></h1>
		<h2 onclick="setGain('d',.1)">+</h2>
		<input id="Kd" type="range" min="0" max="3" value="0" step="any"/>
		<h2 onclick="setGain('d',-.1)">-</h2>
		</div>
		

    <div class="message-button" style="display: inline-block;text-align: center;margin: 2px;">
		<h3>Timer:</h3>
		<h3 id="dispTimer">0</h3>
    </div>



    <div>

`);


let timerID=0;
let time = 0;


// The script itself:

var ERROR_TOL = 0.4;
// PID constants, try changing these! I term wasn't necessary
var rotP = Kp;
var rotI = Ki;
var rotD = Kd;

// Y and Z translation:
var transP = Kp;
var transI = Ki;
var transD = Kd

// X translation. Axis towards the station.
var transXP = Kp; // proportional. Higher values: more thrust
var transI = Ki;
var transXD = Kd; // derivative. Higher values: resists motion/less overshoot

var rollArr=new Array(100).fill(0);
var pitchArr=new Array(100).fill(0);
var yawArr=new Array(100).fill(0);


const initGains = ()=>{
	rotP = Kp;
	rotI = Ki/10;
	rotD = Kd;

	// Y and Z translation:
	transP = Kp;
	transI = Ki;
	transD = Kd

	// X translation. Axis towards the station.
	transXP = Kp/3; // proportional. Higher values: more thrust
	transI = Ki;
	transXD = Kd*3;
}



// angular velocity limit
var maxAngVel = 2.5;


// estimated velocity vector
var vel = new THREE.Vector3(0,0,0);
// last position
var lastPos = getPos();

// "Duty cycle" of the translation thrusters... idk.
var weirdDutyCycle = new THREE.Vector3(0,0,0);

var angleDt = 0.1;  // deltaTime in seconds
var velDt = 1; // delay between velocity update

var loopCounter = 0;
var velInterval = Math.round(velDt / angleDt);

// Start control loop
setInterval(controlLoop, angleDt * 1000);

function controlLoop() {

	initGains();

	if (!autoEnabled) {
		return;
	}

	loopCounter++;

	// PD loop
	var pitchRate = getPitchRate();
	var pitch = getPitch();
	
	pitchArr.pop();
    pitchArr.unshift(pitch);
    const pitchErr=pitchArr.reduce((acc,cur)=>{
    	return acc+=cur;
    });

	var pitchSetpoint = Math.round((pitch * rotP - pitchRate * rotD+ pitchErr*rotI) * 10) / 10;
	if (pitchRate < pitchSetpoint && pitchRate < maxAngVel) {
		pitch_down();
	}
	else if (pitchRate > pitchSetpoint && pitchRate > -maxAngVel) {
		pitch_up();
	}

	var yawRate = getYawRate();
	var yaw = getYaw();

    yawArr.pop();
    yawArr.unshift(yaw);
    const yawErr=yawArr.reduce((acc,cur)=>{
    	return acc+=cur;
    });

 

	var yawSetpoint = Math.round((yaw * rotP - yawRate * rotD+ yawErr*rotI) * 10) / 10;

	if (yawRate < yawSetpoint && yawRate < maxAngVel) {
		yaw_right();
	}
	else if (yawRate > yawSetpoint && yawRate > -maxAngVel) {
		yaw_left();
	}


	var rollRate = getRollRate();
	var roll = getRoll();

	    rollArr.pop();
    rollArr.unshift(roll);
    const rollErr=rollArr.reduce((acc,cur)=>{
    	return acc+=cur;
    });


	// only correct 

	var rollSetpoint = Math.round((roll * rotP - rollRate * rotD+rollErr*rotI) * 10) / 10;

	if (rollRate < rollSetpoint && rollRate < maxAngVel) {
		roll_right();
	}
	else if (rollRate > rollSetpoint && rollRate > -maxAngVel) {
		roll_left();
	}


		//log rotation rate setpoints
// 		console.log({
// 			p: pitchErr,
// 			y: yawErr,
// 			r: rollErr,
// 			p: pitchArr.length
// 		});

	// translate only if angle is small
	if (Math.abs(pitch) + Math.abs(yaw) + Math.abs(roll) <= 3*ERROR_TOL) {
		translationCorrection();
	}

}

function translationCorrection() {
	var newPos = getPos();

	if (loopCounter % velInterval === 0) {
		// update velocity estimate
		vel = newPos.clone().sub(lastPos).divideScalar(velDt);
		lastPos = newPos.clone();
	}
	
	// use displayed rate if only moving in x direction
	if (vel.x * vel.y === 0) {
		vel.x = getRate();
	}

	weirdDutyCycle.x = Math.min(1, Math.max(-1, newPos.x * transXP + vel.x * transXD));
	weirdDutyCycle.y = Math.min(1, Math.max(-1, newPos.y * transP + vel.y * transD));
	weirdDutyCycle.z = Math.min(1, Math.max(-1, newPos.z * transP + vel.z * transD));

	//console.log(weirdDutyCycle);


	if (loopCounter % velInterval >= velInterval * Math.abs(weirdDutyCycle.x) || Math.abs(newPos.y) + Math.abs(newPos.z) > 45) {
		// "duty cycle" is off, do nothing
	}
	else if (weirdDutyCycle.x > 0) {
		translate_forward();
	}
	else if (weirdDutyCycle.x < -0.1) { // don't change if moving slowly forwards
		translate_backward();
	}


	if (loopCounter % velInterval >= velInterval * Math.abs(weirdDutyCycle.y)) {
		// "duty cycle" is off, do nothing
	}
	else if (weirdDutyCycle.y > 0) {
		translate_left();
	}
	else if (weirdDutyCycle.y < 0) {
		translate_right();
	}
	

	if (loopCounter % velInterval >= velInterval * Math.abs(weirdDutyCycle.z)) {
	// "duty cycle" is off, do nothing
	}
	else if (weirdDutyCycle.z > 0) {
		translate_down();
	}
	else if (weirdDutyCycle.z < 0) {
		translate_up();
	}
	
}