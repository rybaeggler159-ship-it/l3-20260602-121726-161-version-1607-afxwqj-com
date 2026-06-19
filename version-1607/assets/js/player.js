function initMoviePlayer(videoId, coverId, buttonId, sourceUrl) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var button = document.getElementById(buttonId);
  var started = false;
  var hlsInstance = null;

  function attach() {
    if (started || !video) {
      return;
    }
    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }

    if (cover) {
      cover.classList.add('hidden');
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', attach);
  }
  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      attach();
    });
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        attach();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
