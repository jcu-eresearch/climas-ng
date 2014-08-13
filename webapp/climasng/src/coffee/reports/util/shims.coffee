
unless Array.prototype.forEach
    # shim in a minimal forEach implementation for sassafrassin' IE
    Array.prototype.forEach = (fn, scope)->
        (fn.call(scope, this[i], i, this) if i in this) for i in [0..this.length]


unless Array.prototype.indexOf
    # shim in a limited indexOf implementation, also for IE
    Array.prototype.indexOf = (needle)->
        # not supporting starting index
        (return i if this[i] == needle) for i in [0..this.length]
        return -1
