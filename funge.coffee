#
# Coffunge
#
# A Befunge-93 interpreter written in Coffeescript
#
# Author: Håkan Nilsson
#

DEBUG    = off
OUTPUT   = 'alert'
WIDTH    = 80
HEIGHT   = 25
STATE    = null

run = (code) ->
  state = new State()
  state.load(code)
  while state.running
    state.tick()
  state.output

class State
  constructor: () ->
    @code       = ''
    @reset()

  load: (@code) ->
    x = 0
    y = 0
    for c in code
      if c is '\n'
        x = 0
        y += 1
      else
        @set_instruction(x, y, c)
        x += 1

  reset: ->
    @area       = (null for x in [0..WIDTH] for y in [0..HEIGHT])
    @pc         = x: 0, y: 0
    @delta      = x: 1, y: 0
    @stack      = []
    @stringmode = false
    @running    = true
    @output     = ''
    @generate_table()
    @load(@code)
    $("input#pcx").attr('value', @pc.x)
    $("input#pcy").attr('value', @pc.y)
    $("input#instruction").attr('value', @get_instruction(@pc.x, @pc.y))

  generate_table: ->
    table = $('<table>').attr('id', 'program').attr('cellspacing', 0)
    for y in [0..HEIGHT]
      tr = $('<tr>')
      for x in [0..WIDTH]
        input = $('<input>')
        input.attr('id', "#{x}x#{y}")
        input.attr('value', ' ')
        input.attr('class', 'cell')
        input.attr('type', 'text')
        input.attr('maxlength', '1')
        @area[y][x] = input
        td = $('<td>').append(input)
        tr.append(td)
      table.append(tr)
    $('div#container').empty()
    $('div#container').append(table)

  update_html: ->
    $("input##{@pc.x}x#{@pc.y}").attr('class', 'cell_hilight')
    $("input#pcx").attr('value', @pc.x)
    $("input#pcy").attr('value', @pc.y)
    $("input#instruction").attr('value', @get_instruction(@pc.x, @pc.y))

  get_instruction: (x, y) -> @area[y][x].attr('value')

  set_instruction: (x, y, value) -> @area[y][x].attr('value', value)

  tick: ->
    @execute_instruction(@get_instruction(@pc.x, @pc.y))
    @move_pc()

  execute_instruction: (instruction) ->
    # Push characters to the stack when in read chars mode
    if @stringmode and instruction isnt '"'
      @push instruction.charCodeAt 0
      return

    # Push numbers to the stack
    if '0' <= instruction <= '9'
      @push parseInt instruction
      return

    switch instruction
      # PC movement
      when '<' then @delta = x:-1, y: 0
      when 'v' then @delta = x: 0, y: 1
      when '^' then @delta = x: 0, y:-1
      when '>' then @delta = x: 1, y: 0
      when '?' then @random_op()
      # Skip next instruction
      when '#' then @move_pc()
      # Toggle stringmode
      when '"' then @stringmode = not @stringmode
      # I/O
      when ',' then @output_char @pop()
      when '.' then @output_int @pop()
      # Arithmetic operators
      when '*' then @push(@pop() * @pop())
      when '+' then @push(@pop() + @pop())
      when '-' then @minus_op()
      when '/' then @div_op()
      when '%' then @mod_op()
      # Logical operators
      when '!' then @not_op()
      when '`' then @gt_op()
      when '_' then @horizontal_if()
      when '|' then @vertical_if()
      # Stack operators
      when '$' then @pop()
      when ':' then @duplicate_op()
      when '\\' then @swap_op()
      # Get
      when 'g' then @get_op()
      # Put
      when 'p' then @put_op()
      # Noop, Chuck Testa!
      when ' ' then
      # Quit
      when '@' then @running = false
      else
        error "Syntax error! Unknown instruction: '#{instruction}' at " +
            "(x: #{@pc.x}, y: #{@pc.y})"
        @running = false

  random_op: () ->
    # Decide if negative or positive
    if Math.random() < 0.5
      sign = -1
    else
      sign = 1
    # Decide if x or y
    if Math.random() < 0.5
      @delta = x: sign, y: 0
    else
      @delta = x: 0, y: sign

  minus_op: () ->
    a = @pop()
    b = @pop()
    @push (b - a)

  div_op: () ->
    a = @pop()
    b = @pop()
    @push Math.floor(b / a)

  mod_op: () ->
    a = @pop()
    b = @pop()
    @push (b % a)

  not_op: () ->
    if @pop() is 0
      @push 1
    else
      @push 0
  gt_op: () ->
    a = @pop()
    b = @pop()
    if b > a
      @push 1
    else
      @push 0

  horizontal_if: () ->
    if @pop() is 0
      @delta = x: 1, y: 0
    else
      @delta = x: -1, y: 0

  vertical_if: () ->
    if @pop() is 0
      @delta = x: 0, y: 1
    else
      @delta = x: 0, y: -1

  duplicate_op: () ->
    val = @pop()
    @push val
    @push val

  swap_op: () ->
    a = @pop()
    b = @pop()
    @push a
    @push b

  get_op: () ->
    y = @pop()
    x = @pop()
    @push @get_instruction(x, y)

  put_op: () ->
    y   = @pop()
    x   = @pop()
    val = @pop()
    @set_instruction(x, y, val)

  push: (x) -> @stack.unshift x

  pop: ->
    if @stack.length > 0
      @stack.shift()
    else
      0

  output_char: (c) ->
    if DEBUG is off then print String.fromCharCode(c)
    @output += String.fromCharCode(c)

  output_int: (c) ->
    if DEBUG is off then print c
    @output += c


  move_pc: ->
    @pc.x += @delta.x
    @pc.y += @delta.y
    if      @pc.x < 0      then @pc.x = WIDTH
    else if @pc.x > WIDTH  then @pc.x = 0
    if      @pc.y < 0      then @pc.y = HEIGHT
    else if @pc.y > HEIGHT then @pc.y = 0

print_dashes = () ->
  line = '+'
  line += '-' for c in [0..WIDTH]
  puts line + '+'

print_line = (line) ->
  line += ' ' while line.length <= WIDTH
  puts "|#{line}|"

print = (s) ->
  switch OUTPUT
    when 'console' then console.log s
    when 'alert'   then
    when 'sys'     then sys.print s

puts = (s) ->
  switch OUTPUT
    when 'console' then console.log s
    when 'alert'   then alert s
    when 'sys'     then sys.puts s

error = (s) ->
  puts 'ERROR: ' + s

log = (s) ->
  if DEBUG
    puts 'LOG: ' + s

hello_prog = '''
<              v
v  ,,,,,"Hello"<
>48*,          v
v,,,,,,"World!"<
>25*,@
'''

fact_prog = '''
0&>:1-:v v *_$.@
  ^    _$>\:^
'''

quine_prog = "01->1# +# :# 0# g# ,# :# 5# 8# *# 4# +# -# _@"

hello2_prog = '"!dlroW ,olleH">:#,_@'
hello3_prog = '<@_ #!,#:<"Hello, World!"'

test = () -> run(hello_prog)

load = ->
  load_code(hello_prog)

run_code = () ->
  tick_code() while STATE.running

load_code = (code) ->
  STATE = new State()
  STATE.load(code)

reset_code = (code) ->
  STATE.reset()
  $("textarea#output").val(STATE.output)

tick_code = () ->
  if STATE.running
    STATE.update_html()
    STATE.tick()
    $("textarea#output").val(STATE.output)

if typeof window is 'undefined'
  sys = require 'sys'
  puts test()
else
  window.addEventListener('load', load, false)
