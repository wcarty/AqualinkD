    function update_dynamicconfig(data) {
      _dynamicconfig = data;
      _enable_schedules = isConfigEnabled(_dynamicconfig.enable_schedules);
    }

    function update_status(data) {
      //console.log("Received Update Satus");
      _aqualink_data = data;
      var el = document.getElementById("datetime");

      if (data.time.toString() != "" && data.time.toString() != "xx") 
        el.innerHTML = data.time.toLowerCase().replace(" ", "&nbsp;") + ((_landscape) ? "&nbsp;" : "<br>") + data.date.toLowerCase().replace(" ", "&nbsp;");
      
      if (document.getElementById("name").innerHTML == "AqualinkD") {
        if (data.status != "Ready") {
          //document.getElementById("message").innerHTML = formatSatus(data.status);
          displayMessage(formatSatus(data.status));
        } else {
          //document.getElementById("message").innerHTML = '';
          displayMessage(formatSatus(''));
        }
      }
     
      if (data.status.indexOf("ERROR") >= 0)
        document.getElementById("header").classList.add("error");

      // Hard code value updated as I can't be bothered to update source.
      // should come back and re-do these values.
      // The ID's should ultimatly come from json
      setThermostatTile("Pool_Heater", data.pool_temp, data.pool_htr_set_pnt);
      setThermostatTile("Spa_Heater", data.spa_temp, data.spa_htr_set_pnt);
      setThermostatTile("Freeze_Protect", data.air_temp, data.frz_protect_set_pnt);

      
      if ( data.chiller_mode !== undefined ) {
        try{
          let elmt = document.getElementById("Chiller");
          elmt.setAttribute("mode", data.chiller_mode);
        } catch (exception){}
      }

      if ( data.chiller_set_pnt !== undefined ) {
        let mode = document.getElementById("Chiller")?.getAttribute("mode");
        // NSF Should use spa temp if in spa mode
        if (data.leds.Spa !== undefined && data.leds.Spa == "on")
          setThermostatTile("Chiller", data.spa_temp, data.chiller_set_pnt);
        else {
          //if (mode == "heat") {
          //  setThermostatTile("Chiller", data.pool_temp, data.pool_htr_set_pnt);
          //} else {
            setThermostatTile("Chiller", data.pool_temp, data.chiller_set_pnt, data.pool_htr_set_pnt);
          //}
        }
      }
      
      setTileValue("Temperature/Air", data.air_temp);
      setTileValue("Temperature/Pool", data.pool_temp);
      setTileValue("Temperature/Spa", data.spa_temp);

      if (typeof(data.swg_percent) !== 'undefined')
        setThermostatTile("SWG", data.swg_percent, data.swg_percent);

      if (typeof(data.swg_ppm) !== 'undefined')
        setTileValue("SWG/PPM", data.swg_ppm);
      if (typeof(data.swg_fullstatus) !== 'undefined')
        setTileAttribute('SWG', "fullstatus", data.swg_fullstatus);
      
      if (typeof(data.chem_ph) !== 'undefined')
        setTileValue("CHEM/pH", data.chem_ph);
      if (typeof(data.chem_orp) !== 'undefined')
        setTileValue("CHEM/ORP", data.chem_orp);

      /*
      setTileValue("Air", data.air_temp);
      setTileValue("Pool_Water", data.pool_temp);
      setTileValue("Spa_Water", data.spa_temp);*/
      for (var obj in data.leds) {
        setTileOn(obj.toString(), data.leds[obj]);

        if (obj.toString() == 'SWG/Boost') {
          //console.log("BOOST IS "+data.leds[obj]);
          setTileAttribute('SWG', "Boost", data.leds[obj]);
          //setTileValue
        } 
      }
      for (var obj in data.timers) {
        setTileOnText(obj.toString(),"On (timer)");
        //setTileOnTextLine2(obj.toString(),"On (timer)");
        //console.log("TIMER "+obj.toString());
      }
      for (var obj in data.timer_durations) {
        //setTileOnText(obj.toString(),"Timer "+toHoursAndMinutes(data.timer_durations[obj]));
        setTileOnText(obj.toString(),"Timer "+formatDuration(data.timer_durations[obj]));

        //setTileOnTextLine2(obj.toString(),"Timer "+toHoursAndMinutes(data.timer_durations[obj]));
        //console.log("TIMER "+obj.toString()+" duration "+data.timer_durations[obj]);
      }

      for (var obj in data.sensors) {
        //console.log("Set Value `Sensor/"+obj.toString()+"' to "+data.sensors[obj]);
        setTileValue("Sensor/"+obj.toString(), data.sensors[obj]);
        //setTileValue(obj.toString(), data.sensors[obj]);
      }

      for (var obj in data.alternate_modes) {
        //console.log(obj.toString() +" "+ data.alternate_modes[obj.toString()] );
        try {
          let element = document.getElementById(obj.toString());
          let label = document.getElementById(obj.toString()+'_name');
          if ( data.alternate_modes[obj.toString()] == "on") {
            label.textContent = element.getAttribute('label')+" "+element.getAttribute('alt_label');
          } else {
            label.textContent = element.getAttribute('label');
          }
        } catch (exception){}
      }

      for (var obj in data.light_program_names) {
        if (data.light_program_names[obj] != "") {
          var light_mode_name = data.light_program_names[obj];
          var light_mode = -1;
          // If aqualinkd programmed light, need to convert int to text index, if not value is text
          try {
            var light_type = document.getElementById(obj.toString()).getAttribute('lighttype'); 
            /*
            if (light_type == "0") {
              light_mode = data.light_program_names[obj];
              // For backward compatibility we could get a name here or number (number is is lights modes are in config.js vs aqualinkd.conf)
              //console.log("Light "+light_mode);
              if (! isNaN(light_mode)) {
                //light_mode_name = _light_program[light_type][light_mode];
                light_mode_name = _dynamicconfig?.light_programs[light_type][light_mode];
                if (light_mode_name.endsWith(" - Show")) {
                  light_mode_name = light_mode_name.slice(0, -7);
                }
              }
            } else*/ if (/*light_type == 10 ||*/ light_type == 11) {
              // Fo Dimmer Lights.
              light_mode = parseInt(light_mode_name);
              document.getElementById(obj.toString()).setAttribute('setpoint', light_mode);
            } else {
              //light_mode = _light_program[light_type].findIndex(element => element.startsWith(light_mode_name));
              light_mode = _dynamicconfig?.light_programs[light_type].findIndex(element => element.startsWith(light_mode_name));
              
            }
          } catch (e) {}

          if (light_mode_name != "-999%" && light_mode_name != "Off" && light_mode_name != "off")
            setTileOnText(obj.toString(),light_mode_name);
          
          try {
            document.getElementById(obj.toString()).setAttribute('spvalue', light_mode);
            //console.log(obj.toString()+" set spvalue attribute to "+light_mode);
            //console.log("Light mode index "+light_mode+" - "+light_mode_name+" ----- "+_light_program[light_type][light_mode]);
          } catch (e) { /*console.log(e);*/ }
          
        }
      }
        

      if (data.swg_boost_msg != null ) {
        var tile = document.getElementById('SWG');
        if (tile != null) {
          var sp_value = tile.getAttribute('setpoint');
          if (sp_value == 101) {
            //document.getElementById('SWG' + '_status').innerHTML = 'Boost '+data.swg_boost_msg;
            setElementHTML('SWG' + '_status', 'Boost '+data.swg_boost_msg);
          }
        }
      }
      var i = 1;
      while (i < 5) {
        //console.log(data["Pump_"+i].RPM);
        if (typeof data["Pump_"+i] !== 'undefined') {
          updatePumpTile(data["Pump_"+i].id, data["Pump_"+i].Status, data["Pump_"+i].Pump_Type, data["Pump_"+i].RPM, data["Pump_"+i].GPM, data["Pump_"+i].Watts);
        }
        i++;
      }
    }

    function updatePumpTile(tileid, status, type, rpm, gpm, watts) {
      var tLine = '';
      var bLine = '';
       // If we have 1 line, simple (error & priming takes presidence over anything else)
       // If we have 2 lines, then BOTTOM (line #1) is ERROR (not priming) or what the pump needs to control (RPM for all except VF which is GPM)
       //                          TOP (line #2) is (priming/RPM/GPM).
       
      // 1,0,-1 are all good states, anything else error
      try {
      if (status >= 1 || status <= -3) {
        if (status == -3) {
          setTileOnText(tileid, 'Pump Offline');
        } else {
          setTileOnText(tileid, 'Pump ERROR');
        }
        document.getElementById(tileid).setAttribute('setpoint', 0);
        setTileOnTextLine2(tileid, "");
        return;
      }

      if (type == "vfPump") {
        bLine = ((gpm > 0) ? 'GPM:'+gpm : 'GPM:0');
        tLine = ((rpm > 0) ? 'RPM:'+rpm : '');
        document.getElementById(tileid).setAttribute('setpoint', ((gpm > 0) ? gpm : 0));
      } else if ( rpm > 0) {
        bLine = ((rpm > 0) ? 'RPM:'+rpm : 'RPM:0');
        if (gpm > 0) {
          tLine = 'GPM:'+gpm;
        } else if (watts > 0) {
          tLine = 'Watts:'+watts;
        }
        document.getElementById(tileid).setAttribute('setpoint', ((rpm > 0) ? rpm : 0));
      } else if ( watts > 0 ) {
        bLine = ((watts > 0) ? 'Watts:'+watts : '');
        document.getElementById(tileid).setAttribute('setpoint', ((rpm > 0) ? rpm : 0));
      }
      // If we are in priming. Move lines and display priming
      if (status == -2) {
        tLine = bLine;
        bLine = 'Pump Priming';
      } else if (status == -1) {
        // Pump is off
        var tLine = '';
        var bLine = 'On';
      }
      
      setTileOnText(tileid, bLine);
      setTileOnTextLine2(tileid, tLine);
      } catch (e) {
        // NSF Do we need to create the device?
        console.log('ERROR id=' + tileid + ' Line '+new Error().lineNumber+' | element = '+document.getElementById(tileid));
      }
    }

    function deviceSort(a, b) {
      var pa;
      var pb;
      try {
        //pa = devices.indexOf(a.id);
        //pb = devices.indexOf(b.id);
        pa = caseInsensitiveIndexOf(_devices,a.id);
        pb = caseInsensitiveIndexOf(_devices,b.id);
        if (pa > pb) 
          return 1;
        else if (pa < pb)
          return -1;
      } catch (e) {}
      return 0;
    }

    function check_devices(data) {
      _temperature_units = data['temp_units'];
      _scheduler_devices_json = [];
      data['devices'].sort(deviceSort);
      for (var obj in data['devices']) {

        if ((data['devices'][obj].type == "switch" || data['devices'][obj].type == "switch_vsp" || data['devices'][obj].type.substr(0,8) == "setpoint" ) && data['devices'][obj].name != "NONE") {
          _scheduler_devices_json.push(data['devices'][obj]);
        }

        if (document.getElementById(data['devices'][obj].id) == null) {
          _displayNames[data['devices'][obj].id.replace("Aux_", "AUX")] = data['devices'][obj].name;
          createTile(data['devices'][obj]);
        } else {
          //console.log("CHECK "+document.getElementById(data['devices'][obj].id).getAttribute('type')+" | against "+data['devices'][obj].type+" | and "+data['devices'][obj].type_ext+" | for "+data['devices'][obj].id);
          //CHECK switch | against setpoint_thermo | and undefined | for Pool_Heater

          var element_type = document.getElementById(data['devices'][obj].id).getAttribute('type');
          var ext_type;
          if (typeof data['devices'][obj].type_ext !== 'undefined')
            ext_type = data['devices'][obj].type_ext;
          else
            ext_type = element_type; // Just force next if to match.

          //if ( (element_type != data['devices'][obj].type) &&
          //     (typeof data['devices'][obj].type_ext !== 'undefined' && (element_type != data['devices'][obj].type_ext) ) ) {
          if ( (element_type != data['devices'][obj].type) && (ext_type != data['devices'][obj].type_ext) ) {
            console.log("Remove and create "+data['devices'][obj].id);
            console.log("Old type "+element_type+" | new type "+data['devices'][obj].type+" sub "+data['devices'][obj].type_ext);
            var element = document.getElementById(data['devices'][obj].id);
            element.parentNode.removeChild(element);
            createTile(data['devices'][obj]);
          }
        }
      }
    }
