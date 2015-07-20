class @Lightbox

  constructor: (@element, @padding = 16) ->
    console.log 'initializing new lightbox...'
    @elements = @element.children
    for a in @elements when a.hasAttribute("href")
      a.addEventListener 'click', @click

    window.addEventListener 'keyup', @keyup

    @createLightbox()
    return this

  createLightbox: () ->
    console.log ['initial lightbox', @lightbox]
    @lightbox = document.getElementById("lightbox") unless @lightbox
    console.log ['second step', @lightbox]
    unless @lightbox
      console.log 'creating html element'
      @lightbox = document.createElement "div"
      @lightbox.setAttribute "id", "lightbox"
      @lightbox.innerHTML = """
      <a href="#" id="lightbox-close">X</a>
      <main id="lightbox-main">
        <div id="lightbox-navigation">
          <a href="#" id="lightbox-prev"></a>
          <a href="#" id="lightbox-next"></a>
        </div>
        <img />
      </main>
      """
      document.body.appendChild @lightbox

    @lightbox.addEventListener 'click', (event) =>
      console.log event
      @close(true) if event.target == @lightbox
    @main = document.getElementById 'lightbox-main'
    @img = @main.getElementsByTagName('img')[0]
    @$previous = document.getElementById 'lightbox-prev'
    @$previous.addEventListener 'click', => @prev()
    @$next = document.getElementById 'lightbox-next'
    @$next.addEventListener 'click', => @next()
    @$close = document.getElementById 'lightbox-close'
    @$close.addEventListener 'click', => @close()


  keyup: (event) =>
    @close(true) if event.keyCode == 27
    @next() if event.keyCode in [39, 74]
    @prev() if event.keyCode in [37, 75]

  next: =>
    event.preventDefault()
    @show(@currentIndex + 1)

  prev: =>
    event.preventDefault()
    @show(@currentIndex - 1)

  show: (index) ->
    @currentIndex = index % @elements.length
    @currentIndex += @elements.length if @currentIndex < 0

    console.log ['show', @currentIndex]

    element = @elements[@currentIndex]
    console.log ['element', element]

    @img.setAttribute 'src', element.getAttribute('href')
    @lightbox.classList.add 'show'

  click: (event) =>
    event.preventDefault()
    element = event.target
    element = element.parentElement if element.tagName == "IMG"

    console.log ["click event on", element]

    for el, element_index in @elements when element == el
      index = element_index
      @show index
      break

  close: (animate = true) ->
    @lightbox.classList.remove 'show'

document.addEventListener "DOMContentLoaded", ->
  for gallery in document.getElementsByClassName 'gallery'
    new Lightbox(gallery)
