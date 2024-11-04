'use strict';

var config = () => {
  const config = {
    routes: new RouteHashCallback(),
    icon: new IconSVG(),
    mediaPlayer: new MediaPlayer(
      document.createDocumentFragment(),
      "media-player-id-iW8IhsgzukptrV"
    ),

    url: {
      img: (url = "") =>
        `https://img.vniox.com/index.php?url=${encodeURIComponent(url)}`,
      // fetch: (url = "") =>
      //   `https://fetch.victor01sp.com/get.php?url=${encodeURIComponent(
      //     url
      //   )}`,
      fetch: (url = "") => url,
      rr: (path = "") => `https://app.victor01sp.com/rr` + path,
    },

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
    },
  };

  return config;
};

var peliculaId = () => {
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

  const $element = replaceNodeChildren(
    createNodeElement(`
        <div class="div_Xu02Xjh children-hover div_mrXVL9t">
             
            <header class="header_K0hs3I0 header_RtX3J1X">

                <div class="div_uNg74XS">
                    <a href="#/pelicula" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-angle-small-left"
                    )}</a>
                    <h3 id="textTitle"></h3>
                </div>

                <div class="div_x0cH0Hq">
                    <button id="favorite" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-heart"
                    )}</button>
                    <button id="play" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-play"
                    )}</button>
                </div>

            </header>
            <div id="item" class="div_guZ6yID div_DtSQApy">
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                    ${useApp.icon.get("fi fi-rr-search-alt")}
                    <h3>La pelicula no existe</h3>
                </div> 
                <div id="itemTrue" class="div_hqzh2NV">

                    <div class="div_rCXoNm8">
                        <div class="div_vm3LkIt">
                            <img id="backdrop" src="">
                        </div>
                        <div class="div_y6ODhoe">
                            <picture class="picture_BLSEWfU"><img id="poster" src=""></picture>
                            <div class="div_K2RbOsL">
                                <h2 id="title"></h2>
                                <p id="overview"></p>
                                <div class="div_aSwP0zW">
                                    <span id="genres"></span>
                                    <span id="duration"></span>
                                    <span id="date"></span>
                                </div>
                            </div>
                        </div>
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
      //data.images.poster.replace("/original/", "/w342/")
      // $elements.backdrop.src              = useApp.url.img( `https://cuevana.biz/_next/image?url=${ data.images.backdrop }&w=828&q=75` )
      $elements.poster.src = useApp.url.img(
        data.images.poster.replace("/original/", "/w342/")
      );
      $elements.title.textContent = data.titles.name;
      $elements.overview.textContent = data.overview;
      $elements.genres.textContent = data.genres
        .map((genre) => genre.name)
        .join(", ");
      $elements.duration.textContent = `${_convertSecondsToTime.hours}h ${_convertSecondsToTime.minutes}min`;
      $elements.date.textContent = new Date(data.releaseDate).getFullYear();

      $elements.itemTrue.append(document.createTextNode(""));

      $elements.play.setAttribute("data-data", JSON.stringify(data));
      $elements.play.setAttribute("data-slug", `https://cuevana.biz/${slug}`);

      useThis.reactivity.isFavorite.value = JSON.parse(
        localStorage.getItem("favorite_pelicula")
      ).some((video) => video.TMDbId == data.TMDbId);
      $elements.itemTrue.append(document.createTextNode(""));

      useApp.mediaPlayer.settings({
        title: data.titles.name,
        description: data.genres.map((genre) => genre.name).join(", "),
        controls: {
          includesYes: ["*"],
          includesNot: ["lock", "chromecast", "download"],
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

      // otherMovies.value = Object.values(data.movies).flat()
    }
  });

  useThis.functions.getServerAditional = (reference) => {
    return new Promise((resolve, reject) => {
      const encodeQueryString = encodeQueryObject({
        route: "/references",
        reference,
      });
      fetch(
        `https://api.victor01sp.com/streaming_server/api.php?${encodeQueryString}`
      )
        .then((res) => res.json())
        .then((res) => {
          resolve(
            res
              ? {
                  "•": res.servers.map((server) => ({
                    cyberlocker: server.server,
                    quality: server.language,
                    result: server.url,
                  })),
                }
              : {}
          );
        })
        .catch(reject);
    });
  };

  useThis.functions.getLinkDoodstream = (url) => {
    const newURL = new URL(url);
    const hostSplit = newURL.host.split(".");
    const host = hostSplit.length == 3 ? hostSplit[1] : hostSplit[0];
    const mediaPlayer = useApp.mediaPlayer;

    console.log(url);

    if (["streamwish"].includes(host)) {
      MediaWebUrl.streamwish({ url: url }).then((res) => {
        if (res.status) mediaPlayer.open({ url: res.url, Hls: window.Hls });
        else alert("Video no disponible");
      });
    } else if (["voe"].includes(host)) {
      MediaWebUrl.voesx({ url: url }).then((res) => {
        if (res.status) mediaPlayer.open({ url: res.url, Hls: window.Hls });
        else alert("Video no disponible");
      });
    } else if (["doodstream"].includes(host)) {
      console.log("buscar en doodstream");
      // MediaWeb.doodstream({ url : url }).then( res => {
      //     if(res.body.status) mediaPlayer.open({ url : res.body.url });
      //     else alert('Video no disponible')
      // })
    }
  };

  useThis.functions.getLinkVideo = (slug) => {
    const newURL = new URL(slug);

    if (newURL.host != "player.cuevana.biz") {
      return useThis.functions.getLinkDoodstream(slug);
    }

    fetch(useApp.url.fetch(slug))
      .then((res) => res.text())
      .then((text) => {
        const $text = document.createElement("div");
        $text.innerHTML = text;

        Array.from($text.querySelectorAll("img")).forEach((img) => {
          img.removeAttribute("src");
          img.removeAttribute("srcset");
        });

        Array.from($text.querySelectorAll("script")).forEach((script) => {
          if (script.innerHTML.includes("var url =")) {
            const scriptFunction = new Function(
              [
                script.innerHTML.split(";").slice(0, 2).join(";").trim(),
                "return url",
              ].join(";")
            );
            const url = scriptFunction();

            useThis.functions.getLinkDoodstream(url);
          }
        });
      });
  };

  useThis.functions.dataLoad = () => {
    fetch(
      useApp.url.fetch(
        [
          "https://cuevana.biz",
          "pelicula",
          useThis.params.id,
          useThis.params.id,
        ].join("/")
      )
    )
      .then((res) => res.text())
      .then((content) => {
        const pageElement = document.createElement("div");
        pageElement.innerHTML = content;

        Array.from(pageElement.querySelectorAll("img")).forEach((img) => {
          img.removeAttribute("src");
          img.removeAttribute("srcset");
        });

        const datas = JSON.parse(
          pageElement.querySelector("#__NEXT_DATA__").textContent
        );

        if (datas.props.pageProps.thisMovie) {
          // load.value = false
          useThis.reactivity.data.value = {
            ...datas.props.pageProps.thisMovie,
            movies: Object.keys(datas.props.pageProps).reduce((prev, curr) => {
              const array = datas.props.pageProps[curr];
              if (Array.isArray(array)) prev[curr] = array;
              return prev;
            }, {}),
          };

          useThis.reactivity.load.value = false;
        }
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
      // useThis.functions.getServerAditional(data.TMDbId),
      data.videos,
    ]).then((res) => {
      const mergedObject = res.reduce((acc, obj) => ({ ...acc, ...obj }), {});

      $elements.itemTrueOptionVideos.innerHTML = Object.entries(mergedObject)
        .map((data) => {
          let show = true;

          return data[1]
            .map((video) => {
              if (video.result == "") return "";
              if (
                !["doodstream", "streamwish", "voesx"].includes(
                  video.cyberlocker
                )
              )
                return "";

              const visibility = show ? "" : "display:none";
              show = false;

              return `
                        <span class="span_eNUkEzu" style="${visibility}">${data[0]
                .slice(0, 3)
                .toUpperCase()}</span>
                        <button class="button_NuUj5A6" data-type="" data-url="${
                          video.result
                        }" data-quality="">
                            
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
    const favorite = JSON.parse(localStorage.getItem("favorite_pelicula"));
    const index = favorite.findIndex(
      (video) => video.TMDbId == useThis.reactivity.data.value.TMDbId
    );

    if (index == -1) favorite.push(useThis.reactivity.data.value);
    else favorite.splice(index, 1);

    useThis.reactivity.isFavorite.value = index == -1;
    localStorage.setItem("favorite_pelicula", JSON.stringify(favorite));
  });

  $elements.itemTrueOptionVideos.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button) {
      $elements.itemTrueOption.hidePopover();
      useThis.functions.getLinkVideo(button.getAttribute("data-url"));
      useApp.mediaPlayer.element().requestFullscreen();
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
      load: defineVal(true),
      data: defineVal({}),
      episodes: defineVal([]),
    },
  };

  const $element = replaceNodeChildren(
    createNodeElement(`
        <div class="div_Xu02Xjh children-hover div_mrXVL9t">
            <header class="header_K0hs3I0 header_XpmKRuK header_RtX3J1X">

                <div class="div_uNg74XS">
                    <a href="#/serie" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-angle-small-left"
                    )}</a>
                    <h3 id="textTitle"></h3>
                </div>

                <div class="div_x0cH0Hq">
                    <button id="favorite" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-heart"
                    )}</button>
                </div>

            </header>
 
            <div id="item" class="div_guZ6yID div_DtSQApy" >
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                    ${useApp.icon.get("fi fi-rr-search-alt")}
                    <h3>La pelicula no existe</h3>
                </div>
                <div id="itemTrue" class="div_4MNvoOW">

                    <div class="div_rCXoNm8">
                        <div class="div_vm3LkIt">
                            <img id="backdrop" src="">
                        </div>
                        <div class="div_y6ODhoe">
                            <picture class="picture_BLSEWfU"><img id="poster" src=""></picture>
                            <div class="div_K2RbOsL">
                                <h2 id="title"></h2>
                                <p id="overview"></p>
                                <div class="div_aSwP0zW">
                                    <span id="genres"></span>
                                    <span id="duration"></span>
                                    <span id="date"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="div_rJOqfX3">
                        <div class="div_WslendP" >
                            <div id="season" class="div_z0PiH0E" data-season="0" data-data="[]" ></div>
                        </div>
                        <div id="episodes" class="div_2cD7Iqb"></div>
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
          return `<button data-season="${index}" class="${
            index == 0 ? "focus" : ""
          }"><span>temporada ${season.number}</span></button>`;
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
    }
  });

  useThis.functions.renderSeason = () => {
    const index = parseInt($elements.season.getAttribute("data-season"));
    const seasons = JSON.parse($elements.season.getAttribute("data-data"));
    const episodes = seasons[index].episodes;

    const array =
      localStorage.getItem("episodes_direction") == 0
        ? episodes
        : episodes.reverse();

    $elements.episodes.innerHTML = array
      .map((episode) => {
        const slug = episode.url.slug
          .split("/")
          .map((name, index) => {
            if (name == "movies") return "pelicula";
            else if (name == "series") return "serie";
            else if (name == "seasons") return "temporada";
            else if (name == "episodes") return "episodio";
            return name;
          })
          .join("/");

        const url = useApp.url.img(
          `https://cuevana.biz/_next/image?url=${episode.image}&w=384&q=75`
        );

        return `
                <div class="div_LKjl9J4" data-slug="https://cuevana.biz/${slug}" data-data="${EncodeTemplateString.toInput(
          JSON.stringify(episode)
        )}" data-item>
                    <div class="div_nmcQ0GU">
                        <img src="" data-src="${url}">
                        <span>${episode.title}</span>
                        <button class="button_HMIA4Fe"></button>
                    </div>
                </div> 
            `;
      })
      .join("");

    Array.from($elements.episodes.querySelectorAll("img")).forEach((img) =>
      IntersectionObserverImage.load(img, false)
    );

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

  useThis.functions.getReference = (reference) => {
    return new Promise((resolve, reject) => {
      return resolve({});
    });
  };

  useThis.functions.setLinkServer = (url) => {
    const newURL = new URL(url);
    const hostSplit = newURL.host.split(".");
    const host = hostSplit.length == 3 ? hostSplit[1] : hostSplit[0];

    const mediaPlayer = useApp.mediaPlayer;

    if (["streamwish"].includes(host)) {
      MediaWebUrl.streamwish({ url: url }).then((res) => {
        if (res.status) mediaPlayer.open({ url: res.url, Hls: window.Hls });
        else alert("Video no disponible");
      });
    } else if (["voe"].includes(host)) {
      MediaWebUrl.voesx({ url: url }).then((res) => {
        if (res.status) mediaPlayer.open({ url: res.url, Hls: window.Hls });
        else alert("Video no disponible");
      });
    } else if (["doodstream"].includes(host)) {
      MediaWeb.doodstream({ url: url }).then((res) => {
        if (res.body.status) mediaPlayer.open({ url: res.body.url });
        else alert("Video no disponible");
      });
    } else if (["yourupload"].includes(host)) {
      MediaWeb.yourupload({ url: url }).then((res) => {
        if (res.body.status) mediaPlayer.open({ url: res.body.url });
        else alert("Video no disponible");
      });
    }
  };

  useThis.functions.dataLoad = () => {
    fetch(
      useApp.url.fetch(
        [
          "https://cuevana.biz",
          "serie",
          useThis.params.id,
          useThis.params.id,
        ].join("/")
      )
    )
      .then((res) => res.text())
      .then((text) => {
        const $text = document.createElement("div");
        $text.innerHTML = text;

        Array.from($text.querySelectorAll("img")).forEach((img) => {
          img.removeAttribute("src");
          img.removeAttribute("srcset");
        });

        const datas = JSON.parse(
          $text.querySelector("#__NEXT_DATA__").textContent
        );
        if (datas.props.pageProps.thisSerie) {
          useThis.reactivity.data.value = datas.props.pageProps.thisSerie;
          useThis.reactivity.load.value = false;
        }
      });
  };
  useThis.functions.dataLoad();

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

    if (item) {
      $elements.itemTrueOption.showPopover();
      $elements.itemTrueOptionVideos.innerHTML =
        '<div class="loader-i m-auto g-col-full" style="--color:var(--color-letter); padding: 20px 0"></div>';

      fetchWebElement(useApp.url.fetch(item.getAttribute("data-slug"))).then(
        ($result) => {
          Array.from($result.querySelectorAll("img")).forEach((img) => {
            img.removeAttribute("src");
            img.removeAttribute("srcset");
          });

          try {
            const response = JSON.parse(
              $result.querySelector("#__NEXT_DATA__").textContent
            );

            useThis.val.dataInfo = response;
            console.log("good");
            useThis.functions
              .getReference(response.props.pageProps.episode.TMDbId)
              .then((res) => {
                console.log(res);
                const mergedObject = [
                  res,
                  response.props.pageProps.episode.videos,
                ].reduce((acc, obj) => ({ ...acc, ...obj }), {});
                $elements.itemTrueOptionVideos.innerHTML = Object.entries(
                  mergedObject
                )
                  .map((data) => {
                    let show = true;

                    return data[1]
                      .map((video) => {
                        if (video.result == "") return "";
                        if (
                          !["doodstream", "streamwish", "voesx"].includes(
                            video.cyberlocker
                          )
                        )
                          return "";

                        const visibility = show ? "" : "display:none";
                        show = false;

                        return `
                                    <span class="span_eNUkEzu" style="${visibility}">${data[0]
                          .slice(0, 3)
                          .toUpperCase()}</span>
                                    <button class="button_NuUj5A6" data-type="" data-url="${
                                      video.result
                                    }" data-quality="">
                                        
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
          } catch (error) {
            // console.log(error);
          }
        }
      );
    }
  });

  $elements.favorite.addEventListener("click", () => {
    const favorite = JSON.parse(localStorage.getItem("favorite_serie"));
    const index = favorite.findIndex(
      (video) => video.TMDbId == useThis.reactivity.data.value.TMDbId
    );

    if (index == -1) favorite.push(useThis.reactivity.data.value);
    else favorite.splice(index, 1);

    useThis.reactivity.isFavorite.value = index == -1;
    localStorage.setItem("favorite_serie", JSON.stringify(favorite));
  });

  $elements.itemTrueOptionVideos.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button) {
      const url = button.getAttribute("data-url");

      $elements.itemTrueOption.hidePopover();
      useApp.mediaPlayer.element().requestFullscreen();

      useApp.mediaPlayer.settings({
        title: useThis.val.dataInfo.props.pageProps.episode.title,
        description: useThis.val.dataInfo.props.pageProps.serie.genres
          .map((genre) => genre.name)
          .join(", "),
        controls: {
          includesYes: ["*"],
          includesNot: ["lock", "chromecast", "download"],
        },
      });

      const newURL = new URL(url);

      if (newURL.host != "player.cuevana.biz") {
        return useThis.functions.setLinkServer(slug);
      }

      fetch(useApp.url.fetch(newURL.href))
        .then((res) => res.text())
        .then((text) => {
          const $text = document.createElement("div");
          $text.innerHTML = text;

          Array.from($text.querySelectorAll("img")).forEach((img) => {
            img.removeAttribute("src");
            img.removeAttribute("srcset");
          });

          Array.from($text.querySelectorAll("script")).forEach((script) => {
            if (script.innerHTML.includes("var url =")) {
              const scriptFunction = new Function(
                [
                  script.innerHTML.split(";").slice(0, 2).join(";").trim(),
                  "return url",
                ].join(";")
              );
              useThis.functions.setLinkServer(scriptFunction());
            }
          });
        });
    }
  });

  $elements.itemTrueOption.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
      $elements.itemTrueOption.hidePopover();
    }
  });

  useApp.elements.meta.color.setAttribute("content", "#000000");
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
    functions: {},
  };

  const $element = createNodeElement(`

        <div class="div_Xu02Xjh">


            <header class="header_K0hs3I0">

                <div class="div_uNg74XS">
                    <a href="#/" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-angle-small-left"
                    )}</a>
                    <h3 id="textTitle">Pelicula</h3>
                </div>

                <div class="div_x0cH0Hq">
                    <a href="#/search/pelicula" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-search"
                    )}</a>
                </div>

            </header>
 
            <div class="div_BIchAsC">
                <div id="buttonsFocus" data-gender="Todos" class="div_O73RBqH">
                    <button data-gender="Todos" class="focus">Todos</button>
                    <button data-gender="Favoritos">Favoritos</button>
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

  const intersectionObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          useThis.functions.dataLoad();
        }
      });
    },
    { root: null, rootMargin: "0px", threshold: 0 }
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
                <a href="#/${slug.split("/")[0]}/${
          data.TMDbId
        }" class="div_SQpqup7" data-item>
                     
                    <div class="div_fMC1uk6">
                        <img src="" alt="" data-src="${url}">
                        <span>${slug.split("/")[0]}</span>
                    </div>
                    <div class="div_9nWIRZE">
                        <p>${data.titles.name}</p>
                    </div>
    
                </a>    
            `);

        IntersectionObserverImage.load(element.querySelector("img"), true);

        return element;
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();

    if (Data.length > 23) {
      $elements.itemTrue.append($elements.itemTrueLoad);
      intersectionObserver.observe($elements.itemTrueLoad);
    }
  });

  useThis.functions.dataLoad = () => {
    setTimeout(() => {
      const page =
        Math.floor(
          $elements.itemTrue.querySelectorAll("[data-item]").length / 24
        ) + 1;

      let url = "";

      if ($elements.buttonsFocus.getAttribute("data-gender") == "Favoritos") {
        useThis.reactivity.Data.value = JSON.parse(
          localStorage.getItem("favorite_pelicula")
        );
        useThis.reactivity.load.value = false;
        return;
      } else if (
        $elements.buttonsFocus.getAttribute("data-gender") != "Todos"
      ) {
        const gender = $elements.buttonsFocus
          .getAttribute("data-gender")
          .split(" ")
          .join("-")
          .toLowerCase()
          .trim();
        url = useApp.url.fetch(
          `https://cuevana.biz/genero/${gender}/page/${page}`
        );
      } else {
        url = useApp.url.fetch(`https://cuevana.biz/peliculas/page/${page}`);
      }

      fetch(url)
        .then((res) => res.text())
        .then((text) => {
          if (text.trim() == "") {
            useThis.reactivity.Data.value = [];
            useThis.reactivity.load.value = false;
            return;
          }

          const $text = document.createElement("div");
          $text.innerHTML = text;

          Array.from($text.querySelectorAll("img")).forEach((img) => {
            img.removeAttribute("src");
            img.removeAttribute("srcset");
          });

          const datas = JSON.parse(
            $text.querySelector("#__NEXT_DATA__").textContent
          );

          useThis.reactivity.load.value = true;
          useThis.reactivity.Data.value = datas.props.pageProps.movies;
          useThis.reactivity.load.value = false;
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

      button.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  });

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
  };

  const $element = createNodeElement(`

        <div class="div_Xu02Xjh">

            <header class="header_K0hs3I0">

                <div class="div_uNg74XS">
                    <a href="#/" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-angle-small-left"
                    )}</a>
                    <h3 id="textTitle">Series</h3>
                </div>

                <div class="div_x0cH0Hq">
                    <a href="#/search/serie" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-search"
                    )}</a>
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

  const intersectionObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          useThis.functions.dataLoad();
        }
      });
    },
    { root: null, rootMargin: "0px", threshold: 0 }
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
                <a href="#/${slug.split("/")[0]}/${
          data.TMDbId
        }" class="div_SQpqup7" data-item>

                    <div class="div_fMC1uk6">
                        <img src="" alt="" data-src="${url}">
                        <span>${slug.split("/")[0]}</span>
                    </div>
                    <div class="div_9nWIRZE">
                        <p>${data.titles.name}</p>
                    </div>
    
                </a>
            `);

        IntersectionObserverImage.load(element.querySelector("img"), false);

        return element;
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();

    if (Data.length > 23) {
      $elements.itemTrue.append($elements.itemTrueLoad);
      intersectionObserver.observe($elements.itemTrueLoad);
    }
  });

  useThis.functions.dataLoad = () => {
    setTimeout(() => {
      const page =
        Math.floor(
          $elements.itemTrue.querySelectorAll("[data-item]").length / 24
        ) + 1;

      let url = "";

      if ($elements.buttonsFocus.getAttribute("data-gender") == "Favoritos") {
        useThis.reactivity.Data.value = JSON.parse(
          localStorage.getItem("favorite_serie")
        );
        useThis.reactivity.load.value = false;
        return;
      } else if (
        $elements.buttonsFocus.getAttribute("data-gender") != "Todos"
      ) {
        const gender = $elements.buttonsFocus
          .getAttribute("data-gender")
          .split(" ")
          .join("-")
          .toLowerCase()
          .trim();
        url = useApp.url.fetch(
          `https://cuevana.biz/genero/${gender}/page/${page}`
        );
      } else {
        url = useApp.url.fetch(`https://cuevana.biz/series/page/${page}`);
      }

      fetch(url)
        .then((res) => res.text())
        .then((text) => {
          if (text.trim() == "") {
            useThis.reactivity.Data.value = [];
            useThis.reactivity.load.value = false;
            return;
          }

          const $text = document.createElement("div");
          $text.innerHTML = text;

          Array.from($text.querySelectorAll("img")).forEach((img) => {
            img.removeAttribute("src");
            img.removeAttribute("srcset");
          });

          const datas = JSON.parse(
            $text.querySelector("#__NEXT_DATA__").textContent
          );

          useThis.reactivity.load.value = true;
          useThis.reactivity.Data.value = datas.props.pageProps.movies;
          useThis.reactivity.load.value = false;
        });
    });
  };

  useThis.functions.dataLoad();

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
                    <a href="#/" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-angle-small-left"
                    )}</a>
                    <h3 id="textTitle">YT Videos</h3>
                </div>

                <div class="div_x0cH0Hq">
                    <a href="#/catalogo/search/youtube" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-search"
                    )}</a>
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
                <a href="#/youtube/${
                  data.videoId
                }" class="div_EJlRW2l" data-id="${data.videoId}" data-item>

                    <div class="div_zcWgA0o">
                        <img src="${data.thumbnail.thumbnails[0].url}" alt="">
                    </div>
                    <div class="div_9nWIRZE">
                        <span>${
                          data.author || data.ownerText.runs[0].text
                        }</span>
                        <p>${
                          data.title.runs ? data.title.runs[0].text : data.title
                        }</p>
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
                      <a href="#/youtube" class="button_lvV6qZu">${useApp.icon.get(
                        "fi fi-rr-angle-small-left"
                      )}</a>
                      <h3 id="textTitle"></h3>
                  </div>
  
                  <div class="div_x0cH0Hq">
                      <button id="favorite" class="button_lvV6qZu">${useApp.icon.get(
                        "fi fi-rr-heart"
                      )}</button>
                      <button id="openOption" class="button_lvV6qZu" data-id="${
                        useThis.params.id
                      }">${useApp.icon.get(
      "fi fi-rr-settings-sliders"
    )}</button>
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
          console.log(data);

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
          } else {
            const url = data.url ?? data.result ?? data.d_url;

            console.log(url);
            // resizeCanvasImage($elements.poster.src, [{ both: 50 }]).then(
            //   (response) => {
            //     dispatchEvent(
            //       new CustomEvent("_video", {
            //         detail: {
            //           header: {
            //             from: "loadedmetadata",
            //           },
            //           body: {
            //             video: {
            //               url: url,
            //             },
            //             detail: {
            //               title: $elements.title.textContent,
            //               description: $elements.author.textContent,
            //               image: response.images[0].url("image/webp"),
            //               poster: $elements.poster.getAttribute("src"),
            //               // url         : doodstream,
            //               video: {
            //                 server: "",
            //                 url: url,
            //               },
            //             },
            //             body_chat: {
            //               detail: {
            //                 id: useThis.params.id,
            //                 type: 4,
            //                 path: `/youtube/${useThis.params.id}`,
            //               },
            //               body: [
            //                 "Youtube",
            //                 $elements.title.textContent,
            //                 $elements.author.textContent,
            //               ],
            //             },
            //           },
            //         },
            //       })
            //     );
            //   }
            // );
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
                    <a href="#/" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-angle-small-left"
                    )}</a>
                    <h3 id="textTitle">Animes</h3>
                </div>

                <div class="div_x0cH0Hq">
                    <a href="#/search/anime" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-search"
                    )}</a>
                </div>
               
            </header>

            <div class="div_BIchAsC">
                <div id="buttonsFocus" data-gender="Todos" class="div_O73RBqH">
                    <button data-gender="Todos" class="focus">Todos</button>
                    <button data-gender="Favoritos">Favoritos</button>
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

  const intersectionObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          useThis.functions.dataLoad();
        }
      });
    },
    { root: null, rootMargin: "0px", threshold: 0 }
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

        const element = createNodeElement(`
                <a href="#${content.href}" class="div_SQpqup7" data-item>

                    <div class="div_fMC1uk6">
                        <img src="" alt="" data-src="${url}">
                        <span>${content.type ?? ""}</span>
                    </div>
                    <div class="div_9nWIRZE">
                        <p>${content.title}</p>
                    </div>
    
                </a>
            `);

        IntersectionObserverImage.load(element.querySelector("img"), true);
        return element;
      })
    );

    $elements.itemTrue.append(fragment);
    $elements.itemTrueLoad.remove();

    if (Data.length > 23) {
      $elements.itemTrue.append($elements.itemTrueLoad);
      intersectionObserver.observe($elements.itemTrueLoad);
    }
  });

  useThis.functions.dataLoad = () => {
    setTimeout(() => {
      const page =
        Math.floor(
          $elements.itemTrue.querySelectorAll("[data-item]").length / 24
        ) + 1;

      let url = "";

      if ($elements.buttonsFocus.getAttribute("data-gender") == "Favoritos") {
        useThis.reactivity.Data.value = JSON.parse(
          localStorage.getItem("favorite_anime")
        );
        useThis.reactivity.load.value = false;
        return;
      } else if (
        $elements.buttonsFocus.getAttribute("data-gender") != "Todos"
      ) {
        url = `https://www3.animeflv.net/browse?order=default&page=${page}&genre[]=${$elements.buttonsFocus.getAttribute(
          "data-gender"
        )}`;
      } else {
        url = `https://www3.animeflv.net/browse?page=${page}`;
      }
      fetch(useThis.url.fetch(url))
        .then((res) => res.text())
        .then((text) => {
          if (text.trim() == "") {
            useThis.reactivity.Data.value = [];
            useThis.reactivity.load.value = false;
            return;
          }

          const $text = document.createElement("div");
          $text.innerHTML = text;

          // console.log($text.querySelector("div.TbCnAnmFlv ul.List-Animes"));
          // console.log($text.querySelector(".ListAnimes.AX.Rows.A03.C02.D02"));
          // $text.querySelector(".ListAnimes.AX.Rows.A03.C02.D02").children

          const lis = Array.from(
            (
              $text.querySelector("div.TbCnAnmFlv ul.List-Animes") ||
              $text.querySelector(".ListAnimes.AX.Rows.A03.C02.D02")
            ).children
          );

          const array = lis.map((li) => {
            return {
              href: li.querySelector("a").getAttribute("href"),
              title: li.querySelector(".Title").textContent,
              poster: `https://animeflv.net/${li
                .querySelector("img")
                .getAttribute("src")
                .replace("https://animeflv.net/", "")}`,
              type: li.querySelector(".Type").textContent,
            };
          });

          useThis.reactivity.load.value = true;
          useThis.reactivity.Data.value = array;
          useThis.reactivity.load.value = false;

          Array.from($text.querySelectorAll("img")).forEach((img) =>
            img.removeAttribute("src")
          );
        });
    });
  };
  useThis.functions.dataLoad();

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

      button.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  });

  return $element;
};

var animeId = () => {
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
    value: {
      video: null,
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
                    <a href="#/anime" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-angle-small-left"
                    )}</a>
                    <h3 id="textTitle"></h3>
                </div>

                <div class="div_x0cH0Hq">
                    <button id="favorite" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-heart"
                    )}</button>
                </div>

            </header>
 
            <div class="div_guZ6yID div_DtSQApy">
                <div id="itemNull" class="loader-i" style="--color:var(--color-letter)"></div>
                <div id="itemFalse" class="div_b14S3dH">
                    ${useApp.icon.get("fi fi-rr-search-alt")}
                    <h3>La pelicula no existe</h3>
                </div>

                <div id="itemTrue" class="div_4MNvoOW">

                    <div class="div_rCXoNm8">
                        <div class="div_y6ODhoe">
                            <picture class="picture_BLSEWfU"><img id="poster" src=""></picture>
                            <div class="div_K2RbOsL">
                                <h2 id="title"></h2>
                                <p id="overview"></p>
                                <div class="div_aSwP0zW">
                                    <span id="genres"></span>
                                    <span id="duration"></span>
                                    <span id="date"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="div_692wB8">
                        <div class="div_WslendP" >
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
      const episode_length = data.episodes.length;
      // $elements.backdrop.src  = useApp.url.img( data.poster )
      $elements.poster.src = useApp.url.img(data.poster);
      $elements.title.textContent = data.title;
      $elements.overview.textContent = data.description;

      $elements.genres.textContent = data.genres
        .map((genre) => genre)
        .join(", ");
      $elements.duration.textContent = `${episode_length} episodios`;
      $elements.date.textContent = data.progress;

      useThis.reactivity.isFavorite.value = JSON.parse(
        localStorage.getItem("favorite_anime")
      ).some((video) => video.id == data.id);
      $elements.itemTrue.append(document.createTextNode(""));

      $elements.episodes_range.innerHTML = Array(
        Math.floor(episode_length / 50) + 1
      )
        .fill(null)
        .map((_, index, array) => {
          const end =
            array[index + 1] !== undefined ? index * 50 + 50 : episode_length;
          const start = index * 50 + 1;
          return `<button data-season="${index}" class="${
            index == 0 ? "focus" : ""
          }"><span>${start} - ${end || 50}</span>
                </button>`;
        })
        .join("");

      useThis.reactivity.episodes.value = data.episodes
        .reverse()
        .slice(0, 50)
        .reverse();

      getDominantColor($elements.poster).then((result) => {
        const color = darkenHexColor(result, 50);

        $element.style.background = color;
        $elements.episodes_range.parentElement.style.background = color;
        $elements.itemTrueOptionVideos.parentElement.style.background =
          darkenHexColor(result, 60);
        useApp.elements.meta.color.setAttribute("content", color);
      });
    }
  });

  useThis.reactivity.episodes.observe((episodes) => {
    const array =
      localStorage.getItem("episodes_direction") == 0
        ? episodes.reverse()
        : episodes;

    $elements.episodes.innerHTML = array
      .map((episode) => {
        return `
                <button class="button_fk0VHgU" data-item data-slug="${useThis.params.id}-${episode[0]}" data-title="${useThis.params.id}" data-description="episodio ${episode[0]}">${episode[0]}</button> 
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
        if (res.status) mediaPlayer.open({ url: res.url, Hls: window.Hls });
        else alert("Video no disponible");
      });
      // MediaWeb.streamwish({ url : url }).then( res => {
      //     if(res.body.status) mediaPlayer.open({ url : res.body.url, Hls : window.Hls });
      //     else alert('Video no disponible')
      // })
    } else if (["doodstream"].includes(host)) {
      MediaWeb.doodstream({ url: url }).then((res) => {
        if (res.body.status) mediaPlayer.open({ url: res.body.url });
        else alert("Video no disponible");
      });
    } else if (["yourupload"].includes(host)) {
      MediaWeb.yourupload({ url: url }).then((res) => {
        if (res.body.status) mediaPlayer.open({ url: res.body.url });
        else alert("Video no disponible");
      });
    }
  };

  useThis.functions.dataLoad = () => {
    fetch(
      useThis.url.fetch(`https://www3.animeflv.net/anime/${useThis.params.id}`)
    )
      .then((res) => res.text())
      .then((text) => {
        const $text = document.createElement("div");
        $text.innerHTML = text;

        console.log($text.outerHTML);

        Array.from($text.querySelectorAll("script")).forEach((script) => {
          if (script.innerHTML.includes("var anime_info =")) {
            const stringVal = script.innerHTML
              .slice(0, script.innerHTML.indexOf("$"))
              .split("var")
              .map((a) => (a.trim() ? `a.${a.trim()}` : ""))
              .join("");

            const objectVal = new Function(
              ["const a = {}", stringVal, "return a"].join(";")
            )();

            useThis.reactivity.data.value = {
              id: objectVal.anime_info[0],
              title: $text.querySelector("h1.Title").textContent,
              description: $text.querySelector(".Description p").textContent,
              poster: `https://www3.animeflv.net${$text
                .querySelector(`figure img`)
                .getAttribute("src")}`,
              href: `/anime/${objectVal.anime_info[2]}`,
              type: $text.querySelector(".Type").textContent,
              genres: Array.from($text.querySelectorAll(".Nvgnrs a")).map(
                (a) => a.textContent
              ),
              progress: $text.querySelector(".fa-tv").textContent,
              episodes: objectVal.episodes,
            };

            useThis.reactivity.load.value = false;
          }
        });

        Array.from($text.querySelectorAll("img")).forEach((img) =>
          img.removeAttribute("src")
        );
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
        // $elements.season.setAttribute('data-season', button.getAttribute('data-season'))

        const index = parseInt(button.getAttribute("data-season"));
        const start = index * 50;
        const end = start + 50;

        useThis.reactivity.episodes.value =
          useThis.reactivity.data.value.episodes.slice(start, end).reverse();

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

    if (item) {
      const slug = item.getAttribute("data-slug");

      $elements.itemTrueOption.showPopover();
      $elements.itemTrueOptionVideos.innerHTML =
        '<div class="loader-i m-auto g-col-full" style="--color:var(--color-letter); padding: 20px 0"></div>';

      useApp.mediaPlayer.settings({
        title: item.getAttribute("data-title").split("-").join(" "),
        description: item.getAttribute("data-description"),
        controls: {
          includesYes: ["*"],
          includesNot: ["lock", "chromecast", "download"],
        },
      });
      fetch(useApp.url.fetch(`https://www3.animeflv.net/ver/${slug}`))
        .then((res) => res.text())
        .then((text) => {
          const $text = document.createElement("div");
          $text.innerHTML = text;

          Array.from($text.querySelectorAll("script")).forEach((script) => {
            const scriptInnerHTML = script.innerHTML;

            if (scriptInnerHTML.includes("var anime_id")) {
              const string1 = scriptInnerHTML.slice(
                0,
                scriptInnerHTML.indexOf("$(document)")
              );
              const string2 = [
                "const data = {}",
                string1.split("var").join("data . "),
                "return data",
              ].join(";");

              const scriptFunction = new Function(string2);
              const scriptReturn = scriptFunction();

              $elements.itemTrueOptionVideos.innerHTML = Object.entries(
                scriptReturn.videos
              )
                .map((data) => {
                  console.log(data);
                  let show = true;

                  return data[1]
                    .map((video, index) => {
                      if (index == 0) return "";
                      if (!["yu", "sw"].includes(video.server)) return "";

                      const visibility = show ? "" : "display:none";
                      show = false;

                      return `
                                        <span class="span_eNUkEzu" style="${visibility}">${data[0]
                        .slice(0, 3)
                        .toUpperCase()}</span>
                                        <button class="button_NuUj5A6" data-type="" data-url="${
                                          video.code
                                        }" data-quality="">
                                            
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
            }
          });

          Array.from($text.querySelectorAll("img")).forEach((img) =>
            img.removeAttribute("src")
          );
        });
    }
  });

  $elements.favorite.addEventListener("click", () => {
    const favorite = JSON.parse(localStorage.getItem("favorite_anime"));
    const index = favorite.findIndex(
      (video) => video.id == useThis.reactivity.data.value.id
    );

    if (index == -1) favorite.push(useThis.reactivity.data.value);
    else favorite.splice(index, 1);

    useThis.reactivity.isFavorite.value = index == -1;
    localStorage.setItem("favorite_anime", JSON.stringify(favorite));
  });

  $elements.itemTrueOptionVideos.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (button) {
      $elements.itemTrueOption.hidePopover();
      useThis.functions.setLinkServer(button.getAttribute("data-url"));
      useApp.mediaPlayer.element().requestFullscreen();
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
                    <a href="#/search/pelicula" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-search"
                    )}</a>
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

                    <a href="#/favoritos" class="a_lW7dgpk">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-heart"><path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"></path></svg>
                        <span>Favorito</span>
                        ${useApp.icon.get("fi fi-rr-angle-small-right")}
                    </a>
                    
                    <a href="#/coleccion" class="a_lW7dgpk" style="display:none">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-album-collection"><path d="M19,24H5c-2.76,0-5-2.24-5-5v-6c0-2.76,2.24-5,5-5h14c2.76,0,5,2.24,5,5v6c0,2.76-2.24,5-5,5ZM5,10c-1.65,0-3,1.35-3,3v6c0,1.65,1.35,3,3,3h14c1.65,0,3-1.35,3-3v-6c0-1.65-1.35-3-3-3H5Zm18.66-2.9c.41-.37,.45-1,.09-1.41-.95-1.08-2.32-1.69-3.75-1.69H4c-1.43,0-2.8,.62-3.75,1.69-.37,.41-.33,1.05,.09,1.41,.41,.36,1.05,.33,1.41-.09,.57-.65,1.39-1.02,2.25-1.02H20c.86,0,1.68,.37,2.25,1.02,.2,.22,.47,.34,.75,.34,.23,0,.47-.08,.66-.25Zm0-4c.41-.37,.45-1,.09-1.41-.95-1.08-2.32-1.69-3.75-1.69H4C2.57,0,1.2,.62,.25,1.69c-.37,.41-.33,1.05,.09,1.41,.41,.36,1.05,.33,1.41-.09,.57-.65,1.39-1.02,2.25-1.02H20c.86,0,1.68,.37,2.25,1.02,.2,.22,.47,.34,.75,.34,.23,0,.47-.08,.66-.25ZM12,20c-3.98,0-8-1.37-8-4s4.02-4,8-4,8,1.37,8,4-4.02,4-8,4Zm0-6c-3.72,0-6,1.29-6,2s2.28,2,6,2,6-1.29,6-2-2.28-2-6-2Zm0,3c.83,0,1.5-.45,1.5-1s-.67-1-1.5-1-1.5,.45-1.5,1,.67,1,1.5,1Z"></path></svg>
                        <span>Coleccion</span>
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
        
                <a class="a_t8K3Qpd" href="#/${
                  useThis.params.type
                }"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-angle-left"><path d="M17.17,24a1,1,0,0,1-.71-.29L8.29,15.54a5,5,0,0,1,0-7.08L16.46.29a1,1,0,1,1,1.42,1.42L9.71,9.88a3,3,0,0,0,0,4.24l8.17,8.17a1,1,0,0,1,0,1.42A1,1,0,0,1,17.17,24Z"></path></svg></a>
                <form id="form" class="form_r7mvBNn" autocomplete="off" >
                    <input type="search" name="search" value="${EncodeTemplateString.toInput(
                      decodeURIComponent(useApp.routes.params("result") || "")
                    )}" placeholder="buscar">
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
      return `
                <div class="div_ywmleK1" data-item>
                    <button class="button_YqF7ZuC" data-id="${
                      data.id
                    }"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-cross-small"><path d="M18,6h0a1,1,0,0,0-1.414,0L12,10.586,7.414,6A1,1,0,0,0,6,6H6A1,1,0,0,0,6,7.414L10.586,12,6,16.586A1,1,0,0,0,6,18H6a1,1,0,0,0,1.414,0L12,13.414,16.586,18A1,1,0,0,0,18,18h0a1,1,0,0,0,0-1.414L13.414,12,18,7.414A1,1,0,0,0,18,6Z"></path></svg></button>
                    <a class="a_UrjAwYX" href="#/search/${
                      data.type
                    }/${encodeURIComponent(data.search)}/result">
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

  console.log(EncodeTemplateString.toInput());

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
    function: {
      dataLoad: () => {},
    },
  };

  const $element = createNodeElement(`

    <div class="div_Xu02Xjh">

            <header class="header_K0hs3I0">
 
                <div class="div_uNg74XS div_McPrYGP">
                    <a href="#/search/${useThis.params.type}/${
    useThis.params.result
  }" class="button_lvV6qZu">${useApp.icon.get("fi fi-rr-angle-small-left")}</a>
                    <div class="div_sZZicpN">
                        <h3 id="h3Title">${decodeURIComponent(
                          useThis.params.result
                        )}</h3>
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
                      youtube: "YT Videos",
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
                    <a href="#${data.href}" class="div_SQpqup7" data-item>
    
                        <div class="div_fMC1uk6">
                            <img src="" alt="" data-src="${url}">
                            <span>${data.type ?? ""}</span>
                        </div>
                        <div class="div_9nWIRZE">
                            <p>${data.title}</p>
                        </div>
        
                    </a>
                `);

        IntersectionObserverImage.load(element.querySelector("img"), true);
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
                    <a href="#/${slug.split("/")[0]}/${
          data.TMDbId
        }" class="div_SQpqup7" data-item>

                        <div class="div_fMC1uk6">
                            <img src="" alt="" data-src="${url}">
                            <span>${slug.split("/")[0]}</span>
                        </div>
                        <div class="div_9nWIRZE">
                            <p>${data.titles.name}</p>
                        </div>
        
                    </a>    
                `);

        IntersectionObserverImage.load(element.querySelector("img"), false);

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
    fetch(
      useApp.url.fetch(
        `https://www3.animeflv.net/browse?q=${useThis.params.result}`
      )
    )
      .then((res) => res.text())
      .then((page) => {
        const elementPage = document.createElement("div");
        elementPage.innerHTML = page;

        const lis = Array.from(
          elementPage.querySelector(".ListAnimes.AX.Rows.A03.C02.D02").children
        );

        useThis.reactivity.load.value = true;
        useThis.reactivity.Data.value = lis.map((li) => {
          return {
            href: li.querySelector("a").getAttribute("href"),
            title: li.querySelector(".Title").textContent,
            poster: li.querySelector("img").src,
            type: li.querySelector(".Type").textContent,
          };
        });
        useThis.reactivity.load.value = false;

        Array.from(elementPage.querySelectorAll("img")).forEach((img) =>
          img.removeAttribute("src")
        );
      });
  };

  useThis.function.dataLoadPeliculaSerie = () => {
    fetch(
      useApp.url.fetch(`https://cuevana.biz/search?q=${useThis.params.result}`)
    )
      .then((res) => res.text())
      .then((text) => {
        const $text = document.createElement("div");
        $text.innerHTML = text;

        Array.from($text.querySelectorAll("img")).forEach((img) => {
          img.removeAttribute("src");
          img.removeAttribute("srcset");
        });

        const datas = JSON.parse(
          $text.querySelector("#__NEXT_DATA__").textContent
        );

        useThis.reactivity.load.value = true;
        useThis.reactivity.Data.value = datas.props.pageProps.movies;
        useThis.reactivity.load.value = false;
      });
  };

  useThis.function.dataLoadYoutube = () => {
    fetch(
      useApp.url.fetch(
        `https://www.youtube.com/results?search_query=${useThis.params.result}`
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
                  .sectionListRenderer.contents[0].itemSectionRenderer.contents;

              useThis.reactivity.load.value = true;
              useThis.reactivity.Data.value = contents
                .filter((content) => content.videoRenderer)
                .map((content) => content.videoRenderer);
              useThis.reactivity.load.value = false;
            }
          }
        );
      });
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
    function: {
      dataLoad: () => {},
    },
  };

  const $element = createNodeElement(`

        <div class="div_Xu02Xjh">

            <header class="header_K0hs3I0">
 
                <div class="div_uNg74XS div_McPrYGP">
                    <a href="#/" class="button_lvV6qZu">${useApp.icon.get(
                      "fi fi-rr-angle-small-left"
                    )}</a>
                    <div class="div_sZZicpN">  
                        <h3>Favoritos</h3>
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
                      youtube: "YT Videos",
                    })
                      .map((entries, index) => {
                        return `<button data-gender="${entries[0]}" class="${
                          index == 0 ? "focus" : ""
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
  new RenderObjectElement($elements);

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

  useThis.function.dataRenderAnime = (Data) => {
    const fragment = document.createDocumentFragment();
    fragment.append(document.createTextNode(""));
    fragment.append(
      ...Data.map((data) => {
        const url = useApp.url.img(data.poster);

        const element = createNodeElement(`
                    <a href="#${data.href}" class="div_SQpqup7" data-item>
    
                        <div class="div_fMC1uk6">
                            <img src="" alt="" data-src="${url}">
                            <span>${data.type ?? ""}</span>
                        </div>
                        <div class="div_9nWIRZE">
                            <p>${data.title}</p>
                        </div>
        
                    </a>
                `);

        IntersectionObserverImage.load(element.querySelector("img"), true);
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
                    <a href="#/${slug.split("/")[0]}/${
          data.TMDbId
        }" class="div_SQpqup7" data-item>

                        <div class="div_fMC1uk6">
                            <img src="" alt="" data-src="${url}">
                            <span>${slug.split("/")[0]}</span>
                        </div>
                        <div class="div_9nWIRZE">
                            
                            <p>${data.titles.name}</p>
                        </div>
        
                    </a>    
                `);

        IntersectionObserverImage.load(element.querySelector("img"), false);

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
    useThis.reactivity.load.value = true;
    useThis.reactivity.Data.value = JSON.parse(
      localStorage.getItem("favorite_anime")
    );
    useThis.reactivity.load.value = false;
  };

  useThis.function.dataLoadPeliculaSerie = (type) => {
    useThis.reactivity.load.value = true;
    useThis.reactivity.Data.value = JSON.parse(
      localStorage.getItem(
        type == "pelicula" ? "favorite_pelicula" : "favorite_serie"
      )
    );
    useThis.reactivity.load.value = false;
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

  useThis.function.dataLoad();
  return $element;
};

var routes = () => {
  const useApp = window.dataApp;

  useApp.routes.set([
    { hash: "/", callback: inicio },
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
    { hash: "/favoritos", callback: favoritos },
  ]);

  addEventListener("hashchange", () => {
    IntersectionObserverImage.clear();
    useApp.elements.meta.color.setAttribute(
      "content",
      localStorage.getItem("theme") == "light" ? "#F7F7F7" : "#000000"
    );

    $element.innerHTML = "";
    if (navigator.onLine) $element.append(useApp.routes.get() || "");
    else $element.append(offline());
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

var footerVideoPlayer = () => {
  const useApp = window.dataApp;
  const useThis = {
    elements: {
      video: useApp.mediaPlayer.element("video"),
    },
    classes: {
      divPreview: null,
    },
    values: {
      pinch: {
        start: false,
        escala: 1,
        ultimaDistancia: 0,
      },
    },
  };
  //display:none
  const $element = createNodeElement(`
        <footer class="footer_rTzBt2c">
            <div id="divPreview" class="div_wPiZgS6" style="display:none;">
                <div id="divPreviewContent" class="d-grid">
                  <canvas id="canvasVideo"></canvas>
                  <div class="div_OZ6oAgh"><span id="spanBar"></span></div>
                  <div class="div_lq8dhAa">
                      <button id="buttonPlayPause"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-play"><path d="M20.494,7.968l-9.54-7A5,5,0,0,0,3,5V19a5,5,0,0,0,7.957,4.031l9.54-7a5,5,0,0,0,0-8.064Zm-1.184,6.45-9.54,7A3,3,0,0,1,5,19V5A2.948,2.948,0,0,1,6.641,2.328,3.018,3.018,0,0,1,8.006,2a2.97,2.97,0,0,1,1.764.589l9.54,7a3,3,0,0,1,0,4.836Z"></path></svg></button>
                      <button id="buttonPIP"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-svg-name="fi fi-rr-resize"><path d="m19 0h-8a5.006 5.006 0 0 0 -5 5v6h-1a5.006 5.006 0 0 0 -5 5v3a5.006 5.006 0 0 0 5 5h3a5.006 5.006 0 0 0 5-5v-1h6a5.006 5.006 0 0 0 5-5v-8a5.006 5.006 0 0 0 -5-5zm-8 16a3 3 0 0 1 -3-3 3 3 0 0 1 3 3zm0 3a3 3 0 0 1 -3 3h-3a3 3 0 0 1 -3-3v-3a3 3 0 0 1 3-3h1a5.006 5.006 0 0 0 5 5zm11-6a3 3 0 0 1 -3 3h-6a4.969 4.969 0 0 0 -.833-2.753l5.833-5.833v2.586a1 1 0 0 0 2 0v-3a3 3 0 0 0 -3-3h-3a1 1 0 0 0 0 2h2.586l-5.833 5.833a4.969 4.969 0 0 0 -2.753-.833v-6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3z"></path></svg></button>
                      <button id="buttonCloseVideo"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" data-svg-name="fi fi-rr-cross"><path d="M23.707.293h0a1,1,0,0,0-1.414,0L12,10.586,1.707.293a1,1,0,0,0-1.414,0h0a1,1,0,0,0,0,1.414L10.586,12,.293,22.293a1,1,0,0,0,0,1.414h0a1,1,0,0,0,1.414,0L12,13.414,22.293,23.707a1,1,0,0,0,1.414,0h0a1,1,0,0,0,0-1.414L13.414,12,23.707,1.707A1,1,0,0,0,23.707.293Z"></path></svg></button>
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
    useApp.mediaPlayer.close();
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
  });

  useThis.elements.video.addEventListener("enterpictureinpicture", () => {
    $elements.divPreview.style.display = "none";
  });

  useThis.elements.video.addEventListener("leavepictureinpicture", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    $elements.divPreview.style.display = "";
  });

  $elements.elementVideo.append(useApp.mediaPlayer.element());

  useThis.classes.divPreview = new ElementMakeDrag($elements.divPreview);

  useThis.classes.divPreview.on("move", (data) => {
    const top = data.target.offsetHeight / 2;
    const left = data.target.offsetWidth / 2;

    const x = Math.max(
      top * -1,
      Math.min(
        data.xy.current.y,
        window.innerHeight - data.target.offsetHeight + top
      )
    );

    const y = Math.max(
      left * -1,
      Math.min(
        data.xy.current.x,
        window.innerWidth - data.target.offsetWidth + left
      )
    );

    data.target.style.top = `${x}px`;
    data.target.style.left = `${y}px`;

    data.target.style.right = "initial";
    data.target.style.bottom = "initial";

    $elements.divPreviewContent.style.pointerEvents = "none";
  });

  useThis.classes.divPreview.on("end", () => {
    $elements.divPreviewContent.style.pointerEvents = "";
  });

  useThis.classes.divPreview.start();

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

  window.dataApp = config();
  theme();

  findElementWithRetry("request-disable-cors").then((requestDisableCors) => {
    window.dataApp.elements.custom.requestDisableCors = requestDisableCors;
  });

  document.getElementById("app").append(routes(), footerVideoPlayer());

  dispatchEvent(new CustomEvent("hashchange"));
  dispatchEvent(new CustomEvent("_theme"));
});
