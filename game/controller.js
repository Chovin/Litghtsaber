pico8_gpio = new Array(128);

const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz23456789';
let array = new Uint8Array(4);
window.crypto.getRandomValues(array);
array = array.map(x => validChars.charCodeAt(x % validChars.length));
const code = String.fromCharCode.apply(null, array);

console.log(code)
console.log($('msg'))
document.getElementById('msg').innerHTML = 'code: ' + code
window.game_paused = false
setTimeout(function() {
  if (!window.game_paused) {
    Module.pico8TogglePaused();
    window.game_paused = true
  }
}, 7000)

var player = 0;
var peer = null;

function newPeer() {
    peer = new Peer('litghtsaber_' + code)

    player = 0;

    peer.on('connection', function (conn) {
        player += 1
        conn.player = player
        let connected = false
        conn.on('data', function (data) {
            if (conn.player != player) {
                conn.send('disconnecting')
            } else {
        if (window.game_paused) {
          Module.pico8TogglePaused();
          window.game_paused = false
        }
                // if (!connected) {
                //   conn.send('connected')
                //   setTimeout(function() {
                //     conn.send('connected')
                //   },300)
                //   connected = true
                // }
                console.log(data);
                pico8_gpio = data
            }
        });
    })
}
newPeer()