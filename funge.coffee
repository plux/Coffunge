#
# Coffunge
#
# A Befunge-93 interpreter written in Coffeescript
#
# Author: Håkan Nilsson
#

DEBUG    = off
OUTPUT   = 'alert'

run = (code) ->
  log 'Running program'
  state = new State()
  state.load(code)
  state.print_html()
  while state.running
    if OUTPUT is 'sys' then state.print()
    state.tick()
  log 'Finished running program'
  state.output

class State
  constructor: () ->
    @pc         = x: 0, y: 0
    @delta      = x: 1, y: 0
    @area       = (' ' for x in [0..WIDTH] for y in [0..HEIGHT])
    @stack      = []
    @stringmode = false
    @running    = true
    @output     = ''

  load: (code) ->
    x = 0
    y = 0
    for c in code
      if c is '\n'
        x = 0
        y += 1
      else
        @area[y][x] = c
        x += 1

  print: ->
    print_dashes()
    for row in @area
      line = ''
      line += char for char in row
      print_line line
    print_dashes()
    print_line " PC: (#{@pc.x},#{@pc.y})" +
               " Delta: (#{@delta.x},#{@delta.y})" +
               " Stringmode: (#{@stringmode})" +
               " Instruction: (#{@get_instruction()})"
    print_line ""
    print_line " Top of stack (total size: #{@stack.length}):"
    print_line "   #{item}" for item in @stack[0..5]
    print_line " Output:"
    @print_output()
    print_dashes()

  print_html: ->
    log "printing html"
    for y in [0..HEIGHT]
      for x in [0..WIDTH]
        $("input##{x}x#{y}").attr('value', @area[y][x])
        $("input##{x}x#{y}").attr('class', 'cell')

  update_html: ->
    $("input##{@pc.x}x#{@pc.y}").attr('class', 'cell_hilight')
    $("input#pcx").attr('value', @pc.x)
    $("input#pcy").attr('value', @pc.y)
    $("input#instruction").attr('value', @get_instruction())

  get_instruction: -> @area[@pc.y][@pc.x]

  tick: ->
    @execute_instruction(@get_instruction())
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
    @push @area[y][x]
    log "get(x: #{x}, y: #{y}) '#{@area[y][x]}'"

  put_op: () ->
    y   = @pop()
    x   = @pop()
    val = @pop()
    @area[y][x] = val

  push: (x) -> @stack.unshift x

  pop: ->
    if @stack.length > 0
      @stack.shift()
    else
      0

  print_output: ->
    line = ''
    for c in @output
      if c is '\n'
        print_line '   ' + line
        line = ''
      else
        line += c

    if line.length isnt 0 then print_line '   ' + line

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
  $("textarea#code").val(hello_prog)

run_code = () ->
  load_code()
  tick_code() while STATE.running

load_code = () ->
  code = $("textarea#code").val()
  STATE = new State()
  STATE.load(code)
  STATE.print_html()
  $("textarea#output").val(STATE.output)

tick_code = () ->
  if STATE.running
    STATE.update_html()
    STATE.tick()
    $("textarea#output").val(STATE.output)

if typeof window is 'undefined'
  sys = require 'sys'
  test()
else
  window.addEventListener('load', load, false)
