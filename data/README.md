# Lernmaterialien ablegen

Eigene Seiten und Dateien liegen direkt im Fachordner. Die Ordnerstruktur besteht
nur aus Klasse und Fach; Themen und Materialtypen werden in der Sammlung als
Filter verwendet, nicht als zusätzliche Unterordner.

```text
data/
├── Seiten/                         Weitere eigene HTML-Seiten
├── Klasse-4/
│   └── Mathematik/
│       ├── zahlenraetsel.html
│       └── zahlenraetsel-musterprobe.html
└── Klasse-9/
    └── Franzoesisch/
        └── y-en-lernen.html
```

Für Datei- und Ordnernamen werden nur ASCII-Buchstaben, Zahlen und Bindestriche
verwendet. Umlaute werden ausgeschrieben (zum Beispiel `Franzoesisch`), Leerzeichen
durch Bindestriche ersetzt.

Wenn eine lokale HTML-Seite in der Materialsammlung erscheinen soll, trage sie in
`window.LEARNING_RESOURCES` in `app/data.js` ein. Verwende einen relativen Pfad ab
der Projekt-Hauptseite, zum Beispiel:

```js
url: "data/Klasse-9/Franzoesisch/y-en-lernen.html"
```

Lege weitere allgemeine HTML-Seiten in `data/Seiten/` ab und verlinke sie dort
ebenfalls mit einem relativen Pfad.
