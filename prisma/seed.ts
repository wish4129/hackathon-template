import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed")
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

type SeedQuestion = { title: string; options: string[] }
type SeedTopic = { name: string; emoji: string; questions: SeedQuestion[] }

const GENERIC_4 = ["Option A", "Option B", "Option C", "Option D"]

const TOPICS: SeedTopic[] = [
  {
    name: "Events & Seasonal",
    emoji: "🌸",
    questions: [
      {
        title: "Best events in Brisbane this spring",
        options: [
          "Brisbane Festival",
          "Ekka Royal Show",
          "Paniyiri Greek Festival",
          "Brisbane Open House",
          "Riverfire",
        ],
      },
      { title: "Must-visit festivals in Sydney this month", options: GENERIC_4 },
      { title: "Things to do this weekend near KL", options: GENERIC_4 },
      { title: "Best Christmas markets in Melbourne", options: GENERIC_4 },
      { title: "Upcoming tech events in Singapore", options: GENERIC_4 },
    ],
  },
  {
    name: "Community & Social Impact",
    emoji: "🤝",
    questions: [
      {
        title: "Most fun community service activities in Sydney",
        options: [
          "Beach clean-up at Bondi",
          "OzHarvest food rescue",
          "Tree planting with Landcare",
          "Reading to seniors",
          "Homeless shelter meal prep",
        ],
      },
      { title: "Best volunteering opportunities in Brisbane", options: GENERIC_4 },
      { title: "Team-friendly charity events", options: GENERIC_4 },
      { title: "Environmental initiatives to join locally", options: GENERIC_4 },
      { title: "Corporate social responsibility ideas for teams", options: GENERIC_4 },
    ],
  },
  {
    name: "Travel & Exploration",
    emoji: "✈️",
    questions: [
      { title: "Best weekend getaways from KL", options: GENERIC_4 },
      { title: "Must-visit places in Singapore for first-timers", options: GENERIC_4 },
      { title: "Best beaches near Sydney", options: GENERIC_4 },
      { title: "Hidden gems in Melbourne", options: GENERIC_4 },
      { title: "Best food streets in Penang", options: GENERIC_4 },
    ],
  },
  {
    name: "Health & Wellness",
    emoji: "💪",
    questions: [
      { title: "Best gyms near office", options: GENERIC_4 },
      { title: "Good running routes near KL", options: GENERIC_4 },
      { title: "Best ways to stay active during work", options: GENERIC_4 },
      {
        title: "Yoga vs gym vs sports — what do you prefer?",
        options: ["Yoga", "Gym", "Sports", "Mix of all"],
      },
      { title: "Best healthy lunch options nearby", options: GENERIC_4 },
    ],
  },
  {
    name: "Work Environment & Habits",
    emoji: "☕",
    questions: [
      { title: "Best cafes to work from", options: GENERIC_4 },
      { title: "Quiet spots to focus near office", options: GENERIC_4 },
      {
        title: "Office vs WFH productivity",
        options: ["Office", "WFH", "Hybrid 2-3", "Fully remote"],
      },
      {
        title: "Morning vs afternoon productivity",
        options: ["Morning", "Afternoon", "Late night", "Depends on day"],
      },
      { title: "Best way to run effective meetings", options: GENERIC_4 },
    ],
  },
  {
    name: "Team Culture & Activities",
    emoji: "🎉",
    questions: [
      { title: "Team outing ideas", options: GENERIC_4 },
      { title: "Best team bonding activities", options: GENERIC_4 },
      { title: "Office games to play", options: GENERIC_4 },
      { title: "Friday team activity ideas", options: GENERIC_4 },
      { title: "Virtual team building ideas", options: GENERIC_4 },
    ],
  },
  {
    name: "Learning & Growth",
    emoji: "🧠",
    questions: [
      { title: "Best online learning platforms", options: GENERIC_4 },
      { title: "What skill should you learn next?", options: GENERIC_4 },
      { title: "Best tech newsletters", options: GENERIC_4 },
      { title: "Best podcasts for developers", options: GENERIC_4 },
      { title: "Best courses for career growth", options: GENERIC_4 },
    ],
  },
  {
    name: "Tech Trends",
    emoji: "💻",
    questions: [
      { title: "Best AI tools for daily work", options: GENERIC_4 },
      { title: "Most useful ChatGPT use cases", options: GENERIC_4 },
      {
        title: "AI vs traditional coding tools",
        options: ["AI-first", "AI-assisted", "Traditional", "Mix"],
      },
      { title: "Best browser extensions for productivity", options: GENERIC_4 },
      { title: "Most exciting tech trend right now", options: GENERIC_4 },
      {
        title: "Best testing tool",
        options: ["Playwright", "Cypress", "Vitest", "Jest", "Testing Library"],
      },
    ],
  },
  {
    name: "Fun & Opinions",
    emoji: "🍿",
    questions: [
      { title: "Coffee vs tea", options: ["Coffee", "Tea"] },
      { title: "Mac vs Windows", options: ["Mac", "Windows", "Linux"] },
      { title: "Tabs vs spaces", options: ["Tabs", "Spaces"] },
      { title: "Early bird vs night owl", options: ["Early bird", "Night owl"] },
      { title: "Work from home vs office", options: ["WFH", "Office", "Hybrid"] },
    ],
  },
  {
    name: "Daily Life Decisions",
    emoji: "🛍️",
    questions: [
      { title: "Best food delivery apps", options: GENERIC_4 },
      {
        title: "Grab vs public transport",
        options: ["Grab", "MRT/LRT", "Bus", "Walk / cycle"],
      },
      { title: "Best lunch under $10", options: GENERIC_4 },
      { title: "Best snacks in office", options: GENERIC_4 },
      { title: "Best place for quick coffee", options: GENERIC_4 },
      {
        title: "Where to eat near SG office",
        options: [
          "Maxwell Food Centre",
          "Lau Pa Sat",
          "Amoy Street Food Centre",
          "Tanjong Pagar hawker",
          "One Raffles Place food court",
        ],
      },
    ],
  },
]

async function main() {
  console.log("Clearing existing topic data...")
  await prisma.vote.deleteMany()
  await prisma.option.deleteMany()
  await prisma.question.deleteMany()
  await prisma.topic.deleteMany()

  console.log("Seeding topics...")
  for (const [topicIdx, topic] of TOPICS.entries()) {
    await prisma.topic.create({
      data: {
        name: topic.name,
        emoji: topic.emoji,
        order: topicIdx,
        questions: {
          create: topic.questions.map((q, qIdx) => ({
            title: q.title,
            order: qIdx,
            options: {
              create: q.options.map((text, oIdx) => ({
                text,
                order: oIdx,
              })),
            },
          })),
        },
      },
    })
  }

  const topicCount = await prisma.topic.count()
  const questionCount = await prisma.question.count()
  const optionCount = await prisma.option.count()
  console.log(
    `Seeded ${topicCount} topics, ${questionCount} questions, ${optionCount} options.`,
  )
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
