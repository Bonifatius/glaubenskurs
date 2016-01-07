client = algoliasearch("E7UT30N10W", "bec4d0cb33345a4a53a3e1d72c275de0")
index = client.initIndex('glaubenskurs.bonifati.us')

$results = document.getElementById('searchResults')
searchCallback = (err, content) ->
  if(err)
    console.log err
    return err
  console.log content.hits
  $results.innerHTML = ''
  content.hits.forEach (hit) ->
    $results.appendChild buildSearchResult(hit)

$q = document.getElementById('q')
keyupTimeout = undefined
$q.addEventListener 'keyup', (event) ->
  term = $q.value
  clearTimeout(keyupTimeout) if keyupTimeout?
  keyupTimeout = setTimeout(performSearch.bind({term:term}), 500)

performSearch = () ->
  term = this.term
  if term?
    if term.length > 0
      index.search(term, searchCallback)
    else
      $results.innerHTML = ''


buildSearchResult = (hit) ->
  url = 'http://glaubenskurs.bonifati.us' + hit.url
  text = hit.text
  if hit._highlightResult.text?
    text = hit._highlightResult.text.value
  text = String(text).replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  $div = tag('div', {class: 'result'}, [
    tag('h3', {class: 'result__title'}, tag('a', { href: url }, hit.title)),
    tag('aspan', {class: 'result__url'},  tag('a', {href: url}, hit.url)),
    tag('div', { class: 'result__text'}, text)
    ])
