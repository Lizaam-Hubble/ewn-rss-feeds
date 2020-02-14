var swipers = {
  props: {
    interfaceId: document.getElementById("interface")
  },

  data: {
    swiperStorage: []
  },

  methods: {
    initialize: function(target) {    
      function currentProperty(target, interaction) {
        if (target === undefined) {
          return target;
        } else {
          const MAX_SPEED = 300;
          const MIN_SPEED = 300;

          switch (target.dataset.style) {
            case "interface":
              if ("speed" === interaction) return MIN_SPEED;
              if ("no-swiping" === interaction) return true;
            break;
            case "gallery":
            case "slideshow":
              if ("speed" === interaction) return MAX_SPEED;
              if ("no-swiping" === interaction) return false;
              if ("next" === interaction) return ".next-button";
              if ("previous" === interaction) return ".prev-button";
            break;
          }
        }
      }

      const CURRENT_SWIPER = new Swiper(target, {
        speed: currentProperty(target, "speed"),
        noSwipingClass: "disable-swipe",
        noSwiping: currentProperty(target, "no-swiping"),
        a11y: false,

        navigation: {
          nextEl: currentProperty(target, "next"),
          prevEl: currentProperty(target, "previous")
        },

        pagination: {
          el: currentProperty(target, "pagination"),
          type: "bullets",
          clickable: true
        }
      });

      if (CURRENT_SWIPER) {
        swipers.data.swiperStorage.push(CURRENT_SWIPER);
      }
    },

    swiperStart: function(swiperId) {
      !swiperId ? swipers.methods.initialize(swipers.props.interfaceId) : swipers.methods.initialize(swiperId);
    }
  }, 
};
