---
sitemap:
  exclude: true
---
document.addEventListener "DOMContentLoaded", ->

  navicon = document.getElementById 'navicon'
  mainNav = document.getElementById 'site-nav'

  navicon.addEventListener 'click', (event) ->
    mainNav.classList.toggle 'hidden'

@notificationbar = {

  show: (text, status='success') ->
    @element = document.getElementById('notificationbar')
    @element.innerHTML = text
    @element.classList.add 'show'
    @element.addEventListener 'click', =>
      @element.classList.remove 'show'

}

{% include_relative crypt.coffee %}
{% include_relative lightbox.coffee %}
{% include_relative cryptui.coffee %}
{% include_relative subscribe.coffee %}

