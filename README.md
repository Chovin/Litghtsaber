# Litghtsaber

*to play the original: https://github.com/Chovin/Litghtsaber/tree/master*

## install

```sh
npm install
cd game
bower install
```
install Zig Sim on [iPhone](https://itunes.apple.com/us/app/zig-sim/id1112909974?mt=8) or [Android](https://play.google.com/store/apps/details?id=com.oneten.drive.zig_sim&hl=en_CA)

## run

1. Get phone and comp on same network. 
    * Using hotspot works well to get around router issues
2. in project root, using the same ip/port do `node . <ip> [port]` (port is 6449 by default)
3. Open Zig Sim 
    1. check `gravity` and `remotecontrol` (or just check everything. I don't keep this readme updated anyways..)
    2. send to comp's IP/port (local preferred)
    3. make sure it's set to OSC
    4. press start. It will turn green if set up correctly
4. open browser to [http://localhost:8081](http://localhost:8081)

## play

Hold phone with index finger on up volume button as if it were a lightsaber.
Press **up volume button**) to turn on your lightsaber.

*Press **down volume button** to change colors*

## issues

* audio doesn't work on chrome. I'd like to find a way to fix this without digging into PICO-8's output web files. Maybe an update of PICO-8 will fix it /shrug
