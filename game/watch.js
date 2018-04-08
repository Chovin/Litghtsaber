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

oscPort.on("message", function (msg) {
    if (msg.address == '/gyrosc/gyro') {
    	yaw = msg.args[2];
    	yaw = Math.floor(((yaw/PI2 + 1)%1) * 255)
    	// console.log('gyro yaw', yaw);
    	pico8_gpio[0] = yaw;
    }
    if (msg.address == '/gyrosc/button') {
    	btn = msg.args[0]
    	// console.log('button ' + btn + ': ', msg.args[1]);
	    pico8_gpio[btn] = msg.args[1];
	    if (btn == 7) {  // reset accel mean
	    	avg_accel = [0, 0, 0];
			accel_samples = 0;
	    }
    }
    if (msg.address == '/gyrosc/accel') {
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
});
