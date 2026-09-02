---
kind: business_term
name: Business Glossary
category: business_term
scope:
    - '**'
---

### Zabandaan
- Definition：Internal name of this Urdu learning web application for children, covering alphabets (tracing), idioms, poetry, and word search games.

### alphabet section
- Definition：The part of the app where users learn Urdu letters through tracing on a canvas and hear each letter's pronunciation; includes both an AlphabetMap grid view and a TracingCanvas detail view.

### idioms game
- Definition：A quiz-style game that presents Urdu idioms with multiple-choice meanings, stored in the `idioms_content` table and served from `zabandaan/client/public/images/idioms/`.

### poetry page
- Definition：Section displaying Urdu couplets with poet name, title, word breakdown, overall meaning, and tashri (explanation); data lives in the `poetry_content` table.

### word search
- Definition：A word-finding game using Urdu words and their meanings, backed by the `wordsearch_wordlists` table and difficulty levels.
