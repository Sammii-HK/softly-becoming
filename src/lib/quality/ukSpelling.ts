const MAP: Record<string, string> = {
  "color": "colour",
  "colors": "colours",
  "honor": "honour",
  "organize": "organise",
  "organizing": "organising",
  "analyze": "analyse",
  "practice": "practise", // verb only; our usage in captions is typically verb: "to practise"
};

export function toUK(text: string) {
  // conservative replace: whole words only, lower/sentence case safe
  return text.replace(/\b([A-Za-z]+)\b/g, (w) => {
    const lower = w.toLowerCase();
    if (MAP[lower]) {
      const rep = MAP[lower];
      // preserve capitalisation of first letter if needed
      if (w[0] === w[0].toUpperCase()) return rep[0].toUpperCase() + rep.slice(1);
      return rep;
    }
    return w;
  });
}
