// Petits helpers DOM partagés par les rendus du dashboard.

// el('p', { className: 'x', text: 'Bonjour', dataset: { id: 'sch' }, attrs: { 'aria-hidden': 'true' } }, ...enfants)
export function el(tag, props = {}, ...enfants) {
  const element = document.createElement(tag);
  const { className, text, dataset = {}, attrs = {}, style = {} } = props;

  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = String(text);
  Object.entries(dataset).forEach(([cle, valeur]) => { element.dataset[cle] = valeur; });
  Object.entries(attrs).forEach(([cle, valeur]) => {
    if (valeur === false || valeur === null || valeur === undefined) return;
    element.setAttribute(cle, valeur === true ? '' : String(valeur));
  });
  Object.entries(style).forEach(([cle, valeur]) => element.style.setProperty(cle, valeur));

  element.append(...enfants.flat().filter((enfant) => enfant !== null && enfant !== undefined && enfant !== false));
  return element;
}

// "Perte Attention" -> "perte-attention", "Épuisé" -> "epuise"
export function classeEtat(stateNom) {
  return stateNom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');
}

export function badgeEtat(stateNom, className = '') {
  return el('span', {
    className: `state-badge state-badge--${classeEtat(stateNom)} ${className}`.trim(),
    text: stateNom,
  });
}

// 4.2 -> "4.2", 7 -> "7"
export function formaterStat(valeur) {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(1);
}
