(function() {
  var DEBUG, HEIGHT, OUTPUT, State, WIDTH, hello_prog, log, print, print_dashes, print_line, run, test;

  DEBUG = true;

  OUTPUT = 'console';

  WIDTH = 80;

  HEIGHT = 25;

  run = function(code) {
    var state;
    log('Running program');
    state = new State(code);
    while (state.running === true) {
      state.print();
      state.tick();
    }
    return log('Finished running program');
  };

  State = (function() {

    function State(code) {
      var c, x, y, _i, _len, _ref;
      this.code = code;
      this.pc = {
        x: 0,
        y: 0
      };
      this.delta = {
        x: 1,
        y: 0
      };
      this.area = (function() {
        var _results;
        _results = [];
        for (y = 0; 0 <= HEIGHT ? y <= HEIGHT : y >= HEIGHT; 0 <= HEIGHT ? y++ : y--) {
          _results.push((function() {
            var _results2;
            _results2 = [];
            for (x = 0; 0 <= WIDTH ? x <= WIDTH : x >= WIDTH; 0 <= WIDTH ? x++ : x--) {
              _results2.push(' ');
            }
            return _results2;
          })());
        }
        return _results;
      })();
      this.stack = [];
      this.read_chars = false;
      this.running = true;
      this.output = '';
      x = 0;
      y = 0;
      _ref = this.code;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (c === '\n') {
          x = 0;
          y += 1;
        } else {
          this.area[y][x] = c;
          x += 1;
        }
      }
    }

    State.prototype.print = function() {
      var char, item, line, row, _i, _j, _k, _len, _len2, _len3, _ref, _ref2;
      print_dashes();
      _ref = this.area;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        line = "";
        for (_j = 0, _len2 = row.length; _j < _len2; _j++) {
          char = row[_j];
          line += char;
        }
        print_line(line);
      }
      print_dashes();
      print_line((" PC: (" + this.pc.x + "," + this.pc.y + ")") + (" Delta: (" + this.delta.x + "," + this.delta.y + ")") + (" Read chars: (" + this.read_chars + ")") + (" Instruction: (" + (this.get_instruction()) + ")"));
      print_line("");
      print_line(" Top of stack (total size: " + this.stack.length + "):");
      _ref2 = this.stack.slice(0, 6);
      for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
        item = _ref2[_k];
        print_line("   " + item);
      }
      print_line(" Output:");
      this.print_output();
      return print_dashes();
    };

    State.prototype.get_instruction = function() {
      return this.area[this.pc.y][this.pc.x];
    };

    State.prototype.tick = function() {
      var ret;
      ret = this.execute_instruction(this.get_instruction());
      this.move_pc();
      return ret;
    };

    State.prototype.execute_instruction = function(instruction) {
      if (this.read_chars && instruction !== '"') {
        this.push(instruction.charCodeAt(0));
        return;
      }
      if (('0' <= instruction && instruction <= '9')) {
        this.push(instruction);
        return;
      }
      switch (instruction) {
        case '<':
          return this.delta = {
            x: -1,
            y: 0
          };
        case 'v':
          return this.delta = {
            x: 0,
            y: 1
          };
        case '^':
          return this.delta = {
            x: 0,
            y: -1
          };
        case '>':
          return this.delta = {
            x: 1,
            y: 0
          };
        case '"':
          return this.read_chars = !this.read_chars;
        case ',':
          return this.output_char(this.pop());
        case ' ':
          break;
        case '*':
          return this.push(this.pop() * this.pop());
        case '+':
          return this.push(this.pop() + this.pop());
        case '@':
          return this.running = false;
        default:
          log("Fatal error! Unknown instruction: '" + instruction + "'");
          return this.running = false;
      }
    };

    State.prototype.push = function(x) {
      return this.stack.unshift(x);
    };

    State.prototype.pop = function() {
      return this.stack.shift();
    };

    State.prototype.print_output = function() {
      var c, line, _i, _len, _ref;
      line = '   ';
      _ref = this.output;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (c === '\n') {
          print_line(line);
          line = '   ';
        } else {
          line += c;
        }
      }
      if (line !== '   ') return print_line(line);
    };

    State.prototype.output_char = function(c) {
      return this.output += String.fromCharCode(c);
    };

    State.prototype.move_pc = function() {
      this.pc.x += this.delta.x;
      this.pc.y += this.delta.y;
      if (this.pc.x < 0) this.pc.x = WIDTH;
      if (this.pc.y < 0) return this.pc.y = HEIGHT;
    };

    return State;

  })();

  print_dashes = function() {
    var c, line;
    line = '+';
    for (c = 0; 0 <= WIDTH ? c <= WIDTH : c >= WIDTH; 0 <= WIDTH ? c++ : c--) {
      line += '-';
    }
    return print(line + '+');
  };

  print_line = function(line) {
    while (line.length <= WIDTH) {
      line += ' ';
    }
    return print("|" + line + "|");
  };

  print = function(s) {
    if (OUTPUT === 'console') return console.log(s);
  };

  log = function(s) {
    if (DEBUG) return console.log('LOG: ' + s);
  };

  hello_prog = '<              v\nv  ,,,,,"Hello"<\n>48*,          v\nv,,,,,,"World!"<\n>25*,@';

  test = function() {
    return run(hello_prog);
  };

  test();

}).call(this);
