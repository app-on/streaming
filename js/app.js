'use strict';

var dataAppUrl = () => {
  {
    return {
      server: (pathname = "") => {
        return `https://api.vniox.com/streaming/${trimString(pathname).left(
          "/"
        )}`;
      },
      img: (url = "") =>
        `https://img.vniox.com/index.php?url=${encodeURIComponent(url)}`,
      fetch: (url = "") => url,
      rr: (path = "") => `https://app.victor01sp.com/rr` + path,
    };
  }
};

var dataApp = () => {
  const config = {
    routes: new RouteHashCallback(),
    auth: "auth_Mj8Q5q3",
    user: null,
    icon: new IconSVG(),
    mediaPlayer: new MediaPlayer(
      document.createDocumentFragment(),
      "media-player-id-608349709553889"
    ),
    url: dataAppUrl(),
    elements: {
      meta: {
        color: document.getElementById("meta-theme-color"),
      },
      style: {
        app: document.getElementById("style-app"),
      },
      custom: {
        requestDisableCors: document.querySelector("request-disable-cors"),
      },
    },
    values: {
      youtubeToken: null,
      hls: null,
    },
    functions: {
      scrollY: (parameters) => {
        let isDragging = false;
        let startX;
        let scrollLeft;

        const scrollContainer = parameters.target;

        scrollContainer?.addEventListener("mousedown", (e) => {
          isDragging = true;
          startX = e.pageX - scrollContainer.offsetLeft;
          scrollLeft = scrollContainer.scrollLeft;

          parameters?.events?.start?.(e);
        });

        scrollContainer?.addEventListener("mouseleave", (e) => {
          if (isDragging) {
            isDragging = false;
            parameters?.events?.end?.(e);
          }
        });

        scrollContainer?.addEventListener("mouseup", (e) => {
          if (isDragging) {
            isDragging = false;
            parameters?.events?.end?.(e);
          }
        });

        scrollContainer?.addEventListener("mousemove", (e) => {
          if (!isDragging) return;
          e.preventDefault();
          const x = e.pageX - scrollContainer.offsetLeft;
          const walk = x - startX;
          scrollContainer.scrollLeft = scrollLeft - walk;

          parameters?.events?.move?.(e);
        });
      },
      historyBack: ($element) => {
        $element?.addEventListener("click", (e) => {
          const start = Boolean(history.state?.start);
          if (start) {
            return;
          }

          e.preventDefault();
          history.back();
        });
      },
      generateUUID: () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          (char) => {
            const random = (Math.random() * 16) | 0; // Genera un número aleatorio entre 0 y 15
            const value = char === "x" ? random : (random & 0x3) | 0x8; // Usa 0x3 y 0x8 para asegurar la versión 4
            return value.toString(16); // Convierte a hexadecimal
          }
        );
      },
      formatTime: (seconds) => {
        seconds = parseInt(seconds) || 0;
        const h = Math.floor(seconds / 3600); // Calcular horas
        const m = Math.floor((seconds % 3600) / 60); // Calcular minutos
        const s = seconds % 60; // Calcular segundos restantes

        const parts = [];
        if (h > 0) parts.push(`${h}h`);
        if (m > 0 || h > 0) parts.push(`${m}m`); // Mostrar minutos si hay horas
        if (s > 0) parts.push(`${s}s`); // Mostrar minutos si hay horas

        return parts.join(" ");
      },
    },
    instances: {
      IntersectionObserver: new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            entry.target.dispatchEvent(
              new CustomEvent("_IntersectionObserver", {
                detail: {
                  entry,
                  observer,
                },
              })
            );
          });
        },
        { root: null, rootMargin: "0px", threshold: 0 }
      ),
    },
    fetchOptions: (options = {}) => {
      return {
        ...options,
        headers: {
          "Token-Auth": Cookie.get("auth_Mj8Q5q3"),
          ...(options?.headers ?? {}),
        },
        method: options?.method ?? "GET",
      };
    },
  };

  return config;
};

var auth = () => {
  return new Promise((resolve, reject) => {
    const useApp = window.dataApp;

    const encodeQueryString = encodeQueryObject({
      route: "token.auth",
    });

    if (Cookie.get(useApp.auth)) {
      return fetch(useApp.url.server(`/api.php?${encodeQueryString}`), {
        method: "GET",
        headers: {
          "Token-Auth": Cookie.get(useApp.auth),
        },
      })
        .then((res) => res.json())
        .then((data) => {
          dispatchEvent(new CustomEvent("_auth", { detail: data }));
          resolve(data);
        })
        .catch(reject);
    }

    dispatchEvent(new CustomEvent("_auth", { detail: null }));
    resolve(null);
  });
};

var routesPrivate = (page = "") => {
  const useApp = window.dataApp;
  const $node = document.createTextNode("");

  auth().then((result) => {
    if (result?.status) {
      Cookie.set(useApp.auth, result.token, {
        lifetime: 60 * 60 * 24 * 7,
      });
      return $node.replaceWith(page());
    }

    location.hash = "/login";
  });

  return $node;
};

var routesPublic = (page = "") => {
  const useApp = window.dataApp;
  const $node = document.createTextNode("");

  auth().then((result) => {
    if (!result?.status) {
      Cookie.remove(useApp.auth, {});
      return $node.replaceWith(page());
    }

    location.hash = "/";
  });

  return $node;
};

var peliculaId = () => {
  const useApp = window.dataApp;
  const useThis = {
    params: useApp.routes.params(),
    reactivity: {
      isFavorite: defineVal(false),
      isView: defineVal(false),
      load: defineVal(true),
      data: defineVal({}),
      episodes: defineVal([]),
    },
    functions: {},
    values: {
      isConnected: false,
      streaming: {},
      episode: 1,
      data_id: "",
    },
  };

  const $element = replaceNodeChildren(
    createNodeElement(`
        <div class="div_Xu02Xjh children-hover div_mrXVL9t">
             
            <header class="header_K0hs3I0 header_RtX3J1X">

                <div class="div_uNg74XS">
                    <a href="#/pelicula" class="button_lvV6qZu" data-history-back>
                      ${useApp.icon.get("fi fi-rr-angle-small-left")}
                    </a>  
                </div>
                <h2 id="textTitle" style="flex: 1; text-align:center; font-size: clamp(1rem, 2vw, 2rem);"></h2>
                <div id="divButton" class="div_x0cH0Hq">
                    <button id="favorite" class="button_lvV6qZu" data-action="0" style="visibility:hidden">
                      ${useApp.icon.get("fi fi-rr-heart")}
                    </button>
                </div>

            </header>
            <div id="item" class="div_guZ6yID div_DtSQApy">
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                    ${useApp.icon.get("fi fi-rr-search-alt")}
                    <h3>La pelicula no existe</h3>
                </div> 
                <div id="itemTrue" class="div_hqzh2NV">

                    

                    <div class="div_rCXoNm8" style="display:none">
                        <div class="div_vm3LkIt">
                            <img id="backdrop" src="">
                        </div>
                        <div class="div_y6ODhoe">
                            <picture class="picture_BLSEWfU"><img id="poster" src=""></picture>
                            <div class="div_K2RbOsL">
                                <h2 id="title"></h2>
                                <p></p>
                                <div class="div_aSwP0zW">
                                    <span id="genres"></span>
                                    <span id="duration"></span>
                                    <span id="date"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="div_cnJqhFl">
                      <div class="div_0JOSFlg">
                        <img id="poster" src="">
                      </div>
                      <div class="div_cxFXOaL">
                        <label class="label_zjZIMnZ">
                          <input type="checkbox" id="inputView">
                          <span style="display:flex"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-check"><path d="M22.319,4.431,8.5,18.249a1,1,0,0,1-1.417,0L1.739,12.9a1,1,0,0,0-1.417,0h0a1,1,0,0,0,0,1.417l5.346,5.345a3.008,3.008,0,0,0,4.25,0L23.736,5.847a1,1,0,0,0,0-1.416h0A1,1,0,0,0,22.319,4.431Z"></path></svg></span>
                        </label>
                        <button id="play" class="button_bDfhQ4b">
                          <small>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-sr-play"><path d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z"></path></svg>
                          </small>
                          <span>Reproducir</span>
                        </button>
                      </div>
                      <hr class="hr_nTfcjTI">
                      <div class="div_aSwP0zW" style="text-align:center">
                          <span id="genres"></span>
                          <span id="duration"></span>
                          <span id="date"></span>
                      </div>
                      <hr class="hr_nTfcjTI">
                      <p id="overview" style="text-align:center; font-size:14px"></p>
                    </div>
 
                    <div class="div_wNo9gA9" style="display:none">
                        <div class="div_WslendP" >
                            <div id="season" class="div_z0PiH0E" data-season="0" data-data="[]" >
                                <button class="focus" data-index=""><span>Todo</span></button>
                                <button data-index="relatedMovies"><span>Relacionadas</span></button>
                                <button data-index="topMoviesDay"><span>Destacadas del dia</span></button>
                                <button data-index="topMoviesWeek"><span>Destacadas de la semana</span></button>
                                <button data-index="otherMovies"><span>Otros</span></button>
                            </div>
                        </div>
                        <div id="episodes" class="div_EafBfGo"></div>
                    </div>

                </div>
            </div>
            
            <div id="itemTrueOption" class="div_5Pe946IMjyL1Rs" popover>
                <div class="div_dsb3nhtCrFmUlSN p-10px">
                    <div class="div_cXaADrL pointer-on">
                        <div id="itemTrueOptionVideos" class="div_lm2WViG"></div>
                    </div>
                </div>
            </div>
        </div>
    `),
    {},
    true
  );

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  useThis.reactivity.isFavorite.observe((isFavorite) => {
    $elements.favorite.innerHTML = useApp.icon.get(
      isFavorite ? "fi fi-sr-heart" : "fi fi-rr-heart"
    );

    $elements.favorite.setAttribute("data-action", isFavorite ? 1 : 0);
  });

  useThis.reactivity.isView.observe((isView) => {
    $elements.inputView.checked = isView;
  });

  useThis.reactivity.load.observe((load) => {
    const render = {
      itemNull: load,
      itemFalse: !load && !Object.keys(useThis.reactivity.data.value).length,
      itemTrue: !load && !!Object.keys(useThis.reactivity.data.value).length,
    };

    Object.entries(render).forEach((keyvalue) => {
      $elements[keyvalue[0]].style.display = keyvalue[1] ? "" : "none";
    });
  });

  useThis.reactivity.data.observe((data) => {
    if (Boolean(Object.keys(data).length)) {
      const slug = data.url.slug
        .split("/")
        .map((name, index) => {
          if (name == "movies") return "pelicula";
          else if (name == "series") return "serie";
          else if (name == "seasons") return "temporada";
          else if (name == "episodes") return "episodio";
          return name;
        })
        .join("/");

      const _convertSecondsToTime = convertSecondsToTime(data.runtime * 60);
      $elements.poster.src = useApp.url.img(
        data.images.poster.replace("/original/", "/w342/")
      );
      $elements.textTitle.textContent = data.titles.name;
      $elements.title.textContent = data.titles.name;
      $elements.overview.textContent = data.overview;
      $elements.genres.textContent = data.genres
        .map((genre) => genre.name)
        .join(", ");
      $elements.duration.textContent = `${_convertSecondsToTime.hours}h ${_convertSecondsToTime.minutes}min`;
      $elements.date.textContent = new Date(data.releaseDate).getFullYear();

      $elements.itemTrue.append(document.createTextNode(""));

      $elements.play.style.display = "";
      $elements.play.setAttribute("data-data", JSON.stringify(data));
      $elements.play.setAttribute("data-slug", `https://cuevana.biz/${slug}`);

      useApp.mediaPlayer.info({
        title: data.titles.name,
        description: data.genres.map((genre) => genre.name).join(", "),
      });

      useApp.mediaPlayer.controls({
        options: {
          not: ["download"],
        },
      });

      const image = new Image();
      image.src = $elements.poster.src;
      image.onload = () => {
        styleElement($elements.poster, {
          aspectRatio: `${image.width}/${image.height}`,
        });
      };

      getDominantColor($elements.poster).then((result) => {
        const color = darkenHexColor(result, 50);

        $element.style.background = color;
        $elements.itemTrueOptionVideos.parentElement.style.background =
          darkenHexColor(result, 60);
        useApp.elements.meta.color.setAttribute("content", color);
      });

      useThis.functions.dataTrueInfo(data);
    }
  });

  useThis.functions.dataTrueInfo = (data) => {
    useThis.values.data_id = data.TMDbId;

    const encodeQueryString = encodeQueryObject({
      route: "favorites-one",
      data_id: data.TMDbId,
      type: 2,
    });

    const body = {
      data_id: data.TMDbId,
      data_json: JSON.stringify(
        Object.entries(data).reduce((prev, curr) => {
          if (["TMDbId", "titles", "url", "images"].includes(curr[0])) {
            prev[curr[0]] = curr[1];
          }
          return prev;
        }, {})
      ),
      type: 2,
    };

    fetch(
      useApp.url.server(`/api.php?${encodeQueryString}`),
      useApp.fetchOptions({
        method: "POST",
        body: JSON.stringify(body),
      })
    )
      .then((res) => res.json())
      .then((data) => {
        useThis.values.streaming = data;
        $elements.favorite.style.visibility = "";
        useThis.values.isConnected = Boolean(data);

        if (useThis.values.isConnected) {
          useThis.reactivity.isFavorite.value = Boolean(data?.favorite);
          useThis.reactivity.isView.value = Boolean(data?.view);
        }
      });
  };

  useThis.functions.getLinkServer = (url) => {
    const newURL = new URL(url);
    const hostSplit = newURL.host.split(".");
    const host = hostSplit.length == 3 ? hostSplit[1] : hostSplit[0];
    const mediaPlayer = useApp.mediaPlayer;

    if (["streamwish"].includes(host)) {
      MediaWebUrl.streamwish({ url: url }).then((res) => {
        if (res.status) {
          mediaPlayer.video((video) => {
            const $video = video;
            const videoSrc = res.url;

            if (Hls.isSupported()) {
              const hls = (useApp.values.hls = new Hls());

              hls.loadSource(videoSrc);
              hls.attachMedia($video);
              hls.on(Hls.Events.MANIFEST_PARSED, function () {});
            } else if ($video.canPlayType("application/vnd.apple.mpegurl")) {
              $video.src = videoSrc;
            }
          });
        } else alert("Video no disponible");
      });
    } else if (["voe"].includes(host)) {
      MediaWebUrl.voesx({ url: url }).then((res) => {
        if (res.status) {
          mediaPlayer.video((video) => {
            const $video = video;
            const videoSrc = res.url;

            if (Hls.isSupported()) {
              const hls = (useApp.values.hls = new Hls());

              hls.loadSource(videoSrc);
              hls.attachMedia($video);
              hls.on(Hls.Events.MANIFEST_PARSED, function () {});
            } else if ($video.canPlayType("application/vnd.apple.mpegurl")) {
              $video.src = videoSrc;
            }
          });
        } else alert("Video no disponible");
      });
    } else if (["doodstream"].includes(host)) {
      MediaWebUrl.doodstream({ url: url }).then((res) => {
        if (res.status) {
          mediaPlayer.video((video) => {
            video.src = res.url;
          });
        } else alert("Video no disponible");
      });
    } else if (["yourupload"].includes(host)) {
      MediaWeb.yourupload({ url: url }).then((res) => {
        if (res.body.status) {
          mediaPlayer.video((video) => {
            video.src = res.body.url;
          });
        } else alert("Video no disponible");
      });
    }
  };

  useThis.functions.dataLoad = () => {
    ApiWebCuevana.peliculaId(useThis.params.id).then((datas) => {
      useThis.reactivity.load.value = true;
      useThis.reactivity.data.value = {
        ...datas.props.pageProps.thisMovie,
        movies: Object.keys(datas.props.pageProps).reduce((prev, curr) => {
          const array = datas.props.pageProps[curr];
          if (Array.isArray(array)) prev[curr] = array;
          return prev;
        }, {}),
      };
      useThis.reactivity.load.value = false;
    });
  };

  useThis.functions.updateHistory = (currentTime, duration = 0) => {
    if (useThis.values.isConnected) {
      const encodeQueryString = encodeQueryObject({
        route: "update-history-view",
        episode: useThis.values.episode,
        time_view: currentTime,
        time_duration: duration,
        datetime: Date.now(),
        data_id: useThis.values.data_id,
        type: 2,
      });

      fetch(
        useApp.url.server(`/api.php?${encodeQueryString}`),
        useApp.fetchOptions({
          method: "GET",
        })
      );
    }
  };

  useThis.functions.updateHistoryVideo = () => {
    useApp.mediaPlayer.video((video) => {
      let times = {};
      let status = false;

      video.src = "";

      video.onloadedmetadata = () => {
        times = {};
        status = false;

        const currentTime =
          parseInt(
            useThis.values.streaming?.episodes?.[useThis.values.episode]
              ?.time_view
          ) || 0;

        video.currentTime = currentTime;
      };

      video.ontimeupdate = (e) => {
        if (status) {
          const num = Math.floor(e.target.currentTime);

          if (num > 0 && num % 15 == 0 && !times[num]) {
            times[num] = true;
            useThis.functions.updateHistory(
              num,
              Math.ceil(video.duration) || 0
            );
          }
        }
      };

      video.onseeked = () => {
        const currentTime = Math.floor(video.currentTime);
        useThis.functions.updateHistory(
          currentTime,
          Math.ceil(video.duration) || 0
        );

        times = {};
        times[currentTime] = true;

        status = true;
      };
    });
  };

  $elements.season.addEventListener("click", (e) => {
    const button = e.target.closest("button");

    if (button) {
      $elements.season
        .querySelectorAll("button.focus")
        .forEach((element) => element.classList.remove("focus"));
      button.classList.add("focus");

      const dataIndex = button.getAttribute("data-index");
      $elements.season.setAttribute("data-index", dataIndex);
      //otherMovies.value = dataIndex == '' ? Object.values(useThis.reactivity.data.value.movies).flat() : useThis.reactivity.data.value.movies[dataIndex]
    }
  });

  $elements.play.addEventListener("click", () => {
    const data = JSON.parse($elements.play.getAttribute("data-data"));
    $elements.itemTrueOption.showPopover();

    $elements.itemTrueOptionVideos.innerHTML =
      '<div class="loader-i m-auto g-col-full" style="--color:var(--color-letter); padding: 20px 0"></div>';

    Promise.all([
      // add more aditional server,
      data.videos,
    ]).then((res) => {
      const mergedObject = res.reduce((acc, obj) => ({ ...acc, ...obj }), {});

      $elements.itemTrueOptionVideos.innerHTML = Object.entries(mergedObject)
        .map((data) => {
          let show = true;

          return data[1]
            .map((video) => {
              if (video.result == "") return "";
              if (!["doodstream", "streamwish"].includes(video.cyberlocker))
                return "";

              const visibility = show ? "" : "display:none";
              show = false;

              return `
                <span 
                  class="span_eNUkEzu" 
                  style="${visibility}">
                  ${data[0].slice(0, 3).toUpperCase()}
                </span>
                <button 
                  class="button_NuUj5A6" 
                  data-type="" 
                  data-url="${video.result}" 
                  data-quality="">
                    
                    <div class="div_Z8bTLpN">
                        <span>${video.cyberlocker}</span>
                        <p>${video.quality}</p>
                    </div>
                    
                </button>
              `;
            })
            .join("");
        })
        .join("");
    });
  });

  $elements.favorite.addEventListener("click", () => {
    // if (!useThis.values.isConnected) {
    //   return (location.hash = "#/login");
    // }
    useThis.reactivity.isFavorite.value = !useThis.reactivity.isFavorite.value;

    const encodeQueryString = encodeQueryObject({
      route: "toggle-favorites",
      data_id: useThis.reactivity.data.value.TMDbId,
      type: 2,
      action: $elements.favorite.dataset.action,
    });

    fetch(
      useApp.url.server(`/api.php?${encodeQueryString}`),
      useApp.fetchOptions({
        method: "GET",
      })
    )
      .then((res) => res.json())
      .then((data) => {
        if (data == null) {
          location.hash = "#/login";
          return;
        }

        if (data?.status) {
          useThis.reactivity.isFavorite.value = data.type == 1;
        }
      });
  });

  $elements.inputView.addEventListener("change", () => {
    // if (!useThis.values.isConnected) {
    //   return (location.hash = "#/login");
    // }

    // useThis.reactivity.isView.value = !useThis.reactivity.isView.value;

    const encodeQueryString = encodeQueryObject({
      route: "toggle-views",
      data_id: useThis.reactivity.data.value.TMDbId,
      type: 2,
      action: $elements.inputView.checked ? 1 : 0,
    });

    fetch(
      useApp.url.server(`/api.php?${encodeQueryString}`),
      useApp.fetchOptions({
        method: "GET",
      })
    )
      .then((res) => res.json())
      .then((data) => {
        if (data == null) {
          location.hash = "#/login";
          return;
        }

        if (data?.status) {
          $elements.inputView.checked = data.type == 1;
        }
      });
  });

  $elements.itemTrueOptionVideos.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button) {
      $elements.itemTrueOption.hidePopover();

      ApiWebCuevana.serverUrl(button.getAttribute("data-url")).then((url) => {
        useThis.functions.getLinkServer(url);
      });

      useApp.mediaPlayer.element().requestFullscreen();
      useThis.functions.updateHistoryVideo();

      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: $elements.title.textContent,
          artist: $elements.genres.textContent,
          album: "Pelicula",
          artwork: [
            {
              src: $elements.poster.src,
              sizes: "512x512",
              type: "image/png",
            },
          ],
        });
      }
    }
  });

  $elements.itemTrueOption.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
      $elements.itemTrueOption.hidePopover();
    }
  });

  useApp.elements.meta.color.setAttribute("content", "#000000");
  useThis.functions.dataLoad();

  useApp.functions.historyBack($element.querySelector("[data-history-back]"));
  return $element;
};

var serieId = () => {
  const useApp = window.dataApp;
  const useThis = {
    params: useApp.routes.params(),
    functions: {},
    val: {
      dataInfo: null,
    },
    reactivity: {
      isFavorite: defineVal(false),
      isView: defineVal(false),
      load: defineVal(true),
      data: defineVal({}),
      episodes: defineVal([]),
      dataTrueInfoRefresh: true,
    },
    values: {
      isConnected: false,
      observes: [],
      streaming: {},
      episode: -1,
      data_id: "",
    },
  };

  const $element = replaceNodeChildren(
    createNodeElement(`
        <div class="div_Xu02Xjh children-hover div_mrXVL9t">
            <header class="header_K0hs3I0 header_XpmKRuK header_RtX3J1X">

                <div class="div_uNg74XS">
                    <a href="#/serie" class="button_lvV6qZu" data-history-back>
                      ${useApp.icon.get("fi fi-rr-angle-small-left")}
                    </a>
                </div>
                <h2 id="title" style="flex: 1; text-align:center; font-size: clamp(1rem, 2vw, 2rem);"></h2>
                <div class="div_x0cH0Hq">
                    <button id="favorite" class="button_lvV6qZu" data-action="0" style="visibility:hidden">
                      ${useApp.icon.get("fi fi-rr-heart")}
                    </button>
                </div>

            </header>
 
            <div id="item" class="div_guZ6yID div_DtSQApy" >
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                    ${useApp.icon.get("fi fi-rr-search-alt")}
                    <h3>La pelicula no existe</h3>
                </div>
                <div id="itemTrue" class="div_4MNvoOW">

                    <div class="div_rCXoNm8" style="display:none">
                        <div class="div_vm3LkIt">
                            <img id="backdrop" src="">
                        </div>
                        <div class="div_y6ODhoe">
                            <picture class="picture_BLSEWfU"><img id="poster" src=""></picture>
                            <div class="div_K2RbOsL">
                                <h2 ></h2>
                                <p id="overview"></p>
                                <div class="div_aSwP0zW">
                                    <span id="genres"></span>
                                    <span id="duration"></span>
                                    <span id="date"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="div_cnJqhFl">
                      <div class="div_0JOSFlg">
                        <img id="poster" src="">
                      </div>
                      <div class="div_cxFXOaL">
                        <label class="label_zjZIMnZ">
                          <input type="checkbox" id="inputView">
                          <span style="display:flex"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-check"><path d="M22.319,4.431,8.5,18.249a1,1,0,0,1-1.417,0L1.739,12.9a1,1,0,0,0-1.417,0h0a1,1,0,0,0,0,1.417l5.346,5.345a3.008,3.008,0,0,0,4.25,0L23.736,5.847a1,1,0,0,0,0-1.416h0A1,1,0,0,0,22.319,4.431Z"></path></svg></span>
                        </label>
                        <button id="play" class="button_bDfhQ4b" style="display:none">
                          <small>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-sr-play"><path d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z"></path></svg>
                          </small>
                          <span>Reproducir</span>
                        </button>
                      </div>
                      <hr class="hr_nTfcjTI">
                      <div class="div_aSwP0zW" style="text-align:center">
                          <span id="genres"></span>
                          <span id="duration"></span>
                          <span id="date"></span>
                      </div>
                      <hr class="hr_nTfcjTI">
                      <p id="overview" style="text-align:center; font-size:14px"></p>
                    </div>

                    <div class="div_rJOqfX3">
                        <div class="div_WslendP" style="scrollbar-width:none;">
                            <div id="season" class="div_z0PiH0E" data-season="0" data-data="[]" ></div>
                        </div>
                        <div id="episodes" class="div_bi3qmqX" data-class="div_2cD7Iqb"></div>
                    </div>
                    
                </div>
            </div>
           
            <div id="itemTrueOption" class="div_5Pe946IMjyL1Rs" popover>
                <div class="div_dsb3nhtCrFmUlSN p-10px">
                    <div class="div_cXaADrL pointer-on">
                        <div id="itemTrueOptionVideos" class="div_lm2WViG"></div>
                    </div>
                </div>
            </div>
        </div>
    `),
    {},
    true
  );

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  const isFavorite = defineVal(false);
  isFavorite.observe((isFavorite) => {
    $elements.favorite.innerHTML = useApp.icon.get(
      isFavorite ? "fi fi-sr-heart" : "fi fi-rr-heart"
    );
  });

  useThis.reactivity.isFavorite.observe((isFavorite) => {
    $elements.favorite.innerHTML = useApp.icon.get(
      isFavorite ? "fi fi-sr-heart" : "fi fi-rr-heart"
    );
  });

  useThis.reactivity.isView.observe((isView) => {
    $elements.inputView.checked = isView;
  });

  useThis.reactivity.load.observe((load) => {
    const render = {
      itemNull: load,
      itemFalse: !load && !Object.keys(useThis.reactivity.data.value).length,
      itemTrue: !load && !!Object.keys(useThis.reactivity.data.value).length,
    };

    Object.entries(render).forEach((keyvalue) => {
      $elements[keyvalue[0]].style.display = keyvalue[1] ? "" : "none";
    });
  });

  useThis.reactivity.data.observe((data) => {
    if (Boolean(Object.keys(data).length)) {
      // $elements.backdrop.src  = useApp.url.img( `https://cuevana.biz/_next/image?url=${ data.images.backdrop }&w=828&q=75` )
      $elements.poster.src = useApp.url.img(
        data.images.poster.replace("/original/", "/w342/")
      );
      $elements.title.textContent = data.titles.name;
      $elements.overview.textContent = data.overview;
      $elements.genres.textContent = data.genres
        .map((genre) => genre.name)
        .join(", ");
      $elements.duration.textContent = `${
        data.seasons.at(-1).number
      } temporadas`;
      $elements.date.textContent = new Date(data.releaseDate).getFullYear();

      const seasons = data.seasons.filter((season) => season.episodes.length);

      $elements.season.innerHTML = seasons
        .map((season, index) => {
          if (!season.episodes.length) return "";
          return `
            <button 
              data-season="${index}" 
              class="${index == 0 ? "focus" : ""}">
                <span>Temporada ${season.number}</span>
            </button>
          `;
        })
        .join("");

      $elements.season.setAttribute("data-data", JSON.stringify(seasons));
      useThis.functions.renderSeason();

      useThis.reactivity.isFavorite.value = JSON.parse(
        localStorage.getItem("favorite_serie")
      ).some((video) => video.TMDbId == data.TMDbId);
      $elements.itemTrue.append(document.createTextNode(""));

      getDominantColor($elements.poster).then((result) => {
        const color = darkenHexColor(result, 50);

        $element.style.background = color;
        $elements.season.parentElement.style.background = color;
        $elements.itemTrueOptionVideos.parentElement.style.background =
          darkenHexColor(result, 60);
        useApp.elements.meta.color.setAttribute("content", color);
      });

      useThis.functions.dataTrueInfo(data);
    }
  });

  useThis.functions.dataTrueInfo = (data) => {
    useThis.values.data_id = data.TMDbId;

    const encodeQueryString = encodeQueryObject({
      route: "favorites-one",
      data_id: data.TMDbId,
      type: 3,
    });

    const body = {
      data_id: data.TMDbId,
      data_json: JSON.stringify(
        Object.entries(data).reduce((prev, curr) => {
          if (["TMDbId", "titles", "url", "images"].includes(curr[0])) {
            prev[curr[0]] = curr[1];
          }
          return prev;
        }, {})
      ),
      type: 3,
    };

    fetch(
      useApp.url.server(`/api.php?${encodeQueryString}`),
      useApp.fetchOptions({
        method: "POST",
        body: JSON.stringify(body),
      })
    )
      .then((res) => res.json())
      .then((data) => {
        useThis.values.streaming = data;
        $elements.favorite.style.visibility = "";
        useThis.values.isConnected = Boolean(data);

        if (useThis.values.isConnected) {
          useThis.reactivity.isFavorite.value = Boolean(data?.favorite);
          useThis.reactivity.isView.value = Boolean(data?.view);

          useThis.functions.renderSeason();
        }
      });
  };

  useThis.functions.renderSeason = () => {
    const index = parseInt($elements.season.getAttribute("data-season"));
    const seasons = JSON.parse($elements.season.getAttribute("data-data"));
    const episodes = seasons[index].episodes;
    const season = seasons[index].number;

    const array =
      localStorage.getItem("episodes_direction") == 0
        ? episodes
        : episodes.reverse();

    $elements.episodes.innerHTML = array
      .map((episode) => {
        useApp.url.img(
          `https://cuevana.biz/_next/image?url=${episode.image}&w=384&q=75`
        );

        const episodeInfo =
          useThis.values.streaming?.episodes?.[`${season}-${episode.number}`];

        const dataData = EncodeTemplateString.toInput(JSON.stringify(episode));
        const checked = episodeInfo != undefined ? "checked" : "";

        const displayInput = useThis.values.isConnected ? "" : "display:none";
        return `
          <div data-episode="${episode.number}" class="div_eGwK6I1">
            <button 
            class="button_fk0VHgU" 
              data-data="${dataData}" 
              data-season="${season}"
              data-episode="${episode.number}"
              data-item>
                <span>
                  T${season.toString().padStart(2, "0")} 
                  E${episode.number.toString().padStart(2, "0")}
                </span>
                <small>
                  ${
                    parseInt(episodeInfo?.time_view)
                      ? "visto ".concat(
                          useApp.functions.formatTime(episodeInfo.time_view)
                        )
                      : ""
                  }
                  ${
                    parseInt(episodeInfo?.time_duration)
                      ? "de ".concat(
                          useApp.functions.formatTime(episodeInfo.time_duration)
                        )
                      : ""
                  }
                </small>
            </button>
            <label class="label_zjZIMnZ" style="${displayInput}">
              <input type="checkbox" 
                data-season="${season}" 
                data-episode="${episode.number}" ${checked}>
              <span style="display:flex"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-check"><path d="M22.319,4.431,8.5,18.249a1,1,0,0,1-1.417,0L1.739,12.9a1,1,0,0,0-1.417,0h0a1,1,0,0,0,0,1.417l5.346,5.345a3.008,3.008,0,0,0,4.25,0L23.736,5.847a1,1,0,0,0,0-1.416h0A1,1,0,0,0,22.319,4.431Z"></path></svg></span>
            </label>
          </div>
        `;
      })
      .join("");

    // Array.from($elements.episodes.children).forEach((child) => {
    //   child.addEventListener("_IntersectionObserver", ({ detail }) => {
    //     if (detail.entry.isIntersecting) {
    //       detail.observer.unobserve(detail.entry.target);

    //       const img = child.querySelector("img");
    //       img.onload = () => (img.style.display = "");
    //       img.src = img.dataset.src;
    //     }
    //   });

    //   useApp.instances.IntersectionObserver.observe(child);
    //   useThis.values.observes.push(child);
    // });

    if (!episodes.length) {
      $elements.episodes.innerHTML = `
        <div class="div_Qm4cPUn">
          <div id="itemFalse" class="div_b14S3dH">
            ${useApp.icon.get("fi fi-rr-search-alt")}
            <h3>No hay capitulos</h3>
          </div>
        </div>
      `;
    }
  };

  useThis.functions.setLinkServer = (url) => {
    const newURL = new URL(url);
    const hostSplit = newURL.host.split(".");
    const host = hostSplit.length == 3 ? hostSplit[1] : hostSplit[0];

    const mediaPlayer = useApp.mediaPlayer;

    if (["streamwish"].includes(host)) {
      MediaWebUrl.streamwish({ url: url }).then((res) => {
        if (res.status) {
          mediaPlayer.video((video) => {
            const $video = video;
            const videoSrc = res.url;

            if (Hls.isSupported()) {
              const hls = (useApp.values.hls = new Hls());

              hls.loadSource(videoSrc);
              hls.attachMedia($video);
              hls.on(Hls.Events.MANIFEST_PARSED, function () {});
            } else if ($video.canPlayType("application/vnd.apple.mpegurl")) {
              $video.src = videoSrc;
            }
          });
        } else alert("Video no disponible");
      });
    } else if (["voe"].includes(host)) {
      MediaWebUrl.voesx({ url: url }).then((res) => {
        if (res.status) {
          mediaPlayer.video((video) => {
            const $video = video;
            const videoSrc = res.url;

            if (Hls.isSupported()) {
              const hls = (useApp.values.hls = new Hls());

              hls.loadSource(videoSrc);
              hls.attachMedia($video);
              hls.on(Hls.Events.MANIFEST_PARSED, function () {});
            } else if ($video.canPlayType("application/vnd.apple.mpegurl")) {
              $video.src = videoSrc;
            }
          });
        } else alert("Video no disponible");
      });
    } else if (["doodstream"].includes(host)) {
      MediaWebUrl.doodstream({ url: url }).then((res) => {
        if (res.body.status) {
          mediaPlayer.video((video) => {
            video.src = res.body.url;
          });
        } else alert("Video no disponible");
      });
    } else if (["yourupload"].includes(host)) {
      MediaWeb.yourupload({ url: url }).then((res) => {
        if (res.body.status) {
          mediaPlayer.video((video) => {
            video.src = res.body.url;
          });
        } else alert("Video no disponible");
      });
    }

    // if (["streamwish"].includes(host)) {
    //   MediaWebUrl.streamwish({ url: url }).then((res) => {
    //     if (res.status) mediaPlayer.open({ url: res.url, Hls: window.Hls });
    //     else alert("Video no disponible");
    //   });
    // } else if (["voe"].includes(host)) {
    //   MediaWebUrl.voesx({ url: url }).then((res) => {
    //     if (res.status) mediaPlayer.open({ url: res.url, Hls: window.Hls });
    //     else alert("Video no disponible");
    //   });
    // } else if (["doodstream"].includes(host)) {
    //   MediaWeb.doodstream({ url: url }).then((res) => {
    //     if (res.body.status) mediaPlayer.open({ url: res.body.url });
    //     else alert("Video no disponible");
    //   });
    // } else if (["yourupload"].includes(host)) {
    //   MediaWeb.yourupload({ url: url }).then((res) => {
    //     if (res.body.status) mediaPlayer.open({ url: res.body.url });
    //     else alert("Video no disponible");
    //   });
    // }
  };

  useThis.functions.dataLoad = () => {
    ApiWebCuevana.serieId(useThis.params.id).then((datas) => {
      useThis.reactivity.load.value = true;
      useThis.reactivity.data.value = datas.props.pageProps.thisSerie;
      useThis.reactivity.load.value = false;
    });
  };

  useThis.functions.unobserve = () => {
    for (const observe of useThis.values.observes) {
      useApp.instances.IntersectionObserver.unobserve(observe);
    }

    useThis.values.observes = [];
  };

  useThis.functions.updateHistory = (currentTime, duration = 0) => {
    if (useThis.values.isConnected) {
      const encodeQueryString = encodeQueryObject({
        route: "update-history-view",
        episode: useThis.values.episode,
        time_view: currentTime,
        time_duration: duration,
        datetime: Date.now(),
        data_id: useThis.values.data_id,
        type: 3,
      });

      fetch(
        useApp.url.server(`/api.php?${encodeQueryString}`),
        useApp.fetchOptions({
          method: "GET",
        })
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.status) {
            if (document.body.contains($element)) {
              useThis.functions.dataTrueInfo(useThis.reactivity.data.value);
            }
          }
        });
    }
  };

  useThis.functions.updateHistoryVideo = () => {
    useApp.mediaPlayer.video((video) => {
      let times = {};
      let status = false;

      video.src = "";
      useThis.reactivity.dataTrueInfoRefresh = true;

      video.onloadedmetadata = () => {
        times = {};
        status = false;

        const currentTime =
          parseInt(
            useThis.values.streaming?.episodes?.[useThis.values.episode]
              ?.time_view
          ) || 0;

        video.currentTime = currentTime;
      };

      video.ontimeupdate = (e) => {
        if (status) {
          const num = Math.floor(e.target.currentTime);

          if (num > 0 && num % 15 == 0 && !times[num]) {
            times[num] = true;
            useThis.functions.updateHistory(
              num,
              Math.ceil(video.duration) || 0
            );
          }
        }
      };

      video.onseeked = () => {
        const currentTime = Math.floor(video.currentTime);
        useThis.functions.updateHistory(
          currentTime,
          Math.ceil(video.duration) || 0
        );

        times = {};
        times[currentTime] = true;

        status = true;
      };
    });
  };

  $elements.season.addEventListener("click", (e) => {
    const button = e.target.closest("button");

    if (button) {
      if (button.classList.contains("focus")) {
        localStorage.setItem(
          "episodes_direction",
          localStorage.getItem("episodes_direction") ^ 1
        );
        $elements.episodes.append(
          ...Array.from($elements.episodes.children).reverse()
        );
      } else {
        $elements.season
          .querySelectorAll(".focus")
          .forEach((element) => element.classList.remove("focus"));
        button.classList.add("focus");
        $elements.season.setAttribute(
          "data-season",
          button.getAttribute("data-season")
        );

        useThis.functions.renderSeason();
      }
    }
  });

  $elements.episodes.addEventListener("click", (e) => {
    const item = e.target.closest("[data-item]");
    const input = e.target.closest("input");

    if (item) {
      $elements.itemTrueOption.showPopover();
      $elements.itemTrueOptionVideos.setAttribute(
        "data-episode",
        `${item.dataset.season}-${item.dataset.episode}`
      );
      $elements.itemTrueOptionVideos.innerHTML =
        '<div class="loader-i m-auto g-col-full" style="--color:var(--color-letter); padding: 20px 0"></div>';

      ApiWebCuevana.serieId(
        useThis.params.id,
        item.getAttribute("data-season"),
        item.getAttribute("data-episode")
      ).then((response) => {
        useThis.val.dataInfo = response;
        $elements.itemTrueOptionVideos.innerHTML = Object.entries(
          response.props.pageProps.episode.videos
        )
          .map((data) => {
            let show = true;

            return data[1]
              .map((video) => {
                if (video.result == "") return "";
                if (!["doodstream", "streamwish"].includes(video.cyberlocker))
                  return "";

                const visibility = show ? "" : "display:none";
                show = false;

                return `
                  <span 
                    class="span_eNUkEzu" 
                    style="${visibility}">
                      ${data[0].slice(0, 3).toUpperCase()}
                  </span>
                  <button 
                    class="button_NuUj5A6" 
                    data-type="" 
                    data-url="${video.result}" 
                    data-quality="">
                      
                      <div class="div_Z8bTLpN">
                          <span>${video.cyberlocker}</span>
                          <p>${video.quality}</p>
                      </div>
                      
                  </button>
              `;
              })
              .join("");
          })
          .join("");
      });
    }

    if (input) {
      const encodeQueryString = encodeQueryObject({
        route: "toggle-history-view",
        episode: `${input.dataset.season}-${input.dataset.episode}`,
        datetime: Date.now(),
        data_id: useThis.values.data_id,
        type: 3,
        action: input.checked ? 1 : 0,
      });

      fetch(
        useApp.url.server(`/api.php?${encodeQueryString}`),
        useApp.fetchOptions({
          method: "GET",
        })
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.status) {
            input.checked = data.type == 1;
          }
        });
    }
  });

  $elements.favorite.addEventListener("click", () => {
    $elements.favorite.setAttribute(
      "data-action",
      $elements.favorite.getAttribute("data-action") != 0 ? 0 : 1
    );

    // if (!useThis.values.isConnected) {
    //   return (location.hash = "#/login");
    // }

    useThis.reactivity.isFavorite.value = !useThis.reactivity.isFavorite.value;

    const encodeQueryString = encodeQueryObject({
      route: "toggle-favorites",
      data_id: useThis.reactivity.data.value.TMDbId,
      type: 3,
      action: $elements.favorite.dataset.action,
    });

    fetch(
      useApp.url.server(`/api.php?${encodeQueryString}`),
      useApp.fetchOptions({
        method: "GET",
      })
    )
      .then((res) => res.json())
      .then((data) => {
        if (data == null) {
          location.hash = "#/login";
          return;
        }

        if (data?.status) {
          useThis.reactivity.isFavorite.value = data.type == 1;
        }
      });
  });

  $elements.inputView.addEventListener("click", () => {
    // if (!useThis.values.isConnected) {
    //   return (location.hash = "#/login");
    // }

    // useThis.reactivity.isFavorite.value = !useThis.reactivity.isFavorite.value;

    const encodeQueryString = encodeQueryObject({
      route: "toggle-views",
      data_id: useThis.reactivity.data.value.TMDbId,
      type: 3,
      action: $elements.inputView.checked ? 1 : 0,
    });

    fetch(
      useApp.url.server(`/api.php?${encodeQueryString}`),
      useApp.fetchOptions({
        method: "GET",
      })
    )
      .then((res) => res.json())
      .then((data) => {
        if (data == null) {
          location.hash = "#/login";
          return;
        }

        if (data?.status) {
          $elements.inputView.checked = data.type == 1;
          // useThis.reactivity.isView.value = data.type == 1;
        }
      });
  });

  $elements.itemTrueOptionVideos.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button) {
      useThis.values.episode = $elements.itemTrueOptionVideos.dataset.episode;
      const [season, episode] = useThis.values.episode.split("-");

      $elements.itemTrueOption.hidePopover();
      useApp.mediaPlayer.element().requestFullscreen();
      useThis.functions.updateHistoryVideo();

      useApp.mediaPlayer.info({
        title: useThis.val.dataInfo.props.pageProps.episode.title,
        description: useThis.val.dataInfo.props.pageProps.serie.genres
          .map((genre) => genre.name)
          .join(", "),
      });

      useApp.mediaPlayer.controls({
        options: {
          not: ["download"],
        },
      });

      ApiWebCuevana.serverUrl(button.getAttribute("data-url")).then((url) => {
        useThis.functions.setLinkServer(url);
      });

      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: $elements.title.textContent,
          artist: `T${season.padStart(2, "0")} E${episode.padStart(2, "0")}`,
          album: "Serie",
          artwork: [
            {
              src: $elements.poster.src,
              sizes: "512x512",
              type: "image/png",
            },
          ],
        });
      }
    }
  });

  $elements.itemTrueOption.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
      $elements.itemTrueOption.hidePopover();
    }
  });

  addEventListener(
    "hashchange",
    () => {
      useThis.functions.unobserve();
    },
    { once: true }
  );

  useApp.functions.scrollY({
    target: $elements.season.parentElement,
    events: {
      move: () => {
        $elements.season.style.pointerEvents = "none";
      },
      end: () => {
        $elements.season.style.pointerEvents = "";
      },
    },
  });

  useApp.elements.meta.color.setAttribute("content", "#000000");
  useThis.functions.dataLoad();

  useApp.functions.historyBack($element.querySelector("[data-history-back]"));
  return $element;
};

var genders$1 = [
  "Accion",
  "Aventura",
  "Animacion",
  "Ciencia ficcion",
  "Crimen",
  "Drama",
  "Familia",
  "Fantasia",
  "Misterio",
  "Romance",
  "Suspense",
  "Terror",
];

var pelicula = () => {
  const useApp = window.dataApp;
  const useThis = {
    params: useApp.routes.params(),
    reactivity: {
      load: defineVal(true),
      Data: defineVal([]),
    },
    values: {
      observes: [],
    },
    functions: {},
  };

  const $element = createNodeElement(`

        <div class="div_Xu02Xjh">


            <header class="header_K0hs3I0">

                <div class="div_uNg74XS">
                    <a href="#/" class="button_lvV6qZu">
                      ${useApp.icon.get("fi fi-rr-angle-small-left")}
                    </a>
                    <h3 id="textTitle">Pelicula</h3>
                </div>

                <div class="div_x0cH0Hq">
                    <a href="#/search/pelicula" class="button_lvV6qZu">
                      ${useApp.icon.get("fi fi-rr-search")}
                    </a>  
                </div>

            </header>
  
            <div class="div_BIchAsC" style="scrollbar-width: none">
                <div id="buttonsFocus" data-gender="Todos" class="div_O73RBqH">
                    <button data-gender="Todos" class="focus">Todos</button>
                    <button data-gender="Favoritos" style="display:none;">Favoritos</button>
                    ${genders$1
                      .map((gender) => {
                        return `<button data-gender="${gender}" >${gender}</button>`;
                      })
                      .join("")}
                </div>
            </div>

            <div class="div_IsTCHpN">
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                    ${useApp.icon.get("fi fi-rr-search-alt")}
                    <h3>sin resultados</h3>
                </div>
                <div id="itemTrue" class="div_qsNmfP3">
                    <div id="itemTrueLoad" class="div_Qm4cPUn">
                        <div class="loader-i" style="--color:var(--color-letter)"></div>
                    </div>
                </div>
            </div>

        </div>

    `);

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  useThis.reactivity.load.observe((load) => {
    const render = {
      itemNull: load,
      itemFalse: !load && !Object.keys(useThis.reactivity.Data.value).length,
      itemTrue: !load && !!Object.keys(useThis.reactivity.Data.value).length,
    };

    Object.entries(render).forEach((keyvalue) => {
      $elements[keyvalue[0]].style.display = keyvalue[1] ? "" : "none";
    });
  });

  useThis.reactivity.Data.observe((Data) => {
    const fragment = document.createDocumentFragment();
    fragment.append(document.createTextNode(""));
    fragment.append(
      ...Data.map((data) => {
        const slug = data.url.slug
          .split("/")
          .map((name, index) => {
            if (index == 0) {
              if (name == "movies") return "pelicula";
              else if (name == "series") return "serie";
            }
            return name;
          })
          .join("/");

        if (data.images.poster == null) return "";

        const url = useApp.url.img(
          data.images.poster.replace("/original/", "/w185/")
        );

        const element = createNodeElement(`
          <a 
            href="#/${slug.split("/")[0]}/${data.TMDbId}" 
            class="div_SQpqup7" data-item>
                     
              <div class="div_fMC1uk6">
                  <img src="" alt="" data-src="${url}" style="display:none">
                  <span>${slug.split("/")[0]}</span>
              </div>
              <div class="div_9nWIRZE">
                  <p>${data.titles.name}</p>
              </div>
    
          </a>    
        `);

        element.addEventListener("_IntersectionObserver", ({ detail }) => {
          if (detail.entry.isIntersecting) {
            detail.observer.unobserve(detail.entry.target);

            const img = element.querySelector("img");
            img.onload = () => (img.style.display = "");
            img.src = img.dataset.src;
          }
        });

        useApp.instances.IntersectionObserver.observe(element);
        useThis.values.observes.push(element);
        return element;
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();

    if (Data.length > 23) {
      $elements.itemTrue.append($elements.itemTrueLoad);
      useApp.instances.IntersectionObserver.observe($elements.itemTrueLoad);
    }
  });

  useThis.functions.dataLoad = () => {
    setTimeout(() => {
      const page =
        Math.floor(
          $elements.itemTrue.querySelectorAll("[data-item]").length / 24
        ) + 1;

      let gender = $elements.buttonsFocus.getAttribute("data-gender");
      gender =
        gender != "Todos"
          ? gender.split(" ").join("-").toLowerCase().trim()
          : "";

      ApiWebCuevana.pelicula(page, gender).then((data) => {
        useThis.reactivity.load.value = true;
        useThis.reactivity.Data.value = data.props.pageProps.movies;
        useThis.reactivity.load.value = false;
      });
    });
  };

  useThis.functions.unobserve = () => {
    for (const observe of useThis.values.observes) {
      useApp.instances.IntersectionObserver.unobserve(observe);
    }

    useThis.values.observes = [];
  };

  $elements.buttonsFocus.addEventListener("click", (e) => {
    const button = e.target.closest("button");

    if (button) {
      $elements.buttonsFocus
        .querySelectorAll(".focus")
        .forEach((element) => element.classList.remove("focus"));
      button.classList.add("focus");
      $elements.buttonsFocus.setAttribute(
        "data-gender",
        button.getAttribute("data-gender")
      );

      useThis.reactivity.load.value = true;
      $elements.itemTrue.innerHTML = "";
      useThis.functions.unobserve();
      useThis.functions.dataLoad();

      button.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  });

  useApp.functions.scrollY({
    target: $elements.buttonsFocus.parentElement,
    events: {
      move: () => {
        $elements.buttonsFocus.style.pointerEvents = "none";
      },
      end: () => {
        $elements.buttonsFocus.style.pointerEvents = "";
      },
    },
  });

  $elements.itemTrueLoad.addEventListener(
    "_IntersectionObserver",
    ({ detail }) => {
      if (detail.entry.isIntersecting) {
        detail.observer.unobserve(detail.entry.target);
        useThis.functions.dataLoad();
      }
    }
  );

  addEventListener(
    "hashchange",
    () => {
      useThis.functions.unobserve();
    },
    { once: true }
  );

  useThis.functions.dataLoad();
  return $element;
};

var serie = () => {
  const useApp = window.dataApp;
  const useThis = {
    params: useApp.routes.params(),
    reactivity: {
      load: defineVal(true),
      Data: defineVal([]),
    },
    functions: {},
    values: {
      observes: [],
    },
  };

  const $element = createNodeElement(`

        <div class="div_Xu02Xjh">

            <header class="header_K0hs3I0">

                <div class="div_uNg74XS">
                    <a href="#/" class="button_lvV6qZu"> 
                      ${useApp.icon.get("fi fi-rr-angle-small-left")}
                    </a>
                    <h3 id="textTitle">Series</h3>
                </div>

                <div class="div_x0cH0Hq">
                    <a href="#/search/serie" class="button_lvV6qZu">
                      ${useApp.icon.get("fi fi-rr-search")}
                    </a>
                </div>

            </header>

            <div class="div_BIchAsC" style="display:none">
                <div id="buttonsFocus" data-gender="Todos" class="div_O73RBqH">
                    <button data-gender="Todos" class="focus">Todos</button>
                    <button data-gender="Favoritos" style="display:none;">Favoritos</button>
                </div>
            </div>

            <div class="div_IsTCHpN">
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                    ${useApp.icon.get("fi fi-rr-search-alt")}
                    <h3>sin resultados</h3>
                </div>
                <div id="itemTrue" class="div_qsNmfP3">
                    <div id="itemTrueLoad" class="div_Qm4cPUn">
                        <div class="loader-i" style="--color:var(--color-letter)"></div>
                    </div>
                </div>
            </div>

        </div>

    `);

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  useThis.reactivity.load.observe((load) => {
    const render = {
      itemNull: load,
      itemFalse: !load && !Object.keys(useThis.reactivity.Data.value).length,
      itemTrue: !load && !!Object.keys(useThis.reactivity.Data.value).length,
    };

    Object.entries(render).forEach((keyvalue) => {
      $elements[keyvalue[0]].style.display = keyvalue[1] ? "" : "none";
    });
  });

  useThis.reactivity.Data.observe((Data) => {
    const fragment = document.createDocumentFragment();
    fragment.append(document.createTextNode(""));
    fragment.append(
      ...Data.map((data) => {
        const slug = data.url.slug
          .split("/")
          .map((name, index) => {
            if (index == 0) {
              if (name == "movies") return "pelicula";
              else if (name == "series") return "serie";
            }
            return name;
          })
          .join("/");

        const url = useApp.url.img(
          data.images.poster.replace("/original/", "/w185/")
        );

        const element = createNodeElement(`
                <a 
                  href="#/${slug.split("/")[0]}/${data.TMDbId}" 
                  class="div_SQpqup7" 
                  data-item>

                    <div class="div_fMC1uk6">
                        <img src="" alt="" data-src="${url}" style="display:none">
                        <span>${slug.split("/")[0]}</span>
                    </div>
                    <div class="div_9nWIRZE">
                        <p>${data.titles.name}</p>
                    </div>
    
                </a>
            `);

        element.addEventListener("_IntersectionObserver", ({ detail }) => {
          if (detail.entry.isIntersecting) {
            detail.observer.unobserve(detail.entry.target);

            const img = element.querySelector("img");
            img.onload = () => (img.style.display = "");
            img.src = img.dataset.src;
          }
        });

        useApp.instances.IntersectionObserver.observe(element);
        useThis.values.observes.push(element);

        return element;
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();

    if (Data.length > 23) {
      $elements.itemTrue.append($elements.itemTrueLoad);
      useApp.instances.IntersectionObserver.observe($elements.itemTrueLoad);
      // intersectionObserver.observe($elements.itemTrueLoad);
    }
  });

  useThis.functions.dataLoad = () => {
    const page =
      Math.floor(
        $elements.itemTrue.querySelectorAll("[data-item]").length / 24
      ) + 1;

    ApiWebCuevana.serie(page).then((datas) => {
      useThis.reactivity.load.value = true;
      useThis.reactivity.Data.value = datas.props.pageProps.movies;
      useThis.reactivity.load.value = false;
    });
  };

  useThis.functions.unobserve = () => {
    for (const observe of useThis.values.observes) {
      useApp.instances.IntersectionObserver.unobserve(observe);
    }

    useThis.values.observes = [];
  };

  $elements.buttonsFocus.addEventListener("click", (e) => {
    const button = e.target.closest("button");

    if (button) {
      $elements.buttonsFocus
        .querySelectorAll(".focus")
        .forEach((element) => element.classList.remove("focus"));
      button.classList.add("focus");
      $elements.buttonsFocus.setAttribute(
        "data-gender",
        button.getAttribute("data-gender")
      );

      useThis.reactivity.load.value = true;
      $elements.itemTrue.innerHTML = "";
      useThis.functions.dataLoad();
    }
  });

  $elements.itemTrueLoad.addEventListener(
    "_IntersectionObserver",
    ({ detail }) => {
      if (detail.entry.isIntersecting) {
        detail.observer.unobserve(detail.entry.target);
        useThis.functions.dataLoad();
      }
    }
  );

  addEventListener(
    "hashchange",
    () => {
      useThis.functions.unobserve();
    },
    { once: true }
  );

  useThis.functions.dataLoad();

  return $element;
};

var youtube = () => {
  const useApp = window.dataApp;
  const useThis = {
    params: useApp.routes.params(),
    reactivity: {
      load: defineVal(true),
      Data: defineVal([]),
    },
    functions: {},
  };

  const $element = createNodeElement(`

        <div class="div_Xu02Xjh">

            <header class="header_K0hs3I0">

                <div class="div_uNg74XS">
                    <a href="#/" class="button_lvV6qZu">
                      ${useApp.icon.get("fi fi-rr-angle-small-left")}
                    </a>
                    <h3 id="textTitle">YT Videos</h3>
                </div>

                <div class="div_x0cH0Hq">
                    <a href="#/catalogo/search/youtube" class="button_lvV6qZu">
                      ${useApp.icon.get("fi fi-rr-search")}
                    </a>
                </div>
  
            </header>

            <div class="div_BIchAsC">
                <div id="buttonsFocus" data-gender="Todos" class="div_O73RBqH">
                    <button data-gender="Todos" class="focus">Todos</button>
                    <button data-gender="Favoritos">Favoritos</button>
                </div>
            </div>
            
            <div class="div_IsTCHpN">
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                    ${useApp.icon.get("fi fi-rr-search-alt")}
                    <h3>sin resultados</h3>
                </div>
                <div id="itemTrue" class="div_FtxwFbU"></div>
            </div>

        </div>

    `);

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  useThis.reactivity.load.observe((load) => {
    const render = {
      itemNull: load,
      itemFalse: !load && !Object.keys(useThis.reactivity.Data.value).length,
      itemTrue: !load && !!Object.keys(useThis.reactivity.Data.value).length,
    };

    Object.entries(render).forEach((keyvalue) => {
      $elements[keyvalue[0]].style.display = keyvalue[1] ? "" : "none";
    });
  });

  useThis.reactivity.Data.observe((Data) => {
    $elements.itemTrue.innerHTML = Data.map((data) => {
      return `
                <a 
                  href="#/youtube/${data.videoId}" 
                  class="div_EJlRW2l" 
                  data-id="${data.videoId}" 
                  data-item>

                    <div class="div_zcWgA0o">
                        <img src="${data.thumbnail.thumbnails[0].url}" alt="">
                    </div>
                    <div class="div_9nWIRZE">
                        <span>
                          ${data.author || data.ownerText.runs[0].text}
                        </span>
                        <p>
                          ${
                            data.title.runs
                              ? data.title.runs[0].text
                              : data.title
                          }
                        </p>
                    </div>
    
                </a>
            `;
    })
      .concat(" ")
      .join("");
  });

  useThis.functions.dataLoad = () => {
    setTimeout(() => {
      if ($elements.buttonsFocus.getAttribute("data-gender") == "Favoritos") {
        useThis.reactivity.Data.value = JSON.parse(
          localStorage.getItem("favorite_yt_video")
        );
        useThis.reactivity.load.value = false;
        return;
      }

      fetch(
        useApp.url.fetch(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(
            "dibujos animados"
          )}`
        )
      )
        .then((res) => res.text())
        .then((text) => {
          const $text = document.createElement("div");
          $text.innerHTML = text;

          Array.from($text.querySelectorAll("script, style")).forEach(
            (script) => {
              if (script.innerHTML.includes("var ytInitialData =")) {
                const index = script.innerHTML.indexOf("{");
                const lastIndex = script.innerHTML.lastIndexOf("}");

                const output = JSON.parse(
                  script.innerHTML.slice(index, lastIndex + 1)
                );
                const contents =
                  output.contents.twoColumnSearchResultsRenderer.primaryContents
                    .sectionListRenderer.contents[0].itemSectionRenderer
                    .contents;

                useThis.reactivity.load.value = true;
                useThis.reactivity.Data.value = contents
                  .filter((content) => content.videoRenderer)
                  .map((content) => content.videoRenderer);
                useThis.reactivity.load.value = false;
              }
            }
          );
        });
    });
  };

  $elements.buttonsFocus.addEventListener("click", (e) => {
    const button = e.target.closest("button");

    if (button) {
      $elements.buttonsFocus
        .querySelectorAll(".focus")
        .forEach((element) => element.classList.remove("focus"));
      button.classList.add("focus");
      $elements.buttonsFocus.setAttribute(
        "data-gender",
        button.getAttribute("data-gender")
      );

      useThis.reactivity.load.value = true;
      $elements.itemTrue.innerHTML = "";
      useThis.functions.dataLoad();
    }
  });

  // $elements.itemTrue.addEventListener('click', (e)=> {
  //     e.preventDefault()
  //     console.log(e.target);
  // })

  useThis.functions.dataLoad();
  return $element;
};

var youtubeId = () => {
  const useApp = window.dataApp;
  const useThis = {
    params: useApp.routes.params(),
    reactivity: {
      data: defineVal({}),
      load: defineVal(true),
    },
    value: {
      datas: [],
      reload: true,
    },
    functions: {},
  };

  const $element = replaceNodeChildren(
    createNodeElement(`
          <div class="div_Xu02Xjh children-hover">
              <header class="header_K0hs3I0 header_26DlSFi">
  
                  <div class="div_uNg74XS">
                      <a href="#/youtube" class="button_lvV6qZu">
                        ${useApp.icon.get("fi fi-rr-angle-small-left")}
                      </a>
                      <h3 id="textTitle"></h3>
                  </div>
  
                  <div class="div_x0cH0Hq">
                    <button id="favorite" class="button_lvV6qZu">
                      ${useApp.icon.get("fi fi-rr-heart")}
                    </button>
                    <button 
                        id="openOption" 
                        class="button_lvV6qZu" 
                        data-id="${useThis.params.id}">
                          ${useApp.icon.get("fi fi-rr-settings-sliders")}
                    </button>
                  </div>
  
              </header>
              <div class="div_guZ6yID" style="padding:10px">
                  <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                  <div id="itemFalse" class="div_b14S3dH" style="display:none;">
                      ${useApp.icon.get("fi fi-rr-search-alt")}
                      <h3>La pelicula no existe</h3>
                  </div>
                  <div id="itemTrue" class="div_4Be1MfB" style="display:none;">
  
                      <div class="div_cTj4aRP">
                          <div class="div_cv0TOQj">
                              <img id="poster" src="">
                          </div>
                          <div class="div_tzdsifu">
                              <span id="title"></span>
                              <p id="author"></p>
                          </div>
                      </div>
                      <hr class="hr_QTLItLB">
                      <div class="div_IPio5Py"></div>
                  </div>
              </div>
              <div id="itemTrueOption" class="div_5Pe946IMjyL1Rs" popover>
                <div class="div_dsb3nhtCrFmUlSN p-10px">
                
                  <div class="div_cXaADrL pointer-on">
                    <div id="itemTrueOptionVideos" class="div_lm2WViG">
                    <div class="loader-i m-auto g-col-full" style="--color:var(--color-letter); margin: 30px 0;"></div>
                    </div>
                  </div>
  
                </div>
              </div>
          </div>
      `)
  );

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  useThis.reactivity.load.observe((load) => {
    const render = {
      itemNull: load,
      itemFalse: !load && !Object.keys(useThis.value.datas).length,
      itemTrue: !load && !!Object.keys(useThis.value.datas).length,
    };

    Object.entries(render).forEach((keyvalue) => {
      $elements[keyvalue[0]].style.display = keyvalue[1] ? "" : "none";
    });
  });

  useThis.reactivity.data.observe((data) => {
    if (Object.keys(data).length) {
      $elements.poster.src = useApp.url.img(data.thumbnail_url);
      $elements.title.textContent = data.title;
      $elements.author.textContent = data.author_name;
    }
  });

  useThis.functions.dataLoad = () => {
    // encodeURIComponent(`https://www.youtube.com/watch?v=${useThis.params.id}`);
    fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${useThis.params.id}`
      )}&format=json`
    )
      .then((res) => res.json())
      .then((data) => {
        useThis.value.datas = useThis.value.datas.concat(data);

        useThis.reactivity.load.value = true;
        useThis.reactivity.data.value = data;
        useThis.reactivity.load.value = false;
      });
  };

  useThis.functions.dataLoadQuality = () => {
    const tokenYT = new Promise((resolve) => {
      if (useApp.values.youtubeToken)
        return resolve(useApp.values.youtubeToken);

      fetchWebElement(
        useApp.url.fetch("https://y2meta.app/es29/converter-youtube")
      ).then(($text) => {
        Array.from($text.querySelectorAll("img")).forEach((img) =>
          img.removeAttribute("src")
        );
        Array.from($text.querySelectorAll("script")).forEach((script) => {
          if (script.innerHTML.includes("var client_token=")) {
            const scriptFunction = new Function(
              [script.innerHTML, "return client_token"].join(";")
            );
            const client_token = scriptFunction();
            resolve(client_token);
          }
        });
      });
    });

    tokenYT.then((token) => {
      useApp.values.youtubeToken = token;

      const formData = new FormData();
      formData.append(
        "url",
        `https://www.youtube.com/watch?v=${useThis.params.id}`
      );
      formData.append("q_auto", "1");
      formData.append("ajax", "1");
      formData.append("token", token);

      fetch(useApp.url.fetch("https://y2meta.app/converter/ajax"), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-Key": "de0cfuirtgf67a",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: formData,
      })
        .then((res) => res.json())
        .then((json) => {
          const $text = document.createElement("div");
          $text.innerHTML = json.result;
          Array.from($text.querySelectorAll("img")).forEach((img) => {
            img.removeAttribute("src");
          });

          const formatList = Array.from($text.querySelectorAll("tbody")).map(
            (tbody) => {
              return Array.from(tbody.children)
                .filter((tr) => tr.children.length == 3)
                .map((tr) => {
                  const childSize = tr.children[1];
                  const button = tr.querySelector("button");

                  return {
                    title: tr
                      .querySelector("a")
                      .innerText.split(" ")
                      .map((string) => string.trim())
                      .filter((string) => string)
                      .join(" "),
                    size: childSize.textContent,
                    type: button.getAttribute("data-ftype"),
                    quality: button.getAttribute("data-fquality"),
                  };
                });
            }
          );

          // qualities.value = [].concat(...formatList);

          let type = null;

          $elements.itemTrueOptionVideos.innerHTML = []
            .concat(...formatList)
            .map((data) => {
              const visibility = data.type != type;
              type = data.type;

              return `
                <span class="span_eNUkEzu" style="${
                  visibility ? "" : "display:none"
                }">${data.type}</span>
                  <button class="button_NuUj5A6" data-type="${
                    data.type
                  }" data-quality="${data.quality}">
                      
                      <div class="div_Z8bTLpN">
                          <span>${data.title}</span>
                          <p>${data.size}</p>
                      </div>
                  
                  </button>
              `;
            })
            .join("");
        });
    });
  };

  $elements.itemTrueOptionVideos.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button) {
      $elements.itemTrueOption.hidePopover();

      dispatchEvent(
        new CustomEvent("_notification", {
          detail: {
            message: "cargando...",
            name: "info",
            duration: 1500,
          },
        })
      );

      fetch(
        useApp.url.rr(
          `/request.php?${encodeQueryObject({
            from: "youtube",
            id: useThis.params.id,
            type: button.getAttribute("data-type"),
            quality: button.getAttribute("data-quality"),
          })}`
        )
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.status) {
            dispatchEvent(
              new CustomEvent("_notification", {
                detail: {
                  message: "Video no disponible",
                  name: "danger",
                  duration: 3000,
                },
              })
            );
          }
        });
    }
  });

  $elements.openOption.addEventListener("click", () => {
    $elements.itemTrueOption.showPopover();
    if (useThis.value.reload) {
      useThis.value.reload = false;
      useThis.functions.dataLoadQuality();
    }
  });

  $elements.poster.addEventListener("click", () => {
    $elements.itemTrueOption.showPopover();
    if (useThis.value.reload) {
      useThis.value.reload = false;
      useThis.functions.dataLoadQuality();
    }
  });

  $elements.itemTrueOption.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
      $elements.itemTrueOption.hidePopover();
    }
  });

  useApp.elements.meta.color.setAttribute("content", "#000000");
  useThis.functions.dataLoad();
  return $element;
};

var genders = [
  "Acción",
  "Artes Marciales",
  "Aventuras",
  "Carreras",
  "Ciencia Ficción",
  "Comedia",
  "Demencia",
  "Demonios",
  "Deportes",
  "Drama",
  "Ecchi",
  "Escolares",
  "Espacial",
  "Fantasía",
  "Harem",
  "Historico",
  "Infantil",
  "Josei",
  "Juegos",
  "Magia",
  "Mecha",
  "Militar",
  "Misterio",
  "Música",
  "Parodia",
  "Policía",
  "Psicológico",
  "Recuentos de la vida",
  "Romance",
  "Samurai",
  "Seinen",
  "Shoujo",
  "Shounen",
  "Sobrenatural",
  "Superpoderes",
  "Suspenso",
  "Terror",
  "Vampiros",
  "Yaoi",
  "Yuri",
];

var anime = () => {
  const useApp = window.dataApp;
  const useThis = {
    params: useApp.routes.params(),
    reactivity: {
      load: defineVal(true),
      Data: defineVal([]),
    },
    functions: {},
    values: {
      observes: [],
    },
    url: {
      fetch: (url) => {
        return `https://fetch.vniox.com/get.php?url=${encodeURIComponent(url)}`;
      },
    },
  };

  const $element = createNodeElement(`

        <div class="div_Xu02Xjh">

            <header class="header_K0hs3I0">

                <div class="div_uNg74XS">
                    <a href="#/" class="button_lvV6qZu">
                      ${useApp.icon.get("fi fi-rr-angle-small-left")}
                    </a>
                    <h3 id="textTitle">Animes</h3>
                </div>

                <div class="div_x0cH0Hq">
                    <a href="#/search/anime" class="button_lvV6qZu">
                      ${useApp.icon.get("fi fi-rr-search")}
                    </a>
                </div>
               
            </header>

            <div class="div_BIchAsC" style="scrollbar-width: none">
                <div id="buttonsFocus" data-gender="Todos" class="div_O73RBqH">
                    <button data-gender="Todos" class="focus">Todos</button>
                    <button data-gender="-1">Ultimos episodios</button>
                    <button data-gender="-2">Ultimos animes</button>
                    <button data-gender="Favoritos" style="display:none;">Favoritos</button>
                    ${genders
                      .map((gender) => {
                        return `<button data-gender="${gender
                          .split(" ")
                          .join("-")
                          .toLocaleLowerCase()}" >${gender}</button>`;
                      })
                      .join("")} 
                </div>
            </div>

            <div class="div_IsTCHpN">
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                    ${useApp.icon.get("fi fi-rr-search-alt")}
                    <h3>sin resultados</h3>
                </div>
                <div id="itemTrue" class="div_qsNmfP3">
                    <div id="itemTrueLoad" class="div_Qm4cPUn">
                        <div class="loader-i" style="--color:var(--color-letter)"></div>
                    </div>
                </div>
            </div>

        </div>

    `);

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  useThis.reactivity.load.observe((load) => {
    const render = {
      itemNull: load,
      itemFalse: !load && !Object.keys(useThis.reactivity.Data.value).length,
      itemTrue: !load && !!Object.keys(useThis.reactivity.Data.value).length,
    };

    Object.entries(render).forEach((keyvalue) => {
      $elements[keyvalue[0]].style.display = keyvalue[1] ? "" : "none";
    });
  });

  useThis.reactivity.Data.observe((Data) => {
    const fragment = document.createDocumentFragment();
    fragment.append(document.createTextNode(""));
    fragment.append(
      ...Data.map((content) => {
        const url = useApp.url.img(content.poster);
        const episode = `episodio ${content.episode}`;
        const aspectRatio = content.episode ? "aspect-ratio:3/2" : "";

        const element = createNodeElement(`
                <a 
                  href="#/anime/${content.identifier}" 
                  class="div_SQpqup7" 
                  data-item>

                    <div class="div_fMC1uk6" style="${aspectRatio}">
                        <img src="" alt="" data-src="${url}" style="display:none;">
                        <span>${content.type ?? episode}</span>
                    </div>
                    <div class="div_9nWIRZE">
                        <p>${content.title}</p>
                    </div>
    
                </a>
            `);

        element.addEventListener("_IntersectionObserver", ({ detail }) => {
          if (detail.entry.isIntersecting) {
            detail.observer.unobserve(detail.entry.target);

            const img = element.querySelector("img");
            img.onload = () => (img.style.display = "");
            img.src = img.dataset.src;
          }
        });

        useApp.instances.IntersectionObserver.observe(element);
        useThis.values.observes.push(element);
        return element;
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();

    if (
      Data.length > 23 &&
      !["-1", "-2"].includes($elements.buttonsFocus.getAttribute("data-gender"))
    ) {
      $elements.itemTrue.append($elements.itemTrueLoad);
      useApp.instances.IntersectionObserver.observe($elements.itemTrueLoad);
    }
  });

  useThis.functions.dataLoad = () => {
    setTimeout(() => {
      const page =
        Math.floor(
          $elements.itemTrue.querySelectorAll("[data-item]").length / 24
        ) + 1;

      {
        const genreArray = [];
        const genreString = $elements.buttonsFocus.getAttribute("data-gender");

        if (genreString != "Todos") {
          genreArray.push(genreString);
        }

        if (["-1", "-2"].includes(genreString)) {
          return ApiWebAnimeflv.home().then((object) => {
            useThis.reactivity.load.value = true;
            useThis.reactivity.Data.value =
              genreString == "-1" ? object.episodes : object.animes;
            useThis.reactivity.load.value = false;
          });
        }

        ApiWebAnimeflv.search({ page, genre: genreArray }).then((array) => {
          useThis.reactivity.load.value = true;
          useThis.reactivity.Data.value = array;
          useThis.reactivity.load.value = false;
        });
      }
    });
  };

  useThis.functions.unobserve = () => {
    for (const observe of useThis.values.observes) {
      useApp.instances.IntersectionObserver.unobserve(observe);
    }

    useThis.values.observes = [];
  };

  $elements.buttonsFocus.addEventListener("click", (e) => {
    const button = e.target.closest("button");

    if (button) {
      $elements.buttonsFocus
        .querySelectorAll(".focus")
        .forEach((element) => element.classList.remove("focus"));
      button.classList.add("focus");
      $elements.buttonsFocus.setAttribute(
        "data-gender",
        button.getAttribute("data-gender")
      );

      useThis.reactivity.load.value = true;
      $elements.itemTrue.innerHTML = "";
      useThis.functions.unobserve();
      useThis.functions.dataLoad();

      button.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  });

  $elements.itemTrueLoad.addEventListener(
    "_IntersectionObserver",
    ({ detail }) => {
      if (detail.entry.isIntersecting) {
        detail.observer.unobserve(detail.entry.target);
        useThis.functions.dataLoad();
      }
    }
  );

  addEventListener(
    "hashchange",
    () => {
      useThis.functions.unobserve();
    },
    { once: true }
  );

  useApp.functions.scrollY({
    target: $elements.buttonsFocus.parentElement,
    events: {
      move: () => {
        $elements.buttonsFocus.style.pointerEvents = "none";
      },
      end: () => {
        $elements.buttonsFocus.style.pointerEvents = "";
      },
    },
  });

  useThis.functions.dataLoad();
  return $element;
};

var animeId = () => {
  const useApp = window.dataApp;
  const useThis = {
    params: useApp.routes.params(),
    reactivity: {
      isFavorite: defineVal(false),
      isView: defineVal(false),
      load: defineVal(true),
      data: defineVal({}),
      episodes: defineVal([]),
      dataTrueInfoRefresh: true,
    },
    functions: {},
    value: {
      video: null,
      isConnected: false,
      streaming: {},
      episode: -1,
      data_id: "",
    },
    url: {
      fetch: (url) => {
        return `https://fetch.vniox.com/get.php?url=${encodeURIComponent(url)}`;
      },
    },
  };

  const $element = replaceNodeChildren(
    createNodeElement(`
        <div class="div_Xu02Xjh children-hover div_mrXVL9t">

            <header class="header_K0hs3I0 header_RtX3J1X">

                <div class="div_uNg74XS">
                    <a href="#/anime" class="button_lvV6qZu" data-history-back>
                      ${useApp.icon.get("fi fi-rr-angle-small-left")}
                    </a>
                </div>

                <h2 id="title" style="flex: 1; text-align:center; font-size: clamp(1rem, 2vw, 2rem);"></h2>

                <div class="div_x0cH0Hq">
                    <button id="favorite" class="button_lvV6qZu" style="visibility:hidden">
                      ${useApp.icon.get("fi fi-rr-heart")}
                    </button>
                </div>

            </header>
 
            <div class="div_guZ6yID div_DtSQApy">
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                    ${useApp.icon.get("fi fi-rr-search-alt")}
                    <h3>La pelicula no existe</h3>
                </div>

                <div id="itemTrue" class="div_4MNvoOW">

                    <div class="div_rCXoNm8" style="display:none">
                        <div class="div_y6ODhoe">
                            <picture class="picture_BLSEWfU"><img id="poster" src=""></picture>
                            <div class="div_K2RbOsL">
                                <h2 ></h2>
                                <p id="overview"></p>
                                <div class="div_aSwP0zW">
                                    <span id="genres"></span>
                                    <span id="duration"></span>
                                    <span id="date"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="div_cnJqhFl">
                      <div class="div_0JOSFlg">
                        <img id="poster" src="">
                      </div>
                      <div class="div_cxFXOaL">
                        <label class="label_zjZIMnZ">
                          <input type="checkbox" id="inputView">
                          <span style="display:flex"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-check"><path d="M22.319,4.431,8.5,18.249a1,1,0,0,1-1.417,0L1.739,12.9a1,1,0,0,0-1.417,0h0a1,1,0,0,0,0,1.417l5.346,5.345a3.008,3.008,0,0,0,4.25,0L23.736,5.847a1,1,0,0,0,0-1.416h0A1,1,0,0,0,22.319,4.431Z"></path></svg></span>
                        </label>
                        <button id="play" class="button_bDfhQ4b" style="display:none">
                          <small>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-sr-play"><path d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z"></path></svg>
                          </small>
                          <span>Reproducir</span>
                        </button>
                      </div>
                      <hr class="hr_nTfcjTI">
                      <div class="div_aSwP0zW" style="text-align:center">
                          <span id="nextEpisode"></span>
                          <span id="genres"></span>
                          <span id="duration"></span>
                          <span id="date"></span>
                      </div>
                      <hr class="hr_nTfcjTI">
                      <p id="overview" style="text-align:center; font-size:14px"></p>
                    </div>

                    <div class="div_692wB8">
                        <div class="div_WslendP" style="scrollbar-width:none;">
                            <div id="episodes_range" class="div_z0PiH0E" data-season="0" data-data="[]"></div>
                        </div>
                        <div id="episodes" class="div_bi3qmqX"></div>
                    </div>

                </div>
            </div>

            <div id="itemTrueOption" class="div_5Pe946IMjyL1Rs" popover>
                <div class="div_dsb3nhtCrFmUlSN p-10px">
                    <div class="div_cXaADrL pointer-on">
                        <div id="itemTrueOptionVideos" class="div_lm2WViG"></div>
                    </div>
                </div>
            </div>
        </div>
    `),
    {},
    true
  );

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  useThis.reactivity.isFavorite.observe((isFavorite) => {
    $elements.favorite.innerHTML = useApp.icon.get(
      isFavorite ? "fi fi-sr-heart" : "fi fi-rr-heart"
    );

    $elements.favorite.setAttribute("data-action", isFavorite ? 1 : 0);
  });

  useThis.reactivity.isView.observe((isView) => {
    $elements.inputView.checked = isView;
  });

  useThis.reactivity.load.observe((load) => {
    const render = {
      itemNull: load,
      itemFalse: !load && !Object.keys(useThis.reactivity.data.value).length,
      itemTrue: !load && !!Object.keys(useThis.reactivity.data.value).length,
    };

    Object.entries(render).forEach((keyvalue) => {
      $elements[keyvalue[0]].style.display = keyvalue[1] ? "" : "none";
    });
  });

  useThis.reactivity.data.observe((data) => {
    if (Boolean(Object.keys(data).length)) {
      const episode_length = data.episodes;

      $elements.poster.src = useApp.url.img(data.poster);
      $elements.title.textContent = data.title;
      $elements.overview.textContent = data.overview;

      $elements.genres.textContent = data.genres
        .map((genre) => genre)
        .join(", ");
      $elements.duration.textContent = `${episode_length} episodios`;
      $elements.date.textContent = data.status;
      $elements.nextEpisode.innerHTML = data.nextEpisode
        ? `(nuevo episodio el <b>${data.nextEpisode}<b>)`
        : "";

      $elements.episodes_range.innerHTML = Array(
        Math.floor(episode_length / 50) + 1
      )
        .fill(null)
        .map((_, index, array) => {
          const end =
            array[index + 1] !== undefined ? index * 50 + 50 : episode_length;
          const start = index * 50 + 1;
          return `
          <button 
            data-season="${index}" 
            data-start="${start}" 
            data-end="${end || 50}" 
            class="${index == 0 ? "focus" : ""}">
            <span>${start} - ${end || 50}</span>
          </button>`;
        })
        .join("");

      useThis.reactivity.episodes.value = Array(Math.min(50, data.episodes))
        .fill()
        .map((_, i) => i + 1);

      getDominantColor($elements.poster).then((result) => {
        const color = darkenHexColor(result, 50);

        $element.style.background = color;
        $elements.episodes_range.parentElement.style.background = color;
        $elements.itemTrueOptionVideos.parentElement.style.background =
          darkenHexColor(result, 60);
        useApp.elements.meta.color.setAttribute("content", color);
      });

      useThis.functions.dataTrueInfo(data);
    }
  });

  useThis.reactivity.episodes.observe((episodes) => {
    const array =
      localStorage.getItem("episodes_direction") == 0
        ? episodes.reverse()
        : episodes;

    $elements.episodes.innerHTML = array
      .map((episode) => {
        const episodeInfo = useThis.value.streaming?.episodes?.[episode];

        const checked = episodeInfo != undefined ? "checked" : "";

        const displayInput = useThis.value.isConnected ? "" : "display:none";

        return `
          <div data-episode="${episode}" class="div_eGwK6I1">
            <button 
              class="button_fk0VHgU" 
              data-slug="${useThis.params.id}-${episode}" 
              data-title="${useThis.params.id}" 
              data-description="episodio ${episode}" 
              data-episode="${episode}"
              data-item>
                <span>Episodio ${episode}</span>
                <small>
                  ${
                    parseInt(episodeInfo?.time_view)
                      ? "visto ".concat(
                          useApp.functions.formatTime(episodeInfo.time_view)
                        )
                      : ""
                  }
                  ${
                    parseInt(episodeInfo?.time_duration)
                      ? "de ".concat(
                          useApp.functions.formatTime(episodeInfo.time_duration)
                        )
                      : ""
                  }
                </small>
            </button>
            <label class="label_zjZIMnZ" style="${displayInput}">
              <input type="checkbox" data-episode="${episode}" ${checked}>
              <span style="display:flex"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-check"><path d="M22.319,4.431,8.5,18.249a1,1,0,0,1-1.417,0L1.739,12.9a1,1,0,0,0-1.417,0h0a1,1,0,0,0,0,1.417l5.346,5.345a3.008,3.008,0,0,0,4.25,0L23.736,5.847a1,1,0,0,0,0-1.416h0A1,1,0,0,0,22.319,4.431Z"></path></svg></span>
            </label>
          </div>
        `;
      })
      .join("");
  });

  useThis.functions.setLinkServer = (url) => {
    const newURL = new URL(url);
    const hostSplit = newURL.host.split(".");
    const host = hostSplit.length == 3 ? hostSplit[1] : hostSplit[0];
    const mediaPlayer = useApp.mediaPlayer;

    if (["streamwish"].includes(host)) {
      MediaWebUrl.streamwish({ url: url }).then((res) => {
        if (res.status) {
          mediaPlayer.video((video) => {
            const $video = video;
            const videoSrc = res.url;

            if (Hls.isSupported()) {
              const hls = (useApp.values.hls = new Hls());

              hls.loadSource(videoSrc);
              hls.attachMedia($video);
              hls.on(Hls.Events.MANIFEST_PARSED, function () {});
            } else if ($video.canPlayType("application/vnd.apple.mpegurl")) {
              $video.src = videoSrc;
            }
          });
        } else alert("Video no disponible");
      });
    } else if (["voe"].includes(host)) {
      MediaWebUrl.voesx({ url: url }).then((res) => {
        if (res.status) {
          mediaPlayer.video((video) => {
            const $video = video;
            const videoSrc = res.url;

            if (Hls.isSupported()) {
              const hls = (useApp.values.hls = new Hls());

              hls.loadSource(videoSrc);
              hls.attachMedia($video);
              hls.on(Hls.Events.MANIFEST_PARSED, function () {});
            } else if ($video.canPlayType("application/vnd.apple.mpegurl")) {
              $video.src = videoSrc;
            }
          });
        } else alert("Video no disponible");
      });
    } else if (["doodstream"].includes(host)) {
      MediaWebUrl.doodstream({ url: url }).then((res) => {
        if (res.body.status) {
          mediaPlayer.video((video) => {
            video.src = res.body.url;
          });
        } else alert("Video no disponible");
      });
    } else if (["yourupload"].includes(host)) {
      MediaWeb.yourupload({ url: url }).then((res) => {
        if (res.body.status) {
          mediaPlayer.video((video) => {
            video.src = res.body.url;
          });
        } else alert("Video no disponible");
      });
    }
  };

  useThis.functions.dataLoad = () => {
    ApiWebAnimeflv.identifier(useThis.params.id).then((data) => {
      useThis.reactivity.load.value = true;
      useThis.reactivity.data.value = data;
      useThis.reactivity.load.value = false;
    });
  };

  useThis.functions.dataTrueInfo = (data) => {
    const data_id = parseInt(data.poster.split("/").pop());
    useThis.value.data_id = data_id;

    const body = {
      data_id: data_id,
      data_json: JSON.stringify(
        Object.entries(data).reduce(
          (prev, curr) => {
            if (["identifier", "title", "poster", "type"].includes(curr[0])) {
              prev[curr[0]] = curr[1];
            }
            return prev;
          },
          {
            id: data_id,
          }
        )
      ),
      type: 1,
    };

    fetch(
      useApp.url.server(
        `/api.php?route=favorites-one&type=1&data_id=${data_id}`
      ),
      useApp.fetchOptions({
        method: "POST",
        body: JSON.stringify(body),
      })
    )
      .then((res) => res.json())
      .then((data) => {
        useThis.value.streaming = data;
        $elements.favorite.style.visibility = "";
        useThis.value.isConnected = Boolean(data);

        if (useThis.value.isConnected) {
          useThis.reactivity.isFavorite.value = Boolean(data?.favorite);
          useThis.reactivity.isView.value = Boolean(data?.view);

          useThis.reactivity.episodes.value = [
            ...useThis.reactivity.episodes.value,
          ];
        }
      });
  };

  useThis.functions.updateHistory = (currentTime, duration = 0) => {
    if (useThis.value.isConnected) {
      const encodeQueryString = encodeQueryObject({
        route: "update-history-view",
        episode: useThis.value.episode,
        time_view: currentTime,
        time_duration: duration,
        datetime: Date.now(),
        data_id: useThis.value.data_id,
        type: 1,
      });

      fetch(
        useApp.url.server(`/api.php?${encodeQueryString}`),
        useApp.fetchOptions({
          method: "GET",
        })
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.status) {
            if (document.body.contains($element)) {
              useThis.functions.dataTrueInfo(useThis.reactivity.data.value);
            }
          }
        });
    }
  };

  useThis.functions.updateHistoryVideo = () => {
    useApp.mediaPlayer.video((video) => {
      let times = {};
      let status = false;

      video.src = "";
      useThis.reactivity.dataTrueInfoRefresh = true;

      video.onloadedmetadata = () => {
        times = {};
        status = false;

        const currentTime =
          parseInt(
            useThis.value.streaming?.episodes?.[useThis.value.episode]
              ?.time_view
          ) || 0;

        video.currentTime = currentTime;
        useThis.functions.dataTrueInfo(useThis.reactivity.data.value);
      };

      video.ontimeupdate = (e) => {
        if (status) {
          const num = Math.floor(e.target.currentTime);

          if (num > 0 && num % 30 == 0 && !times[num]) {
            times[num] = true;
            useThis.functions.updateHistory(
              num,
              Math.ceil(video.duration) || 0
            );
          }
        }
      };

      video.onseeked = () => {
        const currentTime = Math.floor(video.currentTime);
        useThis.functions.updateHistory(
          currentTime,
          Math.ceil(video.duration) || 0
        );

        times = {};
        times[currentTime] = true;

        status = true;
      };
    });
  };

  $elements.episodes_range.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button) {
      if (button.classList.contains("focus")) {
        localStorage.setItem(
          "episodes_direction",
          localStorage.getItem("episodes_direction") ^ 1
        );
        $elements.episodes.append(
          ...Array.from($elements.episodes.children).reverse()
        );
      } else {
        $elements.episodes_range
          .querySelectorAll("button.focus")
          .forEach((element) => element.classList.remove("focus"));
        button.classList.add("focus");

        const start = parseInt(button.getAttribute("data-start"));
        const end = parseInt(button.getAttribute("data-end")) + 1;

        useThis.reactivity.episodes.value = Array(end - start)
          .fill()
          .map((_, i) => start + i);

        button.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    }
  });

  $elements.episodes.addEventListener("click", (e) => {
    const item = e.target.closest("[data-item]");
    const input = e.target.closest("input");

    if (item) {
      $elements.itemTrueOption.showPopover();

      $elements.itemTrueOptionVideos.setAttribute(
        "data-episode",
        item.dataset.episode
      );

      $elements.itemTrueOptionVideos.innerHTML =
        '<div class="loader-i m-auto g-col-full" style="--color:var(--color-letter); padding: 20px 0"></div>';

      useApp.mediaPlayer.info({
        title: item.getAttribute("data-title").split("-").join(" "),
        description: item.getAttribute("data-description"),
      });

      useApp.mediaPlayer.controls({
        options: {
          not: ["download"],
        },
      });

      ApiWebAnimeflv.identifier(
        useThis.params.id,
        item.getAttribute("data-episode")
      ).then((videos) => {
        $elements.itemTrueOptionVideos.innerHTML = Object.entries(videos)
          .map((data) => {
            let show = true;

            return data[1]
              .map((video, index) => {
                if (index == 0) return "";
                if (!["yu", "sw"].includes(video.server)) return "";

                const visibility = show ? "" : "display:none";
                show = false;

                return `
                  <span 
                    class="span_eNUkEzu" 
                    style="${visibility}">
                      ${data[0].slice(0, 3).toUpperCase()}
                  </span>
                  <button 
                    class="button_NuUj5A6" 
                    data-type="" 
                    data-url="${video.code}" 
                    data-quality="">
                      
                      <div class="div_Z8bTLpN">
                          <span>${video.title}</span>
                          <p>${video.server}</p>
                      </div>
                      
                  </button>
              `;
              })
              .join("");
          })
          .join("");
      });
    }

    if (input) {
      // useThis.value.episode = input.dataset.episode;

      const encodeQueryString = encodeQueryObject({
        route: "toggle-history-view",
        episode: input.dataset.episode,
        datetime: Date.now(),
        data_id: useThis.value.data_id,
        type: 1,
        action: input.checked ? 1 : 0,
      });

      fetch(
        useApp.url.server(`/api.php?${encodeQueryString}`),
        useApp.fetchOptions({
          method: "GET",
        })
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.status) {
            input.checked = data.type == 1;
          }
        });
    }
  });

  $elements.favorite.addEventListener("click", () => {
    // if (!useThis.value.isConnected) {
    //   return (location.hash = "#/login");
    // }

    useThis.reactivity.isFavorite.value = !useThis.reactivity.isFavorite.value;

    const encodeQueryString = encodeQueryObject({
      route: "toggle-favorites",
      data_id: useThis.value.data_id,
      type: 1,
      action: $elements.favorite.dataset.action,
    });

    fetch(
      useApp.url.server(`/api.php?${encodeQueryString}`),
      useApp.fetchOptions({
        method: "GET",
      })
    )
      .then((res) => res.json())
      .then((data) => {
        if (data == null) {
          location.hash = "#/login";
          return;
        }

        if (data?.status) {
          useThis.reactivity.isFavorite.value = data.type == 1;
        }
      });
  });

  $elements.inputView.addEventListener("change", () => {
    // if (!useThis.value.isConnected) {
    //   return (location.hash = "#/login");
    // }

    // useThis.reactivity.isFavorite.value = !useThis.reactivity.isFavorite.value;

    const encodeQueryString = encodeQueryObject({
      route: "toggle-views",
      data_id: useThis.value.data_id,
      type: 1,
      action: $elements.inputView.checked ? 1 : 0,
    });

    fetch(
      useApp.url.server(`/api.php?${encodeQueryString}`),
      useApp.fetchOptions({
        method: "GET",
      })
    )
      .then((res) => res.json())
      .then((data) => {
        if (data == null) {
          location.hash = "#/login";
          return;
        }

        if (data?.status) {
          useThis.reactivity.isView.value = data.type == 1;
        }
      });
  });

  $elements.itemTrueOptionVideos.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button) {
      useThis.value.episode = $elements.itemTrueOptionVideos.dataset.episode;

      $elements.itemTrueOption.hidePopover();
      useThis.functions.setLinkServer(button.getAttribute("data-url"));
      useApp.mediaPlayer.element().requestFullscreen();

      useThis.functions.updateHistoryVideo();

      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: $elements.title.textContent,
          artist: `Episodio ${useThis.value.episode}`,
          album: "Anime",
          artwork: [
            {
              src: $elements.poster.src,
              sizes: "512x512",
              type: "image/png",
            },
          ],
        });
      }
    }
  });

  $elements.itemTrueOption.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
      $elements.itemTrueOption.hidePopover();
    }
  });

  useApp.elements.meta.color.setAttribute("content", "#000000");
  useThis.functions.dataLoad();

  useApp.functions.scrollY({
    target: $elements.episodes_range.parentElement,
    events: {
      move: () => {
        $elements.episodes_range.style.pointerEvents = "none";
      },
      end: () => {
        $elements.episodes_range.style.pointerEvents = "";
      },
    },
  });

  useApp.functions.historyBack($element.querySelector("[data-history-back]"));
  return $element;
};

var inicio = () => {
  const useApp = window.dataApp;

  const $element = createNodeElement(`
        <div class="div_Xu02Xjh">
            <header class="header_K0hs3I0">

                <div class="div_uNg74XS">
                    <button id="theme" class="button_lvV6qZu"></button>
                    <h3 id="textTitle">Inicio</h3>
                </div>

                <div class="div_x0cH0Hq">
                    <a href="#/favoritos" class="button_lvV6qZu">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-heart"><path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"></path></svg>
                    </a>
                    <a href="#/search/pelicula" class="button_lvV6qZu">
                      ${useApp.icon.get("fi fi-rr-search")}
                    </a>
                    <a href="#/profile" class="button_lvV6qZu"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-user"><path d="M12,12A6,6,0,1,0,6,6,6.006,6.006,0,0,0,12,12ZM12,2A4,4,0,1,1,8,6,4,4,0,0,1,12,2Z"></path><path d="M12,14a9.01,9.01,0,0,0-9,9,1,1,0,0,0,2,0,7,7,0,0,1,14,0,1,1,0,0,0,2,0A9.01,9.01,0,0,0,12,14Z"></path></svg></a>
                </div>

            </header>
            <div id="item" class="div_guZ6yID" style="padding:10px">
                <div class="div_Ph0Tbeb">

                    <a href="#/anime" class="a_lW7dgpk">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-face-awesome"><path d="M6,11c-.55,0-1-.45-1-1v-1c0-1.65,1.35-3,3-3s3,1.35,3,3v1c0,.55-.45,1-1,1s-1-.45-1-1v-.65c-.15,.09-.31,.15-.5,.15-.55,0-1-.45-1-1,0-.15,.04-.28,.09-.41-.35,.16-.59,.5-.59,.91v1c0,.55-.45,1-1,1Z"></path><path d="M19,9v1c0,.55-.45,1-1,1s-1-.45-1-1v-.65c-.15,.09-.31,.15-.5,.15-.55,0-1-.45-1-1,0-.15,.04-.28,.09-.41-.35,.16-.59,.5-.59,.91v1c0,.55-.45,1-1,1s-1-.45-1-1v-1c0-1.65,1.35-3,3-3s3,1.35,3,3Z"></path><g><path d="M12,0C5.38,0,0,5.38,0,12s5.38,12,12,12,12-5.38,12-12S18.62,0,12,0Zm0,22c-5.51,0-10-4.49-10-10S6.49,2,12,2s10,4.49,10,10-4.49,10-10,10Z"></path><path d="M18.08,13.32H5.92c-.59,0-1.05,.56-.88,1.13,.88,3.02,3.66,5.22,6.97,5.22s6.08-2.21,6.97-5.22c.17-.57-.29-1.13-.88-1.13Zm-6.08,4.54s-.02,0-.04,0c.49-1.57,1.94-2.72,3.67-2.72,.38,0,.73,.01,1.04,.05-.95,1.6-2.68,2.67-4.67,2.67Z"></path></g></svg>
                        <span>Anime</span>
                        ${useApp.icon.get("fi fi-rr-angle-small-right")}
                    </a>

                    
                    <a href="#/pelicula" class="a_lW7dgpk">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-clapperboard-play"><path d="m19,1H5C2.243,1,0,3.243,0,6v12c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V6c0-2.757-2.243-5-5-5Zm3,6h-3.894l3.066-3.066c.512.538.828,1.266.828,2.066v1Zm-2.734-3.988l-3.973,3.973s-.009.01-.014.015h-3.423l4-4h3.144c.09,0,.178.005.266.012Zm-6.238-.012l-3.764,3.764c-.071.071-.13.151-.175.236h-3.483l4-4h3.422Zm-8.028,0h1.778L2.778,7h-.778v-1c0-1.654,1.346-3,3-3Zm14,18H5c-1.654,0-3-1.346-3-3v-9h20v9c0,1.654-1.346,3-3,3Zm-3.953-5.2l-4.634,2.48c-.622.373-1.413-.075-1.413-.8v-4.961c0-.725.791-1.173,1.413-.8l4.634,2.48c.604.362.604,1.238,0,1.6Z"></path></svg>
                        <span>Pelicula</span>
                        ${useApp.icon.get("fi fi-rr-angle-small-right")}
                    </a>
                    <a href="#/serie" class="a_lW7dgpk">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-tv-retro"><path d="m19,6h-4.865l3.633-4.36c.354-.424.296-1.055-.128-1.408s-1.054-.296-1.408.128l-4.232,5.078L7.768.36c-.354-.424-.984-.482-1.408-.128-.424.354-.481.984-.128,1.408l3.633,4.36h-4.865c-2.757,0-5,2.243-5,5v8c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5v-8c0-2.757-2.243-5-5-5Zm3,13c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3v-8c0-1.654,1.346-3,3-3h14c1.654,0,3,1.346,3,3v8Zm-9-9h-7c-1.103,0-2,.897-2,2v6c0,1.103.897,2,2,2h7c1.103,0,2-.897,2-2v-6c0-1.103-.897-2-2-2Zm-7,8v-6h7v6s-7,0-7,0Zm14-5.5c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Zm0,5c0,.828-.672,1.5-1.5,1.5s-1.5-.672-1.5-1.5.672-1.5,1.5-1.5,1.5.672,1.5,1.5Z"></path></svg>
                        <span>Serie</span>
                        ${useApp.icon.get("fi fi-rr-angle-small-right")}
                    </a>

                    <a href="#/youtube" class="a_lW7dgpk" style="display:none;">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve" data-svg-name="fi fi-brands-youtube"><g><path d="M23.498,6.186c-0.276-1.039-1.089-1.858-2.122-2.136C19.505,3.546,12,3.546,12,3.546s-7.505,0-9.377,0.504   C1.591,4.328,0.778,5.146,0.502,6.186C0,8.07,0,12,0,12s0,3.93,0.502,5.814c0.276,1.039,1.089,1.858,2.122,2.136   C4.495,20.454,12,20.454,12,20.454s7.505,0,9.377-0.504c1.032-0.278,1.845-1.096,2.122-2.136C24,15.93,24,12,24,12   S24,8.07,23.498,6.186z M9.546,15.569V8.431L15.818,12L9.546,15.569z"></path></g></svg>
                        <span>Youtube</span>
                        ${useApp.icon.get("fi fi-rr-angle-small-right")}
                    </a>
                </div> 
            </div>
        </div>
    `);

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  const theme = defineVal(localStorage.getItem("theme"));
  theme.observe((theme) => {
    $elements.theme.innerHTML = useApp.icon.get(
      theme == "dark" ? "fi fi-rr-sun" : "fi fi-rr-moon"
    );
  });

  $elements.theme.addEventListener("click", () => {
    theme.value = theme.value != "light" ? "light" : "dark";
    localStorage.setItem("theme", theme.value);
    dispatchEvent(new CustomEvent("_theme"));
  });

  return $element;
};

var offline = ()=>{
    const $element  = createNodeElement(`
        <div class="offline">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="512" height="512"><path d="M14,19c0,1.1-.9,2-2,2s-2-.9-2-2,.9-2,2-2,2,.9,2,2ZM1.33,7.07c-.37,.33-.73,.69-1.07,1.05-.38,.4-.35,1.04,.05,1.41,.19,.18,.44,.27,.68,.27,.27,0,.54-.11,.73-.32,.3-.32,.61-.63,.93-.92,.41-.37,.45-1,.08-1.41-.37-.41-1-.45-1.41-.08Zm5.05,4.84c-.4,.31-.77,.65-1.11,1.02-.38,.41-.35,1.04,.05,1.41,.19,.18,.44,.27,.68,.27,.27,0,.54-.11,.73-.32,.27-.29,.56-.56,.87-.8,.44-.34,.52-.97,.18-1.4-.34-.44-.97-.52-1.4-.18Zm7.21,.26c1.39,.32,2.68,1.06,3.66,2.11,.2,.21,.46,.32,.73,.32,.24,0,.49-.09,.68-.27,.4-.38,.43-1.01,.05-1.41-1.84-1.99-4.54-3.06-7.22-2.92-.02,0-.05,0-.07,0L7.24,5.83c1.52-.55,3.12-.83,4.76-.83,3.88,0,7.62,1.63,10.27,4.48,.2,.21,.46,.32,.73,.32,.24,0,.49-.09,.68-.27,.4-.38,.43-1.01,.05-1.41-3.02-3.25-7.3-5.12-11.73-5.12-2.19,0-4.31,.43-6.3,1.29L1.71,.29C1.32-.1,.68-.1,.29,.29S-.1,1.32,.29,1.71L22.29,23.71c.2,.2,.45,.29,.71,.29s.51-.1,.71-.29c.39-.39,.39-1.02,0-1.41L13.6,12.18Z"></path></svg>
            <h3>No hay conexión a internet</h3>
        </div>
    `);
 
    let active = true;
    
    addEventListener('online', () => {
        if( !active ) return
        dispatchEvent( new CustomEvent('hashchange') );
    }, { once : true });

    addEventListener('hashchange', ()=> {
        active = false;
    }, { once : true });

    return $element
};

var searchType = () => {
  const useApp = window.dataApp;
  const useThis = {
    params: useApp.routes.params(),
    reactivity: {
      load: defineVal(true),
      Data: defineVal([]),
    },
    function: {
      dataLoad: () => {},
    },
  };

  const $element = createNodeElement(`

        <div class="div_Xu02Xjh">

            <header class="header_K0hs3I0 header_4scHSOs">
        
                <a 
                  class="a_t8K3Qpd" 
                  href="#/${useThis.params.type}">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-angle-left"><path d="M17.17,24a1,1,0,0,1-.71-.29L8.29,15.54a5,5,0,0,1,0-7.08L16.46.29a1,1,0,1,1,1.42,1.42L9.71,9.88a3,3,0,0,0,0,4.24l8.17,8.17a1,1,0,0,1,0,1.42A1,1,0,0,1,17.17,24Z"></path></svg>
                </a>
                <form id="form" class="form_r7mvBNn" autocomplete="off" >
                    <input 
                      type="search" 
                      name="search" 
                      value="${EncodeTemplateString.toInput(
                        decodeURIComponent(useApp.routes.params("result") || "")
                      )}" 
                      placeholder="buscar">
                    <button type="submit"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-arrow-right"><path d="M23.12,9.91,19.25,6a1,1,0,0,0-1.42,0h0a1,1,0,0,0,0,1.41L21.39,11H1a1,1,0,0,0-1,1H0a1,1,0,0,0,1,1H21.45l-3.62,3.61a1,1,0,0,0,0,1.42h0a1,1,0,0,0,1.42,0l3.87-3.88A3,3,0,0,0,23.12,9.91Z"></path></svg></button>
                </form>

            </header>
            <div class="div_IsTCHpN" style="padding:10px">
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                    ${useApp.icon.get("fi fi-rr-search-alt")}
                    <h3></h3>
                </div>
                <div id="itemTrue" class="div_C2otGmQ"></div>
            </div>

        </div>

    `);

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );
  const renderObjectElement = new RenderObjectElement($elements);

  useThis.reactivity.load.observe((load) => {
    renderObjectElement.set({
      itemNull: load,
      itemFalse:
        !load &&
        !useThis.reactivity.Data.value.length &&
        !$elements.itemTrue.children.length,
      itemTrue:
        (!load && !!useThis.reactivity.Data.value.length) ||
        !!$elements.itemTrue.children.length,
    });
  });

  useThis.reactivity.Data.observe((Data) => {
    $elements.itemTrue.innerHTML = Data.map((data) => {
      const search = encodeURIComponent(data.search);
      return `
        <div class="div_ywmleK1" data-item>
            <button 
              class="button_YqF7ZuC" 
              data-id="${data.id}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-cross-small"><path d="M18,6h0a1,1,0,0,0-1.414,0L12,10.586,7.414,6A1,1,0,0,0,6,6H6A1,1,0,0,0,6,7.414L10.586,12,6,16.586A1,1,0,0,0,6,18H6a1,1,0,0,0,1.414,0L12,13.414,16.586,18A1,1,0,0,0,18,18h0a1,1,0,0,0,0-1.414L13.414,12,18,7.414A1,1,0,0,0,18,6Z"></path></svg>
            </button>
            <a 
            class="a_UrjAwYX" 
            href="#/search/${data.type}/${search}/result">
                <div class="div_9OWid2W">
                    <p>${data.search}</p>
                    <span>${data.type}</span>
                </div>
                ${useApp.icon.get("fi fi-rr-angle-small-right")}
            </a>
        </div>
      `;
    }).join("");
  });

  useThis.function.dataLoad = () => {
    useThis.reactivity.Data.value = JSON.parse(
      localStorage.getItem("search_history")
    );
    useThis.reactivity.load.value = false;
  };

  $elements.form.addEventListener("submit", (e) => {
    e.preventDefault();

    location.hash = `/search/${useThis.params.type}/${encodeURIComponent(
      $elements.form.search.value.trim()
    )}/result`;

    storageJSON(localStorage, "search_history", (Data = []) => {
      if (
        !Data.some((data) => data.search == $elements.form.search.value.trim())
      ) {
        Data.push({
          id: Date.now(),
          type: useThis.params.type,
          search: $elements.form.search.value.trim(),
        });
      }

      return Data;
    });
  });

  $elements.itemTrue.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button) {
      const id = button.getAttribute("data-id");

      storageJSON(localStorage, "search_history", (Data = []) => {
        return Data.filter(
          (data) => data.id != id && data.type != useThis.params.type
        );
      });

      button.closest("[data-item]").remove();
    }
  });

  useThis.function.dataLoad();
  setTimeout(() => $elements.form.search.focus());

  // useApp.elements.meta.color.setAttribute('content', localStorage.getItem('theme') == 'light' ? '#ffffff' : '#292929')
  return $element;
};

var searchTypeResult = () => {
  const useApp = window.dataApp;
  const useThis = {
    params: useApp.routes.params(),
    reactivity: {
      load: defineVal(true),
      Data: defineVal([]),
    },
    values: {
      observes: [],
    },
    function: {
      dataLoad: () => {},
    },
    functions: {},
  };

  const $element = createNodeElement(`

    <div class="div_Xu02Xjh">

            <header class="header_K0hs3I0">
 
                <div class="div_uNg74XS div_McPrYGP">
                    <a 
                      href="${[
                        "#",
                        "search",
                        useThis.params.type,
                        useThis.params.result,
                      ].join("/")}"
                      class="button_lvV6qZu">
                        ${useApp.icon.get("fi fi-rr-angle-small-left")}
                    </a>
                    <div class="div_sZZicpN">
                        <h3 id="h3Title">
                          ${decodeURIComponent(useThis.params.result)}
                        </h3>
                        <span style="display:none">${useThis.params.type}</span>
                    </div>
                </div>

            </header>

            <div class="div_BIchAsC">
                <div id="buttonsFocus" data-gender="Todos" class="div_O73RBqH">

                    ${Object.entries({
                      anime: "Animes",
                      pelicula:
                        useThis.params.type != "serie" && "peliculas y series",
                      serie:
                        useThis.params.type != "pelicula" &&
                        "peliculas y series",
                      // serie       : 'series',
                      // youtube: "YT Videos",
                    })
                      .map((entries) => {
                        if (!entries[1]) return "";
                        return `<button data-gender="${entries[0]}" class="${
                          entries[0] == useThis.params.type ? "focus" : ""
                        }">${entries[1]}</button>`;
                      })
                      .join("")}
                </div>
            </div>
        
            <div class="div_IsTCHpN">
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                    ${useApp.icon.get("fi fi-rr-search-alt")}
                    <h3>sin resultados</h3>
                </div>

                <div id="itemTrue" class="">
                    <div id="itemTrueLoad" class="div_Qm4cPUn">
                        <div class="loader-i" style="--color:var(--color-letter)"></div>
                    </div>
                </div>
                
            </div>

        </div>

  `);

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  useThis.reactivity.load.observe((load) => {
    const render = {
      itemNull: load,
      itemFalse: !load && !Object.keys(useThis.reactivity.Data.value).length,
      itemTrue: !load && !!Object.keys(useThis.reactivity.Data.value).length,
    };

    Object.entries(render).forEach((entries) => {
      $elements[entries[0]].style.display = entries[1] ? "" : "none";
    });
  });

  useThis.reactivity.Data.observe((Data) => {
    if (Data.length) {
      const type = $elements.buttonsFocus
        .querySelector("button.focus")
        .getAttribute("data-gender");
      if (["pelicula", "serie"].includes(type)) {
        return useThis.function.dataRenderPeliculaSerie(Data);
      }

      if (type == "anime") {
        return useThis.function.dataRenderAnime(Data);
      }

      if (type == "youtube") {
        return useThis.function.dataRenderYoutube(Data);
      }
    }
  });

  useThis.function.dataRenderAnime = (Data) => {
    const fragment = document.createDocumentFragment();
    fragment.append(document.createTextNode(""));
    fragment.append(
      ...Data.map((data) => {
        const url = useApp.url.img(data.poster);

        const element = createNodeElement(`
            <a 
              href="#/anime/${data.identifier}" 
              class="div_SQpqup7" data-item>

                <div class="div_fMC1uk6">
                    <img src="" alt="" data-src="${url}" style="display:none">
                    <span>${data.type ?? ""}</span>
                </div>
                <div class="div_9nWIRZE">
                    <p>${data.title}</p>
                </div>

            </a>
        `);

        element.addEventListener("_IntersectionObserver", ({ detail }) => {
          if (detail.entry.isIntersecting) {
            detail.observer.unobserve(detail.entry.target);

            const img = element.querySelector("img");
            img.onload = () => (img.style.display = "");
            img.src = img.dataset.src;
          }
        });

        useApp.instances.IntersectionObserver.observe(element);
        useThis.values.observes.push(element);

        return element;
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();
  };

  useThis.function.dataRenderPeliculaSerie = (Data) => {
    const fragment = document.createDocumentFragment();
    fragment.append(document.createTextNode(""));
    fragment.append(
      ...Data.map((data) => {
        const slug = data.url.slug
          .split("/")
          .map((name, index) => {
            if (index == 0) {
              if (name == "movies") return "pelicula";
              else if (name == "series") return "serie";
            }
            return name;
          })
          .join("/");

        if (data.images.poster == null) return "";

        const url = useApp.url.img(
          `https://cuevana.biz/_next/image?url=${data.images.poster}&w=256&q=50`
        );

        const element = createNodeElement(`
          <a 
            href="#/${slug.split("/")[0]}/${data.TMDbId}" 
            class="div_SQpqup7" 
            data-item>

              <div class="div_fMC1uk6">
                  <img src="" alt="" data-src="${url}" style="display:none">
                  <span>${slug.split("/")[0]}</span>
              </div>
              <div class="div_9nWIRZE">
                  <p>${data.titles.name}</p>
              </div>
      
          </a>    
        `);

        element.addEventListener("_IntersectionObserver", ({ detail }) => {
          if (detail.entry.isIntersecting) {
            detail.observer.unobserve(detail.entry.target);

            const img = element.querySelector("img");
            img.onload = () => (img.style.display = "");
            img.src = img.dataset.src;
          }
        });

        useApp.instances.IntersectionObserver.observe(element);
        useThis.values.observes.push(element);

        return element;
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();
  };

  useThis.function.dataRenderYoutube = (Data) => {
    const fragment = document.createDocumentFragment();
    fragment.append(
      ...Data.map((data) => {
        return createNodeElement(`
                <a href="#/youtube/${
                  data.videoId
                }" class="div_EJlRW2l" data-item>

                    <div class="div_zcWgA0o">
                        <img src="${data.thumbnail.thumbnails[0].url}" alt="">
                        <span>${
                          data.author || data.ownerText.runs[0].text
                        }</span>
                    </div>
                    <div class="div_9nWIRZE">
                        <p>${
                          data.title.runs ? data.title.runs[0].text : data.title
                        }</p>
                    </div>
    
                </a>
            `);
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();
  };

  useThis.function.dataLoadAnime = () => {
    ApiWebAnimeflv.search({
      search: decodeURIComponent(useThis.params.result),
    }).then((array) => {
      useThis.reactivity.load.value = true;
      useThis.reactivity.Data.value = array;
      useThis.reactivity.load.value = false;
    });
  };

  useThis.function.dataLoadPeliculaSerie = () => {
    ApiWebCuevana.search(decodeURIComponent(useThis.params.result)).then(
      (datas) => {
        useThis.reactivity.load.value = true;
        useThis.reactivity.Data.value = datas.props.pageProps.movies;
        useThis.reactivity.load.value = false;
      }
    );
  };

  useThis.function.dataLoadYoutube = () => {
    return;
  };

  useThis.function.dataLoad = () => {
    const type = $elements.buttonsFocus
      .querySelector("button.focus")
      .getAttribute("data-gender");
    $elements.itemTrue.setAttribute(
      "class",
      ["anime", "pelicula", "serie"].includes(type)
        ? "div_qsNmfP3"
        : "div_FtxwFbU"
    );

    if (["pelicula", "serie"].includes(type)) {
      return useThis.function.dataLoadPeliculaSerie();
    }

    if (type == "anime") {
      return useThis.function.dataLoadAnime();
    }

    if (type == "youtube") {
      return useThis.function.dataLoadYoutube();
    }
  };

  useThis.functions.unobserve = () => {
    for (const observe of useThis.values.observes) {
      useApp.instances.IntersectionObserver.unobserve(observe);
    }

    useThis.values.observes = [];
  };

  $elements.buttonsFocus.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button) {
      Array.from(
        $elements.buttonsFocus.querySelectorAll("button.focus")
      ).forEach((button) => button.classList.remove("focus"));
      button.classList.add("focus");

      useThis.reactivity.load.value = true;
      $elements.itemTrue.innerHTML = "";

      useThis.function.dataLoad();
    }
  });

  $elements.h3Title.addEventListener("click", () => {
    location.hash = `/search/${useThis.params.type}/${useThis.params.result}`;
  });

  addEventListener(
    "hashchange",
    () => {
      useThis.functions.unobserve();
    },
    { once: true }
  );

  useThis.function.dataLoad();

  return $element;
};

var favoritos = () => {
  const useApp = window.dataApp;
  const useThis = {
    params: useApp.routes.params(),
    reactivity: {
      load: defineVal(true),
      Data: defineVal([]),
    },
    values: {
      observes: [],
    },
    function: {
      dataLoad: () => {},
    },
    functions: {},
  };

  const $element = createNodeElement(`

        <div class="div_Xu02Xjh">

            <header class="header_K0hs3I0">
 
                <div class="div_uNg74XS div_McPrYGP">
                    <a href="#/" class="button_lvV6qZu">
                      ${useApp.icon.get("fi fi-rr-angle-small-left")}
                    </a>
                    <div class="div_sZZicpN">  
                        <h3>Favoritos</h3>
                        <span style="display:none">${useThis.params.type}</span>
                    </div>
                </div>

                <div class="div_x0cH0Hq">
                    <a href="#/views" class="button_lvV6qZu">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-check-double"><path d="m1.283,7.697c-.385-.396-.375-1.029.021-1.414.396-.385,1.03-.376,1.414.021l4.089,4.211c.307.31.729.485,1.176.486.445,0,.864-.173,1.179-.488L18.29,1.296c.388-.394,1.021-.396,1.414-.007.393.389.396,1.022.007,1.414l-9.131,9.219c-.696.696-1.624,1.078-2.604,1.078-.982-.002-1.904-.387-2.596-1.085L1.283,7.697Zm22.423-.405c-.391-.391-1.025-.389-1.414.002l-13.087,13.12c-.378.378-.884.586-1.418.586-.536,0-1.039-.212-1.423-.599L1.699,15.784c-.394-.388-1.026-.386-1.415.008-.388.393-.385,1.025.007,1.414l4.659,4.61c.755.761,1.761,1.181,2.833,1.184,1.068,0,2.081-.416,2.837-1.173l13.088-13.121c.39-.391.389-1.024-.002-1.414Z"></path></svg>
                    </a>
                    <a href="#/historial" class="button_lvV6qZu">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-time-past"><path d="M12,0A11.972,11.972,0,0,0,4,3.073V1A1,1,0,0,0,2,1V4A3,3,0,0,0,5,7H8A1,1,0,0,0,8,5H5a.854.854,0,0,1-.1-.021A9.987,9.987,0,1,1,2,12a1,1,0,0,0-2,0A12,12,0,1,0,12,0Z"></path><path d="M12,6a1,1,0,0,0-1,1v5a1,1,0,0,0,.293.707l3,3a1,1,0,0,0,1.414-1.414L13,11.586V7A1,1,0,0,0,12,6Z"></path></svg>
                    </a>  
                </div>

            </header>

            <div class="div_BIchAsC">
                <div id="buttonsFocus" data-gender="Todos" class="div_O73RBqH">

                    ${Object.entries({
                      anime: "Animes",
                      pelicula: "peliculas",
                      serie: "series",
                      // youtube: "YT Videos",
                    })
                      .map((entries, index) => {
                        return `
                        <button 
                          data-gender="${entries[0]}" 
                          class="${index == 0 ? "focus" : ""}">
                        ${entries[1]}
                        </button>`;
                      })
                      .join("")}
                </div>
            </div>
        
            <div class="div_IsTCHpN">
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                  ${useApp.icon.get("fi fi-rr-search-alt")}
                  <h3>sin resultados</h3>
                </div>

                <div id="itemTrue" class="">
                    <div id="itemTrueLoad" class="div_Qm4cPUn">
                        <div class="loader-i" style="--color:var(--color-letter)"></div>
                    </div>
                </div>
                
            </div>

        </div>

    `);

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );
  // const renderObjectElement = new RenderObjectElement($elements);

  useThis.function.dataRenderAnime = (Data) => {
    const fragment = document.createDocumentFragment();
    fragment.append(document.createTextNode(""));
    fragment.append(
      ...Data.map((data) => {
        const url = useApp.url.img(data.poster);
        const href = data.href?.split("/").pop();

        const element = createNodeElement(`
            <a 
              href="#/anime/${data?.identifier ?? href}" 
              class="div_SQpqup7" 
              data-item>

                <div class="div_fMC1uk6">
                    <img src="" alt="" data-src="${url}" style="display:none">
                    <span>${data.type ?? ""}</span>
                </div>
                <div class="div_9nWIRZE">
                    <p>${data.title}</p>
                </div>

            </a>
        `);

        element.addEventListener("_IntersectionObserver", ({ detail }) => {
          if (detail.entry.isIntersecting) {
            detail.observer.unobserve(detail.entry.target);

            const img = element.querySelector("img");
            img.onload = () => (img.style.display = "");
            img.src = img.dataset.src;
          }
        });

        useApp.instances.IntersectionObserver.observe(element);
        useThis.values.observes.push(element);
        return element;
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();

    if (Data.length === 25) {
      $elements.itemTrue.append($elements.itemTrueLoad);
      useApp.instances.IntersectionObserver.observe($elements.itemTrueLoad);
    }
  };

  useThis.function.dataRenderPeliculaSerie = (Data) => {
    const fragment = document.createDocumentFragment();
    fragment.append(document.createTextNode(""));
    fragment.append(
      ...Data.map((data) => {
        const slug = data.url.slug
          .split("/")
          .map((name, index) => {
            if (index == 0) {
              if (name == "movies") return "pelicula";
              else if (name == "series") return "serie";
            }
            return name;
          })
          .join("/");

        if (data.images.poster == null) return "";

        const url = useApp.url.img(
          `https://cuevana.biz/_next/image?url=${data.images.poster}&w=256&q=50`
        );

        const element = createNodeElement(`
          <a 
            href="#/${slug.split("/")[0]}/${data.TMDbId}" 
            class="div_SQpqup7" data-item>

              <div class="div_fMC1uk6">
                  <img src="" alt="" data-src="${url}" style="display:none">
                  <span>${slug.split("/")[0]}</span>
              </div>
              <div class="div_9nWIRZE">
                  <p>${data.titles.name}</p>
              </div>
          </a>    
        `);

        element.addEventListener("_IntersectionObserver", ({ detail }) => {
          if (detail.entry.isIntersecting) {
            detail.observer.unobserve(detail.entry.target);

            const img = element.querySelector("img");
            img.onload = () => (img.style.display = "");
            img.src = img.dataset.src;
          }
        });

        useApp.instances.IntersectionObserver.observe(element);
        useThis.values.observes.push(element);
        return element;
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();

    if (Data.length === 25) {
      $elements.itemTrue.append($elements.itemTrueLoad);
      useApp.instances.IntersectionObserver.observe($elements.itemTrueLoad);
    }
  };

  useThis.function.dataRenderYoutube = (Data) => {
    const fragment = document.createDocumentFragment();
    fragment.append(
      ...Data.map((data) => {
        return createNodeElement(`
                <a 
                  href="#/youtube/${data.videoId}" 
                  class="div_EJlRW2l" data-item>

                    <div class="div_zcWgA0o">
                        <img 
                          src="${data.thumbnail.thumbnails[0].url}" 
                          alt="">
                        <span>
                          ${data.author || data.ownerText.runs[0].text}
                        </span>
                    </div>
                    <div class="div_9nWIRZE">
                      <p>
                        ${
                          data.title.runs ? data.title.runs[0].text : data.title
                        }
                      </p>
                    </div>
    
                </a>
            `);
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();
  };

  useThis.function.dataLoadAnime = () => {
    const encodeQueryString = encodeQueryObject({
      route: "favorites",
      type: 1,
      start: $elements.itemTrue.querySelectorAll("[data-item]").length,
      end: 25,
    });

    fetch(
      useApp.url.server(`/api.php?${encodeQueryString}`),
      useApp.fetchOptions({
        method: "GET",
      })
    )
      .then((res) => res.json())
      .then((data) => {
        useThis.reactivity.load.value = true;
        useThis.reactivity.Data.value = Array.isArray(data)
          ? data.map((data) => JSON.parse(data.data_json))
          : [];
        // useThis.reactivity.Data.value = JSON.parse(
        //   localStorage.getItem("favorite_anime")
        // );
        useThis.reactivity.load.value = false;
      });
  };

  useThis.function.dataLoadPeliculaSerie = (type) => {
    const encodeQueryString = encodeQueryObject({
      route: "favorites",
      type: type == "pelicula" ? 2 : 3,
      start: $elements.itemTrue.querySelectorAll("[data-item]").length,
      end: 25,
    });

    fetch(
      useApp.url.server(`/api.php?${encodeQueryString}`),
      useApp.fetchOptions({
        method: "GET",
      })
    )
      .then((res) => res.json())
      .then((data) => {
        useThis.reactivity.load.value = true;
        useThis.reactivity.Data.value = Array.isArray(data)
          ? data.map((data) => JSON.parse(data.data_json))
          : [];
        // useThis.reactivity.Data.value = JSON.parse(
        //   localStorage.getItem("favorite_anime")
        // );
        useThis.reactivity.load.value = false;
      });

    // useThis.reactivity.load.value = true;
    // useThis.reactivity.Data.value = JSON.parse(
    //   localStorage.getItem(
    //     type == "pelicula" ? "favorite_pelicula" : "favorite_serie"
    //   )
    // );
    // useThis.reactivity.load.value = false;
  };

  useThis.function.dataLoadYoutube = () => {
    useThis.reactivity.load.value = true;
    useThis.reactivity.Data.value = JSON.parse(
      localStorage.getItem("favorite_yt_video")
    );
    useThis.reactivity.load.value = false;
  };

  useThis.function.dataLoad = () => {
    const type = $elements.buttonsFocus
      .querySelector("button.focus")
      .getAttribute("data-gender");
    $elements.itemTrue.setAttribute(
      "class",
      ["anime", "pelicula", "serie"].includes(type)
        ? "div_qsNmfP3"
        : "div_FtxwFbU"
    );

    if (["pelicula", "serie"].includes(type)) {
      return useThis.function.dataLoadPeliculaSerie(type);
    }

    if (type == "anime") {
      return useThis.function.dataLoadAnime();
    }

    if (type == "youtube") {
      return useThis.function.dataLoadYoutube();
    }
  };

  useThis.functions.unobserve = () => {
    for (const observe of useThis.values.observes) {
      useApp.instances.IntersectionObserver.unobserve(observe);
    }

    useThis.values.observes = [];
  };

  $elements.buttonsFocus.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button) {
      Array.from(
        $elements.buttonsFocus.querySelectorAll("button.focus")
      ).forEach((button) => button.classList.remove("focus"));
      button.classList.add("focus");

      useThis.reactivity.load.value = true;
      $elements.itemTrue.innerHTML = "";

      useThis.functions.unobserve();
      useThis.function.dataLoad();
    }
  });

  $elements.itemTrueLoad.addEventListener(
    "_IntersectionObserver",
    ({ detail }) => {
      if (detail.entry.isIntersecting) {
        detail.observer.unobserve(detail.entry.target);
        useThis.function.dataLoad();
      }
    }
  );

  addEventListener(
    "hashchange",
    () => {
      useThis.functions.unobserve();
    },
    { once: true }
  );

  useThis.reactivity.load.observe((load) => {
    const dataItem = $elements.itemTrue.querySelector("[data-item]");

    const render = {
      itemNull: load,
      itemFalse: !load && !dataItem,
      itemTrue: !load && !!dataItem,
    };

    Object.entries(render).forEach((entries) => {
      $elements[entries[0]].style.display = entries[1] ? "" : "none";
    });
  });

  useThis.reactivity.Data.observe((Data) => {
    {
      const type = $elements.buttonsFocus
        .querySelector("button.focus")
        .getAttribute("data-gender");

      Data = Data.filter((data) => Object.keys(data).length);

      if (["pelicula", "serie"].includes(type)) {
        return useThis.function.dataRenderPeliculaSerie(Data);
      }

      if (type == "anime") {
        return useThis.function.dataRenderAnime(Data);
      }

      if (type == "youtube") {
        return useThis.function.dataRenderYoutube(Data);
      }
    }
  });

  useThis.function.dataLoad();

  return $element;
};

var historial = () => {
  const useApp = window.dataApp;
  const useThis = {
    params: useApp.routes.params(),
    reactivity: {
      load: defineVal(true),
      Data: defineVal([]),
    },
    values: {
      observes: [],
      dates: {},
    },
    function: {
      dataLoad: () => {},
    },
    functions: {},
  };

  const $element = createNodeElement(`

        <div class="div_Xu02Xjh">

            <header class="header_K0hs3I0">
 
                <div class="div_uNg74XS div_McPrYGP">
                    <a href="#/favoritos" class="button_lvV6qZu">
                      ${useApp.icon.get("fi fi-rr-angle-small-left")}
                    </a>
                    <div class="div_sZZicpN">  
                        <h3>Historial</h3>
                        <span style="display:none">${useThis.params.type}</span>
                    </div>
                </div>

            </header>

            <div class="div_BIchAsC">
                <div id="buttonsFocus" data-gender="Todos" class="div_O73RBqH">

                    ${Object.entries({
                      anime: "Animes",
                      pelicula: "peliculas",
                      serie: "series",
                      // youtube: "YT Videos",
                    })
                      .map((entries, index) => {
                        return `
                        <button 
                          data-gender="${entries[0]}" 
                          class="${index == 0 ? "focus" : ""}">
                        ${entries[1]}
                        </button>`;
                      })
                      .join("")}
                </div>
            </div>
        
            <div class="div_IsTCHpN">
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                  ${useApp.icon.get("fi fi-rr-search-alt")}
                  <h3>sin resultados</h3>
                </div>

                <div id="itemTrue" class="">
                    <div id="itemTrueLoad" class="div_Qm4cPUn">
                        <div class="loader-i" style="--color:var(--color-letter)"></div>
                    </div>
                </div>
                
            </div>

        </div>

  `);

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  useThis.function.dataRenderAnime = (Data) => {
    const template = document.createElement("div");
    template.innerHTML = Data.map((data) => {
      const date = new Date(data.other.datetime);
      let fechaFormateada = "";
      if (!useThis.values.dates[date.toLocaleDateString()]) {
        useThis.values.dates[date.toLocaleDateString()] = true;
        fechaFormateada = date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }

      const url = useApp.url.img(data.poster);
      const episode = data.other.episode.padStart(2, "0");

      return `
          ${
            fechaFormateada
              ? `
                <h3 style="grid-column: 1 / -1; padding: 10px">
                  ${fechaFormateada}
                </h3>
              `
              : ""
          }
          
          <a 
            href="#/anime/${data?.identifier}" 
            class="div_SQpqup7" 
            data-item>

              <div class="div_fMC1uk6">
                  <img src="" alt="" data-src="${url}" style="display:none">
                  <span>${data.type ?? ""} | E${episode}</span>
              </div>
              <div class="div_9nWIRZE">
                  <p>${data.title}</p>
              </div>

          </a>
      `;
    }).join("");

    for (const child of template.children) {
      if (child.tagName == "A") {
        child.addEventListener("_IntersectionObserver", ({ detail }) => {
          if (detail.entry.isIntersecting) {
            detail.observer.unobserve(detail.entry.target);
            const img = child.querySelector("img");
            img.onload = () => (img.style.display = "");
            img.src = img.dataset.src;
          }
        });
        useApp.instances.IntersectionObserver.observe(child);
        useThis.values.observes.push(child);
      }
    }

    $elements.itemTrue.append(...template.children);
    $elements.itemTrueLoad.remove();

    if (Data.length === 25) {
      $elements.itemTrue.append($elements.itemTrueLoad);
      useApp.instances.IntersectionObserver.observe($elements.itemTrueLoad);
    }
  };

  useThis.function.dataRenderPeliculaSerie = (Data, type) => {
    const template = document.createElement("div");
    template.innerHTML = Data.map((data) => {
      const date = new Date(data.other.datetime);

      const url = useApp.url.img(
        `https://cuevana.biz/_next/image?url=${data.images.poster}&w=256&q=50`
      );

      let seasonAndEpisode = type;
      let fechaFormateada = "";

      if (type == "serie") {
        const [season, episode] = data.other.episode.split("-");
        if (!episode) return "";

        seasonAndEpisode = `
          T${season.padStart(2, "0")}
          E${episode.padStart(2, "0")}
        `;
      }

      if (data.images.poster == null) return "";

      if (!useThis.values.dates[date.toLocaleDateString()]) {
        useThis.values.dates[date.toLocaleDateString()] = true;
        fechaFormateada = date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }

      return `

        ${
          fechaFormateada
            ? `
              <h3 style="grid-column: 1 / -1; padding: 10px">
                ${fechaFormateada}
              </h3>
            `
            : ""
        }
        <a 
          href="#/${type}/${data.TMDbId}" 
          class="div_SQpqup7" data-item>

            <div class="div_fMC1uk6">
                <img src="" alt="" data-src="${url}" style="display:none">
                <span>${seasonAndEpisode}</span>
            </div>
            <div class="div_9nWIRZE">
                <p>${data.titles.name}</p>
            </div>
        </a>    
      `;
    }).join("");

    Array.from(template.children).forEach((child) => {
      if (child.tagName == "A") {
        child.addEventListener("_IntersectionObserver", ({ detail }) => {
          if (detail.entry.isIntersecting) {
            detail.observer.unobserve(detail.entry.target);
            const img = child.querySelector("img");
            img.onload = () => (img.style.display = "");
            img.src = img.dataset.src;
          }
        });
        useApp.instances.IntersectionObserver.observe(child);
        useThis.values.observes.push(child);
      }
    });

    $elements.itemTrue.append(...template.children);
    $elements.itemTrueLoad.remove();

    if (Data.length === 25) {
      $elements.itemTrue.append($elements.itemTrueLoad);
      useApp.instances.IntersectionObserver.observe($elements.itemTrueLoad);
    }
  };

  useThis.function.dataRenderYoutube = (Data) => {
    const fragment = document.createDocumentFragment();
    fragment.append(
      ...Data.map((data) => {
        return createNodeElement(`
                <a 
                  href="#/youtube/${data.videoId}" 
                  class="div_EJlRW2l" data-item>

                    <div class="div_zcWgA0o">
                        <img 
                          src="${data.thumbnail.thumbnails[0].url}" 
                          alt="">
                        <span>
                          ${data.author || data.ownerText.runs[0].text}
                        </span>
                    </div>
                    <div class="div_9nWIRZE">
                      <p>
                        ${
                          data.title.runs ? data.title.runs[0].text : data.title
                        }
                      </p>
                    </div>
    
                </a>
            `);
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();
  };

  useThis.function.dataLoadAnime = () => {
    const encodeQueryString = encodeQueryObject({
      route: "history",
      type: 1,
      start: $elements.itemTrue.querySelectorAll("[data-item]").length,
      end: 25,
    });

    fetch(useApp.url.server(`/api.php?${encodeQueryString}`), {
      method: "GET",
      headers: {
        "Token-Auth": Cookie.get(useApp.auth),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        useThis.reactivity.load.value = true;
        useThis.reactivity.Data.value = Array.isArray(data)
          ? data.map((data) => {
              return {
                ...JSON.parse(data.data_json),
                other: {
                  episode: data.episode,
                  datetime: data.datetime,
                },
              };
            })
          : [];
        // useThis.reactivity.Data.value = JSON.parse(
        //   localStorage.getItem("favorite_anime")
        // );
        useThis.reactivity.load.value = false;
      });
  };

  useThis.function.dataLoadPeliculaSerie = (type) => {
    const encodeQueryString = encodeQueryObject({
      route: "history",
      type: type == "pelicula" ? 2 : 3,
      start: $elements.itemTrue.querySelectorAll("[data-item]").length,
      end: 25,
    });

    fetch(useApp.url.server(`/api.php?${encodeQueryString}`), {
      method: "GET",
      headers: {
        "Token-Auth": Cookie.get(useApp.auth),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        useThis.reactivity.load.value = true;
        useThis.reactivity.Data.value = Array.isArray(data)
          ? data.map((data) => {
              return {
                ...JSON.parse(data.data_json),
                other: {
                  episode: data.episode,
                  datetime: data.datetime,
                },
              };
            })
          : [];
        // useThis.reactivity.Data.value = JSON.parse(
        //   localStorage.getItem("favorite_anime")
        // );
        useThis.reactivity.load.value = false;
      });

    // useThis.reactivity.load.value = true;
    // useThis.reactivity.Data.value = JSON.parse(
    //   localStorage.getItem(
    //     type == "pelicula" ? "favorite_pelicula" : "favorite_serie"
    //   )
    // );
    // useThis.reactivity.load.value = false;
  };

  useThis.function.dataLoadYoutube = () => {
    useThis.reactivity.load.value = true;
    useThis.reactivity.Data.value = JSON.parse(
      localStorage.getItem("favorite_yt_video")
    );
    useThis.reactivity.load.value = false;
  };

  useThis.function.dataLoad = () => {
    const type = $elements.buttonsFocus
      .querySelector("button.focus")
      .getAttribute("data-gender");
    $elements.itemTrue.setAttribute(
      "class",
      ["anime", "pelicula", "serie"].includes(type)
        ? "div_qsNmfP3"
        : "div_FtxwFbU"
    );

    if (["pelicula", "serie"].includes(type)) {
      return useThis.function.dataLoadPeliculaSerie(type);
    }

    if (type == "anime") {
      return useThis.function.dataLoadAnime();
    }

    if (type == "youtube") {
      return useThis.function.dataLoadYoutube();
    }
  };

  useThis.functions.unobserve = () => {
    for (const observe of useThis.values.observes) {
      useApp.instances.IntersectionObserver.unobserve(observe);
    }

    useThis.values.observes = [];
  };

  $elements.buttonsFocus.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button) {
      Array.from(
        $elements.buttonsFocus.querySelectorAll("button.focus")
      ).forEach((button) => button.classList.remove("focus"));
      button.classList.add("focus");

      useThis.reactivity.load.value = true;
      $elements.itemTrue.innerHTML = "";
      useThis.values.dates = {};

      useThis.functions.unobserve();
      useThis.function.dataLoad();
    }
  });

  $elements.itemTrueLoad.addEventListener(
    "_IntersectionObserver",
    ({ detail }) => {
      if (detail.entry.isIntersecting) {
        detail.observer.unobserve(detail.entry.target);
        useThis.function.dataLoad();
      }
    }
  );

  addEventListener(
    "hashchange",
    () => {
      useThis.functions.unobserve();
    },
    { once: true }
  );

  useThis.reactivity.load.observe((load) => {
    const dataItem = $elements.itemTrue.querySelector("[data-item]");

    const render = {
      itemNull: load,
      itemFalse: !load && !dataItem,
      itemTrue: !load && !!dataItem,
    };

    Object.entries(render).forEach((entries) => {
      $elements[entries[0]].style.display = entries[1] ? "" : "none";
    });
  });

  useThis.reactivity.Data.observe((Data) => {
    {
      const type = $elements.buttonsFocus
        .querySelector("button.focus")
        .getAttribute("data-gender");

      Data = Data.filter((data) => Object.keys(data).length);

      if (["pelicula", "serie"].includes(type)) {
        return useThis.function.dataRenderPeliculaSerie(Data, type);
      }

      if (type == "anime") {
        return useThis.function.dataRenderAnime(Data);
      }

      if (type == "youtube") {
        return useThis.function.dataRenderYoutube(Data);
      }
    }
  });

  useThis.function.dataLoad();

  return $element;
};

var login = () => {
  const useApp = window.dataApp;
  ({
    params: useApp.routes.params(),
    reactivity: {
      isFavorite: defineVal(false),
      load: defineVal(true),
      data: defineVal({}),
      episodes: defineVal([]),
    },
    functions: {},
  });

  const $element = createNodeElement(`

    <div class="div_Xu02Xjh">

        <header class="header_K0hs3I0">

            <div class="div_uNg74XS">
                <a href="#/" class="button_lvV6qZu" data-history-back>
                  ${useApp.icon.get("fi fi-rr-angle-small-left")}
                </a>
                <h3 id="textTitle"></h3>
            </div>

        </header>

        <div class="div_IsTCHpN p-10px">
             
          <form id="form" class="div_SCqCUTo" autocomplete="off">
              <h2 style="padding: 0 20px;">Iniciar sesion</h2>
              <div class="div_Y85zRC0">
                  <label class="label_ieXcceLhkyD2WGY label_0BFeKpk">
                      <input type="text" name="email" placeholder="">
                      <span>correo</span>
                  </label>
              </div>
              <button id="buttonSubmit" class="button_WU25psx">
                  <span id="spanLoad">Recibir codigo</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-envelope"><path d="M19,1H5A5.006,5.006,0,0,0,0,6V18a5.006,5.006,0,0,0,5,5H19a5.006,5.006,0,0,0,5-5V6A5.006,5.006,0,0,0,19,1ZM5,3H19a3,3,0,0,1,2.78,1.887l-7.658,7.659a3.007,3.007,0,0,1-4.244,0L2.22,4.887A3,3,0,0,1,5,3ZM19,21H5a3,3,0,0,1-3-3V7.5L8.464,13.96a5.007,5.007,0,0,0,7.072,0L22,7.5V18A3,3,0,0,1,19,21Z"></path></svg>
              </button>
              <a href="#/register" class="a_8hzaMUg">
                  <span>registro</span>
                  ${useApp.icon.get("fi fi-rr-arrow-right")}
              </a>
          </form>
          <form id="form2" class="div_SCqCUTo" autocomplete="off" style="display: none">
              <div class="d-flex" style="align-items: center;">
                <button id="buttonBack" class="wh-40px d-flex-center" type="button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-angle-left"><path d="M17.17,24a1,1,0,0,1-.71-.29L8.29,15.54a5,5,0,0,1,0-7.08L16.46.29a1,1,0,1,1,1.42,1.42L9.71,9.88a3,3,0,0,0,0,4.24l8.17,8.17a1,1,0,0,1,0,1.42A1,1,0,0,1,17.17,24Z"></path></svg></button>
                <h2>Ingresar codigo</h2>
              </div>
              <div class="div_Y85zRC0" >
                  <label class="label_ieXcceLhkyD2WGY label_0BFeKpk pointer-off" style="opacity: 0.7">
                      <input type="text" name="email" placeholder="" tabindex="-1">
                      <span>correo</span>
                  </label>
                  <label id="labelCode" class="label_ieXcceLhkyD2WGY label_0BFeKpk">
                      <input type="number" name="code" placeholder="" autocomplete="off" tabindex="-1">
                      <span>codigo</span>
                  </label>
              </div>
              <a href="#" id="aSendEmail" class="a_c305F1l">Volver a recibir codigo</a>
              <button id="buttonSubmit" class="button_WU25psx" >
                  <span id="spanLoad">Ingresar</span>
                  ${useApp.icon.get("fi fi-rr-arrow-right")}
              </button>
              <a href="#/register" class="a_8hzaMUg" >
                  <span>registro</span>
                  ${useApp.icon.get("fi fi-rr-arrow-right")}
              </a>
          </form>

        </div>

    </div>

`);

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  $elements.form.addEventListener("submit", (e) => {
    e.preventDefault();

    $elements.form.style.display = "none";
    $elements.form2.style.display = "";

    const body = {
      email: $elements.form.email.value.trim(),
    };

    fetch(useApp.url.server("/api.php?route=auth.login-email-get"), {
      method: "POST",
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.status) {
          alert("Email no registrado");
          $elements.buttonBack.dispatchEvent(new CustomEvent("click"));
        }
      });
  });

  $elements.form2.addEventListener("submit", (e) => {
    e.preventDefault();

    location.hash = `/login/code/${encodeURIComponent(
      JSON.stringify([$elements.form2.email.value, $elements.form2.code.value])
    )}`;
  });

  $elements.form.email.addEventListener("input", () => {
    $elements.form2.email.value = $elements.form.email.value.trim();
  });

  $elements.form2.code.addEventListener("input", (e) => {
    if (e.target.value.length > 6) e.target.value = e.target.value.slice(0, 6);
  });

  $elements.aSendEmail.addEventListener("click", (e) => {
    e.preventDefault();
  });

  $elements.buttonBack.addEventListener("click", () => {
    $elements.form.style.display = "";
    $elements.form2.style.display = "none";
  });

  // useApp.functions.historyBack($element.querySelector("[data-history-back]"));
  return $element;
};

var register = () => {
  const useApp = window.dataApp;
  ({
    params: useApp.routes.params(),
    reactivity: {
      isFavorite: defineVal(false),
      load: defineVal(true),
      data: defineVal({}),
      episodes: defineVal([]),
    },
    functions: {},
  });

  const $element = createNodeElement(`

    <div class="div_Xu02Xjh">

        <header class="header_K0hs3I0">

            <div class="div_uNg74XS">
                <a href="#/" class="button_lvV6qZu">
                  ${useApp.icon.get("fi fi-rr-angle-small-left")}
                </a>
                <h3 id="textTitle"></h3>
            </div>

        </header>

        <div class="div_IsTCHpN p-10px">
             
          <form id="form" class="div_SCqCUTo" autocomplete="off">
              <h2 style="padding: 0 20px;">Registro</h2>
              <div class="div_Y85zRC0">
                  <label class="label_ieXcceLhkyD2WGY label_0BFeKpk">
                      <input type="text" name="fullname" placeholder="">
                      <span>Nombre</span>
                  </label>
                  <label class="label_ieXcceLhkyD2WGY label_0BFeKpk">
                      <input type="text" name="lastname" placeholder="" autocomplete="off">
                      <span>Apellido</span>
                  </label>
                  <label class="label_ieXcceLhkyD2WGY label_0BFeKpk">
                      <input type="text" name="email" placeholder="" autocomplete="off">
                      <span>Correo</span>
                  </label>
              </div>
              <button class="button_WU25psx">
                  <span id="spanLoad">Crear cuenta</span>
                  ${useApp.icon.get("fi fi-rr-arrow-right")}
              </button>
              <a href="#/login" class="a_8hzaMUg">
                  <span>Iniciar sesion</span>
                  ${useApp.icon.get("fi fi-rr-arrow-right")}
              </a>
          </form>

        </div>

    </div>

`);

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  $elements.form.addEventListener("submit", (e) => {
    e.preventDefault();

    const body = {
      fullname: $elements.form.fullname.value.trim(),
      lastname: $elements.form.lastname.value.trim(),
      email: $elements.form.email.value.trim(),
    };

    fetch(useApp.url.server("/api.php?route=auth.register"), {
      method: "POST",
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log(data);
      });

    // console.log(body);
  });

  return $element;
};

var loginKeyValue = () => {
  const useApp = window.dataApp;
  const useThis = {
    params: useApp.routes.params(),
    reactivity: {
      isFavorite: defineVal(false),
      load: defineVal(true),
      data: defineVal({}),
      episodes: defineVal([]),
    },
    functions: {},
  };

  const $element = createNodeElement(`<div class=""></div>`);
  createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  if (useThis.params.key == "code") {
    try {
      const [email, code] = JSON.parse(
        decodeURIComponent(useThis.params.value)
      );

      if (true) {
        const body = {
          email,
          code,
        };

        fetch(useApp.url.server("/api.php?route=auth.login-email-set"), {
          method: "POST",
          body: JSON.stringify(body),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.status) {
              Cookie.set(useApp.auth, data.token, {
                lifetime: 60 * 60 * 24 * 7,
              });

              location.hash = "/";
            } else {
              location.hash = "/";
              setTimeout(() => {
                alert("Codigo no valido");
              }, 50);
            }
          });
      }
    } catch (error) {
      // console.log("el codigo no es valido");
    }
  }

  return $element;
};

var profile = () => {
  const useApp = window.dataApp;

  const $element = createNodeElement(`

        <div class="div_Xu02Xjh">

            <header class="header_K0hs3I0">

                <div class="div_uNg74XS">
                    <a href="#/" class="button_lvV6qZu">
                      ${useApp.icon.get("fi fi-rr-angle-small-left")}
                    </a>
                    <h3 id="textTitle">Actualizar datos</h3>
                </div>

            </header>

            <div class="div_IsTCHpN p-10px">
                 
              <form id="form" class="div_SCqCUTo" autocomplete="off">
                  <h2 style="padding: 0 20px;">Actualizar datos</h2>
                  <div class="div_Y85zRC0">
                      <label class="label_ieXcceLhkyD2WGY label_0BFeKpk">
                          <input type="text" name="fullname" placeholder="" autocomplete="off">
                          <span>nombre</span>
                      </label>
                      <label class="label_ieXcceLhkyD2WGY label_0BFeKpk">
                          <input type="text" name="lastname" placeholder="" autocomplete="off">
                          <span>apellido</span>
                      </label>
                  </div>
                  <button class="button_WU25psx">
                      <span id="spanLoad">Actualizar datos</span>
                      ${useApp.icon.get("fi fi-rr-arrow-right")}
                  </button>
                  <a href="#/register" id="aLogout" class="a_8hzaMUg">
                      <span>Cerrar sesion</span>
                      ${useApp.icon.get("fi fi-rr-arrow-right")}
                  </a>
              </form>

            </div>

        </div>

    `);

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  $elements.form.addEventListener("submit", (e) => {
    e.preventDefault();

    const encodeQueryString = encodeQueryObject({
      route: "user",
    });

    const body = {
      fullname: $elements.form.fullname.value.trim(),
      lsatname: $elements.form.lastname.value.trim(),
    };

    fetch(
      useApp.url.server(`/api.php?${encodeQueryString}`),
      useApp.fetchOptions({
        method: "PATCH",
        body: JSON.stringify(body),
      })
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.status) alert("Datos actualizados");
        else alert("Ocurrio un error");
      });
  });

  fetch(
    useApp.url.server(`/api.php?route=user`),
    useApp.fetchOptions({
      method: "GET",
    })
  )
    .then((res) => res.json())
    .then((data) => {
      $elements.form.fullname.value = data?.fullname || "";
      $elements.form.lastname.value = data?.lastname || "";
    });

  $elements.aLogout.addEventListener("click", (e) => {
    e.preventDefault();

    if (confirm("¿Cerrar session?")) {
      const encodeQueryString = encodeQueryObject({
        route: "auth.logout",
        id: "one",
      });

      fetch(
        useApp.url.server(`/api.php?${encodeQueryString}`),
        useApp.fetchOptions({
          method: "POST",
        })
      )
        .then((res) => res.json())
        .then((res) => {
          if (res?.status) {
            location.hash = "/login";
          }
        });
    }
  });

  return $element;
};

var views = () => {
  const useApp = window.dataApp;
  const useThis = {
    params: useApp.routes.params(),
    reactivity: {
      load: defineVal(true),
      Data: defineVal([]),
    },
    values: {
      observes: [],
    },
    function: {
      dataLoad: () => {},
    },
    functions: {},
  };

  const $element = createNodeElement(`

        <div class="div_Xu02Xjh">

            <header class="header_K0hs3I0">
 
                <div class="div_uNg74XS div_McPrYGP">
                    <a href="#/favoritos" class="button_lvV6qZu">
                      ${useApp.icon.get("fi fi-rr-angle-small-left")}
                    </a>
                    <div class="div_sZZicpN">  
                        <h3>Vistos</h3>
                        <span style="display:none">${useThis.params.type}</span>
                    </div>
                </div>

            </header>

            <div class="div_BIchAsC">
                <div id="buttonsFocus" data-gender="Todos" class="div_O73RBqH">

                    ${Object.entries({
                      anime: "Animes",
                      pelicula: "peliculas",
                      serie: "series",
                      // youtube: "YT Videos",
                    })
                      .map((entries, index) => {
                        return `
                        <button 
                          data-gender="${entries[0]}" 
                          class="${index == 0 ? "focus" : ""}">
                        ${entries[1]}
                        </button>`;
                      })
                      .join("")}
                </div>
            </div>
        
            <div class="div_IsTCHpN">
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                  ${useApp.icon.get("fi fi-rr-search-alt")}
                  <h3>sin resultados</h3>
                </div>

                <div id="itemTrue" class="">
                    <div id="itemTrueLoad" class="div_Qm4cPUn">
                        <div class="loader-i" style="--color:var(--color-letter)"></div>
                    </div>
                </div>
                
            </div>

        </div>

    `);

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );
  // const renderObjectElement = new RenderObjectElement($elements);

  useThis.function.dataRenderAnime = (Data) => {
    const fragment = document.createDocumentFragment();
    fragment.append(document.createTextNode(""));
    fragment.append(
      ...Data.map((data) => {
        const url = useApp.url.img(data.poster);
        const href = data.href?.split("/").pop();

        const element = createNodeElement(`
            <a 
              href="#/anime/${data?.identifier ?? href}" 
              class="div_SQpqup7" 
              data-item>

                <div class="div_fMC1uk6">
                    <img src="" alt="" data-src="${url}" style="display:none">
                    <span>${data.type ?? ""}</span>
                </div>
                <div class="div_9nWIRZE">
                    <p>${data.title}</p>
                </div>

            </a>
        `);

        element.addEventListener("_IntersectionObserver", ({ detail }) => {
          if (detail.entry.isIntersecting) {
            detail.observer.unobserve(detail.entry.target);

            const img = element.querySelector("img");
            img.onload = () => (img.style.display = "");
            img.src = img.dataset.src;
          }
        });

        useApp.instances.IntersectionObserver.observe(element);
        useThis.values.observes.push(element);
        return element;
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();

    if (Data.length === 25) {
      $elements.itemTrue.append($elements.itemTrueLoad);
      useApp.instances.IntersectionObserver.observe($elements.itemTrueLoad);
    }
  };

  useThis.function.dataRenderPeliculaSerie = (Data) => {
    const fragment = document.createDocumentFragment();
    fragment.append(document.createTextNode(""));
    fragment.append(
      ...Data.map((data) => {
        const slug = data.url.slug
          .split("/")
          .map((name, index) => {
            if (index == 0) {
              if (name == "movies") return "pelicula";
              else if (name == "series") return "serie";
            }
            return name;
          })
          .join("/");

        if (data.images.poster == null) return "";

        const url = useApp.url.img(
          `https://cuevana.biz/_next/image?url=${data.images.poster}&w=256&q=50`
        );

        const element = createNodeElement(`
          <a 
            href="#/${slug.split("/")[0]}/${data.TMDbId}" 
            class="div_SQpqup7" data-item>

              <div class="div_fMC1uk6">
                  <img src="" alt="" data-src="${url}" style="display:none">
                  <span>${slug.split("/")[0]}</span>
              </div>
              <div class="div_9nWIRZE">
                  <p>${data.titles.name}</p>
              </div>
          </a>    
        `);

        element.addEventListener("_IntersectionObserver", ({ detail }) => {
          if (detail.entry.isIntersecting) {
            detail.observer.unobserve(detail.entry.target);

            const img = element.querySelector("img");
            img.onload = () => (img.style.display = "");
            img.src = img.dataset.src;
          }
        });

        useApp.instances.IntersectionObserver.observe(element);
        useThis.values.observes.push(element);
        return element;
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();

    if (Data.length === 25) {
      $elements.itemTrue.append($elements.itemTrueLoad);
      useApp.instances.IntersectionObserver.observe($elements.itemTrueLoad);
    }
  };

  useThis.function.dataRenderYoutube = (Data) => {
    const fragment = document.createDocumentFragment();
    fragment.append(
      ...Data.map((data) => {
        return createNodeElement(`
                <a 
                  href="#/youtube/${data.videoId}" 
                  class="div_EJlRW2l" data-item>

                    <div class="div_zcWgA0o">
                        <img 
                          src="${data.thumbnail.thumbnails[0].url}" 
                          alt="">
                        <span>
                          ${data.author || data.ownerText.runs[0].text}
                        </span>
                    </div>
                    <div class="div_9nWIRZE">
                      <p>
                        ${
                          data.title.runs ? data.title.runs[0].text : data.title
                        }
                      </p>
                    </div>
    
                </a>
            `);
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();
  };

  useThis.function.dataLoadAnime = () => {
    const encodeQueryString = encodeQueryObject({
      route: "views",
      type: 1,
      start: $elements.itemTrue.querySelectorAll("[data-item]").length,
      end: 25,
    });

    fetch(
      useApp.url.server(`/api.php?${encodeQueryString}`),
      useApp.fetchOptions({
        method: "GET",
      })
    )
      .then((res) => res.json())
      .then((data) => {
        useThis.reactivity.load.value = true;
        useThis.reactivity.Data.value = Array.isArray(data)
          ? data.map((data) => JSON.parse(data.data_json))
          : [];
        // useThis.reactivity.Data.value = JSON.parse(
        //   localStorage.getItem("favorite_anime")
        // );
        useThis.reactivity.load.value = false;
      });
  };

  useThis.function.dataLoadPeliculaSerie = (type) => {
    const encodeQueryString = encodeQueryObject({
      route: "views",
      type: type == "pelicula" ? 2 : 3,
      start: $elements.itemTrue.querySelectorAll("[data-item]").length,
      end: 25,
    });

    fetch(
      useApp.url.server(`/api.php?${encodeQueryString}`),
      useApp.fetchOptions({
        method: "GET",
      })
    )
      .then((res) => res.json())
      .then((data) => {
        useThis.reactivity.load.value = true;
        useThis.reactivity.Data.value = Array.isArray(data)
          ? data.map((data) => JSON.parse(data.data_json))
          : [];
        // useThis.reactivity.Data.value = JSON.parse(
        //   localStorage.getItem("favorite_anime")
        // );
        useThis.reactivity.load.value = false;
      });

    // useThis.reactivity.load.value = true;
    // useThis.reactivity.Data.value = JSON.parse(
    //   localStorage.getItem(
    //     type == "pelicula" ? "favorite_pelicula" : "favorite_serie"
    //   )
    // );
    // useThis.reactivity.load.value = false;
  };

  useThis.function.dataLoadYoutube = () => {
    useThis.reactivity.load.value = true;
    useThis.reactivity.Data.value = JSON.parse(
      localStorage.getItem("favorite_yt_video")
    );
    useThis.reactivity.load.value = false;
  };

  useThis.function.dataLoad = () => {
    const type = $elements.buttonsFocus
      .querySelector("button.focus")
      .getAttribute("data-gender");
    $elements.itemTrue.setAttribute(
      "class",
      ["anime", "pelicula", "serie"].includes(type)
        ? "div_qsNmfP3"
        : "div_FtxwFbU"
    );

    if (["pelicula", "serie"].includes(type)) {
      return useThis.function.dataLoadPeliculaSerie(type);
    }

    if (type == "anime") {
      return useThis.function.dataLoadAnime();
    }

    if (type == "youtube") {
      return useThis.function.dataLoadYoutube();
    }
  };

  useThis.functions.unobserve = () => {
    for (const observe of useThis.values.observes) {
      useApp.instances.IntersectionObserver.unobserve(observe);
    }

    useThis.values.observes = [];
  };

  $elements.buttonsFocus.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button) {
      Array.from(
        $elements.buttonsFocus.querySelectorAll("button.focus")
      ).forEach((button) => button.classList.remove("focus"));
      button.classList.add("focus");

      useThis.reactivity.load.value = true;
      $elements.itemTrue.innerHTML = "";

      useThis.functions.unobserve();
      useThis.function.dataLoad();
    }
  });

  $elements.itemTrueLoad.addEventListener(
    "_IntersectionObserver",
    ({ detail }) => {
      if (detail.entry.isIntersecting) {
        detail.observer.unobserve(detail.entry.target);
        useThis.function.dataLoad();
      }
    }
  );

  addEventListener(
    "hashchange",
    () => {
      useThis.functions.unobserve();
    },
    { once: true }
  );

  useThis.reactivity.load.observe((load) => {
    const dataItem = $elements.itemTrue.querySelector("[data-item]");

    const render = {
      itemNull: load,
      itemFalse: !load && !dataItem,
      itemTrue: !load && !!dataItem,
    };

    Object.entries(render).forEach((entries) => {
      $elements[entries[0]].style.display = entries[1] ? "" : "none";
    });
  });

  useThis.reactivity.Data.observe((Data) => {
    {
      const type = $elements.buttonsFocus
        .querySelector("button.focus")
        .getAttribute("data-gender");

      Data = Data.filter((data) => Object.keys(data).length);

      if (["pelicula", "serie"].includes(type)) {
        return useThis.function.dataRenderPeliculaSerie(Data);
      }

      if (type == "anime") {
        return useThis.function.dataRenderAnime(Data);
      }

      if (type == "youtube") {
        return useThis.function.dataRenderYoutube(Data);
      }
    }
  });

  useThis.function.dataLoad();

  return $element;
};

var routes = () => {
  const useApp = window.dataApp;

  useApp.routes.set([
    { hash: "/", callback: inicio },
    { hash: "/login", callback: () => routesPublic(login) },
    { hash: "/register", callback: () => routesPublic(register) },

    { hash: "/login/:key/:value", callback: () => routesPublic(loginKeyValue) },
    { hash: "/profile", callback: () => routesPrivate(profile) },

    { hash: "/youtube", callback: youtube },
    { hash: "/youtube/:id", callback: youtubeId },
    { hash: "/pelicula", callback: pelicula },
    { hash: "/pelicula/:id", callback: peliculaId },
    { hash: "/serie", callback: serie },
    { hash: "/serie/:id", callback: serieId },
    { hash: "/anime", callback: anime },
    { hash: "/anime/:id", callback: animeId },
    { hash: "/search/:type", callback: searchType },
    { hash: "/search/:type/:result", callback: searchType },
    { hash: "/search/:type/:result/result", callback: searchTypeResult },

    { hash: "/favoritos", callback: () => routesPrivate(favoritos) },
    { hash: "/historial", callback: () => routesPrivate(historial) },
    { hash: "/views", callback: () => routesPrivate(views) },
  ]);

  {
    if (history.length <= 2 || history.state == null) {
      history.replaceState({ start: true }, null, location.href);
    }
  }

  addEventListener("hashchange", (e) => {
    let uuid = history.state?.uuid ?? useApp.functions.generateUUID();

    if (!Boolean(e instanceof CustomEvent) && history.state == null) {
      history.replaceState({ start: false, uuid }, null, location.href);
    }

    useApp.elements.meta.color.setAttribute(
      "content",
      localStorage.getItem("theme") == "light" ? "#F7F7F7" : "#000000"
    );

    $element.innerHTML = "";
    if (navigator.onLine) {
      // useThis.values.pages[uuid] || useApp.routes.get() || "";
      $element.append(useApp.routes.get() || "");
    } else {
      $element.append(offline());
    }
  });

  const $element = createNodeElement('<div class="routes"></div>');
  return $element;
};

var Font = [
  {
    name: "predeterminado",
    font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue'",
    link: "",
  },
  {
    name: "Montserrat",
    font: "'Montserrat', sans-serif",
    link: "https://fonts.googleapis.com/css2?family=Montserrat&display=swap",
  },
  {
    name: "Roboto",
    font: "'Roboto', sans-serif",
    link: "https://fonts.googleapis.com/css2?family=Roboto:ital@1&display=swap",
  },
  {
    name: "Lato",
    font: "'Lato', sans-serif",
    link: "https://fonts.googleapis.com/css2?family=Lato&display=swap",
  },
  {
    name: "Open Sans",
    font: "'Open Sans', sans-serif",
    link: "https://fonts.googleapis.com/css2?family=Open+Sans&display=swap",
  },
  {
    name: "Poppins",
    font: "'Poppins', sans-serif",
    link: "https://fonts.googleapis.com/css2?family=Poppins&display=swap",
  },
  {
    name: "Playfair Display",
    font: "'Playfair Display', serif",
    link: "https://fonts.googleapis.com/css2?family=Playfair+Display&display=swap",
  },
  {
    name: "Raleway",
    font: "'Raleway', sans-serif",
    link: "https://fonts.googleapis.com/css2?family=Raleway&display=swap",
  },
];

var theme = () => {
  const useApp = window.dataApp;

  addEventListener("_theme", () => {
    if (!localStorage.getItem("theme")) localStorage.setItem("theme", "light");

    if (!localStorage.getItem("theme-chat"))
      localStorage.setItem("theme-chat", "#7C4DFF");

    if (!localStorage.getItem("font-family"))
      localStorage.setItem("font-family", Font[0].name);

    if (!localStorage.getItem("width-navigate"))
      localStorage.setItem("width-navigate", "80px");

    const font = Font.find(
      (font) => font.name == "Montserrat" //localStorage.getItem("font-family")
    );
    const theme = localStorage.getItem("theme") == "light" ? "light" : "dark";

    const themes = {
      "color-background-transparent": {
        light: "rgb(0 0 0 / 0.1)",
        dark: "rgb(255 255 255 / 0.1)",
      },
      "color-background-transparent-reverse": {
        light: "rgb(255 255 255 / 0.1)",
        dark: "rgb(0 0 0 / 0.1)",
      },
      "color-background": {
        light: "#F7F7F7",
        dark: "#000000",
      },
      "color-item": {
        light: "#FFFFFF",
        dark: "#1A1A1A",
      },
      "color-letter": {
        light: "#000000",
        dark: "#FFFFFF",
      },
      "filter-img": {
        light: "initial",
        dark: "invert(82%) sepia(99%) saturate(0%) hue-rotate(102deg) brightness(111%) contrast(100%)",
      },
      "color-chat": {
        light: localStorage.getItem("theme-chat"),
        dark: localStorage.getItem("theme-chat"),
      },
      "font-family": {
        light: font.font,
        dark: font.font,
      },
      "width-navigate": {
        light: localStorage.getItem("width-navigate"),
        dark: localStorage.getItem("width-navigate"),
      },
    };

    useApp.elements.meta.color.setAttribute(
      "content",
      themes["color-background"][theme]
    );
    useApp.elements.style.app.innerHTML = [
      `@import url("${font.link}")`,
      `:root {${Object.entries(themes)
        .map((themes) => `--${themes[0]} : ${themes[1][theme]}`)
        .join("; ")}}`,
    ].join(";\n");
  });

  return document.createTextNode("");
};

class ElementMakeDrag {
  constructor(element) {
    this._element = element;
    this._events = {};
  }

  on = (type, callback) => {
    this._events[type] = callback;
  };

  start = () => {
    let draggable = this._element;
    let element = this._element;

    const startDragging = (e) => {
      if (typeof this._events.start == "function") {
        this._events.start({
          e,
          target: draggable,
        });
      }

      if (e.type === "mousedown") {
        e.preventDefault();
      }

      element.addEventListener("touchmove", drag, { passive: false });
      element.addEventListener("touchend", stopDragging);
      element.addEventListener("mousemove", drag);
      element.addEventListener("mouseup", stopDragging);
      element.addEventListener("mouseleave", stopDragging);
    };

    const drag = (e) => {
      if (typeof this._events.move == "function") {
        this._events.move({
          e,
          target: draggable,
        });
      }
    };

    const stopDragging = (e) => {
      // allowtouchstart = true;
      if (typeof this._events.end == "function") {
        this._events.end({
          e,
          target: draggable,
        });
      }

      if (e.touches && e.touches.length > 0) return;
      element.removeEventListener("touchmove", drag);
      element.removeEventListener("touchend", stopDragging);
      element.removeEventListener("mousemove", drag);
      element.removeEventListener("mouseup", stopDragging);
      element.removeEventListener("mouseleave", stopDragging);
    };

    draggable.addEventListener("touchstart", startDragging, {
      passive: false,
    });
    draggable.addEventListener("mousedown", startDragging);
  };
}

function calculateNewPosition(
  top,
  left,
  width,
  height,
  newWidth,
  newHeight
) {
  // Calcula la diferencia en tamaño para cada eje
  const deltaX = (newWidth - width) / 2;
  const deltaY = (newHeight - height) / 2;

  // Ajusta las posiciones de left y top para mantener el centro
  const newLeft = left - deltaX;
  const newTop = top - deltaY;

  return { top: newTop, left: newLeft };
}

var footerVideoPlayer = () => {
  const useApp = window.dataApp;
  const useThis = {
    elements: {
      video: useApp.mediaPlayer.element("video"),
    },
    classes: {
      divPreview: null,
      divPrueba: null,
    },
    values: {
      pinch: {
        start: false,
        escala: 1,
        ultimaDistancia: 0,
      },
    },
  };

  const $element = createNodeElement(`
        <footer class="footer_rTzBt2c">

            <div id="divPrueba" class="div_MJ5Ba2C" style="pointer-events:none;">
              <div id="divPreview" class="div_wPiZgS6" style="display:none;">
                  <div id="divPreviewContent" class="d-grid">
                    <canvas id="canvasVideo" style="aspect-ratio: 16/9;"></canvas>
                    <div class="div_OZ6oAgh"><span id="spanBar"></span></div>
                    <div class="div_lq8dhAa">
                        <button id="buttonPlayPause"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-play"><path d="M20.494,7.968l-9.54-7A5,5,0,0,0,3,5V19a5,5,0,0,0,7.957,4.031l9.54-7a5,5,0,0,0,0-8.064Zm-1.184,6.45-9.54,7A3,3,0,0,1,5,19V5A2.948,2.948,0,0,1,6.641,2.328,3.018,3.018,0,0,1,8.006,2a2.97,2.97,0,0,1,1.764.589l9.54,7a3,3,0,0,1,0,4.836Z"></path></svg></button>
                        <button id="buttonPIP"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-svg-name="fi fi-rr-resize"><path d="m19 0h-8a5.006 5.006 0 0 0 -5 5v6h-1a5.006 5.006 0 0 0 -5 5v3a5.006 5.006 0 0 0 5 5h3a5.006 5.006 0 0 0 5-5v-1h6a5.006 5.006 0 0 0 5-5v-8a5.006 5.006 0 0 0 -5-5zm-8 16a3 3 0 0 1 -3-3 3 3 0 0 1 3 3zm0 3a3 3 0 0 1 -3 3h-3a3 3 0 0 1 -3-3v-3a3 3 0 0 1 3-3h1a5.006 5.006 0 0 0 5 5zm11-6a3 3 0 0 1 -3 3h-6a4.969 4.969 0 0 0 -.833-2.753l5.833-5.833v2.586a1 1 0 0 0 2 0v-3a3 3 0 0 0 -3-3h-3a1 1 0 0 0 0 2h2.586l-5.833 5.833a4.969 4.969 0 0 0 -2.753-.833v-6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3z"></path></svg></button>
                        <button id="buttonCloseVideo"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-cross"><path d="M23.707.293h0a1,1,0,0,0-1.414,0L12,10.586,1.707.293a1,1,0,0,0-1.414,0h0a1,1,0,0,0,0,1.414L10.586,12,.293,22.293a1,1,0,0,0,0,1.414h0a1,1,0,0,0,1.414,0L12,13.414,22.293,23.707a1,1,0,0,0,1.414,0h0a1,1,0,0,0,0-1.414L13.414,12,23.707,1.707A1,1,0,0,0,23.707.293Z"></path></svg></button>
                    </div>
                  </div>
              </div>
            </div>
            
            <div class="div_rFbZYz7">
                <div id="elementVideo" class="div_DFHkIAJ pointer-on"></div>
            </div>
            
        </footer>
  `);

  const $elements = createObjectElement(
    $element.querySelectorAll("[id]"),
    "id",
    true
  );

  const context = $elements.canvasVideo.getContext("2d");

  const draw = () => {
    const video = useThis.elements.video;
    const canvas = $elements.canvasVideo;
    if (!video.paused && !video.ended) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      requestAnimationFrame(draw);
    }
  };

  $elements.canvasVideo.addEventListener("click", () => {
    useApp.mediaPlayer.element().requestFullscreen();
  });

  $elements.buttonPlayPause.addEventListener("click", () => {
    if (useThis.elements.video.paused) useThis.elements.video.play();
    else useThis.elements.video.pause();
  });

  $elements.buttonPIP.addEventListener("click", () => {
    useThis.elements.video.requestPictureInPicture();
  });

  $elements.buttonCloseVideo.addEventListener("click", () => {
    $elements.divPreview.style.display = "none";
    useApp.mediaPlayer.video((video) => {
      video.src = "";
    });
  });

  useThis.elements.video.addEventListener("play", () => {
    $elements.buttonPlayPause.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-pause"><path d="M6.5,0A3.5,3.5,0,0,0,3,3.5v17a3.5,3.5,0,0,0,7,0V3.5A3.5,3.5,0,0,0,6.5,0ZM8,20.5a1.5,1.5,0,0,1-3,0V3.5a1.5,1.5,0,0,1,3,0Z"></path><path d="M17.5,0A3.5,3.5,0,0,0,14,3.5v17a3.5,3.5,0,0,0,7,0V3.5A3.5,3.5,0,0,0,17.5,0ZM19,20.5a1.5,1.5,0,0,1-3,0V3.5a1.5,1.5,0,0,1,3,0Z"></path></svg>';
    draw();
  });
  useThis.elements.video.addEventListener("pause", () => {
    $elements.buttonPlayPause.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-play"><path d="M20.494,7.968l-9.54-7A5,5,0,0,0,3,5V19a5,5,0,0,0,7.957,4.031l9.54-7a5,5,0,0,0,0-8.064Zm-1.184,6.45-9.54,7A3,3,0,0,1,5,19V5A2.948,2.948,0,0,1,6.641,2.328,3.018,3.018,0,0,1,8.006,2a2.97,2.97,0,0,1,1.764.589l9.54,7a3,3,0,0,1,0,4.836Z"></path></svg>';
  });

  useThis.elements.video.addEventListener("timeupdate", () => {
    styleElement($elements.spanBar, {
      width:
        getPercentage(
          useThis.elements.video.currentTime,
          useThis.elements.video.duration
        ) + "%",
    });
  });

  useThis.elements.video.addEventListener("loadstart", () => {
    if (useThis.elements.video.getAttribute("src").trim()) {
      $elements.divPreview.style.display = "";
    }
  });

  useThis.elements.video.addEventListener("loadedmetadata", () => {
    $elements.canvasVideo.width = useThis.elements.video.videoWidth;
    $elements.canvasVideo.height = useThis.elements.video.videoHeight;
    $elements.canvasVideo.style.aspectRatio = "";
  });

  useThis.elements.video.addEventListener("error", (e) => {
    if (e.target.error.code == 3) {
      useApp.values.hls.recoverMediaError();
      e.target.play();
    }
  });

  useThis.elements.video.addEventListener("enterpictureinpicture", () => {
    $elements.divPreview.style.display = "none";
  });

  useThis.elements.video.addEventListener("leavepictureinpicture", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    $elements.divPreview.style.display = "";
  });

  $elements.elementVideo.append(useApp.mediaPlayer.element());

  const function_pmgnvcdirebja = () => {
    const elementMakeDrag = new ElementMakeDrag($elements.divPrueba);
    const draggable = $elements.divPreview;

    const datapinch = {
      allow: false,
      startdistance: 0,
      lastdistance: 0,
      scale: 1,
    };

    const datamove = {
      allow: false,
      xy: {
        initial: {
          x: 0,
          y: 0,
        },
        current: {
          x: 0,
          y: 0,
        },
      },
    };

    elementMakeDrag.on("start", ({ e, target }) => {
      target.style.pointerEvents = "";

      if (e.touches) {
        if (!draggable.contains(e.touches[0].target)) return;
      }

      if (draggable.contains(e.target)) {
        datamove.allow = true;

        if (e.type === "touchstart") {
          const index = Array.from(e.touches).findIndex((touch) =>
            draggable.contains(touch.target)
          );

          datamove.xy.initial.x =
            e.touches[index].clientX - draggable.offsetLeft;
          datamove.xy.initial.y =
            e.touches[index].clientY - draggable.offsetTop;
        } else {
          datamove.xy.initial.x = e.clientX - draggable.offsetLeft;
          datamove.xy.initial.y = e.clientY - draggable.offsetTop;
        }

        if (e.touches && e.touches.length === 2) {
          datapinch.allow = true;
          datapinch.lastdistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        }
      }
    });
    elementMakeDrag.on("move", ({ e }) => {
      if (datamove.allow) {
        $elements.divPreviewContent.style.pointerEvents = "none";

        if (e.type === "touchmove") {
          e.preventDefault();
          const index = Array.from(e.touches).findIndex((touch) =>
            draggable.contains(touch.target)
          );

          if (index != -1) {
            datamove.xy.current.x =
              e.touches[index].clientX - datamove.xy.initial.x;
            datamove.xy.current.y =
              e.touches[index].clientY - datamove.xy.initial.y;
          }
        } else {
          datamove.xy.current.x = e.clientX - datamove.xy.initial.x;
          datamove.xy.current.y = e.clientY - datamove.xy.initial.y;
        }

        const top = draggable.offsetHeight / 2;
        const left = draggable.offsetWidth / 2;

        const y = Math.max(
          top * -1,
          Math.min(
            datamove.xy.current.y,
            window.innerHeight - draggable.offsetHeight + top
          )
        );

        const x = Math.max(
          left * -1,
          Math.min(
            datamove.xy.current.x,
            window.innerWidth - draggable.offsetWidth + left
          )
        );

        draggable.style.top = `${y}px`;
        draggable.style.left = `${x}px`;

        draggable.style.right = "initial";
        draggable.style.bottom = "initial";
      }

      if (datapinch.allow) {
        if (e.touches && e.touches.length === 2) {
          const currentdistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );

          if (
            (currentdistance > datapinch.lastdistance &&
              parseInt(draggable.style.width) == 700) ||
            (currentdistance < datapinch.lastdistance &&
              parseInt(draggable.style.width) == 150)
          )
            return (datapinch.lastdistance = currentdistance);

          const scalerelative = currentdistance / datapinch.lastdistance;
          datapinch.scale *= scalerelative;

          datapinch.lastdistance = currentdistance;

          if (!draggable.getAttribute("data-width")) {
            draggable.setAttribute("data-width", draggable.offsetWidth);
          }

          draggable.style.width = `${Math.max(
            150,
            Math.min(
              parseInt(draggable.getAttribute("data-width")) * datapinch.scale,
              700
            )
          )}px`;
        }
      }
    });
    elementMakeDrag.on("end", ({ e, target }) => {
      if (datamove.allow && ((e.touches && !e.touches.length) || !e.touches)) {
        datamove.allow = false;
      }

      if (datapinch.allow && e.touches && e.touches.length != 2) {
        datapinch.allow = false;
      }

      if (e.touches && e.touches.length) return;

      target.style.pointerEvents = "none";
      $elements.divPreviewContent.style.pointerEvents = "";
    });

    draggable.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();

        const draggablegetBoundingClientRect =
          draggable.getBoundingClientRect();

        draggable.style.width = `${Math.max(
          150,
          Math.min(draggable.offsetWidth - (e.deltaY > 0 ? 10 : -10), 1000)
        )}px`;

        const draggablegetBoundingClientRect2 =
          draggable.getBoundingClientRect();

        const datasss = calculateNewPosition(
          draggablegetBoundingClientRect.top,
          draggablegetBoundingClientRect.left,
          draggablegetBoundingClientRect.width,
          draggablegetBoundingClientRect.height,
          draggablegetBoundingClientRect2.width,
          draggablegetBoundingClientRect2.height
        );

        draggable.style.left = `${datasss.left}px`;
        draggable.style.top = `${datasss.top}px`;

        draggable.style.right = "initial";
        draggable.style.bottom = "initial";
      },
      { passive: false }
    );

    addEventListener("resize", () => {
      if (draggable.style.left != "" || draggable.style.top != "") {
        draggable.style.top = "";
        draggable.style.left = "";
        draggable.style.right = "20px";
        draggable.style.bottom = "20px";
      }
    });

    elementMakeDrag.start();
  };

  function_pmgnvcdirebja();

  return $element;
};

addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

addEventListener("DOMContentLoaded", () => {
  storageObject(
    localStorage,
    {
      favorite_pelicula: JSON.stringify([]),
      favorite_serie: JSON.stringify([]),
      favorite_yt_video: JSON.stringify([]),
      favorite_anime: JSON.stringify([]),
      search_history: JSON.stringify([]),
      episodes_direction: 0,
    },
    false
  );

  window.dataApp = dataApp();
  theme();

  findElementWithRetry("request-disable-cors").then((requestDisableCors) => {
    window.dataApp.elements.custom.requestDisableCors = requestDisableCors;
  });

  document.getElementById("app").append(routes(), footerVideoPlayer());

  dispatchEvent(new CustomEvent("hashchange"));
  dispatchEvent(new CustomEvent("_theme"));
});
