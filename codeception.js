/**
 * Parse source and update TestCase. Throw an exception if any error occurs.
 *
 * @param testCase TestCase to update
 * @param source The source to parse
 */
function parse(testCase, source) {
	var doc = source;
  var commands = [];
  testCase.header = this.options.header;
  testCase.footer = '';
  while (doc.length > 0) {
    var line = /(.*)(\r\n|[\r\n])?/.exec(doc);
    if (line[1] && line[1].match(/^\|/)) {
      var array = line[1].split(/\|/);
      if (array.length >= 3) {
        var command = new Command();
        command.command = array[1];
        command.target = array[2];
        if (array.length > 3) command.value = array[3];
        commands.push(command);
      }
      testCase.footer = '';
    } else if (commands.length == 0) {
      testCase.header += line[0];
    } else {
      testCase.footer += line[0];
    }
    doc = doc.substr(line[0].length);
  }
  testCase.setCommands(commands);
}

/**
 * Format TestCase and return the source.
 *
 * @param testCase TestCase to format
 * @param name The name of the test case, if any. It may be used to embed title into the source.
 */
function format(testCase, name) {

  var className = testCase.getTitle();
  if (!className) {
    className = "NewTest";
  }


 /* var formatLocal = testCase.formatLocal(this.name);
  methodName = testMethodName(className.replace(/Test$/, "").replace(/^Test/, "").
                replace(/^[A-Z]/, function(str) { return str.toLowerCase(); }));*/

    var header = options.header.
    replace(/\$\{baseURL\}/g, testCase.getBaseURL()).
    replace(/\$\{([a-zA-Z0-9_]+)\}/g, function(str, name) { return options[name]; });

  /*var header = options.header.
    replace(/\$\{className\}/g, className).
    replace(/\$\{methodName\}/g, methodName).
    replace(/\$\{baseURL\}/g, testCase.getBaseURL()).
    replace(/\$\{([a-zA-Z0-9_]+)\}/g, function(str, name) { return options[name]; });*/

	 var result = header;
  result += formatCommands(testCase.commands);
  if (testCase.footer) result += testCase.footer;
  return result;

}

/**
 * Format an array of commands to the snippet of source.
 * Used to copy the source into the clipboard.
 *
 * @param The array of commands to sort.
 */
function formatCommands(commands) {
	var result = '';
  for (var i = 0; i < commands.length; i++) {
    var command = commands[i];
    if (command.type == 'command') {

      var codeceptionCommand = '';

      //Switch command and replace with codeception varient
      switch (command.command) {
        case 'open':
          result += '$I->amOnPage("'+command.target+'");\n';
          break;
        case 'click':
        case 'clickAndWait':
          var target = getSelector(command.target);
          result += '$I->click("'+target+'");\n';
          break;
        case 'select':
          var target = getSelector(command.target);
          var value = command.value.split('=')[1];

          result += '$I->selectOption("'+target+'", "'+value+'");\n';
          break;
        case 'sendKeys':
          var target = getSelector(command.target);
          result += '$I->fillField("'+target+'", "'+command.value+'");\n';
          break;
        case 'assertText':
          var target = getSelector(command.target);
          result += '$I->see("'+command.value+'", "'+target+'");\n';
          break;
          default:
          result += '$I->' + command.command + '====' + command.target + '|' + command.value + "|\n";
      }

      
    }
  }
  return result;
}

function getSelector(target) {

  //Check for xparth
  if (target.substring(0, 2) === '//') {
    return target;
  } else {


    var parts = target.split('=');
    switch(parts[0]) {
      case 'id':
          return "#"+parts[1];
        break;
      case 'css':
          return parts[1];
        break;
      case 'name':
        return 'input[name='+parts[1]+']';
        break;
      case 'link':
        return parts[1];
        break;
      default:
        alert('unknown selector: '+parts[0]+'  value: '+parts[1]);
    }
  }
}

/*
 * Optional: The customizable option that can be used in format/parse functions.
 */
options = {
  header: '<?php\n' +
    '$I = new WebGuy($scenario);\n' +
    '$I->wantTo("perform actions and see result");\n' +
    '$I->amOnPage("${baseURL}");\n\n'
}

/*
 * Optional: XUL XML String for the UI of the options dialog
 */
//configForm = '<textbox id="options_nameOfTheOption"/>'