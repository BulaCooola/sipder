var workflowHTML = `
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

    <link media="print" rel="stylesheet" href="resources/print.css">
    <link rel="stylesheet" type="text/css" href="resources/scripts/bootstrap-3.3.6-dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="resources/scripts/bootstrap-3.3.6-dist/css/bootstrap-theme.min.css">

    <script src="resources/scripts/jquery-1.11.3/jquery.min.js"></script>
    <script src="resources/scripts/bootstrap-3.3.6-dist/js/bootstrap.min.js"></script>
    <script src="resources/language.js"></script>

    <script src="survey_metadata.js"></script>
    <script src="survey_summary.js"></script>
    <script src="upload/media.js"></script>
</head>

<body>

    <!------------Header---------------->
    <header>
        <div class="container-fluid" style="width:100%; height:auto; text-align:center">
            <h2 style="width:12%; float:left; position:relative;" align="left"><img class="image-responsive" src="resources/icon/EA 200px high.jpg" style="max-width:50%;max-height:50%"></h2>
            <h2 style="width:15%; float:right; position:relative;" align="right"><img class="image-responsive" src="resources/icon/Plus2 Logo 200px high.jpg" style="max-width:50%;max-height:50%"></h2>
            <h1 style="color:#ADBCE6; display:inline-block; margin:1%; font-weight:bold" id="survey-name"></h1>
            <h1 style="color:#ADBCE6; display:inline-block; margin:1%; font-weight:bold" id="survey-date"></h1>
        </div>
    </header>

<body>
    <div id="content" class="container-fluid;">
        <div class="mini-layout">
            <div id="survey-container" class="survey col-md-3 col-sm-3 col-lg-3" style="z-index:2000">
            </div>

            <!--Switchgear Components-->
            <div id="layout-container" class="content-body">

                <!-------Switchgear content------>
                <div class="switchgear-components" style="">
                    <div id="$PANEL_NO" style="height:auto;text-align:center;"></div>
                    <div style="height: 15%; margin-top: 10px; margin-bottom: 10px;text-align:center;">
                        <div id="$CABLES" style="padding-top:50%;">
                        </div>
                    </div>
                    <div style="height: 10%; margin-top: 10px; margin-bottom: 10px;text-align:center;">
                        <div id="$CABLE_BOX" style="padding-top:35%;">
                        </div>
                    </div>
                    <div style="height: 5%; margin-top: 10px; margin-bottom: 10px;text-align:center;">
                        <div id="$CT_CHAMBER" style="padding-top:15%;">
                        </div>
                    </div>
                    <div style="height: 5%; margin-top: 10px; margin-bottom: 10px;text-align:center;">
                        <div id="$VT_CHAMBER" style="padding-top:15%;">
                        </div>
                    </div>
                    <div style="height: 5%; margin-top: 10px; margin-bottom: 10px;text-align:center;">
                        <div id="$UPPER_BUSBARS" style="padding-top:15%;">
                        </div>
                    </div>
                    <div style="height: 5%; margin-top: 10px; margin-bottom: 10px;text-align:center;">
                        <div id="$LOWER_BUSBARS" style="padding-top:15%;">
                        </div>
                    </div>
                    <div style="height: 10%; margin-top: 10px; margin-bottom: 10px;text-align:center;">
                        <div id="$SPOUTS" style="padding-top:25%;">
                        </div>
                    </div>
                    <div style="height: 10%; margin-top: 10px; margin-bottom: 10px;text-align:center;">
                        <div id="$CIRCUIT_BREAKER" style="padding-top:25%;">
                        </div>
                    </div>
                    <div id="$ASSET_NAME" style="height:auto;margin:0px 10px;text-align:center;"></div>
                </div>

                <!------------------------------------
                ----Switchgear Installation Layout----
                -------------------------------------->
                <div id="switchgear" class="switchgear-layout">


                </div>
                <div class="navbar-bottom" style="text-align:right;font-style:italic;">
                    <a id="version-num" href="resources/instrument.html"></a>
                </div>
                <div class="dropup" style="text-align:right;">
                    <button class="btn btn-default dropdown-toggle" type="button" id="menu1" data-toggle="dropdown">
                <span class="caret"></span></button>
                    <ul id="dropdownitems" class="dropdown-menu" role="menu" aria-labelledby="menu1" style="left:auto;right:0;">
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <script type="text/javascript">
        var dropdowndiv = document.getElementById("dropdownitems");
        try {
            for (var languageset = 0; languageset < languages.Languages.length; languageset++) {
                var li = document.createElement('LI');
                var a = document.createElement('a');
                li.setAttribute("role", "presentation");
                li.setAttribute("id", languageset);
                li.setAttribute("onclick", "ChangeLanguage(this.id)");
                a.setAttribute("role", "menuitem");
                a.setAttribute("tabindex", "-1");
                a.innerHTML = languages.Languages[languageset];
                dropdowndiv.appendChild(li);
                li.appendChild(a);
            }
        } catch (e) {
            var warning = document.getElementById("content");
            warning.textContent = "Please extract downloaded/root folder before opening index.html";
        }

        var versionnum = document.getElementById("version-num");
        versionnum.textContent = survey_metadata.Instrument["$FIRMWARE_VERSION"];

        var title;
        var languagekeys = labels;
        var cookie = document.cookie;
        var languageloc;
        if (cookie) {
            languageloc = languages.Languages.indexOf(cookie);
        } else {
            languageloc = 0;
        }

        thresholds = [];
        thresholds.push(survey_metadata.Instrument["Cable PD PILC thresholds"]);
        thresholds.push(survey_metadata.Instrument["Cable PD XLPE thresholds"]);
        thresholds.push(survey_metadata.Instrument["TEV Thresholds"]);
        thresholds.push(survey_metadata.Instrument["Ultrasonic thresholds"]);

        var ultra_colour_scheme = survey_metadata.Instrument["$ULTRA_COLOUR_SCHEME"];
        // Currently no thresholds for UHF
        // VPIS currently uses Cable PD (XLPE) thresholds

        SetComponents();
        GenerateSwitchgearLayout();

        function ChangeLanguage(languageid) {

            if ("localStorage" in window && window["localStorage"] != null) {
                localStorage.setItem('languageid', languageid);
            }

            languageloc = languageid;
            var swgrlayout = document.getElementById("switchgear");
            var metalayout = document.getElementById("survey-container");
            while (swgrlayout.firstChild) {
                swgrlayout.removeChild(swgrlayout.firstChild);
            }
            while (metalayout.firstChild) {
                metalayout.removeChild(metalayout.firstChild);
            }
            SetComponents();
            GenerateSwitchgearLayout();
            GenerateAndBindMetadata();

        }

        function ChangeUltraColourScheme(colour_scheme) {
            ultra_colour_scheme = colour_scheme;
            var swgrlayout = document.getElementById("switchgear");
            while (swgrlayout.firstChild) {
                swgrlayout.removeChild(swgrlayout.firstChild);
            }

            GenerateSwitchgearLayout();
        }

        function ConvertKeyLanguage(key) {
            for (i = 0; i < languagekeys.length; i++) {
                if (languagekeys[i][key]) {
                    var data = languagekeys[i][key][languageloc];
                    if (data != undefined) {
                        return data;
                    } else {
                        return key.replace("$", "");
                    }
                }
            }
            return key.replace("$", "");
        }

        function SetComponents() {
            var componentkeys = ["$PANEL_NO", "$CABLES", "$CABLE_BOX", "$CT_CHAMBER", "$VT_CHAMBER", "$UPPER_BUSBARS", "$LOWER_BUSBARS", "$SPOUTS", "$CIRCUIT_BREAKER", "$ASSET_NAME"];
            for (var component = 0; component < componentkeys.length; component++) {
                document.getElementById(componentkeys[component]).innerHTML = ConvertKeyLanguage(componentkeys[component]);
            }
            document.getElementById("menu1").innerHTML = languages.Languages[languageloc];
        }


        var createObject = function(o) {
            function F() {}
            F.prototype = o;
            return new F();
        };

        function GenerateComponentPlaceholder(id, classname, div, style) {
            id = id.replace("$SUB_LOC_CENTRE_CENTRE", "$SUB_LOC_CENTRE");
            var cableDiv = document.getElementById(div.id);
            var placeholderDiv = document.createElement('div');
            cableDiv.appendChild(placeholderDiv);
            placeholderDiv.id = id;
            placeholderDiv.className = classname;
            placeholderDiv.setAttribute("style", style);
        };

        function GenerateComponentContainer(paneldiv, id, classname, style) {
            var containerDiv = document.createElement('div');
            paneldiv.appendChild(containerDiv);
            containerDiv.id = id;
            containerDiv.className = classname;
            containerDiv.setAttribute("style", style);

            return containerDiv;
        }

        function GenerateContainerStyle(height) {
            var containerstyle = 'height:' + height + ';margin:10px;';
            return containerstyle;
        }


        function GenerateSwitchgearLayout() {

            var panels = survey_summary.assets;
            var surveyDateTime = document.getElementById("survey-date");

            var value = survey_metadata["Survey Name"];

            var year = value.substring(0, 4);
            var month = value.substring(4, 6);
            var day = value.substring(6, 8);
            var hour = value.substring(9, 11);
            var minute = value.substring(11, 13);
            var second = value.substring(13, 15);

            surveyDateTime.textContent = +year + "/" + month + "/" + day + "  " + hour + ":" + minute + ":" + second;
            title = +" " + year + "/" + month + "/" + day + "  " + hour + ":" + minute + ":" + second;

            var panelorder = [];
            for (var i = 0; i < panels.length; i++) {
                var str = panels[i]["$PANEL_NO"];
                var newnum = str.replace("a", ".1");
                var newnum = str.replace("A", ".1");
                if ((parseInt(str) % 10) == 0) {

                } else {
                    newnum = newnum.replace("0", "-");
                }
                newnum = parseInt(newnum);
                panelorder.push([newnum, i]);
            }
            panelorder.sort(sortFunction);

            function sortFunction(a, b) {
                if (a[0] === b[0]) {
                    return 0;
                } else {
                    return (a[0] < b[0]) ? -1 : 1;
                }
            }

            for (var i = 0; i < panelorder.length; i++) {
                drawPanel(panelorder[i][1]);
            }

            function drawPanel(index) {
                var panelId = "Panel-" + index.valueOf();
                var div = document.createElement('div');
                document.body.appendChild(div);
                div.id = panelId;
                div.className = "switchgear-panel";


                var elm = document.getElementById("switchgear");
                if (elm.className === "switchgear-layout") {
                    elm.appendChild(div);


                    var containerDiv = document.getElementById(panelId);


                    var panelLabelDiv = document.createElement('div');
                    containerDiv.appendChild(panelLabelDiv);
                    panelLabelDiv.id = "label-" + panelId;
                    panelLabelDiv.textContent = panels[index]["$PANEL_NO"];

                    panelLabelDiv.setAttribute("style", "height:auto;font-weight:bold;text-align:center;");


                    var style = 'height:24%;width:31%;margin:1px;float:left;position:relative;';
                    var singlestyle = 'height:100%;width:100%;margin:1px;float:left;position:relative;';
                    var cableboxstyle = 'height:33%;width:31%;margin:1px;float:left;position:relative;';
                    var spoutsstyle = 'height:100%;width:31%;margin:1px;float:left;position:relative;';
                    var circuitstyle = 'height:100%;width:100%;margin:1px;float:left;position:relative;';

                    var cablephase = ["$P1", "$P2", "$P3"];
                    var cablenum = ["C1", "C2", "C3", "C4"]
                    var horizontalAreas = ["_LEFT", "_CENTRE", "_RIGHT"];
                    var verticalAreas = ["$SUB_LOC_UPPER", "$SUB_LOC_CENTRE", "$SUB_LOC_LOWER"];


                    var cableDiv = GenerateComponentContainer(containerDiv, "$CABLES-" + panelId, "panel-component-shape cable-container", GenerateContainerStyle("15%"));

                    for (var i = 0; i < 4; i++)
                        for (var j = 0; j < 3; j++) {
                            GenerateComponentPlaceholder(panelId + "-$CABLES-" + cablephase[j] + "_" + cablenum[i], "cables-place-holder", cableDiv, style);
                        }


                    var cableBoxDiv = GenerateComponentContainer(containerDiv, "$CABLE_BOX-" + panelId, "panel-component-shape cable-box-container", GenerateContainerStyle("10%"));

                    for (var i = 0; i < 3; i++)
                        for (var j = 0; j < 3; j++) {
                            GenerateComponentPlaceholder(panelId + "-$CABLE_BOX-" + verticalAreas[i] + horizontalAreas[j], "cable-box-place-holder", cableBoxDiv, cableboxstyle);
                        }


                    var chamberDiv = GenerateComponentContainer(containerDiv, "$CT_CHAMBER-" + panelId, "panel-component-shape CT-chamber-container", GenerateContainerStyle("5%"));
                    GenerateComponentPlaceholder(panelId + "-$CT_CHAMBER-", "CT-chamber-place-holder", chamberDiv, singlestyle);


                    var VTDiv = GenerateComponentContainer(containerDiv, "$VT_CHAMBER-" + panelId, "panel-component-shape VT-container", GenerateContainerStyle("5%"));
                    GenerateComponentPlaceholder(panelId + "-$VT_CHAMBER-", "VT-place-holder", VTDiv, singlestyle);


                    var busbarADiv = GenerateComponentContainer(containerDiv, "$UPPER_BUSBARS-" + panelId, "panel-component-shape busbar-a-container", GenerateContainerStyle("5%"));
                    GenerateComponentPlaceholder(panelId + "-$UPPER_BUSBARS-", "busbar-a-place-holder", busbarADiv, singlestyle);


                    var busbarBDiv = GenerateComponentContainer(containerDiv, "$LOWER_BUSBARS-" + panelId, "panel-component-shape busbar-b-container", GenerateContainerStyle("5%"));
                    GenerateComponentPlaceholder(panelId + "-$LOWER_BUSBARS-", "busbar-b-place-holder", busbarBDiv, singlestyle);


                    var spoutDiv = GenerateComponentContainer(containerDiv, "$SPOUTS-" + panelId, "panel-component-shape spouts-container", GenerateContainerStyle("10%"));

                    for (var i = 0; i < 3; i++) {
                        GenerateComponentPlaceholder(panelId + "-$SPOUTS-" + "$SUB_LOC" + horizontalAreas[i], "spout-place-holder", spoutDiv, spoutsstyle);
                    }


                    var circuitBreakerDiv = GenerateComponentContainer(containerDiv, "$CIRCUIT_BREAKER-" + panelId, "panel-component-shape circuit-breaker-container", GenerateContainerStyle("10%"));
                    GenerateComponentPlaceholder(panelId + "-$CIRCUIT_BREAKER-", "circuit-breaker-place-holder", circuitBreakerDiv, circuitstyle);



                    var panelLabelDiv = document.createElement('div');
                    containerDiv.appendChild(panelLabelDiv);
                    panelLabelDiv.id = "label-" + panelId;
                    //panelLabelDiv.textContent = panels[index]["$ASSET_NAME"];
                    panelLabelDiv.innerHTML = panels[index]["$ASSET_NAME"];

                    // check whether there is any applicable media
                    if (typeof(mediaMetadata) !== "undefined") {
                        for (im = 0; im < mediaMetadata.length; im++) {
                            if (mediaMetadata[im].asset == panels[index]["$ASSET_NAME"]) {
                                panelLabelDiv.innerHTML += '<br /><a href="resources/media.html?asset=' + encodeURI(panels[index]["$ASSET_NAME"]) + '" target="_blank"><img src="resources/icon/media.svg" style="height:20px;width:20px;"></a>';
                                break;
                            }
                        }
                    }

                    panelLabelDiv.setAttribute("style", "height:auto;margin:0px 10px;text-align:center;");
                }

                var measurements = panels[index].$MEASURES;
                var sensorIconPaths = [
                    ["resources/icon/tev-bolt-red.svg", "resources/icon/tev-bolt-orange.svg", "resources/icon/tev-bolt-green.svg"],
                    ["resources/icon/ultrasonic-red.svg", "resources/icon/ultrasonic-orange.svg", "resources/icon/ultrasonic-green.svg"],
                    ["resources/icon/cable-pd-red.svg", "resources/icon/cable-pd-orange.svg", "resources/icon/cable-pd-green.svg"],
                    ["resources/icon/vpis-red.svg", "resources/icon/vpis-orange.svg", "resources/icon/vpis-green.svg"],
                    ["resources/icon/uhf-red.svg", "resources/icon/uhf-orange.svg", "resources/icon/uhf-green.svg"]
                ];
                var backgroundcolours = ['#FF0000', '#FFA500', '#008000'];
                var currentcontainer = null;
                var highestthreshold = 2;
                for (var i = 0; i < measurements.length; i++) {
                    var assetcomponent = measurements[i]["$COMPONENT"];
                    var container = document.getElementById(assetcomponent + "-" + panelId);
                    if (currentcontainer == null) {
                        currentcontainer = container;
                    };
                    if (container != currentcontainer) {
                        currentcontainer.style.borderColor = backgroundcolours[highestthreshold];
                        currentcontainer.style.borderWidth = 'medium';
                        currentcontainer = container;
                        highestthreshold = 2;
                    }
                    var measurementdata = measurements[i].Data;
                    var measurementlocation = measurements[i]["$SUB_LOC"];
                    var measurementtype = measurements[i]["$MEASURE_TYPE"];
                    if (measurementlocation == "$NONE")
                    {
                        var placeholder = panelId + "-" + assetcomponent + "-";
                    }
                    else
                    {
                        var placeholder = panelId + "-" + assetcomponent + "-" + measurementlocation;  
                    }
                    var sensorIconPath;
                    var measurementfile;
                    var threshold;
                    switch (measurementtype) {
                        case "$TEV":
                            threshold = ThresholdCalc(measurements[i]["$MEASURE_DB"], thresholds[2]["Amber"], thresholds[2]["Red"]);
                            sensorIconPath = sensorIconPaths[0][threshold];
                            measurementfile = "TEV";
                            if (threshold < highestthreshold) {
                                highestthreshold = threshold;
                            }
                            break;
                        case "$ULTRA":
                            if(ultra_colour_scheme === "$ULTRA_SCHEME_AMPLITUDE")
                            {
                                threshold = ThresholdCalc(measurements[i]["$MEASURE_DBUV"], thresholds[3]["Red"], thresholds[3]["Red"]);
                            }
                            else
                            {
                                threshold = UltraClassificationThresholds(measurements[i]["$ULTRA_CLASS"], measurements[i]["$ULTRA_CLASS_PERCENT"])
                            }
                            sensorIconPath = sensorIconPaths[1][threshold];
                            measurementfile = "Ultrasonic";
                            if (threshold < highestthreshold) {
                                highestthreshold = threshold;
                            }
                            break;
                        case "$CABLE_PD":
                            var currentthreshold = 1;
                            if (measurements[i]['$INSULATION'] == "$INSU_PILC") {
                                currentthreshold = 0;
                            }
                            threshold = ThresholdCalc(measurements[i]["$MEASURE_PC"], thresholds[currentthreshold]["Amber"], thresholds[currentthreshold]["Red"]);
                            sensorIconPath = sensorIconPaths[2][threshold];
                            measurementfile = "CablePD";
                            if (threshold < highestthreshold) {
                                highestthreshold = threshold;
                            }
                            break;
                        case "$VPIS":
                            threshold = ThresholdCalc(measurements[i]["$MEASURE_PC"], thresholds[1]["Amber"], thresholds[1]["Red"]); //TODO - Add VPIS Threshold
                            sensorIconPath = sensorIconPaths[3][threshold];
                            measurementfile = "VPIS";
                            if (threshold < highestthreshold) {
                                highestthreshold = threshold;
                            }
                            break;
                        case "$UHF":
                            // Currently no thresholds for UHF, so always use green
                            sensorIconPath = sensorIconPaths[4][2];
                            measurementfile = "UHF";
                            break;
                    }
                    if (i == measurements.length - 1) {
                        container.style.borderColor = backgroundcolours[highestthreshold];
                        container.style.borderWidth = 'medium';
                    }
                    LayoutManager(measurementtype, placeholder, measurementdata, sensorIconPath, measurementfile);
                }


            }

        };

        function ThresholdCalc(value, amber, red) {
            var outcome = 2;
            if (value < red && value >= amber) {
                outcome = 1;
            } else if (value >= red) {
                outcome = 0;
            }
            return outcome;
        }

        function UltraClassificationThresholds(classification, percentage) {
            const PD_RED = 80;
            var outcome = 2;
            if(classification === "$ULTRA_NOISE")
            {
                outcome = 2; //green
            }
            else if ((classification === "$ULTRA_PD") && (percentage >= PD_RED))
            {
                outcome = 0; //red
            }
            else //Invalid or not enough to be red
            {
                outcome = 1; //Amber
            }
            return outcome;
        }

        function LayoutManager(measurement, placeholder, data, sensorIconPath, measurementfile) {
            var currenticons = document.getElementById(placeholder).childNodes;
            var linkstyle = 'width:8px;';
            var divstyle = 'height:100%;width:100%;top:50%;margin:auto;position:relative;left:50%;margin-left:-4px;margin-top:-6px;';
            var iconstyle = 'height:8px;width:8px;';
            if (currenticons.length == 1) {
                divstyle = 'height:100%;width:50%;top:50%;display:inline-block;margin:auto;position:relative;left:25%;margin-left:-3px;margin-top:-6px;';
                currenticons[0].setAttribute("style", divstyle);
            } else if (currenticons.length == 2) {
                divstyle = 'height:100%;width:33%;top:50%;display:inline-block;margin:auto;position:relative;left:18%;margin-left:-2px;margin-top:-6px;';
                for (i = 0; i < currenticons.length; i++) {
                    currenticons[i].setAttribute("style", divstyle);
                }
            } else if (currenticons.length == 3) {
                divstyle = 'height:50%;width:50%;top:50%;display:inline-block;margin:auto;position:relative;left:18%;margin-left:-2px;margin-top:-6px;';
                for (i = 0; i < currenticons.length; i++) {
                    currenticons[i].setAttribute("style", divstyle);
                }
            }
            var divelement = document.createElement('div');
            divelement.setAttribute("style", divstyle);
            var linkelement = document.createElement('a');
            var iconelement = document.createElement('img');
            document.getElementById(placeholder).appendChild(divelement);
            divelement.appendChild(linkelement);
            linkelement.href = data + "/" + measurementfile + ".html";
            linkelement.target = "_blank";
            linkelement.setAttribute("style", linkstyle);
            linkelement.appendChild(iconelement);
            iconelement.setAttribute("style", iconstyle);
            iconelement.id = "image";
            iconelement.src = sensorIconPath;
        }

        (function SwitchgearScroll() {
            var panels = survey_summary.assets;
            var width = document.getElementById("switchgear").offsetWidth;

            if (panels.length < 8 && width > 900) {
                jQuery('#switchgear').css("overflow-x", "hidden");
                jQuery('#switchgear').css("overflow-y", "hidden");

            } else
            if (panels.length > 1 || width <= 270) {
                jQuery('#switchgear').css("overflow-x", "scroll");
                jQuery('#switchgear').css("overflow-y", "hidden");

            }
        }());
    </script>



    <script type="text/javascript">
        GenerateAndBindMetadata();

        if ("localStorage" in window && window["localStorage"] != null) {
            var local_languageid = localStorage.getItem('languageid');
            if (local_languageid) {
                ChangeLanguage(local_languageid);
            }
        }

        function GenerateAndBindMetadata() {

            var data = survey_metadata.survey_fields;
            var surveyContainer = null;
            var fieldValues = null;
            var group = null;

            for (var i = 0; i < data.length; i++) {
                fieldValues = data[i].fields;
                group = data[i].group;

                surveyContainer = document.getElementById("survey-container");
                var panelInfo = document.createElement('div');
                surveyContainer.appendChild(panelInfo);
                panelInfo.id = "survey-" + group;
                panelInfo.className = "panel panel-info";

                var headerContainer = document.getElementById(panelInfo.id);
                var panelHeader = document.createElement('div');
                headerContainer.appendChild(panelHeader);
                panelHeader.id = panelInfo.id + "-header";
                panelHeader.className = "panel-heading";
                panelHeader.textContent = ConvertKeyLanguage(group);

                var bodyContainer = document.getElementById(panelInfo.id);
                var panelBody = document.createElement('div');
                bodyContainer.appendChild(panelBody);
                panelBody.id = panelInfo.id + "-body";
                panelBody.className = "panel-body";


                var container = document.getElementById(panelBody.id);
                var table = document.createElement('TABLE');
                container.appendChild(table);
                table.id = panelInfo.id + "-table";
                table.className = 'table table-hover';
                table.setAttribute("style", "font-size:90%;");

                var tableBody = document.createElement('TBODY');
                table.appendChild(tableBody);

                for (d = 0; d < fieldValues.length; d++) {
                    var tr = null;
                    var td1 = null;
                    var td2 = null;
                    var datafield = fieldValues[d].data.toString();
                    var keycheck = datafield.charAt(0);
                    if (keycheck == "$") {
                        var dataContent = ConvertKeyLanguage(fieldValues[d].data);
                    } else {
                        var dataContent = fieldValues[d].data;
                    }
                    var label = ConvertKeyLanguage(fieldValues[d].fieldname).replace(/[\n\r]/g, '');


                    tr = document.createElement('TR');
                    tableBody.appendChild(tr);

                    td1 = document.createElement('TD');
                    tr.appendChild(td1);
                    td1.style.width = "50%";
                    td1.textContent = label + ":";


                    td2 = document.createElement('TD');
                    tr.appendChild(td2);
                    td2.style.width = "50%";
                    td2.textContent = dataContent;

                    if (fieldValues[d].fieldname == "$SUB_NAME") {
                        var surveyName = document.getElementById("survey-name");
                        surveyName.textContent = fieldValues[d].data;
                        document.title = fieldValues[d].data + " " + title;
                    }

                }

                // At the end of the substation group, look if there are any substation
                // media to add link to
                if ((group == "$GROUP_SUB") && (typeof(mediaMetadata) !== "undefined")) {
                    // get array of assets
                    for (im = 0; im < mediaMetadata.length; im++) {
                        if (mediaMetadata[im].asset == "Substation") {
                            tr = document.createElement('TR');
                            tableBody.appendChild(tr);

                            td1 = document.createElement('TD');
                            tr.appendChild(td1);
                            td1.style.width = "50%";
                            td1.textContent = "Media: ";

                            td2 = document.createElement('TD');
                            tr.appendChild(td2);
                            td2.style.width = "50%";
                            td2.innerHTML = '<a href="resources/media.html?asset=Substation" target="_blank"><img src="resources/icon/media.svg" style="height:25px;width:25px;"></a>';
                            break;
                        }
                    }
                }

            }

        //Create download table
            group = ConvertKeyLanguage("$DOWNLOAD");

            surveyContainer = document.getElementById("survey-container");
            var panelInfo = document.createElement('div');
            surveyContainer.appendChild(panelInfo);
            panelInfo.id = "survey-" + group;
            panelInfo.className = "panel panel-info";

            var headerContainer = document.getElementById(panelInfo.id);
            var panelHeader = document.createElement('div');
            headerContainer.appendChild(panelHeader);
            panelHeader.id = panelInfo.id + "-header";
            panelHeader.className = "panel-heading";
            panelHeader.textContent = group;

            var bodyContainer = document.getElementById(panelInfo.id);
            var panelBody = document.createElement('div');
            bodyContainer.appendChild(panelBody);
            panelBody.id = panelInfo.id + "-body";
            panelBody.className = "panel-body";


            var container = document.getElementById(panelBody.id);
            var table = document.createElement('TABLE');
            container.appendChild(table);
            table.id = panelInfo.id + "-table";
            table.className = 'table table-hover';
            table.setAttribute("style", "font-size:90%;");

            var tableBody = document.createElement('TBODY');
            table.appendChild(tableBody);

            var tr = null;

            tr = document.createElement('TR');
            tableBody.appendChild(tr);

            var buttonelement = document.createElement('button');
            buttonelement.id = "survey-workflow";
            buttonelement.textContent = ConvertKeyLanguage("$SUMMARY_CSV");
            tr.appendChild(buttonelement);

        //Create colour scheme table
            group = ConvertKeyLanguage("$ULTRA_COLOUR_SCHEME");

            surveyContainer = document.getElementById("survey-container");
            var panelInfo = document.createElement('div');
            surveyContainer.appendChild(panelInfo);
            panelInfo.id = "survey-" + group;
            panelInfo.className = "panel panel-info";

            var headerContainer = document.getElementById(panelInfo.id);
            var panelHeader = document.createElement('div');
            headerContainer.appendChild(panelHeader);
            panelHeader.id = panelInfo.id + "-header";
            panelHeader.className = "panel-heading";
            panelHeader.textContent = group;

            var bodyContainer = document.getElementById(panelInfo.id);
            var panelBody = document.createElement('div');
            bodyContainer.appendChild(panelBody);
            panelBody.id = panelInfo.id + "-body";
            panelBody.className = "panel-body";


            var container = document.getElementById(panelBody.id);
            var table = document.createElement('TABLE');
            container.appendChild(table);
            table.id = panelInfo.id + "-table";
            table.className = 'table table-hover';
            table.setAttribute("style", "font-size:90%;");

            var tableBody = document.createElement('TBODY');
            table.appendChild(tableBody);

            var tr = null;

            tr = document.createElement('TR');
            tableBody.appendChild(tr);

            var radioDiv = document.createElement('div');
            radioDiv.setAttribute("style", "display: flex; justify-content: space-around;");
            tr.appendChild(radioDiv);

            var amplitudeDiv = document.createElement('div');
            radioDiv.appendChild(amplitudeDiv);

            var amplitude_radio = document.createElement('input');
            amplitude_radio.type = 'radio';
            amplitude_radio.name = 'UltraSchemeRadio';
            amplitude_radio.id = 'Amplitude';
            amplitude_radio.classList.add('form-check-input');
            amplitude_radio.checked = (ultra_colour_scheme === "$ULTRA_SCHEME_AMPLITUDE");
            amplitude_radio.onchange = function() {
                if (this.checked) { 
                    ChangeUltraColourScheme('$ULTRA_SCHEME_AMPLITUDE');
                }
            };
            amplitudeDiv.appendChild(amplitude_radio);

            var amplitude_label = document.createElement('label');
            amplitude_label.for = 'Amplitude';
            amplitude_label.classList.add('form-check-label');
            amplitude_label.textContent = ConvertKeyLanguage("$ULTRA_SCHEME_AMPLITUDE");
            amplitudeDiv.appendChild(amplitude_label);


            var classificationDiv = document.createElement('div');
            radioDiv.appendChild(classificationDiv);

            var classification_radio = document.createElement('input');
            classification_radio.type = 'radio';
            classification_radio.name = 'UltraSchemeRadio';
            classification_radio.id = 'Classification';
            classification_radio.classList.add('form-check-input');
            classification_radio.checked = (ultra_colour_scheme === "$ULTRA_SCHEME_CLASSIFICATION");
            classification_radio.onchange = function() {
                if (this.checked) { 
                    ChangeUltraColourScheme('$ULTRA_SCHEME_CLASSIFICATION');
                }
            };
            classificationDiv.appendChild(classification_radio);

            var classification_label = document.createElement('label');
            classification_label.for = 'Classification';
            classification_label.classList.add('form-check-label');
            classification_label.textContent = ConvertKeyLanguage("$ULTRA_SCHEME_CLASSIFICATION");
            classificationDiv.appendChild(classification_label);

            $('#survey-workflow').on('click', function(e) {
                var data = [];
                var filename;
                var metadata = survey_metadata;
                var summary = survey_summary;
                var fields = metadata.survey_fields;
                var assetName;
                for (i = 0; i < fields.length; i++) {
                    if (fields[i].group == "$GROUP_SUB") {
                        assetName = fields[i].fields[0].data;
                    }
                }
                var value = metadata["Survey Name"];
                var year = value.substring(0, 4);
                var month = value.substring(4, 6);
                var day = value.substring(6, 8);
                var hour = value.substring(9, 11);
                var minute = value.substring(11, 13);
                var second = value.substring(13, 15);
                var surveyDateTime = +year + "/" + month + "/" + day + "  " + hour + ":" + minute + ":" + second;

                // Output survey metadata (sub name, date, instrument details)
                data.push([ConvertKeyLanguage("$SUB_NAME"), assetName]);
                data.push([ConvertKeyLanguage("$SURVEY_TIME"), surveyDateTime]);
                data.push([ConvertKeyLanguage("$CAL_DUE"), metadata.Instrument.$CAL_DUE]);
                data.push([ConvertKeyLanguage("$DNA"), metadata.Instrument.$DNA]);
                data.push([ConvertKeyLanguage("$FIRMWARE_VERSION"), metadata.Instrument.$FIRMWARE_VERSION]);
                data.push([ConvertKeyLanguage("$HARDWARE_VERSION"), metadata.Instrument.$HARDWARE_VERSION]);
                data.push([ConvertKeyLanguage("$SELF_CHECK"), metadata.Instrument.$SELF_CHECK]);
                data.push([ConvertKeyLanguage("$SERIAL"), metadata.Instrument.$SERIAL]);
                data.push([]);

                // Get Survey summary
                var sortedSummaryAssets = summary.assets;

                // Replace "A" and "0" with correct data sequence 
                for (var i = 0; i < sortedSummaryAssets.length; i++) {
                    var str = sortedSummaryAssets[i]["$PANEL_NO"];
                    var newnum = str.replace("a", ".1");
                    var newnum = str.replace("A", ".1");

                    if ((parseInt(str) % 10) == 0) {

                    } else {
                        newnum = newnum.replace("0", "-");
                    }

                    sortedSummaryAssets[i]["$PANEL_NO"] = newnum;
                }

                // Sort Survey based on panel number in ascending order 
                sortedSummaryAssets.sort(sortFunction);

                function sortFunction(a, b) {
                    //Note: Parse float used here to make sure we are comparing numbers. those numbers could be ".1" which is why we need float
                    if (parseFloat(a.$PANEL_NO) === parseFloat(b.$PANEL_NO)) {
                        return 0;
                    } else {
                        return (parseFloat(a.$PANEL_NO) < parseFloat(b.$PANEL_NO)) ? -1 : 1;
                    }
                }

                var assets = sortedSummaryAssets;

                // Setup panel number and asset name rows
                var panelnumheaders = [];
                var assetnameheaders = [];
                for (asset = 0; asset < assets.length; asset++) {
                    panelnumheaders.push(assets[asset]["$PANEL_NO"]);
                    assetnameheaders.push(assets[asset]["$ASSET_NAME"]);
                }

                panelnumheaders.unshift(ConvertKeyLanguage("$PANEL_NO"));
                assetnameheaders.unshift(ConvertKeyLanguage("$ASSET_NAME"));

                // Add switch positions
                data.push([ConvertKeyLanguage("$SWITCH_POS")], panelnumheaders, assetnameheaders);
                var switchpositions = [""]; //blank string to miss first column
                for (asset = 0; asset < assets.length; asset++) {
                    if (assets[asset].$MEASURES[0] != null) {
                        switchpositions.push(ConvertKeyLanguage(assets[asset].$MEASURES[0].$SWITCH_POS));
                    }
                    else {
                        switchpositions.push("");
                    }
                }
                data.push(switchpositions);
                data.push([]);

                // Loop through 6 data types (TEV dB, TEV PPC, Ultrasonic, CPD pC, CPD PPC, UHF)
                for (p = 0; p < 6; p++) {

                    var datacolheader = [];
                    var currentsection;

                    var dataheaders = [ConvertKeyLanguage("$TEV") + " (dB)", ConvertKeyLanguage("$TEV") + " (PPC)", ConvertKeyLanguage("$ULTRA") + " (dBuV)", ConvertKeyLanguage("$CABLE_PD") + " (pC)", ConvertKeyLanguage("$CABLE_PD") + " (PPC)", ConvertKeyLanguage("$UHF") + " (dBm)"];
                    datacolheader.push(dataheaders[p]);
                    currentsection = dataheaders[p];

                    data.push(datacolheader, panelnumheaders, assetnameheaders);
                    var min = data.length;
                    var cabletypes = ["$P1_C1", "$P1_C2", "$P1_C3", "$P1_C4", "$P2_C1", "$P2_C2", "$P2_C3", "$P2_C4", "$P3_C1", "$P3_C2", "$P3_C3", "$P3_C4"];
                    for (k = 0; k < cabletypes.length; k++) {
                        data.push([ConvertKeyLanguage("$CABLES") + " " + ConvertKeyLanguage(cabletypes[k])]);
                    }
                    var cabboxsectors = ["$SUB_LOC_UPPER", "$SUB_LOC_CENTRE", "$SUB_LOC_LOWER", "_LEFT", "_CENTRE", "_RIGHT"];
                    for (m = 0; m < 3; m++) {
                        for (n = 3; n < 6; n++) {
                            if (m == 1 && n == 4) {
                                data.push([ConvertKeyLanguage("$CABLE_BOX") + " " + ConvertKeyLanguage("$SUB_LOC_CENTRE")]);
                            } else {
                                data.push([ConvertKeyLanguage("$CABLE_BOX") + " " + ConvertKeyLanguage(cabboxsectors[m] + cabboxsectors[n])]);
                            }
                        }
                    }
                    data.push([ConvertKeyLanguage("$CT_CHAMBER")]);
                    data.push([ConvertKeyLanguage("$VT_CHAMBER")]);
                    data.push([ConvertKeyLanguage("$UPPER_BUSBARS")]);
                    data.push([ConvertKeyLanguage("$LOWER_BUSBARS")]);
                    data.push([ConvertKeyLanguage("$SPOUTS") + " " + ConvertKeyLanguage("$SUB_LOC_LEFT")]);
                    data.push([ConvertKeyLanguage("$SPOUTS") + " " + ConvertKeyLanguage("$SUB_LOC_CENTRE")]);
                    data.push([ConvertKeyLanguage("$SPOUTS") + " " + ConvertKeyLanguage("$SUB_LOC_RIGHT")]);
                    data.push([ConvertKeyLanguage("$CIRCUIT_BREAKER")]);
                    var max = data.length;

                    for (i = 0; i < assets.length; i++) {
                        var readings = [];
                        for (k = 0; k < assets[i].$MEASURES.length; k++) {
                            var readinglocation;
                            var measurements = assets[i].$MEASURES[k];
                            var assetlocation;
                            if ((measurements["$SUB_LOC"]) && (measurements["$SUB_LOC"] != "$NONE")) {
                                assetlocation = ConvertKeyLanguage(measurements["$COMPONENT"]) + " " + ConvertKeyLanguage(measurements["$SUB_LOC"]);
                            } else {
                                assetlocation = ConvertKeyLanguage(measurements["$COMPONENT"]);
                            }
                            var type = measurements["$MEASURE_TYPE"];
                            for (j = 0; j < readings.length; j++) {
                                if (readings[j][0] == assetlocation) {
                                    readinglocation = j;
                                } else {
                                    if (j == (readings.length - 1)) {
                                        readings.push([assetlocation]);
                                        readinglocation = j + 1;
                                        readings[readinglocation].push("");
                                    }
                                }
                            }
                            if (readings.length == 0) {
                                readings.push([assetlocation]);
                                readinglocation = 0;
                                for (l = 0; l < assets.length; l++) {
                                    readings[readinglocation].push("");
                                }
                            }
                            if (type == "$TEV") {
                                if (currentsection == ConvertKeyLanguage("$TEV") + " (dB)") {
                                    readings[readinglocation][i + 1] = measurements["$MEASURE_DB"];
                                }
                                if (currentsection == ConvertKeyLanguage("$TEV") + " (PPC)") {
                                    readings[readinglocation][i + 1] = measurements["$MEASURE_PPC"];
                                }
                            }
                            if (type == "$ULTRA") {
                                if (currentsection == ConvertKeyLanguage("$ULTRA") + " (dBuV)") {
                                    readings[readinglocation][i + 1] = measurements["$MEASURE_DBUV"];
                                }
                            }
                            if (type == "$CABLE_PD") {
                                if (currentsection == ConvertKeyLanguage("$CABLE_PD") + " (pC)") {
                                    readings[readinglocation][i + 1] = measurements["$MEASURE_PC"];
                                }
                                if (currentsection == ConvertKeyLanguage("$CABLE_PD") + " (PPC)") {
                                    readings[readinglocation][i + 1] = measurements["$MEASURE_PPC"];
                                }
                            }
                            if (type == "$UHF") {
                                if (currentsection == ConvertKeyLanguage("$UHF") + " (dBm)") {
                                    readings[readinglocation][i + 1] = measurements["$MEASURE_DBM"];
                                }
                            }
                        }
                        for (j = min; j < max; j++) {
                            var currentfield = data[j][0];
                            for (k = 0; k < readings.length; k++) {
                                var currentreading = readings[k][0];
                                if (currentfield == currentreading) {
                                    for (l = 0; l < assets.length; l++) {
                                        data[j].push("");
                                    }
                                    var datareading;
                                    for (l = 0; l < assets.length; l++) {
                                        datareading = readings[k][l + 1];
                                        if (datareading === "" || datareading == undefined) {

                                        } else {
                                            data[j][l + 1] = readings[k][l + 1];
                                        }
                                    }
                                }
                            }
                        }
                    }
                    data.push([]);
                }
                data.push([]);
                for (i = 0; i < fields.length; i++) {
                    for (j = 0; j < fields[i].fields.length; j++) {
                        var metaheader = ConvertKeyLanguage(fields[i].fields[j].fieldname);
                        var metadatafield = fields[i].fields[j].data.toString();
                        var keycheck = metadatafield.charAt(0);
                        if (keycheck == "$") {
                            metadatafield = ConvertKeyLanguage(fields[i].fields[j].data);
                        }
                        data.push([metaheader, metadatafield])
                    }
                }


                var csvContent = "data:text/csv;charset=utf-8,";
                var blobContent = "";
                data.forEach(function(infoArray, index) {

                    dataString = infoArray.join(",");
                    csvContent += index < data.length ? dataString + "\n" : dataString;
                    blobContent += index < data.length ? dataString + "\n" : dataString;

                });
                var blob = new Blob([blobContent], {
                    type: 'text/csv;charset=utf-8;'
                });
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, assetName + "_Summary.csv");
                } else {
                    var encodedUri = encodeURI(csvContent);
                    var link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", assetName + "_Summary.csv");
                    document.body.appendChild(link);
                    link.click();
                }

            })

        };
    </script>

    <style>
        .mini-layout.fluid .mini-layout-sidebar,
        .mini-layout.fluid .mini-layout-header,
        .mini-layout.fluid .mini-layout-body {
            float: left;
        }
        
        .mini-layout.fluid .mini-layout-sidebar {
            background-color: #bbd8e9;
            width: 20%;
        }
        
        .panel-heading {
            padding: 3px 10px;
        }
        
        .panel-body {
            padding: 5px;
        }
        
        .panel {
            margin-bottom: 5px;
        }
        
        .survey-content {
            margin: 3px;
            float: left;
            width: 46%;
            height: 20px;
        }
        
        .table {
            margin-bottom: 0px !important;
        }
        /* switchgear */
        
        .switchgear-label-components {
            height: 10%;
        }
        
        div.switchgear-components {
            height: auto;
            color: white;
            background: #337ab7;
            border-color: #bce8f1;
            min-width: 5%;
            float: left;
            padding-bottom: 2%;
            padding-left: 1%;
            padding-right: 1%;
        }
        /* switchgear-layout */
        
        div.switchgear-layout {
            position: relative;
            white-space: nowrap;
            height: auto;
            padding-bottom: 2%;
        }
        
        #layout-container {
            width: 100%;
        }
        /* switchgear-layout-panels*/
        
        .switchgear-panel {
            height: auto;
            width: 120px;
            display: inline-block;
            white-space: normal;
            vertical-align: top;
        }
        
        .panel-component-shape {
            border: 1px solid gray;
            -webkit-border-radius: 6px;
            -moz-border-radius: 6px;
            border-radius: 6px;
            -webkit-box-shadow: 0 1px 2px rgba(0, 0, 0, .075);
            -moz-box-shadow: 0 1px 2px rgba(0, 0, 0, .075);
            box-shadow: 0 1px 2px rgba(0, 0, 0, .075);
        }
        
        #survey-name {
            text-align: center;
        }
        
        .panel-info>.panel-heading {
            background-image: linear-gradient(to bottom, #337ab7 0, #265a88 100%);
            color: white;
        }

        .form-check-label
        {
            font-weight: normal;
        }
    </style>
</body>

</html>
`;

export default workflowHTML;
