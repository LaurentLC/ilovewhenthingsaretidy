'use strict';

const translations = {
  en: {
    pageTitle: 'I love when things are tidy',
    intro: 'I love words and sentences; they are great, but when letters sit in any old order it just looks messy. I like things SUPER TIDY. Hence this little helper that lines everything up (or flips it, or, because I also enjoy surprises, shuffles it however you fancy). For a quick example, <a id=\"introDemoLink\" class=\"intro-link\" href=\"#\">click here</a>.',
    placeholder: 'Type or paste your text here...',
    sortOptions: {
      asc: 'Alphabetical order',
      desc: 'Reverse alphabetical order',
      random: 'Random'
    },
    buttons: {
      sort: 'TIDY THIS UP!',
      copy: 'Copy result',
      clear: 'Clear input'
    },
    messages: {
      nothingToCopy: 'Nothing to copy',
      copySuccess: 'Result copied to clipboard',
      copyFailure: 'Copy failed in this browser, please try another one'
    },
    defaultText: 'One is not born a woman: one becomes one. No biological, psychological, or economic fate defines the figure that the human female presents within society; it is civilization as a whole that elaborates this intermediate product between the male and the castrate that is described as feminine. Only the mediation of others can constitute an individual as an Other.',
    languageLabel: 'Language preference'
  },
  fr: {
    pageTitle: 'J\'aime quand les choses sont bien rang\u00E9es',
    intro: 'J\'aime les mots, les phrases, c\'est super, mais quand m\u00EAme, toutes ces lettres dans n\'importe quel ordre, l\u00E0, \u00E7a fait pas propre. J\'aime quand les choses sont BIEN RANG\u00C9ES. D\'o\u00F9 ce petit utilitaire, qui va vous remettre tout \u00E7a bien d\'\u00E9querre (ou en \u00E9querre invers\u00E9e, ou, allez, parce que j\'aime bien aussi l\'impr\u00E9vu, dans n\'importe quel ordre aussi si \u00E7a vous chante). Pour un exemple, <a id=\"introDemoLink\" class=\"intro-link\" href=\"#\">cliquez ici</a>.',
    placeholder: 'Saisissez ou collez votre texte ici...',
    sortOptions: {
      asc: 'Ordre alphab\u00E9tique',
      desc: 'Ordre alphab\u00E9tique invers\u00E9',
      random: 'Al\u00E9atoire'
    },
    buttons: {
      sort: 'RANGE-MOI \u00C7A !',
      copy: 'Copier le r\u00E9sultat',
      clear: 'Effacer le champ'
    },
    messages: {
      nothingToCopy: 'Rien \u00E0 copier',
      copySuccess: 'R\u00E9sultat copi\u00E9 dans le presse-papiers',
      copyFailure: 'Copie impossible avec ce navigateur, essayez-en un autre'
    },
    defaultText: 'On ne na\u00EEt pas femme : on le devient. Aucun destin biologique, psychique, \u00E9conomique ne d\u00E9finit la figure que rev\u00EAt au sein de la soci\u00E9t\u00E9 la femelle humaine ; c\u2019est l\u2019ensemble de la civilisation qui \u00E9labore ce produit interm\u00E9diaire entre le m\u00E2le et le castrat qu\u2019on qualifie de f\u00E9minin. Seule la m\u00E9diation d\u2019autrui peut constituer un individu comme un Autre.',
    languageLabel: 'Choisir la langue'
  }
};

let currentLang = 'fr';
let languageSelect;

document.addEventListener('DOMContentLoaded', () => {
  languageSelect = document.getElementById('languageSelect');
  currentLang = getInitialLanguage();

  applyTranslations();

  languageSelect.addEventListener('change', event => {
    setLanguage(event.target.value);
  });

  document.getElementById('sortBtn').addEventListener('click', updateOutput);
  document.getElementById('clearBtn').addEventListener('click', clearInput);
  document.getElementById('copyBtn').addEventListener('click', copyOutput);
});

function getInitialLanguage() {
  if (!window.location.search) {
    return 'fr';
  }

  const params = new URLSearchParams(window.location.search);
  const explicitLang = params.get('lang') || params.get('LANG');

  if (explicitLang) {
    const normalized = explicitLang.toLowerCase();
    if (normalized === 'fr') {
      return 'fr';
    }
    if (normalized === 'en') {
      return 'en';
    }
  }

  for (const key of params.keys()) {
    const upperKey = key.toUpperCase();
    if (upperKey === 'FR') {
      return 'fr';
    }
    if (upperKey === 'EN') {
      return 'en';
    }
  }

  return 'fr';
}

function applyTranslations() {
  const t = translations[currentLang];
  const inputElement = document.getElementById('input');

  document.title = t.pageTitle;
  document.documentElement.lang = currentLang;
  document.getElementById('introText').innerHTML = t.intro;
  document.getElementById('title').textContent = t.pageTitle;
  inputElement.placeholder = t.placeholder;
  document.getElementById('labelAsc').textContent = t.sortOptions.asc;
  document.getElementById('labelDesc').textContent = t.sortOptions.desc;
  document.getElementById('labelRandom').textContent = t.sortOptions.random;
  document.getElementById('sortBtn').textContent = t.buttons.sort;
  document.getElementById('copyBtn').textContent = t.buttons.copy;
  document.getElementById('clearBtn').setAttribute('aria-label', t.buttons.clear);
  languageSelect.setAttribute('aria-label', t.languageLabel);
  languageSelect.value = currentLang;
  document.getElementById('status').textContent = '';

  setupIntroLink();
}

function updateUrlForLang(lang) {
  const newQuery = `?${lang.toUpperCase()}`;
  const newUrl = `${window.location.pathname}${newQuery}${window.location.hash}`;
  window.history.replaceState(null, '', newUrl);
}

function setLanguage(lang) {
  if (!translations[lang]) {
    return;
  }

  currentLang = lang;
  applyTranslations();
  updateUrlForLang(lang);
}

function isLetter(char) {
  return /\p{L}/u.test(char);
}

function isUppercase(char) {
  return char === char.toLocaleUpperCase(currentLang) &&
         char !== char.toLocaleLowerCase(currentLang);
}

function shuffleArray(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function tidyWord(token, sortOrder) {
  const chars = Array.from(token);
  const letterPositions = [];
  const letters = [];
  const uppercasePositionsInLetters = [];

  chars.forEach((char, index) => {
    if (isLetter(char)) {
      letterPositions.push(index);
      letters.push(char.toLocaleLowerCase(currentLang));

      if (isUppercase(char)) {
        uppercasePositionsInLetters.push(letters.length - 1);
      }
    }
  });

  if (letters.length === 0) {
    return token;
  }

  let transformedLetters;

  if (sortOrder === 'random') {
    transformedLetters = shuffleArray(letters);
  } else {
    transformedLetters = [...letters].sort((a, b) =>
      a.localeCompare(b, currentLang, { sensitivity: 'base' })
    );

    if (sortOrder === 'desc') {
      transformedLetters.reverse();
    }
  }

  uppercasePositionsInLetters.forEach(pos => {
    if (transformedLetters[pos]) {
      transformedLetters[pos] = transformedLetters[pos].toLocaleUpperCase(currentLang);
    }
  });

  const result = [...chars];
  let letterIndex = 0;

  letterPositions.forEach(originalCharIndex => {
    result[originalCharIndex] = transformedLetters[letterIndex];
    letterIndex++;
  });

  return result.join('');
}

function tidyDigits(token, sortOrder) {
  const digits = token.split('');
  let transformedDigits;

  if (sortOrder === 'random') {
    transformedDigits = shuffleArray(digits);
  } else {
    transformedDigits = [...digits].sort((a, b) => a.localeCompare(b));

    if (sortOrder === 'desc') {
      transformedDigits.reverse();
    }
  }

  return transformedDigits.join('');
}

function tidyText(text, sortOrder) {
  return text.replace(/\p{L}+|\d+/gu, match =>
    /^\d+$/.test(match) ? tidyDigits(match, sortOrder) : tidyWord(match, sortOrder)
  );
}

function getSelectedSortOrder() {
  const checked = document.querySelector('input[name="sortOrder"]:checked');

  if (checked) {
    return checked.value;
  }

  const fallbackRadio = document.querySelector('input[name="sortOrder"]');

  if (fallbackRadio) {
    fallbackRadio.checked = true;
    return fallbackRadio.value;
  }

  return 'asc';
}

function updateOutput() {
  const inputElement = document.getElementById('input');
  let input = inputElement.value;

  if (!input.trim()) {
    const fallbackText = translations[currentLang].defaultText;
    input = fallbackText;
    inputElement.value = fallbackText;
  }

  const sortOrder = getSelectedSortOrder();
  const output = tidyText(input, sortOrder);

  document.getElementById('output').textContent = output;
  document.getElementById('status').textContent = '';
}

function clearInput() {
  const inputElement = document.getElementById('input');
  inputElement.value = '';
  document.getElementById('output').textContent = '';
  document.getElementById('status').textContent = '';
  inputElement.focus();
}

async function copyOutput() {
  const output = document.getElementById('output').textContent;
  const status = document.getElementById('status');
  const messages = translations[currentLang].messages;

  if (!output.trim()) {
    status.textContent = messages.nothingToCopy;
    return;
  }

  try {
    await navigator.clipboard.writeText(output);
    status.textContent = messages.copySuccess;
  } catch (err) {
    status.textContent = messages.copyFailure;
  }
}

function setupIntroLink() {
  const introLink = document.getElementById('introDemoLink');

  if (!introLink) {
    return;
  }

  introLink.addEventListener('click', handleIntroLinkClick);
}

function handleIntroLinkClick(event) {
  event.preventDefault();

  const inputElement = document.getElementById('input');

  if (!inputElement) {
    return;
  }

  inputElement.value = '';
  const fallbackText = translations[currentLang].defaultText;
  inputElement.value = fallbackText;
  updateOutput();
}
