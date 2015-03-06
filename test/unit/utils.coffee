#http://coffeescript.org/
#http://jasmine.github.io/edge/introduction.html

root = typeof window is 'object' && window ? window : global

type = do ->
  classToType = {}
  for prop in 'Boolean Number String Function Array Date RegExp Object'.split(' ')
    do (prop) ->
      classToType["[object #{prop}]"] = prop.toLowerCase()
  (obj) ->
    if obj == undefined or obj == null
      return String obj
    return classToType[Object::toString.call(obj)]

root.type = type

whenAll = ((args..., thenFn)->
  count = args.length
  callback = () ->
    count--
    if !count then return thenFn()

  if !count then return thenFn()
  for arg, idx in args
    arg callback
)

root.whenAll = whenAll

console.log "UTILS LOADED"