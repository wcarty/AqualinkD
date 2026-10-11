    function endPress(id) {
      //pressEvent = 0;
      //alert ("Long press "+id);
      //switchTileState(id, true);
      showTileOptions(true, id);
    }

    function add_clickEvent(tile, id) {
      tile.classList.add('interactive');
      tile.setAttribute('role', 'button');
      tile.setAttribute('tabindex', '0');
      tile.setAttribute('aria-label', tile.textContent || id.replace(/_/g, ' '));
      tile.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          switchTileState(id, false);
        }
      });
      tile.addEventListener('touchstart', function() {
        _ignoreMouseEvent = true;
        _pressEvent = window.setTimeout(function() {
          _pressEvent = 0;
          endPress(id);
        }, 1000);
      });
      tile.addEventListener('touchend', function() {
        if (_pressEvent != 0) {
          clearTimeout(_pressEvent);
          switchTileState(id, false);
        }
      });
      tile.addEventListener("mousedown", function() {
        if (_ignoreMouseEvent == false) {
          _pressEvent = window.setTimeout(function() {
            _pressEvent = 0;
            endPress(id);
          }, 1000);
        }
      });
      tile.addEventListener("mouseup", function() {
        if (_pressEvent != 0 && _ignoreMouseEvent == false) {
          clearTimeout(_pressEvent);
          switchTileState(id, false);
        }
      });
    }

    function add_tile(id, name, status, type, subtype, off_imgurl, on_imgurl) {
    //function add_tile(id, name, status, type, subtype) {
      var height = getComputedStyle(document.documentElement).getPropertyValue('--tile_icon-height');
      
      var div = document.createElement('div');
      div.setAttribute('class', 'tile');
      div.setAttribute('id', id);
      div.setAttribute('type', subtype);
      //div.setAttribute('onclick', "switchTileState('" + id + "')");
      var subdiv = document.createElement('div');
      subdiv.setAttribute('class', 'tile_icon');
      subdiv.setAttribute('id', id + '_icon');
      
      //console.log(name+" = "+type+" "+subtype);

      if (type.startsWith("switch")) { // Use default SVG for icon images

        if (off_imgurl == null) {
          var valdiv = document.createElement('div');
          if (_DisableOffIconCircle) {
            valdiv.setAttribute('class', 'switch-off tile_icon_value');
          } else {
            valdiv.setAttribute('class', 'switch-off tile_icon_value disabled');
          }
          valdiv.setAttribute('id', id + '_tile_icon_value');
          subdiv.appendChild(valdiv);
          div.appendChild(subdiv);
        } else {     // Use URL for icon image
          var imgdiv = document.createElement('img');
          imgdiv.setAttribute('height', height + 'px');
          imgdiv.setAttribute('src', off_imgurl);
          subdiv.appendChild(imgdiv);
          div.appendChild(subdiv);
          if (on_imgurl != null) {
            subdiv = document.createElement('div');
            subdiv.setAttribute('class', 'tile_icon');
            subdiv.setAttribute('id', id + '_icon_on');
            imgdiv = document.createElement('img');
            imgdiv.setAttribute('height', height + 'px');
            imgdiv.setAttribute('src', on_imgurl);
            subdiv.style.display = 'none';
            subdiv.appendChild(imgdiv);
            div.appendChild(subdiv);
          }
        }

        //console.log("SWITCH "+name+" = "+type+" "+subtype);
      } else if (type == "value" || type == "thermostat") {
        var valdiv = document.createElement('div');
        valdiv.setAttribute('class', 'tile_icon_value disabled');
        valdiv.setAttribute('id', id + '_tile_icon_value');
        valdiv.textContent = '--';
        subdiv.appendChild(valdiv);
        div.appendChild(subdiv);
      }
      /*else if (type == "thermostat") {
             valdiv = document.createElement('div');
             valdiv.setAttribute('class', 'tile_icon_value disabled');
             valdiv.setAttribute('id', id + '_tile_icon_value');
             valdiv.textContent = '--';
             subdiv.appendChild(valdiv);
           } */
      var title_subdiv = document.createElement('div');
      title_subdiv.setAttribute('class', 'tile_name');
      title_subdiv.setAttribute('id', id + '_name');
      title_subdiv.textContent = cutContentTextLength(name, 2);
      div.appendChild(title_subdiv);
      // Value and Thermostat are the same, but value is read only and no state
      //if (type != "value") {
      {
        // Add extra status line to VSP if we can
        if (subtype == "switch_vsp") {
          //var title1linechatlimit = getComputedStyle(document.documentElement).getPropertyValue('--tile_name-charlimit');
          if ( name.length <= _tile_line_char_limit ) {
            subdiv = document.createElement('div');
            subdiv.setAttribute('class', 'tile_status');
            subdiv.setAttribute('id', id + '_status_line2');
            div.appendChild(subdiv);
            title_subdiv.classList.add("tile_name_1line");
            title_subdiv.classList.remove("tile_name");
          }
        }
        subdiv = document.createElement('div');
        subdiv.setAttribute('class', 'tile_status');
        subdiv.setAttribute('id', id + '_status');
        if (type != 'value') {
          subdiv.textContent = formatSatus(status);
        }
        div.appendChild(subdiv);
        if (type == "switch" && (subtype != "switch_program" && subtype != "switch_vsp" && 
                                subtype != "switch_timer" && subtype != "light_dimmer") ) {
        //if (type == "switch" && subtype != "switch_program" ) {
          div.setAttribute('onclick', "switchTileState('" + id + "')");
          div.classList.add('interactive');
          div.setAttribute('role', 'button');
          div.setAttribute('tabindex', '0');
          div.setAttribute('aria-label', name);
          div.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              switchTileState(id, false);
            }
          });
          //console.log("add onclick switchtilestate to "+id);
        } else if (type != "value") {
          add_clickEvent(div, id);
          //console.log("add click Event to "+id);
        }
      }
      document.getElementById('wrapper').appendChild(div);
    }

    function cutContentTextLength(text, lines) {
      //var title1linechatlimit = getComputedStyle(document.documentElement).getPropertyValue('--tile_name-charlimit');
      // 12 or 15.
      if ( countLines(text, _tile_line_char_limit-1 ) > lines ) {
        //console.log ("Text '"+text+"' will take 3+ lines");
        text = text.replace(/\bChemistry\b/, "Chem");
        //console.log ("new Text '"+text+"'");
      }
      return text
    }

    function countLines(text, limit = 15) {
      if (!text) return 1;
      const words = text.split(/\s+/);  // split on spaces (multiple OK)
      let lines = 1;
      let currentLen = 0;

      for (const word of words) {
        if (word.length === 0) continue; // skip empty strings

        if (currentLen === 0) {
      // first word on the line
          currentLen = word.length;
        } else if (currentLen + 1 + word.length <= limit) {
      // add word + 1 space
          currentLen += 1 + word.length;
        } else {
      // new line
          lines++;
          currentLen = word.length;
        }
      }
      return lines;
    }

    function switchTileState(id, details) {
      if (details) {
        console.log("TILE DETAILS WHY ARE WE HERE??? '" + id + "'");
      } else {
        setTileState(id, (document.getElementById(id).getAttribute('status') == 'off'))
      }
    }

    function setTileState(id, state) {
      try {
        if (state == (document.getElementById(id).getAttribute('status') == 'off')) {
          send_command(id, (state==true?1:0) );
        } else {
          //console.log("state "+id+" to "+(state)?"on":"off")
        }
        
        setTileOn(id, ((state) ? "on" : "off"));
      } catch(exception) {
        console.error("setTileState() :-" + exception);
      }
    }

    function setThermostatSetpoint(id, sp_value) {
      var tile;
      if ((tile = document.getElementById(id)) == null) {
        return;
      }
      tile.setAttribute('setpoint', sp_value);
      send_setpoint(id);
    }


   
    // Reduce the number of decimal places if a float is longer than a
    // a set number of digits.  Leave any int / string alone, and ONLY reduce the decimal part of a float.

    function reduct(value) {

      const str = String(value);
      const parts = str.split('.');

      const integerDigits = parts[0].length;
  
      let fractionalDigits = 0;
      // If the array has more than one part, a decimal point was found.
      if (parts.length > 1) {
        fractionalDigits = parts[1].length;
      } else {
        // No decimal places, return.
        return value;
      }

      // Large tiles vs small tiles.
      let total_digits = 3;
      if ( _aq_display_tile_size == "large" ) {
          total_digits = 5;
      }

      if (integerDigits + fractionalDigits <= total_digits) {
        // Total length is less so no change
        return value;
      } else if (integerDigits >= total_digits) {
        // Simply return the intiger and not decimal places.
        return parts[0].toString();
      } else {
        let numFractionalDigits = total_digits - integerDigits;
        return parts[0].toString() + "." + parts[1].substring(0, numFractionalDigits);
      }
      return value;
    }

    /*
      Set any UOM that's not deg to smaller font
    */
    function formatUOM(uom) {
      if (uom == "&deg;" || uom == "°") {
        return uom;
      }
      return '<span class="uom_text">'+uom+'</span>';
    }

    function setTileValue(id, value) {
      var ext = '';
      var type = null;
//console.log("setTileValue "+id+" "+value);
      try {
        type = document.getElementById(id).getAttribute('type');

        if (value == undefined || value.startsWith("-999") || value.startsWith(" ")) {
          value = '--';
        } else {
          let uom;
          if ((uom = document.getElementById(id)?.getAttribute('UOM')) != null) {
            //console.log("UOM for "+id+" is "+uom);
            ext = uom;
            //ext = '<span class="uom_text">'+uom+'</span>';
          } else if ((type = document.getElementById(id)?.getAttribute('type')) != null) { 
            if (type == 'temperature' || type == 'setpoint_thermo' || type == 'setpoint_freeze' || type == 'setpoint_chiller') {
              ext = '&deg;';
            } else if (type == 'setpoint_swg') {
              ext = '%';
              //ext = '<span class="uom_text">%</span>';
            } else if (type == 'value' && id == 'CHEM/ORP') {
              //ext = '<span class="uom_text">mV</span>';
              ext = "mV";
            }
            //else if (type == 'value' && id == 'CHEM/pH')
            //  ext = '<span class="uom_text">pH</span>';
          }
        }

        if ((type == 'temperature' || type == 'value') /*&& _turn_off_sensortiles == false*/) {
          // Anything specific (SWG PPM should be off if SWG is off)
          // This needs a try catch, or is above try block good enough?
          if (id == 'SWG/PPM' && document.getElementById('SWG').getAttribute('status') != 'on' && isConfigEnabled(_config.tile_settings.turn_off_sensortiles)) {
            setTileOn(id, 'off');
            setTileOnText(id, "");
          } else if ( (id == 'CHEM/ORP' || id == 'CHEM/pH' ) && document.getElementById('Filter_Pump').getAttribute('status') == 'off' && isConfigEnabled(_config.tile_settings.turn_off_sensortiles)) {
            setTileOn(id, 'off');
            setTileOnText(id, "");
          // Generic for all.
           } else if ((value == 0 || value == '--') && isConfigEnabled(_config.tile_settings.turn_off_sensortiles)) {
            setTileOn(id, 'off');
            setTileOnText(id, "");
          } else {
            setTileThresholds(id, value)
          }
        }
      } catch (e) {
          // Devices that are hidden are not found
          //console.error(e);
          //console.log('ERROR id=' + id + ' Line '+new Error().lineNumber+' | element = '+document.getElementById(id)+"\n"+e);
      }
      //document.getElementById(id + '_tile_icon_value').textContent = value;
      var tile;
      if ((tile = document.getElementById(id + '_tile_icon_value')) != null){
        // Stupid way but testing fixing false positives from codeQL
        //tile.innerHTML = formatUOM(ext);
        //tile.textContent = reduct(value) + tile.textContent;
        tile.innerHTML = reduct(value) + formatUOM(ext);
      }
    }

    function setTileThresholds(id, value) {
      //const thresholds = _tile_thresholds[id];
      const thresholds = _config?.tile_thresholds?.[id] ?? null;
      
      if (thresholds == null || !thresholds) {
        // No thresholds defined for this tile
        setTileOn(id, 'on');
        setTileOnText(id, '');
        return;
      }

      let status = 'on';
      let text = '';

      if (value <= thresholds?.outofrange?.min || value >= thresholds?.outofrange?.max) {
        status = 'rangecritical';
        if ( value <= thresholds?.outofrange?.min && thresholds?.outofrange?.mintext != null)
          text = thresholds.outofrange.mintext;
        else if ( value >= thresholds?.outofrange?.max && thresholds?.outofrange?.maxtext != null)
          text = thresholds.outofrange.maxtext;
        else
          text = 'Out of range';
      } else if (value <= thresholds?.attention?.min || value >= thresholds?.attention?.max) {
        status = 'rangewarning';
        if ( value <= thresholds?.attention?.min && thresholds?.attention?.mintext != null)
          text = thresholds.attention.mintext;
        else if ( value >= thresholds?.attention?.max && thresholds?.attention?.maxtext != null)
          text = thresholds.attention.maxtext;
        else if (_tile_line_char_limit < 15)
          text = 'Attention';
        else
          text = 'Needs attention';
      }

      setTileOn(id, status);
      setTileOnText(id, text);
    }

    function setTileUOM(id, uom) {
      try {
        type = document.getElementById(id).setAttribute('UOM', uom);
        //console.log("Set UOM to "+uom+" for "+id);
      } catch (e) {}
    }

    function setTileOnText(id, text) {
      //console.log("setTileOnText() "+id+" "+text);
      try {
        var tile = document.getElementById(id);
        if (tile.getAttribute('status') == 'on' || tile.getAttribute('status') == 'enabled') {
          //document.getElementById(id + '_status').innerHTML = text;
          setElementHTML(id + '_status', text);
        } else if (tile.getAttribute('status') == 'rangeoptimal' || tile.getAttribute('status') == 'rangewarning' || tile.getAttribute('status') == 'rangecritical') {
          //document.getElementById(id + '_status').innerHTML = text;
          setElementHTML(id + '_status', text);
        } else {
          //document.getElementById(id + '_status').innerHTML = text;
          //console.log("Tile "+id+" status is '"+document.getElementById(id).getAttribute('status')+"' not setting text to '"+text+"'");
        }
      } catch(exception) {}
    }
    function setTileOnTextLine2(id, text) {
      try {
        if (document.getElementById(id).getAttribute('status') == 'on') {
          //document.getElementById(id + '_status_line2').innerHTML = text;
          setElementHTML(id + '_status_line2', text);
          return true;
        } else {
          //console.log("Tile "+id+" status is '"+document.getElementById(id).getAttribute('status')+"' not setting text to '"+text+"'");
        }
      } catch(exception) { console.log(exception); }
      return false;
    }
    function getTileOnText(id) {
      try {
        var tile = document.getElementById(id);
        if (tile.getAttribute('status') == 'on' || tile.getAttribute('status') == 'enabled') {
          return document.getElementById(id + '_status').innerHTML;
        } else {
          //console.log("Tile "+id+" status is '"+document.getElementById(id).getAttribute('status')+"' not setting text to '"+text+"'");
        }
      } catch(exception) {}

      return "";
    }
    function getTileSPvalue(id) {
      try {
        return parseInt(document.getElementById(id).getAttribute('spvalue'));
      } catch(exception) {}
      return -1;
    }

    //function getTileS

    function setThermostatTile(id, value, sp_value, sp_value2=null) {
      setTileValue(id, value);
      var tile;
      if ((tile = document.getElementById(id)) != null) {
        tile.setAttribute('setpoint', sp_value);
      }

      if ( tile.getAttribute('type') === 'setpoint_chiller' & sp_value2 !== null) {
      //if (id === "Chiller" & sp_value2 !== null) {
        tile.setAttribute('heat-setpoint', sp_value2);
        tile.setAttribute('cool-setpoint', sp_value);
      }
    }

    function setTileAttribute(id, attribute, value) {
      var tile;
      if ((tile = document.getElementById(id)) != null) {
    //console.log("Set Attribute "+attribute+ " to "+value+" for "+id);
        tile.setAttribute(attribute, value);
      }
    }

    function getTileAttribute(id, attribute) {
      var tile;
      if ((tile = document.getElementById(id)) != null) {
  //console.log("get Attribute "+attribute+ " to "+tile.getAttribute(attribute)+" for "+id);
        return tile.getAttribute(attribute);
      }
      return null;
    }

    function capitalizeFirstLetter(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function formatSatus(status) {
      var index;
      var aux;
      var status;

      if ((index = status.indexOf("AUX")) >= 0) {
        aux = status.substr(index, 4);
        status = status.charAt(0).toUpperCase() + status.substr(1).toLowerCase();
        if ((name = _displayNames[aux]) != undefined) {
          status = status.substr(0, index) + name + status.substr(index + 4);
        }
      } else if ((index = status.indexOf("ERROR")) >= 0) {
        status = status;
      } else {
        status = status.charAt(0).toUpperCase() + status.substr(1).toLowerCase();
      } 
      return status;
    }


    function setTileOn(id, status) {
  //console.log("setTileOn "+id+ " "+status);
      var tile;
      var text;
      if ((tile = document.getElementById(id)) == null) {
        //console.log("Error unknown ID '"+id+"' can't set to '"+status+"'");
        return;
      }
      // Display is a special status to "brighten up" sensor values. 
      if (status != "on" && status != "off" && status != "enabled" && status != "flash" 
                         && status != "rangecritical" && status != "rangewarning" && status != "rangeoptimal") {
        if (status == "unknown") {
          status = "off"; // Just set it off for the moment
        } else {
          console.log("Error unknown status '" + status + "' for '" + id + "'");
          return;
        }
      }
      tile.setAttribute('status', status);
      if (status != 'off') {
        if (status == 'flash') {
          tile.classList.add("flash");
          tile.classList.remove("on");
          text = "Delay";
          //const tile_icon = document.getElementById(id + "_tile_icon_value");
          //if (tile_icon) {tile_icon.classList.add("flash-icon");}
        } else {
          tile.classList.add("on");
          tile.classList.remove("flash");
          text = "On";
          //const tile_icon = document.getElementById(id + "_tile_icon_value");
          //if (tile_icon) {tile_icon.classList.remove("flash-icon");}
        }
        try{
          if (tile.getAttribute('type').startsWith("switch") || tile.getAttribute('type').startsWith("light")) {
            var el = document.getElementById(id + '_tile_icon_value');
            if (el) { // standard SVG icon
              el.classList.add('switch-on');
              el.classList.remove('switch-off');
              el.style.backgroundImage = _switchOnUri;
            } else { // URL Icon
              var offimg;
              var onimg;
              if ((offimg = document.getElementById(id + '_icon')) != null &&
                  (onimg = document.getElementById(id + '_icon_on')) != null) {
                offimg.style.display = 'none';
                onimg.style.display = 'table';
              }
            }
          }
        } catch (e){console.log(e)}
          /*
        */
        var type;
        if ((type = tile.getAttribute('type')) != null) {
          if (type == 'setpoint_swg') {
            var exstatus = parseInt(tile.getAttribute('fullstatus'))
            // Could also ignore "Enabled" in below, that way we don't jump different stats on startup
            if (exstatus > 0 && exstatus < 255) {// Not off or on
              //text = swgFullstatus2String(exstatus);
              text = _config.swg_status[exstatus];
              if (typeof text == 'undefined') {
                text = _swgALLStatus[exstatus];
              }
            } else if (tile.getAttribute('Boost') == 'on')
              text = "Boost";
            else if (status == 'enabled')
              text = 'Enabled';
            else
              text = 'Generating';
          }
          else if (type == 'setpoint_thermo') {
            //if (status == 'enabled')
              text = 'Heat to ' + tile.getAttribute('setpoint');
            //else
            //  text = 'Heating to ' + tile.getAttribute('setpoint'); // too large for phone
          }
          else if (type == 'setpoint_chiller') {
            try{
              let mode = tile?.getAttribute("mode");
              text = capitalizeFirstLetter(mode) + ' to ' + tile.getAttribute(mode+'-setpoint');
              //text = capitalizeFirstLetter(tile.getAttribute("mode"))+' to ' + tile.getAttribute('setpoint');
            } catch (except){}
            //text = 'Cool to ' + tile.getAttribute('setpoint');
          }
          else if (type == 'setpoint_freeze') {
            text = 'Turn on ' + tile.getAttribute('setpoint') + "&deg;";
          //else
          //  text = "On";
          }
        }
        //document.getElementById(id + '_status').innerHTML = "On";
      } else {
        tile.classList.remove("on");
        tile.classList.remove("flash");
        /*
        */
        try {
          if (tile.getAttribute('type').startsWith("switch") || tile.getAttribute('type').startsWith("light")) {
            var el = document.getElementById(id + '_tile_icon_value');
            if (el) { // standard SVG icon
              el.classList.add('switch-off');
              el.classList.remove('switch-on');
              el.style.backgroundImage = _switchOffUri;
            } else { // URL Icon
              var offimg;
              var onimg;
              if ((offimg = document.getElementById(id + '_icon')) != null &&
                  (onimg = document.getElementById(id + '_icon_on')) != null) {
                onimg.style.display = 'none';
                offimg.style.display = 'table';
              }
            }
          }
        } catch (e){}
        text = "Off";
      }

      type = tile.getAttribute('type');
     /* 
      try {
        if (type != "value" && type != "temperature") {
          //console.log("Set Text "+id+" "+" - "+type+" "+text);
          document.getElementById(id + '_status').innerHTML = text;
          // Clear line 2 status if we have it.
          document.getElementById(id + '_status_line2').innerHTML = "";
        } else if ( status == "off" && (type == "value" || type == "temperature") ) {
          document.getElementById(id + '_status').innerHTML = "";
          document.getElementById(id + '_status_line2').innerHTML = "";
        }
      } catch (e) {console.log(e)}
      */
     
     if (type != "value" && type != "temperature") {
        setElementHTML(id + '_status', text);
        setElementHTML(id + '_status_line2', "");
      } else if ( status == "off" && (type == "value" || type == "temperature") ) {
        setElementHTML(id + '_status', "");
        setElementHTML(id + '_status_line2', "");
      }

      if (status != null) {
        if (status == 'enabled' || status == 'flash') {
          setTileIconClassList(id, "enabled");
        } else if (status == 'off') {
          setTileIconClassList(id, "disabled");
        } else if (status == 'on' && type == 'setpoint_thermo') {
          setTileIconClassList(id, "heat");
        } else if (status == 'on' && type == 'setpoint_chiller') {
          var tile_icon = document.getElementById(id + '_tile_icon_value');
          if ( tile_icon.parentElement.parentElement.getAttribute("mode") == "heat" ) {
            setTileIconClassList(id, "heat");
          } else {
            setTileIconClassList(id, "cool");
          }
        } else if (status == 'on') {
          if (type == 'value') {
            setTileIconClassList(id, "rangeoptimal");
          }else{
            setTileIconClassList(id, "cool");
          }
        } else if (status == 'rangecritical') {
          setTileIconClassList(id, "rangecritical");
        } else if (status == 'rangewarning') {
          setTileIconClassList(id, "rangewarning");
        }
      }
/*
      var tile_icon = document.getElementById(id + '_tile_icon_value');
      
      if (status != null && tile_icon != null) {
        if (status == 'enabled' || status == 'flash') {
          tile_icon.classList.add("enabled");
          tile_icon.classList.remove("disabled");
          tile_icon.classList.remove("cool");
          tile_icon.classList.remove("heat");
        } else if (status == 'off') {
          tile_icon.classList.remove("enabled");
          tile_icon.classList.add("disabled");
          tile_icon.classList.remove("cool");
          tile_icon.classList.remove("heat");
          tile_icon.classList.remove("outofrange");
          tile_icon.classList.remove("attention");
        //} else if (status == 'on' && type != 'setpoint_swg' && type != 'setpoint_freeze' && type != 'temperature' && type != 'value') {
        } else if (status == 'on' && type == 'setpoint_thermo') {
          tile_icon.classList.remove("enabled");
          tile_icon.classList.remove("disabled");
          tile_icon.classList.remove("cool");
          tile_icon.classList.add("heat");
        } else if (status == 'on' && type == 'setpoint_chiller') {
          tile_icon.classList.remove("enabled");
          tile_icon.classList.remove("disabled");
          //console.log("mode="+tile_icon.parentElement.parentElement.getAttribute("mode"));
          if ( tile_icon.parentElement.parentElement.getAttribute("mode") == "heat" ) {
            tile_icon.classList.remove("cool");
            tile_icon.classList.add("heat");
          } else {
            tile_icon.classList.remove("heat");
            tile_icon.classList.add("cool");
          }
        } else if (status == 'on') {
          tile_icon.classList.remove("enabled");
          tile_icon.classList.remove("disabled");
          tile_icon.classList.remove("attention");
          tile_icon.classList.add("cool");
          tile_icon.classList.remove("heat");
          tile_icon.classList.remove("outofrange");
        } else if (status == 'outofrange') {
          tile_icon.classList.remove("enabled");
          tile_icon.classList.remove("disabled");
          tile_icon.classList.remove("attention");
          tile_icon.classList.add("outofrange");
          tile_icon.classList.remove("cool");
        } else if (status == 'attention') {
          tile_icon.classList.remove("enabled");
          tile_icon.classList.remove("disabled");
          tile_icon.classList.remove("outofrange");
          tile_icon.classList.add("attention");
          tile_icon.classList.remove("cool");
        }
      }
  */
    }

    function setTileIconClassList(id, ...classes) {
      const tile_icon_classes = [
        "enabled",
        //"flash",
        //"flash-icon",
        "disabled",
        "cool",
        "heat",
        "rangeoptimal",
        "rangewarning",
        "rangecritical"
      ];

      const tile_icon = document.getElementById(id + "_tile_icon_value");
      if (!tile_icon) return; // exit early if element not found

      const allowed = new Set(classes.filter(Boolean)); // keep only non-null/undefined

      // If type is a switch, remove the class disabled as we don;t want the round background icon
      
      if (_DisableOffIconCircle) {
       try{
        if (document.getElementById(id).getAttribute('type').startsWith("switch") || document.getElementById(id).getAttribute('type').startsWith("light")) {
          allowed.delete("disabled");
        }
       } catch (e){console.log(e)}
      }
      
      for (const cls of tile_icon_classes) {
        if (allowed.has(cls)) {
          tile_icon.classList.add(cls);
        } else {
          tile_icon.classList.remove(cls);
        }
      }
    }

    function toHoursAndMinutes(totalMinutes) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${padToTwoDigits(hours)}:${padToTwoDigits(minutes)}`;
    }

/**
 * Formats seconds into a human-readable string.
 * Returns HH:MM if duration is 1 minute or more.
 * Returns MM:SS if duration is less than 1 minute.
 */
function formatDuration(totalSeconds) {
if (totalSeconds < 0) totalSeconds = 0;

  // If we are at 1 minute or more, round to the nearest minute
  // (e.g., 1:30 becomes 2:00, 1:29 stays 1:00)
  if (totalSeconds >= 60) {
    const roundedSeconds = Math.round(totalSeconds / 60) * 60;
    const h = Math.floor(roundedSeconds / 3600);
    const m = Math.floor((roundedSeconds % 3600) / 60);
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  } 

  // If under 60 seconds, show actual seconds
  const s = Math.floor(totalSeconds % 60);
  return `00:${s.toString().padStart(2, '0')}s`;
}


    function padToTwoDigits(num) {
      return num.toString().padStart(2, "0");
    }

    function caseInsensitiveIndexOf(array, searchString) {
      const lowerCaseArray = array.map(element => String(element).toLowerCase());
      return lowerCaseArray.indexOf(searchString.toLowerCase());
    }

    function createTile(object) {
      //console.log("Create tile "+object.id);
      if (object.name == 'NONE') {
        //console.log("Create tile <exclude name> "+object);
        return;
      }
      //if (typeof devices !== 'undefined' && devices.indexOf(object.id) < 0) {
      //if (typeof _devices !== 'undefined' && caseInsensitiveIndexOf(_devices, object.id) < 0) {
      if (_devices.length > 0 && caseInsensitiveIndexOf(_devices, object.id) < 0 && ( !object?.display || object.display == "false")) {
        //console.log("Create tile <exclude list> "+object);
        //console.log(object);
        return;
      }
      //if (object.type == 'switch' || object.type == 'switch_program') {
      if (object.type == 'switch') {
        var img = object.id.replace('/', '_');
        var ext_type;
        if (typeof object.type_ext !== 'undefined')
          ext_type = object.type_ext;
        else
          ext_type = object.type;

        if ( _config?.devices && _config?.devices[object.id] && _config?.devices[object.id]?.on_icon && _config?.devices[object.id]?.off_icon) {
          add_tile(object.id, object.name, object.state, 'switch', ext_type, _config?.devices[object.id]?.off_icon, _config?.devices[object.id]?.on_icon);
        } else {
          add_tile(object.id, object.name, object.state, 'switch', ext_type);
        }
        setTileOn(object.id, object.status, null);
        if (typeof object.type_ext !== 'undefined' && (object.type_ext == 'switch_program' || object.type_ext == 'light_dimmer')) {
          if (typeof object.Light_Type !== 'undefined') {
            document.getElementById(object.id).setAttribute('lighttype', object.Light_Type);
            if (typeof object.Light_Program !== 'undefined') {
              var light_mode = parseInt(object.Light_Program);
              if ( object.Light_Type != "11" && object.type_ext != 'light_dimmer' ) {
                document.getElementById(object.id).setAttribute('spvalue', light_mode-1);
              } else if (object.Light_Type == "11") {
                document.getElementById(object.id).setAttribute('spvalue', light_mode);
              }
            } else {
              //console.log("Light_Program "+object.id+" object.Light_Program is null");           
            }
          }
          // Other switch_program types (other than light_type) GO HERE 
        } else if (typeof object.type_ext !== 'undefined' && object.type_ext == 'switch_timer') {
          if (typeof object.timer_active !== 'undefined' && object.timer_active) {
            //console.log("Timer for "+object.name+" = "+object.timer_active);
            if (object.timer_active == 'on') {
              if (typeof object.timer_duration !== 'undefined') {
                setTileOnText(object.id, 'On (timer '+toHoursAndMinutes(object.timer_duration)+')');
              } else {
                setTileOnText(object.id, 'On (timer)');
              }
            }
          }
        } else if (typeof object.type_ext !== 'undefined' && object.type_ext == 'switch_vsp') {
          if (typeof object.Pump_RPM !== 'undefined' && object.Pump_RPM &&
              typeof object.Pump_Status !== 'undefined' && object.Pump_Status ) {
            updatePumpTile(object.id, object.Pump_Status, object.Pump_Type, object.Pump_RPM, object.Pump_GPM, object.Pump_Watts);
          }
          if (typeof object.Pump_Type !== 'undefined') {
            document.getElementById(object.id).setAttribute('pumptype', object.Pump_Type);
          }
        }
      } else if (object.type == 'value' || object.type == 'temperature') {
        add_tile(object.id, object.name, object.state, 'value', object.type);

        if (object.uom !== undefined) {
          setTileUOM(object.id, object.uom);
        }
        setTileValue(object.id, object.value);
      } else if (object.type == 'setpoint_thermo' || object.type == 'setpoint_swg' || object.type == 'setpoint_freeze' || object.type == 'setpoint_chiller') {
        add_tile(object.id, object.name, object.state, 'thermostat', object.type);
        document.getElementById(object.id).setAttribute('setpoint', object.spvalue);
        setTileValue(object.id, object.value);
        setTileOn(object.id, object.status);
      } else {
        //console.log("Unknown Device");   
      }

      // Set Alternate name
      
      if (object.alt_label !== undefined) {
        //console.log("Set "+object.id+" label "+object.name+" alt_label "+object.alt_label);
        document.getElementById(object.id).setAttribute('alt_label', object.alt_label);
        document.getElementById(object.id).setAttribute('label', object.name);
        //document.getElementById(object.id).setAttribute('id', object.id + '_status_line2');
      }
      
    }

    function showTileOptions(show, id, contex) {
      //console.log("showTileOptions:"+show+" id :"+id);
      var active_option;
      if (show == true) {
        var wrapH = document.getElementById('wrapper').clientHeight + 'px';
        if (id != null && (document.getElementById(id).getAttribute('type') == 'setpoint_thermo' ||
                           document.getElementById(id).getAttribute('type') == 'setpoint_chiller')) {
          active_option = document.getElementById('thermostat_options');
          document.getElementById('swg_options').style.display = 'none';
          document.getElementById('pswitch_options').style.display = 'none';
          document.getElementById('vspswitch_options').style.display = 'none';
          document.getElementById('timer_options').style.display = 'none';
          document.getElementById('scheduler_options').style.display = 'none';
          document.getElementById('dimmerlight_options').style.display = 'none';
          //document.getElementById('simulator_iframe').style.display = 'none';
        } else if (id != null && document.getElementById(id).getAttribute('type') == 'switch_program') {
          active_option = document.getElementById('pswitch_options');
          document.getElementById('thermostat_options').style.display = 'none';
          document.getElementById('swg_options').style.display = 'none';
          document.getElementById('vspswitch_options').style.display = 'none';
          document.getElementById('timer_options').style.display = 'none';
          document.getElementById('scheduler_options').style.display = 'none';
          document.getElementById('dimmerlight_options').style.display = 'none';
          //document.getElementById('simulator_iframe').style.display = 'none';
        } else if (id != null && document.getElementById(id).getAttribute('type') == 'light_dimmer') {
          active_option = document.getElementById('dimmerlight_options');
          document.getElementById('thermostat_options').style.display = 'none';
          document.getElementById('swg_options').style.display = 'none';
          document.getElementById('vspswitch_options').style.display = 'none';
          document.getElementById('timer_options').style.display = 'none';
          document.getElementById('scheduler_options').style.display = 'none';
          document.getElementById('dimmerlight_options').style.display = 'none';
          //document.getElementById('simulator_iframe').style.display = 'none';
        } else if (id != null && document.getElementById(id).getAttribute('type') == 'setpoint_swg') {
          active_option = document.getElementById('swg_options');
          document.getElementById('thermostat_options').style.display = 'none';
          document.getElementById('pswitch_options').style.display = 'none';
          document.getElementById('vspswitch_options').style.display = 'none';
          document.getElementById('timer_options').style.display = 'none';
          document.getElementById('scheduler_options').style.display = 'none';
          document.getElementById('dimmerlight_options').style.display = 'none';
          //document.getElementById('simulator_iframe').style.display = 'none';
        } else if (id != null && document.getElementById(id).getAttribute('type') == 'setpoint_freeze') {
          active_option = document.getElementById('swg_options');
          document.getElementById('thermostat_options').style.display = 'none';
          document.getElementById('pswitch_options').style.display = 'none';
          document.getElementById('vspswitch_options').style.display = 'none';
          document.getElementById('timer_options').style.display = 'none';
          document.getElementById('scheduler_options').style.display = 'none';
          document.getElementById('dimmerlight_options').style.display = 'none';
          //document.getElementById('simulator_iframe').style.display = 'none';
        } else if (id != null && document.getElementById(id).getAttribute('type') == 'switch_vsp') {
          active_option = document.getElementById('vspswitch_options');
          document.getElementById('thermostat_options').style.display = 'none';
          document.getElementById('pswitch_options').style.display = 'none';
          document.getElementById('swg_options').style.display = 'none';
          document.getElementById('timer_options').style.display = 'none';
          document.getElementById('scheduler_options').style.display = 'none';
          document.getElementById('dimmerlight_options').style.display = 'none';
          //document.getElementById('simulator_iframe').style.display = 'none';
        } else if (id != null && document.getElementById(id).getAttribute('type') == 'switch_timer') {
          active_option = document.getElementById('timer_options');
          document.getElementById('thermostat_options').style.display = 'none';
          document.getElementById('pswitch_options').style.display = 'none';
          document.getElementById('swg_options').style.display = 'none';
          document.getElementById('vspswitch_options').style.display = 'none';
          document.getElementById('scheduler_options').style.display = 'none';
          document.getElementById('dimmerlight_options').style.display = 'none';
          //document.getElementById('simulator_iframe').style.display = 'none';
        } else if (id != null && document.getElementById(id).getAttribute('type') == 'scheduler') {
          active_option = document.getElementById('scheduler_options');
          document.getElementById('thermostat_options').style.display = 'none';
          document.getElementById('pswitch_options').style.display = 'none';
          document.getElementById('swg_options').style.display = 'none';
          document.getElementById('vspswitch_options').style.display = 'none';
          document.getElementById('timer_options').style.display = 'none';
          document.getElementById('dimmerlight_options').style.display = 'none';
          //document.getElementById('simulator_iframe').style.display = 'none';
        } /*else if (id != null && document.getElementById(id).getAttribute('type') == 'simulator') {
          active_option = document.getElementById('simulator_iframe');
          document.getElementById('thermostat_options').style.display = 'none';
          document.getElementById('pswitch_options').style.display = 'none';
          document.getElementById('swg_options').style.display = 'none';
          document.getElementById('vspswitch_options').style.display = 'none';
          document.getElementById('timer_options').style.display = 'none';
          document.getElementById('scheduler_options').style.display = 'none';
        }*/

        if (active_option.style.display === undefined) {
          console.log("ERROR showTileOptions( "+show+", "+id+", "+contex+" )" );
        } else {
          active_option.style.display = 'flex';
        }
        /*
        Not sure why I added this, but it breakes scheduler pane growing, and setpoint (heater) panes
        are located too high for some reason.
        var optionH = window.getComputedStyle(active_option, null).getPropertyValue("height");
        if (optionH <= wrapH)
          active_option.style.height = wrapH;
        */
        //console.log("Option:"+optionH+" wrapH:"+wrapH);

        document.getElementById('wrapper').classList.add("opaque");
      } else {
        // Fake onclick to close and save any values if open
        if (contex == null) {
          if (document.getElementById('thermostat_options').style.display == 'flex')
            document.getElementById("options_close").click();
          else if (document.getElementById('swg_options').style.display == 'flex')
            document.getElementById("swg_options_close").click();
          else if (document.getElementById('pswitch_options').style.display == 'flex')
            document.getElementById("pswitch_options_close").click();
          else if (document.getElementById('vspswitch_options').style.display == 'flex')
            document.getElementById("vspswitch_options").click();
          else if (document.getElementById('timer_options').style.display == 'flex')
            document.getElementById("timer_options").click();
          else if (document.getElementById('scheduler_options').style.display == 'flex')
            document.getElementById("scheduler_options").click();
          else if (document.getElementById('dimmerlight_options').style.display == 'flex')
            document.getElementById("dimmerlight_options").click();
        }
        document.getElementById('thermostat_options').style.display = 'none';
        document.getElementById('swg_options').style.display = 'none';
        document.getElementById('pswitch_options').style.display = 'none';
        document.getElementById('vspswitch_options').style.display = 'none';
        document.getElementById('timer_options').style.display = 'none';
        document.getElementById('scheduler_options').style.display = 'none';
        document.getElementById('dimmerlight_options').style.display = 'none';
        //document.getElementById('simulator_iframe').style.display = 'none';
        document.getElementById('wrapper').classList.remove("opaque");
        return;
      }
      if (show == true) {
        var tile = document.getElementById(id);
        var sp_value = tile.getAttribute('setpoint');
        //tile_state = tile.classList.contains("on");
        var tile_state = !(tile.getAttribute('status') == 'off');
        var type = tile.getAttribute('type');
        var slider;
        var slider_output;
        var tm_slider;
        var tm_slider_output;
        var title;
        var close_button;
        var ext;
        var tm_ext;
        var oswitch;
        var vsp_slider_changed = false;
        var dimmer_slider_changed = false;
        if (type == 'setpoint_swg') {
          slider = document.getElementById("swg_option_slider_range");
          slider_output = document.getElementById("swg_option_slider_text_value");
          title = document.getElementById("swg_option_title");
          close_button = document.getElementById("swg_options_close");
          ext = "%";
        } else if (type == 'setpoint_freeze') {
          slider = document.getElementById("swg_option_slider_range");
          slider_output = document.getElementById("swg_option_slider_text_value");
          title = document.getElementById("swg_option_title");
          close_button = document.getElementById("swg_options_close");
          ext = '&deg;' + _temperature_units;
        } else if (type == 'switch_program') {
          //var current_mode = "";
          //try { current_mode = document.getElementById(id + '_status').innerHTML } catch(exception) {}
          populateLightProgram(tile.getAttribute('lighttype'),getTileOnText(id));
          title = document.getElementById("pswitch_option_title");
          close_button = document.getElementById("pswitch_options_close");
          tm_slider = document.getElementById("ps_timer_slider_range");
          tm_slider_output = document.getElementById("ps_timer_slider_text_value");
        } else if (type == 'switch_vsp') {
          slider = document.getElementById("vspoption_slider_range");
          slider_output = document.getElementById("vspoption_slider_text_value");
          tm_slider = document.getElementById("vsp_timer_slider_range");
          tm_slider_output = document.getElementById("vsp_timer_slider_text_value");
          title = document.getElementById("vspswitch_option_title");
          close_button = document.getElementById("vspswitch_option_close");
        } else if (type == 'switch_timer') {
          tm_slider = document.getElementById("timer_slider_range");
          tm_slider_output = document.getElementById("timer_slider_text_value");
          title = document.getElementById("timer_option_title");
          close_button = document.getElementById("timer_options_close");
          //tm_ext = ' runtime (min)';
        } else if (type == 'scheduler') {
          title = document.getElementById("scheduler_options_title");
          close_button = document.getElementById("scheduler_options_close");
        //} else if (type == 'simulator') {
        //  close_button = document.getElementById("simulator_iframe_close");
        } else if (type == 'light_dimmer') {
          slider = document.getElementById("dimmeroption_slider_range");
          slider_output = document.getElementById("dimmeroption_slider_text_value");
          tm_slider = document.getElementById("dimmer_timer_slider_range");
          tm_slider_output = document.getElementById("dimmer_timer_slider_text_value");
          title = document.getElementById("dimmerswitch_option_title");
          close_button = document.getElementById("dimmerswitch_option_close");
          ext = "%";
        } else {
          slider = document.getElementById("option_slider_range");
          slider_output = document.getElementById("option_slider_text_value");
          tm_slider = document.getElementById("th_timer_slider_range");
          tm_slider_output = document.getElementById("th_timer_slider_text_value");
          title = document.getElementById("option_title");
          close_button = document.getElementById("options_close");
          ext = '&deg;' + _temperature_units;
        }

        if (type == 'setpoint_swg') {
          slider.min = 0;
          slider.max = 101;
          slider.step = 5;
        } else if (type == 'setpoint_freeze') {
          if (_temperature_units != 'c') { // Change to DegF
            slider.min = 34;
            slider.max = 42;
            slider.step = 1;
          } else { // Change to DegF
            slider.min = 1;
            slider.max = 5;
            slider.step = 1;
          }
        } else if (type == 'setpoint_thermo' || type == 'setpoint_chiller') {
          if (_temperature_units != 'c') { // Change to DegF
            //slider.min = 36;
            //slider.max = 104;
            //slider.min = ((typeof heater_slider_min !== 'undefined')?heater_slider_min:36);
            //slider.max = ((typeof heater_slider_max !== 'undefined')?heater_slider_max:104);
            slider.min = ((_config?.slider_range?.heater_slider_min)?_config.slider_range.heater_slider_min:0);
            slider.max = ((_config?.slider_range?.heater_slider_max)?_config.slider_range.heater_slider_max:104);
            slider.step = 1;
          } else { // Change to DegF
            slider.min = 0;
            slider.max = 40;
            slider.step = 1;
          }
        } else if (type == 'switch_vsp') {
          if ( tile.getAttribute('pumptype') == "vfPump" ) { // RPM vs GPM
            slider.min = 15;
            slider.max = 130;
            slider.step = 5;
            ext = ' GPM';
          } else { 
            slider.min = 600;
            slider.max = 3450;
            slider.step = 5;
            ext = ' RPM';
          }
        } else if (type == 'light_dimmer') {
          slider.min = 0;
          slider.max = 100;
          slider.step = 1;
          ext = ' %';
        }
        
        if (type == 'scheduler') {
          title.innerHTML = "Scheduler";
        } else if (type == 'simulator') {
        //  title.innerHTML = "Simulator";
        } else {
          //console.log("Set "+id+" to "+document.getElementById(id + '_name').innerHTML);
          title.innerHTML = document.getElementById(id + '_name').innerHTML;
        }

        if (type == 'switch_program') {
          var pswitch = document.getElementById("pswitch_option_list");
          oswitch = document.getElementById("pswitch_option_switch");
          var oswitch_output = document.getElementById("pswitch_option_switch_text_value");
          oswitch.checked = tile_state;
          oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
          oswitch.onclick = function() {
            oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
          }
        } else if (type == 'setpoint_swg') {
          slider.value = sp_value;
          oswitch = document.getElementById("swg_option_switch");
          var oswitch_output = document.getElementById("swg_option_switch_text_value");
          document.getElementById("swg_option_switch_row").style.display = "table-row";
          oswitch.checked = getTileAttribute(id, "Boost")=='on'?true:false ;
          slider_output.innerHTML = slider.value + ext;
          oswitch_output.innerHTML = ((oswitch.checked) ? "Boost On" : "Boost Off");
          slider.oninput = function() {
            slider_output.innerHTML = this.value + ext;
          }
          oswitch.onclick = function() {
            oswitch_output.innerHTML = ((oswitch.checked) ? "Boost On" : "Boost Off");
          }
        } else if (type == 'setpoint_freeze') {
          slider.value = sp_value;
          oswitch = document.getElementById("swg_option_switch");
          document.getElementById("swg_option_switch_row").style.display = "none";
          slider_output.innerHTML = slider.value + ext;
          slider.oninput = function() {
            slider_output.innerHTML = this.value + ext;
          }
        } else if (type == 'switch_vsp') {
          slider.value = sp_value;
          oswitch = document.getElementById("vspoption_switch");
          oswitch.checked = tile_state;
          var oswitch_output = document.getElementById("vspoption_switch_text_value");
          slider_output.innerHTML = slider.value + ext;
          oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
          
          slider.oninput = function() {
            slider_output.innerHTML = this.value + ext;
            vsp_slider_changed = true;
            if (oswitch.checked != true) {
              oswitch.checked = true;
              oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
            }
          }
          oswitch.onclick = function() {
            oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
          }
        } else if (type == 'light_dimmer') {
          slider.value = sp_value;
          oswitch = document.getElementById("dimmeroption_switch");
          oswitch.checked = tile_state;
          var oswitch_output = document.getElementById("dimmeroption_switch_text_value");
          slider_output.innerHTML = slider.value + ext;
          oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
          slider.oninput = function() {
            dimmer_slider_changed = true;
            slider_output.innerHTML = this.value + ext;
            if (this.value <= 0 && oswitch.checked == true) {
              oswitch.checked = false;
              oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
            } else if (oswitch.checked != true) {
              oswitch.checked = true;
              oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
            }
          }
        } else if (type == 'switch_timer') {
          oswitch = document.getElementById("timer_switch");
          oswitch.checked = tile_state;
          var oswitch_output = document.getElementById("timer_switch_text_value");
          oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
          // All timer slider options are set below for everyone.
        } else if (type == 'scheduler') {
          // NSF BUILD SCHEDULER DEFAULTS HERE
          cs_clearSchedules();
          setElementHTML("crontext", "");
          setElementHTML("cronhelp", "");
          //cs_loadJSON("/api/schedules", cs_schedules,'jsonp');
          get_schedules();
        } else if (type == 'simulator') {
          startSimulator();
        } else if (type == 'setpoint_chiller') {
          let table = document.getElementById("thermostat_table");
          let mode = tile?.getAttribute("mode");
          slider.value = tile.getAttribute(mode+'-setpoint');
          oswitch = document.getElementById("option_switch");
          if (mode == "heat") {
            pre = "Heat to ";
          } else {
            pre = "Cool to ";
          }
          oswitch.checked = tile_state;
          var oswitch_output = document.getElementById("option_switch_text_value");
          oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
          slider_output.innerHTML = pre + slider.value + ext;
          slider.oninput = function() {
            slider_output.innerHTML = pre + this.value + ext;
            //sp_value = this.value
          }
          oswitch.onclick = function() {
            oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
            //setTileOn(id, ((oswitch.checked)?"on":"off"), null);
          }
        } else {
          slider.value = sp_value;
          oswitch = document.getElementById("option_switch");
          oswitch.checked = tile_state;
          var oswitch_output = document.getElementById("option_switch_text_value");
          slider_output.innerHTML = slider.value + ext;
          oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
          slider.oninput = function() {
            slider_output.innerHTML = this.value + ext;
            //sp_value = this.value
          }
          oswitch.onclick = function() {
            oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
            //setTileOn(id, ((oswitch.checked)?"on":"off"), null);
          }
        }

        if (typeof tm_slider !== 'undefined' && tm_slider != null) {
          //tm_slider.min = ((typeof timer_slider_min !== 'undefined')?timer_slider_min:0);
          //tm_slider.max = ((typeof timer_slider_max !== 'undefined')?timer_slider_max:120);
          //tm_slider.step = ((typeof timer_slider_step !== 'undefined')?timer_slider_step:10);

          tm_slider.min = ((_config?.slider_range?.timer_slider_min)?_config.slider_range.timer_slider_min:0);
          tm_slider.max = ((_config?.slider_range?.timer_slider_max)?_config.slider_range.timer_slider_max:360);
          tm_slider.step = ((_config?.slider_range?.timer_slider_step)?_config.slider_range.timer_slider_step:10);

          tm_ext = ' runtime (min)';

          tm_slider.value = tm_slider.min;
          tm_slider_output.innerHTML = tm_slider.value + tm_ext;
          tm_slider.oninput = function() {
            tm_slider_output.innerHTML = this.value + tm_ext;
            if (this.value == 0) {
              oswitch.checked = false;
              oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
            } else {
              oswitch.checked = true;
              oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
            }
          }
          oswitch.onclick = function() {
            oswitch_output.innerHTML = ((oswitch.checked) ? "On" : "Off");
            if (oswitch.checked == false) {
              tm_slider.value = 0;
              tm_slider_output.innerHTML = "0" + tm_ext;
            }
          }
        }

        var cTime;
        try {
          cTime = performance.now();
        } catch (e) {
          cTime = Date.now(); // NSF Probably won't test well below, need to check.
        }
        var clickHandler = function(e) {
          // Short time diff means event was the one that launched the options pane, so ignore
          // Above description is incorrect, we get here when click is OFF the tile
          if ((e.timeStamp - cTime) > 1000) {
            showTileOptions(false);
            document.getElementById("body_wrap").removeEventListener("click", clickHandler);
          }
        };
        document.getElementById("body_wrap").addEventListener("click", clickHandler);
        close_button.onclick = function() {
          //console.log("close_button clicked");
          document.getElementById("body_wrap").removeEventListener("click", clickHandler);
          var state = oswitch?.checked;
          if (type == 'switch_program') {
            var mode=false;

            if (_lightProgramDropdown) {
              //console.log("check "+(getTileSPvalue(id)+1) +" against "+pswitch.selectedIndex);
              if (pswitch.selectedIndex > 0 && (getTileSPvalue(id)+1) != pswitch.selectedIndex) {
                send_light_mode(pswitch.selectedIndex, id, pswitch.options[pswitch.selectedIndex].text);
                mode=true;
              }
            } else {
              var radio = document.getElementsByName("light_program");
              var x;
              for (x = 0; x < radio.length; x++) {
                 if (radio[x].checked == true) {
                   //console.log("Light Current= "+(getTileSPvalue(id)+1)+" - "+getTileOnText(id)+"  Selected="+radio[x].value+" - "+document.getElementById('pswitch_option_switch_text_value').innerHTML);
                   //console.log("check "+(getTileSPvalue(id)+1) +" against "+radio[x].value);
                   if (getTileSPvalue(id)+1 != radio[x].value) {
                     send_light_mode(radio[x].value, id, document.getElementById('pswitch_option_switch_text_value').innerHTML);
                   }
                   mode=true;
                   break;
                 }
              }
            }
            if (mode == false) {
             // if (state == (tile.getAttribute('status') == 'off')) // Only bother with this if we didn;t set the light mode.
                setTileState(id, state);
            }
          } else if (type == 'light_dimmer') {
            //console.log("DIMMER "+state+" - "+tile.getAttribute('status'));
            var value = slider.value;
            if (state == false) { //Turn off
              //console.log("State off");
              setTileState(id, state);
            } else if (sp_value != slider.value && dimmer_slider_changed == true) {
              //console.log("SLIDER CHANGED");
              setThermostatSetpoint(id, slider.value);
            } else {
              //console.log("State on/off");
              setTileState(id, state);
            }
            /*
            if (state == (tile.getAttribute('status') == 'off')) {
              console.log("ON/OFF "+state+" = "+(tile.getAttribute('status') == 'off'));
              setTileState(id, state);
            } else if (sp_value != slider.value && dimmer_slider_changed == true) {
              console.log("SLIDER CHANGED");
              setThermostatSetpoint(id, slider.value);
            }*/
          } else if (type == 'setpoint_swg') {
            //console.log ("Boost attribute = "+tile.getAttribute('boost'));
            //console.log ("state = "+state);
            if (state == (tile.getAttribute('Boost') == 'off')) {
              //console.log ("change boost");
              send_command( 'SWG/Boost', (state==true?"1":"0") );
            } else {
              if (sp_value != slider.value && slider.value != 101) // Don't change setpoint if slider is on boost
                setThermostatSetpoint(id, slider.value);
            }
          } else if (type == 'switch_program') {
            var value = slider.value;
            if (state == (tile.getAttribute('status') == 'off'))
              setTileState(id, state);
            if (sp_value != slider.value)
              setThermostatSetpoint(id, slider.value)
          } else if (type == 'switch_timer') {
            if (tm_slider.value == 0 && state == (tile.getAttribute('status') == 'off'))
              setTileState(id, state);
          } else if (type == 'switch_vsp') {
            // VSP, first check is slider changed, as startup we have no ide on RPM
            var value = slider.value;
            if (state == (tile.getAttribute('status') == 'off'))
              setTileState(id, state);
            if (sp_value != slider.value && vsp_slider_changed == true)
              setThermostatSetpoint(id, slider.value)
          } else if (type == 'scheduler') {
            // NSF SAVE SCHEDULE HERE
            // validate input form, alert and return if error, contimue if ok.
            if ( ! cs_createJSON() ) {
              return // This stops pane from closing.
            }
          } else if (type == 'setpoint_freeze') {
            if (sp_value != slider.value)
              setThermostatSetpoint(id, slider.value);
          } else if (type == 'simulator') {
            // Nothing to save, but could add options here in future.
          } else if (type == 'setpoint_chiller') {
            let mode = tile?.getAttribute("mode");
            let cur_value = tile.getAttribute(mode+'-setpoint');
            var value = slider.value;
            if (state == (tile.getAttribute('status') == 'off'))
              setTileState(id, state);
            if (cur_value != slider.value) {
              if (mode == "heat") {
                setThermostatSetpoint("Pool_Heater", slider.value);
              } else {
                setThermostatSetpoint(id, slider.value);
              }
            }
          } else {
            var value = slider.value;
            if (state == (tile.getAttribute('status') == 'off'))
              setTileState(id, state);
            if (sp_value != slider.value)
              setThermostatSetpoint(id, slider.value);
          }

          if (typeof tm_slider !== 'undefined' && tm_slider != null) {
            if (tm_slider.value > 0)
              send_switch_timer(id, tm_slider.value);
          }
          //showTileOptions(false, null, 'this');
          active_option.style.display = 'none';
          document.getElementById('wrapper').classList.remove("opaque");
        }
      }
    }



    var _displayMsgTimer=0;
    var _displayMsgTimeout=0;

    function displayErrorMessagee(message, timeout) {
      document.getElementById("header").classList.add("error");
      displayMessage(message, timeout);
    }

    function setElementHTML(element, html) {
      
      const elmnt = document.getElementById(element);
      if (elmnt) {
        elmnt.innerHTML = html;
        //console.log("Call in "+element+ " "+html);
      } else {
        //console.log("fail in "+element+ " "+html);
      }
    }


    function displayMessage(message, timeoutSeconds) {
      // Check to see if we can display message
      if (_displayMsgTimeout > 0) {
        if ( _displayMsgTimer + (_displayMsgTimeout * 1000) >  Date.now() ) {
          // Can't diaply message, still on timer
          //console.log("Can't display message '"+message+"'");
          return;
        }
        _displayMsgTimer=0;
        _displayMsgTimeout=0;
      }

      // Set the timer if needed
      if (timeoutSeconds !== undefined && timeoutSeconds > 0) {
        _displayMsgTimer = Date.now();
        _displayMsgTimeout = timeoutSeconds;
      }
/*
      if (message.toLowerCase().includes("error")) {
        document.getElementById("header").classList.add("error");
      } 
      else if (document.getElementById("header").classList.contains("error")) {
        document.getElementById("header").classList.remove("error");
      }
*/
      //document.getElementById("message").innerHTML = message;
      setElementHTML("message", message);
    }
    /*********************************************************************
     *  
     *   SCHEDULER FUNCTIONS
     * 
     *********************************************************************/

    // NSF change this import to dynamic config in future.
    //import("./cronstrue.min.js");

    //var CS_ROW_INDEX = 2;
    var CS_ROW_INDEX = 0;
    var V_OFF = 0;
    var V_ON = 1;
    var V_SETPOINT = 3;
    var V_PERCENT = 4;
    var V_RPM = 5;
    var V_GPM = 6;
