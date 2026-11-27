/* Portfolio content. Edit here to add or change projects.
   world: "design", "foto" or both. cats: used by the category filters.
   images: { src } for a real image, or { ph: "Text" } for a styled placeholder.
   layout per image: "full" | "half" | "offset".
   NOTE: project texts and the projects without images are placeholders until
   Elisabet supplies final photos and copy. */
window.EE_PROJECTS = [
  {
    slug: "bolgen-media",
    title: "Bølgen Media",
    client: "Bølgen Media",
    year: "2025",
    world: ["design"],
    cats: ["Visuell identitet", "Bildekor"],
    tags: ["Visuell identitet", "Bildekor"],
    cover: "assets/img/bolgen.webp",
    tall: "assets/img/bolgen-detail.webp",
    lead: "En visuell identitet som føles like levende som bølgene den er oppkalt etter.",
    intro: "Bølgen Media trengte et uttrykk som kunne vokse med dem: gjenkjennelig på et visittkort, like sterkt på en bil eller en nettside.",
    challenge: "Mange flater, lite tid og et ønske om å skille seg tydelig ut i et marked der alle ser like ut.",
    solution: "Et fleksibelt bølgemønster, en rolig fargepalett og en typografi som tåler mye. Resultatet er et system, ikke bare en logo.",
    images: [
      { src: "assets/img/bolgen.webp", layout: "full" },
      { src: "assets/img/bolgen-detail.webp", layout: "half" },
      { ph: "Logo i bruk", layout: "half" },
      { ph: "Bildekor", layout: "offset" }
    ]
  },
  {
    slug: "sandnes-havneterminal",
    title: "Sandnes Havneterminal",
    client: "Sandnes Havneterminal",
    year: "2025",
    world: ["design", "foto"],
    cats: ["Logo", "Miljøbilder"],
    tags: ["Logo design", "Foto"],
    cover: "assets/img/sht.webp",
    tall: "assets/img/sht-tall.webp",
    lead: "Ny logo og et bildespråk hentet rett fra kaikanten.",
    intro: "Et nytt merke for havneterminalen, og bilder av menneskene som faktisk får hjulene til å gå rundt.",
    challenge: "Logoen måtte fungere like godt på en arbeidsjakke som på et skilt, i sollys og i regn.",
    solution: "Et enkelt, robust symbol og en serie miljøbilder tatt i ekte arbeidssituasjoner. Design og foto fra samme hånd, med én rød tråd.",
    images: [
      { src: "assets/img/sht.webp", layout: "full" },
      { src: "assets/img/sht-tall.webp", layout: "half" },
      { ph: "Logo", layout: "half" }
    ]
  },
  {
    slug: "neodrill",
    title: "Neodrill",
    client: "Neodrill",
    year: "2024",
    world: ["foto"],
    cats: ["Produktbilder", "Kampanjebilder"],
    tags: ["Produktfoto", "Kampanje"],
    cover: "assets/img/neodrill.webp",
    tall: "assets/img/neodrill.webp",
    lead: "Teknologi forklart med bilder: produkt, mennesker og øyeblikket der det skjer.",
    intro: "Kampanjebilder som viser produktet i bruk, ikke bare på en hvit bakgrunn.",
    challenge: "Å gjøre et teknisk produkt forståelig og menneskelig.",
    solution: "Bilder tatt i ekte omgivelser med fokus på hender, detaljer og bruk.",
    images: [
      { src: "assets/img/neodrill.webp", layout: "full" },
      { ph: "Produktdetalj", layout: "half" },
      { ph: "I bruk", layout: "half" }
    ]
  },
  {
    slug: "miljoportretter",
    title: "Miljøportretter",
    client: "Bedriftskunde",
    year: "2025",
    world: ["foto"],
    cats: ["Ansattbilder", "Miljøbilder"],
    tags: ["Ansattfoto", "Miljøfoto"],
    cover: "assets/img/portrett-1.webp",
    tall: "assets/img/portrett-1-tall.webp",
    lead: "Et godt portrett handler om mer enn et fint smil.",
    intro: "Portretter på arbeidsplassen som formidler personlighet, profesjonalitet og tillit.",
    challenge: "Ansatte som ikke liker å bli fotografert, og et kontor som skulle se ut som seg selv.",
    solution: "God tid, rolig regi og naturlig lys. Bildene brukes på nettside, LinkedIn og i pressemateriell.",
    images: [
      { src: "assets/img/portrett-1.webp", layout: "full" },
      { src: "assets/img/portrett-1-tall.webp", layout: "half" },
      { src: "assets/img/portrett-3-tall.webp", layout: "half" },
      { src: "assets/img/portrett-2.webp", layout: "offset" }
    ]
  },
  {
    slug: "skf-norge",
    title: "SKF Norge AS",
    client: "SKF Norge AS",
    year: "2024",
    world: ["design"],
    cats: ["Grafisk design"],
    tags: ["Grafisk design"],
    ph: { bg: "#DEE0B9", fg: "#222D1D" },
    lead: "Grafisk materiell med et tydelig og gjenkjennelig uttrykk.",
    intro: "Prosjekttekst kommer.",
    challenge: "Prosjekttekst kommer.",
    solution: "Prosjekttekst kommer.",
    images: [{ ph: "SKF Norge AS", layout: "full" }]
  },
  {
    slug: "scan-tech",
    title: "Scan Tech",
    client: "Scan Tech",
    year: "2024",
    world: ["design"],
    cats: ["Visuell identitet"],
    tags: ["Visuell identitet"],
    ph: { bg: "#222D1D", fg: "#DEE0B9" },
    lead: "Visuell identitet for et teknologiselskap i vekst.",
    intro: "Prosjekttekst kommer.",
    challenge: "Prosjekttekst kommer.",
    solution: "Prosjekttekst kommer.",
    images: [{ ph: "Scan Tech", layout: "full" }]
  },
  {
    slug: "objektsikring",
    title: "Objektsikring AS",
    client: "Objektsikring AS",
    year: "2023",
    world: ["foto"],
    cats: ["Miljøbilder"],
    tags: ["Miljøfoto"],
    ph: { bg: "#FDD8B7", fg: "#342526" },
    lead: "Miljøbilder som viser fagfolk i arbeid.",
    intro: "Prosjekttekst kommer.",
    challenge: "Prosjekttekst kommer.",
    solution: "Prosjekttekst kommer.",
    images: [{ ph: "Objektsikring AS", layout: "full" }]
  },
  {
    slug: "bondenes-innkjopslag",
    title: "Bøndenes Innkjøpslag",
    client: "Bøndenes Innkjøpslag",
    year: "2023",
    world: ["design"],
    cats: ["Utstillingsdesign"],
    tags: ["Utstillingsdesign"],
    ph: { bg: "#9A9475", fg: "#F9F2EA" },
    lead: "Standdesign som trekker folk inn.",
    intro: "Prosjekttekst kommer.",
    challenge: "Prosjekttekst kommer.",
    solution: "Prosjekttekst kommer.",
    images: [{ ph: "Bøndenes Innkjøpslag", layout: "full" }]
  }
];
