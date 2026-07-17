import { Fragment } from "react";
import { Link } from "@/i18n/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * A caption with its #hashtags and @mentions turned into links.
 *
 * The backend parses hashtags out of the caption itself (`PostDto.hashtags`),
 * but it does not hand back offsets, so the text is re-scanned here to know
 * *where* they are. Softclub had no hashtags at all.
 *
 * A mention links through `/u/{userName}`: there is no username→id endpoint, and
 * profile routes need the uuid — that page resolves the name and forwards.
 *
 * Unicode-aware on purpose: `#душанбе` and `#tj` must both match, so the classes
 * are letter/number based rather than [a-z0-9].
 */
const TOKEN = /([#@])([\p{L}\p{N}_.]+)/gu;

export function RichCaption({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{tokenise(text)}</span>;
}

function tokenise(text: string) {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(TOKEN)) {
    const [full, sigil, value] = match;
    const start = match.index ?? 0;

    if (start > cursor) nodes.push(text.slice(cursor, start));

    // A trailing dot is punctuation, not part of the name: "@eraj." → "@eraj" + "."
    const trimmed = value?.replace(/\.+$/, "") ?? "";
    const trailing = (value?.length ?? 0) - trimmed.length;

    if (!trimmed) {
      nodes.push(full);
    } else {
      nodes.push(
        <Fragment key={`${start}-${trimmed}`}>
          {/* One text node, not {sigil}{trimmed}: two children make the
              accessible name "# travel" — a screen reader would read the hash
              as a separate word. */}
          <Link
            href={sigil === "#" ? ROUTES.hashtag(trimmed) : ROUTES.userByName(trimmed)}
            className="text-ig-link hover:underline"
          >
            {`${sigil}${trimmed}`}
          </Link>
          {trailing ? text.slice(start + full.length - trailing, start + full.length) : null}
        </Fragment>,
      );
    }

    cursor = start + full.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

/** The same text, plain — for places that must not nest links (e.g. inside a Link). */
export function plainCaption(text: string, className?: string) {
  return <span className={cn("whitespace-pre-line", className)}>{text}</span>;
}
