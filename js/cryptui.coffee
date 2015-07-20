KEY_ESCAPE = 27

window.CryptUI = {

  askPassword: (crypt) ->
    @crypt = crypt

    if password = @getCookie()
      try
        @performDecrypt password

        return
      catch error
        console.error "deleting invalid cookie: #{password}"

    @showModal()

  submitForm: (event) ->
    @cleanModal()
    try
      @performDecrypt @input().value
      @setCookie @input().value
      @modalElement.classList.add("success")

    catch error
      console.error error
      @modalElement.classList.add("error")
    return false

  performDecrypt: (password) ->
    decrypted = Crypt.decryptFromUrlParams(password, @crypt)
    console.log "going to #{decrypted}"
    location.href = decrypted

  cleanModal: ()->
    @modalElement.classList.remove("error")
    @modalElement.classList.remove("success")

  input: ->
    @modalElement.getElementsByTagName("input")[0]

  hideModal: ->
    @modalElement.classList.remove("show")
    @cleanModal()
    @input.value = ""

  showModal: ->
    @modalElement = document.getElementById("password-modal") unless @modalElement
    unless @modalElement
      div = document.createElement "div"
      div.setAttribute "id", "password-modal"
      input = document.createElement "input"
      input.setAttribute "type", "text"
      label = document.createElement "label"
      label.innerText = "Passwort:"
      div.appendChild label
      div.appendChild input
      document.body.appendChild(div)
      @modalElement = div

    @modalElement.classList.add("show")
    @input().focus()

    window.addEventListener "keydown", (event) =>
      @cleanModal()
      @hideModal() if event.keyCode == KEY_ESCAPE

    @modalElement.getElementsByTagName("form")[0].addEventListener 'submit', (event) =>
      event.preventDefault()
      @submitForm(event)

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
        CryptUI.askPassword(@getAttribute("href"))
