(function() {
  var KEY_ESCAPE,
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

  KEY_ESCAPE = 27;

  window.CryptUI = {
    askPassword: function(crypt) {
      var error, password;
      this.crypt = crypt;
      if (password = this.getCookie()) {
        try {
          this.performDecrypt(password);
          return;
        } catch (_error) {
          error = _error;
          console.error("deleting invalid cookie: " + password);
        }
      }
      return this.showModal();
    },
    submitForm: function(event) {
      var error;
      this.cleanModal();
      try {
        this.performDecrypt(this.input().value);
        this.setCookie(this.input().value);
        this.modalElement.classList.add("success");
      } catch (_error) {
        error = _error;
        console.error(error);
        this.modalElement.classList.add("error");
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
      this.modalElement.classList.remove("error");
      return this.modalElement.classList.remove("success");
    },
    input: function() {
      return this.modalElement.getElementsByTagName("input")[0];
    },
    hideModal: function() {
      this.modalElement.classList.remove("show");
      this.cleanModal();
      return this.input.value = "";
    },
    showModal: function() {
      var div, input, label;
      if (!this.modalElement) {
        this.modalElement = document.getElementById("password-modal");
      }
      if (!this.modalElement) {
        div = document.createElement("div");
        div.setAttribute("id", "password-modal");
        input = document.createElement("input");
        input.setAttribute("type", "text");
        label = document.createElement("label");
        label.innerText = "Passwort:";
        div.appendChild(label);
        div.appendChild(input);
        document.body.appendChild(div);
        this.modalElement = div;
      }
      this.modalElement.classList.add("show");
      this.input().focus();
      window.addEventListener("keydown", (function(_this) {
        return function(event) {
          _this.cleanModal();
          if (event.keyCode === KEY_ESCAPE) {
            return _this.hideModal();
          }
        };
      })(this));
      return this.modalElement.getElementsByTagName("form")[0].addEventListener('submit', (function(_this) {
        return function(event) {
          event.preventDefault();
          return _this.submitForm(event);
        };
      })(this));
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
            return CryptUI.askPassword(this.getAttribute("href"));
          }));
        } else {
          results.push(void 0);
        }
      }
    }
    return results;
  });

  this.Lightbox = (function() {
    function Lightbox(element1, padding) {
      var a, j, len, ref;
      this.element = element1;
      this.padding = padding != null ? padding : 16;
      this.click = bind(this.click, this);
      this.prev = bind(this.prev, this);
      this.next = bind(this.next, this);
      this.keyup = bind(this.keyup, this);
      console.log('initializing new lightbox...');
      this.elements = this.element.children;
      ref = this.elements;
      for (j = 0, len = ref.length; j < len; j++) {
        a = ref[j];
        if (a.hasAttribute("href")) {
          a.addEventListener('click', this.click);
        }
      }
      window.addEventListener('keyup', this.keyup);
      this.createLightbox();
      return this;
    }

    Lightbox.prototype.createLightbox = function() {
      console.log(['initial lightbox', this.lightbox]);
      if (!this.lightbox) {
        this.lightbox = document.getElementById("lightbox");
      }
      console.log(['second step', this.lightbox]);
      if (!this.lightbox) {
        console.log('creating html element');
        this.lightbox = document.createElement("div");
        this.lightbox.setAttribute("id", "lightbox");
        this.lightbox.innerHTML = "<a href=\"#\" id=\"lightbox-close\">X</a>\n<main id=\"lightbox-main\">\n  <div id=\"lightbox-navigation\">\n    <a href=\"#\" id=\"lightbox-prev\"></a>\n    <a href=\"#\" id=\"lightbox-next\"></a>\n  </div>\n  <img />\n</main>";
        document.body.appendChild(this.lightbox);
      }
      this.lightbox.addEventListener('click', (function(_this) {
        return function(event) {
          console.log(event);
          if (event.target === _this.lightbox) {
            return _this.close(true);
          }
        };
      })(this));
      this.main = document.getElementById('lightbox-main');
      this.img = this.main.getElementsByTagName('img')[0];
      this.$previous = document.getElementById('lightbox-prev');
      this.$previous.addEventListener('click', (function(_this) {
        return function() {
          return _this.prev();
        };
      })(this));
      this.$next = document.getElementById('lightbox-next');
      this.$next.addEventListener('click', (function(_this) {
        return function() {
          return _this.next();
        };
      })(this));
      this.$close = document.getElementById('lightbox-close');
      return this.$close.addEventListener('click', (function(_this) {
        return function() {
          return _this.close();
        };
      })(this));
    };

    Lightbox.prototype.keyup = function(event) {
      var ref, ref1;
      if (event.keyCode === 27) {
        this.close(true);
      }
      if ((ref = event.keyCode) === 39 || ref === 74) {
        this.next();
      }
      if ((ref1 = event.keyCode) === 37 || ref1 === 75) {
        return this.prev();
      }
    };

    Lightbox.prototype.next = function() {
      event.preventDefault();
      return this.show(this.currentIndex + 1);
    };

    Lightbox.prototype.prev = function() {
      event.preventDefault();
      return this.show(this.currentIndex - 1);
    };

    Lightbox.prototype.show = function(index) {
      var element;
      this.currentIndex = index % this.elements.length;
      if (this.currentIndex < 0) {
        this.currentIndex += this.elements.length;
      }
      console.log(['show', this.currentIndex]);
      element = this.elements[this.currentIndex];
      console.log(['element', element]);
      this.img.setAttribute('src', element.getAttribute('href'));
      return this.lightbox.classList.add('show');
    };

    Lightbox.prototype.click = function(event) {
      var el, element, element_index, index, j, len, ref, results;
      event.preventDefault();
      element = event.target;
      if (element.tagName === "IMG") {
        element = element.parentElement;
      }
      console.log(["click event on", element]);
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

    Lightbox.prototype.close = function(animate) {
      if (animate == null) {
        animate = true;
      }
      return this.lightbox.classList.remove('show');
    };

    return Lightbox;

  })();

  document.addEventListener("DOMContentLoaded", function() {
    var gallery, j, len, ref, results;
    ref = document.getElementsByClassName('gallery');
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      gallery = ref[j];
      results.push(new Lightbox(gallery));
    }
    return results;
  });

}).call(this);
