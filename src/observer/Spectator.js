// Observer concret : affiche le classement reçu dans `.classement-list` du dashboard.
// chaque entrée : { position, id, pseudo, numero, image, ecurieNom, stateNom }

export class Spectator {
  constructor(nom) {
    this.nom = nom;
  }

  update(classement) {
    const liste = document.querySelector('.classement-list');
    if (!liste) return;

    liste.replaceChildren(...classement.map((entree) => this.#creerLigne(entree)));
  }

  #creerLigne(entree) {
    const li = document.createElement('li');
    li.className = 'classement-row';
    li.dataset.piloteId = entree.id;

    const pos = document.createElement('span');
    pos.className = 'classement-row__pos';
    pos.textContent = String(entree.position);

    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    const img = document.createElement('img');
    img.src = entree.image ?? '';
    img.alt = '';
    img.loading = 'lazy';
    avatar.appendChild(img);

    const numero = document.createElement('span');
    numero.className = 'classement-row__numero';
    numero.textContent = `#${entree.numero}`;

    const pseudo = document.createElement('span');
    pseudo.className = 'classement-row__pseudo';
    pseudo.append(entree.pseudo, numero);

    const badge = document.createElement('span');
    badge.className = `state-badge ${this.#classeBadge(entree.stateNom)}`;
    badge.textContent = entree.stateNom;

    const meta = document.createElement('span');
    meta.className = 'classement-row__meta';
    meta.append(`${entree.ecurieNom} `, badge);

    const identity = document.createElement('span');
    identity.className = 'classement-row__identity';
    identity.append(pseudo, meta);

    const gap = document.createElement('span');
    gap.className = 'classement-row__gap';
    gap.textContent = entree.position === 1 ? 'Leader' : '';

    li.append(pos, avatar, identity, gap);
    return li;
  }

  #classeBadge(stateNom) {
    const slug = stateNom
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '-');
    return `state-badge--${slug}`;
  }
}
