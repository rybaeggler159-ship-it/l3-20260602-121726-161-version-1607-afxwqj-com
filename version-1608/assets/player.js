(function () {
  function readStream(container) {
    var node = container.querySelector('.stream-url');

    if (!node) {
      return '';
    }

    try {
      return JSON.parse(node.textContent.trim());
    } catch (error) {
      return node.textContent.trim().replace(/^"|"$/g, '');
    }
  }

  function setup(container) {
    var video = container.querySelector('video');
    var button = container.querySelector('.video-overlay');
    var streamUrl = readStream(container);
    var loaded = false;
    var hls = null;

    if (!video || !button || !streamUrl) {
      return;
    }

    function loadStream() {
      return new Promise(function (resolve) {
        if (loaded) {
          resolve();
          return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.load();
          resolve();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            }
          });
          window.setTimeout(resolve, 1300);
          return;
        }

        video.src = streamUrl;
        video.load();
        resolve();
      });
    }

    function begin() {
      container.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      loadStream().then(function () {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            container.classList.remove('is-playing');
          });
        }
      });
    }

    button.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-shell')).forEach(setup);
})();
