'use strict';

(function attachTransformHelpers(globalScope) {
  function isLetter(char) {
    return /\p{L}/u.test(char);
  }

  function detectDocumentLanguage() {
    const langAttr = document.documentElement.getAttribute('lang') || '';
    return langAttr.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  }

  function isUppercase(char, lang) {
    return char === char.toLocaleUpperCase(lang) &&
           char !== char.toLocaleLowerCase(lang);
  }

  function shuffleArray(array) {
    const shuffled = [...array];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
  }

  function tidyWord(token, sortOrder, lang) {
    const chars = Array.from(token);
    const letterPositions = [];
    const letters = [];
    const uppercasePositions = [];

    chars.forEach((char, index) => {
      if (!isLetter(char)) {
        return;
      }

      letterPositions.push(index);
      letters.push(char.toLocaleLowerCase(lang));

      if (isUppercase(char, lang)) {
        uppercasePositions.push(letters.length - 1);
      }
    });

    if (letters.length === 0) {
      return token;
    }

    let transformedLetters;

    if (sortOrder === 'random') {
      transformedLetters = shuffleArray(letters);
    } else {
      transformedLetters = [...letters].sort((first, second) =>
        first.localeCompare(second, lang, { sensitivity: 'base' })
      );

      if (sortOrder === 'desc') {
        transformedLetters.reverse();
      }
    }

    uppercasePositions.forEach(position => {
      if (transformedLetters[position]) {
        transformedLetters[position] = transformedLetters[position].toLocaleUpperCase(lang);
      }
    });

    const result = [...chars];
    let letterIndex = 0;

    letterPositions.forEach(originalIndex => {
      result[originalIndex] = transformedLetters[letterIndex];
      letterIndex += 1;
    });

    return result.join('');
  }

  function tidyDigits(token, sortOrder) {
    const digits = token.split('');
    let transformedDigits;

    if (sortOrder === 'random') {
      transformedDigits = shuffleArray(digits);
    } else {
      transformedDigits = [...digits].sort((first, second) => first.localeCompare(second));

      if (sortOrder === 'desc') {
        transformedDigits.reverse();
      }
    }

    return transformedDigits.join('');
  }

  function tidyText(text, sortOrder, lang = detectDocumentLanguage()) {
    return text.replace(/\p{L}+|\d+/gu, match =>
      /^\d+$/.test(match) ? tidyDigits(match, sortOrder) : tidyWord(match, sortOrder, lang)
    );
  }

  globalScope.TidyTransform = {
    detectDocumentLanguage,
    tidyText
  };
})(window);
