    function get_appropriate_ws_url() {
      var pcol;
      var u = document.URL;
      /*
       * We open the websocket encrypted if this page came on an
       * https:// url itself, otherwise unencrypted
       */
      if (u.substring(0, 5) == "https") {
        pcol = "wss://";
        u = u.substr(8);
      } else {
        pcol = "ws://";
        if (u.substring(0, 4) == "http")
          u = u.substr(7);
      }
      u = u.split('/');
      //alert (pcol + u[0] + ":6500");
      return pcol + u[0];
    }
    /* dumb increment protocol */
    var socket_di;

    function startWebsockets() {
      socket_di = new WebSocket(get_appropriate_ws_url());
      try {
        socket_di.onopen = function() {
          // success!
          get_devices();
          get_dynamicconfig();
          // Set recurring fetch every 1 minute
          if (!window.devicesInterval) {
            window.devicesInterval = setInterval(() => {get_devices();}, 60 * 1000);
          }
          // Get Status just incase control panel hasn't connected yet
          get_status();
        }
        socket_di.onmessage = function got_packet(msg) {
          // Test if has clas list error and only remove if past date.
          /*
          if (document.getElementById("header").classList.contains("error")) {
            if (Date.now() >= _targetClearErrorMsg) {
              document.getElementById("header").classList.remove("error");
            }
          }*/
          document.getElementById("header").classList.remove("error");
          var data = JSON.parse(msg.data);
          if (data.type == 'status') {
            update_status(data);
          } else if (data.type == 'devices') {
            check_devices(data);
            resetBackgroundSize();
          } else if (data.type == 'schedules') {
            cs_schedules(data);
          } else if (data.type == 'dynamicconfig') {
            update_dynamicconfig(data);
          }
        }
        socket_di.onclose = function() {
          // something went wrong
          //document.getElementById("message").innerHTML = '  Connection error!  '
          setElementHTML("message", '  Connection error!  ');
          document.getElementById("header").classList.add("error");
          // Try to reconnect every 5 seconds.
          setTimeout(function() {
            startWebsockets()
          }, 5000);
        }
      } catch (exception) {
        alert('<p>Error' + exception);
      }
    }

    function get_devices() {
      var msg = {
        uri: "devices"
      };
      socket_di.send(JSON.stringify(msg));
    }

    function get_status() {
      var msg = {
        uri: "status"
      };
      socket_di.send(JSON.stringify(msg));
    }

    function get_dynamicconfig() {
      var msg = {
        uri: "dynamicconfig"
      };
      socket_di.send(JSON.stringify(msg));
    }

    function get_schedules() {
      var msg = {
        uri: "schedules"
      };
      socket_di.send(JSON.stringify(msg));
    }
    function set_schedules(msg) {
      msg.uri = "schedules/set";
      //console.log(JSON.stringify(msg));
      socket_di.send(JSON.stringify(msg));
      //socket_di.send(msg);
    }

    function send_command(cmd, value=null) {
      var _cmd = {};
      _cmd.command = cmd;
      _cmd.uri = cmd+"/set";
      if (value != null) {
        _cmd.value = value;
      }
//console.log("Send cmd  "+JSON.stringify(_cmd));
//console.trace("Tracing");
      socket_di.send(JSON.stringify(_cmd));

      if ( _config.tile_settings.link_spa_and_spa_heater && cmd == "Spa_Mode" ) {
        var ncmd = {};
        ncmd.command = "Spa_Heater";
        ncmd.uri = "Spa_Heater/set";
        if (value != null) {
          ncmd.value = value;
        }
//console.log("Send spa cmd  "+JSON.stringify(ncmd));
        socket_di.send(JSON.stringify(ncmd));
      }
    }

    function send_setpoint(id) {
      var message = {};
      var tile;
      if ((tile = document.getElementById(id)) == null) {
        return;
      }
      var type = tile.getAttribute('type');
      message.parameter = tile.getAttribute('id');
      message.value = tile.getAttribute('setpoint');

      if (type == "setpoint_swg")
        message.uri = id+"/percent/set";
      else if (type == "switch_vsp")
        message.uri = id+"/RPM/set";
      else if (type == "light_dimmer")
        message.uri = id+"/brightness/set";
      else
        message.uri = id+"/setpoint/set";

//console.log("Send setpoint  "+JSON.stringify(message));
      socket_di.send(JSON.stringify(message));
    }

    function send_light_mode(value, id, textvalue) {
      //console.log("Set light mode to "+value+" id="+id+" text="+textvalue);
      var mode = {};
      //mode.parameter = 'POOL_LIGHT_MODE';
      //mode.parameter = 'LIGHT_MODE';
      mode.value = value;
      mode.button = id;
      mode.uri = id+"/program/set";
      mode.text_value = textvalue;
      socket_di.send(JSON.stringify(mode));  
    }

    function send_switch_timer(id, value) {
      var message = {};
      message.uri = id+"/timer/set";
      message.value = value;
      socket_di.send(JSON.stringify(message));  
    }

    function reset() {
      socket_di.send("reset\n");
    }
