    //'use strict';
    
    var _config = {};
    var _dynamicconfig = {};
   
    var _aq_display_tile_size = 'small';

    var _lightProgramDropdown = false;
    var _pressEvent;
    var _ignoreMouseEvent = false;
    var _temperature_units;
    var _aqualink_data;
    var _landscape = false;
    var _displayNames = [];
    var _scheduler_devices_json= [];
    var _tile_line_char_limit = 0;
    var _devices = [];
    var _enable_schedules = false;
    var _theme = "";

    var _switchOnUri;
    var _switchOffUri;
    //var _targetClearErrorMsg = new Date();

    var _DisableOffIconCircle = true;

    const _isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    //console.log(_isDarkMode ? "Dark mode is on" : "Light mode is on");

    async function loadConfig() {
      try {
        // Fetch the configuration file
        const response = await fetch('/config.json', {cache: 'no-store'});
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parse the JSON data
        _config = await response.json();

      } catch (error) {
        console.error("Loading config failed:", error);
        displayErrorMessagee("Error Loading web config!", 5);
        //document.getElementById("header").classList.add("error");
        //_targetClearErrorMsg = new Date(Date.now() + 5000);  // Set 5 sec from now.
      }

      // Set current theme
      if ( _config?.theme === "auto" ) {
        _theme = window.matchMedia("(prefers-color-scheme: dark)").matches?"-dark":"-light";
      } else if ( _config?.theme ) {
        _theme = "-"+_config?.theme;
      } else {
        _theme = "";
      }

      // Check we have correct objects for theme.
      if (_config?.background_image?.["url"+_theme]) {
       // console.log("Found background image - "+_config?.background_image?.["url"+_theme]);
      } else {
        console.log("ERROR: No image background found for theme, json path \"background_image\": {\"url"+_theme+"\":.....}`");
      }

      if (_config?.["colors"+_theme]) {
        //console.log("Found colors - colors"+_theme+"{..}");
      } else {
        if ( _theme !== "" ) {
          // Don't error on blank theme, as we use default colors.
          console.log("ERROR: No colors found for theme '"+_theme+"', json path \"colors"+_theme+"\":{...}`");
        }
      }

      // Set defaults.
   
      if (typeof _config.background_image?.url === 'undefined') {
        _config.background_image = {};
        _config.background_image.url = "hk/background.jpg";
        _config.background_image.url_reload = 0;
      }

      //if (_config?.colors?.tile_on_background) {
      if (_config?.["colors"+_theme]?.tile_on_background) {
         _switchOnUri = createSwitchIcon(_config["colors"+_theme].tile_on_background, false);
      } else {
        _switchOnUri = createSwitchIcon("rgb(255, 255, 255)", false);
      }

      if (_config?.tile_settings?.disable_off_icon_background && ! isConfigEnabled(_config.tile_settings.disable_off_icon_background)) {
        _DisableOffIconCircle = false;
      } else { 
        _DisableOffIconCircle = true;  // This is the default
      }

      if (_DisableOffIconCircle) {
        //if (_config?.colors?.tile_icon_background_color_disabled) {
        if (_config?.["colors"+_theme]?.tile_icon_background_color_disabled) {
          _switchOffUri = createSwitchIcon(_config["colors"+_theme].tile_icon_background_color_disabled, _DisableOffIconCircle);
        } else {
          _switchOffUri = createSwitchIcon("rgb(110, 110, 110)", _DisableOffIconCircle);
        }
      } else {
        //if (_config?.colors?.tile_background) {
        if (_config?.["colors"+_theme]?.tile_background) {
          _switchOffUri = createSwitchIcon(_config["colors"+_theme].tile_background, _DisableOffIconCircle);
        } else {
          _switchOffUri = createSwitchIcon("rgb(220, 220, 220)", _DisableOffIconCircle);
        }
      }

      if (_config?.devices) {
        Object.entries(_config.devices).forEach(([deviceName, deviceObj]) => {
          if ( deviceObj?.display && isConfigEnabled(deviceObj.display)) {
            _devices.push(deviceName);  // Un comment
          } else {
            //console.log(deviceName+" hide");
          }
        });
      }

      if (!_config?.swg_status) {
        _config.swg_status = {
                               "0": "On",
                               "1": "No flow",
                               "2": "Low salt",
                               "4": "High salt",
                               "8": "Clean cell",
                               "9": "Turning off",
                               "16": "High current",
                               "32": "Low volts",
                               "64": "Low temp",
                               "128": "Check PCB",
                               "253": "General Fault",
                               "254": "Unknown",
                               "255": "Off"
                              };
      }

      if (! _config?.tile_thresholds) {
        _config.tile_thresholds = { "SWG/PPM": {
                                      outofrange: {min: 2600, max: 3500},
                                      attention: {min: 2700, max: 3400}
                                    },
                                    "CHEM/pH": {
                                      outofrange: {min: 7, max: 8},
                                      attention: {min: 7.2, max: 7.8}
                                    },
                                    "CHEM/ORP": {
                                      outofrange: {min: 560, max: 900},
                                      attention: {min: 650, max: 850}
                                    }
                                  };
      }

      if (! _config?.tile_settings) {
        _config.tile_settings = {};
      }

      if (! _config?.tile_settings?.turn_off_sensortiles) {
        _config.tile_settings.turn_off_sensortiles = "true";
      }

      if (! _config?.tile_settings?.show_vsp_gpm) {
        _config.tile_settings.show_vsp_gpm = "true";
      }

      // NSF Not used at present
      if (! _config?.tile_settings?.link_spa_and_spa_heater) {
        _config.tile_settings.link_spa_and_spa_heater = "false";
      }

      if (isConfigEnabled(_config?.tile_settings?.light_program_use_dropdown)) {
        _lightProgramDropdown = true;
      }
    }

    function isConfigEnabled(value) {
      if (value === null || typeof value === 'undefined') {
        return false;
      }
      const lowerCaseValue = String(value).toLowerCase();
      if (lowerCaseValue === "true" || lowerCaseValue === "yes") {
        return true;
      }
      return false;
    }

    function createSwitchIcon(color, largeSize) {
      var switchContent;
      if (!largeSize) {
        switchContent = `<svg xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 45 45"
                          stroke="`+color+`" fill="none"
                          stroke-width="5.5" stroke-linecap="round">
                          <line x1="22.05" y1="8" x2="22.05" y2="19" />
                          <path d="M15.3 13.25 A11.25 11.25 0 1 0 28.8 13.25"/>
                        </svg>`;
      } else {
         /* Circle is larger / Line is higher */
        switchContent = `<svg xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 45 45"
                          stroke="`+color+`" fill="none"
                          stroke-width="5.5" stroke-linecap="round">
                          <line x1="22.05" y1="7" x2="22.05" y2="18" />
                          <path d="M15.3 12.75 A11.75 11.75 0 1 0 28.8 12.75"/>
                        </svg>`;
      }
      const encodedswitchContent = encodeURIComponent(switchContent);
      return `url("data:image/svg+xml;charset=utf-8,${encodedswitchContent}")`;
    }

    async function init() {
      await loadConfig();

      setSizeSpecifics();
      populateLightProgram(-1);
      document.getElementById('thermostat_options').classList.remove("hide");
      document.getElementById('swg_options').classList.remove("hide");
      document.getElementById('pswitch_options').classList.remove("hide");
      document.getElementById('vspswitch_options').classList.remove("hide");
      document.getElementById('timer_options').classList.remove("hide");
      document.getElementById('scheduler_options').classList.remove("hide");
      document.getElementById('dimmerlight_options').classList.remove("hide");
      //document.getElementById('simulator_iframe').classList.remove("hide");
      setColors();
      load_background();
      showTileOptions(false);
      startWebsockets();
      resetBackgroundSize();

      // Test for mobile-app mode
      
      if (window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches) {
        //console.log("Running in standalone mode");
        //alert("Standalone");
        // in webapp mode, remove the aqmanager link
        try{
          document.getElementById('td_cog').classList.add("hide");
        } catch (e){}
      } else {
        //console.log("Not running in standalone mode");
        //alert("NOT Standalone");
      }

      

      // For one external script (and backwards compatibility),
      if (_config?.external_script) {
        loadScriptIfAvailable(_config.external_script);
      }

      // For multiple external scripts
      if (Array.isArray(_config?.external_scripts)) {
        _config.external_scripts.forEach(scriptUrl => {
          loadScriptIfAvailable(scriptUrl);
        });
      }
            
      // Test for iframe
      if (window.self !== window.top) {
        //console.log("The code is running inside an iframe.");
        // Change the link under the cog/hamburger icon
        const ele = document.getElementById('cog_link');
        if (ele) {
          ele.setAttribute("href", "/");
          ele.setAttribute("target", "_parent");
        }
      } else {
        //console.log("The code is not running inside an iframe.");
      }

      //console.log("Tile width "+window.getComputedStyle(document.documentElement).getPropertyValue('--tile-width'));
    }

    function populateLightProgram(type=0, current_mode="") {

      var light_program={};
      
      if (type != -1) {
        if ( typeof _dynamicconfig?.light_programs === 'undefined' || typeof _dynamicconfig?.light_programs[type] === 'undefined') {
          console.log("WARNING: blank Ignoring call to populateLightProgram(), type="+type);
          return;
        } else {
          light_program = _dynamicconfig.light_programs[type];
        }
      }
 
      if (_lightProgramDropdown) {
        option = document.getElementById('pswitch_option_list');
        try {
          option.innerHTML = '<option value="0">Light Program</option>';
          fLen = light_program.length;
          for (i = 0; i < fLen; i++) {
            var opt = document.createElement('option');
            opt.value = i + 1;
            if (current_mode != "" && light_program[i].startsWith(current_mode)) {
              opt.selected = true;
            }
            opt.innerHTML = light_program[i];
            option.appendChild(opt);
          }
        } catch (e) {}
      } else {
        var tbody = document.getElementById('pswitch_table').getElementsByTagName('tbody')[0];
        if (type == -1) {
          // -1 is Just init, so create another row, just to delete later.
          row = tbody.insertRow(2);
          row.innerHTML = "<td align='center'>Solid Color</td><td align='center'>Light Show</td>";
          //light_program = _light_program[0]; // Use aqualinkd light modes to set size below
          light_program[0] = "blank";
          light_program[1] = "blank - show";
        }
        var html1 = '';
        var html2 = '';
        var fLen = light_program.length;
        var i;
        var selected = "";
        for (i = 0; i < fLen; i++) {
          selected = "";
          if (current_mode != "" && light_program[i].startsWith(current_mode)) {
            selected = "checked";
          } 
          if (light_program[i].endsWith(" - Show"))
            html2 = html2 + "<div class='option_radiocontainer'><label><span class='radio'><input type='radio' name='light_program' value='" + (i+1) + "' "+selected+" onchange='updatePwsitchOptions(this, "+type+");'><span class='option_radio-value' aria-hidden='true'></span></span>" + light_program[i].substr(0, (light_program[i].length - 7)) + "</label></div>";
          else
            html1 = html1 + "<div class='option_radiocontainer'><label><span class='radio'><input type='radio' name='light_program' value='" + (i+1) + "' "+selected+" onchange='updatePwsitchOptions(this, "+type+");'><span class='option_radio-value' aria-hidden='true'></span></span>" + light_program[i] + "</label></div>";
        }
        var row;
        row = tbody.deleteRow(2);
        row = tbody.insertRow(2);
        if (type == 10) {
          row.innerHTML = "<td align='center'>Dimmer</td><td align='center'></td>";
        } else {
          row.innerHTML = "<td align='center'>Solid Color</td><td align='center'>Light Show</td>";
        }
        tbody.deleteRow(3);
        row = tbody.insertRow(3);
        row.innerHTML = "<td align='left' valign='top'>" + html1 + "</td><td align='left' valign='top'>" + html2 + "</td>";
      }
    }
/*
    function populateLightProgram_old(type=0, current_mode="") {

      console.log("WARNING: Ignoring call to populateLightProgram()");
      return;

      var light_program = _light_program[type];
      
      if (_lightProgramDropdown) {
        option = document.getElementById('pswitch_option_list');
        try {
          fLen = light_program.length;
          for (i = 0; i < fLen; i++) {
            var opt = document.createElement('option');
            opt.value = i + 1;
            opt.innerHTML = light_program[i];
            option.appendChild(opt);
          }
        } catch (e) {}
      } else {
        var tbody = document.getElementById('pswitch_table').getElementsByTagName('tbody')[0];
        if (type == -1) {
          // -1 is Just init, so create another row, just to delete later.
          row = tbody.insertRow(2);
          row.innerHTML = "<td align='center'>Solid Color</td><td align='center'>Light Show</td>";
          light_program = _light_program[0]; // Use aqualinkd light modes to set size below
        }
        var html1 = '';
        var html2 = '';
        var fLen = light_program.length;
        var i;
        var selected = "";
        for (i = 0; i < fLen; i++) {
          selected = "";
          if (current_mode != "" && light_program[i].startsWith(current_mode)) {
            selected = "checked";
          } 
          if (light_program[i].endsWith(" - Show"))
            html2 = html2 + "<div class='option_radiocontainer'><label><span class='radio'><input type='radio' name='light_program' value='" + (i+1) + "' "+selected+" onchange='updatePwsitchOptions(this, "+type+");'><span class='option_radio-value' aria-hidden='true'></span></span>" + light_program[i].substr(0, (light_program[i].length - 7)) + "</label></div>";
          else
            html1 = html1 + "<div class='option_radiocontainer'><label><span class='radio'><input type='radio' name='light_program' value='" + (i+1) + "' "+selected+" onchange='updatePwsitchOptions(this, "+type+");'><span class='option_radio-value' aria-hidden='true'></span></span>" + light_program[i] + "</label></div>";
        }
        var row;
        row = tbody.deleteRow(2);
        row = tbody.insertRow(2);
        if (type == 10) {
          row.innerHTML = "<td align='center'>Dimmer</td><td align='center'></td>";
        } else {
          row.innerHTML = "<td align='center'>Solid Color</td><td align='center'>Light Show</td>";
        }
        tbody.deleteRow(3);
        row = tbody.insertRow(3);
        row.innerHTML = "<td align='left' valign='top'>" + html1 + "</td><td align='left' valign='top'>" + html2 + "</td>";
      }
    }
*/

    // Simply loop over each key/value in color jason array and set that property adding -- to the beginning of key
    function setColors() {
      if ( _config?.["colors"+_theme] ) {
        const rootElement = document.documentElement;

        Object.entries(_config["colors"+_theme]).forEach(([key, value]) => {
          //console.log(`Key (Color Variable): ${key}, Value (Color Code): ${value}`);
          //console.log(key+ " " +document.documentElement.style.getPropertyValue('--' + key)+" | "+window.getComputedStyle(document.documentElement).getPropertyValue('--' + key));
          if (window.getComputedStyle(rootElement).getPropertyValue('--'+key) && _config?.["colors"+_theme][key]) {
            document.documentElement.style.setProperty('--'+key, value);
          } else {
            console.log(`Invalid config (Color Variable): ${key}, Value : ${value}`);
          }
        });
      }
    }
    // The above replaces the below.  Below is safer, but needs modification every time we add a property.
    /*
    function setProp(name) {
      //if ( _config?.colors[name] !== undefined ) {
      if ( _config?.colors && _config?.colors[name] ) {
        //console.log("Color "+name+" = "+_config.colors[name]);
        document.documentElement.style.setProperty('--' + name, _config.colors[name]);
      } else {
        //console.log("Missing Color "+name);
      }
    }
    function setColors() {
      setProp("body_background");
      setProp("body_text");
      setProp("options_pane_background");
      setProp("options_pane_bordercolor");
      setProp("options_slider_highlight");
      setProp("options_slider_lowlight");
      setProp("head_background");
      setProp("head_text");
      setProp("error_background");

      setProp("value_tile_normal_color");
      setProp("value_tile_outofrange_color");
      setProp("value_tile_attention_color");
      
      setProp("tile_on_text");
      setProp("tile_status_text");
      setProp("tile_text");
      setProp("tile_background");
      setProp("tile_on_background");

      setProp("tile_icon_background_color_heat");
      setProp("tile_icon_background_color_cool");
      setProp("tile_icon_background_color_enabled");
      setProp("tile_icon_background_color_disabled");
    }
*/
    function setSizeSpecifics() {
      var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      //alert(w+"x"+h+" = "+(w*h));

      // 375x724 = 271500
      if ((w * h) > 370000) { // 370000 is kind-a just guess
        _aq_display_tile_size = "large";
        document.documentElement.style.setProperty('--tile-width', '125px');
        document.documentElement.style.setProperty('--tile_icon-height', '45px');
        document.documentElement.style.setProperty('--tile_name-height', '42px');
        document.documentElement.style.setProperty('--tile_name-height1line', '27px');
        document.documentElement.style.setProperty('--tile_name-charlimit', '15');
        document.documentElement.style.setProperty('--tile_status-height', '15px');
        document.documentElement.style.setProperty('--tile_grid-gap', '20px');
        document.documentElement.style.setProperty('--tile_name-lineheight', '1.4');
      } else {
        _aq_display_tile_size = "small";
      }

      if (w > h)
        _landscape = true;
      else
        _landscape = false;
      setOrientation(_landscape);
      /*
        Future change element sizes here if needed
      */
      _tile_line_char_limit = getComputedStyle(document.documentElement).getPropertyValue('--tile_name-charlimit');

      if (_lightProgramDropdown == false && h < 570) {
        _lightProgramDropdown = true;
      }

      window.addEventListener("orientationchange", function() {
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        // Have no idea why this is reversed, but w is less then h in landscape when captured here.
        if (w < h)
          _landscape = true;
        else
          _landscape = false;
        setOrientation(_landscape);
        // Need to finish rendering before calling this, so wait a small time
        setTimeout(resetBackgroundSize, 100);
      }, false);
    }

    function setOrientation(isLandscape) {
      if (isLandscape) {
        //alert('lll')
        document.getElementById("td_name").width = '72px';
        document.getElementById("td_timedate").width = '72px';
      } else {
        document.getElementById("td_name").width = '72px';
        document.getElementById("td_timedate").width = '102px';
      }
    }

    function load_background() {
      // check for undefined AND defined but empty
      //if (typeof background_url === 'undefined' || background_url === undefined)
      if (!_config.background_image?.["url"+_theme]) {
        return;
      }
      //alert("load");
      // call the notify_complete function when the image has loaded
   
      var image = new Image();
      image.onload = function() {
        document.getElementById("body_wrap").style.backgroundImage = "url('" + this.src + "')";
      };
      image.onerror = function() {
        image.src = "hk/background.jpg"; // Use default if image fails.
      };
      //if (typeof background_reload !== 'undefined' && background_reload > 0) {
      if ( _config.background_image?.url_reload > 0) {
        if (_config.background_image.url.indexOf('?') > 0 )
          image.src = _config.background_image["url"+_theme] + '&aqrnd=' + new Date().getTime();
        else
          image.src = _config.background_image["url"+_theme] + '?' + new Date().getTime();

        setTimeout(load_background, (_config.background_image.url_reload * 1000));
      } else {
        image.src = _config.background_image["url"+_theme];
      }
    }
    // If the grid continer is larger than the page container, increase page so background looks nice
    // also reduce size if needed on page rotate.
    function resetBackgroundSize() {
      if (!_config.background_image?.url) {
        return;
      }

      try {
        //inside = document.getElementById('wrapper');
        outside = document.getElementById('body_wrap');
        insideH = parseInt(window.getComputedStyle(document.getElementById('wrapper')).height);
        outsideH = parseInt(window.getComputedStyle(outside).height);
        var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        if (insideH > outsideH || outsideH > h) {
          //outside.style.height = ((insideH > h)?(insideH + 40)+'px':(h + 40)+'px');
          outside.style.height = ((insideH > h) ? (insideH + 40) + 'px' : h + 'px');
          //alert("w:"+w+" h:"+h+" inH:"+insideH+" outH:"+outsideH+"\nUsed:"+outside.style.height);
        }
      } catch (e) {}
    }
