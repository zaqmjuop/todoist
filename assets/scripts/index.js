import main from './components/main';

const href = window.location.href.match(/^[^#]+/)[0];

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#logo').onclick = () => window.location.assign(href);
});

main();
