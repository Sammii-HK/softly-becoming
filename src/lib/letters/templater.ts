import { guardQuote } from "@/lib/quality/contentGuard";

const OPENERS = [
  "the house is quiet. the kettle settles. i can hear my breath when nothing is asking for me.",
  "the light is soft on the table. i make tea and let the morning arrive without hurrying.",
  "i sit by the window. the street is slow. i notice how my chest loosens when i stop trying to be fast."
];

const LESSONS: Record<string, string[]> = {
  rebuilding: [
    "starting again is not a failure. it is an agreement with truth. when i move at an honest pace, i keep the promises i make to myself.",
    "there is no prize for rushing back to who i was. there is only the quiet pride of becoming someone i can trust."
  ],
  soft_strength: [
    "soft does not mean easy. it means i carry things without hardening. i let kindness decide the speed.",
    "when i choose a kinder pace, my voice steadies. i stop proving and start living."
  ],
  self_trust: [
    "self-trust is built in small choices. when i listen inward, i waste less time on noise.",
    "my body tells the truth before my calendar does. when i believe it, my days make more sense."
  ],
  letting_go: [
    "some endings are maintenance. i do not have to keep what keeps me small.",
    "space appears when i put down what hurts to carry. in that space, better things can land."
  ],
  becoming: [
    "i am not late to my own life. i am arriving with more honesty than before.",
    "becoming is a pace, not a performance. slow does not mean stuck. it means i am still here."
  ]
};

const PRACTICES = [
  "set a three-minute timer. hand on chest. inhale for four, exhale for six. when it ends, choose one tiny promise for today and do only that.",
  "write one sentence that begins with \"today i will protect my energy by…\". keep it practical and small.",
  "step outside for five minutes. no phone. notice five true things. let that be enough."
];

const PROMPTS = [
  ["where am i rushing from fear rather than need?", "what would ten quieter minutes change this week?"],
  ["what is one boundary that would make tuesday kinder?", "what does honesty look like at my current pace?"],
  ["what can i drop without explanation?", "what would 'slow and proud' look like today?"]
];

const BOUNDARIES = [
  "i would like to take this slower. i'll come back tomorrow with one clear step.",
  "i can't do this today. i will revisit it next week when i can give it care.",
  "this needs a calmer pace for me. here is what i can offer by friday."
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }

export function buildLetterFromKeep(params: {
  lineToKeep: string;
  theme?: "rebuilding"|"soft_strength"|"self_trust"|"letting_go"|"becoming";
  subject?: string;
}) {
  const theme = params.theme || "soft_strength";
  const subject = params.subject || {
    rebuilding: "rebuilding without the rush",
    soft_strength: "choosing a kinder pace",
    self_trust: "listening inward",
    letting_go: "making space",
    becoming: "arriving slowly"
  }[theme];

  // ensure keep line is clean and ends as quote style
  const keepGuard = guardQuote([params.lineToKeep]);
  const lineToKeep = keepGuard.lines.join("").replace(/\.$/,"");

  const opening = pick(OPENERS);
  const lesson = [pick(LESSONS[theme]), pick(LESSONS[theme])].join("\n\n");
  const practice = pick(PRACTICES);
  const prompts = pick(PROMPTS);
  const boundary = pick(BOUNDARIES);
  const closing = "i am proud of the way you are rebuilding without the rush.";
  const ps = "prefer to listen? the archive lives here.";

  return {
    subject,
    theme,
    opening,
    lesson,
    practice,
    prompts,
    boundary,
    lineToKeep,
    closing,
    ps
  };
}
