import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { websiteUrl, userId } = await req.json()

    if (!websiteUrl || !userId) {
      throw new Error('Website URL and user ID are required')
    }

    console.log(`Scraping website: ${websiteUrl} for user: ${userId}`)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Normalize URL - add https if no protocol
    let normalizedUrl = websiteUrl.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    console.log(`Normalized URL: ${normalizedUrl}`)

    // Use Scrape Do API with the correct format from your example
    const scrapeDoApiKey = '822a1b7e81f245e49efb58641832963e5b988f1322a'
    const encodedUrl = encodeURIComponent(normalizedUrl)
    const scrapeDoUrl = `http://api.scrape.do/?url=${encodedUrl}&token=${scrapeDoApiKey}`
    
    console.log('Calling Scrape Do API with URL:', scrapeDoUrl)
    
    const response = await fetch(scrapeDoUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'ONEGO-Learning-Bot/1.0'
      }
    })

    console.log(`Scrape Do API response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Scrape Do API error: ${response.status} ${response.statusText} - ${errorText}`)
      throw new Error(`Failed to fetch website content: ${response.status} ${response.statusText}`)
    }

    const scrapeData = await response.json()
    console.log('Scrape Do response received, processing...')

    // The response should contain the HTML content
    const html = scrapeData.body || scrapeData.html || scrapeData.content || ''
    
    if (!html) {
      console.error('No HTML content in response:', Object.keys(scrapeData))
      throw new Error('No HTML content received from the website')
    }

    console.log(`HTML content length: ${html.length} characters`)

    // Check if this is a parking page
    if (isParkingPage(html)) {
      throw new Error('This appears to be a parking page or domain for sale. Please check the URL and try again.')
    }
    
    // Extract key information from the HTML
    const extractedData = extractKeyInformation(html, normalizedUrl)
    
    console.log('Extracted data:', {
      title: extractedData.title,
      wordCount: extractedData.wordCount,
      keywordsCount: extractedData.businessKeywords?.length || 0
    })

    // Store the scraped content in the database
    const { error: upsertError } = await supabase
      .from('company_website_data')
      .upsert({
        user_id: userId,
        website_url: normalizedUrl,
        scraped_content: extractedData,
        last_scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (upsertError) {
      console.error('Database upsert error:', upsertError)
      throw new Error(`Failed to store scraped data: ${upsertError.message}`)
    }

    console.log('Successfully stored scraped data in database')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Website scraped successfully',
        extractedData,
        finalUrl: normalizedUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    console.error('Error in scrape-website function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to scrape website'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function isParkingPage(html: string): boolean {
  const parkingIndicators = [
    'this domain may be for sale',
    'parked domain',
    'domain parking',
    'buy this domain',
    'domain for sale',
    'expired domain',
    'coming soon',
    'under construction'
  ]
  
  const lowerHtml = html.toLowerCase()
  return parkingIndicators.some(indicator => lowerHtml.includes(indicator))
}

function extractKeyInformation(html: string, websiteUrl: string): any {
  // Remove scripts and styles for cleaner text extraction
  const cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : ''

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)
  const description = descMatch ? descMatch[1].trim() : ''

  // Extract key sections (first 2000 characters of clean text)
  const mainContent = cleanHtml.substring(0, 2000)

  // Extract common business-related keywords
  const businessKeywords = extractBusinessKeywords(cleanHtml.toLowerCase())
  
  // Extract company-specific terms (frequent capitalized words)
  const companyTerms = extractCompanyTerms(html)

  // Extract navigation/menu items to understand site structure
  const navigationItems = extractNavigationItems(html)

  return {
    url: websiteUrl,
    title,
    description,
    mainContent,
    businessKeywords,
    companyTerms,
    navigationItems,
    extractedAt: new Date().toISOString(),
    wordCount: cleanHtml.split(' ').length
  }
}

function extractBusinessKeywords(text: string): string[] {
  const businessTerms = [
    'mission', 'vision', 'values', 'about', 'company', 'business', 'services', 'products',
    'solutions', 'team', 'experience', 'expertise', 'industry', 'customers', 'clients',
    'innovation', 'technology', 'quality', 'excellence', 'professional', 'development',
    'training', 'consultation', 'support', 'partnership', 'collaboration', 'strategy',
    'management', 'leadership', 'growth', 'success', 'results', 'performance',
    'safety', 'security', 'compliance', 'efficiency', 'productivity', 'optimization'
  ]

  const foundTerms: string[] = []
  
  businessTerms.forEach(term => {
    if (text.includes(term)) {
      foundTerms.push(term)
    }
  })

  return [...new Set(foundTerms)] // Remove duplicates
}

function extractCompanyTerms(html: string): string[] {
  // Extract words that appear capitalized multiple times (likely company-specific terms)
  const capitalizedWords = html.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []
  
  const termCount: { [key: string]: number } = {}
  
  capitalizedWords.forEach(word => {
    if (word.length > 2 && !isCommonWord(word)) {
      termCount[word] = (termCount[word] || 0) + 1
    }
  })

  // Return terms that appear more than once
  return Object.entries(termCount)
    .filter(([_, count]) => count > 1)
    .map(([term, _]) => term)
    .slice(0, 20) // Limit to 20 terms
}

function extractNavigationItems(html: string): string[] {
  // Extract navigation menu items
  const navMatches = html.match(/<nav[^>]*>[\s\S]*?<\/nav>/gi) || []
  const menuMatches = html.match(/<ul[^>]*class="[^"]*menu[^"]*"[^>]*>[\s\S]*?<\/ul>/gi) || []
  
  const allNavContent = [...navMatches, ...menuMatches].join(' ')
  const linkMatches = allNavContent.match(/<a[^>]*>([^<]+)<\/a>/gi) || []
  
  return linkMatches
    .map(link => link.replace(/<[^>]+>/g, '').trim())
    .filter(text => text.length > 0 && text.length < 50)
    .slice(0, 15) // Limit to 15 items
}

function isCommonWord(word: string): boolean {
  const commonWords = [
    'The', 'And', 'For', 'Are', 'But', 'Not', 'You', 'All', 'Can', 'Had', 'Her', 'Was', 'One',
    'Our', 'Out', 'Day', 'Get', 'Has', 'Him', 'His', 'How', 'Its', 'May', 'New', 'Now', 'Old',
    'See', 'Two', 'Who', 'Boy', 'Did', 'She', 'Use', 'Way', 'Web', 'Why', 'You', 'More', 'Home',
    'Page', 'About', 'Contact', 'News', 'Blog', 'Search', 'Login', 'Sign', 'Register'
  ]
  
  return commonWords.includes(word)
}