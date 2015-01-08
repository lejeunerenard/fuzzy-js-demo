/* exported SearchBar */
this.fuzzySearchBar = (function ( window, document, Handlebars, undefined ) {
  var $ = function select (selector) {
    return document.querySelector(selector);
  };

  function NGram ( str, n ) {
    this.str = str || error( "NGrams require a string" );
    this.n = n || 2;
    this.vector = {};

    this.init();
  }
  NGram.prototype = {
    init: function() {
      this.toVector();
    },
    toVector: function() {
      for ( var i = 0; i < this.str.length - this.n + 1; i++ ) {
        var key = this.str.substring( i, i + this.n ).toLowerCase();
        this.vector[ key ] = this.vector[ key ] || 0;
        this.vector[ key ] += 1;
      }
      console.log( this.vector );
    }
  };

  function Item ( name, profilePic ) {
    this.name = name;
    this.profilePic = profilePic;

    this.init();
  }

  Item.prototype = {
    init: function() {
      this.toNGram();
    },
    toNGram: function() {
      return new NGram(this.name);
    },
    render: function() {
      this.tmpl = this.tmpl || Handlebars.compile( $("#itemTmpl").innerHTML );
      return this.tmpl(this);
    },
    // To make rendering sexy just have it render itself when its called
    // with a string.
    toString: function() {
      return this.render();
    }
  };

  function SearchBar ( element, items ) {
    this.element = element;
    this.$element = $(element);
    this.items = items;

    this.init();
  }

  SearchBar.prototype = {
    init: function () {
      // Set up items
      this.items = this.items.map(function( el ) {
        return new Item( el.name, el.profilePic );
      });

      // Render
      this.render();

      // Events
    },
    // render
    render: function () {
      this.tmpl = this.tmpl || Handlebars.compile( $("#searchBarTmpl").innerHTML );
      this.$element.innerHTML = this.tmpl({
        items: this.items
      });
    },
    search: function () {
    }
  };
  return function ( element, items ) {
    return new SearchBar( element, items );
  };
})( window, document, Handlebars );
