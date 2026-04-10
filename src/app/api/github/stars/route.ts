import { NextResponse } from 'next/server'

const REPO = 'PabloViniegra/rag-youtube-advancer'

interface GitHubRepo {
  stargazers_count: number
}

export async function GET() {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  // Use token if available — required for private repos, raises rate limit for public ones
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers,
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return NextResponse.json({ stars: 0 }, { status: 200 })
    }

    const data = (await res.json()) as GitHubRepo
    return NextResponse.json({ stars: data.stargazers_count })
  } catch {
    return NextResponse.json({ stars: 0 }, { status: 200 })
  }
}
