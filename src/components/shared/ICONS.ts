/*
 * ─────────────────────────────────────────────────────────────────────────────
 * ICON MAPPING — lucide-react (single icon library for the whole project)
 * Import icons from "lucide-react". Never use custom Instagram SVG glyphs.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * STANDARD SIZES
 *   size={16}  — inline / small context (info tooltip, chevrons, badge text)
 *   size={20}  — nav bars (Navbar, Sidebar, MobileNav)
 *   size={24}  — action rows (like / comment / share under a post)
 *
 * ┌─────────────────────────────────┬────────────────────┬────────────────────────────────────┐
 * │ UI meaning                      │ lucide-react icon  │ Notes                              │
 * ├─────────────────────────────────┼────────────────────┼────────────────────────────────────┤
 * │ Feed / Home                     │ Home               │                                    │
 * │ Search / Explore                │ Search             │                                    │
 * │ Reels                           │ Clapperboard       │                                    │
 * │ Direct / Chat list              │ MessageSquare      │                                    │
 * │ Send message action             │ Send               │                                    │
 * │ Create post                     │ PlusSquare         │                                    │
 * │ Profile                         │ CircleUserRound    │                                    │
 * │ Like (inactive)                 │ Heart              │ outline (default)                  │
 * │ Like (active)                   │ Heart              │ fill="currentColor" + text-ig-red  │
 * │ Comment                         │ MessageCircle      │                                    │
 * │ Share (post action)             │ Send               │                                    │
 * │ Save / Favorite (inactive)      │ Bookmark           │ outline (default)                  │
 * │ Save / Favorite (active)        │ Bookmark           │ fill="currentColor"                │
 * │ More options (•••)              │ MoreHorizontal     │                                    │
 * │ Back                            │ ChevronLeft        │                                    │
 * │ Close / dismiss                 │ X                  │                                    │
 * │ Settings                        │ Settings           │                                    │
 * │ Notifications                   │ Bell               │ NOT Heart — Heart is like only     │
 * │ Follow request / add user       │ UserPlus           │                                    │
 * │ Story ring / add story          │ PlusCircle         │                                    │
 * │ Location                        │ MapPin             │                                    │
 * │ Info tooltip (e.g. birthday ?)  │ Info               │ or HelpCircle                      │
 * │ Password visibility toggle on   │ Eye                │                                    │
 * │ Password visibility toggle off  │ EyeOff             │                                    │
 * └─────────────────────────────────┴────────────────────┴────────────────────────────────────┘
 *
 * USAGE EXAMPLES
 *
 *   // Inactive heart
 *   import { Heart } from "lucide-react";
 *   <Heart size={24} />
 *
 *   // Active (liked) heart
 *   <Heart size={24} fill="currentColor" className="text-ig-red" />
 *
 *   // Active bookmark
 *   <Bookmark size={24} fill="currentColor" />
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
