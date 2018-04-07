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

pico8_gpio = new Array(128);

oscPort.on("message", function (msg) {
    if (msg.address == '/gyrosc/gyro') {
    	yaw = msg.args[2];
    	yaw = Math.floor(((yaw/PI2 + 1)%1) * 255)
    	console.log('gyro yaw', yaw);
    	pico8_gpio[0] = yaw;
    }
    if (msg.address == '/gyrosc/button' && msg.args[0] == 4) {
    	console.log('button', msg)
    	pico8_gpio[1] = msg.args[1]
    }
});