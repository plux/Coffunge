#
# Coffunge
#
# A Befunge-93 interpreter written in Coffeescript
#
# Author: Håkan Nilsson
#
sys = require 'sys'

DEBUG    = true
OUTPUT   = 'console'
WIDTH    = 80
HEIGHT   = 25

run = (code) ->
  log 'Running program'
  state = new State(code)
  while state.running
    if DEBUG
      state.print()
    state.tick()
  log 'Finished running program'

class State
  constructor: (@code) ->
    @pc    = {x: 0, y: 0}
    @delta = {x: 1, y: 0}
    @area  = ((' ' for x in [0..WIDTH]) for y in [0..HEIGHT])
    @stack = []
    @read_chars = false
    @running = true
    @output = ''
    x = 0
    y = 0
    for c in @code
      if c == '\n'
        x = 0
        y += 1
      else
        @area[y][x] = c
        x += 1

  print: ->
    print_dashes()
    for row in @area
      line = ""
      for char in row
        line += char
      print_line line
    print_dashes()
    print_line " PC: (#{@pc.x},#{@pc.y})" +
               " Delta: (#{@delta.x},#{@delta.y})" +
               " Read chars: (#{@read_chars})" +
               " Instruction: (#{@get_instruction()})"
    print_line ""
    print_line " Top of stack (total size: #{@stack.length}):"
    for item in @stack[0..5]
      print_line "   #{item}"
    print_line " Output:"
    @print_output()
    print_dashes()

  get_instruction: ->
    return @area[@pc.y][@pc.x]

  tick: ->
    ret = @execute_instruction(@get_instruction())
    @move_pc()
    return ret

  execute_instruction: (instruction) ->
    # Push characters to the stack when in read chars mode
    if @read_chars and instruction != '"'
      @push(instruction.charCodeAt(0))
      return

    # Push numbers to the stack
    if '0' <= instruction <= '9'
      @push(instruction)
      return

    switch instruction
      when '<' then @delta = {x:-1, y: 0}
      when 'v' then @delta = {x: 0, y: 1}
      when '^' then @delta = {x: 0, y:-1}
      when '>' then @delta = {x: 1, y: 0}
      when '"' then @read_chars = not @read_chars
      when ',' then @output_char(@pop())
      when ' ' then # Noop
      when '*' then @push(@pop() * @pop())
      when '+' then @push(@pop() + @pop())
      when '@' then @running = false
      else
        log "Fatal error! Unknown instruction: '#{instruction}'"
        @running = false

  push: (x) -> @stack.unshift(x)

  pop: -> @stack.shift()

  print_output: ->
    line = '   '
    for c in @output
      if c == '\n'
        print_line line
        line = '   '
      else
        line += c

    if line != '   '
      print_line line

  output_char: (c) ->
    if not DEBUG
      print String.fromCharCode(c)
    @output += String.fromCharCode(c)

  move_pc: ->
    @pc.x += @delta.x
    @pc.y += @delta.y
    if @pc.x < 0 then @pc.x = WIDTH
    if @pc.y < 0 then @pc.y = HEIGHT

print_dashes = () ->
  line = '+'
  for c in [0..WIDTH]
    line += '-'
  puts line + '+'

print_line = (line) ->
  while line.length <= WIDTH
    line += ' '
  puts "|#{line}|"

print = (s) ->
  if OUTPUT == 'console' then sys.print s

puts = (s) ->
  if OUTPUT == 'console' then sys.puts s

log = (s) ->
  if DEBUG then sys.puts 'LOG: ' + s

hello_prog = '''
<              v
v  ,,,,,"Hello"<
>48*,          v
v,,,,,,"World!"<
>25*,@
'''
test = () -> run(hello_prog)

test()
