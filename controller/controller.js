
var connection = null;
var is_loading = false;
var li = 0;
const PI2 = 6.28318530718;
pico8_gpio = new Array(128);

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
function connect() {
  let code = $('#code').val()
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
  $('#msg').html('check your code')
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
var peer = null;
function tryConnect(code) {
  peer = new Peer(); 
  var conn = peer.connect('litghtsaber_' + code);
  conn.on('open', function(){
    setTimeout(() => {
      stream_interval = setInterval(() => {
        conn.send(pico8_gpio)
      }, 10)
    }, 500)
    connected = !peer.disconnected
    conn.on('data', function(data) {
      $('#connmsg').html(data)
      // if (data == 'connected') {
      //   connected = true;
      // }
      if (data == 'disconnecting') {
        // swapControls('controller', 'connect')
        window.location.reload()
        peer.destroy()
        clearInterval(stream_interval)
        connected = false;
      }
    })
  });
  var err = false;
  conn.on('error', function() {
    err = true;
  })
  if (err) {return false}
  return true
}


var oriented = false
var baseline = 0

function handleOrientation(event) {
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
    	// (avg * n + new_number)/(n+1)
    	// (a * n)/(n+1) + new_number/(n+1)
    	// a * (n/(n+1)) + new_number/(n+1)  // avoid overflow
    	new_samples = accel_samples + 1;
      let dims = [b.x, b.y, b.z];
    	for (i=0; i<dims.length; i++) {
        dims[i] *= .6
    		gi = 10 + i;
    		// -3  0  3
    		// 0  3  6  9  12
    		// /12 * 255
    		avg_accel[i] = avg_accel[i] * (accel_samples/new_samples) + dims[i]/new_samples;
    		pry = ((dims[i]-avg_accel[i] + 6)/12)*255;
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
      for (k of keys) {
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
    for (k of keys) {
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