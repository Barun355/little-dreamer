# Little Dreamer — Make.com Scenario Build Sheet

```
   9 INPUTS ─► GPT(story JSON) ─► GPT(prompts) ─► CHAR REF ─► LOOP(images) ─► PDF ─► R2
                                                     ▲            │
                                                     └── reference ┘
```

**Provider: OpenAI** — connection `openai-gpt-3`, one connection covers modules 4, 6, 8, 11.

---

## 0 · LIVE STATE  (verified against team 2123206 · 2026-07-25)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  BLOCKER — NO OPENAI CONNECTION EXISTS IN THIS TEAM                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  connections_list(2123206) returns ONLY:                                     ║
║     8930212  ai-provider   Make's AI Provider (default)                      ║
║     8930325  telegram      @mycalendar13_bot                                 ║
║     8930517  telegram      @mycalendar13_bot                                 ║
║     8931333  google        gauravmaheshwariai@gmail.com                      ║
║                                                                              ║
║  every openai-gpt-3 module requires  parameters.__IMTCONN__                  ║
║  the model dropdowns are RPC-backed (getModels) and ALSO need it —           ║
║  valid model names cannot even be enumerated until the connection exists.    ║
║                                                                              ║
║  ai-provider is NOT a substitute: it drives ai-tools:Ask (text only).        ║
║  it cannot do reference-image editing, so it cannot hold likeness.           ║
╚══════════════════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════════════════╗
║  CONFIRMED — Make DOES expose a reference-image module                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║   openai-gpt-3:GenerateImage    "Generate images"                            ║
║                                 text prompt ──────────────► image            ║
║                                 no input image · likeness drifts        ✗    ║
║                                                                              ║
║   openai-gpt-3:editImage        "Edit images"                                ║
║                                 "…given ONE OR MORE SOURCE IMAGES            ║
║                                   and a prompt"                              ║
║                                 text prompt + INPUT IMAGE ─► image      ✓    ║
║                                                                              ║
║   ──► modules 8 and 11 both use  editImage.                                  ║
║       8 builds ONE character reference, 11 renders each page from it.        ║
║       no http:MakeRequest fallback needed — the §3 escape hatch is dead.     ║
║                                                                              ║
║   model list is RPC-gated (getModels · type images_edit).                    ║
║   module docs warn gpt-image-2 may require OpenAI org verification.          ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 0b · DEPLOYED  ·  scenario 6695966  ·  2026-07-25

```
  BLUEPRINT AS BUILT — 15 modules · isinvalid:false · isActive:FALSE
  ALL STUBS REMOVED. execution order = table order.

  bp   MODULE                         NAME                   STATE
  ─────────────────────────────────────────────────────────────────────────
   2   gateway:CustomWebHook          —                      ✓ hook 3446600
   3   gateway:WebhookRespond         202 Accepted           ✓
   4   util:SetVariables              Derive vars            ✓
   5   openai-gpt-3:CreateCompletion  LLM 1 - Story          ⚠ conn
   6   json:ParseJSON   ds 505244     Parse SS-1             ✓ {{5.result}}
   7   openai-gpt-3:CreateCompletion  LLM 2 - Sheet+Prompts  ⚠ conn + photos
   8   json:ParseJSON   ds 505245     Parse PS-1             ✓ {{7.result}}
  15   openai-gpt-3:editImage         Character reference    ⚠ conn + src img
   9   builtin:BasicFeeder            Iterate sections       ✓ {{8.prompts}}
  16   openai-gpt-3:editImage         Page illustration      ⚠ conn + src img
  10   http:MakeRequest               R2 presign PUT         ✓
  11   http:MakeRequest               Upload page to R2      ⚠ body ref
  12   builtin:BasicAggregator        Collect page assets    ⚠ fields unset
  13   http:MakeRequest               Render PDF             ✓
  14   http:MakeRequest               Callback book-ready    ✓
  ─────────────────────────────────────────────────────────────────────────

  FULLY WRITTEN BY BLUEPRINT — nothing to do
    · both system + user prompts on 5 and 7, with every one of the 9
      inputs mapped, join() on the three arrays, vocabulary table
      inlined, seed-driven adventure selection instruction
    · both editImage prompts, incl. the "IDENTICAL to the reference"
      likeness clause on 16
    · style guide inlined in 7 · 15 · 16 (three places — keep in sync)
    · select="chat" · response_format="json_object" · max_tokens


  WHAT I COULD NOT SET, AND WHY
  ┌──────────────────────────────────────────────────────────────────┐
  │ a  parameters.__IMTCONN__ on 5 · 7 · 15 · 16                     │
  │      left {} deliberately. no openai-gpt-3 connection exists,    │
  │      and a wrong id is worse than an empty one.                  │
  │                                                                   │
  │ b  model values are GUESSES — gpt-4o / gpt-image-1               │
  │      the dropdowns are RPC-backed (getModels) and the RPC        │
  │      needs the connection. confirm both against the real list.   │
  │                                                                   │
  │ c  vision photo attachment on module 7                           │
  │      the prompt SAYS "based on the attached photo(s)" but no     │
  │      image is attached yet. without it the character sheet is    │
  │      invented, not observed — and likeness is the whole product. │
  │                                                                   │
  │ d  source image on 15 and 16                                     │
  │      editImage's fields past `model` come from                   │
  │      getImageModuleParams(module:"edit", model:…) — RPC, so      │
  │      connection-gated. 15 takes the child photo, 16 takes 15's   │
  │      output. THIS IS THE WHOLE CONSISTENCY MECHANISM.            │
  │                                                                   │
  │ e  module 11 rawBodyContent = {{16.data}}                        │
  │      editImage's output field name is RPC-derived and unverified.│
  │      if it returns base64 this needs {{toBinary(16.…)}} instead. │
  │      first real run will show the true shape.                    │
  │                                                                   │
  │ f  module 12 aggregated fields                                   │
  │      feeder:9 IS bound. the field list has no schema to write    │
  │      against — pick section + key in the UI.                     │
  └──────────────────────────────────────────────────────────────────┘

  NOT ACTIVATED — c and d are unwired, so a run today would produce
  a book of six unrelated children.
```

---

## 1 · MODULE CHAIN

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  SCENARIO   "Little Dream"                                                   ║
║  scenario   6695966        team 2123206        zone eu1                      ║
║  scheduling {"type":"immediately"}        ◄── REQUIRED for webhook trigger    ║
╚══════════════════════════════════════════════════════════════════════════════╝


  ┌─ 1 ─────────────────────────────────────────────────────────────────────┐
  │ Webhooks › Custom webhook                          gateway:CustomWebHook │
  ├─────────────────────────────────────────────────────────────────────────┤
  │ hook    3446600  "little-dream-web-generate"            ◄── EXISTS       │
  │ auth    x-make-apikey (key 206996)   headers:true                        │
  │ struct  DS-1  (§4)                                                       │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       ▼
  ┌─ 2 ─────────────────────────────────────────────────────────────────────┐
  │ Webhooks › Webhook response                       gateway:WebhookRespond │
  ├─────────────────────────────────────────────────────────────────────────┤
  │ status  202      body  {"accepted":true,"jobId":"{{1.jobId}}"}           │
  │ ⚠ modules 3+ CONTINUE after this fires — Server Action released here     │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       ▼
  ┌─ 3 ─────────────────────────────────────────────────────────────────────┐
  │ Tools › Set multiple variables                        util:SetVariables  │
  ├─────────────────────────────────────────────────────────────────────────┤
  │ pronouns   {{if(1.child.gender="girl";"she/her";                         │
  │                if(1.child.gender="boy";"he/him";"they/them"))}}          │
  │ ageBand    {{if(1.child.age<6;"3-5";if(1.child.age<8;"6-7";"8-10"))}}    │
  │ bookId     {{1.jobId}}          seed  {{1.seed}}                         │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       ▼
  ┌─ 4 ─────────────────────────────────────────────────────────────────────┐
  │ OpenAI › Create a Completion            openai-gpt-3:CreateCompletion    │
  │                    ── LLM 1 : COMPLETE STORY ──                          │
  ├─────────────────────────────────────────────────────────────────────────┤
  │ parameters.__IMTCONN__   <openai-gpt-3 connection id>   ◄── MISSING §0   │
  │                                                                          │
  │ mapper.select    "chat"        ◄── REQUIRED FIRST. gates every           │
  │                                    other field in the schema.            │
  │ mapper.model     RPC getModels(type:chat) — needs the connection         │
  │ mapper.max_tokens        8000                                            │
  │ mapper.response_format   json_object    ◄ ADVANCED field, exists         │
  │ mapper.temperature       1              ◄ ADVANCED field                 │
  │                                                                          │
  │ messages                                                                 │
  │   system  story engine · vocabulary target {{3.ageBand}} (§5)            │
  │   user    all 9 inputs + {{3.pronouns}} + {{3.seed}}                     │
  │                                                                          │
  │ OUT  {{4.result}}      ◄── NOT choices[].message.content.                │
  │                            Make flattens it to `result`.                 │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       ▼
  ┌─ 5 ─────────────────────────────────────────────────────────────────────┐
  │ JSON › Parse JSON                                        json:ParseJSON  │
  │ struct SS-1  (ds 505244)      string {{4.result}}                        │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       ▼
  ┌─ 6 ─────────────────────────────────────────────────────────────────────┐
  │ OpenAI › Create a Completion            openai-gpt-3:CreateCompletion    │
  │           ── LLM 2 : CHARACTER SHEET + 6 IMAGE PROMPTS ──                │
  ├─────────────────────────────────────────────────────────────────────────┤
  │ parameters.__IMTCONN__   <openai-gpt-3 connection id>                     │
  │                                                                          │
  │ mapper.select    "chat"                                                  │
  │ mapper.model     must be VISION-capable — confirm from getModels         │
  │ mapper.response_format   json_object                                     │
  │                                                                          │
  │ messages                                                                 │
  │   user · text    {{5.intro}} {{5.ch1}} … {{5.ch5}}                       │
  │                  + storyWorld + storyTheme + emotionalTheme[]            │
  │                  + STYLE GUIDE (§5)                                      │
  │   user · image   presigned GET urls for {{1.child.images}}               │
  │                                                                          │
  │ ── alternative: openai-gpt-3:analyzeImages ("Analyze images (Vision)")   │
  │    dedicated vision module. simpler mapper, but returns prose —          │
  │    no response_format, so PS-1 would need coaxing. keep CreateCompletion.│
  │                                                                          │
  │ OUT  {{6.result}}   ──► PS-1 { characterSheet, prompts[6] }              │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       ▼
  ┌─ 7 ─────────────────────────────────────────────────────────────────────┐
  │ JSON › Parse JSON                                        json:ParseJSON  │
  │ struct PS-1  (ds 505245)      string {{6.result}}                        │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       ▼
  ┌─ 8 ═════════════════════════════════════════════════════════════════════┐
  │ OpenAI › Edit images                              openai-gpt-3:editImage │
  │              ── CHARACTER REFERENCE · RUNS ONCE · §0 ──                  │
  ├─────────────────────────────────────────────────────────────────────────┤
  │ parameters.__IMTCONN__   <openai-gpt-3 connection id>                    │
  │                                                                          │
  │ mapper.model    RPC getModels(type: images_edit)   ◄ connection-gated    │
  │ mapper.*        remaining fields are model-dependent —                   │
  │                 RPC getImageModuleParams(module:"edit", model:…)         │
  │                 resolve AFTER the connection exists                      │
  │                                                                          │
  │ source image    child photo, signed GET url from {{1.child.images[1]}}   │
  │ prompt          {{7.characterSheet}} + STYLE GUIDE                       │
  │                 "character turnaround, neutral pose, plain background"   │
  │                                                                          │
  │ OUT  image  ──► HELD IN MEMORY, reused by every loop pass                │
  │      (advanced fields mask, n exist on this module)                      │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       ▼
  ┌─ 9 ─── OPTIONAL / DEBUG ────────────────────────────────────────────────┐
  │ HTTP › Make a request                                  http:MakeRequest  │
  │ 9a  POST /api/r2/presign  { key:"characters/{{3.bookId}}.png" }          │
  │ 9b  PUT  {{9a.signedUrl}}   body {{toBinary(8.data[].b64_json)}}         │
  │                                                                          │
  │ not required by the loop — module 11 reads module 8 directly.            │
  │ keep it: when likeness drifts, this is the artifact you inspect.         │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       ▼
  ╔═ 10 ════════════════════════════════════════════════════════════════════╗
  ║ Flow control › Iterator                              builtin:BasicFeeder ║
  ║ array  {{7.prompts}}          ──►  emits 6 bundles                       ║
  ╚════════════════════════════════════╤════════════════════════════════════╝
                                       │
    ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┼─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
    │  L O O P   B O D Y        1 pass per section  (×6)                  │
    │                                  ▼                                  │
    │ ┌─ 11 ───────────────────────────────────────────────────────────┐  │
    │ │ OpenAI › Edit images                     openai-gpt-3:editImage│  │
    │ │                  ── PAGE ILLUSTRATION ──                       │  │
    │ ├────────────────────────────────────────────────────────────────┤  │
    │ │ parameters.__IMTCONN__   same connection as 4 · 6 · 8          │  │
    │ │ mapper.model             same as module 8                      │  │
    │ │                                                                │  │
    │ │ source image  module 8 output   ◄── CHARACTER REF, not the     │  │
    │ │                                     raw child photo            │  │
    │ │ prompt        {{10.prompt}} + STYLE GUIDE                      │  │
    │ │ size          landscape page — confirm allowed values via      │  │
    │ │               getImageModuleParams for the chosen model        │  │
    │ │                                                                │  │
    │ │ OUT     image                                                  │  │
    │ └───────────────────────────────┬────────────────────────────────┘  │
    │                                 ▼                                   │
    │ ┌─ 12 ───────────────────────────────────────────────────────────┐  │
    │ │ HTTP › Make a request                          http:MakeRequest│  │
    │ │ POST {{1.callback.baseUrl}}/api/r2/presign                     │  │
    │ │ body { key:"pages/{{3.bookId}}/{{10.section}}.png",            │  │
    │ │        op:"put", contentType:"image/png" }                     │  │
    │ │ OUT  { signedUrl }                                             │  │
    │ └───────────────────────────────┬────────────────────────────────┘  │
    │                                 ▼                                   │
    │ ┌─ 13 ───────────────────────────────────────────────────────────┐  │
    │ │ HTTP › Make a request                          http:MakeRequest│  │
    │ │ PUT  {{12.data.signedUrl}}                                     │  │
    │ │ bodyType  raw                                                  │  │
    │ │ body      {{toBinary(11.data[].b64_json)}}   ◄── always b64    │  │
    │ └───────────────────────────────┬────────────────────────────────┘  │
    │                                 ▼                                   │
    └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
                                      ▼
  ╔═ 14 ════════════════════════════════════════════════════════════════════╗
  ║ Flow control › Array aggregator                  builtin:BasicAggregator ║
  ╠═════════════════════════════════════════════════════════════════════════╣
  ║ Source module   10  (Iterator)        ◄── MUST point at the feeder       ║
  ║ Target struct   AS-1                                                     ║
  ║ Aggregated      section {{10.section}}                                   ║
  ║                 key     pages/{{3.bookId}}/{{10.section}}.png            ║
  ║ OUT             1 bundle · array of 6                                    ║
  ╚════════════════════════════════════╤════════════════════════════════════╝
                                       ▼
  ┌─ 15 ────────────────────────────────────────────────────────────────────┐
  │ HTTP › Make a request                                  http:MakeRequest  │
  │                          ── GENERATE PDF ──                             │
  ├─────────────────────────────────────────────────────────────────────────┤
  │ POST {{1.callback.baseUrl}}/api/render/pdf                               │
  │ body { bookId:"{{3.bookId}}", title:"{{5.title}}",                       │
  │        child:"{{1.child.name}}", sections:[{{14.array}}],                │
  │        text:{ intro:"{{5.intro}}", ch1:"{{5.ch1}}", … } }                │
  │ OUT  { pdfKey, pageCount, bytes }                                        │
  │                                                                          │
  │ ── alternative: render inside Make ──► §3                                │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       ▼
  ┌─ 16 ─── ONLY IF 15 RETURNS A BINARY ────────────────────────────────────┐
  │ 16a  POST /api/r2/presign  { key:"books/{{3.bookId}}.pdf", op:"put" }    │
  │ 16b  PUT  {{16a.signedUrl}}   body {{15.data}}   type raw                │
  └────────────────────────────────────┬────────────────────────────────────┘
                                       ▼
  ┌─ 17 ────────────────────────────────────────────────────────────────────┐
  │ HTTP › Make a request                                  http:MakeRequest  │
  │ POST {{1.callback.baseUrl}}/api/webhooks/make/book-ready                 │
  │ hdr  x-signature  {{sha256(...; env.HMAC_SECRET)}}                       │
  │ body { jobId, bookId, pdfKey:"{{15.data.pdfKey}}",                       │
  │        pages:[{{14.array}}], title:"{{5.title}}" }                       │
  │                          ──► Prisma: Book.status = READY                 │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## 2 · MODULE TABLE

```
 #    MODULE (slug)                      SLUG   CONN NEEDED        OPS
────────────────────────────────────────────────────────────────────────────────
  1   gateway:CustomWebHook              ✓✓     —                   1
  2   gateway:WebhookRespond             ?      —                   1
  3   util:SetVariables                  ?      —                   1
  4   openai-gpt-3:CreateCompletion      ✓✓     openai-gpt-3  ✗     1
  5   json:ParseJSON                     ?      —                   1
  6   openai-gpt-3:CreateCompletion      ✓✓     openai-gpt-3  ✗     1
  7   json:ParseJSON                     ?      —                   1
  8   openai-gpt-3:editImage             ✓✓     openai-gpt-3  ✗     1
  9   http:MakeRequest                   ✓      —                   2   opt
 10   builtin:BasicFeeder                ✓      —                   1
 11   openai-gpt-3:editImage             ✓✓     openai-gpt-3  ✗     6
 12   http:MakeRequest                   ✓      —                   6
 13   http:MakeRequest                   ✓      —                   6
 14   builtin:BasicAggregator            ?      —                   1
 15   http:MakeRequest                   ✓      —                   1
 16   http:MakeRequest                   ✓      —                   2
 17   http:MakeRequest                   ✓      —                   1
────────────────────────────────────────────────────────────────────────────────
                                                    TOTAL ≈  34 ops/book

 ✓✓ = confirmed via app-modules_list / app-module_get   2026-07-25
 ✓  = observed in this account's existing scenarios
 ?  = core/builtin app, NOT yet verified — resolve before blueprint build

 ✗  = connection does not exist yet.  §0.
      ONE connection covers 4 · 6 · 8 · 11.

 CORRECTIONS FROM THE LIVE SCHEMA
 ────────────────────────────────
 · CreateImage        ──► does not exist.  GenerateImage / editImage.
 · choices[].message  ──► does not exist.  output flattens to  result.
 · CreateCompletion   ──► mapper.select = "chat" REQUIRED before model.
 · response_format    ──► present, but an ADVANCED field.
 · editImage          ──► all mapper fields beyond `model` are resolved
                          by RPC per-model — cannot be pre-written blind.

 ALSO AVAILABLE, worth knowing
 ─────────────────────────────
 · openai-gpt-3:createModeration   screens text/images for disallowed
                                   content — a cheap pre-flight before
                                   spending image credits (§6 policy note)
 · openai-gpt-3:analyzeImages      dedicated vision module
 · openai-gpt-3:transformTextToStructuredData
 · openai-gpt-3:makeApiCall        arbitrary authorized OpenAI call —
                                   the escape hatch for anything the
                                   typed modules do not expose
```

---

## 3 · CONNECTOR OPTIONS

```
┌─ LLM  (4, 6) ───────────────────────────────────────────────────────────────┐
│  ●  OpenAI          openai-gpt-3:CreateCompletion             ◄── SELECTED  │
│        response_format: json_object   ── kills JSON drift                   │
│        vision on 4o/4.1 accepts image URLs directly                         │
│  ○  Anthropic Claude · Google Gemini · Make AI Tools (ai-tools:Ask)         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─ IMAGE  (8, 11) ────────────────────────────────────────────────────────────┐
│  ●  OpenAI          openai-gpt-3:editImage                    ◄── SELECTED  │
│        "Creates an edited or extended image given one or more               │
│         source images and a prompt."          ── reference-image capable    │
│                                                                             │
│  ○  openai-gpt-3:GenerateImage    text-only, no source image                │
│        usable for the COVER if you want it unconstrained by the ref,        │
│        but NOT for pages — likeness would drift.                            │
│                                                                             │
│  ○  openai-gpt-3:makeApiCall      arbitrary authorized OpenAI call          │
│        escape hatch only if a needed field is absent from the mapper        │
└─────────────────────────────────────────────────────────────────────────────┘

┌─ PDF  (15) ─────────────────────────────────────────────────────────────────┐
│  ●  Next.js /api/render/pdf  via http:MakeRequest             ◄── SELECTED  │
│  ○  PDF.co · CloudConvert · APITemplate.io · Documint                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─ CLOUDFLARE R2  (9, 13, 16) ────────────────────────────────────────────────┐
│   ✗  NO NATIVE MAKE CONNECTOR FOR R2                                        │
│  ●  http:MakeRequest  PUT ──► presigned URL from Next.js      ◄── SELECTED  │
│  ○  aws-s3:* at R2 S3-compatible endpoint — unreliable, stores keys in Make │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4 · DATA STRUCTURES

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  ✓ CREATED IN TEAM 2123206  ·  2026-07-25                                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
║   505243   LD · DS-1 · Webhook Payload                    strict TRUE        ║
║   505244   LD · SS-1 · Story JSON                         strict false       ║
║   505245   LD · PS-1 · Character Sheet + Image Prompts    strict false       ║
║   505246   LD · AS-1 · Page Assets (aggregator)           strict false       ║
║                                                                              ║
║   DS-1 strict — Next.js controls that payload exactly, so reject             ║
║   malformed input at the door rather than building a plotless book.          ║
║   SS-1/PS-1 lax — LLMs add stray keys; strict would fail the parse.          ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─ DS-1 ── webhook payload (module 1) ────────────────────────────────────────┐
│ jobId                text      req                                          │
│ seed                 number    req                                          │
│ recommendedAgeGroup  text      req              ①                           │
│ audiencePreference   array[t]  req  min 1       ②                           │
│ storyWorld           text      req              ③                           │
│ storyDirection       text      req              ④                           │
│ possibleAdventures   array[t]  req  min 5       ⑤                           │
│ ending               text      req              ⑥                           │
│ storyTheme           text      req              ⑦                           │
│ child                collection req             ⑧                           │
│   ├ name   text req   ├ age  number req                                     │
│   ├ gender text req   └ images array[t] req min 1   R2 KEYS, not base64     │
│ emotionalTheme       array[t]  req  min 1       ⑨                           │
│ callback.baseUrl     text      req                                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─ SS-1 ── story (module 5) ──────────────────────────────────────────────────┐
│ { "title":t, "intro":t, "ch1":t, "ch2":t, "ch3":t, "ch4":t, "ch5":t }       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─ PS-1 ── character sheet + prompts (module 7) ──────────────────────────────┐
│ {                                                                           │
│   "characterSheet": t,        ◄── feeds module 8 prompt                     │
│   "prompts": [                                                              │
│     { "section":"intro", "prompt":t },                                      │
│     { "section":"ch1",   "prompt":t },   … ch2 ch3 ch4 ch5                  │
│   ]                                                                         │
│ }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─ AS-1 ── aggregator target (module 14) ─────────────────────────────────────┐
│ [ { "section": t, "key": t } ]                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5 · PROMPT COMPOSITION

```
   MODULE 4 · STORY            MODULE 6 · SHEET + PROMPTS
   ┌────────────────────┐      ┌──────────────────────────┐
   │ 9 inputs           │      │ SS-1 section text        │
   │ + pronouns    ⑧    │      │ + child.images[]  VISION │
   │ + ageBand     ⑧ VOC│      │ + storyWorld      SET    │
   │ + seed          VAR│      │ + storyTheme      MOTIF  │
   │ + recAgeGroup ① PLT│      │ + emotionalTheme[] MOOD  │
   └─────────┬──────────┘      │ + STYLE GUIDE     FROZEN │
             ▼                 └────────────┬─────────────┘
        SS-1 ×7 fields                      ▼
                                  PS-1  sheet + 6 prompts
                                            │
                    ┌───────────────────────┴──────────────┐
                    ▼                                      ▼
            MODULE 8 · CHAR REF                 MODULE 11 · PAGE ×6
            ┌──────────────────┐                ┌──────────────────┐
            │ characterSheet   │                │ prompts[n]       │
            │ + child photo    │───reference───►│ + CHAR REF img   │
            │ + STYLE GUIDE    │                │ + STYLE GUIDE    │
            └──────────────────┘                └──────────────────┘


   STYLE GUIDE   frozen constant · versioned · identical in 6, 8, 11
   ┌───────────────────────────────────────────────────────────────┐
   │  soft dreamy watercolour · warm cream ground #FFF9F3          │
   │  lavender #8B5CF6 · sky #60A5FA · gold #FBBF24 · mint #6EE7B7 │
   │  gentle line weight · soft rim light · NOT loud cartoon       │
   │  full bleed · child centred · title-safe top third on cover   │
   └───────────────────────────────────────────────────────────────┘

   AGE ─► VOCABULARY        (module 4 system prompt)
   ┌──────────┬───────────────┬──────────────────────────────────┐
   │  3 – 5   │  25-40 w/pg   │  simple clauses, repetition      │
   │  6 – 7   │  40-70 w/pg   │  compound sentences              │
   │  8 – 10  │  70-120 w/pg  │  subplots, richer vocabulary     │
   └──────────┴───────────────┴──────────────────────────────────┘
```

---

## 6 · ERROR HANDLING

```
   4 / 6                 8                 11 / 12 / 13        15 / 16
   LLM                   CHAR REF          image loop          PDF / R2
     │                     │                    │                  │
     ▼                     ▼                    ▼                  ▼
  ┌───────┐          ┌───────────┐         ┌────────┐         ┌───────┐
  │ Break │          │  Break    │         │ Resume │         │ Break │
  │3×·bkof│          │ 2× then   │         │ default│         │3×·bkof│
  └───┬───┘          │ FAIL JOB  │         │ placehr│         └───┬───┘
      │              └─────┬─────┘         └───┬────┘             │
      │                    │                   │                  │
      │       no reference │                   │ 1 bad image      │
      │       ──► no       │                   │ must not kill    │
      │       consistency  │                   │ 5 good ones      │
      ▼                    ▼                   ▼                  ▼
  ┌──────────────────────────────────────────────────────────────────┐
  │ http:MakeRequest                                                 │
  │ POST {{1.callback.baseUrl}}/api/webhooks/make/job-failed         │
  │ { jobId, stage, module, error, retryable }                       │
  │                            ──► Prisma: Job.status = FAILED       │
  └───────────────────────────────┬──────────────────────────────────┘
                                  ▼
                    ┌──────────────────────────┐
                    │ telegram:SendReplyMessage│  bot already in team
                    └──────────────────────────┘


   ┌─────────────────────────────────────────────────────────────────┐
   │ OPENAI MODERATION REFUSAL — treat as its own failure class      │
   │                                                                 │
   │   image edits built from photos of a real minor can be          │
   │   refused by policy.  a refusal returns 400, not an image.      │
   │                                                                 │
   │   ──► detect at module 8, fail the job with a clear reason      │
   │   ──► TEST THIS BEFORE BUILDING ANYTHING ELSE (§8 stage D)      │
   │       it is provider policy, not a bug you can code around      │
   └─────────────────────────────────────────────────────────────────┘
```

---

## 7 · BUILD ORDER (MCP call sequence)

```
  ┌────────────────────────────────────────────────────────────────────┐
  │ 0  connections_list      teamId 2123206                            │
  │       └─ confirm / create  openai-gpt-3                            │
  │                                                                     │
  │ 1  apps_recommend        one call per app, never batched           │
  │ 2  app-modules_list      resolve EVERY "?" slug in §2              │
  │ 3  app-module_get        interface for 4 · 6 · 8 · 11 · 14         │
  │       └─ CHECK: does CreateImage expose an input-image field?      │
  │          if not ──► swap 8 and 11 to http:MakeRequest (§3)         │
  │                                                                     │
  │ 4  data-structures_create   DS-1  SS-1  PS-1  AS-1                 │
  │                                                                     │
  │ 5  validate_module_configuration    per module, left ──► right     │
  │ 6  validate_blueprint_schema        whole blueprint                │
  │                                                                     │
  │ 7  scenarios_update      6695966   (scenario already exists)       │
  │ 8  scenarios_activate    6695966                                   │
  │                                                                     │
  │ 9  VERIFY ── real curl from the user, NOT scenarios_run            │
  │       scenarios_run bypasses webhook parsing and never             │
  │       surfaces gateway:WebhookRespond output                       │
  │                                                                     │
  │10  executions_list ──► executions_get                              │
  │       status:1 ≠ correct data — inspect actual output              │
  └────────────────────────────────────────────────────────────────────┘
```

---

## 8 · STAGED BRING-UP

```
   ┌─────┬──────────────────────────────────┬───────────────────────────┐
   │  A  │  1 ─ 2 ─ 3                       │  202 in <1s               │
   │  B  │  + 4 ─ 5                         │  story JSON parses        │
   │  C  │  + 6 ─ 7                         │  sheet + 6 prompts        │
   │  D  │  + 8                             │  ⚠ POLICY GATE           │
   │  E  │  + 9 ─ 10 ─ 11 ─ 12 ─ 13  (×1)   │  R2 round-trip ✓          │
   │  F  │  full loop  (×6)                 │  ⚠ LIKENESS HOLDS?       │
   │  G  │  + 14 ─ 15 ─ 16 ─ 17             │  PDF in R2                │
   │  H  │  + error handlers                │  job-failed fires         │
   └─────┴──────────────────────────────────┴───────────────────────────┘

     STAGE D   does OpenAI return an image at all from a real child's
               photo, or refuse?  one API call answers it.
               a refusal here is a PRODUCT-LEVEL blocker, not a bug.

     STAGE F   is it the SAME child across all 6 pages?
               everything after G is plumbing by comparison.
```
