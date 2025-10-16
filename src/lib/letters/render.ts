export function renderHtml(j: any) {
  const css = "font-family: serif; color:#333; max-width:560px; margin:2rem auto; line-height:1.6";
  const p = (s:string)=>`<p>${s.replace(/\n/g,"<br/>")}</p>`;
  return `
  <div style="${css}">
    <h2 style="font-weight:400;margin:0 0 16px">soft rebuild — sunday letter</h2>
    ${p(j.opening)}
    ${p(j.lesson)}
    <h3 style="font-weight:500;margin:16px 0 8px">a 5-minute practice</h3>
    ${p(j.practice)}
    <h3 style="font-weight:500;margin:16px 0 8px">journal prompts</h3>
    <ul><li>${j.prompts[0]}</li><li>${j.prompts[1]}</li></ul>
    <h3 style="font-weight:500;margin:16px 0 8px">soft boundary</h3>
    ${p(j.boundary)}
    <h3 style="font-weight:500;margin:16px 0 8px">one line to keep</h3>
    <p style="font-style:italic">${j.lineToKeep}</p>
    ${p(j.closing)}
    <p style="font-size:12px;opacity:.7">P.S. ${j.ps}</p>
  </div>`;
}

export function renderText(j: any) {
  return [
    "soft rebuild — sunday letter",
    "",
    j.opening, "",
    j.lesson, "",
    "A 5-minute practice:", j.practice, "",
    "Journal prompts:",
    `1) ${j.prompts[0]}`,
    `2) ${j.prompts[1]}`, "",
    "Soft boundary:", j.boundary, "",
    "One line to keep:", j.lineToKeep, "",
    j.closing,
    `P.S. ${j.ps}`
  ].join("\n");
}
