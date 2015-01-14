/* exported SearchBar */
this.fuzzySearchBar = (function ( window, document, Handlebars, undefined ) {
  var $ = function select (selector) {
    return document.querySelector(selector);
  };

  function NGram ( str, n ) {
    this.str = str;
    if ( ! this.str ) {
      throw new Error( "NGrams require a string" );
    }

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
    },
    // Calculate the Similarity between this NGram and another
    cosSim: function( other ) {
      if ( !( other instanceof NGram ) ) {
        throw new Error("NGrams can only be compared to NGrams");
      }
      return this.dot( other ) / (Object.keys(this.vector).length * Object.keys(other.vector).length);
    },
    // Dot product between two NGrams
    dot: function( other ) {
      var dotProd = 0;
      for ( var k in this.vector ) {
        if ( other.vector[k] === undefined ) {
          other.vector[k] = 0;
        }
        dotProd = dotProd + this.vector[k] * other.vector[k];
      }
      return dotProd;
    }
  };

  function Item ( name, profilePic ) {
    this.name = name;
    this.profilePic = profilePic;
    this.ngram = new NGram(this.name);

    this.init();
  }

  Item.prototype = {
    init: function() {
    },
    toNGram: function(force) {
      // Load cached or create n-gram
      this.ngram = this.ngram || new NGram(this.name);

      // Force reload the n-gram
      if ( force ) {
        this.ngram = new NGram(this.name);
      }

      return this.ngram;
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
    this.displayItems = this.items;

    this.init();
  }

  SearchBar.prototype = {
    init: function () {
      var that = this;
      // Set up items
      that.items = that.items.map(function( el ) {
        return new Item( el.name, el.profilePic );
      });
      that.displayItems = that.items;

      // Render
      that.render();

      // Events
      that.$element.querySelector( "input[name='searchBar']" )
        .addEventListener("input", function()
      {
        if ( this.value.length >= 2 ) {
          that.displayItems = that.search( this.value );
        } else {
          that.displayItems = that.items;
        }
        that.renderResults();
      });
    },
    // render
    render: function () {
      this.tmpl = this.tmpl || Handlebars.compile( $("#searchBarTmpl").innerHTML );
      this.$element.innerHTML = this.tmpl({
        searchResults: this.renderResults()
      });
    },
    renderResults: function () {
      this.resultsTmpl = this.resultsTmpl || Handlebars.compile( $("#searchResultsTmpl").innerHTML );
      var html = this.resultsTmpl({
        items: this.displayItems
      });

      if ( this.$element.querySelector(".list") ) {
        this.$element.querySelector(".list").innerHTML = html;
      }
      return html;
    },
    search: function ( searchStr ) {
      var searchStrNGram = new NGram( searchStr );

      return this.items.sort(function( a, b ) {
        // @TODO cache the cosSim between an element and searchStrNGram
        var aCosSim = a.ngram.cosSim( searchStrNGram );
        var bCosSim = b.ngram.cosSim( searchStrNGram );

        if ( aCosSim < bCosSim ) {
          return 1;
        }
        if ( aCosSim > bCosSim ) {
          return -1;
        }

        // Default to being equal
        return 0;
      }).filter(function ( el ) {
        return !! el.ngram.cosSim( searchStrNGram );
      });
    }
  };
  return function ( element, items ) {
    return new SearchBar( element, items );
  };
})( window, document, Handlebars );
