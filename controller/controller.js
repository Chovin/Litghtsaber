import {joinRoom} from '../lib/trystero-nostr.min.js'
var connection = null;
var is_loading = false;
var li = 0;
const PI2 = 6.28318530718;
const pico8_gpio = new Array(128);

function dot(a, b) {
  return a.x*b.x + a.y*b.y + a.z*b.z
}

function mag(a) {  
  return Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z)
}

function normalize(a) {
  let b = {...a}
  let m = mag(b)
  if (m == 0) {
    return b
  }
  return div(b, m)
}

function minv(a, b) {
  return {x: a.x-b.x, y:a.y-b.y, z:a.z-b.z}
}
function mult(a, v) {
  return {x: a.x*v, y:a.y*v, z:a.z*v}
}
function div(a, v) {
  if (v==0) { return NaN }
  return mult(a, 1/v)
}



var timeout = false
function connect(code) {
  setLoading(true)
  connection = tryConnect(code)
  setTimeout(function() {timeout = true}, 10000)
  let interval = setInterval(function() {
    if (connected || timeout) {
      clearInterval(interval)
      setLoading(false)

      if (connected) {
        swapControls('connect', 'controller')
        resetMvnt()
        setTimeout(resetMvnt, 500)
      } else {
        timeout = false  
        error()
      }
    }
  }, 100)
  // if (connection) {
  //       swapControls('connect', 'controller')
  //       resetMvnt()
  //       setTimeout(resetMvnt, 500)
  // } else {
  //   timeout = false  
  //   error()
  // }
}
function error() {
  if (from_url) {
    $('#msg').html('Error connecting or slot taken. Try scanning again.')
  } else {
  $('#msg').html('check your code')
  }
  setTimeout(() => {
    $('#msg').html('')
  },3000)
}
function setLoading(load) {
  console.log(load)
  is_loading = load
  // $('#code').prop('disabled', load);
  $('#connectBtn').prop('disabled', load);
  if (load) {
    li += 1
    li %= 4
    $('#msg').html('. '.repeat(li))
    setTimeout(() => {
      setLoading(is_loading)
    },600)
  }
}

function swapControls(hide, show) {
  console.log(hide, show, 'k')
  document.getElementById(hide).style="display: none;"
  document.getElementById(show).style="display: block;"
}

var connected = false;
var stream_interval = null;
function tryConnect(code) {
  const room = joinRoom({appId: 'litghtsaber',
    nostrRelays: [
      "wss://relay.damus.io",
      "wss://nos.lol",
      "wss://nostr.fmt.wiz.biz"
    ]
  }, code)
  const [sendData, getData] = room.makeAction('data')
  connected = true
  getData((data, peerId) => {
    console.log(data)
    $('#connmsg').html(data.msg)
    if (data.msg && data.msg == "you're up!") {
      console.log('my turn')
      setTimeout(() => {  
        stream_interval = setInterval(() => {
          sendData({msg: "data", data: pico8_gpio}, peerId)
        }, 10)
      }, 500)
    }
    if (data.msg == 'disconnecting') {
      // swapControls('controller', 'connect')
      window.location.reload()
      room.leave()
      clearInterval(stream_interval)
      connected = false;
    }
  })
  return true
}


var oriented = false
var baseline = 0
window.motion_detected = false

function handleOrientation(event) {
  window.motion_detected = true
  if (!oriented) {
    baseline = event.alpha
    oriented = true
  }
  var b = event.alpha; // In degree in the range [-180,180]
  // b += 180 // 0, 360
  // b += 90
  // b = b % 360
  b *= 255/360 // 0, 255
  //pico8_gpio[0] = b;
}

var avg_accel = [0, 0, 0];  // x, y, z
var accel_samples = 0;

function handleMotion(event) {
  var b = event.acceleration; 
  window.motion_detected = true
    	// (avg * n + new_number)/(n+1)
    	// (a * n)/(n+1) + new_number/(n+1)
    	// a * (n/(n+1)) + new_number/(n+1)  // avoid overflow
    	let new_samples = accel_samples + 1;
      let dims = [b.x, b.y, b.z];
    	for (let i=0; i<dims.length; i++) {
        dims[i] *= .6
    		let gi = 10 + i;
    		// -3  0  3
    		// 0  3  6  9  12
    		// /12 * 255
    		avg_accel[i] = avg_accel[i] * (accel_samples/new_samples) + dims[i]/new_samples;
    		let pry = ((dims[i]-avg_accel[i] + 6)/12)*255;
    		pico8_gpio[gi] = pry;
      }
      accel_samples = new_samples;
      
  handleGravity(event)
}

var buff = {
  a: [],
  g: [],
  max: 3,
  avg: (x) => {
    let keys = ['x','y','z']
    return div(buff[x].reduce((a, b) => {
      let r = {}
      for (let k of keys) {
        r[k] = a[k] + b[k]
      }
      return r
    }, {x:0, y:0, z:0}), buff.max)
  }
}

var ograv = {x:0, y:0, z:0};
function handleGravity(e) {
  let acc = e.acceleration
  let grv = e.accelerationIncludingGravity
  let keys = ['x','y','z']
  function fmt(v) {
    let s = ''
    for (let k of keys) {
      s += `${k}: ${Math.round(v[k]*100)/100}<br>`
    }
    return s
  }

  // console.log(acc)
  let grav = minv(grv, acc)
  ograv = grav
  // $('#debug').html('te')
  // console.log(grav.x, grav.y, grav.z)
  // $('#debug').html(fmt(grav))


  let x = grav.x
  let z = grav.z
  let y = grav.y
  let yaw = Math.atan2(z, y);
  let a = Math.floor((-yaw/PI2 + 1.5)%1 * 255);
  pico8_gpio[0] = a;
}

function resetMvnt() {
  avg_accel = [0, 0, 0];
  accel_samples = 0;
  toggleGPIO(1) // and restart
}

function toggleGPIO(i, v = 1, t = 16) {
  pico8_gpio[i] = v  
  setTimeout(() => {
    pico8_gpio[i] = 0
  }, t)
}

pico8_gpio[4] = 0
function toggleSaber() {
  pico8_gpio[4] += 1
  pico8_gpio[4] %= 2
}
function toggleColor() {
  toggleGPIO(6)
}
pico8_gpio[5] = 0
function toggleBackwards() {
  pico8_gpio[5] += 1
  pico8_gpio[5] %= 2
}

window.addEventListener('deviceorientation', handleOrientation);

window.addEventListener('devicemotion', handleMotion);


// https://stackoverflow.com/questions/56514116/how-do-i-get-deviceorientationevent-and-devicemotionevent-to-work-on-safari/56764762#56764762
if ( location.protocol != "https:" ) {
location.href = "https:" + window.location.href.substring( window.location.protocol.length );
}
function permission (and_connect) {
    if ( typeof( DeviceMotionEvent ) !== "undefined" ) { 
      if ( typeof( DeviceMotionEvent.requestPermission ) === "function" ) {
          // (optional) Do something before API request prompt.
          DeviceMotionEvent.requestPermission()
              .then( response => {
              // (optional) Do something after API prompt dismissed.
              if ( response == "granted" ) {
                  window.addEventListener('deviceorientation', handleOrientation);
                  window.addEventListener('devicemotion', handleMotion);
                  if (and_connect) {
                    connect($('#code').val())
                  }
                  $("#request").toggle('1s')
              }
          })
              .catch( console.error )
      }
    } else {
        alert( "Device unsupported :(" );
    }
}
const btn = document.getElementById( "request" );
btn.addEventListener( "click", permission );


function connect_manual() {
  if(!window.motion_detected){
    permission(true)
  }
  else {
    connect($('#code').val())
  }
}

var from_url = false;
var url_parts = window.location.href.split('?code=')
if (url_parts.length > 1) {
  from_url = true;
  $('#code').val(url_parts[1])
}

$("#request").toggle()
setTimeout(function() {
  if (!window.motion_detected) {
    $("#request").toggle('1s')
  } else if (from_url) {
    connect($("#code").val())
  }
}, 2000)


// function setup() {
//   createCanvas(200, 200, WEBGL);
// }

// function draw(){
//   background(100);
//   lights();
//   // rotateX(ograv.x);
//   rotateY(PI/2.);
//   // rotateZ(ograv.z);
//   // rotateX()
  
//   push()
//   stroke(0,255,0);
//   translate(0,-50);
//   cylinder(1, 108);
//   pop()
//   push()
//   stroke(255,0,0);
//   rotateZ(PI/2);
//   translate(0,-50);
//   cylinder(1, 108);
//   pop()
//   push()
//   stroke(0,0,255);
//   rotateX(PI/2);
//   translate(0,-50);
//   cylinder(1, 108);
//   pop()

//   push()
//     scale(5,5,5)
//     translate(ograv.x, ograv.y, ograv.z)
//     sphere(1)
//   pop()
//   push()
//     stroke(255,100,100)
//     let a = Math.atan2(ograv.z,ograv.y)
//     rotateX(a)
//     translate(0,20);
//     cylinder(1,50);
//   pop()
// }

export {
  connect_manual,
  resetMvnt,
  toggleSaber,
  toggleColor,
  toggleBackwards
}

window.connect_manual = connect_manual
window.resetMvnt = resetMvnt
window.toggleSaber = toggleSaber
window.toggleColor = toggleColor
window.toggleBackwards = toggleBackwards