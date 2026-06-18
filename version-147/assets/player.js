(function () {
  function startPlayer(streamUrl) {
    var video = document.getElementById('movie-video');
    var button = document.querySelector('[data-play-button]');
    var shell = document.querySelector('.player-shell');
    var loaded = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function hideButton() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function loadStream() {
      hideButton();
      if (loaded) {
        playVideo();
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        return;
      }
      video.src = streamUrl;
      playVideo();
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        loadStream();
      });
    }

    if (shell) {
      shell.addEventListener('click', function (event) {
        if (event.target === video && loaded) {
          return;
        }
        loadStream();
      });
    }

    video.addEventListener('play', hideButton);
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.StaticMoviePlayer = {
    init: startPlayer
  };
})();
