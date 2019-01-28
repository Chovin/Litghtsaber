/* 

<script src="/bower_components/osc.js/dist/osc-chromeapp.min.js"></script>
	<script src="/watch.js"></script>

*/

oscPort = new osc.WebSocketPort({
	url: "ws://localhost:8081"
});
oscPort.open();

var PI = 3.14159265358979323846264338328;
var PI2 = PI*2;




// https://www.youtube.com/watch?v=8O9GV4SUToA&index=77&list=PLAwxTw4SYaPkCSYXw6-a_aAoXVKLDwnHK
function f(mu, sigma2, x) {
	return 1/Math.sqrt(PI2 * sigma2) * Math.exp(-.5 * ((x-mu)*(x-mu)) / sigma2);
}

function update(mean1, var1, mean2, var2) {
	new_mean = (var2 * mean1 + var1 * mean2) / (var1 + var2); 
	new_var = 1 / (1 / var2 + 1 / var2);
	return [new_mean, new_var];
}

function predict(mean1, var1, mean2, var2) {
	return [mean1 + mean2, var1 + var2];
}




avg_accel = [0, 0, 0];  // x, y, z
accel_samples = 0;

pico8_gpio = new Array(128);

console.log('listening');
function addab(a,b) {
    return a + b
}
function multab(a,b){
    return a * b
}
function doopv(op, a, b){
    if (!(a instanceof Array)) {
        a = [a,a,a,a]
    }if (!(b instanceof Array)) {
        b = [b,b,b,b]
    }
    let r = []
    for (let i=0; i<a.length; i++) {
        r.push(op(a[i], b[i]))
    }
    return r
}
function mult(a, b) {
    return doopv(multab, a, b)
}
function add(a, b) {
    return doopv(addab, a, b)
}
dot = math.dot
cross = math.cross

// https://gamedev.stackexchange.com/questions/28395/rotating-vector3-by-a-quaternion
function rot_vec_by_quat(v, q) {
    // x,y,z
    let u = [q[0],q[1],q[2]];
    let s = q[3];

    return add(add(mult(mult(2.0, dot(u, v)), u),
                   mult(add(s*s, mult(-1, dot(u, u))), v)),
               mult(2.0*s, cross(u, v)));
}

ignore_down = false;
oscPort.on("message", function (msg) {
    if (msg.address.endsWith('/remotecontrol')) {
        //console.log(msg);
        up = msg.args[1]==1;
        down = msg.args[2]==1;
        if (up) {
            pico8_gpio[4] = !pico8_gpio[4];
        }
        if (down && !ignore_down) {
            pico8_gpio[6] = !pico8_gpio[6];
            ignore_down = true;
            window.setTimeout(() => { ignore_down = false; }, 100);
        }
    }
    // if (msg.address.endsWith('/gyro')) {
    // 	yaw = msg.args[2];
    // 	yaw = Math.floor(((yaw/PI2 + 1)%1) * 255)
    // 	//console.log('gyro yaw', yaw);
    // 	pico8_gpio[0] = yaw;
    // }
    if (msg.address.endsWith('/button')) {
    	btn = msg.args[0]
    	// console.log('button ' + btn + ': ', msg.args[1]);
	    pico8_gpio[btn] = msg.args[1];
	    if (btn == 7) {  // reset accel mean
	    	avg_accel = [0, 0, 0];
			accel_samples = 0;
	    }
    }
    if (msg.address.endsWith('/accel')) {
    	// (avg * n + new_number)/(n+1)
    	// (a * n)/(n+1) + new_number/(n+1)
    	// a * (n/(n+1)) + new_number/(n+1)  // avoid overflow
    	new_samples = accel_samples + 1;
    	for (i=0; i<msg.args.length; i++) {
    		gi = 10 + i;
    		// -3  0  3
    		// 0  3  6  9  12
    		// /12 * 255
    		avg_accel[i] = avg_accel[i] * (accel_samples/new_samples) + msg.args[i]/new_samples;
    		pry = ((msg.args[i]-avg_accel[i] + 6)/12)*255;
    		pico8_gpio[gi] = pry;
			// console.log('accel ' + i, msg.args[i]);
    	}
    	accel_samples = new_samples;
    }
    // if (msg.address.endsWith('/quaternion')) {
    //     let q = msg.args
    //     q = [q[1],q[2],q[3],q[0]]
    //     // vert
    //     let v = [0,1,0]
    //     let r = rot_vec_by_quat(v, q)
    //     // get angle of rotation on xy plane
    //     let a = Math.atan2(r[1], r[0])
    //     console.log(a)
    //     a = Math.floor((a/PI2 + 1)%1 * 255)
    //     console.log(a);
    //     pico8_gpio[0] = a;
    // }
    if (msg.address.endsWith('/gravity')) {
        let g = msg.args
        let x = g[0]
        let z = g[1]
        let y = g[2]
        let yaw = Math.atan2(z, y);
        let a = Math.floor((yaw/PI2 + 1.25)%1 * 255);
        pico8_gpio[0] = a;
    }
});
