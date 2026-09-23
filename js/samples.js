// Real product launch films for the hero + reel.
// Briefs were read from each live site by the server reader (JEV), then
// curated: headline, features, stats and brand colors are the site's own.
// Each film carries an explicit style and motionVariation so no two cuts
// look alike across the shelf.

export const SAMPLES = [
  {
    style: "editorial",
    motionVariation: "mv004",
    note: "AI assistant",
    aspect: "16:9",
    brief: {
      name: "Claude",
      domain: "claude.com",
      headline: "Think fast, build faster",
      hook: ["Think fast", "build", "faster"],
      description: "Claude is a next generation AI assistant built by Anthropic and trained to be safe, accurate and secure.",
      features: [
        { title: "Claude Platform", desc: "Claude delegates to other agents, each with its own independent context window." },
        { title: "Memory tool", desc: "Claude reads and writes to memory stores, so every session gets progressively better." },
        { title: "Multiagent orchestration", desc: "Route work across agents that reason independently, then converge on an answer." }
      ],
      stats: [{ value: "20x", label: "more usage than Pro" }, { value: "5x", label: "faster on long tasks" }],
      cta: "Try Claude",
      colors: ["#d97757", "#fbbc05", "#4285f4"],
      category: "AI assistant"
    }
  },
  {
    style: "neon",
    motionVariation: "mv009",
    note: "Developer tools",
    aspect: "16:9",
    brief: {
      name: "Firecrawl",
      domain: "firecrawl.dev",
      headline: "Power AI agents with clean web data",
      hook: ["Power AI agents", "with clean", "web data"],
      description: "The web data API to search, scrape and interact with the web at scale. Turn any source into clean Markdown.",
      features: [
        { title: "Easily connect your agents", desc: "Zapier uses Firecrawl to power custom web knowledge in Zapier Chatbots." },
        { title: "We handle the hard stuff", desc: "Firecrawl is the engine behind custom web knowledge sources." },
        { title: "The knowledge library", desc: "Sierra uses Firecrawl to ingest web data into knowledge bases that power AI chat." }
      ],
      stats: [{ value: "75M", label: "in Series B funding" }, { value: "50x", label: "faster with AgentOps" }],
      cta: "Start scraping",
      colors: ["#3186ff", "#781e00", "#fabc12"],
      category: "developer tool"
    }
  },
  {
    style: "pop",
    motionVariation: "mv006",
    note: "Marketing",
    aspect: "16:9",
    brief: {
      name: "Naise AI",
      domain: "naise.ai",
      headline: "Automate your marketing 10x faster",
      hook: ["Automate your", "marketing", "10x faster"],
      description: "Your AI teammate for marketing. One AI runs social, influencer, PR and image generation in any language.",
      features: [
        { title: "Scale output, not overhead", desc: "Naise acts as a silent operator for every client account." },
        { title: "A team that never sleeps", desc: "One AI teammate runs your Social, Influencer and PR in any language, any market." },
        { title: "Your marketing, fully automated", desc: "Image generation, media lists, campaigns and reporting, handled end to end." }
      ],
      stats: [{ value: "10M", label: "AI matches made" }, { value: "2 weeks", label: "to get started" }],
      cta: "Meet your AI teammate",
      colors: ["#d4ff00", "#0b7b3e", "#16c060"],
      category: "marketing automation"
    }
  },
  {
    style: "editorial",
    motionVariation: "mv008",
    note: "AI assistant",
    aspect: "16:9",
    brief: {
      name: "ToneBird",
      domain: "tonebird.ai",
      headline: "You don't have to be stuck on words again",
      hook: ["Never stuck", "on words", "again"],
      description: "Draft replies in your email and chat apps using past conversations and connected documents.",
      features: [
        { title: "The right reply starts with context", desc: "ToneBird understands your relationships, what you've already said, and where you left off." },
        { title: "Keep your voice intact", desc: "Draft replies that still sound like you, in every app you write in." },
        { title: "From reply to follow-up", desc: "Use past conversations and connected documents to move every thread forward." }
      ],
      stats: [{ value: "3", label: "apps, one assistant" }],
      cta: "Write with ToneBird",
      colors: ["#3a6fe0", "#f4a6b8", "#141414"],
      category: "AI assistant"
    }
  },
  {
    style: "kinetic",
    motionVariation: "mv003",
    note: "Design tools",
    aspect: "16:9",
    brief: {
      name: "Framer",
      domain: "framer.com",
      headline: "The design agent for every step from idea to launch",
      hook: ["From idea", "to launch", "with an agent"],
      description: "Go from idea to launch with an agent that designs and builds on the canvas. Every change stays editable.",
      features: [
        { title: "Design with an agent", desc: "An agent that designs and builds on the canvas, with every change still editable." },
        { title: "Run your CMS with an agent", desc: "Publish and keep content moving without leaving the canvas." },
        { title: "Code with an agent", desc: "Hosting, security and infrastructure handled from the first idea." }
      ],
      stats: [{ value: "20", label: "designs on the canvas" }, { value: "1", label: "place from idea to launch" }],
      cta: "Start designing",
      colors: ["#00ccff", "#00dd66", "#ffbb00"],
      category: "design tool"
    }
  },
  {
    style: "pop",
    motionVariation: "mv005",
    note: "Collaboration",
    aspect: "16:9",
    brief: {
      name: "Pactto",
      domain: "pactto.com",
      headline: "The room where creative teams meet and AI takes action",
      hook: ["Meet", "align", "act"],
      description: "Persistent collaboration rooms where creative teams present at studio quality and review with an AI agent.",
      features: [
        { title: "Present at studio quality", desc: "Bring your assets, present at the highest quality, review together, and decide." },
        { title: "Voice comments in. Agents act, live.", desc: "Speak your notes and watch AI agents apply them across the room in real time." },
        { title: "Real-time translation, no barriers", desc: "Review together in any language, with every note understood." }
      ],
      stats: [{ value: "1", label: "room for every review" }],
      cta: "Open a room",
      colors: ["#3c4dff", "#f0b45b", "#141414"],
      category: "creative collaboration"
    }
  },
  {
    style: "kinetic",
    motionVariation: "mv007",
    note: "AI agents",
    aspect: "16:9",
    brief: {
      name: "Solid",
      domain: "solid.tech",
      headline: "Agents with their own computers, accounts, and budgets",
      hook: ["Give them", "a job", "they finish it"],
      description: "Give an agent a job and it connects to the tools it needs, builds what's missing, and checks the result.",
      features: [
        { title: "Hand over the job. Get the result.", desc: "They connect to any tool the job needs, build what's missing, and check the result." },
        { title: "Setup and troubleshooting included", desc: "They choose the tools and handle the setup, even for software you've never used." },
        { title: "Deploy always-on agents", desc: "Give them a job and they keep working, within boundaries you control." }
      ],
      stats: [{ value: "24/7", label: "agents on the job" }, { value: "0", label: "setup required" }],
      cta: "Ship an agent",
      colors: ["#7c5cff", "#35d0ff", "#141414"],
      category: "AI agents"
    }
  },
  {
    style: "neon",
    motionVariation: "mv001",
    note: "Link infrastructure",
    aspect: "16:9",
    brief: {
      name: "Dub",
      domain: "dub.co",
      headline: "Turn clicks into revenue",
      hook: ["Turn clicks", "into", "revenue"],
      description: "The modern link attribution platform for short links, conversion tracking and affiliate programs.",
      features: [
        { title: "Built to scale", desc: "Manage short links at scale with folders and role-based access control." },
        { title: "Measure what matters", desc: "Conversion tracking and analytics that go far beyond vanity metrics." },
        { title: "Grow with partnerships", desc: "Program marketplace, affiliate revenue and payouts in one place." }
      ],
      stats: [{ value: "12.5K", label: "leads tracked" }, { value: "450M", label: "payouts processed" }],
      cta: "Start for free",
      colors: ["#00d5be", "#ffba00", "#ff6467"],
      category: "link infrastructure"
    }
  },
  {
    style: "mono",
    motionVariation: "mv002",
    note: "Developer tools",
    aspect: "16:9",
    brief: {
      name: "Resend",
      domain: "resend.com",
      headline: "Email for developers",
      hook: ["Email", "for", "developers"],
      description: "The best way to reach humans instead of spam folders. Deliver transactional and marketing email with ease.",
      features: [
        { title: "Develop emails using React", desc: "Build and test emails with the tools you already use to ship software." },
        { title: "Broadcast analytics", desc: "Group and control your contacts in a simple, intuitive way." },
        { title: "First-class developer experience", desc: "The best way to reach humans instead of spam folders." }
      ],
      stats: [{ value: "2", label: "hours saved per launch" }],
      cta: "Start sending",
      colors: ["#00a3ff", "#9b7cff", "#62ffb3"],
      category: "developer tool"
    }
  },
  {
    style: "neon",
    motionVariation: "mv010",
    note: "Cloud platform",
    aspect: "16:9",
    brief: {
      name: "Vercel",
      domain: "vercel.com",
      headline: "Build agents on infrastructure that thinks like them",
      hook: ["Agents on", "infrastructure", "built for agents"],
      description: "The autonomous stack for every app and agent, from your first deploy to global scale.",
      features: [
        { title: "Host platforms that serve every customer", desc: "Zapier serves over 100 million monthly website visits on Vercel." },
        { title: "Built by you, or your agents", desc: "Ship apps and agents, with infrastructure automated by agents." },
        { title: "Agent Stack", desc: "The autonomous stack for every app and agent." }
      ],
      stats: [{ value: "100M", label: "monthly visits served" }],
      cta: "Deploy now",
      colors: ["#ffb224", "#0070f3", "#ff975c"],
      category: "cloud platform"
    }
  },
  {
    style: "kinetic",
    motionVariation: "mv011",
    note: "Product planning",
    aspect: "9:16",
    brief: {
      name: "Linear",
      domain: "linear.app",
      headline: "Build, review, and ship",
      hook: ["Build", "review", "ship"],
      description: "Purpose-built for planning and building products with AI agents.",
      features: [
        { title: "Planning and monitoring", desc: "Purpose-built for planning and building products with AI agents." },
        { title: "Intake and integrations", desc: "Plan and navigate from idea to launch without losing the thread." },
        { title: "Faster app launch", desc: "Keep every cycle short, legible and on track." }
      ],
      stats: [{ value: "1", label: "place for every cycle" }],
      cta: "Start building",
      colors: ["#d4a600", "#8fa6ff", "#ffc47c"],
      category: "product planning"
    }
  },
  {
    style: "mono",
    motionVariation: "mv012",
    note: "Support desk",
    aspect: "9:16",
    brief: {
      name: "Kindling",
      domain: "kindling.support",
      headline: "Support that feels human",
      hook: ["Answer faster", "stay human", "keep trust"],
      description: "A modern support desk for teams that want every reply to feel like a good one.",
      features: [
        { title: "The right answer, sooner", desc: "Bring context into every conversation before it starts." },
        { title: "A shared calm inbox", desc: "Let the team help without stepping on each other." },
        { title: "Support worth remembering", desc: "Turn a solved problem into a stronger relationship." }
      ],
      stats: [{ value: "41%", label: "faster first reply" }],
      cta: "Make support feel good",
      colors: ["#e85d75", "#fde68a", "#1f2937"],
      category: "customer support"
    }
  }
];
