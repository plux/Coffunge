var DEBUG, HEIGHT, OUTPUT, State, WIDTH, error, hello_prog, load, log, print, print_dashes, print_line, puts, run, run_code, sys, test;

DEBUG = false;

OUTPUT = 'alert';

WIDTH = 80;

HEIGHT = 25;

run = function(code) {
  var state;
  log('Running program');
  state = new State(code);
  while (state.running) {
    if (OUTPUT === 'sys') state.print();
    state.tick();
  }
  log('Finished running program');
  return state.output;
};

State = (function() {

  function State(code) {
    var x, y;
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
    this.stringmode = false;
    this.running = true;
    this.output = '';
    this.load(this.code);
  }

  State.prototype.load = function(code) {
    var c, x, y, _i, _len, _ref, _results;
    x = 0;
    y = 0;
    _ref = this.code;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      c = _ref[_i];
      if (c === '\n') {
        x = 0;
        _results.push(y += 1);
      } else {
        this.area[y][x] = c;
        _results.push(x += 1);
      }
    }
    return _results;
  };

  State.prototype.print = function() {
    var char, item, line, row, _i, _j, _k, _len, _len2, _len3, _ref, _ref2;
    print_dashes();
    _ref = this.area;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      row = _ref[_i];
      line = '';
      for (_j = 0, _len2 = row.length; _j < _len2; _j++) {
        char = row[_j];
        line += char;
      }
      print_line(line);
    }
    print_dashes();
    print_line((" PC: (" + this.pc.x + "," + this.pc.y + ")") + (" Delta: (" + this.delta.x + "," + this.delta.y + ")") + (" Stringmode: (" + this.stringmode + ")") + (" Instruction: (" + (this.get_instruction()) + ")"));
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
    this.execute_instruction(this.get_instruction());
    return this.move_pc();
  };

  State.prototype.execute_instruction = function(instruction) {
    if (this.stringmode && instruction !== '"') {
      this.push(instruction.charCodeAt(0));
      return;
    }
    if (('0' <= instruction && instruction <= '9')) {
      this.push(parseInt(instruction));
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
      case '?':
        return this.random_op();
      case '#':
        return this.move_pc();
      case '"':
        return this.stringmode = !this.stringmode;
      case ',':
        return this.output_char(this.pop());
      case '.':
        return this.output_int(this.pop());
      case '*':
        return this.push(this.pop() * this.pop());
      case '+':
        return this.push(this.pop() + this.pop());
      case '-':
        return this.minus_op();
      case '/':
        return this.div_op();
      case '%':
        return this.mod_op();
      case '!':
        return this.push(!this.pop);
      case '`':
        return this.gt_op();
      case '_':
        return this.horizontal_if();
      case '|':
        return this.vertical_if();
      case '$':
        return this.pop();
      case ':':
        return this.duplicate_op();
      case '\\':
        return this.swap_op();
      case 'g':
        return this.get_op();
      case 'p':
        return this.put_op();
      case ' ':
        break;
      case '@':
        return this.running = false;
      default:
        error(("Syntax error! Unknown instruction: '" + instruction + "' at ") + ("(x: " + this.pc.x + ", y: " + this.pc.y + ")"));
        return this.running = false;
    }
  };

  State.prototype.random_op = function() {
    var sign;
    if (Math.random() < 0.5) {
      sign = -1;
    } else {
      sign = 1;
    }
    if (Math.random() < 0.5) {
      return this.delta = {
        x: sign,
        y: 0
      };
    } else {
      return this.delta = {
        x: 0,
        y: sign
      };
    }
  };

  State.prototype.minus_op = function() {
    var a, b;
    a = this.pop();
    b = this.pop();
    return this.push(b - a);
  };

  State.prototype.div_op = function() {
    var a, b;
    a = this.pop();
    b = this.pop();
    return this.push(Math.floor(b / a));
  };

  State.prototype.mod_op = function() {
    var a, b;
    a = this.pop();
    b = this.pop();
    return this.push(b % a);
  };

  State.prototype.gt_op = function() {
    var a, b;
    a = this.pop();
    b = this.pop();
    if (b > a) {
      return this.push(1);
    } else {
      return this.push(0);
    }
  };

  State.prototype.horizontal_if = function() {
    if (this.pop()(!0)) {
      return this.delta = {
        x: -1,
        y: 0
      };
    } else {
      return this.delta = {
        x: 1,
        y: 0
      };
    }
  };

  State.prototype.vertical_if = function() {
    if (this.pop()(!0)) {
      return this.delta = {
        x: 0,
        y: -1
      };
    } else {
      return this.delta = {
        x: 0,
        y: 1
      };
    }
  };

  State.prototype.duplicate_op = function() {
    var x;
    x = this.pop();
    this.push(x);
    return this.push(x);
  };

  State.prototype.swap_op = function() {
    var a, b;
    a = this.pop();
    b = this.pop();
    this.push(a);
    return this.push(b);
  };

  State.prototype.get_op = function() {
    var x, y;
    y = this.pop();
    x = this.pop();
    this.push(this.area[y][x]);
    return log("get(x: " + x + ", y: " + y + ") '" + this.area[y][x] + "'");
  };

  State.prototype.put_op = function() {
    var val, x, y;
    y = this.pop();
    x = this.pop();
    val = this.pop();
    return this.area[y][x] = val;
  };

  State.prototype.push = function(x) {
    return this.stack.unshift(x);
  };

  State.prototype.pop = function() {
    if (this.stack.length > 0) {
      return this.stack.shift();
    } else {
      return 0;
    }
  };

  State.prototype.print_output = function() {
    var c, line, _i, _len, _ref;
    line = '';
    _ref = this.output;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      c = _ref[_i];
      if (c === '\n') {
        print_line('   ' + line);
        line = '';
      } else {
        line += c;
      }
    }
    if (line.length !== 0) return print_line('   ' + line);
  };

  State.prototype.output_char = function(c) {
    if (DEBUG === false) print(String.fromCharCode(c));
    return this.output += String.fromCharCode(c);
  };

  State.prototype.output_int = function(c) {
    if (DEBUG === false) print(c);
    return this.output += c;
  };

  State.prototype.move_pc = function() {
    this.pc.x += this.delta.x;
    this.pc.y += this.delta.y;
    if (this.pc.x < 0) {
      this.pc.x = WIDTH;
    } else if (this.pc.x > WIDTH) {
      this.pc.x = 0;
    }
    if (this.pc.y < 0) {
      return this.pc.y = HEIGHT;
    } else if (this.pc.y > HEIGHT) {
      return this.pc.y = 0;
    }
  };

  return State;

})();

print_dashes = function() {
  var c, line;
  line = '+';
  for (c = 0; 0 <= WIDTH ? c <= WIDTH : c >= WIDTH; 0 <= WIDTH ? c++ : c--) {
    line += '-';
  }
  return puts(line + '+');
};

print_line = function(line) {
  while (line.length <= WIDTH) {
    line += ' ';
  }
  return puts("|" + line + "|");
};

print = function(s) {
  switch (OUTPUT) {
    case 'console':
      return console.log(s);
    case 'alert':
      break;
    case 'sys':
      return sys.print(s);
  }
};

puts = function(s) {
  switch (OUTPUT) {
    case 'console':
      return console.log(s);
    case 'alert':
      return alert(s);
    case 'sys':
      return sys.puts(s);
  }
};

error = function(s) {
  return puts('ERROR: ' + s);
};

log = function(s) {
  if (DEBUG) return puts('LOG: ' + s);
};

hello_prog = '<              v\nv  ,,,,,"Hello"<\n>48*,          v\nv,,,,,,"World!"<\n>25*,@';

test = function() {
  return run(hello_prog);
};

load = function() {
  return $("textarea#code").val(hello_prog);
};

run_code = function() {
  var output;
  output = run($("textarea#code").val());
  return $("textarea#output").val(output);
};

if (typeof window === 'undefined') {
  sys = require('sys');
  test();
} else {
  window.addEventListener('load', load, false);
}
