KEY_ESCAPE = 27

Lightbox.CryptUI = {
  askPassword: (crypt) ->
    @crypt = crypt

    if password = @getCookie()
      try
        @performDecrypt password

        return
      catch error
        console.error "invalid cookie: #{password}"

    @showModal()

  submitForm: (event) ->
    event.preventDefault()
    @cleanModal()
    console.log @$input
    try
      @performDecrypt @$input.value
      @setCookie @$input.value
      @$element.classList.add("success")

    catch error
      console.error error
      @$element.classList.add("error")
    return false

  performDecrypt: (password) ->
    decrypted = Crypt.decryptFromUrlParams(password, @crypt)
    console.log "going to #{decrypted}"
    location.href = decrypted

  cleanModal: ()->
    @$element.classList.remove("error")
    @$element.classList.remove("success")

  hideModal: ->
    @cleanModal()
    @$input.value = ""
    lightbox.close()

  createElement: ->
    @$element = $build 'div', 'id': 'password-modal'
    @$form    = @$element.appendChild $build 'form'
    @$form.addEventListener 'submit', (event) =>
      @submitForm(event)
    (@$form.appendChild $build 'label').innerText = 'Passwort'
    @$input = @$form.appendChild $build 'input', 'type': 'text'
    (@$form.appendChild $build 'button').innerText = 'Link öffnen'

    @cleanModal()
    @$element

  showModal: ->
    window.addEventListener 'keydown', => @cleanModal()
    @createElement() unless @$element
    lightbox.closeOnBackground = false
    lightbox.setContent @$element
    @$input.focus()

  setCookie: (password) ->
    document.cookie = "#{@COOKIE_KEY}=#{encodeURIComponent(password)}"

  getCookie: () ->
    return false unless @useCookies
    document.cookie.match(new RegExp("(?:^|.*;\\s*)#{@COOKIE_KEY}\\s*=\\s*([^;]*)"))?[1]

  removeCookie: () ->
    document.cookie = "#{@COOKIE_KEY}=#{encodeURIComponent(password)}; expires=Thu, 01 Jan 1970 00:00:00 GMT"

  COOKIE_KEY: "cryptkey",
  modalElement: false,
  useCookies: true
}

document.addEventListener "DOMContentLoaded", ->
  for a in document.getElementsByTagName("a") when a.hasAttribute("href")
    if a.getAttribute("href").match /\/guard\?(.*)/
      a.addEventListener 'click', (event) ->
        event.preventDefault()
        Lightbox.CryptUI.askPassword(@getAttribute("href"))
