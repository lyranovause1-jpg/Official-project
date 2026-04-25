# WHIMSEY ($CNDY) — Complete Discord Server Setup Reference

> **Goal of this document:** A step-by-step, click-by-click reference covering every role, every bot, every category, every channel, every permission toggle, and every audit/log channel for the WHIMSEY community server. Follow it top-to-bottom in order. Nothing should be skipped — the order matters.

---

## TABLE OF CONTENTS

1. Setup order at a glance (do these in this exact order)
2. The member journey (the "flow" your server must enforce)
3. Roles — full list, hierarchy order, and exact permissions
4. @everyone baseline (server-wide lockdown)
5. Bots — what each one does, invite order, and required permissions
6. Bot role positioning (very important — Discord hierarchy rules)
7. Private staff & audit channels you still need to create
8. Category-level permissions (every category, every role)
9. Channel-level overrides (only the channels that need special rules)
10. Verification flow — exact bot configuration
11. Carl-bot — what it does for you when you're away
12. Pre-launch test checklist (do not skip)
13. Extra "polish" tasks for a 30,000-supply launch
14. Glossary of every Discord permission used in this doc

---

## 1) SETUP ORDER AT A GLANCE

Do these in this exact order. Doing them out of order will cause permission leaks.

1. Create all 4 roles (Admin, Moderator, Holder, Verified) — *do not* assign anyone yet.
2. Lock down `@everyone` (server-wide).
3. Set the role hierarchy (drag roles into the correct vertical order).
4. Create the staff/audit channels listed in section 7.
5. Apply category-level permissions (section 8).
6. Apply channel-level overrides (section 9).
7. Invite the 4 bots one at a time, in the order listed in section 5.
8. After each bot is invited, drag its auto-created role into the correct hierarchy slot (section 6) **before** configuring it.
9. Configure each bot (section 10 + 11).
10. Run the pre-launch test checklist (section 12) using a second Discord account.
11. Only then — share the invite link.

---

## 2) THE MEMBER JOURNEY (THE FLOW)

This is the experience every new person must have. The whole permission system exists to enforce this.

**Stage 1 — Brand new joiner (no roles, just `@everyone`):**
- Sees ONLY the `💗 | VERIFY` category.
- Lands first on `#access-info` (read-only — explains how to verify).
- Goes to `#verify` and completes Auth bot captcha/verification.
- Receives the **Verified 🩵** role automatically.

**Stage 2 — Verified 🩵 member:**
- The `💗 | VERIFY` category disappears.
- All public categories appear: START HERE → THE UNIVERSE → COMMUNITY → COLLECTORS → EVENTS → SUPPORT.
- Inside `🌌 | HOLDERS ONLY` they can see ONLY `#holder-verify` (so they can prove NFT ownership). The other two holder channels stay hidden.

**Stage 3 — Holder 🌌 member (after Collab.Land confirms wallet owns a $CNDY NFT):**
- `#holder-chat` and `#holder-announcements` appear inside `🌌 | HOLDERS ONLY`.
- Everything else stays the same.

**Stage 4 — Moderator ☁️ (your team):**
- Sees everything Verified + Holder sees, plus the private staff/audit channels (section 7).
- Can manage messages, kick, mute, run mod commands.

**Stage 5 — Admin 💗 (you):**
- Full Administrator. Sees everything.

---

## 3) ROLES — FULL LIST, HIERARCHY ORDER, EXACT PERMISSIONS

Create the 4 roles below in **Server Settings → Roles → Create Role**. Pick the suggested colors, enable "Display role members separately" only on Admin and Moderator (so the team is visible in the right-hand sidebar).

### Role hierarchy (top = highest power, bottom = lowest)

```
1.  💗 Admin              ← you
2.  ☁️ Moderator          ← team
3.  🤖 Carl-bot           ← (auto-created when you invite Carl-bot)
4.  🤖 Auth                ← (auto-created when you invite Auth)
5.  🤖 Collab.Land        ← (auto-created when you invite Collab.Land)
6.  🤖 Ticket Tool        ← (auto-created when you invite Ticket Tool)
7.  🌌 Holder
8.  🩵 Verified
9.  @everyone             ← cannot be moved
```

**Why this order matters:** A bot can only assign or remove roles that sit *below* it in this list. Auth must sit above Verified. Collab.Land must sit above Holder. Carl-bot sits high so it can mute/ban regular members but stays below your human staff so it can never punish a Mod or Admin.

---

### 3.1) 💗 Admin

| Setting | Value |
|---|---|
| Color | Pink (`#FF66B2` or similar) |
| Display separately | ✅ Yes |
| Allow @mention | ❌ No (only you/mods should ping you) |
| Permissions | **Administrator: ENABLE** (this overrides everything else) |

> Administrator gives every permission automatically. You don't need to toggle anything else.

---

### 3.2) ☁️ Moderator

Color: Light blue (`#A8D8FF`). Display separately: ✅ Yes. Allow @mention: ❌ No.

| Permission | Enable? | Why |
|---|---|---|
| **General** | | |
| View Channels | ✅ | Must see channels to moderate |
| Manage Channels | ❌ | Only Admin restructures the server |
| Manage Roles | ❌ | Only Admin assigns roles |
| Manage Server | ❌ | Admin only |
| Manage Webhooks | ❌ | Admin only |
| View Audit Log | ✅ | Needed to investigate incidents |
| View Server Insights | ✅ | Helpful for community health |
| **Membership** | | |
| Create Invite | ✅ | Needed for partnerships, AMAs |
| Change Nickname | ✅ | Personal use |
| Manage Nicknames | ✅ | Cleanup of impersonator nicknames |
| Kick Members | ✅ | Core mod power |
| Ban Members | ✅ | Core mod power |
| Timeout Members | ✅ | Preferred over ban for minor issues |
| **Text** | | |
| Send Messages | ✅ | |
| Send Messages in Threads | ✅ | |
| Create Public Threads | ✅ | |
| Create Private Threads | ✅ | For sensitive mod discussions |
| Embed Links | ✅ | |
| Attach Files | ✅ | |
| Add Reactions | ✅ | |
| Use External Emoji | ✅ | |
| Use External Stickers | ✅ | |
| Mention @everyone, @here, all roles | ✅ | Needed for announcements |
| Manage Messages | ✅ | Delete spam/scams |
| Manage Threads | ✅ | Lock/unlock/archive |
| Read Message History | ✅ | |
| Send TTS Messages | ❌ | Abuse risk |
| Use Application Commands | ✅ | Bot slash commands |
| **Voice** (in case you add VC later) | | |
| Connect | ✅ | |
| Speak | ✅ | |
| Mute Members | ✅ | |
| Deafen Members | ✅ | |
| Move Members | ✅ | |
| Priority Speaker | ✅ | |
| **Stage** | | |
| Request to Speak | ✅ | |
| **Events** | | |
| Manage Events | ✅ | They will host giveaways/AMAs |
| **Advanced** | | |
| Administrator | ❌ | NEVER give Administrator to mods |

---

### 3.3) 🌌 Holder

Color: Deep purple/galaxy (`#5B2A86`). Display separately: ❌ No. Allow @mention: ❌ No.

This role is mostly about **what they can SEE** (channel-level, set in section 9). At the role-permissions level, Holders are basically the same as Verified.

| Permission | Enable? |
|---|---|
| View Channels | ✅ |
| Send Messages | ✅ |
| Send Messages in Threads | ✅ |
| Create Public Threads | ✅ |
| Create Private Threads | ❌ |
| Embed Links | ✅ |
| Attach Files | ✅ |
| Add Reactions | ✅ |
| Use External Emoji | ✅ |
| Use External Stickers | ✅ |
| Read Message History | ✅ |
| Use Application Commands | ✅ |
| Change Nickname | ✅ |
| Mention @everyone/@here/roles | ❌ |
| Send TTS Messages | ❌ |
| Manage Messages / Channels / Roles / Server / Webhooks | ❌ |
| Kick / Ban / Timeout | ❌ |
| Administrator | ❌ |

---

### 3.4) 🩵 Verified

Color: Sky blue (`#7EC8E3`). Display separately: ❌ No. Allow @mention: ❌ No.

Identical permission set to Holder above (Holder vs Verified is decided by **channel visibility**, not by role-level toggles). Use the exact same checklist as section 3.3.

---

## 4) `@everyone` BASELINE (SERVER-WIDE LOCKDOWN)

This is the most important step. `@everyone` applies to a brand-new joiner who has not verified. We want them to see **only** the verify category.

Go to **Server Settings → Roles → @everyone** and set:

| Permission | Enable? | Notes |
|---|---|---|
| View Channels | ❌ | Hide everything by default; we will re-enable per-category for Verified |
| Create Invite | ❌ | Stops invite-link spam |
| Change Nickname | ❌ | Only after verification |
| Send Messages | ❌ | Will be re-enabled at category/channel level |
| Send Messages in Threads | ❌ | |
| Create Public Threads | ❌ | |
| Create Private Threads | ❌ | |
| Embed Links | ❌ | |
| Attach Files | ❌ | |
| Add Reactions | ❌ | |
| Use External Emoji | ❌ | |
| Use External Stickers | ❌ | |
| Mention @everyone/@here/roles | ❌ | |
| Read Message History | ❌ | |
| Send TTS Messages | ❌ | |
| Use Application Commands | ❌ | |
| Use Activities | ❌ | |
| Use Soundboard | ❌ | |
| Connect / Speak | ❌ | |
| Request to Speak | ❌ | |

> Result: A new joiner literally sees nothing. We will now re-grant access ONLY where we want it (in the verify category, and via the Verified/Holder roles).

Also, in **Server Settings → Safety Setup**:
- **Verification Level:** High (member must be on Discord >10 minutes).
- **Explicit Media Filter:** Filter from all members.
- **DM Spam Filter:** Filter all DMs.
- **Membership Screening:** Enabled. Add 1-2 simple rules ("I have read the rules", "I will not DM the team for support").
- **Raid Protection:** Enabled (built-in AutoMod).

---

## 5) BOTS — WHAT EACH ONE DOES, INVITE ORDER, REQUIRED PERMISSIONS

**Invite the bots in this exact order.** Do not invite all four at once — invite, position the role (section 6), configure, then move to the next.

### 5.1) Auth bot (verification gateway) — invite FIRST

**Purpose:** New joiners do a captcha / button click in `#verify`. On success, Auth assigns the **Verified 🩵** role.

**Required permissions when inviting:**
- Manage Roles ✅ (so it can give Verified)
- Read Messages / View Channels ✅
- Send Messages ✅
- Embed Links ✅
- Use External Emoji ✅
- Add Reactions ✅
- Use Application Commands ✅
- Manage Messages ✅ (only inside `#verify` — to keep it clean)

**Configure inside Auth's dashboard:**
- Verification channel: `#verify`
- Role to assign on success: **Verified 🩵**
- Verification type: Captcha + button (most resistant to bots)
- Welcome DM: optional, but if enabled, point them to `#rules` then `#welcome`.

---

### 5.2) Collab.Land (NFT wallet verification) — invite SECOND

**Purpose:** Verified members go to `#holder-verify`, click the Collab.Land button, sign a wallet message, and if the wallet holds at least one $CNDY NFT they get **Holder 🌌** role.

**Required permissions when inviting:**
- Manage Roles ✅ (to assign Holder)
- Read Messages / View Channels ✅
- Send Messages ✅
- Embed Links ✅
- Use Application Commands ✅
- Manage Messages ✅ (to clean up join messages in `#holder-verify`)

**Configure inside Collab.Land's "Command Center":**
- Add a **Token Granted Role (TGR)**:
  - Chain: (your collection's chain — Ethereum / Solana / Polygon)
  - Contract address: your $CNDY contract
  - Minimum balance: 1
  - Role to grant: **Holder 🌌**
- Re-verification interval: every 24 hours (so a wallet that sells loses Holder).
- Verification channel: `#holder-verify`.

> Important: Collab.Land must be ABOVE the Holder role in the hierarchy or it cannot assign it.

---

### 5.3) Ticket Tool (support tickets) — invite THIRD

**Purpose:** A user clicks a button in `#open-tickets` → Ticket Tool creates a private channel that only the user, mods, and admin can see.

**Required permissions when inviting:**
- Manage Channels ✅ (to create ticket channels)
- Manage Roles ✅ (to set per-ticket overwrites)
- Read Messages / View Channels ✅
- Send Messages ✅
- Manage Messages ✅
- Embed Links ✅
- Attach Files ✅
- Read Message History ✅
- Use Application Commands ✅

**Configure inside Ticket Tool's dashboard:**
- Panel channel: `#open-tickets`
- Ticket category: a new **private** category called `🎫 | TICKETS` (only Mods + Admin + Ticket Tool can see — see section 7).
- Support roles: **Moderator ☁️** and **Admin 💗**.
- Ticket transcript channel: `#ticket-logs` (private, see section 7).
- Auto-close on inactivity: 48 hours.
- Ticket categories on the panel: General Question, Scam Report, Wallet Issue, Holder-only Issue.

---

### 5.4) Carl-bot (general moderation + automation) — invite LAST

**Purpose:** This is your "auto-team-member". Section 11 is dedicated to what it does.

**Required permissions when inviting:**
- Manage Roles ✅
- Manage Channels ✅
- Manage Messages ✅
- Manage Nicknames ✅
- Manage Webhooks ✅
- Kick Members ✅
- Ban Members ✅
- Timeout Members ✅
- Read Messages / View Channels ✅
- Send Messages ✅
- Embed Links ✅
- Attach Files ✅
- Add Reactions ✅
- Read Message History ✅
- Use External Emoji ✅
- Use Application Commands ✅
- View Audit Log ✅

**Do NOT give Carl-bot Administrator.** Compromised bot tokens with Admin = server destroyed.

---

## 6) BOT ROLE POSITIONING (CRITICAL)

After each bot joins, Discord auto-creates a role with the bot's name. Drag those roles into this exact vertical order (top = highest):

```
1.  💗 Admin
2.  ☁️ Moderator
3.  🤖 Carl-bot
4.  🤖 Auth
5.  🤖 Collab.Land
6.  🤖 Ticket Tool
7.  🌌 Holder
8.  🩵 Verified
9.  @everyone
```

**Why bots sit BELOW Moderator:** so the human team can override the bot if something goes wrong (e.g., remove a bot-applied role, kick the bot, etc.). **Why they sit ABOVE Holder/Verified:** so they can assign and remove those roles. Auth must be above Verified, Collab.Land must be above Holder.

---

## 7) PRIVATE STAFF & AUDIT CHANNELS YOU STILL NEED TO CREATE

These are NOT in your current channel list, but a healthy 30k-supply server needs them. Create one new private category and these channels inside it.

### New category: `🔒 | STAFF`

Visibility: **Only Admin 💗 and Moderator ☁️.** All bots that need to log into them should also be allowed.

| Channel | Purpose | Who can read | Who can write |
|---|---|---|---|
| `#staff-chat` | Mod team general discussion | Admin, Moderator | Admin, Moderator |
| `#staff-announcements` | You post directives to the team | Admin, Moderator | Admin only |
| `#mod-commands` | Mods run bot commands here so public channels stay clean | Admin, Moderator, all bots | Admin, Moderator |
| `#mod-logs` | Carl-bot logs every kick/ban/mute/role change here | Admin, Moderator, Carl-bot | Carl-bot only |
| `#message-logs` | Carl-bot logs every edited/deleted message | Admin, Moderator, Carl-bot | Carl-bot only |
| `#join-leave-logs` | Carl-bot logs every join/leave/role-add/role-remove | Admin, Moderator, Carl-bot | Carl-bot only |
| `#voice-logs` | (only if you add voice channels later) | Admin, Moderator, Carl-bot | Carl-bot only |
| `#scam-watch` | Carl-bot AutoMod posts here when it catches scam keywords/links | Admin, Moderator, Carl-bot | Carl-bot only |

### New category: `🎫 | TICKETS`

Visibility: **Only Admin 💗, Moderator ☁️, and Ticket Tool bot.** Each opened ticket becomes a temporary channel inside this category and is auto-permission'd by Ticket Tool to also include the user who opened it.

| Channel | Purpose |
|---|---|
| `#ticket-logs` | Ticket Tool posts the full transcript here when a ticket is closed |

> Both categories above should be placed at the BOTTOM of your category list so they don't visually clutter regular members' sidebar (they can't see them anyway).

---

## 8) CATEGORY-LEVEL PERMISSIONS

Discord rule of thumb: **Set permissions at the category level**, then let channels inherit. Only override at the channel level for special cases (section 9).

For each category below, right-click → **Edit Category → Permissions**. Add the listed roles and apply the listed overrides. Anything not mentioned should be left as the **gray "/" (neutral / inherit)** state.

Legend:
- ✅ = green check (Allow)
- ❌ = red X (Deny)
- ➖ = gray / (Neutral / inherit)

---

### 8.1) `💗 | VERIFY`

| Role | View Channel | Send Messages | Read Message History | Add Reactions |
|---|---|---|---|---|
| @everyone | ✅ | ❌ | ✅ | ❌ |
| Verified 🩵 | ❌ | ➖ | ➖ | ➖ |
| Holder 🌌 | ❌ | ➖ | ➖ | ➖ |
| Moderator ☁️ | ✅ | ✅ | ✅ | ✅ |
| Admin 💗 | ✅ | ✅ | ✅ | ✅ |
| Auth bot | ✅ | ✅ | ✅ | ✅ |

> This is the only category where `@everyone` can see anything. The moment a member gets the Verified role, this whole category disappears for them (because Verified has View Channel **explicitly denied** here).

---

### 8.2) `🌊 | START HERE`

| Role | View Channel | Send Messages |
|---|---|---|
| @everyone | ❌ | ❌ |
| Verified 🩵 | ✅ | ❌ (read-only by default; we will allow only in some channels via overrides — see 9) |
| Holder 🌌 | ✅ | ❌ |
| Moderator ☁️ | ✅ | ✅ |
| Admin 💗 | ✅ | ✅ |

---

### 8.3) `❄️ | THE UNIVERSE`

Same template as 8.2 — entire category is read-only for the community, write-only for staff.

| Role | View Channel | Send Messages |
|---|---|---|
| @everyone | ❌ | ❌ |
| Verified 🩵 | ✅ | ❌ |
| Holder 🌌 | ✅ | ❌ |
| Moderator ☁️ | ✅ | ✅ |
| Admin 💗 | ✅ | ✅ |

---

### 8.4) `📌 | COMMUNITY`

This is where conversation happens — most channels writable, but `#whimsey-of-the-day` is staff-only-write (handled at channel level in section 9).

| Role | View Channel | Send Messages | Add Reactions | Attach Files | Embed Links |
|---|---|---|---|---|---|
| @everyone | ❌ | ❌ | ❌ | ❌ | ❌ |
| Verified 🩵 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Holder 🌌 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Moderator ☁️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin 💗 | ✅ | ✅ | ✅ | ✅ | ✅ |

---

### 8.5) `🌌 | HOLDERS ONLY`

This category is special: Verified people see ONLY `#holder-verify`, Holders see all three channels. We achieve this by hiding the category from Verified at the category level, then **explicitly allowing Verified to see `#holder-verify` at the channel level** (section 9.5).

| Role | View Channel | Send Messages |
|---|---|---|
| @everyone | ❌ | ❌ |
| Verified 🩵 | ❌ (overridden per-channel — see 9.5) | ❌ |
| Holder 🌌 | ✅ | ✅ |
| Moderator ☁️ | ✅ | ✅ |
| Admin 💗 | ✅ | ✅ |
| Collab.Land bot | ✅ | ✅ |

---

### 8.6) `🌷 | COLLECTORS`

All three channels are conversational. Available to both Verified and Holder.

| Role | View Channel | Send Messages | Add Reactions | Attach Files | Embed Links |
|---|---|---|---|---|---|
| @everyone | ❌ | ❌ | ❌ | ❌ | ❌ |
| Verified 🩵 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Holder 🌌 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Moderator ☁️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin 💗 | ✅ | ✅ | ✅ | ✅ | ✅ |

---

### 8.7) `🩵 | EVENTS`

Channel-level overrides will make these mostly read-only with reactions allowed (section 9.7).

| Role | View Channel | Send Messages | Add Reactions |
|---|---|---|---|
| @everyone | ❌ | ❌ | ❌ |
| Verified 🩵 | ✅ | ❌ | ✅ |
| Holder 🌌 | ✅ | ❌ | ✅ |
| Moderator ☁️ | ✅ | ✅ | ✅ |
| Admin 💗 | ✅ | ✅ | ✅ |

---

### 8.8) `☁️ | SUPPORT`

| Role | View Channel | Send Messages | Add Reactions |
|---|---|---|---|
| @everyone | ❌ | ❌ | ❌ |
| Verified 🩵 | ✅ | ❌ (per-channel overrides in 9.8) | ✅ |
| Holder 🌌 | ✅ | ❌ | ✅ |
| Moderator ☁️ | ✅ | ✅ | ✅ |
| Admin 💗 | ✅ | ✅ | ✅ |
| Ticket Tool bot | ✅ | ✅ | ✅ |

---

### 8.9) `🔒 | STAFF` (private)

| Role | View Channel |
|---|---|
| @everyone | ❌ |
| Verified 🩵 | ❌ |
| Holder 🌌 | ❌ |
| Moderator ☁️ | ✅ |
| Admin 💗 | ✅ |
| Carl-bot | ✅ |

---

### 8.10) `🎫 | TICKETS` (private)

| Role | View Channel |
|---|---|
| @everyone | ❌ |
| Verified 🩵 | ❌ |
| Holder 🌌 | ❌ |
| Moderator ☁️ | ✅ |
| Admin 💗 | ✅ |
| Ticket Tool | ✅ |

---

## 9) CHANNEL-LEVEL OVERRIDES (only the channels that need special rules)

Channels not listed here just inherit from their category. Don't touch them.

### 9.1) `#verify` (in 💗 | VERIFY)
| Role | Override |
|---|---|
| @everyone | View Channel ✅, Send Messages ❌, Add Reactions ❌, Use Application Commands ✅ (so they can click Auth's button) |
| Auth bot | Send Messages ✅, Embed Links ✅, Manage Messages ✅ |

### 9.2) `#access-info` (in 💗 | VERIFY)
| Role | Override |
|---|---|
| @everyone | View Channel ✅, Send Messages ❌, Add Reactions ❌ |
| Admin 💗 | Send Messages ✅ |

### 9.3) `#welcome`, `#rules`, `#announcements` (in 🌊 | START HERE)
- `#welcome` and `#rules`: read-only for everyone. Only Admin posts.
  - Verified 🩵: View ✅, Send ❌, Add Reactions ✅
- `#announcements`: read-only + reactions allowed.
  - Verified 🩵 + Holder 🌌: View ✅, Send ❌, Add Reactions ✅
  - Also turn ON **"Announcement Channel"** (Edit Channel → toggle "Announcement Channel"). This lets followers from other servers cross-post your announcements — useful for partnerships.

### 9.4) `#whimsey-of-the-day` (in 📌 | COMMUNITY)
| Role | Override |
|---|---|
| Verified 🩵 | Send Messages ❌, Add Reactions ✅ |
| Holder 🌌 | Send Messages ❌, Add Reactions ✅ |
| Moderator ☁️ | Send Messages ✅ |

> Optional: turn this into a Discord **Forum channel** instead of a text channel — each "Whimsey of the day" becomes its own thread that the community can react to and reply in without flooding a main channel.

### 9.5) `🌌 | HOLDERS ONLY` channels — THE TRICKY ONE

**`#holder-verify`** (must be visible to Verified so they can verify wallet):
| Role | Override |
|---|---|
| Verified 🩵 | View Channel ✅, Send Messages ❌, Use Application Commands ✅ (so they can click Collab.Land's button) |
| Holder 🌌 | View Channel ✅, Send Messages ❌ |
| Collab.Land bot | View ✅, Send Messages ✅, Embed Links ✅, Manage Messages ✅ |

**`#holder-chat`** (Holders only):
| Role | Override |
|---|---|
| Verified 🩵 | View Channel ❌ |
| Holder 🌌 | View Channel ✅, Send Messages ✅, Add Reactions ✅, Attach Files ✅, Embed Links ✅ |

**`#holder-announcements`** (Holders only, read-only):
| Role | Override |
|---|---|
| Verified 🩵 | View Channel ❌ |
| Holder 🌌 | View Channel ✅, Send Messages ❌, Add Reactions ✅ |
| Admin 💗 | Send Messages ✅ |
- Also enable **"Announcement Channel"** toggle.

### 9.6) `🌷 | COLLECTORS` channels
- `#trading-post`: enable **Slowmode 30s** (prevents spam pump posts).
- `#market-talk`: enable **Slowmode 10s**.
- `#show-your-whimsey`: no overrides needed; inherits cleanly.

### 9.7) `🩵 | EVENTS` channels
- `#giveaways`:
  - Verified + Holder: Send Messages ❌, Add Reactions ✅, Use Application Commands ✅ (to enter giveaways)
  - Carl-bot: Send Messages ✅, Embed Links ✅, Manage Messages ✅
- `#polls`:
  - Verified + Holder: Send Messages ❌, Add Reactions ✅, Use Application Commands ✅
  - Carl-bot: Send Messages ✅

### 9.8) `☁️ | SUPPORT` channels
- `#support`: Verified + Holder can Send Messages ✅ (general help asking).
- `#faqs`: read-only. Verified + Holder Send Messages ❌, Add Reactions ✅.
- `#scam-alerts`: read-only. Verified + Holder Send Messages ❌, Add Reactions ✅. Admin and Carl-bot can send (Carl-bot will auto-post AutoMod hits here too if you wire it).
- `#open-tickets`: Verified + Holder Send Messages ❌, but Use Application Commands ✅ (so they can click the Ticket Tool button).
  - Ticket Tool: Send Messages ✅, Embed Links ✅, Manage Messages ✅, Manage Channels ✅.

---

## 10) VERIFICATION FLOW — EXACT BOT CONFIGURATION

This is a recap of what each bot does at each stage:

**Stage 1 — Auth bot in `#verify`:**
1. New joiner lands → sees `#access-info` first (it's the top channel of the only visible category).
2. They read instructions → click into `#verify`.
3. Auth bot posts an embed with a button "Verify" or shows a captcha.
4. On success, Auth assigns **Verified 🩵**.
5. Because Verified has View Channel ❌ on the VERIFY category, the whole VERIFY category disappears for them and the rest of the server appears.

**Stage 2 — Collab.Land in `#holder-verify`:**
1. Verified user navigates to `🌌 | HOLDERS ONLY → #holder-verify` (only channel they see in that category).
2. Collab.Land's panel shows a "Connect Wallet" button.
3. User connects wallet, signs a message (no gas, no funds moved).
4. Collab.Land checks the $CNDY contract for that wallet's balance.
5. If balance ≥ 1 → assigns **Holder 🌌**.
6. `#holder-chat` and `#holder-announcements` appear for them.
7. Re-verify every 24h. If they sell their NFT, role auto-removes.

**Stage 3 — Ticket Tool in `#open-tickets`:**
1. Member clicks the panel button → Ticket Tool creates `ticket-username` inside `🎫 | TICKETS`.
2. Channel is visible only to that member, Admin, Moderator, and Ticket Tool.
3. On close, transcript is posted to `#ticket-logs`.

---

## 11) CARL-BOT — WHAT IT DOES FOR YOU WHEN YOU'RE AWAY

This is the most powerful bot in your stack. It's basically an automated junior moderator. Here's what to set up in its dashboard (carl.gg) — each item directly answers your "how will it manage the server on my behalf" question.

### 11.1) AutoMod (replaces a 24/7 mod for the basics)
- **Anti-invite**: auto-delete any non-WHIMSEY Discord invite link. Action: delete + warn. After 3 warns: 1-hour timeout.
- **Anti-link**: in non-staff channels, auto-delete suspicious crypto/scam links. Whitelist your official site, OpenSea/Magic Eden listing, and Twitter.
- **Anti-spam**: 5 messages in 3 seconds → timeout 10 min + log to `#mod-logs`.
- **Anti-mention spam**: more than 5 mentions in one message → delete + timeout.
- **Anti-caps**: messages with >70% caps → delete (warning only).
- **Banned words filter**: paste a scam-keyword list ("free mint", "claim airdrop", "dm me for", "support team here", etc.). Action: delete + alert in `#scam-watch`.
- **NSFW image filter**: auto-delete + 24h timeout.

### 11.2) Logging (so you have a paper trail)
Bind Carl-bot's logging to:
- `#mod-logs` → kicks, bans, timeouts, role changes
- `#message-logs` → edited & deleted messages
- `#join-leave-logs` → joins, leaves, role adds/removes
- `#scam-watch` → AutoMod hits

### 11.3) Reaction roles (lets users self-pick optional roles)
Add a `#roles` channel inside `🌊 | START HERE` (optional but recommended) with reaction roles like:
- 🔔 Announcement Pings
- 🎉 Giveaway Pings
- 🗳️ Poll Pings
- 🧑‍🎨 Fan Artist (lights up when you do art calls)

This way `@everyone` doesn't get pinged for non-critical updates.

### 11.4) Auto-moderation responses
- Auto-respond to "how do I verify" with the link to `#access-info`.
- Auto-respond to "is this real" or "is this a scam" with the link to `#scam-alerts`.

### 11.5) Scheduled messages
- Daily reminder to `#whimsey-of-the-day` ("post your daily Whimsey!").
- Weekly reminder to `#rules` ("Reminder: never DM the team. We will never DM you first.").

### 11.6) Slow-mode automation
- Auto-enable slowmode in `#general-chat` if more than 30 messages/minute (raid-like).

### 11.7) Welcome messages
- DM new joiners pointing them to `#access-info`.
- Optionally a welcome banner to `#welcome` after they verify.

> **Bottom line:** When you're asleep / busy, Carl-bot deletes scams, mutes spammers, logs everything to staff channels, answers FAQs, runs your reaction roles, and pings you/mods only for serious cases.

---

## 12) PRE-LAUNCH TEST CHECKLIST (DO NOT SKIP)

Use a **second Discord account** (not yours) and walk through this. Tick each box.

**Unverified user test:**
- [ ] On join, I see ONLY the `💗 | VERIFY` category.
- [ ] I land first on `#access-info` and can read it.
- [ ] I can click into `#verify` and complete Auth's verification.
- [ ] After verifying, the VERIFY category disappears.
- [ ] All public categories (START HERE → SUPPORT) appear.
- [ ] In `🌌 | HOLDERS ONLY` I see ONLY `#holder-verify`. I do NOT see `#holder-chat` or `#holder-announcements`.
- [ ] I cannot send messages in `#welcome`, `#rules`, `#announcements`, any UNIVERSE channel, `#whimsey-of-the-day`, `#holder-announcements`, `#faqs`, `#scam-alerts`, `#giveaways`, `#polls`.
- [ ] I CAN send messages in `#general-chat`, `#whimsey-talk`, `#fan-creations`, `#suggestions`, `#show-your-whimsey`, `#trading-post`, `#market-talk`, `#support`.
- [ ] I cannot see `🔒 | STAFF` or `🎫 | TICKETS`.

**Holder test (use a wallet that owns a $CNDY NFT, or temporarily lower Collab.Land's threshold to 0 for testing then change back):**
- [ ] After Collab.Land assigns Holder 🌌, `#holder-chat` and `#holder-announcements` appear.
- [ ] I can send messages in `#holder-chat`.
- [ ] I cannot send messages in `#holder-announcements`.

**Sale-to-no-Holder test (advanced):**
- [ ] If wallet no longer holds $CNDY, after the next Collab.Land re-verify (24h), Holder role is removed and the holder-only channels disappear. (You can force a manual re-verify to test.)

**Mod test (use a Mod account):**
- [ ] Sees everything Verified + Holder sees.
- [ ] Sees `🔒 | STAFF` and `🎫 | TICKETS`.
- [ ] Can delete a message in `#general-chat`.
- [ ] Can timeout a user.
- [ ] Cannot kick the Admin.

**Bot tests:**
- [ ] Auth posts the verification panel in `#verify`.
- [ ] Collab.Land posts the wallet panel in `#holder-verify`.
- [ ] Ticket Tool posts the ticket panel in `#open-tickets`. Clicking creates a ticket inside `🎫 | TICKETS`.
- [ ] Closing the ticket posts a transcript in `#ticket-logs`.
- [ ] Carl-bot logs deletes/edits in `#message-logs`, joins in `#join-leave-logs`, mod actions in `#mod-logs`.
- [ ] Pasting a fake Discord invite link in `#general-chat` → auto-deleted by Carl-bot, alert in `#scam-watch`.
- [ ] Pasting "free mint claim now" in `#general-chat` → auto-deleted.

**Leak test (the most important):**
- [ ] As Verified, I cannot read message history in `#holder-chat` (try the URL trick: paste a guessed channel URL — should 404).
- [ ] As @everyone (logged out / new account), I cannot see anything except VERIFY.
- [ ] As Verified, I cannot @mention `@everyone`, `@here`, or `@Moderator`.

---

## 13) EXTRA POLISH TASKS FOR A 30,000-SUPPLY LAUNCH

Things that separate Doodles/Cool Cats/Pudgy-tier servers from a generic NFT server:

1. **Server icon, splash, and banner** — high-res WHIMSEY artwork. Banner needs Boost Level 2.
2. **Server invite splash** — the image people see on the invite preview before joining. Boost Level 2.
3. **Vanity URL** — `discord.gg/whimsey` if available. Boost Level 3.
4. **Custom emoji & stickers** — upload 30-50 WHIMSEY-themed reactions; gives the server its own visual language.
5. **Soundboard sounds** — short signature sounds for hype moments (Boost Level 2).
6. **Onboarding (Server Settings → Onboarding)** — Discord's native interest-tag picker (e.g. "I'm a holder", "I'm an artist", "I'm here for trading"). Massively improves new-user funnel.
7. **Channel & Role Subscriptions / Premium Memberships** — optional revenue/perks layer if you want.
8. **Apply for Server Discovery** (only after verification + Onboarding is set up) so people searching "NFT" can find WHIMSEY.
9. **Apply for the Verified Server checkmark** once you have ≥1000 members (helps trust).
10. **Stage channel** for AMAs (Town-hall style).
11. **Events tab** — pre-schedule mints, AMAs, giveaways using the native Events feature so users can RSVP.
12. **Pinned messages** in every channel: in `#general-chat` pin the rules/links, in `#holder-chat` pin the holder code-of-conduct, in `#trading-post` pin a "we are not responsible for trades" disclaimer.
13. **A rules embed in `#rules`** (use Carl-bot's `?embed` command) — looks pro, not like a wall of text.
14. **Anti-impersonator nickname filter** in Carl-bot — auto-rename anyone who sets nickname to "Admin", "WHIMSEY Support", etc.
15. **Two-factor authentication for moderation** — Server Settings → Safety Setup → require 2FA for moderation actions. Mods MUST have 2FA on their Discord account or they can't ban/kick.
16. **Backup the server** — save the role list, channel list, and all permission overrides as a doc (this file is a great start). If the server is ever nuked, you can rebuild from this.
17. **Audit-log review schedule** — once a week, scroll through Server Settings → Audit Log to spot anomalies.
18. **Holder snapshot bot** (optional, beyond your 4 bots): Vulcan or Hashlist for holder snapshots when doing whitelists / airdrops.
19. **Disable DMs from server members by default** — encourage holders to do this in their personal Discord settings to prevent scam DMs (post this guide in `#scam-alerts`).
20. **A "We will NEVER DM you first" pin in every public channel.** Single biggest scam vector for NFT communities.

---

## 14) GLOSSARY OF EVERY DISCORD PERMISSION USED

A quick translation so you know what each toggle in Discord actually does:

| Permission | What it controls |
|---|---|
| **Administrator** | Bypasses all other permissions. Only the Admin role and never a bot. |
| **View Channels** | Whether the role can see the channel exists at all. |
| **Manage Channels** | Create/edit/delete channels. |
| **Manage Roles** | Create/edit/delete/assign roles (only roles BELOW the user's highest role). |
| **Manage Server** | Edit server name, region, icon, AutoMod, etc. |
| **Manage Webhooks** | Create/edit webhooks (used by integrations). |
| **Manage Nicknames** | Change other people's nicknames. |
| **Change Nickname** | Change own nickname. |
| **Manage Messages** | Delete/pin other people's messages. |
| **Manage Threads** | Archive/delete/lock threads. |
| **Send Messages** | Post in a text channel. |
| **Send Messages in Threads** | Post inside threads. |
| **Create Public Threads** | Start a public thread. |
| **Create Private Threads** | Start a thread only invited people see. |
| **Embed Links** | URLs you post are rendered as embeds with previews. |
| **Attach Files** | Upload files/images. |
| **Add Reactions** | React with new emoji to a message. |
| **Use External Emoji** | Use emoji from other servers. |
| **Use External Stickers** | Use stickers from other servers. |
| **Mention @everyone, @here, all roles** | Ping the entire server / all online / mass-ping any role. |
| **Read Message History** | See messages that existed before they joined the channel. |
| **Use Application Commands** | Use bot slash commands and click bot buttons. |
| **Send TTS Messages** | Text-to-speech messages (almost always disable). |
| **Kick Members** | Remove someone from the server (they can re-join). |
| **Ban Members** | Permanently remove + block re-join. |
| **Timeout Members** | Temporarily mute (1 minute to 28 days). |
| **View Audit Log** | See who did what (kicks, bans, role changes, channel edits). |
| **View Server Insights** | Server analytics dashboard. |
| **Connect / Speak / Mute / Deafen / Move** | Voice channel controls. |
| **Priority Speaker** | Lower volume of others when this person speaks. |
| **Manage Events** | Create/edit scheduled server events. |
| **Use Activities** | Voice-channel mini-games (YouTube Together, etc.). |

---

## ONE-LINE SUMMARY

**Lock everything down for `@everyone`, give Verified the public server, give Holder the exclusive corner, give Mod the staff area, keep Admin (you) on top, and let Auth + Collab.Land + Ticket Tool + Carl-bot run the day-to-day so you can sleep.** Run the test checklist with a second account before sharing the invite link.

You're ready to launch WHIMSEY. 💗
