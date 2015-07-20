window.Crypt = {
  decrypt: (password, secure) ->
    @log "decrypting", secure
    sjcl.decrypt password, secure

  encrypt: (password, data) ->
    encrypted = sjcl.encrypt password, data
    @log "encrypted", encrypted
    encrypted

  serializeUrlParameters: (data) ->
    (
      "#{key}=#{encodeURIComponent(value)}" for key, value of data when data.hasOwnProperty key
    ).join("&")

  deserializeUrlParameters: (string) ->
    data = {}
    for part in string.replace(/.*\?/, '').split('&')
      [key, value] = part.split('=')
      value = decodeURIComponent(value)
      intValue = parseInt(value)
      value = intValue if "#{intValue}" is value
      data[key] = value
    data

  encryptToUrlParams: (password, data) ->
    encryptedData = @encrypt password, data
    @serializeUrlParameters(JSON.parse(encryptedData))

  decryptFromUrlParams: (password, string) ->
    encryptedData = JSON.stringify(@deserializeUrlParameters(string))
    @decrypt password, encryptedData

  runTest: ->
    password = @randomString()
    data = @randomString()
    @log "random data", data
    encrypted = @encryptToUrlParams password, data
    result = @decryptFromUrlParams password, encrypted
    @log "decrypted data", result
    result == data

  randomString: (length=16) ->
    (String.fromCharCode(65+Math.floor(Math.random()*24)) for i in [0..length]).join("")

  log: (args...) ->
    console.log args if @logging

  logging: !false
}
