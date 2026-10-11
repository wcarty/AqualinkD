    function showBackground() {
      wrapper = document.getElementById("wrapper");
      if (wrapper.classList.contains("vopaque")) {
        wrapper.classList.remove("vopaque");
      } else {
        wrapper.classList.add("vopaque");
      }
    }

    function showVersion(source) {
      displayMessage("AqualinkD : " + _aqualink_data.aqualinkd_version + " | AqualinkRS : " + _aqualink_data.version, 5);
      /*
      if ((message = document.getElementById("message")) != null) {
        message.innerHTML = "AqualinkD : " + _aqualink_data.aqualinkd_version + " | AqualinkRS : " + _aqualink_data.version;
      }
      source.innerHTML = "Version(s)";
      setTimeout(function() {
        source.innerHTML = "AqualinkD";
      }, 5000);
      */
    }

    function updatePwsitchOptions(source, light_type) {
      if (source.type == 'radio') {
        //var modename = _light_program[light_type][source.value-1];
        var modename = _dynamicconfig?.light_programs[light_type][source.value-1]; 
        if (modename.endsWith(" - Show"))
          modename = modename.substr(0, (modename.length - 7));
        document.getElementById('pswitch_option_switch_text_value').innerHTML = modename;
        document.getElementById('pswitch_option_switch').checked = true;
      } else if (source.type == 'checkbox') {
        //console.log(source);
        var x;
        if (document.getElementById('pswitch_option_switch').checked == false) {
          var radio = document.getElementsByName("light_program");
          for (x = 0; x < radio.length; x++) {
            radio[x].checked = false
          }
          document.getElementById('pswitch_option_switch_text_value').innerHTML = 'Off';
        }
      }
    }

    function loadScriptIfAvailable(url) {
        const script = document.createElement('script');
        script.src = url;
        //alert(`Loading script from ${url}`);
        script.onload = function () {
          //console.log(`Script from ${url} loaded and executed.`);
          //alert(`onload script from ${url}`);
        };

        script.onerror = function () {
          //console.error(`Script from ${url} could not be loaded.`);
          //alert(`error Loading script from ${url}`);
        };

        document.head.appendChild(script);
      }

function cs_synchronizeTableWidths() {


   //console.log("SET table");

    const sourceTable = document.getElementById('cronschedules');
    const destinationTable = document.getElementById('cronschedules-main');

    if (!sourceTable || !destinationTable) {
        console.error("Source or destination table not found.");
        return;
    }

    // Optional: Force tables to obey set widths for consistency
    //sourceTable.style.tableLayout = 'fixed';
    //destinationTable.style.tableLayout = 'fixed';

    const sourceCells = sourceTable.rows[0]?.cells;
    const destinationCells = destinationTable.rows[0]?.cells;

    if (!sourceCells || !destinationCells) {
        console.error("Could not find the first row/cells in one of the tables.");
        return;
    }

    //if (sourceCells.length !== destinationCells.length) {
    if (sourceCells.length > destinationCells.length) {
        console.error(`Width sync failed: Source has ${sourceCells.length} cells in the first row, Destination has ${destinationCells.length}.`);
        return;
    }

    //let total=0;
    // Iterate over the columns and apply the width
    for (let i = 0; i < sourceCells.length; i++) {
        // Get the computed width of the source cell
        //const width = sourceCells[i].offsetWidth + 'px';
        //total += sourceCells[i].getBoundingClientRect().width;
        const width = sourceCells[i].getBoundingClientRect().width + 'px';

        // Apply the exact width to the destination cell's style
        // Setting min/max width helps ensure the browser obeys the instruction
        destinationCells[i].style.minWidth = width;
        destinationCells[i].style.maxWidth = width;
        destinationCells[i].style.width = width;
    }
/*
    if (sourceCells.length < destinationCells.length) {
      // Set the remaining cell to take up space.
      console.log("total = "+total);
      console.log("overall = "+destinationTable.getBoundingClientRect().width );
      let left = 680 - total  + 'px';
      console.log("left = "+left);
      destinationCells[sourceCells.length].style.minWidth = left;
      destinationCells[sourceCells.length].style.maxWidth = left;
      destinationCells[sourceCells.length].style.width = left;
    }
*/
}




/*
    function updateTimerOptions(source) {
      if (source.type == 'range') {
        if (source.value > 0) {
          document.getElementById('timer_switch').checked = true;
        } else {
          document.getElementById('timer_switch').checked = false;
        }
      } else if (source.type == 'checkbox') {
        if (document.getElementById('timer_switch').checked == false) {
          //timer_slider_range = 0;
          document.getElementById("timer_slider_range").value = 0;
          document.getElementById("timer_slider_text_value").value = 0;
        }
      }
    }
  */
    
