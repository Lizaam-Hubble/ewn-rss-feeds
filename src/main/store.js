var store = {
  props: {
    /** 
     * @type {Properties}
     * Storage of values and states for channel updating */
    main: document.getElementById("channel"),
    progressSection: document.getElementById("progress-loader"),
    interfaceDirection: undefined,
    primarySwiper: null,
    interfaceTransitioned: false,
    totalData: 4,
    progressTimeline: null,
    progressBar: null,
    snappedToFeed: false,
    currentIndex: 0
  },

  data: {
    /** 
     * @type {Properties}
     * Data storage properties */
    xmlDataTitles: [],
  },

  methods: {
    /**
     * @type {function}
     * Custom Functions */
    getFeeds: function() {
      this.xmlData();

      store.props.primarySwiper.on("transitionEnd", function() {
        store.props.currentIndex = this.activeIndex;
        store.methods.updateProgress(this);
        store.props.progressBar = document.getElementById("progress-" + this.activeIndex);
        store.methods.startAnimation(store.props.progressBar);
        store.methods.updateTitle();
      });
    },

    xmlData: function() {
      var httpRequest = new XMLHttpRequest();

      httpRequest.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          store.props.progressSection.classList.add("lds-fade-out");
          store.methods.newsFeeds(this, function(complete) {
            if (complete) {
              var progressBar = store.methods.feedsProgress();
              
              store.methods.startAnimation(progressBar);
            }
          });
        } else {
          store.props.progressSection.classList.remove("lds-fade-out");
        }

        store.methods.progressDisplay(this.readyState);
      }

      httpRequest.open("GET", "https://ewn.co.za/RSS%20Feeds/Latest%20News?category=Local", true);
      httpRequest.send();
    },

    progressDisplay: function(readyState) {
      if (readyState === 4) {
        setTimeout(function() {
          store.props.progressSection.style.display = "none";
        }, 1000);
      } else {
        store.props.progressSection.removeAttribute("style");
      }
    },

    newsFeeds: function(xml, rendered) {
      var swiperWrapper = store.props.primarySwiper;
      var item = xml.responseXML.getElementsByTagName("item");

      for (var i = 0, length = store.props.totalData; i < length; i++) {
        var stringBuilder = "<div class='swiper-slide'>";
          stringBuilder += "<div class='column-header'>";
            stringBuilder += "<div class='feed-column column-left'>";
              stringBuilder += store.methods.feedImage(item, i);
            stringBuilder += "</div>";
            stringBuilder += "<div class='feed-column column-right'>";
              stringBuilder += "<img src='src/img/ewn-logo.png' />";
              stringBuilder += store.methods.feedInfo(item, i, "title");
              stringBuilder += store.methods.feedInfo(item, i, "pubdate");
            stringBuilder += "</div>";
          stringBuilder += "</div>";
          stringBuilder += "<div class='column-description'>";
            stringBuilder += store.methods.feedInfo(item, i, "description");
          stringBuilder += "</div>";
        stringBuilder += "</div>";

        swiperWrapper.appendSlide(stringBuilder);
      }

      rendered(true);
    },

    feedImage: function(x, i) {
      var element = x[i].getElementsByTagName("description")[0].childNodes[0].nodeValue;
      var elementSplit = element.split("<");

      for (var i = 0, length = elementSplit.length; i < length; i++) {
        if (elementSplit[i].indexOf("img") !== -1) {
          return "<" + elementSplit[i];
        }
      }
    },

    feedInfo: function(x, i, string) {
      var className = null;

      if (string === "title") {
        className = "red-title";
      } else if (string === "pubdate") {
        className = "feed-date";
      } else if (string === "description") {
        className = "feed-description";
      }

      var data = null;
      var element = null;

      if (x[i].getElementsByTagName(string)[0].childNodes[0] !== undefined) {
        element = x[i].getElementsByTagName(string)[0].childNodes[0].nodeValue;
      } else {
        return "Data not found ...";
      }

      var data = element.replace(/<img[^>]*>/g, "");

      if (string === "title") {
        var dataLength = data.length;

        if (dataLength > 90) {
          className = "red-title";
        }

        store.data.xmlDataTitles.push(data);
      } else if (string === "pubdate") {
        var dateSplit = data.split(" ");

        data = dateSplit[0] + " " + dateSplit[1] + " " + dateSplit[2] + " " + dateSplit[3];
      }
  
      return "<p class='" + className + "'>" + data + "</p>";
    },

    feedsProgress: function() {
      var columnProgress = document.querySelector(".column-progress");

      for (var i = 0, length = store.data.xmlDataTitles.length; i < length; i++) {
        var activeItem = null;
        var activeTitle = null;

        (i === 0) ? (activeItem = "active-feed") : (activeItem = "");

        if (store.data.xmlDataTitles[i].length > 35) {
          activeTitle = store.data.xmlDataTitles[i].substring(0, 35) + " ...";
        }

        var stringBuilder = "<div class='progress'>";
          stringBuilder += "<progress class='progress-bar' id='progress-" + i + "'></progress>";
          stringBuilder += "<p class='progress-title " + activeItem + "' onclick='store.methods.userFeedSelect(" + i +")'>" + activeTitle + "</p>";
        stringBuilder += "</div>";

        columnProgress.insertAdjacentHTML("beforeend", stringBuilder);
      }

      return document.getElementById("progress-0");
    },

    startAnimation: function(element) {
      store.props.progressTimeline = new TimelineMax();

      if (!store.props.compiled) {
        store.props.compiled = true;
        store.props.progressTimeline.delay(1);
      }
      
      store.props.progressTimeline.to({}, 10, {
        ease: Power0.easeNone,

        onUpdate: function() {
					TweenMax.set(element, {
						value: store.props.progressTimeline.progress(),
					});	
				},

        onComplete: function() {
          if (element.parentNode.nextSibling !== null) {
            store.props.progressBar = element.parentNode.nextSibling.firstChild;
            store.props.primarySwiper.slideNext();
          } else {
            var progressBar = document.querySelectorAll(".progress-bar");

            for (var i = 0, length = progressBar.length; i < length; i++) {
              progressBar[i].value = 0;
            }

            store.props.primarySwiper.slideTo(0);
          }
        }
      })
    },

    updateTitle: function() {
      var progressTitle = document.querySelectorAll(".progress-title");
      var currentFeed = store.props.primarySwiper.activeIndex;

      for (var i = 0, length = progressTitle.length; i < length; i++) {
        progressTitle[i].classList.remove("active-feed");
      }

      progressTitle[currentFeed].classList.add("active-feed");
    },

    userFeedSelect: function(index) {
      store.props.progressTimeline.kill();
      store.props.primarySwiper.slideTo(index);
      store.props.snappedToFeed = true;
    },

    updateProgress: function(params) {
      var _this = params;

      if (store.props.snappedToFeed) {
        store.props.snappedToFeed = false;

        if (_this.activeIndex > _this.previousIndex) {
          for (var i = _this.activeIndex - 1; i >= 0; i--) {
            var progress = document.getElementById("progress-" + i);

            progress.value = "1";
          }
        } else {
          var progress = document.querySelectorAll(".progress-bar"); 

          store.props.progressBar = document.getElementById("progress-" + _this.activeIndex);
          store.props.progressBar.value = "0";

          for (var i = _this.activeIndex + 1; i < progress.length; i++) {
            var progressBar = document.getElementById("progress-" + i);

            progressBar.value = "0";
          }
        }
      } else {
        if (_this.swipeDirection) {
          store.props.progressTimeline.kill();

          if (store.props.progressBar === null) {
            store.props.progressBar = document.getElementById("progress-0");
          }

          if (_this.swipeDirection === "next") {
            if (_this.previousIndex === _this.slides.length - 1) {
              return false;
            } else {
              store.props.progressBar.value = "1";
            }
          } else {
            if (!store.props.snappedToFeed) {
              store.props.progressBar.value = "0";
              return store.props.snappedToFeed;
            } else {
              var currentFeed = _this.previousIndex;
              var prevProgressBar = document.getElementById("progress-" + (currentFeed - 1));
  
              store.props.progressBar.value = "0";
  
              if (prevProgressBar) {
                prevProgressBar.value = "0";
              }
            }
          }
        }
      }
    }
  }
}

/**
 * @type {function}
 * Start the application */
swipers.methods.swiperStart(swipers.props.interfaceId);
store.props.primarySwiper = swipers.data.swiperStorage[0];
store.methods.getFeeds();