# I love when things are tidy

A tiny, playful, slightly poetic web utility that "tidies up" text by rearranging the letters inside words.

The app takes any pasted or typed text and transforms each word locally:

- `asc`: letters are sorted alphabetically
- `desc`: letters are sorted in reverse alphabetical order
- `random`: letters are shuffled

Numbers are treated the same way, but only within number sequences. Punctuation, spaces, line breaks, and the original shape of the text stay in place, so the result still looks like the source text, just reorganized from the inside.

The interface is available in French and English, with a language switcher and URL-based language state (`?FR` / `?EN`, or `?lang=fr` / `?lang=en`).

## What the app does

- Lets the user paste or type text into a textarea
- Reorders letters inside each word, without moving punctuation around
- Reorders digits inside number groups
- Preserves uppercase positions relative to the transformed word
- Supports alphabetical, reverse alphabetical, and random modes
- Can insert a built-in demo text when the input is empty or when the intro link is clicked
- Lets the user copy the generated output to the clipboard
- Lets the user clear the input and result

## How it works

The transformation happens entirely in the browser with plain JavaScript.

`tidyText()` scans the text and targets:

- Unicode letter sequences with `\p{L}+`
- digit sequences with `\d+`

Each matched token is then transformed independently:

- `tidyWord()` extracts only the letters from the token, lowercases them for sorting, remembers which positions were uppercase, sorts or shuffles them, then reinserts them into their original character slots
- `tidyDigits()` applies the same logic to digit-only sequences

This means:

- punctuation is not sorted
- spaces and line breaks are preserved
- accented letters are handled with locale-aware comparison
- language affects case conversion and alphabetical comparison

## Project structure

```text
.
├── index.html      # page structure and UI elements
├── css/
│   └── style.css   # simple layout and component styles
├── js/
│   └── app.js      # translations, UI events, text transformation logic
└── favicon.ico
```

## Files overview

### `index.html`

Contains the full page markup:

- language selector
- short intro text
- textarea
- radio buttons for sort mode
- action buttons for tidy / clear / copy
- output and status areas

### `js/app.js`

Contains:

- bilingual UI strings (`en` / `fr`)
- language detection from the query string
- translation application to the DOM
- URL updates when switching language
- the core text transformation functions
- button and link event handlers
- clipboard copy feedback

### `css/style.css`

Contains a deliberately simple, lightweight presentation:

- centered single-column layout
- basic form styling
- flexible controls row
- readable output block

## Running locally

No build step and no dependencies are required.

You can simply open `index.html` in a browser, or serve the folder with any small local static server if you prefer.

## Notes

- The default UI language is French
- The built-in sample text changes with the selected language
- Clipboard copy depends on browser support for `navigator.clipboard`

---

# J'aime quand les choses sont bien rangées

Petit utilitaire web ludique, un peu drôle et un peu poétique, qui "range" un texte en réorganisant les lettres à l'intérieur des mots.

L'application prend un texte saisi ou collé, puis transforme chaque mot localement :

- `asc` : les lettres sont triées par ordre alphabétique
- `desc` : les lettres sont triées par ordre alphabétique inversé
- `random` : les lettres sont mélangées

Les nombres sont traités de la même manière, mais uniquement à l'intérieur des suites de chiffres. La ponctuation, les espaces, les retours à la ligne et la silhouette générale du texte restent en place : le texte garde donc sa forme, mais son intérieur est réordonné.

L'interface existe en français et en anglais, avec un sélecteur de langue et un état conservé dans l'URL (`?FR` / `?EN`, ou `?lang=fr` / `?lang=en`).

## Ce que fait l'application

- Permet de coller ou saisir un texte dans une zone de saisie
- Réordonne les lettres à l'intérieur de chaque mot sans déplacer la ponctuation
- Réordonne les chiffres à l'intérieur de chaque groupe numérique
- Préserve les positions de majuscules par rapport au mot transformé
- Propose trois modes : alphabétique, alphabétique inversé et aléatoire
- Peut insérer un texte d'exemple intégré si le champ est vide ou si l'on clique sur le lien d'introduction
- Permet de copier le résultat dans le presse-papiers
- Permet d'effacer le texte saisi et le résultat

## Comment ça fonctionne

La transformation est faite entièrement dans le navigateur, en JavaScript natif.

`tidyText()` parcourt le texte et cible :

- les séquences de lettres Unicode avec `\p{L}+`
- les séquences de chiffres avec `\d+`

Chaque segment repéré est ensuite transformé indépendamment :

- `tidyWord()` extrait uniquement les lettres du segment, les passe en minuscules pour le tri, mémorise les positions qui étaient en majuscules, trie ou mélange les lettres, puis les réinjecte dans leurs emplacements d'origine
- `tidyDigits()` applique la même logique aux segments composés uniquement de chiffres

Concrètement :

- la ponctuation n'est pas triée
- les espaces et retours à la ligne sont conservés
- les lettres accentuées sont comparées avec un tri dépendant de la locale
- la langue influe sur la casse et sur la comparaison alphabétique

## Organisation du projet

```text
.
├── index.html      # structure de la page et éléments d'interface
├── css/
│   └── style.css   # mise en page simple et styles des composants
├── js/
│   └── app.js      # traductions, événements UI, logique de transformation
└── favicon.ico
```

## Aperçu des fichiers

### `index.html`

Contient tout le balisage de la page :

- sélecteur de langue
- court texte d'introduction
- zone de saisie
- boutons radio pour le mode de tri
- boutons d'action pour ranger / effacer / copier
- zones de résultat et de statut

### `js/app.js`

Contient :

- les chaînes de l'interface en deux langues (`en` / `fr`)
- la détection de langue via la query string
- l'application des traductions dans le DOM
- la mise à jour de l'URL lors du changement de langue
- les fonctions principales de transformation du texte
- les gestionnaires d'événements des boutons et du lien d'introduction
- les messages de retour pour la copie dans le presse-papiers

### `css/style.css`

Contient une présentation volontairement simple et légère :

- une mise en page centrée sur une colonne
- un style basique pour les champs de formulaire
- une rangée de contrôles flexible
- un bloc de sortie lisible

## Lancer le projet en local

Il n'y a ni étape de build ni dépendance.

Il suffit d'ouvrir `index.html` dans un navigateur, ou de servir le dossier avec un petit serveur statique local si besoin.

## Notes

- La langue par défaut de l'interface est le français
- Le texte d'exemple intégré change selon la langue sélectionnée
- La copie dans le presse-papiers dépend du support de `navigator.clipboard` par le navigateur
