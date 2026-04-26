# WHIMSEY ($CNDY) — Complete Discord Server Setup Reference (Ultra-Detailed)

> This is your **single source of truth** for setting up the WHIMSEY community server. Every permission name in this document is written **exactly as it appears in the Discord app** (e.g. `Send Messages and Create Posts`, not "Send Messages"). Follow it top to bottom in the order written. Do not skip steps. Do not change the order. The order is what guarantees nothing leaks.

---

## HOW TO READ THIS DOCUMENT

Discord uses two different permission widgets depending on where you are:

**1. Role-level (Server Settings → Roles → [Role] → Permissions tab):**
Each permission is a **simple ON/OFF toggle** (blue = ON, gray = OFF).

**2. Channel-level and Category-level (Edit Channel/Category → Permissions tab → Advanced permissions):**
Each permission is a **three-state toggle**:
- ❌ red X = **Deny** (overrides everything below; the role CANNOT do this here, even if granted server-wide)
- `/` gray slash = **Neutral / Inherit** (inherit from the next level up — for channels that means inherit from the category, and for categories that means inherit from the role's server-wide setting)
- ✅ green check = **Allow** (overrides denies from lower levels; the role CAN do this here)

**Discord's permission priority (highest wins):**
1. Server owner / Administrator permission — bypasses everything
2. Channel-level Allow ✅
3. Channel-level Deny ❌
4. Category-level Allow ✅ (inherited by channels left on Neutral)
5. Category-level Deny ❌ (inherited by channels left on Neutral)
6. Role-level server-wide ON
7. `@everyone` server-wide setting

**Throughout this document:**
- "ON" / "OFF" = role-level toggle
- "Allow ✅" / "Deny ❌" / "Neutral ➖" = channel- or category-level toggle

---

## TABLE OF CONTENTS

1. The 18-step setup order (do these in this exact order)
2. The member journey — the experience your permissions must produce
3. Server-wide safety configuration (Safety Setup, AutoMod, Onboarding, 2FA)
4. Role hierarchy — the exact vertical order (top → bottom)
5. Role 1 — `Admin 💗` — every permission, ON/OFF
6. Role 2 — `Moderator ☁️` — every permission, ON/OFF
7. Role 3 — `Holder 🌌` — every permission, ON/OFF
8. Role 4 — `Verified 🩵` — every permission, ON/OFF
9. `@everyone` — every permission, ON/OFF (the server-wide lockdown)
10. New private categories you must create (Staff + Tickets)
11. Bot 1 — Auth — invite permissions, hierarchy slot, configuration
12. Bot 2 — Collab.Land — invite permissions, hierarchy slot, configuration
13. Bot 3 — Ticket Tool — invite permissions, hierarchy slot, configuration
14. Bot 4 — Carl-bot — invite permissions, hierarchy slot, full configuration
15. Bot role positioning recap
16. Category 1 — `💗 | VERIFY` — full advanced-permissions table per role
17. Category 2 — `🌊 | START HERE` — full advanced-permissions table per role
18. Category 3 — `❄️ | THE UNIVERSE` — full advanced-permissions table per role
19. Category 4 — `📌 | COMMUNITY` — full advanced-permissions table per role
20. Category 5 — `🌌 | HOLDERS ONLY` — full advanced-permissions table per role
21. Category 6 — `🌷 | COLLECTORS` — full advanced-permissions table per role
22. Category 7 — `🩵 | EVENTS` — full advanced-permissions table per role
23. Category 8 — `☁️ | SUPPORT` — full advanced-permissions table per role
24. Category 9 — `🔒 | STAFF` (new private) — full table
25. Category 10 — `🎫 | TICKETS` (new private) — full table
26. Per-channel overrides — every channel that needs special rules
27. Verification flow — exact bot panel content + behavior
28. The Carl-bot operations playbook (what it does when you're away)
29. Pre-launch test checklist (with a second account)
30. Polish tasks for a 30,000-supply launch
31. Permission glossary — every Discord permission, plain English

---

## 1) THE 18-STEP SETUP ORDER

Tick each step as you finish it. Do NOT do them out of order.

- [ ] **Step 1.** Apply server-wide safety configuration (section 3).
- [ ] **Step 2.** Create the 4 roles (sections 5–8) with NO permissions toggled yet — just the name + color + display settings.
- [ ] **Step 3.** Drag the roles into the correct vertical order (section 4 — bots will be added later, but place the user roles now).
- [ ] **Step 4.** Configure `Admin 💗` permissions (section 5) — turn ON Administrator, done.
- [ ] **Step 5.** Configure `Moderator ☁️` permissions (section 6) — toggle every permission per the table.
- [ ] **Step 6.** Configure `Holder 🌌` permissions (section 7).
- [ ] **Step 7.** Configure `Verified 🩵` permissions (section 8).
- [ ] **Step 8.** Lock down `@everyone` (section 9). This is the most important step.
- [ ] **Step 9.** Create the 4 new private categories `🔒 | STAFF`, `📋 | AUDITS`, `📈 | MOMENTUM`, and `🎫 | TICKETS` and all the channels inside them (section 10).
- [ ] **Step 10.** Apply category-level permissions to ALL 12 categories (sections 16–25). Do all of these BEFORE touching individual channels.
- [ ] **Step 11.** Apply per-channel overrides only to the channels listed in section 26.
- [ ] **Step 12.** Invite Auth bot (section 11). Drag its role into position. Configure it.
- [ ] **Step 13.** Invite Collab.Land (section 12). Drag its role into position. Configure it.
- [ ] **Step 14.** Invite Ticket Tool (section 13). Drag its role into position. Configure it.
- [ ] **Step 15.** Invite Carl-bot (section 14). Drag its role into position. Configure it (this is the longest configuration).
- [ ] **Step 16.** Confirm the final bot role positioning (section 15).
- [ ] **Step 17.** Run the pre-launch test checklist with a second Discord account (section 29).
- [ ] **Step 18.** Polish tasks (section 30). Then publish the invite link.

---

## 2) THE MEMBER JOURNEY (WHAT YOUR PERMISSIONS MUST PRODUCE)

This is the experience your server has to enforce. Every permission decision below exists to make this story work.

**Stage 0 — A user clicks the invite link.**
- Discord shows them the membership-screening rules.
- They accept.
- They land in the server with only the `@everyone` role.

**Stage 1 — Brand-new joiner (only `@everyone`).**
- Sees ONLY the `💗 | VERIFY` category (everything else is hidden).
- The first channel visible at the top of their channel list is `#access-info`.
- They read `#access-info`, which tells them to go to `#verify`.
- In `#verify`, the Auth bot's panel is pinned at the top with a button.
- They click the button, complete a captcha.
- Auth bot assigns them the `Verified 🩵` role automatically.

**Stage 2 — `Verified 🩵` member.**
- The `💗 | VERIFY` category disappears completely.
- All public categories appear, in this order: `🌊 | START HERE` → `❄️ | THE UNIVERSE` → `📌 | COMMUNITY` → `🌌 | HOLDERS ONLY` (only `#holder-verify` visible) → `🌷 | COLLECTORS` → `🩵 | EVENTS` → `☁️ | SUPPORT`.
- They are auto-pointed to `#rules`. After reading, they go to `#welcome`.
- They can chat in `#general-chat`, `#whimsey-talk`, `#fan-creations`, `#suggestions`, `#show-your-whimsey`, `#trading-post`, `#market-talk`, `#support`.
- They can open private support tickets from `#open-tickets`.
- They can react (but not write) in `#announcements`, `#whimsey-of-the-day`, `#giveaways`, `#polls`, `#faqs`, `#scam-alerts`, and every channel in `❄️ | THE UNIVERSE`.
- If they want to claim Holder status, they go to `#holder-verify` and connect their wallet via Collab.Land.

**Stage 3 — `Holder 🌌` member (Collab.Land confirmed they own a $CNDY NFT).**
- `#holder-chat` and `#holder-announcements` appear inside `🌌 | HOLDERS ONLY`.
- They can chat in `#holder-chat` and react in `#holder-announcements`.
- Everything from Stage 2 still works.
- Collab.Land re-checks every 24 hours. If they sell their NFT, the role is auto-removed and the holder channels disappear again.

**Stage 4 — `Moderator ☁️` (your team).**
- Sees everything Holders see, plus the new private categories `🔒 | STAFF` and `🎫 | TICKETS`.
- Can delete messages, kick, ban, time out, manage threads, manage events.
- Cannot manage the server, manage roles, or grant Administrator.

**Stage 5 — `Admin 💗` (you).**
- Has Administrator. Bypasses every restriction. Sees everything.

The clarification on `#support` vs `#open-tickets` you asked for:
- **`#support`** is the OPEN public help channel. Members ASK questions here. Other members + mods + Carl-bot's auto-responder can answer publicly. Use it for "How do I verify?", "Where is the roadmap?" — public, repeated questions.
- **`#open-tickets`** is the entry point to PRIVATE 1-on-1 help. Members click the Ticket Tool button, which spawns a private channel inside `🎫 | TICKETS` only they + the team + Ticket Tool can see. Use it for sensitive issues — wallet problems, scam reports, holder verification failures, payment issues, harassment reports.

---

## 3) SERVER-WIDE SAFETY CONFIGURATION

Do this BEFORE touching roles. Open **Server Settings → Safety Setup**.

### 3.1) Verification Level
Set to **High** — "Member must also be registered on Discord for longer than 10 minutes."
- *Why:* blocks fresh throwaway accounts (the #1 vector for raid bots and scam bots in NFT servers).

### 3.2) Explicit Media Filter
Set to **Filter messages from all members**.
- *Why:* auto-deletes any image Discord's classifier flags as explicit. Your community will include minors and a clean filter is mandatory for Server Discovery later.

### 3.3) DM Spam Filter
Set to **Filter all direct messages**.
- *Why:* auto-scans DMs for spam/scam content. Doesn't stop DMs entirely (you can't, only the recipient can), but flags obvious scams.

### 3.4) Membership Screening (Server Settings → Membership Screening)
Enable it. Add these 3 questions/rules the user must agree to before joining:
1. "I have read the rules and will follow them."
2. "I understand the WHIMSEY team will NEVER DM me first."
3. "I will never share my wallet seed phrase with anyone — including anyone claiming to be the team."

### 3.5) Onboarding (Server Settings → Onboarding)
Enable it. Set up:
- **Default channels** new members see: only `#access-info` and `#verify`.
- **Customize-your-experience tags** (optional but recommended): "I'm a $CNDY holder", "I'm here for art", "I'm here to trade", "I'm here for community". These map to optional self-assigned roles you can add later.

### 3.6) AutoMod (Server Settings → AutoMod)
Turn ON these built-in rules:
- **Block commonly flagged words** — ON (preset 1: Sexual content, preset 2: Severe profanity, preset 3: Slurs).
- **Block mention spam** — ON. Set max mentions per message to **5**.
- **Block spam content** — ON.
- **Custom keyword filter** — create a new rule called `Scam keywords` and paste:
  - `free mint`, `claim airdrop`, `dm me for support`, `team support here`, `verify your wallet at`, `metamask support`, `phantom support`, `seed phrase`, `connect your wallet here`, `private mint pass`, `whitelist giveaway dm`, `you have been selected`
  - Action: **Block message** + **Send alert message** to `#scam-watch` (created in section 10).

### 3.7) Two-Factor Authentication for Moderation
**Server Settings → Safety Setup → Require 2FA for moderation actions** → ON.
- *Why:* Moderators MUST have 2FA enabled on their personal Discord account or they can't kick/ban/delete. Stops compromised mod accounts from nuking the server.

### 3.8) Community Server Settings (you said you've already enabled Community)
Make sure these are set:
- **Rules channel** → `#rules`
- **Community updates channel** → `#staff-announcements` (created in section 10) so Discord sends you platform updates privately
- **System messages channel** → `#welcome` (so the "X joined the server" banners land somewhere appropriate)

---

## 4) ROLE HIERARCHY — THE EXACT VERTICAL ORDER

After Step 2 you'll have only the user roles. After all 4 bots are invited, your hierarchy must look exactly like this (top = highest power):

```
1.   Admin 💗
2.   Moderator ☁️
3.   Carl-bot                  ← bot role auto-created when you invite Carl-bot
4.   Auth                       ← bot role auto-created when you invite Auth
5.   Collab.Land                ← bot role auto-created when you invite Collab.Land
6.   Ticket Tool                ← bot role auto-created when you invite Ticket Tool
7.   Holder 🌌
8.   Verified 🩵
9.   @everyone                  ← cannot be moved
```

**Why this order:**
- A role can only manage roles BELOW it. Bots inherit this rule.
- `Auth` MUST sit above `Verified 🩵` so it can assign that role.
- `Collab.Land` MUST sit above `Holder 🌌` so it can assign that role.
- `Carl-bot` sits above `Auth`/`Collab.Land`/`Ticket Tool` so it can manage them in emergencies (delete a stuck role, etc.).
- All bots sit BELOW `Moderator ☁️` so the human team can override / kick / re-invite the bot if it ever misbehaves or its token gets compromised.
- `Admin 💗` is always at the top.

To re-order: **Server Settings → Roles → drag with the handle on the left.**

---

## 5) ROLE 1 — `Admin 💗`

**Color:** Pink (use Discord's default pink, or hex `#FF66B2` for a custom one).
**Display role members separately from online members:** ✅ ON
**Allow anyone to @mention this role:** ❌ OFF
**Assigned to:** You.

**Permissions:** Toggle ON the single permission below. That's it. Administrator overrides every other check.

| Permission | ON / OFF |
|---|---|
| Administrator | **ON** |

> Discord will visually grey out the rest of the toggles once Administrator is ON, because they all become moot. Done.

---

## 6) ROLE 2 — `Moderator ☁️`

**Color:** Light blue / cloud (hex `#A8D8FF` or Discord's default light blue).
**Display role members separately from online members:** ✅ ON
**Allow anyone to @mention this role:** ❌ OFF (only Admin and other Mods should ping the team).
**Assigned to:** Your trusted team members.

Below is **every single permission Discord shows in the role editor**, in the exact order they appear, with the exact label, with ON/OFF + reasoning.

### General Server Permissions

| Permission | ON / OFF | Reasoning |
|---|---|---|
| View Channels | **ON** | They must see channels to moderate. |
| Manage Channels | **OFF** | Server structure is Admin-only. Prevents accidental channel deletion. |
| Manage Roles | **OFF** | Role assignment / hierarchy is Admin-only. |
| Create Expressions | **ON** | Lets them upload new emoji/stickers/sounds — useful for daily community management. |
| Manage Expressions | **ON** | Lets them remove inappropriate or outdated emoji. |
| View Audit Log | **ON** | Mandatory for investigating incidents. |
| View Server Insights | **ON** | Lets them see growth/engagement data so they can spot raids. |
| Manage Webhooks | **OFF** | Webhooks can be abused to impersonate the team. Admin-only. |
| Manage Server | **OFF** | Server name, region, AutoMod, vanity URL — Admin-only. |

### Membership Permissions

| Permission | ON / OFF | Reasoning |
|---|---|---|
| Create Invite | **ON** | Useful for partnerships, AMA guests, etc. |
| Change Nickname | **ON** | Personal use. |
| Manage Nicknames | **ON** | Lets them rename impersonators (e.g. someone setting their nick to "WHIMSEY Support"). |
| Kick, Approve and Reject Members | **ON** | Core mod power. Also lets them approve/reject membership-screening applicants. |
| Ban Members | **ON** | Core mod power. |
| Time out members | **ON** | Preferred over ban for first/minor offenses. |

### Text Channel Permissions

| Permission | ON / OFF | Reasoning |
|---|---|---|
| Send Messages and Create Posts | **ON** | They must talk. |
| Send Messages in Threads and Posts | **ON** | They must talk inside threads too. |
| Create Public Threads | **ON** | Let them spin off side conversations. |
| Create Private Threads | **ON** | For sensitive mod-only conversations inline. |
| Embed Links | **ON** | Posting links should render previews. |
| Attach Files | **ON** | Sharing screenshots in mod work. |
| Add Reactions | **ON** | Standard. |
| Use External Emojis | **ON** | Cross-server emoji usage. |
| Use External Stickers | **ON** | Cross-server sticker usage. |
| Mention @everyone, @here and All Roles | **ON** | Mods must be able to ping the server for emergencies (raid, scam, urgent announcement). |
| Manage Messages | **ON** | Delete spam/scams, pin important messages. |
| Pin Messages | **ON** | Pinning useful info in channels. |
| Bypass Slowmode | **ON** | Mods aren't rate-limited when answering rapid-fire questions. |
| Manage Threads and Posts | **ON** | Lock, archive, rename threads. |
| Read Message History | **ON** | Standard. |
| Send Text-to-speech Messages | **OFF** | Abuse risk; never needed. |
| Send Voice Messages | **ON** | Allowed if they want to send a quick audio reply. |
| Create Polls | **ON** | Useful for quick sentiment checks. |

### Voice Channel Permissions

> Even though you don't have voice channels yet, set these now so future voice channels Just Work.

| Permission | ON / OFF | Reasoning |
|---|---|---|
| Connect | **ON** | Must be able to join VC. |
| Speak | **ON** | Must be able to talk in VC. |
| Video | **ON** | Camera/screen-share for AMAs. |
| Use Soundboard | **ON** | Standard. |
| Use External Sounds | **ON** | Cross-server soundboard usage. |
| Use Voice Activity | **ON** | Standard (vs forced push-to-talk). |
| Priority Speaker | **ON** | Lowers others' volume when a mod talks during AMAs. |
| Mute Members | **ON** | Mod power. |
| Deafen Members | **ON** | Mod power. |
| Move Members | **ON** | Drag a disruptive user out of a VC. |
| Set Voice Channel Status | **ON** | Set the "what's happening in this VC" status. |

### Apps Permissions

| Permission | ON / OFF | Reasoning |
|---|---|---|
| Use Application Commands | **ON** | They run bot slash commands constantly. |
| Use Activities | **ON** | Discord's voice-channel mini-games (low risk). |
| Use External Apps | **OFF** | Blocks third-party apps a mod might have installed personally from posting in your server through their account. Reduces surface area. |

### Stage Channel Permissions

| Permission | ON / OFF | Reasoning |
|---|---|---|
| Request to Speak | **ON** | If you ever do a Stage AMA. |

### Events Permissions

| Permission | ON / OFF | Reasoning |
|---|---|---|
| Create Events | **ON** | They schedule giveaways, AMAs, mints. |
| Manage Events | **ON** | They edit/cancel them. |

### Advanced Permissions

| Permission | ON / OFF | Reasoning |
|---|---|---|
| Administrator | **OFF** | NEVER give Administrator to anyone but you. A compromised mod account with Administrator = server-ending event. |

---

## 7) ROLE 3 — `Holder 🌌`

**Color:** Galaxy purple (hex `#5B2A86`).
**Display role members separately from online members:** ❌ OFF
**Allow anyone to @mention this role:** ❌ OFF (only mods/admin should ping holders, e.g. for snapshot announcements).
**Assigned by:** Collab.Land bot (NEVER manually).

This role's power comes from **what it can SEE** (channel-level Allows in section 20), not from server-wide permissions. At the role level, Holders are basically a slightly trusted Verified — same toggles.

### General Server Permissions

| Permission | ON / OFF |
|---|---|
| View Channels | **ON** |
| Manage Channels | **OFF** |
| Manage Roles | **OFF** |
| Create Expressions | **OFF** |
| Manage Expressions | **OFF** |
| View Audit Log | **OFF** |
| View Server Insights | **OFF** |
| Manage Webhooks | **OFF** |
| Manage Server | **OFF** |

### Membership Permissions

| Permission | ON / OFF |
|---|---|
| Create Invite | **OFF** *(prevent unsanctioned invite spam from compromised holder accounts)* |
| Change Nickname | **ON** |
| Manage Nicknames | **OFF** |
| Kick, Approve and Reject Members | **OFF** |
| Ban Members | **OFF** |
| Time out members | **OFF** |

### Text Channel Permissions

| Permission | ON / OFF |
|---|---|
| Send Messages and Create Posts | **ON** |
| Send Messages in Threads and Posts | **ON** |
| Create Public Threads | **ON** |
| Create Private Threads | **OFF** *(prevents private group spaces that mods can't see)* |
| Embed Links | **ON** |
| Attach Files | **ON** |
| Add Reactions | **ON** |
| Use External Emojis | **ON** |
| Use External Stickers | **ON** |
| Mention @everyone, @here and All Roles | **OFF** |
| Manage Messages | **OFF** |
| Pin Messages | **OFF** |
| Bypass Slowmode | **OFF** |
| Manage Threads and Posts | **OFF** |
| Read Message History | **ON** |
| Send Text-to-speech Messages | **OFF** |
| Send Voice Messages | **ON** |
| Create Polls | **ON** |

### Voice Channel Permissions

| Permission | ON / OFF |
|---|---|
| Connect | **ON** |
| Speak | **ON** |
| Video | **ON** |
| Use Soundboard | **ON** |
| Use External Sounds | **ON** |
| Use Voice Activity | **ON** |
| Priority Speaker | **OFF** |
| Mute Members | **OFF** |
| Deafen Members | **OFF** |
| Move Members | **OFF** |
| Set Voice Channel Status | **OFF** |

### Apps Permissions

| Permission | ON / OFF |
|---|---|
| Use Application Commands | **ON** |
| Use Activities | **ON** |
| Use External Apps | **OFF** |

### Stage Channel Permissions

| Permission | ON / OFF |
|---|---|
| Request to Speak | **ON** |

### Events Permissions

| Permission | ON / OFF |
|---|---|
| Create Events | **OFF** |
| Manage Events | **OFF** |

### Advanced Permissions

| Permission | ON / OFF |
|---|---|
| Administrator | **OFF** |

---

## 8) ROLE 4 — `Verified 🩵`

**Color:** Sky blue (hex `#7EC8E3`).
**Display role members separately from online members:** ❌ OFF
**Allow anyone to @mention this role:** ❌ OFF.
**Assigned by:** Auth bot (NEVER manually).

The toggles below are **identical** to Holder. The Holder vs Verified split is enforced entirely by **channel visibility** (handled in sections 20 and 26), not by role-level toggles.

### General Server Permissions

| Permission | ON / OFF |
|---|---|
| View Channels | **ON** |
| Manage Channels | **OFF** |
| Manage Roles | **OFF** |
| Create Expressions | **OFF** |
| Manage Expressions | **OFF** |
| View Audit Log | **OFF** |
| View Server Insights | **OFF** |
| Manage Webhooks | **OFF** |
| Manage Server | **OFF** |

### Membership Permissions

| Permission | ON / OFF |
|---|---|
| Create Invite | **OFF** |
| Change Nickname | **ON** |
| Manage Nicknames | **OFF** |
| Kick, Approve and Reject Members | **OFF** |
| Ban Members | **OFF** |
| Time out members | **OFF** |

### Text Channel Permissions

| Permission | ON / OFF |
|---|---|
| Send Messages and Create Posts | **ON** |
| Send Messages in Threads and Posts | **ON** |
| Create Public Threads | **ON** |
| Create Private Threads | **OFF** |
| Embed Links | **ON** |
| Attach Files | **ON** |
| Add Reactions | **ON** |
| Use External Emojis | **ON** |
| Use External Stickers | **ON** |
| Mention @everyone, @here and All Roles | **OFF** |
| Manage Messages | **OFF** |
| Pin Messages | **OFF** |
| Bypass Slowmode | **OFF** |
| Manage Threads and Posts | **OFF** |
| Read Message History | **ON** |
| Send Text-to-speech Messages | **OFF** |
| Send Voice Messages | **ON** |
| Create Polls | **ON** |

### Voice Channel Permissions

| Permission | ON / OFF |
|---|---|
| Connect | **ON** |
| Speak | **ON** |
| Video | **ON** |
| Use Soundboard | **ON** |
| Use External Sounds | **ON** |
| Use Voice Activity | **ON** |
| Priority Speaker | **OFF** |
| Mute Members | **OFF** |
| Deafen Members | **OFF** |
| Move Members | **OFF** |
| Set Voice Channel Status | **OFF** |

### Apps Permissions

| Permission | ON / OFF |
|---|---|
| Use Application Commands | **ON** |
| Use Activities | **ON** |
| Use External Apps | **OFF** |

### Stage Channel Permissions

| Permission | ON / OFF |
|---|---|
| Request to Speak | **ON** |

### Events Permissions

| Permission | ON / OFF |
|---|---|
| Create Events | **OFF** |
| Manage Events | **OFF** |

### Advanced Permissions

| Permission | ON / OFF |
|---|---|
| Administrator | **OFF** |

---

## 9) `@everyone` — THE SERVER-WIDE LOCKDOWN

This is the most important table in the entire document. Every fresh joiner has only `@everyone`. We deny everything by default and re-grant access in specific places via roles + category overrides.

Open **Server Settings → Roles → @everyone → Permissions tab**.

### General Server Permissions

| Permission | ON / OFF | Reasoning |
|---|---|---|
| View Channels | **OFF** | Hides every channel by default. We will explicitly Allow ✅ View Channels for `@everyone` ONLY in the `💗 | VERIFY` category. |
| Manage Channels | **OFF** | |
| Manage Roles | **OFF** | |
| Create Expressions | **OFF** | |
| Manage Expressions | **OFF** | |
| View Audit Log | **OFF** | |
| View Server Insights | **OFF** | |
| Manage Webhooks | **OFF** | |
| Manage Server | **OFF** | |

### Membership Permissions

| Permission | ON / OFF | Reasoning |
|---|---|---|
| Create Invite | **OFF** | Stops any unverified joiner from making new invite links. |
| Change Nickname | **OFF** | Locks nickname until verified. |
| Manage Nicknames | **OFF** | |
| Kick, Approve and Reject Members | **OFF** | |
| Ban Members | **OFF** | |
| Time out members | **OFF** | |

### Text Channel Permissions

| Permission | ON / OFF | Reasoning |
|---|---|---|
| Send Messages and Create Posts | **OFF** | Total chat lockdown until verified. |
| Send Messages in Threads and Posts | **OFF** | |
| Create Public Threads | **OFF** | |
| Create Private Threads | **OFF** | |
| Embed Links | **OFF** | |
| Attach Files | **OFF** | |
| Add Reactions | **OFF** | |
| Use External Emojis | **OFF** | |
| Use External Stickers | **OFF** | |
| Mention @everyone, @here and All Roles | **OFF** | Critical — blocks mass-ping abuse. |
| Manage Messages | **OFF** | |
| Pin Messages | **OFF** | |
| Bypass Slowmode | **OFF** | |
| Manage Threads and Posts | **OFF** | |
| Read Message History | **OFF** | |
| Send Text-to-speech Messages | **OFF** | |
| Send Voice Messages | **OFF** | |
| Create Polls | **OFF** | |

### Voice Channel Permissions

| Permission | ON / OFF |
|---|---|
| Connect | **OFF** |
| Speak | **OFF** |
| Video | **OFF** |
| Use Soundboard | **OFF** |
| Use External Sounds | **OFF** |
| Use Voice Activity | **OFF** |
| Priority Speaker | **OFF** |
| Mute Members | **OFF** |
| Deafen Members | **OFF** |
| Move Members | **OFF** |
| Set Voice Channel Status | **OFF** |

### Apps Permissions

| Permission | ON / OFF | Reasoning |
|---|---|---|
| Use Application Commands | **OFF** | We will Allow ✅ this only inside `#verify` so the Auth button works. |
| Use Activities | **OFF** | |
| Use External Apps | **OFF** | |

### Stage Channel Permissions

| Permission | ON / OFF |
|---|---|
| Request to Speak | **OFF** |

### Events Permissions

| Permission | ON / OFF |
|---|---|
| Create Events | **OFF** |
| Manage Events | **OFF** |

### Advanced Permissions

| Permission | ON / OFF |
|---|---|
| Administrator | **OFF** |

> After this step, your second test account would join the server and see literally nothing (no channels, no categories). That's correct. We re-grant visibility per category in sections 16–25.

---

## 10) NEW PRIVATE CATEGORIES YOU MUST CREATE

You currently have 8 categories. Add these **4 NEW** categories for staff chat, granular event auditing, real-time momentum tracking, and ticket support. Position them at the **bottom of your category list** — regular members can't see them anyway, so it keeps the sidebar tidy for the team.

The audit philosophy here: **one channel per event type**, never mixed. That way if you ever need to investigate "what happened to that role last Tuesday" you go to ONE channel and scroll, instead of fishing through a wall of mixed logs.

### Category 9: `🔒 | STAFF`

The team's private discussion area. Kept lean — only chat-style channels. All logging lives in `📋 | AUDITS`.

| Channel | Type | Purpose |
|---|---|---|
| `#staff-chat` | Text | The team's private discussion space. |
| `#staff-announcements` | Announcement | You post directives to the team here. Mods can react but not post. |
| `#mod-commands` | Text | Mods run bot slash commands here so public channels stay clean. |
| `#staff-vc-text` | Text | Optional: text companion for a future staff voice channel. |

### Category 10: `📋 | AUDITS` (granular real-time event log)

Every event in the server gets captured here in its OWN channel — nothing is buried under unrelated noise. Carl-bot is the primary log writer; Discord's native AutoMod, Collab.Land, and Ticket Tool also feed their own. **Humans (including mods and you) should NEVER post here.** Logs must stay tamper-free for forensics.

#### User-action logs

| Channel | What gets logged | Source bot |
|---|---|---|
| `#audit-mod-actions` | Every kick, ban, timeout, unban, untimeout — by who, on who, with reason | Carl-bot |
| `#audit-messages` | Every edited message (before/after) and deleted message (full content + author) | Carl-bot |
| `#audit-joins-leaves` | Every join (with account-age stamp), every leave (with how-long-they-stayed) | Carl-bot |
| `#audit-role-changes` | Every role added or removed from a member, by who | Carl-bot |
| `#audit-nicknames` | Every nickname change | Carl-bot |
| `#audit-member-updates` | Username changes, avatar changes (impersonator detection) | Carl-bot |
| `#audit-voice` | VC joins, leaves, mutes, deafens, moves | Carl-bot |

#### Server-structure logs

| Channel | What gets logged | Source bot |
|---|---|---|
| `#audit-channels` | Channel created, renamed, edited, deleted; permission overwrite changes | Carl-bot |
| `#audit-roles` | Role created, renamed, recolored, deleted; role permission changes | Carl-bot |
| `#audit-server` | Server settings changes (name, region, AutoMod, vanity, icon, banner) | Carl-bot |
| `#audit-emoji-stickers` | Emoji / sticker / soundboard added, renamed, removed | Carl-bot |
| `#audit-threads-events` | Threads created/archived/deleted; scheduled events created/edited/cancelled | Carl-bot |
| `#audit-invites` | Every invite created (with creator + expiry), used (member-attribution), deleted | Carl-bot |
| `#audit-bots` | Bots, integrations, and webhooks added or removed | Carl-bot |

#### Safety logs

| Channel | What gets logged | Source |
|---|---|---|
| `#audit-automod` | Every Discord native AutoMod hit (spam, slurs, mention spam) | Discord native AutoMod |
| `#audit-scam-watch` | Every Carl-bot scam-keyword or scam-link hit | Carl-bot |

#### Holder / collection logs

| Channel | What gets logged | Source |
|---|---|---|
| `#audit-wallet-verifications` | Every Collab.Land wallet-verify attempt (success / failure / wallet address) | Collab.Land |
| `#audit-holder-changes` | Every `Holder 🌌` role grant or revoke | Carl-bot (mirrors Collab.Land actions) |

#### Ticket + boost logs

| Channel | What gets logged | Source |
|---|---|---|
| `#audit-tickets` | Every ticket opened/closed (one-line summary; full transcript still goes to `#ticket-logs`) | Ticket Tool |
| `#audit-boosts` | Every server boost added or removed (so you can thank the booster publicly) | Carl-bot |

> **Total in AUDITS: 17 channels.** Yes, it's a lot — but each is dead-quiet 95% of the time and screams loud when something matters. This is exactly how big NFT servers (Pudgy, Doodles, Cool Cats) keep clean trails.

### Category 11: `📈 | MOMENTUM` (server + collection real-time pulse)

Dashboards and recurring stats — the heartbeat of WHIMSEY. All channels here are bot-written on a schedule, read-only for the team. This is what you check every morning to know how the community + collection are doing.

| Channel | What lives here | Source |
|---|---|---|
| `#momentum-daily-recap` | Every day at 23:55 IST: joins, leaves, messages, active members, top 3 channels, top 3 contributors, AutoMod hits, tickets opened/closed | Carl-bot scheduled embed |
| `#momentum-weekly-recap` | Sunday 23:55 IST: weekly version + week-over-week % change | Carl-bot scheduled embed |
| `#momentum-monthly-recap` | Last day of month, 23:55 IST: month-over-month rollup | Carl-bot scheduled embed |
| `#momentum-holder-snapshot` | Daily 00:05 IST: total Holder count, new today, lost today, % of 30,000 supply verified-on-Discord, top-10-wallet concentration | Mod runs Collab.Land `/list-holders` (Carl-bot reminds at 00:00) |
| `#momentum-server-stats` | Live counts: total members, online now, Verified count, Holder count (auto-updated voice-channel-style or pinned embed) | Carl-bot custom command + manual refresh, or Statbot if you add it later |
| `#momentum-collection-feed` | (Optional, see section 32) Real-time on-chain sales, listings, transfers, mints of $CNDY | NFT-tracker bot — separate add-on |
| `#momentum-twitter-feed` | Your official @WHIMSEY tweets auto-mirrored here for team awareness | Webhook (IFTTT / Zapier / Make.com) |
| `#momentum-team-pulse` | Weekly Monday 12:00 IST: top 3 message-count members + top 3 reaction-receivers, so the team can recognize them in `#announcements` | Carl-bot scheduled |

### Category 12: `🎫 | TICKETS`

| Channel | Type | Purpose |
|---|---|---|
| `#ticket-logs` | Text | Ticket Tool posts the full transcript when a ticket is closed. |

> Each opened ticket becomes a temporary text channel inside this category automatically — Ticket Tool handles that. Don't create those manually.

All four new categories' permissions are configured in sections 24, 24A, 24B, and 25.

---

## 11) BOT 1 — `Auth` (verification gateway)

**Invite order:** 1st (invite this BEFORE the others).

### What it does
A new joiner enters `#verify`, clicks the Auth button, completes a captcha. Auth then assigns the `Verified 🩵` role.

### Required permissions when inviting
On the bot's invite page, tick exactly these:

| Permission | Required? | Why |
|---|---|---|
| Manage Roles | ✅ | To assign `Verified 🩵`. |
| View Channels | ✅ | To see `#verify`. |
| Send Messages | ✅ | To post the verify panel. |
| Embed Links | ✅ | The panel is an embed. |
| Use External Emojis | ✅ | For the captcha visuals. |
| Add Reactions | ✅ | If using reaction-based verify. |
| Manage Messages | ✅ | To clean up bot replies in `#verify`. |
| Read Message History | ✅ | Standard. |
| Use Application Commands | ✅ | Slash commands. |

### Hierarchy slot
Drag `Auth` to position **#4** (above `Verified 🩵`, below `Carl-bot`).

### Configuration (in Auth's web dashboard)
- **Verification channel:** `#verify`
- **Role to grant on success:** `Verified 🩵`
- **Verification method:** Captcha + button (image captcha is the most bot-resistant).
- **Re-verification on rejoin:** ON (forces them to verify again if they leave and re-join).
- **Welcome DM (optional):** "Welcome to WHIMSEY! Read `#rules` first, then say hi in `#welcome`. The team will NEVER DM you first — anyone who does is a scammer."

---

## 12) BOT 2 — `Collab.Land` (NFT wallet verification)

**Invite order:** 2nd.

### What it does
A `Verified 🩵` member opens `#holder-verify`, clicks the Collab.Land button, signs a wallet message (no funds moved, no gas), and if the wallet holds at least one $CNDY NFT, Collab.Land assigns the `Holder 🌌` role.

### Required permissions when inviting

| Permission | Required? | Why |
|---|---|---|
| Manage Roles | ✅ | To assign `Holder 🌌`. |
| View Channels | ✅ | To see `#holder-verify`. |
| Send Messages | ✅ | To post the wallet panel. |
| Embed Links | ✅ | Panel is an embed. |
| Manage Messages | ✅ | To clean up join messages. |
| Read Message History | ✅ | Standard. |
| Use Application Commands | ✅ | Slash commands. |

### Hierarchy slot
Drag `Collab.Land` to position **#5** (above `Holder 🌌`, below `Auth`).

### Configuration (Collab.Land "Command Center")
- **Add Token-Granted Role (TGR):**
  - Chain: (your collection's chain — Ethereum / Polygon / Solana)
  - Contract address: your $CNDY contract address
  - Minimum balance: **1**
  - Role granted: `Holder 🌌`
- **Verification channel:** `#holder-verify`
- **Re-verification interval:** **24 hours** (so wallets that sell lose Holder).
- **Force re-verify command:** keep enabled so mods can force a re-check.

---

## 13) BOT 3 — `Ticket Tool`

**Invite order:** 3rd.

### What it does
A member clicks the Ticket Tool panel button in `#open-tickets`, picks a ticket category, and Ticket Tool spawns a private channel inside `🎫 | TICKETS` visible only to the member, the staff, and Ticket Tool. When closed, a transcript posts to `#ticket-logs`.

### Required permissions when inviting

| Permission | Required? | Why |
|---|---|---|
| Manage Channels | ✅ | To create per-ticket channels. |
| Manage Roles | ✅ | To set per-ticket permission overwrites. |
| View Channels | ✅ | Standard. |
| Send Messages | ✅ | To post in tickets. |
| Manage Messages | ✅ | To pin / clean up tickets. |
| Embed Links | ✅ | Panel + transcripts are embeds. |
| Attach Files | ✅ | To upload transcript files. |
| Read Message History | ✅ | To build transcripts. |
| Use Application Commands | ✅ | Slash commands. |

### Hierarchy slot
Drag `Ticket Tool` to position **#6** (below `Collab.Land`, above `Holder 🌌`).

### Configuration (Ticket Tool dashboard)
- **Panel channel:** `#open-tickets`
- **Ticket category:** `🎫 | TICKETS` (the new category from section 10)
- **Support roles:** `Admin 💗` and `Moderator ☁️`
- **Transcript channel:** `#ticket-logs`
- **Auto-close inactive tickets after:** 48 hours
- **Ping support role on new ticket:** ON
- **Panel button categories:** create 4 buttons —
  1. **General Question** — for anything not covered elsewhere
  2. **Wallet / Holder Issue** — verification failed, wallet not detected
  3. **Scam Report** — to report a user who tried to scam them
  4. **Bug / Server Issue** — broken channels, stuck roles, etc.

---

## 14) BOT 4 — `Carl-bot`

**Invite order:** 4th (invite LAST, after the others are working).

### What it does
This is your auto-team-member. Section 28 has the full operations playbook.

### Required permissions when inviting

| Permission | Required? | Why |
|---|---|---|
| Manage Roles | ✅ | Reaction-roles, optional self-roles. |
| Manage Channels | ✅ | Slowmode automation. |
| Manage Messages | ✅ | AutoMod deletions. |
| Manage Nicknames | ✅ | Anti-impersonator nickname filter. |
| Manage Webhooks | ✅ | For its log channels. |
| Kick Members | ✅ | AutoMod escalation. |
| Ban Members | ✅ | AutoMod escalation. |
| Time out members | ✅ | First-line punishment. |
| View Channels | ✅ | Standard. |
| Send Messages | ✅ | To post logs and replies. |
| Embed Links | ✅ | Standard. |
| Attach Files | ✅ | Logs sometimes include attachments. |
| Add Reactions | ✅ | Reaction-role panels. |
| Read Message History | ✅ | Standard. |
| Use External Emojis | ✅ | Cross-server emoji in embeds. |
| Use Application Commands | ✅ | Slash commands. |
| View Audit Log | ✅ | Cross-references mod actions for logs. |

### Hierarchy slot
Drag `Carl-bot` to position **#3** (just below `Moderator ☁️`, above the other bots).

### Configuration
See section 28 — full Carl-bot operations playbook.

---

## 15) BOT ROLE POSITIONING — FINAL RECAP

After all 4 bots are invited and dragged, your role list (top → bottom) MUST look like:

```
1.   Admin 💗
2.   Moderator ☁️
3.   Carl-bot
4.   Auth
5.   Collab.Land
6.   Ticket Tool
7.   Holder 🌌
8.   Verified 🩵
9.   @everyone
```

If any of these are out of order, the bots will silently fail to assign or remove roles. Double-check with **Server Settings → Roles**.

---

# PART B — CATEGORY-LEVEL PERMISSIONS

For every category below, do this:
1. Right-click the category → **Edit Category** → **Permissions** tab.
2. The orange banner ("Heads up, @everyone does not have permission to view…") is expected. Click **Advanced permissions** to expand the full list.
3. Click the **+** next to "ROLES/MEMBERS" to add each role mentioned in the table.
4. For each row, set the three-state toggle to: ❌ Deny / ➖ Neutral / ✅ Allow.
5. For permissions NOT mentioned in a table, leave them on ➖ Neutral. They will inherit from the role's server-wide setting.
6. After saving, when you click any channel inside the category, you should see "**Permissions synced with category**" — that means the channel inherits the category's settings. If it says "**Sync Now**", click it for channels you have NOT given per-channel overrides to (section 26 lists the channels that need overrides — leave those unsynced).

> Reminder of label changes at category vs role vs channel level:
> - "Send Messages and Create Posts" appears at category level
> - "Send Messages" appears at single-channel level
> - "Manage Threads and Posts" at category level vs "Manage Threads" at single-channel level
> - "View Channels" at category level vs "View Channel" at single-channel level

---

## 16) CATEGORY 1 — `💗 | VERIFY`

**Visibility goal:** Visible ONLY to `@everyone` (unverified joiners). Disappears the moment a member gets `Verified 🩵`.

This is the only category where you give `@everyone` Allow ✅ on `View Channels` AND give `Verified 🩵` Deny ❌ on `View Channels`. The deny on Verified is what makes the category disappear after they verify.

### General Category Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Auth bot |
|---|---|---|---|---|---|---|
| View Channels | ✅ Allow | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Manage Channels | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| Manage Permissions | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| Manage Webhooks | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |

### Membership Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Auth bot |
|---|---|---|---|---|---|---|
| Create Invite | ❌ Deny | ➖ | ➖ | ➖ | ➖ | ➖ |

### Text Channel Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Auth bot |
|---|---|---|---|---|---|---|
| Send Messages and Create Posts | ❌ Deny | ➖ | ➖ | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Messages in Threads and Posts | ❌ Deny | ➖ | ➖ | ➖ | ➖ | ➖ |
| Create Public Threads | ❌ Deny | ➖ | ➖ | ➖ | ➖ | ➖ |
| Create Private Threads | ❌ Deny | ➖ | ➖ | ➖ | ➖ | ➖ |
| Embed Links | ❌ Deny | ➖ | ➖ | ✅ Allow | ✅ Allow | ✅ Allow |
| Attach Files | ❌ Deny | ➖ | ➖ | ➖ | ➖ | ➖ |
| Add Reactions | ❌ Deny | ➖ | ➖ | ➖ | ➖ | ➖ |
| Use External Emojis | ❌ Deny | ➖ | ➖ | ➖ | ➖ | ➖ |
| Use External Stickers | ❌ Deny | ➖ | ➖ | ➖ | ➖ | ➖ |
| Mention @everyone, @here and All Roles | ❌ Deny | ➖ | ➖ | ➖ | ➖ | ➖ |
| Manage Messages | ➖ | ➖ | ➖ | ✅ Allow | ✅ Allow | ✅ Allow |
| Pin Messages | ➖ | ➖ | ➖ | ✅ Allow | ✅ Allow | ➖ |
| Bypass Slowmode | ➖ | ➖ | ➖ | ✅ Allow | ✅ Allow | ➖ |
| Manage Threads and Posts | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| Read Message History | ✅ Allow | ➖ | ➖ | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Text-to-speech Messages | ❌ Deny | ➖ | ➖ | ➖ | ➖ | ➖ |
| Send Voice Messages | ❌ Deny | ➖ | ➖ | ➖ | ➖ | ➖ |
| Create Polls | ❌ Deny | ➖ | ➖ | ➖ | ➖ | ➖ |

### Apps Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Auth bot |
|---|---|---|---|---|---|---|
| Use Application Commands | ❌ Deny *(overridden Allow ✅ in `#verify` only — see section 26)* | ➖ | ➖ | ➖ | ➖ | ➖ |
| Use Activities | ❌ Deny | ➖ | ➖ | ➖ | ➖ | ➖ |
| Use External Apps | ❌ Deny | ➖ | ➖ | ➖ | ➖ | ➖ |

All other categories of permissions (Voice, Stage, Events) — leave Neutral ➖ for everyone.

---

## 17) CATEGORY 2 — `🌊 | START HERE`

**Visibility goal:** Hidden from `@everyone`. Visible (read-only by default) to `Verified 🩵` and `Holder 🌌`. Mods/Admin can post.

### General Category Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| View Channels | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |

### Membership Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| Create Invite | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |

### Text Channel Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| Send Messages and Create Posts | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Send Messages in Threads and Posts | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Create Public Threads | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Create Private Threads | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Embed Links | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Attach Files | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Add Reactions | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Use External Emojis | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Use External Stickers | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Mention @everyone, @here and All Roles | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Manage Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Pin Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Bypass Slowmode | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Manage Threads and Posts | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Read Message History | ✅ Allow *(safe; needed for everyone who can see it)* | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Text-to-speech Messages | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ |
| Send Voice Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Create Polls | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |

### Apps Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| Use Application Commands | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Use Activities | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Use External Apps | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ |

Voice, Stage, Events — Neutral ➖ for everyone.

---

## 18) CATEGORY 3 — `❄️ | THE UNIVERSE`

**Visibility goal:** Same as `🌊 | START HERE` — read-only for the community, write for staff. This is your "lore + collection info" library.

Use the **EXACT SAME table as section 17**. Apply identically.

(The only practical difference is staff posts much less often here — but the permission shape is the same.)

---

## 19) CATEGORY 4 — `📌 | COMMUNITY`

**Visibility goal:** Hidden from `@everyone`. Verified + Holder can chat freely. `#whimsey-of-the-day` is overridden to staff-write-only at the channel level (section 26).

### General Category Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| View Channels | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |

### Membership Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| Create Invite | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |

### Text Channel Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| Send Messages and Create Posts | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Messages in Threads and Posts | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Create Public Threads | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Create Private Threads | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Embed Links | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Attach Files | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Add Reactions | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Use External Emojis | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Use External Stickers | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Mention @everyone, @here and All Roles | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Manage Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Pin Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Bypass Slowmode | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Manage Threads and Posts | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Read Message History | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Text-to-speech Messages | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ |
| Send Voice Messages | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Create Polls | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |

### Apps Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| Use Application Commands | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Use Activities | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Use External Apps | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ |

Voice, Stage, Events — Neutral ➖ for everyone.

---

## 20) CATEGORY 5 — `🌌 | HOLDERS ONLY`

**Visibility goal:** This is the trickiest one. `@everyone` and `Verified 🩵` should NOT see this category by default — but `Verified 🩵` MUST be able to see ONE channel inside (`#holder-verify`) so they can claim Holder status. We achieve this by setting Verified to Deny ❌ on `View Channels` here at the category level, and then explicitly Allowing ✅ `View Channel` for Verified at the `#holder-verify` channel level (section 26).

### General Category Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Collab.Land |
|---|---|---|---|---|---|---|
| View Channels | ❌ Deny | ❌ Deny *(overridden Allow ✅ on `#holder-verify` only)* | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |

### Membership Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Collab.Land |
|---|---|---|---|---|---|---|
| Create Invite | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |

### Text Channel Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Collab.Land |
|---|---|---|---|---|---|---|
| Send Messages and Create Posts | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Messages in Threads and Posts | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ➖ |
| Create Public Threads | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ➖ |
| Create Private Threads | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Embed Links | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Attach Files | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ➖ |
| Add Reactions | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ➖ |
| Use External Emojis | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ➖ |
| Use External Stickers | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ➖ |
| Mention @everyone, @here and All Roles | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Manage Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Pin Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Bypass Slowmode | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Manage Threads and Posts | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Read Message History | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Text-to-speech Messages | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ |
| Send Voice Messages | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ➖ |
| Create Polls | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ➖ |

### Apps Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Collab.Land |
|---|---|---|---|---|---|---|
| Use Application Commands | ❌ Deny | ❌ Deny *(overridden Allow ✅ on `#holder-verify`)* | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Use Activities | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Use External Apps | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ |

Voice, Stage, Events — Neutral ➖.

---

## 21) CATEGORY 6 — `🌷 | COLLECTORS`

**Visibility goal:** Hidden from `@everyone`. Open chat for Verified + Holder. `#trading-post` and `#market-talk` get a slowmode override at the channel level (section 26).

Use the **SAME table as section 19** (`📌 | COMMUNITY`). The behavior is identical.

---

## 22) CATEGORY 7 — `🩵 | EVENTS`

**Visibility goal:** Hidden from `@everyone`. Verified + Holder can VIEW + REACT but NOT send messages (because giveaways and polls work via reactions/buttons, not chat).

### General Category Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| View Channels | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |

### Membership Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| Create Invite | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |

### Text Channel Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| Send Messages and Create Posts | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Send Messages in Threads and Posts | ❌ Deny | ✅ Allow *(so they can discuss inside event threads)* | ✅ Allow | ✅ Allow | ✅ Allow |
| Create Public Threads | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Create Private Threads | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Embed Links | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Attach Files | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Add Reactions | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Use External Emojis | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Use External Stickers | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Mention @everyone, @here and All Roles | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Manage Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Pin Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Bypass Slowmode | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Manage Threads and Posts | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Read Message History | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Text-to-speech Messages | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ |
| Send Voice Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Create Polls | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |

### Apps Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| Use Application Commands | ❌ Deny | ✅ Allow *(needed for entering giveaways/polls)* | ✅ Allow | ✅ Allow | ✅ Allow |
| Use Activities | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Use External Apps | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ |

Voice, Stage, Events — Neutral ➖.

---

## 23) CATEGORY 8 — `☁️ | SUPPORT`

**Visibility goal:** Hidden from `@everyone`. Verified + Holder can read everything, can chat in `#support`, can react in `#faqs` and `#scam-alerts` (read-only), and can click the Ticket Tool button in `#open-tickets`.

This is where your `#support` vs `#open-tickets` clarification lives:
- `#support` = open public help. Verified + Holder + Mod + Admin can post.
- `#open-tickets` = entry to private 1-on-1 help. Verified + Holder cannot type, only click the bot button.

### General Category Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Ticket Tool |
|---|---|---|---|---|---|---|
| View Channels | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |

### Membership Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Ticket Tool |
|---|---|---|---|---|---|---|
| Create Invite | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |

### Text Channel Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Ticket Tool |
|---|---|---|---|---|---|---|
| Send Messages and Create Posts | ❌ Deny | ❌ Deny *(overridden Allow ✅ on `#support` — see section 26)* | ❌ Deny *(overridden Allow ✅ on `#support`)* | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Messages in Threads and Posts | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ➖ |
| Create Public Threads | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Create Private Threads | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Embed Links | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Attach Files | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Add Reactions | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ➖ |
| Use External Emojis | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ➖ |
| Use External Stickers | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Mention @everyone, @here and All Roles | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Manage Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Pin Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Bypass Slowmode | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Manage Threads and Posts | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Read Message History | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Text-to-speech Messages | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ |
| Send Voice Messages | ❌ Deny | ✅ Allow *(useful in `#support` if they want to explain a complex bug)* | ✅ Allow | ✅ Allow | ✅ Allow | ➖ |
| Create Polls | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |

### Apps Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Ticket Tool |
|---|---|---|---|---|---|---|
| Use Application Commands | ❌ Deny | ✅ Allow *(needed to click the Ticket Tool button)* | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Use Activities | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Use External Apps | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ |

Voice, Stage, Events — Neutral ➖.

---

## 24) CATEGORY 9 — `🔒 | STAFF` (NEW PRIVATE)

**Visibility goal:** Visible to ONLY `Admin 💗`, `Moderator ☁️`, and `Carl-bot`. Hidden from everyone else. This category is now lean — only chat-style channels live here. All event logging lives in `📋 | AUDITS` (section 24A).

### General Category Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Carl-bot |
|---|---|---|---|---|---|---|
| View Channels | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Manage Channels | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ |
| Manage Permissions | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ |
| Manage Webhooks | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ✅ Allow *(Carl-bot uses webhooks for logs)* |

### Text Channel Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Carl-bot |
|---|---|---|---|---|---|---|
| Send Messages and Create Posts | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Messages in Threads and Posts | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Embed Links | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Attach Files | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Add Reactions | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Use External Emojis | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Mention @everyone, @here and All Roles | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow *(team-wide pings)* | ✅ Allow | ➖ |
| Manage Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Pin Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Read Message History | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Create Polls | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |

### Apps Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Carl-bot |
|---|---|---|---|---|---|---|
| Use Application Commands | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Use Activities | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Use External Apps | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ |

All other rows — Neutral ➖.

---

## 24A) CATEGORY 10 — `📋 | AUDITS` (NEW PRIVATE — granular event log)

**Visibility goal:** Visible to ONLY `Admin 💗`, `Moderator ☁️`, `Carl-bot`, `Collab.Land`, and `Ticket Tool`. Hidden from everyone else. **Critical:** even though humans can VIEW these channels, they must NOT be able to send messages here. Only bots write. This protects the audit trail from being tampered with (or accidentally polluted).

### General Category Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Carl-bot | Collab.Land | Ticket Tool |
|---|---|---|---|---|---|---|---|---|
| View Channels | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Manage Channels | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ | ➖ | ➖ |
| Manage Permissions | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ | ➖ | ➖ |
| Manage Webhooks | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ✅ Allow | ➖ | ➖ |

### Membership Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Carl-bot | Collab.Land | Ticket Tool |
|---|---|---|---|---|---|---|---|---|
| Create Invite | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ | ➖ | ➖ |

### Text Channel Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Carl-bot | Collab.Land | Ticket Tool |
|---|---|---|---|---|---|---|---|---|
| Send Messages and Create Posts | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny *(humans must NOT pollute the audit trail)* | ✅ Allow *(only Admin can post a manual annotation if needed)* | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Messages in Threads and Posts | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Create Public Threads | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ | ➖ |
| Create Private Threads | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ | ➖ | ➖ |
| Embed Links | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Attach Files | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Add Reactions | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow *(let mods react ✅ "investigated" / 👀 "watching" on log entries)* | ✅ Allow | ➖ | ➖ | ➖ |
| Use External Emojis | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ | ➖ | ➖ |
| Use External Stickers | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ | ➖ | ➖ |
| Mention @everyone, @here and All Roles | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow *(so Carl-bot can ping @Moderator on a critical log entry — e.g. mass-ban detected)* | ➖ | ➖ |
| Manage Messages | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny *(NEVER let mods delete log entries)* | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Pin Messages | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ➖ | ➖ | ➖ |
| Bypass Slowmode | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Manage Threads and Posts | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ➖ | ➖ | ➖ |
| Read Message History | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Text-to-speech Messages | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ | ➖ |
| Send Voice Messages | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ | ➖ |
| Create Polls | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ | ➖ |

### Apps Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Carl-bot | Collab.Land | Ticket Tool |
|---|---|---|---|---|---|---|---|---|
| Use Application Commands | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny *(no slash commands here — keeps the trail pure)* | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Use Activities | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ | ➖ |
| Use External Apps | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ | ➖ |

All other rows — Neutral ➖.

> **Why mods are denied Send Messages here even though they're trusted:** an audit trail is only useful if it's untouched. If a mod could delete a log entry, they could cover up a mistake (or worse, an abuse). Keep humans out. Use reactions (✅ "investigated", 👀 "watching", ⚠️ "needs follow-up") to mark entries instead of replying.

---

## 24B) CATEGORY 11 — `📈 | MOMENTUM` (NEW PRIVATE — server + collection pulse)

**Visibility goal:** Same as AUDITS — visible to team + log-writing bots. Humans CAN post manual annotations here (unlike AUDITS), because Momentum is a dashboard you discuss, not a forensic trail.

### General Category Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Carl-bot | Collab.Land |
|---|---|---|---|---|---|---|---|
| View Channels | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Manage Channels | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ | ➖ |
| Manage Permissions | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ | ➖ |
| Manage Webhooks | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ✅ Allow *(for Twitter-feed webhook + scheduled embeds)* | ➖ |

### Text Channel Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Carl-bot | Collab.Land |
|---|---|---|---|---|---|---|---|
| Send Messages and Create Posts | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow *(mods can comment on a recap, e.g. "spike from the AMA")* | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Messages in Threads and Posts | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Create Public Threads | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ➖ |
| Embed Links | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Attach Files | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Add Reactions | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ➖ |
| Use External Emojis | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ | ➖ |
| Mention @everyone, @here and All Roles | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow *(useful for "@Moderator — recap is up")* | ✅ Allow | ✅ Allow | ➖ |
| Manage Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Pin Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow *(pin the most important monthly recap)* | ✅ Allow | ➖ | ➖ |
| Read Message History | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Create Polls | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow *(quick team votes on what to feature)* | ✅ Allow | ➖ | ➖ |

### Apps Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Carl-bot | Collab.Land |
|---|---|---|---|---|---|---|---|
| Use Application Commands | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow *(e.g. `/list-holders` posts here)* | ✅ Allow | ✅ Allow | ✅ Allow |
| Use Activities | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ |
| Use External Apps | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ |

All other rows — Neutral ➖.

---

## 25) CATEGORY 12 — `🎫 | TICKETS` (NEW PRIVATE)

**Visibility goal:** Visible to ONLY `Admin 💗`, `Moderator ☁️`, and `Ticket Tool`. Each opened ticket-channel inside this category will have ADDITIONAL per-channel overwrites added by Ticket Tool to also allow the user who opened the ticket — that's automatic, you don't configure it.

### General Category Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Ticket Tool |
|---|---|---|---|---|---|---|
| View Channels | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Manage Channels | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ✅ Allow *(needs to spawn ticket channels)* |
| Manage Permissions | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ✅ Allow *(needs to add the ticket-opener's overwrite)* |
| Manage Webhooks | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ |

### Text Channel Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Ticket Tool |
|---|---|---|---|---|---|---|
| Send Messages and Create Posts | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Messages in Threads and Posts | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Embed Links | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Attach Files | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Add Reactions | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Use External Emojis | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Mention @everyone, @here and All Roles | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ |
| Manage Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Pin Messages | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Read Message History | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |

### Apps Permissions

| Permission | @everyone | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 | Ticket Tool |
|---|---|---|---|---|---|---|
| Use Application Commands | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Use Activities | ❌ Deny | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ➖ |
| Use External Apps | ❌ Deny | ❌ Deny | ❌ Deny | ❌ Deny | ➖ | ➖ |

All other rows — Neutral ➖.

---

# PART C — PER-CHANNEL OVERRIDES

For every channel listed in this section, click the channel → Edit Channel → Permissions → Advanced permissions and apply the override(s) listed. Channels NOT listed here should be left as **Synced with category** (you'll see a "Permissions synced with category" banner — do not unsync them).

The exact permission labels at single-channel level are slightly shorter than at category level (e.g. "Send Messages" instead of "Send Messages and Create Posts", "Manage Threads" instead of "Manage Threads and Posts", "View Channel" singular instead of "View Channels" plural). I've used the channel-level labels below.

---

## 26) PER-CHANNEL OVERRIDES

### 26.1) `#access-info` (in `💗 | VERIFY`)

This is the very first thing a new joiner sees. Read-only.

| Permission | @everyone | Admin 💗 |
|---|---|---|
| View Channel | ✅ Allow | ✅ Allow |
| Read Message History | ✅ Allow | ✅ Allow |
| Send Messages | ❌ Deny | ✅ Allow |
| Add Reactions | ❌ Deny | ✅ Allow |
| Use Application Commands | ❌ Deny | ✅ Allow |

> Position this channel at the **top of the category** so it loads first when a new joiner arrives.

---

### 26.2) `#verify` (in `💗 | VERIFY`)

The Auth bot's button lives here. `@everyone` MUST be allowed to use application commands here only.

| Permission | @everyone | Auth bot | Admin 💗 |
|---|---|---|---|
| View Channel | ✅ Allow | ✅ Allow | ✅ Allow |
| Read Message History | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Messages | ❌ Deny | ✅ Allow | ✅ Allow |
| Embed Links | ❌ Deny | ✅ Allow | ✅ Allow |
| Add Reactions | ❌ Deny | ✅ Allow | ✅ Allow |
| Use Application Commands | ✅ Allow *(critical — so the Auth button works)* | ✅ Allow | ✅ Allow |
| Manage Messages | ❌ Deny | ✅ Allow | ✅ Allow |

---

### 26.3) `#welcome` (in `🌊 | START HERE`)

Read-only welcome channel. Inherits most settings from the category — you only need ONE override on `Admin 💗` for posting.

| Permission | Verified 🩵 | Holder 🌌 | Admin 💗 |
|---|---|---|---|
| Send Messages | ❌ Deny | ❌ Deny | ✅ Allow |
| Add Reactions | ✅ Allow | ✅ Allow | ✅ Allow |

> Pin a beautifully formatted welcome message here.

---

### 26.4) `#rules` (in `🌊 | START HERE`)

Read-only rules channel. Critical that nothing is editable.

| Permission | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|
| Send Messages | ❌ Deny | ❌ Deny | ❌ Deny *(even mods don't post here — only Admin)* | ✅ Allow |
| Add Reactions | ✅ Allow *(let them ✅ react to acknowledge)* | ✅ Allow | ✅ Allow | ✅ Allow |
| Manage Messages | ❌ Deny | ❌ Deny | ✅ Allow *(mods can edit/delete obsolete pinned content)* | ✅ Allow |

---

### 26.5) `#announcements` (in `🌊 | START HERE`)

This is an **Announcement Channel** (Discord channel type). Right-click → Edit Channel → toggle "Announcement Channel" ON. This lets followers from other servers cross-post your announcements.

| Permission | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|
| Send Messages | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Add Reactions | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Mention @everyone, @here and All Roles | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |

---

### 26.6) Every channel in `❄️ | THE UNIVERSE`

(`#about-whimsey`, `#whimsey-universe`, `#sneak-peeks`, `#roadmap`, `#official-links`)

These should all stay **Synced with category** — they inherit `🌊 | START HERE`'s read-only-for-community pattern (which is the same as section 18).

**Optional:** make `#official-links` an Announcement Channel too, so partner servers can mirror your verified-link list.

---

### 26.7) `#whimsey-of-the-day` (in `📌 | COMMUNITY`)

Staff posts the daily Whimsey here. Verified + Holder can react but not write.

| Permission | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|
| Send Messages | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Send Messages in Threads | ✅ Allow *(let them discuss the daily Whimsey inside threads)* | ✅ Allow | ✅ Allow | ✅ Allow |
| Add Reactions | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Create Public Threads | ❌ Deny *(only staff opens the daily thread)* | ❌ Deny | ✅ Allow | ✅ Allow |

> **Pro tip:** Convert this channel to a **Forum Channel** (Edit Channel → channel type). Each daily Whimsey becomes its own thread the community can discuss without flooding a chat channel.

---

### 26.8) `#suggestions` (in `📌 | COMMUNITY`)

Inherits the category. **Optional:** turn ON Slowmode 5 minutes via Edit Channel → Slowmode, so suggestions are thought-out.

---

### 26.9) `#holder-verify` (in `🌌 | HOLDERS ONLY`)

THE most important channel-level override in the whole document. This is the single channel where `Verified 🩵` must be able to see a HOLDERS ONLY channel, click the Collab.Land button, but NOT chat.

| Permission | Verified 🩵 | Holder 🌌 | Collab.Land | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| View Channel | ✅ Allow *(critical — overrides the category-level Deny on Verified)* | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Read Message History | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Messages | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Embed Links | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Add Reactions | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Use Application Commands | ✅ Allow *(critical — so the Collab.Land button works)* | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Manage Messages | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |

---

### 26.10) `#holder-chat` (in `🌌 | HOLDERS ONLY`)

Inherits the category — Verified is already Denied at category level, so the channel correctly stays hidden from them. No overrides needed.

But to be doubly safe, explicitly add:

| Permission | Verified 🩵 | Holder 🌌 |
|---|---|---|
| View Channel | ❌ Deny | ✅ Allow |
| Send Messages | ❌ Deny | ✅ Allow |
| Read Message History | ❌ Deny | ✅ Allow |

---

### 26.11) `#holder-announcements` (in `🌌 | HOLDERS ONLY`)

Holder-exclusive read-only announcement channel. Make this an **Announcement Channel** (Edit Channel → toggle "Announcement Channel" ON).

| Permission | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|
| View Channel | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Read Message History | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Messages | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow |
| Add Reactions | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Mention @everyone, @here and All Roles | ❌ Deny | ❌ Deny | ✅ Allow *(so mods can ping `@Holder`)* | ✅ Allow |

---

### 26.12) `#trading-post` (in `🌷 | COLLECTORS`)

Inherits the category. **Mandatory:** Edit Channel → Slowmode → set to **30 seconds** to prevent pump-and-dump spam.

Optional pinned message:

> ⚠️ **Trade at your own risk.** WHIMSEY does not facilitate or guarantee any trades made in this channel. Always verify the buyer/seller and use a trusted escrow.

---

### 26.13) `#market-talk` (in `🌷 | COLLECTORS`)

Inherits the category. **Mandatory:** Slowmode → **10 seconds**.

---

### 26.14) `#show-your-whimsey` (in `🌷 | COLLECTORS`)

Inherits the category. Optionally convert to a **Forum Channel** so each "show your Whimsey" post becomes its own thread.

---

### 26.15) `#giveaways` (in `🩵 | EVENTS`)

| Permission | Verified 🩵 | Holder 🌌 | Carl-bot | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| Send Messages | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Embed Links | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Add Reactions | ✅ Allow *(reacting is how you enter)* | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Use Application Commands | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Manage Messages | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |

---

### 26.16) `#polls` (in `🩵 | EVENTS`)

| Permission | Verified 🩵 | Holder 🌌 | Carl-bot | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| Send Messages | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Add Reactions | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Use Application Commands | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Create Polls | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |

---

### 26.17) `#support` (in `☁️ | SUPPORT`)

This is the open public help channel — Verified + Holder CAN write here. Override the category-level Deny.

| Permission | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|
| Send Messages | ✅ Allow *(overrides category Deny)* | ✅ Allow | ✅ Allow | ✅ Allow |
| Embed Links | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Attach Files | ✅ Allow *(so they can upload screenshots of issues)* | ✅ Allow | ✅ Allow | ✅ Allow |
| Add Reactions | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Use Application Commands | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Create Public Threads | ✅ Allow *(so each support question can have its own thread)* | ✅ Allow | ✅ Allow | ✅ Allow |

> **Mandatory:** Set Slowmode → **30 seconds** so people compose proper questions instead of one-line spam.

> **Pro tip:** Convert this channel to a **Forum Channel**. Each new help request becomes a thread that can be marked "✅ Solved" with Discord's tags. Way more organized at scale.

---

### 26.18) `#faqs` (in `☁️ | SUPPORT`)

Read-only knowledge base. Only Admin posts; mods can edit.

| Permission | Verified 🩵 | Holder 🌌 | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|
| Send Messages | ❌ Deny | ❌ Deny | ❌ Deny *(prevents mods from accidentally turning the FAQ into a chat)* | ✅ Allow |
| Add Reactions | ✅ Allow *(let people upvote which FAQs were helpful)* | ✅ Allow | ✅ Allow | ✅ Allow |
| Manage Messages | ❌ Deny | ❌ Deny | ✅ Allow *(mods can edit/pin)* | ✅ Allow |

---

### 26.19) `#scam-alerts` (in `☁️ | SUPPORT`)

Read-only scam-warning channel. This is also where Carl-bot can mirror its public-facing scam alerts (private logs go to `#scam-watch`).

| Permission | Verified 🩵 | Holder 🌌 | Carl-bot | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| Send Messages | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Add Reactions | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Mention @everyone, @here and All Roles | ❌ Deny | ❌ Deny | ✅ Allow *(scam alerts SHOULD ping everyone — they're urgent)* | ✅ Allow | ✅ Allow |

---

### 26.20) `#open-tickets` (in `☁️ | SUPPORT`)

Entry point to private 1-on-1 help. Members can ONLY click the Ticket Tool button — they cannot type or react.

| Permission | Verified 🩵 | Holder 🌌 | Ticket Tool | Moderator ☁️ | Admin 💗 |
|---|---|---|---|---|---|
| View Channel | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Read Message History | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Send Messages | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Embed Links | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Add Reactions | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |
| Use Application Commands | ✅ Allow *(critical — the Ticket Tool button)* | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Manage Messages | ❌ Deny | ❌ Deny | ✅ Allow | ✅ Allow | ✅ Allow |

> Pin a Ticket Tool panel embed at the top: "Need private help? Click a category below: General Question | Wallet/Holder Issue | Scam Report | Bug/Server Issue."

---

### 26.21) `#staff-announcements` (in `🔒 | STAFF`)

Read-only for mods, write for Admin only.

| Permission | Moderator ☁️ | Admin 💗 |
|---|---|---|
| Send Messages | ❌ Deny | ✅ Allow |
| Add Reactions | ✅ Allow | ✅ Allow |
| Mention @everyone, @here and All Roles | ❌ Deny | ✅ Allow |

---

### 26.22) Every channel inside `📋 | AUDITS`

All 17 audit channels stay **Synced with category** — they inherit section 24A's table exactly. Mods read, react, but cannot post; only the source bot for that channel writes.

The category-level table in section 24A is sufficient for **all** channels in this category. The only optional per-channel tweak: for the bot that "owns" each audit channel, you can additionally allow that specific bot to manage messages there (e.g. Collab.Land on `#audit-wallet-verifications`, Ticket Tool on `#audit-tickets`). This is already covered in section 24A.

> ⚠️ **Critical reminder:** even YOU as Admin should resist posting in audit channels. Use reactions to mark entries instead. The integrity of the trail is more valuable than any one comment.

#### 26.22a) `#audit-wallet-verifications` and `#audit-holder-changes` (additional Collab.Land binding)

Make sure Collab.Land has explicit Allow for these two:

| Permission | Collab.Land |
|---|---|
| Send Messages | ✅ Allow |
| Embed Links | ✅ Allow |
| Manage Messages | ✅ Allow |

#### 26.22b) `#audit-tickets` (additional Ticket Tool binding)

| Permission | Ticket Tool |
|---|---|
| Send Messages | ✅ Allow |
| Embed Links | ✅ Allow |
| Manage Messages | ✅ Allow |

#### 26.22c) `#audit-automod` (Discord native AutoMod target)

In **Server Settings → AutoMod → each rule** → set "Send alert message to channel" → `#audit-automod`. No per-channel override needed; native AutoMod posts as Discord itself, which always has access.

---

### 26.23) `#mod-commands` (in `🔒 | STAFF`)

Free-for-all bot-command playground for the team.

| Permission | Moderator ☁️ | Admin 💗 | Carl-bot | Auth | Collab.Land | Ticket Tool |
|---|---|---|---|---|---|---|
| Send Messages | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Embed Links | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Use Application Commands | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow | ✅ Allow |
| Manage Messages | ✅ Allow | ✅ Allow | ✅ Allow | ➖ | ➖ | ➖ |

---

### 26.24) `#ticket-logs` (in `🎫 | TICKETS`)

Ticket Tool dumps closed-ticket transcripts here.

| Permission | Moderator ☁️ | Admin 💗 | Ticket Tool |
|---|---|---|---|
| Send Messages | ❌ Deny | ✅ Allow | ✅ Allow |
| Embed Links | ❌ Deny | ✅ Allow | ✅ Allow |
| Attach Files | ❌ Deny | ✅ Allow | ✅ Allow |
| Read Message History | ✅ Allow | ✅ Allow | ✅ Allow |

---

### 26.25) Every channel inside `📈 | MOMENTUM`

All channels stay **Synced with category** — they inherit section 24B's table. The team CAN post comments on a recap (unlike AUDITS) so threads can grow under each daily/weekly report.

Two channels need a small extra binding:

#### 26.25a) `#momentum-twitter-feed` (webhook target)

When you set up the IFTTT/Zapier/Make webhook that posts your @WHIMSEY tweets here, Discord generates a webhook URL. The webhook itself bypasses role permissions — you just need the webhook to exist on this channel. No per-role override needed.

| Permission | Moderator ☁️ | Admin 💗 |
|---|---|---|
| Manage Webhooks | ❌ Deny | ✅ Allow *(only Admin manages webhooks for security)* |

#### 26.25b) `#momentum-collection-feed` (optional NFT-tracker bot — see section 32)

If you add a 5th bot for on-chain tracking, give that bot:

| Permission | NFT-tracker bot |
|---|---|
| View Channel | ✅ Allow |
| Send Messages | ✅ Allow |
| Embed Links | ✅ Allow |
| Attach Files | ✅ Allow |

---

## 27) VERIFICATION FLOW — EXACT BOT PANEL CONTENT

### `#access-info` pinned message (you post this manually as Admin)

> 💗 **Welcome to WHIMSEY**
> 
> To unlock the rest of the server:
> 1. Head to `#verify` (right below this channel).
> 2. Click the **Verify** button on the Auth panel.
> 3. Complete the captcha.
> 4. You'll instantly receive the **Verified 🩵** role and the rest of the server will appear.
> 
> ⚠️ **Important safety note:** the WHIMSEY team will NEVER DM you first. Anyone DMing you offering a mint, an airdrop, or "support" is a scammer. Report them in `#scam-alerts` after you verify.

### `#verify` — Auth bot panel

Auth bot will post this automatically once you configure the verification channel in its dashboard.

### `#holder-verify` — pinned message (post manually) + Collab.Land panel

Pinned manual message:

> 🌌 **Holder Verification**
> 
> Own a WHIMSEY ($CNDY) NFT? Verify your wallet below to unlock the exclusive `#holder-chat` and `#holder-announcements` channels.
> 
> 1. Click the **Connect Wallet** button on the Collab.Land panel.
> 2. Sign the message in your wallet (no funds will move, no gas required).
> 3. Collab.Land will check the WHIMSEY contract for your wallet's balance.
> 4. If you hold ≥ 1 $CNDY NFT, you'll receive the **Holder 🌌** role and the holder channels will appear.
> 
> Re-verification happens every 24 hours. If you sell your NFT, the role is automatically removed.

Collab.Land's panel posts automatically once you finish the Command Center setup.

### `#open-tickets` — Ticket Tool panel embed

Configure Ticket Tool to post:

> 🎫 **Open a Private Ticket**
> 
> For sensitive or 1-on-1 help, open a ticket below. Only you and the WHIMSEY team will see it.
> 
> [General Question] [Wallet / Holder Issue] [Scam Report] [Bug / Server Issue]

---

## 28) THE CARL-BOT OPERATIONS PLAYBOOK

This is the full configuration for Carl-bot — the brain of your server. It does the work of 4 mods at the same time, 24/7. Configure everything below in the Carl-bot dashboard at **carl.gg → Dashboard → [WHIMSEY server]**.

### 28.1) AutoMod rules (replaces a 24/7 mod)

In Carl-bot dashboard → **AutoMod** → enable each:

- **Anti-invite filter:** auto-delete any non-WHIMSEY Discord invite link in any public channel.
  - Whitelist: your own server's invite.
  - 1st violation: delete + warn in `#audit-scam-watch`. 3rd violation: 1-hour timeout.
- **Anti-link filter:** in `#general-chat`, `#whimsey-talk`, `#fan-creations`, `#suggestions`, `#show-your-whimsey`, `#trading-post`, `#market-talk`, `#support`, auto-delete suspicious crypto/scam links.
  - Whitelist: your official site, OpenSea/Magic Eden listing URL, your verified Twitter, your Linktree.
- **Anti-spam filter:** 5+ messages in 3 seconds → 10-minute timeout + log.
- **Anti-mention-spam filter:** more than 5 mentions in one message → delete + 30-minute timeout.
- **Anti-caps filter:** message with >70% caps → auto-delete (warning only, no timeout).
- **Banned-words filter:** paste your scam keyword list (section 3.6). Action: delete + post alert in `#audit-scam-watch`.
- **NSFW image filter:** Discord's classifier; confidence > 80% → delete + 24-hour timeout.
- **Anti-zalgo / unicode-spam filter:** filter messages with excessive combining characters → delete.
- **Anti-newline-spam filter:** messages with > 8 newlines → delete.

### 28.2) Real-time logging — bind EVERY event to its dedicated audit channel

This is the core of your "track everything" architecture. Carl-bot can log 30+ distinct event types. In **Carl-bot dashboard → Logging**, enable each event with the corresponding destination channel.

#### User-action log bindings

| Carl-bot event | Destination channel |
|---|---|
| Member kick | `#audit-mod-actions` |
| Member ban | `#audit-mod-actions` |
| Member unban | `#audit-mod-actions` |
| Member timeout (mute) | `#audit-mod-actions` |
| Member untimeout (unmute) | `#audit-mod-actions` |
| Carl-bot warning issued | `#audit-mod-actions` |
| Message edit | `#audit-messages` |
| Message delete (single) | `#audit-messages` |
| Message bulk delete (purge) | `#audit-messages` |
| Member join | `#audit-joins-leaves` (include account-age stamp + invite used) |
| Member leave | `#audit-joins-leaves` (include join-date so you can see how long they stayed) |
| Member role added | `#audit-role-changes` |
| Member role removed | `#audit-role-changes` |
| Member nickname changed | `#audit-nicknames` |
| Member username changed | `#audit-member-updates` |
| Member avatar changed | `#audit-member-updates` *(only flag for staff + Holders to detect account hijacks)* |
| Voice channel join | `#audit-voice` |
| Voice channel leave | `#audit-voice` |
| Voice channel move | `#audit-voice` |
| Voice mute / deafen / undeafen | `#audit-voice` |
| Voice video on/off, screen-share start/stop | `#audit-voice` |

#### Server-structure log bindings

| Carl-bot event | Destination channel |
|---|---|
| Channel created | `#audit-channels` |
| Channel renamed | `#audit-channels` |
| Channel edited (topic, slowmode, NSFW flag) | `#audit-channels` |
| Channel deleted | `#audit-channels` |
| Channel permission overwrite changed | `#audit-channels` |
| Channel position moved | `#audit-channels` |
| Role created | `#audit-roles` |
| Role renamed | `#audit-roles` |
| Role recolored | `#audit-roles` |
| Role permissions changed | `#audit-roles` |
| Role hoist / mention setting changed | `#audit-roles` |
| Role deleted | `#audit-roles` |
| Server name changed | `#audit-server` |
| Server icon / banner / splash changed | `#audit-server` |
| Server region changed | `#audit-server` |
| AutoMod rule added / edited / deleted | `#audit-server` |
| Vanity URL changed | `#audit-server` |
| Verification level / explicit-content filter changed | `#audit-server` |
| Emoji added / renamed / removed | `#audit-emoji-stickers` |
| Sticker added / renamed / removed | `#audit-emoji-stickers` |
| Soundboard sound added / removed | `#audit-emoji-stickers` |
| Thread created / archived / unarchived / deleted | `#audit-threads-events` |
| Forum post created / locked / pinned | `#audit-threads-events` |
| Scheduled event created / edited / cancelled / completed | `#audit-threads-events` |
| Invite created | `#audit-invites` (with creator, expiry, max uses) |
| Invite used (member-join attribution) | `#audit-invites` |
| Invite deleted | `#audit-invites` |
| Bot/integration added | `#audit-bots` |
| Bot/integration removed | `#audit-bots` |
| Webhook created / edited / deleted | `#audit-bots` |

#### Safety log bindings

| Event | Destination |
|---|---|
| Carl-bot AutoMod hit (anti-invite, anti-spam, anti-caps, anti-mention-spam, banned-words, NSFW image) | `#audit-scam-watch` |
| Discord native AutoMod hit (configure in Server Settings → AutoMod → each rule's "Send alert" → set channel) | `#audit-automod` |

#### Holder / boost log bindings

| Event | Destination |
|---|---|
| `Holder 🌌` role added (Carl-bot detects role-add events) | `#audit-holder-changes` *(mirrors Collab.Land's grant for easy auditing in one place)* |
| `Holder 🌌` role removed | `#audit-holder-changes` |
| `Verified 🩵` role added | `#audit-holder-changes` *(optional, gives a single feed of "membership state changes")* |
| Server boost added | `#audit-boosts` *(post a celebration message — boosters love being recognized)* |
| Server boost removed | `#audit-boosts` |

> **Note on Collab.Land's wallet-verification logs:** Collab.Land posts its own log to `#audit-wallet-verifications`. In Collab.Land's Command Center → Logs → set the destination channel. This is separate from Carl-bot.

> **Note on Ticket Tool's ticket logs:** Ticket Tool posts a one-line summary to `#audit-tickets` (ticket opened by X, ticket closed by Y after Z minutes) and the FULL transcript to `#ticket-logs` inside `🎫 | TICKETS`. Set both in Ticket Tool's dashboard → Logging.

### 28.3) Reaction roles (optional self-assigned roles)

Create a new channel `#roles` inside `🌊 | START HERE` (read-only for community, like `#rules`). Pin a Carl-bot reaction-role panel:

> Pick the pings you want:
> 🔔 — Announcement Pings (you'll be pinged for `#announcements`)
> 🎉 — Giveaway Pings (you'll be pinged when a giveaway opens)
> 🗳️ — Poll Pings
> 🧑‍🎨 — Fan Artist (you'll be pinged when we do art calls)
> 🛒 — Trader Pings (you'll be pinged for trading-post heat / floor moves)

This way you don't need to `@everyone` for non-critical updates.

### 28.4) Auto-responses

Set Carl-bot triggers in **Dashboard → Tags / Auto-Responder**:

- Trigger: "how do I verify", "how to verify", "where do i verify"
  → Reply: "Head to `#access-info`, then click Verify in `#verify` 💗"
- Trigger: "is this a scam", "is this real", "got a dm"
  → Reply: "Read `#scam-alerts` — and remember: the team will NEVER DM you first."
- Trigger: "when mint", "wen mint", "when launch"
  → Reply: "Mint info is always live in `#roadmap` and `#announcements`."
- Trigger: "how do I become a holder", "holder role"
  → Reply: "Head to `#holder-verify` and click the Collab.Land button to verify your wallet 🌌"
- Trigger: "support", "i need help"
  → Reply: "Ask publicly in `#support`. For private help (wallet/scam/sensitive issues), open a ticket in `#open-tickets` 🎫"

### 28.5) Scheduled "momentum" reports — the heart of real-time tracking

Carl-bot's scheduled-message system can post recurring summaries. Set these up in **Dashboard → Scheduled Messages**:

#### Daily server recap → `#momentum-daily-recap` at 23:55 IST

Use a Carl-bot scheduled embed with the following template (Carl-bot fills the placeholders):

```
📊 WHIMSEY Daily Recap — {date}

🆕 Joins today: {joins_today}
👋 Leaves today: {leaves_today}
📈 Net growth: {net_growth_today}
💬 Messages today: {messages_today}
🟢 Active members today: {active_members_today}
🔝 Top 3 channels: {top_channels_today}
🏆 Top 3 contributors: {top_contributors_today}
🌌 New Holders today: {new_holders_today}
😢 Lost Holders today: {lost_holders_today}
🛡️ AutoMod hits today: {automod_hits_today}
🎫 Tickets opened: {tickets_opened_today}
🎫 Tickets closed: {tickets_closed_today}
```

> If Carl-bot's free tier doesn't support every placeholder, the team can run a slash command at end of day to generate the recap manually. Either way, this channel becomes your daily heartbeat.

#### Weekly server recap → `#momentum-weekly-recap` at Sunday 23:55 IST

Same structure as daily, but for the past 7 days, with week-over-week comparison (e.g. "+12% messages vs last week", "+47 net members vs last week"). Pin the most recent 4 weeks for at-a-glance trend.

#### Monthly server recap → `#momentum-monthly-recap` on the last day of the month at 23:55 IST

Month-over-month rollup. This is what you'd share with potential partners ("WHIMSEY did 12,000 messages and gained 380 net members in November").

#### Daily holder snapshot → `#momentum-holder-snapshot` at 00:05 IST

Carl-bot posts a reminder at 00:00 IST to `#staff-chat`: "📸 Holder snapshot time — run `/list-holders` in `#mod-commands` and post in `#momentum-holder-snapshot`."

The snapshot should track:
- Total `Holder 🌌` count (verified-on-Discord)
- New Holders since yesterday
- Holders lost since yesterday
- % of 30,000 supply that is verified-on-Discord (verified holders / 30,000 × 100)
- Top-10-wallet concentration (% of supply held by top 10 wallets — concentration risk indicator)

#### Live server stats pinboard → `#momentum-server-stats`

Pin a Carl-bot embed that the team manually refreshes weekly via slash command:
- Total members
- Verified members
- Holders
- Boost level + boost count
- Online now (refresh-on-demand)

#### Weekly community contributor recognition → `#momentum-team-pulse` at Monday 12:00 IST

Carl-bot scheduled embed: top 3 message-count members + top 3 reaction-receivers + top 3 forum/thread starters from the past week. Use this to pick a "Whimsey of the Week" hero to spotlight in `#announcements`.

#### Daily safety reminder → `#general-chat` at 12:00 IST every day

Rotating tip-of-the-day:
- Mon: "🩵 Reminder: never share your seed phrase. The team will NEVER DM you first."
- Tue: "🌌 Holders — re-verify in `#holder-verify` if your role goes missing after a wallet move."
- Wed: "🚨 Suspicious DM? Screenshot it and report in `#scam-alerts`."
- Thu: "✨ Forgot how to verify? Head to `#access-info`."
- Fri: "🎉 Got fan art? Drop it in `#fan-creations` or `#show-your-whimsey`."
- Sat: "🗳️ Vote on community polls in `#polls`."
- Sun: "📊 Weekly recap is up in `#momentum-weekly-recap` (staff only)."

#### Daily nudge to staff → `#whimsey-of-the-day` at 14:00 IST

"📌 Time for today's Whimsey of the Day! Pick one and post."

### 28.6) Auto-slowmode

Carl-bot can auto-enable slowmode if a channel hits >30 messages/minute. Enable on:
- `#general-chat`
- `#whimsey-talk`
- `#trading-post`
- `#support`

### 28.7) Anti-impersonator nickname filter

Add a Carl-bot custom rule: if any non-staff member sets their nickname to contain "Admin", "Mod", "Moderator", "WHIMSEY Support", "WHIMSEY Team", "Support", "Team", "Official", "Founder" — auto-revert their nickname and time them out for 1 hour. Log to `#audit-mod-actions` AND `#audit-nicknames`.

### 28.8) Welcome system

- Send a DM to new joiners: "Welcome to WHIMSEY! Read `#access-info` and verify in `#verify` to unlock the server. The team will NEVER DM you first."
- Post a welcome card in `#welcome` AFTER they verify (Carl-bot triggered by `Verified 🩵` role-add).
- Account-age check on join: if account is < 24 hours old, auto-flag in `#audit-joins-leaves` with ⚠️ emoji so mods can watch.

### 28.9) Carl-bot permission overrides it needs to make logging work

For Carl-bot to write into every audit + momentum channel, give Carl-bot's role at the **category** level for both `📋 | AUDITS` and `📈 | MOMENTUM`:

- View Channels ✅ Allow
- Send Messages and Create Posts ✅ Allow
- Embed Links ✅ Allow
- Attach Files ✅ Allow
- Read Message History ✅ Allow
- Manage Messages ✅ Allow (so it can clean up its own old logs if needed)
- Use External Emojis ✅ Allow
- Mention @everyone, @here and All Roles ✅ Allow (so it can `@Moderator` on critical events like mass-ban detection)

These are already in the section 24A and 24B tables — just verify after invite that nothing got dropped.

### 28.10) Optional but powerful: Carl-bot tag commands for the team

Use Carl-bot tags to give your team one-letter shortcuts:

- `?tag rules` → posts the rules summary
- `?tag scam` → posts the scam-warning template
- `?tag verify` → posts the verify instructions
- `?tag holder` → posts the holder-verify instructions
- `?tag stats` → posts a live stats summary
- `?tag snapshot` → posts the latest holder snapshot pulled from `#momentum-holder-snapshot`

Saves the team typing the same answers 50 times a day.

---

## 29) PRE-LAUNCH TEST CHECKLIST

Use a SECOND Discord account (not yours, not a mod's) and walk through this. Tick every box. Anything that fails — fix before launching.

### Unverified joiner test

- [ ] Joining the server, the membership-screening rules appear and require accept.
- [ ] On entering, ONLY the `💗 | VERIFY` category is visible.
- [ ] `#access-info` is the very first channel in the channel list.
- [ ] I cannot send messages in `#access-info` or `#verify`.
- [ ] I CAN see Auth bot's panel in `#verify`.
- [ ] Clicking the Verify button shows me a captcha.
- [ ] On success, I receive the `Verified 🩵` role.
- [ ] The `💗 | VERIFY` category disappears.
- [ ] All public categories appear in this order: START HERE → THE UNIVERSE → COMMUNITY → HOLDERS ONLY → COLLECTORS → EVENTS → SUPPORT.

### Verified 🩵 test

- [ ] In `🌌 | HOLDERS ONLY` I see ONLY `#holder-verify`. I CANNOT see `#holder-chat` or `#holder-announcements`.
- [ ] I CANNOT send messages in: `#welcome`, `#rules`, `#announcements`, every channel in `❄️ | THE UNIVERSE`, `#whimsey-of-the-day`, `#holder-verify`, `#holder-announcements`, `#whimsey-of-the-day`, `#giveaways`, `#polls`, `#faqs`, `#scam-alerts`, `#open-tickets`.
- [ ] I CAN send messages in: `#general-chat`, `#whimsey-talk`, `#fan-creations`, `#suggestions`, `#show-your-whimsey`, `#trading-post` (with 30s slowmode), `#market-talk` (with 10s slowmode), `#support`.
- [ ] I CAN react in every channel I can see (read-only ones included).
- [ ] I CANNOT see `🔒 | STAFF` or `🎫 | TICKETS`.
- [ ] I CAN see Collab.Land's panel in `#holder-verify`.
- [ ] I CAN see Ticket Tool's panel in `#open-tickets` and the button works.
- [ ] Clicking Ticket Tool's button creates a private channel inside `🎫 | TICKETS`. I can see it; mods can see it; other Verified users CANNOT see it.
- [ ] Closing the ticket archives it and posts a transcript in `#ticket-logs`.
- [ ] Trying to type `@everyone` or `@here` in `#general-chat` does NOT ping anyone.
- [ ] Trying to ping `@Moderator` in `#general-chat` does NOT ping anyone.

### Holder 🌌 test (use a wallet that holds a $CNDY NFT, OR temporarily set Collab.Land minimum to 0 for testing — restore to 1 after)

- [ ] After Collab.Land confirms, I receive `Holder 🌌`.
- [ ] `#holder-chat` and `#holder-announcements` appear.
- [ ] I CAN send in `#holder-chat`.
- [ ] I CANNOT send in `#holder-announcements` but I CAN react.

### Sale-loss test

- [ ] Move the $CNDY NFT out of the wallet. Force a Collab.Land re-verify. Verify that `Holder 🌌` is removed and the holder channels disappear.

### Moderator test

- [ ] Mod sees everything Verified + Holder sees, plus `🔒 | STAFF` and `🎫 | TICKETS`.
- [ ] Mod can delete a message in `#general-chat`.
- [ ] Mod can time out a user.
- [ ] Mod CANNOT kick the Admin (because Admin sits above Mod in the hierarchy).
- [ ] Mod CANNOT delete a channel.
- [ ] Mod CANNOT change `@everyone` permissions.

### Bot tests

- [ ] Auth posts the verification panel in `#verify`.
- [ ] Collab.Land posts the wallet panel in `#holder-verify`.
- [ ] Ticket Tool posts the ticket panel in `#open-tickets`.
- [ ] Carl-bot logs an edit/delete in `#message-logs`.
- [ ] Carl-bot logs a kick in `#mod-logs`.
- [ ] Carl-bot logs a join/leave in `#join-leave-logs`.
- [ ] Pasting a fake Discord invite in `#general-chat` → auto-deleted by Carl-bot, alert appears in `#scam-watch`.
- [ ] Pasting "free mint claim now" → auto-deleted.
- [ ] Reacting to the role-picker panel in `#roles` adds/removes the optional ping role correctly.

### Leak / sneak test (the most important section)

- [ ] As Verified (no Holder), copy a message link from `#holder-chat` (have a Holder give you the link) and paste it in your browser → Discord should refuse access ("Channel not found" or no preview).
- [ ] As `@everyone` (logged out / brand-new throwaway), I see ONLY VERIFY.
- [ ] As Verified, opening any channel in `🔒 | STAFF` via direct URL fails.
- [ ] No bot has Administrator. Confirm in **Server Settings → Roles**.
- [ ] No human role except Admin has Administrator.
- [ ] Server requires 2FA for moderation actions (test by trying a mod action from an account that has 2FA disabled — should fail).

---

## 30) POLISH TASKS FOR A 30,000-SUPPLY LAUNCH

These separate Doodles/Cool Cats/Pudgy-tier servers from generic NFT servers. Do as many as you can before public launch.

1. **Server icon, splash, banner.** Splash + banner need Boost Level 1 / 2.
2. **Server invite splash image** (the preview image people see on the invite link before they accept).
3. **Vanity URL** `discord.gg/whimsey` (Boost Level 3 — needs 14 boosts).
4. **Custom emoji + stickers** — upload 30–50 WHIMSEY-themed reactions. This becomes your community's "language".
5. **Custom soundboard sounds** — 8 short signature sounds for hype moments (Boost Level 2 / 3).
6. **Onboarding** with interest tags — see section 3.5.
7. **Native Discord Events** — pre-schedule mints, AMAs, giveaways using **Server → Events** so members can RSVP and get reminders.
8. **Apply for Server Discovery** once you have ≥1000 members and Onboarding set up — major organic growth lever.
9. **Apply for the Verified Server checkmark** once eligible — huge trust signal.
10. **Stage channel for AMAs** — town-hall style, Mods can mute speakers.
11. **Pinned messages** in every chat channel:
    - `#general-chat`: "🩵 Reminder: team will NEVER DM you. Read the rules in `#rules`."
    - `#trading-post`: trade-at-your-own-risk disclaimer.
    - `#holder-chat`: holder code-of-conduct.
12. **Rules embed** in `#rules` — use Carl-bot's `?embed` command for a beautiful, branded format instead of plain text.
13. **Anti-impersonator nickname filter** — section 28.7.
14. **Server template backup** — Server Settings → Server Template → create a template after setup. If the server is ever nuked, you can rebuild structure in one click.
15. **Document backup** — keep this markdown file and a screenshot of every role's permission tab in a secure folder.
16. **Weekly audit log review** — every Sunday, scroll **Server Settings → Audit Log** for the past week and look for anomalies.
17. **"We will NEVER DM you first" pin** — every public channel. This is the #1 scam vector.
18. **Holder snapshots** — when you do whitelist drops or airdrops, take a holder snapshot via Collab.Land's `/list-holders` command or a third-party tool like Hashlist.
19. **Personal-Discord-settings guide** in `#scam-alerts` — show holders how to disable DMs from server members in their User Settings → Privacy & Safety.
20. **Two distinct Mod accounts for you** — keep an Admin account that is rarely online (high security, hardware key) and a Mod-level "daily driver" account. If your daily driver gets compromised, the server survives.
21. **Bot token rotation reminder** — every 6 months, rotate Auth and Collab.Land's API keys. Compromised bot tokens are how most NFT servers get drained.
22. **Pre-mint dry-run** — 48 hours before mint, force-close the server (lock public channels via a panic-button command) and walk through the join → verify → holder flow with 5 outside testers.
23. **Mint-day plan** — pre-write your mint announcement, prepare your Twitter, prepare your `@everyone` ping, prepare a "we are aware of [X]" template for incidents, and have at least 2 mods online for the entire mint window.
24. **Post-mint audit** — within 24 hours of mint, run the leak test (section 29) again with a fresh holder.

---

## 31) PERMISSION GLOSSARY (PLAIN ENGLISH)

Quick lookup for every permission used above, exactly as Discord names it.

### General Server / Category / Channel

- **View Channels / View Channel** — controls whether the role can SEE the channel exists at all. The single most important permission.
- **Manage Channels / Manage Channel** — create, rename, edit, delete channels.
- **Manage Roles** — create/edit/delete/assign roles BELOW the user's highest role.
- **Manage Permissions** — change permission overwrites on this channel (only at channel/category level).
- **Create Expressions** — upload new emoji, stickers, soundboard sounds.
- **Manage Expressions** — edit/delete emoji, stickers, sounds.
- **View Audit Log** — see the full record of who did what.
- **View Server Insights** — see analytics dashboard.
- **Manage Webhooks** — create/edit/delete webhooks. Webhooks can post as anyone, including the team — abuse risk.
- **Manage Server** — change server name, region, AutoMod, vanity URL, etc.

### Membership

- **Create Invite** — generate invite links.
- **Change Nickname** — change own nickname.
- **Manage Nicknames** — change other people's nicknames.
- **Kick, Approve and Reject Members** — remove members (they can rejoin); also approve/reject membership-screening applicants.
- **Ban Members** — permanently remove + block re-join.
- **Time out members** — temporary mute, 1 minute to 28 days. Preferred over ban for first offense.

### Text Channel Permissions

- **Send Messages and Create Posts / Send Messages** — post in text channels and create posts in forum channels.
- **Send Messages in Threads and Posts / Send Messages in Threads** — post inside a thread.
- **Create Public Threads** — start a thread anyone in the channel can see.
- **Create Private Threads** — start a thread only invited people can see.
- **Embed Links** — links auto-render with a preview embed.
- **Attach Files** — upload files / images.
- **Add Reactions** — react with new emoji.
- **Use External Emojis** — use emoji from other servers (Nitro feature).
- **Use External Stickers** — use stickers from other servers.
- **Mention @everyone, @here and All Roles** — mass-pings.
- **Manage Messages** — pin, delete, remove embeds from other people's messages.
- **Pin Messages** — pin messages.
- **Bypass Slowmode** — send messages without being rate-limited by Slowmode.
- **Manage Threads and Posts / Manage Threads** — rename, delete, archive, lock threads.
- **Read Message History** — see messages that existed before they joined the channel.
- **Send Text-to-speech Messages** — `/tts` messages. Almost always Deny.
- **Send Voice Messages** — short-audio voice messages.
- **Create Polls** — create native Discord polls.

### Voice Channel Permissions

- **Connect** — join the voice channel.
- **Speak** — talk in the voice channel.
- **Video** — share camera or screen.
- **Use Soundboard** — play sounds from the server's soundboard.
- **Use External Sounds** — play sounds from other servers' soundboards (Nitro feature).
- **Use Voice Activity** — talk by voice activation (vs forced push-to-talk).
- **Priority Speaker** — when this person speaks, others' volume is auto-lowered.
- **Mute Members** — server-mute others in VC.
- **Deafen Members** — server-deafen others in VC.
- **Move Members** — drag people between VCs or kick from VC.
- **Set Voice Channel Status** — set the "what's happening here" status string on a VC.

### Apps Permissions

- **Use Application Commands** — use bot slash commands AND click bot buttons. Critical for verify, ticket, giveaway buttons.
- **Use Activities** — Discord's voice-channel mini-games (YouTube Together, etc.).
- **Use External Apps** — when a member has third-party apps installed on their personal account, this controls whether those apps can post to your server through them. Almost always Deny on community channels.

### Stage Channel Permissions

- **Request to Speak** — Stage channels are like virtual auditoriums; this lets non-speakers raise their hand.

### Events Permissions

- **Create Events** — create scheduled server events.
- **Manage Events** — edit and cancel events.

### Advanced Permissions

- **Administrator** — bypasses every other permission and every channel overwrite. Only `Admin 💗` should ever have this.

---

## ONE-PARAGRAPH SUMMARY

Lock everything down for `@everyone`. The only category they can see is `💗 | VERIFY`. Once they verify with the Auth bot, they get `Verified 🩵` and the rest of the public server appears. If they prove they own a $CNDY NFT via Collab.Land in `#holder-verify`, they get `Holder 🌌` and the exclusive `#holder-chat` + `#holder-announcements` appear. The team has `Moderator ☁️` (everything except Administrator). You have `Admin 💗` (Administrator). The 4 bots — Auth (verify), Collab.Land (wallet check), Ticket Tool (private support), Carl-bot (24/7 mod automation + logs) — sit between Mod and Holder in the hierarchy. Two new private categories `🔒 | STAFF` and `🎫 | TICKETS` exist for the team's eyes only. `#support` is open public help; `#open-tickets` is the door to private 1-on-1 help. Before launching, run section 29's checklist with a second account.

You're ready to launch WHIMSEY. 💗

---


## 32) OPTIONAL: ADD A 5TH BOT FOR ON-CHAIN COLLECTION TRACKING

You said you want to keep the bot count low (4 confirmed: Auth, Carl-bot, Collab.Land, Ticket Tool). But because you specifically asked to track EVERYTHING in the collection in real time, here's what a 5th bot would unlock — and how to add it cleanly without bloat.

### 32.1) Why you might want it

The 4 confirmed bots cover the SERVER side perfectly. They do not, however, watch the BLOCKCHAIN. So:

- A new $CNDY mint, sale, listing, transfer, or de-list happens → no Discord notification.
- A whale picks up 50 in a single transaction → no Discord notification.
- The floor price drops 20% in an hour → no Discord notification.

If you want `#momentum-collection-feed` to actually be live (instead of just a manual post-board), you need a bot that subscribes to your contract address and posts these events automatically.

### 32.2) Three recommended candidates (pick one)

All three are free or freemium and work without any code from you.

| Bot | Best for | Setup time |
|---|---|---|
| **NFTSalesBot (botghost / Vulcan)** | Ethereum / Polygon NFT sales + listings + bids feed. Most popular. | ~10 min |
| **Hashlist** | Solana NFT collections (if $CNDY is on Solana). Posts mints, sales, listings, floor moves. | ~10 min |
| **OpenSea Sales Bot / Sweep Bot** | OpenSea-native, simple sales-only feed. | ~5 min |

> Pick based on **which chain $CNDY lives on**. The doc assumes Ethereum/Polygon by default; if you confirm Solana later, swap to Hashlist.

### 32.3) Setup (using NFTSalesBot as the example)

1. Go to **nftsalesbot.com** (or the bot's official site).
2. Click "Add to Discord" → select WHIMSEY server.
3. On the OAuth page, grant ONLY: View Channels, Send Messages, Embed Links, Attach Files. Tick nothing else.
4. After it joins, create a NEW role for it called **`NFT Tracker`** with **zero** server-wide permissions.
5. Move `NFT Tracker` role in the role list ABOVE `Verified 🩵` but BELOW `Ticket Tool`. New stack:
   - 0. `Admin 💗`
   - 1. `Moderator ☁️`
   - 2. `Carl-bot`
   - 3. `Auth`
   - 4. `Collab.Land`
   - 5. `Ticket Tool`
   - 6. `NFT Tracker` ← new
   - 7. `Holder 🌌`
   - 8. `Verified 🩵`
   - 9. `@everyone`
6. Open `#momentum-collection-feed` → Edit Channel → Permissions → Add `NFT Tracker` role:
   - View Channel ✅ Allow
   - Send Messages ✅ Allow
   - Embed Links ✅ Allow
   - Attach Files ✅ Allow
   - Read Message History ✅ Allow
7. In the bot's own dashboard (or via slash command in `#mod-commands`), point it at:
   - **Contract address:** `0xYourContractAddress` (your $CNDY collection)
   - **Channel:** `#momentum-collection-feed`
   - **Events to watch:** Sales, Listings, De-listings, Transfers, Mints (tick all)
   - **Min sale price filter:** none (you want everything for a 30,000 supply with this floor)

### 32.4) What you'll see in `#momentum-collection-feed` after setup

Every blockchain event posts as an embed:

> 🛒 **WHIMSEY #4218 SOLD**
> Price: 0.32 ETH (~₹68,000)
> Buyer: `0x9ab…3f1` ([wallet on Etherscan])
> Seller: `0x7c2…9de`
> Marketplace: OpenSea
> Floor at sale: 0.29 ETH

Combined with Carl-bot's daily holder snapshot in `#momentum-holder-snapshot`, you now have a true 360° view: every wallet move on-chain + every Discord membership change in one server.

### 32.5) Why this doesn't bloat your stack

This bot:
- Has zero overlap with Carl-bot, Collab.Land, Auth, or Ticket Tool.
- Only writes to one channel.
- Only reads from the blockchain (not from Discord).
- Has no slash-commands users can spam.
- Has no DM behaviour.

It's a one-purpose appliance. So the "4 bots is the limit" instinct doesn't really apply here — this is a different category of tool (off-chain reader, not server-management).

### 32.6) If you decide NOT to add it

That's totally fine. Then `#momentum-collection-feed` becomes a manual post-board where the team drops noteworthy mints/sales/whale moves (use a screenshot from OpenSea / Magic Eden + a one-line caption). Set a Carl-bot scheduled message: every Monday 12:00 IST, "📊 Team — drop this week's notable on-chain moves in this channel." That keeps the channel useful even without automation.
