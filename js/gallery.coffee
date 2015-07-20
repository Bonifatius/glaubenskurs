# Gallery

class Gallery
  constructor: (@element) ->
    @createLightbox()
    for a in @element.children when a.hasAttribute("href")
      a.addEventListener 'click', @click

    window.addEventListener "keydown", (event) =>
      @hideLightbox() if event.keyCode == KEY_ESCAPE

  createLightbox: ->
    @lightbox = document.getElementById("lightbox") unless @lightbox
    unless @lightbox
      @lightbox = document.createElement "div"
      @lightbox.setAttribute "id", "lightbox"
      @lightbox.innerHTML = """
      <a href="#" id="lightbox-close">X</a>
      <div id="lightbox-navigation">
        <a href="#"></a>
        <a href="#"></a>
      </div>
      <main id="lightbox-main">
      </main>
      """
      @lightboxImg = document.createElement "img"
      @lightbox.appendChild(@lightboxImg)
      document.body.appendChild(@lightbox)
      @lightboxMain = document.getElementById 'lightbox-main'
      @lightboxNavigation = document.getElementById 'lightbox-navigation'
      @lightboxClose = document.getElementById 'lightbox-close'

  hideLightbox: ->
    @lightbox.classList.remove('show')

  open: (url) ->
    @lightboxImg.setAttribute('src', url)
    @lightbox.classList.add('show')

  # Events
  click: (event) =>
    event.preventDefault()
    console.log event
    @open a.getAttribute('href')


document.addEventListener "DOMContentLoaded", ->
  for div in document.getElementsByClassName("gallery")
    gallery = new Gallery div
