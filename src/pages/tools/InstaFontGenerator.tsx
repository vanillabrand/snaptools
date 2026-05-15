import { useState, useMemo } from "react";
import { Type, Copy, Check, Sparkles } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type FontMap = Record<string, string>;

function buildMap(normal: string, styled: string[]): FontMap {
  const map: FontMap = {};
  const normalChars = [...normal];
  for (let i = 0; i < normalChars.length; i++) {
    map[normalChars[i]] = styled[i] || normalChars[i];
  }
  return map;
}

const lower = "abcdefghijklmnopqrstuvwxyz";
const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const digits = "0123456789";
const all = lower + upper + digits;

function makeFont(lc: string[], uc: string[], dg: string[]): FontMap {
  return buildMap(all, [...lc, ...uc, ...dg]);
}

const fonts: { name: string; map: FontMap; emoji: string }[] = [
  {
    name: "Bold",
    emoji: "🅱️",
    map: makeFont(
      [..."𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇"],
      [..."𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭"],
      [..."𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵"],
    ),
  },
  {
    name: "Italic",
    emoji: "✨",
    map: makeFont(
      [..."𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻"],
      [..."𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡"],
      [..."0123456789"],
    ),
  },
  {
    name: "Bold Italic",
    emoji: "💫",
    map: makeFont(
      [..."𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯"],
      [..."𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕"],
      [..."0123456789"],
    ),
  },
  {
    name: "Script",
    emoji: "🖋️",
    map: makeFont(
      [..."𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏"],
      [..."𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵"],
      [..."0123456789"],
    ),
  },
  {
    name: "Bold Script",
    emoji: "🎀",
    map: makeFont(
      [..."𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃"],
      [..."𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩"],
      [..."0123456789"],
    ),
  },
  {
    name: "Monospace",
    emoji: "💻",
    map: makeFont(
      [..."𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣"],
      [..."𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉"],
      [..."𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"],
    ),
  },
  {
    name: "Double Struck",
    emoji: "🔠",
    map: makeFont(
      [..."𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫"],
      [..."𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ"],
      [..."𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡"],
    ),
  },
  {
    name: "Fraktur",
    emoji: "🏰",
    map: makeFont(
      [..."𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷"],
      [..."𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ"],
      [..."0123456789"],
    ),
  },
  {
    name: "Circled",
    emoji: "⭕",
    map: makeFont(
      [..."ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ"],
      [..."ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ"],
      [..."⓪①②③④⑤⑥⑦⑧⑨"],
    ),
  },
  {
    name: "Squared",
    emoji: "🟥",
    map: makeFont(
      [..."🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉"],
      [..."🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉"],
      [..."0123456789"],
    ),
  },
  {
    name: "Fullwidth",
    emoji: "📐",
    map: makeFont(
      [..."ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ"],
      [..."ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ"],
      [..."０１２３４５６７８９"],
    ),
  },
  {
    name: "Upside Down",
    emoji: "🙃",
    map: buildMap(
      all,
      [
        ..."ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz",
        ..."∀qƆpƎℲפHIſʞ˥WNOԀQɹS┴∩ΛMX⅄Z",
        ..."0ƖᄅƐㄣϛ9ㄥ86",
      ],
    ),
  },
  {
    name: "Tiny Superscript",
    emoji: "🔬",
    map: buildMap(
      all,
      [
        ..."ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻ",
        ..."ᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻ",
        ..."⁰¹²³⁴⁵⁶⁷⁸⁹",
      ],
    ),
  },
  {
    name: "Strikethrough",
    emoji: "✂️",
    map: (() => {
      const m: FontMap = {};
      for (const c of all) m[c] = c + "\u0336";
      return m;
    })(),
  },
  {
    name: "Underline",
    emoji: "📝",
    map: (() => {
      const m: FontMap = {};
      for (const c of all) m[c] = c + "\u0332";
      return m;
    })(),
  },
];

function convert(text: string, fontMap: FontMap): string {
  return [...text].map((c) => fontMap[c] || c).join("");
}

export function InstaFontGenerator() {
  const [input, setInput] = useState("Type your text here");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const results = useMemo(() => {
    return fonts.map((f) => ({
      ...f,
      output: convert(input, f.map),
    }));
  }, [input]);

  const copyText = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <ToolLayout
      name="Instagram Font Generator"
      description="Generate stylish Unicode fonts for Instagram bios, captions, tweets, and more. Just type, tap, and paste."
      icon={Type}
    >
      <div className="space-y-6">
        {/* Input */}
        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your text here…"
            className="text-lg min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            <Sparkles className="size-3 inline mr-1" />
            These are Unicode characters — they work everywhere: Instagram, Twitter, Facebook, TikTok, WhatsApp, and more.
          </p>
        </div>

        {/* Font outputs */}
        <div className="grid gap-2">
          {results.map((r, idx) => (
            <button
              type="button"
              key={r.name}
              onClick={() => copyText(r.output, idx)}
              className="group w-full text-left rounded-xl border bg-card p-4 hover:border-primary/30 hover:bg-primary/[0.02] transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">{r.emoji}</span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {r.name}
                    </span>
                  </div>
                  <p className="text-base break-all leading-relaxed">{r.output}</p>
                </div>
                <div className="shrink-0 mt-1">
                  {copiedIdx === idx ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : (
                    <Copy className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
