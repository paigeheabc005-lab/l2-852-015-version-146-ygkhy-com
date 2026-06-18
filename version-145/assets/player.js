import Hls from './hls-vendor.js';
function initPlayer(root) {
  const video = root.querySelector('video');
  const toggle = root.querySelector('[data-toggle]');
  const src = root.dataset.src;
  const fallback = root.dataset.fallback;
  let hls;
  const setLabel = () => { if (toggle) toggle.textContent = video.paused ? '点击播放' : '点击暂停'; };
  const start = async () => {
    try {
      if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = fallback;
      }
      await video.play();
      setLabel();
    } catch (err) {
      video.src = fallback;
    }
  };
  toggle?.addEventListener('click', async () => { if (video.paused) await start(); else { video.pause(); setLabel(); } });
  video.addEventListener('play', setLabel);
  video.addEventListener('pause', setLabel);
  root.addEventListener('click', (e) => { if (e.target.closest('[data-toggle]')) return; if (video.paused) start(); else video.pause(); });
  setLabel();
}
document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('[data-player]').forEach(initPlayer));
