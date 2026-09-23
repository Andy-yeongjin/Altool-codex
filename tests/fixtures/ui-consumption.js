// Isolated UI regression fixture; no network, storage or business side effects.
document.querySelector('#toggle').addEventListener('click', event => {
  const isSelected = event.currentTarget.getAttribute('aria-pressed') !== 'true';
  event.currentTarget.setAttribute('aria-pressed', String(isSelected));
  document.querySelector('#state').textContent = isSelected ? '선택됨' : '미선택';
});
