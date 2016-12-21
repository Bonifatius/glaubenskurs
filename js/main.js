(function() {
  var $q, $results, KEY_ESCAPE, buildSearchResult, client, index, keyupTimeout, performSearch, searchCallback,
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  document.addEventListener("DOMContentLoaded", function() {
    var mainNav, navicon;
    navicon = document.getElementById('navicon');
    mainNav = document.getElementById('site-nav');
    return navicon.addEventListener('click', function(event) {
      return mainNav.classList.toggle('hidden');
    });
  });

  this.notificationbar = {
    show: function(text, status) {
      if (status == null) {
        status = 'success';
      }
      this.element = document.getElementById('notificationbar');
      this.element.innerHTML = text;
      this.element.classList.add('show');
      return this.element.addEventListener('click', (function(_this) {
        return function() {
          return _this.element.classList.remove('show');
        };
      })(this));
    }
  };

  window.Crypt = {
    decrypt: function(password, secure) {
      this.log("decrypting", secure);
      return sjcl.decrypt(password, secure);
    },
    encrypt: function(password, data) {
      var encrypted;
      encrypted = sjcl.encrypt(password, data);
      this.log("encrypted", encrypted);
      return encrypted;
    },
    serializeUrlParameters: function(data) {
      var key, value;
      return ((function() {
        var results;
        results = [];
        for (key in data) {
          value = data[key];
          if (data.hasOwnProperty(key)) {
            results.push(key + "=" + (encodeURIComponent(value)));
          }
        }
        return results;
      })()).join("&");
    },
    deserializeUrlParameters: function(string) {
      var data, intValue, j, key, len, part, ref, ref1, value;
      data = {};
      ref = string.replace(/.*\?/, '').split('&');
      for (j = 0, len = ref.length; j < len; j++) {
        part = ref[j];
        ref1 = part.split('='), key = ref1[0], value = ref1[1];
        value = decodeURIComponent(value);
        intValue = parseInt(value);
        if (("" + intValue) === value) {
          value = intValue;
        }
        data[key] = value;
      }
      return data;
    },
    encryptToUrlParams: function(password, data) {
      var encryptedData;
      encryptedData = this.encrypt(password, data);
      return this.serializeUrlParameters(JSON.parse(encryptedData));
    },
    decryptFromUrlParams: function(password, string) {
      var encryptedData;
      encryptedData = JSON.stringify(this.deserializeUrlParameters(string));
      return this.decrypt(password, encryptedData);
    },
    runTest: function() {
      var data, encrypted, password, result;
      password = this.randomString();
      data = this.randomString();
      this.log("random data", data);
      encrypted = this.encryptToUrlParams(password, data);
      result = this.decryptFromUrlParams(password, encrypted);
      this.log("decrypted data", result);
      return result === data;
    },
    randomString: function(length) {
      var i;
      if (length == null) {
        length = 16;
      }
      return ((function() {
        var j, ref, results;
        results = [];
        for (i = j = 0, ref = length; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
          results.push(String.fromCharCode(65 + Math.floor(Math.random() * 24)));
        }
        return results;
      })()).join("");
    },
    log: function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (this.logging) {
        return console.log(args);
      }
    },
    logging: !false
  };

  this.Lightbox = (function() {
    function Lightbox() {
      this.close = bind(this.close, this);
      this.keyup = bind(this.keyup, this);
      window.addEventListener('keyup', this.keyup);
      this.closeOnBackground = false;
      this.createLightbox();
    }

    Lightbox.prototype.createLightbox = function() {
      if (this.lightbox) {
        this.lightbox.remove();
      }
      this.lightbox = document.body.appendChild($build("div", {
        "id": "lightbox"
      }));
      this.$close = this.lightbox.appendChild($build('a', {
        'href': '#',
        'id': 'lightbox-close'
      }));
      this.$close.addEventListener('click', this.close);
      this.$main = this.lightbox.appendChild($build('main'));
      this.lightbox.addEventListener('click', (function(_this) {
        return function(event) {
          if (event.target === _this.lightbox && _this.closeOnBackground) {
            return _this.close();
          }
        };
      })(this));
      return this.hammer = new Hammer(this.lightbox);
    };

    Lightbox.prototype.getElement = function() {
      return this.lightbox;
    };

    Lightbox.prototype.keyup = function(event) {
      if (event.keyCode === 27) {
        return this.close();
      }
    };

    Lightbox.prototype.close = function(event) {
      if (event != null) {
        event.preventDefault();
      }
      this.lightbox.classList.remove('show');
      document.body.classList.remove('noscroll');
      return this.closeOnBackground = false;
    };

    Lightbox.prototype.setContent = function(content) {
      this.lightbox.classList.add('show');
      document.body.classList.add('noscroll');
      if (this.current_content) {
        this.$main.removeChild(this.current_content);
      }
      console.log(content);
      if (typeof content === "string") {
        this.current_content = $build('div');
        this.current_content.innerHTML = content;
      } else {
        this.current_content = content;
      }
      return this.$main.appendChild(this.current_content);
    };

    return Lightbox;

  })();

  Lightbox.Gallery = (function() {
    function Gallery(elements) {
      var a, j, len, ref;
      this.elements = elements;
      this.click = bind(this.click, this);
      this.prev = bind(this.prev, this);
      this.next = bind(this.next, this);
      this.keyup = bind(this.keyup, this);
      window.addEventListener('keyup', this.keyup);
      this.createElement();
      ref = this.elements;
      for (j = 0, len = ref.length; j < len; j++) {
        a = ref[j];
        if (a.hasAttribute("href")) {
          a.addEventListener('click', this.click);
        }
      }
    }

    Gallery.prototype.createElement = function() {
      var $navigation, $next, $previous;
      this.$element = $build('div', {
        'id': 'lightbox-gallery'
      });
      $navigation = this.$element.appendChild($build('div', {
        'id': 'lightbox-navigation',
        'data-hello': 'world'
      }));
      $previous = $navigation.appendChild($build('a', {
        'href': '#'
      }));
      $previous.addEventListener('click', this.prev);
      $next = $navigation.appendChild($build('a', {
        'href': '#'
      }));
      $next.addEventListener('click', this.next);
      this.$img = this.$element.appendChild($build('img'));
      lightbox.hammer.on('swipeleft', this.prev);
      return lightbox.hammer.on('swiperight', this.next);
    };

    Gallery.prototype.show = function(index) {
      var element;
      this.currentIndex = index % this.elements.length;
      if (this.currentIndex < 0) {
        this.currentIndex += this.elements.length;
      }
      console.log(['show', this.currentIndex]);
      element = this.elements[this.currentIndex];
      console.log(['element', element]);
      return this.$img.setAttribute('src', element.getAttribute('href'));
    };

    Gallery.prototype.keyup = function(event) {
      var ref, ref1;
      if ((ref = event.keyCode) === 39 || ref === 74) {
        this.next();
      }
      if ((ref1 = event.keyCode) === 37 || ref1 === 75) {
        return this.prev();
      }
    };

    Gallery.prototype.next = function(event) {
      if (event != null) {
        event.preventDefault();
      }
      return this.show(this.currentIndex + 1);
    };

    Gallery.prototype.prev = function(event) {
      if (event != null) {
        event.preventDefault();
      }
      return this.show(this.currentIndex - 1);
    };

    Gallery.prototype.click = function(event) {
      var el, element, element_index, index, j, len, ref, results;
      if (event != null) {
        event.preventDefault();
      }
      element = event.target;
      if (element.tagName === "IMG") {
        element = element.parentElement;
      }
      lightbox.setContent(this.$element);
      ref = this.elements;
      results = [];
      for (element_index = j = 0, len = ref.length; j < len; element_index = ++j) {
        el = ref[element_index];
        if (!(element === el)) {
          continue;
        }
        index = element_index;
        this.show(index);
        break;
      }
      return results;
    };

    return Gallery;

  })();

  this.$build = function(type, attributes) {
    var attribute, element, value;
    if (attributes == null) {
      attributes = {};
    }
    console.log(['creating', arguments]);
    element = document.createElement(type);
    for (attribute in attributes) {
      value = attributes[attribute];
      element.setAttribute(attribute, value);
    }
    return element;
  };

  document.addEventListener("DOMContentLoaded", function() {
    var gallery, j, len, ref, results;
    window.lightbox = new Lightbox();
    ref = document.getElementsByClassName('gallery');
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      gallery = ref[j];
      results.push(new Lightbox.Gallery(gallery.children));
    }
    return results;
  });

  KEY_ESCAPE = 27;

  Lightbox.CryptUI = {
    askPassword: function(crypt) {
      var error, password;
      this.crypt = crypt;
      if (password = this.getCookie()) {
        try {
          this.performDecrypt(password);
          return;
        } catch (error1) {
          error = error1;
          console.error("invalid cookie: " + password);
        }
      }
      return this.showModal();
    },
    submitForm: function(event) {
      var error;
      event.preventDefault();
      this.cleanModal();
      console.log(this.$input);
      try {
        this.performDecrypt(this.$input.value);
        this.setCookie(this.$input.value);
        this.$element.classList.add("success");
      } catch (error1) {
        error = error1;
        console.error(error);
        this.$element.classList.add("error");
      }
      return false;
    },
    performDecrypt: function(password) {
      var decrypted;
      decrypted = Crypt.decryptFromUrlParams(password, this.crypt);
      console.log("going to " + decrypted);
      return location.href = decrypted;
    },
    cleanModal: function() {
      this.$element.classList.remove("error");
      return this.$element.classList.remove("success");
    },
    hideModal: function() {
      this.cleanModal();
      this.$input.value = "";
      return lightbox.close();
    },
    createElement: function() {
      this.$element = $build('div', {
        'id': 'password-modal'
      });
      this.$form = this.$element.appendChild($build('form'));
      this.$form.addEventListener('submit', (function(_this) {
        return function(event) {
          return _this.submitForm(event);
        };
      })(this));
      (this.$form.appendChild($build('label'))).innerText = 'Passwort';
      this.$input = this.$form.appendChild($build('input', {
        'type': 'text'
      }));
      (this.$form.appendChild($build('button'))).innerText = 'Link öffnen';
      this.cleanModal();
      return this.$element;
    },
    showModal: function() {
      window.addEventListener('keydown', (function(_this) {
        return function() {
          return _this.cleanModal();
        };
      })(this));
      if (!this.$element) {
        this.createElement();
      }
      lightbox.closeOnBackground = false;
      lightbox.setContent(this.$element);
      return this.$input.focus();
    },
    setCookie: function(password) {
      return document.cookie = this.COOKIE_KEY + "=" + (encodeURIComponent(password));
    },
    getCookie: function() {
      var ref;
      if (!this.useCookies) {
        return false;
      }
      return (ref = document.cookie.match(new RegExp("(?:^|.*;\\s*)" + this.COOKIE_KEY + "\\s*=\\s*([^;]*)"))) != null ? ref[1] : void 0;
    },
    removeCookie: function() {
      return document.cookie = this.COOKIE_KEY + "=" + (encodeURIComponent(password)) + "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    },
    COOKIE_KEY: "cryptkey",
    modalElement: false,
    useCookies: true
  };

  document.addEventListener("DOMContentLoaded", function() {
    var a, j, len, ref, results;
    ref = document.getElementsByTagName("a");
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      a = ref[j];
      if (a.hasAttribute("href")) {
        if (a.getAttribute("href").match(/\/guard\?(.*)/)) {
          results.push(a.addEventListener('click', function(event) {
            event.preventDefault();
            return Lightbox.CryptUI.askPassword(this.getAttribute("href"));
          }));
        } else {
          results.push(void 0);
        }
      }
    }
    return results;
  });

  this.Subscribe = (function() {
    function Subscribe(element1) {
      this.element = element1;
      this.callback = bind(this.callback, this);
      this.submit = bind(this.submit, this);
      this.element.addEventListener('submit', this.submit);
      this.baseUrl = this.element.getAttribute('action').replace('/post?', '/post-json?');
    }

    Subscribe.prototype.mailValue = function() {
      return document.getElementById("subscribe-mail").value;
    };

    Subscribe.prototype.url = function() {
      return this.baseUrl + "&EMAIL=" + (encodeURIComponent(this.mailValue())) + "&c=";
    };

    Subscribe.prototype.submit = function(event) {
      event.preventDefault();
      return jsonpRequest.request(this.url(), this.callback);
    };

    Subscribe.prototype.callback = function(data) {
      console.log(data);
      if (data.result === 'success') {
        return notificationbar.show('Danke für deine Anmeldung zu unserem Mailverteiler. Wir haben dir eine Mail mit einem Link geschickt. Den musst du noch klicken um die Anmeldung abzuschließen.');
      }
    };

    return Subscribe;

  })();

  this.jsonpRequest = {
    numCallbacks: 0,
    request: function(url, callback) {
      var cbid, script;
      cbid = "callback" + (jsonpRequest.numCallbacks++);
      this[cbid] = callback;
      if (url.charAt(url.length - 1) !== '=') {
        url += url.indexOf('?') ? '&' : '?';
        url += 'callback';
      }
      url += "jsonpRequest." + cbid;
      console.log("jsonprequest " + url);
      script = document.createElement('script');
      script.setAttribute('src', url);
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('data-jsonp-callback', cbid);
      return document.body.appendChild(script);
    }
  };

  document.addEventListener("DOMContentLoaded", function() {
    return new Subscribe(document.getElementById('subscribe-form'));
  });

  client = algoliasearch("E7UT30N10W", "bec4d0cb33345a4a53a3e1d72c275de0");

  index = client.initIndex('glaubenskurs.bonifati.us');

  $results = document.getElementById('searchResults');

  searchCallback = function(err, content) {
    if (err) {
      console.log(err);
      return err;
    }
    console.log(content.hits);
    $results.innerHTML = '';
    return content.hits.forEach(function(hit) {
      return $results.appendChild(buildSearchResult(hit));
    });
  };

  $q = document.getElementById('q');

  keyupTimeout = void 0;

  $q.addEventListener('keyup', function(event) {
    var term;
    term = $q.value;
    if (keyupTimeout != null) {
      clearTimeout(keyupTimeout);
    }
    return keyupTimeout = setTimeout(performSearch.bind({
      term: term
    }), 500);
  });

  performSearch = function() {
    var term;
    term = this.term;
    if (term != null) {
      if (term.length > 0) {
        return index.search(term, searchCallback);
      } else {
        return $results.innerHTML = '';
      }
    }
  };

  buildSearchResult = function(hit) {
    var $div, text, url;
    url = 'http://glaubenskurs.bonifati.us' + hit.url;
    text = hit.text;
    if (hit._highlightResult.text != null) {
      text = hit._highlightResult.text.value;
    }
    text = String(text).replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    return $div = tag('div', {
      "class": 'result'
    }, [
      tag('h3', {
        "class": 'result__title'
      }, tag('a', {
        href: url
      }, hit.title)), tag('aspan', {
        "class": 'result__url'
      }, tag('a', {
        href: url
      }, hit.url)), tag('div', {
        "class": 'result__text'
      }, text)
    ]);
  };

}).call(this);
