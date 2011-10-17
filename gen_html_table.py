print '''
<html>
<head>
  <title>Coffunge</title>

  <link rel="stylesheet" href="style.css" type="text/css" />
  <script type="text/javascript" src="jquery.js"></script>
  <script type="text/javascript" src="funge.js"></script>
</head>
<body>
  <form>
  <div id="state">
       PC: <input type="text" class="cell" id="pcx" maxlength="1" /> <input type="text" class="cell" id="pcy" maxlength="1" /> Instruction: <input type="text" class="cell" id="instruction" maxlength="1" /> 
  </div>
  <div id="container">
    <table cellspacing="0" cellpadding="0">'''

for y in range(0,25):
    print '      <tr>'
    for x in range(0,80):
        print '        <td><input type="text" class="cell" id="%dx%d" maxlength="1" /></td>' % (x, y)
    print '      </tr>'

print '''
    </table>
  </div>
  <div id="code_div">
    <h2>Code:</h2>
    <textarea id="code" cols="80" rows="10">
    </textarea>
    <br />
    <input type="button" value="Load Code" onclick="load_code()"> 
    <input type="button" value="Run program" onclick="run_code()">
    <input type="button" value="Tick" onclick="tick_code()">
  </div>
  <div id="output_div">
    <h2>Output:</h2>
    <textarea id="output" cols="80" rows="5">
    </textarea>
  </div>
  </form>
</body>
</html>
'''
