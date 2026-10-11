    function showScheduler(caller){

      var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      //console.log("height = "+height+" - "+caller.id);
      //console.log("Height="+height+", computedwidth="+getComputedStyle(document.querySelector('.scheduler_pane')).width+", clientWidth="+document.documentElement.clientWidth+", innerWidth="+window.innerWidth);

      if (typeof _enable_schedules === "undefined" || _enable_schedules != false)
      {
        //if ( parseInt(getComputedStyle(document.querySelector('.scheduler_pane')).width) > Math.max(document.documentElement.clientWidth, window.innerWidth) || height < 300 ) {
        // Really bad check, but works.  Should probably setup CSS variables for this.
        if ( Math.max(document.documentElement.clientWidth, window.innerWidth) < 600 || height < 300) {
        //alert("Sorry, Scheduler won't fit on screen\nPlease use a different device");
          displayMessage("Scheduler won't fit on screen", 3);
          return;
        }
        import("./cronstrue.min.js");
        caller.setAttribute('type', 'scheduler');
        showTileOptions(true, caller.id);

        //h=400;
        document.getElementById("scheduler_options_pane").style.maxHeight = (height-40)+'px';
        document.getElementById("scheduler_scrollabletable").style.maxHeight = (height-280)+'px';

        const cs_table = document.getElementById('cronschedules');
        if (cs_table) {
          const tableObserver = new ResizeObserver(cs_synchronizeTableWidths);
          tableObserver.observe(cs_table);
        }
       
      }
    }

    function showSimulator(caller){
      caller.setAttribute('type', 'simulator');
      showTileOptions(true, caller.id);
    }

    function startSimulator() {
      //console.log("Starting ifram sim init");
      document.getElementById('onetouch_iframe').display = 'block';
    }

    // NSF CHANGE TO USING WS FOR THIS REQUEST
    /*
      function cs_loadJSON(path, success, error) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              success(JSON.parse(xhr.responseText));
            }
            else {
              error(xhr);
            }
          }
        };
        xhr.open('GET', path, true);
        xhr.send();
      }*/

        function device2english(device, name) {
          for (let i = 0, obj; i < _scheduler_devices_json.length, obj = _scheduler_devices_json[i]; i++) {
            if (device == obj.id) {
              if (name == true) {
                return obj.name;
              } else {
                switch (obj.type) {
                  case "setpoint_thermo":
                  case "setpoint_freeze":
                  case "setpoint_chiller":
                    return "temperature";
                    break;
                  case "setpoint_swg":
                    return "percent";
                    break;
                  case "switch":
                    if (obj.type_ext == "switch_vsp") {
                      if (obj.Pump_Type == "vfPump" && _config.tile_settings.show_vsp_gpm.toLowerCase() === "true") {
                        return "GPM";
                      } else {
                        return "RPM";
                      }
                    }
                    break;
                }
              }
            }
          }
        }

    function cs_crontext(caller){

      for (let cell of caller.parentNode.parentNode.cells) {
        
        switch (cell.firstChild.id) {
          case "min":
            min = cell.firstChild.value;
            break;
          case "hour":
            hour = cell.firstChild.value;
            break;
          case "daym":
            daym = cell.firstChild.value;
            break;
          case "month":
            month = cell.firstChild.value;
            break;
          case "dayw":
            dayw = cell.firstChild.value;
            break;
          case "device":
            device = cell.firstChild.value;
            break;
          case "command":
            command = cell.firstChild.value;
            break;
          case "value":
            value = cell.firstChild.value;
            break;
        }
      }
      var extra = "";
      
      if (command >= 2) {
        //command=cs_getExtraCommand(device);
        extra = " set "+device2english(device, true)+" "+device2english(device, false)+" to "+value
      } else {
        extra = " turn "+device2english(device, true)+" "+((command == 1) ? 'on' : 'off')
      }
      
      var cron = min + " " + hour + " " + daym + " " + month + " " + dayw
      try {
        //document.getElementById("crontext").innerHTML = "<span class='cs_crontext'>&nbsp;" + cronstrue.toString(cron) + "<font size='-1'>" + extra + "</font>&nbsp;</span>";
        setElementHTML("crontext", "<span class='cs_crontext'>&nbsp;" + cronstrue.toString(cron) + "<font size='-1'>" + extra + "</font>&nbsp;</span>");
      } catch (error) {}

      var html = ""

      switch (caller.id) {
        case "min":
          html = html + "<tr><td class='cs_helpleft'>0-59</td><td class='cs_helpright'>allowed values</td></tr>";
          break;
        case "hour":
          html = html + "<tr><td class='cs_helpleft'>0-23</td><td class='cs_helpright'>allowed values</td></tr>";
          break;
        case "daym":
          html = html + "<tr><td class='cs_helpleft'>1-31</td><td class='cs_helpright'>allowed values</td></tr>";
          break;
        case "month":
          html = html + "<tr><td class='cs_helpleft'>1-12</td><td class='cs_helpright'>allowed values</td></tr>" +
            "<tr><td class='cs_helpleft'>JAN-DEC</td><td class='cs_helpright'>alternative single values</td></tr>";
          break;
        case "dayw":
          html = html + "<tr><td class='cs_helpleft'>0-6</td><td class='cs_helpright'>allowed values</td></tr>" +
            "<tr><td class='cs_helpleft'>SAT-SUN</td><td class='cs_helpright'>alternative single values</td></tr>";
          break;
      }

      if (html != "") {
        html = "<table align='center'>" +
          html +
          "<tr><td class='cs_helpleft'>*</td><td class='cs_helpright'>any vaue</td></tr>" +
          "<tr><td class='cs_helpleft'>,</td><td class='cs_helpright'>value list seperator</td></tr>" +
          "<tr><td class='cs_helpleft'>-</td><td class='cs_helpright'>range values</td></tr>" +
          "<tr><td class='cs_helpleft'>/</td><td class='cs_helpright'>setp values</td></tr>" +
          "</table>";
      }

      //document.getElementById("cronhelp").innerHTML = html;
      setElementHTML("cronhelp", html);
    }

    function cs_clearSchedules() {
      var table = document.getElementById("cronschedules");
      while (table.rows.length > 1) {
        table.deleteRow(CS_ROW_INDEX+1);
      }
    }

    function cs_addschedule(enabled, min, hour, daym, month, dayw, device, subdev, value) {

        var table = document.getElementById("cronschedules");
        //index = table.rows.length-ROW_INDEX;

        var option = "";
        var subOption = "";
        //var value_type = "number";
        //console.log("device'"+device+"'");
        if (device === "") {
          option = '<option selected value=""></option>';
          //value_type="hidden";
        }

        for (let i = 0, obj; i < _scheduler_devices_json.length, obj = _scheduler_devices_json[i]; i++) {
          if (device == obj.id) {
            option = option + '<option selected value="' + obj.id + '">' + obj.name + '</option>';
            subOption = cs_getDeviceOptions(obj, subdev, value)
          } else {
            option = option + '<option value="' + obj.id + '">' + obj.name + '</option>';
          }
        }
        var checked
        if (enabled==1) {checked="checked";}else{ehecked="";}
        var html = '<tr> \
        <td><input type="checkbox" class="cs_inputcell" id="enabled" onkeyup="cs_crontext(this);" onclick="cs_crontext(this);" '+checked+'></td> \
        <td><input type="text" class="cs_inputcell" id="min" value="'+ min + '" onkeyup="cs_crontext(this);" onclick="cs_crontext(this);"></td> \
        <td><input type="text" class="cs_inputcell" id="hour" value="'+ hour + '" onkeyup="cs_crontext(this);" onclick="cs_crontext(this);"></td> \
        <td><input type="text" class="cs_inputcell" id="daym" value="'+ daym + '" onkeyup="cs_crontext(this);" onclick="cs_crontext(this);"></td> \
        <td><input type="text" class="cs_inputcell" id="month" value="'+ month + '" onkeyup="cs_crontext(this);" onclick="cs_crontext(this);"></td> \
        <td><input type="text" class="cs_inputcell" id="dayw" value="'+ dayw + '" onkeyup="cs_crontext(this);" onclick="cs_crontext(this);"></td> \
        <td><select name="device" class="cs_inputcell cs_devicecell" id="device" onclick="cs_crontext(this);" onchange="cs_deviceChange(this);">'+ option + '<select></td> \
        <td><select name="command" class="cs_inputcell cs_commandcell" id="command" onclick="cs_crontext(this);" onchange="cs_commandChange(this);">'+ subOption + '<select></td> \
        <td><input type="text" class="cs_inputcell cs_valuecell" onclick="cs_crontext(this);" id="value" pattern="[0-9]+" value="'+ value + '"></td> \
        <td><input type="button" class="cs_deletebutton sc_button" id="delete" value="X" onclick="cs_deleteschedule(this);"></td> \
        </tr>';

        //<td><input type="number" class="cs_inputcell cs_valuecell" onclick="cs_crontext(this);" min="0" max="9999" id="value" value="'+value+'"></td>

        var row = table.insertRow(table.rows.length - CS_ROW_INDEX);
        row.innerHTML = html;
        //console.log("add row "+index)

        // dummy an onchange event to the value input so they get hidded if needed.
        var element = row.querySelector('#command')
        var event = new Event('change');
        element.dispatchEvent(event);

       // cs_synchronizeTableWidths();
    }

        function cs_isSelected(option, val1, val2) {
          var rtn = "";
          if (val1 == "set") {
            if (option == val2) { rtn = "selected" }
          } else {
            if (option == val1) { rtn = "selected" }
          }

          return rtn;
        }


        function cs_getDeviceOptions(deviceobj, val1, val2) {
          //setpoint = Temp
          var html = '<option value="' + V_ON + '" ' + cs_isSelected(V_ON, val1, val2) + '>On</option><option value="' + V_OFF + '" ' + cs_isSelected(V_OFF, val1, val2) + '>Off</option>';

          switch (deviceobj.type) {
            case "switch":
              if (deviceobj.type_ext == "switch_vsp") {
                if (deviceobj.Pump_Type == "vfPump") {
                  //html = html + '<option value="' + V_RPM + '" ' + cs_isSelected("RPM", val1, val2) + '>RPM</option><option value="' + V_GPM + '" ' + cs_isSelected("GPM", val1, val2) + '>GPM</option>';
                  html = html + '<option value="' + V_GPM + '" ' + cs_isSelected("GPM", val1, val2) + '>GPM</option>';
                } else {
                  html = html + '<option value="' + V_RPM + '" ' + cs_isSelected("RPM", val1, val2) + '>RPM</option>';
                }
              }
              break
            case "setpoint_thermo":
            case "setpoint_chiller":
              html = html + '<option value="' + V_SETPOINT + '" ' + cs_isSelected("setpoint", val1, val2) + '>Temp</option>'
              break
            case "setpoint_swg":
              html = '<option value="' + V_PERCENT + '">Percent</option>'
              break
            case "setpoint_freeze":
              html = '<option value="' + V_SETPOINT + '">Temp</option>'
              break
          }
          return html;

        }

        function cs_deviceChange(caller) {

          for (let i = 0, obj; i < _scheduler_devices_json.length, obj = _scheduler_devices_json[i]; i++) {
            if (caller.value == obj.id) {
              var element = caller.parentNode.parentNode.querySelector('#command')
              element.innerHTML = cs_getDeviceOptions(obj);
              var event = new Event('change');
              element.dispatchEvent(event);
              break;
            }
          }

        }

        function cs_commandChange(caller) {
          //console.log("Called "+caller.value);
          value = caller.parentNode.parentNode.querySelector('#value')
          if (caller.value >= 2) {
            value.type = "text";
          } else {
            value.type = "hidden";
          }
        }

        function cs_deleteschedule(caller) {
          var index = caller.parentNode.parentNode.rowIndex;
          document.getElementById("cronschedules").deleteRow(index);
        }

        function cs_schedules(json) {
          if (typeof json.schedules === "undefined"){
            return
          }
            for (let i = 0; i < json.schedules.length; i++) {
              let obj = json.schedules[i];
              //console.log("Sched "+obj.url);
              var f = 0;
              var subdev = "";
              var device = "";
              for (var j = 0; j < obj.url.length; j++) {
                if (obj.url[j] == "/") {
                  f++;
                } else if (f == 2) {
                  device = device + obj.url[j];
                } else if (f == 3) {
                  subdev = subdev + obj.url[j];
                }
              }
              // If in release we add device, use obj.id rather than device in below and remove device from above.
              cs_addschedule(obj.enabled, obj.min, obj.hour, obj.daym, obj.month, obj.dayw, device, subdev, obj.value);
            }
        }

        function cs_getExtraCommand(device, commandID) {
            for (let i = 0, obj; i < _scheduler_devices_json.length, obj = _scheduler_devices_json[i]; i++) {
              if (device == obj.id) {
                switch (obj.type) {
                  case "setpoint_thermo":
                  case "setpoint_chiller":
                  case "setpoint_freeze":
                    return "/setpoint";
                    break;
                  case "setpoint_swg":
                    return "/percent";
                    break;
                  case "switch":
                    if (obj.type_ext == "switch_vsp") {
                      if (commandID == 4) {
                        return "/GPM";
                      } else {
                        return "/RPM";
                      }
                    }
                    break;
                }
              }
            }
        }

          function cs_createJSON() {

            var json = {
              uri: "schedules/set",
              devices: []
            };
            var table = document.getElementById("cronschedules");
            //console.log("ROWS = "+table.rows.length);
            for (var r = CS_ROW_INDEX, row; row < table.rows.length-2, row = table.rows[r]; r++) {
              enabled = Number(row.querySelector('#enabled')?.checked).toString();
              min = row.querySelector('#min')?.value;
              hour = row.querySelector('#hour')?.value;
              daym = row.querySelector('#daym')?.value;
              month = row.querySelector('#month')?.value;
              dayw = row.querySelector('#dayw')?.value;
              device = row.querySelector('#device')?.value;
              command = row.querySelector('#command')?.value;
              value = row.querySelector('#value')?.value;
              if (min && hour && daym && month && dayw && device && command) {
                if (command >= 2) {
                  command = cs_getExtraCommand(device, command);
                  if ( isNaN(value) ) {
                    row.querySelector('#value').classList.add("cs_error");
                    document.getElementById("crontext").innerHTML = "<span class='cs_crontext'>&nbsp;<font color='red'>FIX ERROR</font>&nbsp;</span>";
                    return false;
                  }
                } else {
                  value = command;
                  command = "";
                }
                json.devices.push({
                  "enabled": enabled,
                  "min": min,
                  "hour": hour,
                  "daym": daym,
                  "month": month,
                  "dayw": dayw,
                  "url": "/api/" + device + command + "/set",
                  "value": value
                })
              }
            }
            //console.log(JSON.stringify(json));
            set_schedules(json);
            return true;
          }

    /*********************************************************************
     *  
     *   LOAD / INIT FUNCTIONS
     * 
     *********************************************************************/
