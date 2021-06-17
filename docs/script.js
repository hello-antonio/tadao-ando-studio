(function () {
  //=======================================================================================
  // GLOBALS
  //=======================================================================================
  const body = document.body;
  const id = (l) => document.getElementById(l);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const elLoader = id("loader");
  const elLoaderProgress = id("progress");
  const elCursorWrapper = id("cursor-wrapper");
  const elCursor = elCursorWrapper.querySelector(".cursor");
  const elLoaderWrapper = elLoader.querySelector(".loader-wrapper");
  //=======================================================================================
  // TIMEZONE
  //=======================================================================================
  const timeEl = id("time");
  const dateEl = id("date");

  function updateTime() {
    const date = new Date();
    const now = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Tokyo", hour12: true })
    );

    timeEl.textContent =
      `0${now.getHours()}`.slice(-2) +
      ":" +
      `0${now.getMinutes()}`.slice(-2) +
      `${now.toLocaleTimeString().slice(-2)}`;
    let day = now.getDate();
    let month = date.toLocaleDateString("en-US", { month: "long" });
    dateEl.textContent = `${month} ${day}, ${now.getFullYear()}`;
  }

  function update() {
    updateTime();
    const raf = window.requestAnimationFrame(update);
  }

  //=======================================================================================
  // FETCH
  //=======================================================================================
  async function fetchData(url) {
    return await fetch(url)
      .then((res) => res.json())
      .then((res) => {
        const data = res.data;
        return data;
      })
      .catch((err) => console.log(err));
  }
  function html(d, t, fn) {
    d.map((n) => {
      t.innerHTML += fn(n);
    });
  }

  async function renderData(url, render) {
    const data = await fetchData(url);
    render(data);
  }

  //=======================================================================================
  // TOGGLE THEME
  //=======================================================================================
  function toggleTheme() {
    let page = document.querySelector(".page");
    if (page.dataset.theme == "" || page.dataset.theme == "light") {
      page.setAttribute("data-theme", "dark");
    } else {
      page.setAttribute("data-theme", "light");
    }
  }

  //=======================================================================================
  // SMOOTH SCROLL
  //=======================================================================================
  class SmoothScroll {
    constructor() {
      this.targetY = 0;
      this.currentY = 0;
      this.ease = 0.08;

      this.section = document.querySelector("[data-scroll]");
      this.sectionHeight = 0;

      this.raf = undefined;
      this.rafActive = false;
      this.ticking = false;

      this.hasPointerEvents = true;
      this.timer;
      this.ENABLE_HOVER_DELAY = 600;
      if (window.requestAnimationFrame) {
        this.init();
      }
    }

    handlePointerEvents() {
      const bodyClassList = document.body.classList;
      // clear previous timeout function
      clearTimeout(this.timer);

      if (!bodyClassList.contains("disable-hover")) {
        // add the disable-hover class to the body element
        bodyClassList.add("disable-hover");
      }

      this.timer = setTimeout(function () {
        // remove the disable-hover class after a timeout of 500 millis
        bodyClassList.remove("disable-hover");
      }, this.ENABLE_HOVER_DELAY);
    }

    resize() {
      this.sectionHeight = this.section.getBoundingClientRect().height;
      this.loop();
    }

    styles() {
      this.resize();
      this.section.dataset.scroll = true;
      document.body.style.overflow = "hidden";
    }

    scrolling(elm, transform = undefined) {
      let s = elm.style;
      let t = transform || `translate3d(0, -${this.currentY}px,0)`;

      s["transform"] = t;
    }

    events() {
      document.addEventListener("touchmove", (e) => e.stopPropagation(), {
        passive: true,
      });

      window.addEventListener("resize", this.resize.bind(this), {
        passive: true,
      });

      document.addEventListener("scroll", this.scroll.bind(this), {
        passive: true,
      });
    }

    scroll() {
      this.targetY = window.scrollY || window.pageYOffset;

      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this.loop();
          this.handlePointerEvents();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }

    update() {
      let diff, delta;

      diff = this.targetY - this.currentY;
      delta = Math.abs(diff) < 0.1 ? 0 : diff * this.ease;

      let skewy = diff * 0.01;

      if (delta) {
        this.currentY += delta;
        this.currentY = Math.round(this.currentY * 100) / 100;

        this.raf = window.requestAnimationFrame(this.update.bind(this));
        this.hasPointerEvents = false;
      } else {
        this.hasPointerEvents = true;
        this.currentY = this.targetY;
        skewy = 0;
        this.rafActive = false;
        cancelAnimationFrame(this.raf);
      }

      this.scrolling(this.section, `translate3d(0, -${this.currentY}px,0)`);
    }

    loop() {
      if (!this.rafActive) {
        this.rafActive = true;
        this.raf = window.requestAnimationFrame(this.update.bind(this));
      }
    }

    init() {
      this.styles();
      this.events();
      this.loop();
    }
  }

  //=======================================================================================
  // READY
  //=======================================================================================
  // HTML READY
  if (document.readyState !== "loading") {
    initRender();
  } else {
    window.addEventListener("DOMContentLoaded", function (e) {
      initRender();
    });
  }

  //=======================================================================================
  // RENDERER
  //=======================================================================================
  function initRender() {
    renderData("https://api.npoint.io/187c28e6918dfea73fca", (data) => {
      html(data.projects, id("xhr-works"), (d) => {
        return `
				<li>
				 	<div class="info">
						<h2>${("00" + (d.id + 1)).slice(-3)}</h2>
					</div>
					<div class="img c-target">
						<img class="c-target" src="${d.image.url}" alt="${d.caption}" crossorigin/>
					</div>
					<div class="info">
						<p>${d.caption}</p>
					</div>
        </li>`;
      });

      id("works-count").textContent = " (" + data.projects.length + ")";
      id("awards-count").textContent = " (" + data.awards.length + ")";

      html(data.awards, id("xhr-awards"), (d) => {
        return `<li>
            <span class="award-l">/${d.date}</span> <span class="award-r">${d.award}</span>
          </li>`;
      });
    });
  }

  // LOAD READY

  // LOADER PROGRESS
  let progress = {
    percent: 0,
  };

  window.addEventListener("load", (e) => {
    let imagesResized = false;

    const tl = gsap.timeline({ onComplete: loaderOut });
    const elApp = id("app");

    gsap.set(elCursor, { transformOrigin: "center", scale: 1 });
    gsap.set(body, { height: "100vh", overflow: "hidden" });
    gsap.set(elApp, { pointerEvents: "none" });

    function loaderOut() {
      const tl = gsap.timeline({
        onComplete: function () {
          gsap.set(elApp, { pointerEvents: "auto" });

          if (!isMobile) {
            new SmoothScroll();
          } else {
            gsap.set(body, { height: "inherit", overflow: "auto" });
          }
        },
      });

      tl.to(
        elLoader,
        {
          duration: 0.6,
          y: "-100%",
          // visibility: "hidden",
          ease: "power2.easeIn",
        },

        "+=1"
      )
        .from(
          elApp,
          {
            duration: 0.6,
            y: "50vh",
            opacity: 0,
            ease: "power2.easeOut",
          },

          "-=.5"
        )
        .to(
          "#app .mask div",
          {
            y: 0,
            opacity: 1,
            stagger: {
              each: 0.1,
              ease: "power2.easeOut",
            },
          },

          "-=0.3"
        )
        .to(elLoader, { opacity: 0 });
    }

    setTimeout(function () {
      [...document.querySelectorAll("img")].forEach((img) => {
        let w = img.naturalWidth,
          h = img.naturalHeight;
        img.setAttribute("width", w);
        img.setAttribute("height", h);
        img.parentElement.style.maxWidth = w + "px";
      });

      // 	GSAP LOADER
      tl.to("#loader .mask div", {
        y: 0,
        opacity: 1,
        stagger: {
          each: 0.1,
          ease: "power2.easeOut",
        },
      })
        .to(elLoaderWrapper, {
          duration: 0.5,
          opacity: 1,
        })
        .to(progress, {
          duration: 1,
          percent: 100,
          onUpdate() {
            let percent = `00${Math.ceil(progress.percent)}`.slice(-3);
            elLoaderProgress.textContent = percent;
          },
        })
        .to(
          "#loader .mask div",
          {
            y: "-100%",
            opacity: 0,
            stagger: {
              each: 0.1,
              ease: "power2.easeIn",
            },
          },

          "+=1"
        );
    }, 1000);

    //
    //
    id("theme").addEventListener("click", toggleTheme, false);

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(update);

      // 			STUFF TO DO IF NOT ON MOBILE DEVICE
      if (!isMobile) {
        window.addEventListener("mousemove", (e) => {
          gsap.to(elCursorWrapper, 0.6, {
            x: e.clientX,
            y: e.clientY,
            ease: "out",
          });
        });

        body.addEventListener("mouseover", (e) => {
          let t = e.target;

          if (t.classList.contains("c-target")) {
            gsap.to(elCursor, { scale: 3, ease: "in" });
          } else {
            gsap.to(elCursor, { scale: 1, ease: "out" });
          }
          e.preventDefault();
        });
      }
    }
  });
})();
