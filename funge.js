var DEBUG, HEIGHT, OUTPUT, STATE, State, WIDTH, error, fact_prog, hello2_prog, hello3_prog, hello_prog, load, load_code, log, print, print_dashes, print_line, puts, quine_prog, reset_code, run, run_code, sys, test, tick_code;

DEBUG = false;

OUTPUT = 'alert';

WIDTH = 80;

HEIGHT = 25;

STATE = null;

run = function(code) {
  var state;
  state = new State();
  state.load(code);
  while (state.running) {
    state.tick();
  }
  return state.output;
};

State = (function() {

  function State() {
    this.code = '';
    this.reset();
  }

  State.prototype.load = function(code) {
    var c, x, y, _i, _len, _results;
    this.code = code;
    x = 0;
    y = 0;
    _results = [];
    for (_i = 0, _len = code.length; _i < _len; _i++) {
      c = code[_i];
      if (c === '\n') {
        x = 0;
        _results.push(y += 1);
      } else {
        this.set_instruction(x, y, c);
        _results.push(x += 1);
      }
    }
    return _results;
  };

  State.prototype.reset = function() {
    var x, y;
    this.area = (function() {
      var _results;
      _results = [];
      for (y = 0; 0 <= HEIGHT ? y <= HEIGHT : y >= HEIGHT; 0 <= HEIGHT ? y++ : y--) {
        _results.push((function() {
          var _results2;
          _results2 = [];
          for (x = 0; 0 <= WIDTH ? x <= WIDTH : x >= WIDTH; 0 <= WIDTH ? x++ : x--) {
            _results2.push(null);
          }
          return _results2;
        })());
      }
      return _results;
    })();
    this.pc = {
      x: 0,
      y: 0
    };
    this.delta = {
      x: 1,
      y: 0
    };
    this.stack = [];
    this.stringmode = false;
    this.running = true;
    this.output = '';
    this.generate_table();
    this.load(this.code);
    $("input#pcx").attr('value', this.pc.x);
    $("input#pcy").attr('value', this.pc.y);
    return $("input#instruction").attr('value', this.get_instruction(this.pc.x, this.pc.y));
  };

  State.prototype.generate_table = function() {
    var input, table, td, tr, x, y;
    table = $('<table>').attr('id', 'program').attr('cellspacing', 0);
    for (y = 0; 0 <= HEIGHT ? y <= HEIGHT : y >= HEIGHT; 0 <= HEIGHT ? y++ : y--) {
      tr = $('<tr>');
      for (x = 0; 0 <= WIDTH ? x <= WIDTH : x >= WIDTH; 0 <= WIDTH ? x++ : x--) {
        input = $('<input>');
        input.attr('id', "" + x + "x" + y);
        input.attr('value', ' ');
        input.attr('class', 'cell');
        input.attr('type', 'text');
        input.attr('maxlength', '1');
        this.area[y][x] = input;
        td = $('<td>').append(input);
        tr.append(td);
      }
      table.append(tr);
    }
    $('div#container').empty();
    return $('div#container').append(table);
  };

  State.prototype.update_html = function() {
    $("input#" + this.pc.x + "x" + this.pc.y).attr('class', 'cell_hilight');
    $("input#pcx").attr('value', this.pc.x);
    $("input#pcy").attr('value', this.pc.y);
    return $("input#instruction").attr('value', this.get_instruction(this.pc.x, this.pc.y));
  };

  State.prototype.get_instruction = function(x, y) {
    return this.area[y][x].attr('value');
  };

  State.prototype.set_instruction = function(x, y, value) {
    return this.area[y][x].attr('value', value);
  };

  State.prototype.tick = function() {
    this.execute_instruction(this.get_instruction(this.pc.x, this.pc.y));
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
        return this.not_op();
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

  State.prototype.not_op = function() {
    if (this.pop() === 0) {
      return this.push(1);
    } else {
      return this.push(0);
    }
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
    if (this.pop() === 0) {
      return this.delta = {
        x: 1,
        y: 0
      };
    } else {
      return this.delta = {
        x: -1,
        y: 0
      };
    }
  };

  State.prototype.vertical_if = function() {
    if (this.pop() === 0) {
      return this.delta = {
        x: 0,
        y: 1
      };
    } else {
      return this.delta = {
        x: 0,
        y: -1
      };
    }
  };

  State.prototype.duplicate_op = function() {
    var val;
    val = this.pop();
    this.push(val);
    return this.push(val);
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
    return this.push(this.get_instruction(x, y));
  };

  State.prototype.put_op = function() {
    var val, x, y;
    y = this.pop();
    x = this.pop();
    val = this.pop();
    return this.set_instruction(x, y, val);
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

fact_prog = '0&>:1-:v v *_$.@\n  ^    _$>\:^';

quine_prog = "01->1# +# :# 0# g# ,# :# 5# 8# *# 4# +# -# _@";

hello2_prog = '"!dlroW ,olleH">:#,_@';

hello3_prog = '<@_ #!,#:<"Hello, World!"';

test = function() {
  return run(hello_prog);
};

load = function() {
  return load_code(hello_prog);
};

run_code = function() {
  var _results;
  _results = [];
  while (STATE.running) {
    _results.push(tick_code());
  }
  return _results;
};

load_code = function(code) {
  STATE = new State();
  return STATE.load(code);
};

reset_code = function(code) {
  STATE.reset();
  return $("textarea#output").val(STATE.output);
};

tick_code = function() {
  if (STATE.running) {
    STATE.update_html();
    STATE.tick();
    return $("textarea#output").val(STATE.output);
  }
};

if (typeof window === 'undefined') {
  sys = require('sys');
  puts(test());
} else {
  window.addEventListener('load', load, false);
}
