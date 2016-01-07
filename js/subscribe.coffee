class @Subscribe
  constructor: (@element) ->
    @element.addEventListener 'submit', @submit
    @baseUrl = @element.getAttribute('action').replace('/post?', '/post-json?')

  mailValue: () ->
    document.getElementById("subscribe-mail").value

  url: () ->
    "#{@baseUrl}&EMAIL=#{encodeURIComponent(@mailValue())}&c="

  submit: (event) =>
    event.preventDefault()

    jsonpRequest.request(@url(), @callback)

  callback: (data) =>
    console.log data
    if data.result == 'success'
      notificationbar.show 'Danke für deine Anmeldung zu unserem Mailverteiler. Wir haben dir eine Mail mit einem Link geschickt. Den musst du noch klicken um die Anmeldung abzuschließen.'


@jsonpRequest = {
  numCallbacks: 0,
  request: (url, callback) ->
    cbid = "callback#{jsonpRequest.numCallbacks++}"
    this[cbid] = callback

    if url.charAt(url.length - 1) != '='
      url += if url.indexOf('?') then '&' else '?'
      url += 'callback'

    url += "jsonpRequest.#{cbid}"
    console.log "jsonprequest #{url}"
    script = document.createElement 'script'
    script.setAttribute 'src', url
    script.setAttribute 'type', 'text/javascript'
    script.setAttribute 'data-jsonp-callback', cbid
    document.body.appendChild(script)
}


document.addEventListener "DOMContentLoaded", ->
  new Subscribe(document.getElementById('subscribe-form'))
