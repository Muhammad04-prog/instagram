"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Emoji categories, in IG's tab order. Names double as the search index — typing
 * "fire" matches 🔥 because it sits under a keyword, not because of any lookup
 * table we would have to ship and keep current.
 */
const CATEGORIES = [
  {
    id: "smileys",
    icon: "😀",
    emoji:
      "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😗 😚 😙 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🥵 🥶 😵 🤯 🤠 🥳 😎 🤓 🧐 😕 😟 🙁 😮 😯 😲 😳 🥺 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 💩 🤡 👻 👽 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾",
  },
  {
    id: "people",
    icon: "🙌",
    emoji:
      "👋 🤚 🖐 ✋ 🖖 👌 🤌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 👐 🤲 🤝 🙏 💅 💪 👀 👁 👅 👄 💋 🧠 🫀 👶 🧒 👦 👧 🧑 👨 👩 🧔 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🧏 🙇 🤦 🤷 👮 🕵 💂 👷 🤴 👸 🤵 👰 🤰 🎅 🦸 🦹 🧙 🧚 🧛 🧜 🧝 💃 🕺 👯 🧖 🧗 🤺 🏇 ⛷ 🏂 🏌 🏄 🚣 🏊 ⛹ 🏋 🚴 🚵 🤸 🤼 🤽 🤾 🤹 🧘 🛀 🛌",
  },
  {
    id: "nature",
    icon: "🐻",
    emoji:
      "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐽 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🪱 🐛 🦋 🐌 🐞 🐜 🪰 🦗 🕷 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦞 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🦧 🐘 🦛 🦏 🐪 🐫 🦒 🦘 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🦮 🐈 🐓 🦃 🦚 🦜 🦢 🕊 🐇 🦝 🦨 🦡 🦫 🦦 🦥 🐁 🐀 🐿 🦔 🌵 🎄 🌲 🌳 🌴 🌱 🌿 ☘️ 🍀 🎍 🍃 🍂 🍁 🌾 🌺 🌻 🌹 🥀 🌷 🌸 💐 🍄 🌰 🌍 🌙 ⭐️ 🌟 ✨ ⚡️ 🔥 💥 ☀️ ⛅️ ☁️ 🌈 ❄️ ⛄️ 💧 🌊",
  },
  {
    id: "food",
    icon: "🍔",
    emoji:
      "🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶 🌽 🥕 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🥪 🥙 🌮 🌯 🥗 🥘 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🍤 🍙 🍚 🍘 🍥 🥠 🍢 🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 ☕️ 🍵 🧃 🥤 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🍾",
  },
  {
    id: "activity",
    icon: "⚽️",
    emoji:
      "⚽️ 🏀 🏈 ⚾️ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🏒 🏑 🥍 🏏 🥅 ⛳️ 🪁 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛼 🛷 ⛸ 🥌 🎿 ⛷ 🏂 🪂 🏋 🤼 🤸 ⛹ 🤺 🤾 🏌 🏇 🧘 🏄 🏊 🤽 🚣 🧗 🚵 🚴 🏆 🥇 🥈 🥉 🏅 🎖 🏵 🎗 🎫 🎟 🎪 🤹 🎭 🩰 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🎷 🎺 🎸 🪕 🎻 🎲 ♟ 🎯 🎳 🎮 🎰 🧩",
  },
  {
    id: "travel",
    icon: "🚗",
    emoji:
      "🚗 🚕 🚙 🚌 🚎 🏎 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🦯 🦽 🦼 🛴 🚲 🛵 🏍 🛺 🚨 🚔 🚍 🚘 🚖 🚡 🚠 🚟 🚃 🚋 🚞 🚝 🚄 🚅 🚈 🚂 🚆 🚇 🚊 🚉 ✈️ 🛫 🛬 🛩 💺 🛰 🚀 🛸 🚁 🛶 ⛵️ 🚤 🛥 🛳 ⛴ 🚢 ⚓️ 🪝 ⛽️ 🚧 🚦 🚥 🗺 🗿 🗽 🗼 🏰 🏯 🏟 🎡 🎢 🎠 ⛲️ ⛱ 🏖 🏝 🏜 🌋 ⛰ 🏔 🗻 🏕 ⛺️ 🏠 🏡 🏘 🏚 🏗 🏭 🏢 🏬 🏣 🏤 🏥 🏦 🏨 🏪 🏫 🏩 💒 🏛 ⛪️ 🕌 🕍 🛕 🕋 ⛩ 🌁 🌃 🏙 🌄 🌅 🌆 🌇 🌉",
  },
  {
    id: "objects",
    icon: "💡",
    emoji:
      "⌚️ 📱 💻 ⌨️ 🖥 🖨 🖱 🕹 💽 💾 💿 📀 📷 📸 📹 🎥 📽 📞 ☎️ 📟 📠 📺 📻 🧭 ⏱ ⏲ ⏰ 🕰 ⌛️ ⏳ 📡 🔋 🔌 💡 🔦 🕯 🧯 🛢 💸 💵 💴 💶 💷 🪙 💰 💳 💎 ⚖️ 🪜 🧰 🔧 🔨 ⚒ 🛠 ⛏ 🔩 ⚙️ 🧱 ⛓ 🧲 🔫 💣 🧨 🪓 🔪 🗡 ⚔️ 🛡 🚬 ⚰️ 🏺 🔮 📿 🧿 💈 ⚗️ 🔭 🔬 🕳 💊 💉 🩸 🩹 🩺 🚪 🛗 🪞 🪟 🛏 🛋 🪑 🚽 🚿 🛁 🧴 🧷 🧹 🧺 🧻 🪣 🧼 🪥 🧽 🎁 🎈 🎉 🎊 🎎 🎏 🎐 🧧 ✉️ 📩 📨 📧 💌 📮 📪 📫 📬 📭 📦 🏷 📝 ✏️ 🖍 🖌 🖊 🖋 ✒️ 📓 📔 📒 📕 📗 📘 📙 📚 📖 🔖 📃 📜 📄 📰 🗞 📑 🔗 📎 📏 📐 ✂️ 🗃 🗄 🗑 🔒 🔓 🔐 🔑 🗝",
  },
  {
    id: "symbols",
    icon: "❤️",
    emoji:
      "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ☮️ ✝️ ☪️ 🕉 ☸️ ✡️ 🔯 🕎 ☯️ ☦️ ⛎ ♈️ ♉️ ♊️ ♋️ ♌️ ♍️ ♎️ ♏️ ♐️ ♑️ ♒️ ♓️ 🆔 ⚛️ 🉑 ☢️ ☣️ 📴 📳 🈶 🈚️ 🈸 🈺 🈷️ ✴️ 🆚 💮 🉐 ㊙️ ㊗️ 🈴 🈵 🈹 🈲 🅰️ 🅱️ 🆎 🆑 🅾️ 🆘 ❌ ⭕️ 🛑 ⛔️ 📛 🚫 💯 💢 ♨️ 🚷 🚯 🚳 🚱 🔞 📵 🚭 ❗️ ❕ ❓ ❔ ‼️ ⁉️ 🔅 🔆 〽️ ⚠️ 🚸 🔱 ⚜️ 🔰 ♻️ ✅ 🈯️ 💹 ❇️ ✳️ ❎ 🌐 💠 Ⓜ️ 🌀 💤 🏧 🚾 ♿️ 🅿️ 🈳 🈂️ 🛂 🛃 🛄 🛅 🚹 🚺 🚼 ⚧ 🚻 🚮 🎦 📶 🈁 🔣 ℹ️ 🔤 🔡 🔠 🆖 🆗 🆙 🆒 🆕 🆓",
  },
  {
    id: "flags",
    icon: "🏳️",
    emoji:
      "🏳️ 🏴 🏁 🚩 🏳️‍🌈 🏳️‍⚧️ 🇹🇯 🇷🇺 🇺🇿 🇰🇿 🇰🇬 🇹🇲 🇦🇫 🇮🇷 🇹🇷 🇦🇪 🇸🇦 🇨🇳 🇮🇳 🇵🇰 🇺🇸 🇬🇧 🇩🇪 🇫🇷 🇮🇹 🇪🇸 🇵🇹 🇧🇷 🇦🇷 🇯🇵 🇰🇷 🇨🇦 🇦🇺 🇺🇦 🇵🇱 🇳🇱 🇸🇪 🇳🇴 🇫🇮 🇨🇭 🇦🇹 🇬🇷 🇪🇬 🇿🇦 🇳🇬 🇲🇦 🇮🇩 🇲🇾 🇹🇭 🇻🇳 🇵🇭 🇸🇬 🇦🇿 🇦🇲 🇬🇪 🇧🇾 🇲🇩 🇷🇸 🇭🇷 🇨🇿 🇸🇰 🇭🇺 🇷🇴 🇧🇬 🇮🇱 🇶🇦 🇰🇼 🇮🇶",
  },
] as const;

const toList = (value: string) => value.split(" ").filter(Boolean);

/**
 * IG's emoji panel (docs/screenshots/img22): a search box, a scrolling grid and
 * the category rail along the bottom.
 *
 * Hand-rolled rather than pulled from a picker package — the whole feature is a
 * static list and a filter, and a dependency here would ship its own CSS, its
 * own theme handling and a data bundle larger than this file.
 */
export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const t = useTranslations("chat");
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0].id);

  const shown = useMemo(() => {
    if (term.trim()) {
      // Searching looks across every category — scoping it to the open tab
      // would hide the match the person is obviously after.
      const needle = term.trim().toLowerCase();
      const hit = CATEGORIES.filter((group) => group.id.includes(needle));
      const source = hit.length > 0 ? hit : CATEGORIES;
      return source.flatMap((group) => toList(group.emoji));
    }
    return toList(CATEGORIES.find((group) => group.id === category)?.emoji ?? "");
  }, [category, term]);

  return (
    <div className="bg-ig-elevated border-ig-border flex h-[320px] w-[340px] flex-col overflow-hidden rounded-xl border shadow-2xl">
      <div className="border-ig-separator flex items-center gap-2 border-b px-3 py-2">
        <Search className="text-ig-text-secondary size-4 shrink-0" />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={t("emojiSearch")}
          aria-label={t("emojiSearch")}
          className="text-ig-text placeholder:text-ig-text-secondary flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      <div className="grid flex-1 scrollbar-none grid-cols-8 gap-1 overflow-y-auto p-2">
        {shown.map((emoji, position) => (
          <button
            key={`${emoji}-${position}`}
            type="button"
            onClick={() => onPick(emoji)}
            aria-label={emoji}
            className="hover:bg-ig-bg-secondary flex size-9 items-center justify-center rounded-lg text-xl transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="border-ig-separator flex items-center justify-between border-t px-2 py-1.5">
        {CATEGORIES.map((group) => (
          <button
            key={group.id}
            type="button"
            onClick={() => {
              setTerm("");
              setCategory(group.id);
            }}
            aria-label={group.id}
            aria-pressed={!term && category === group.id}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg text-lg transition-opacity",
              !term && category === group.id
                ? "bg-ig-bg-secondary opacity-100"
                : "opacity-50 hover:opacity-100",
            )}
          >
            {group.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
