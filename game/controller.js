pico8_gpio = new Array(128);

const validChars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz23456789';
function new_code() {
let array = new Uint8Array(4);
window.crypto.getRandomValues(array);
array = array.map(x => validChars.charCodeAt(x % validChars.length));
const code = String.fromCharCode.apply(null, array);
  return code;
}
const code = new_code();

console.log(code)
actual_code = 'litghtsaber_' + code
base_url = window.location.href.split('game')[0]
url = base_url + "controller/" + "?code=" + code
qr = new QRCode(document.getElementById('qr'), {
  text: url,
})


$("#msgcontainer").removeClass('top_msg middle_msg invisible_msg');
$("#msgcontainer").addClass('middle_msg visible_msg');

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
  peer = new Peer(actual_code, {
    key: 'AJAfjkalkj3eElo193',
    host: 'palico.chov.in',
    port: 443,
    path: '/peer'
  })

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
        $("#msgcontainer").removeClass('right_msg top_msg middle_msg');
        $("#msgcontainer").addClass('right_msg');
        document.getElementById("msgheader").innerText = "NEXT PLAYERS"
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
try {
  newPeer()
} catch(error) {
  console.log(error)
newPeer()
}