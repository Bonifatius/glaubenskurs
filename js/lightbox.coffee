class @Lightbox

  constructor: () ->
    window.addEventListener 'keyup', @keyup

    @closeOnBackground = false
    @createLightbox()

  createLightbox: () ->
    @lightbox.remove() if @lightbox
    @lightbox = document.body.appendChild $build "div", "id": "lightbox"

    @$close = @lightbox.appendChild $build 'a', 'href': '#', 'id': 'lightbox-close'
    @$close.addEventListener 'click', @close

    @$main = @lightbox.appendChild $build 'main'

    @lightbox.addEventListener 'click', (event) =>
      @close() if event.target == @lightbox && @closeOnBackground

    @hammer = new Hammer(@lightbox)

  getElement: () ->
    @lightbox

  keyup: (event) =>
    @close() if event.keyCode == 27

  close: (event) =>
    event?.preventDefault()
    @lightbox.classList.remove 'show'
    document.body.classList.remove 'noscroll'
    @closeOnBackground = false

  setContent: (content) ->
    @lightbox.classList.add 'show'
    document.body.classList.add 'noscroll'

    @$main.removeChild @current_content if @current_content

    console.log content
    if typeof content == "string"
      @current_content = $build 'div'
      @current_content.innerHTML = content
    else
      @current_content = content

    @$main.appendChild @current_content


class Lightbox.Gallery
  constructor: (@elements) ->
    window.addEventListener 'keyup', @keyup

    @createElement()

    for a in @elements when a.hasAttribute("href")
      a.addEventListener 'click', @click

  createElement: () ->
    @$element = $build 'div', 'id': 'lightbox-gallery'
    $navigation = @$element.appendChild $build 'div', 'id': 'lightbox-navigation', 'data-hello': 'world'
    $previous   = $navigation.appendChild $build 'a', 'href': '#'
    $previous.addEventListener 'click', @prev
    $next       = $navigation.appendChild $build 'a', 'href': '#'
    $next.addEventListener 'click', @next

    @$img       = @$element.appendChild $build 'img'

    lightbox.hammer.on 'swipeleft', @prev
    lightbox.hammer.on 'swiperight', @next

  show: (index) ->
    @currentIndex = index % @elements.length
    @currentIndex += @elements.length if @currentIndex < 0

    console.log ['show', @currentIndex]

    element = @elements[@currentIndex]
    console.log ['element', element]

    @$img.setAttribute 'src', element.getAttribute('href')

  keyup: (event) =>
    @next() if event.keyCode in [39, 74]
    @prev() if event.keyCode in [37, 75]

  next: (event)=>
    event?.preventDefault()
    @show(@currentIndex + 1)

  prev: (event) =>
    event?.preventDefault()
    @show(@currentIndex - 1)

  click: (event) =>
    event?.preventDefault()
    element = event.target
    element = element.parentElement if element.tagName == "IMG"

    lightbox.setContent @$element

    for el, element_index in @elements when element == el
      index = element_index
      @show index
      break

@$build = (type, attributes = {}) ->
  console.log ['creating', arguments]
  element = document.createElement type
  for attribute, value of attributes
    element.setAttribute attribute, value
  element


document.addEventListener "DOMContentLoaded", ->
  window.lightbox = new Lightbox()

  for gallery in document.getElementsByClassName 'gallery'
    new Lightbox.Gallery(gallery.children)

