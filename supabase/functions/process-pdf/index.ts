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
    const { fileUrl, userId, fileName } = await req.json()

    if (!fileUrl || !userId || !fileName) {
      throw new Error('File URL, user ID, and file name are required')
    }

    console.log(`Processing PDF: ${fileName} for user: ${userId}`)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Use Scrape Do API for PDF processing
    const scrapeDoApiKey = '822a1b7e81f245e49efb58641832963e5b988f1322a'
    
    // Scrape Do can also process PDF files by URL
    const scrapeDoUrl = `https://api.scrape.do?token=${scrapeDoApiKey}&url=${encodeURIComponent(fileUrl)}&format=json&render=true`
    
    console.log('Calling Scrape Do API for PDF processing...')
    
    const response = await fetch(scrapeDoUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'ONEGO-Learning-Bot/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`Scrape Do API error: ${response.status} ${response.statusText}`)
    }

    const scrapeData = await response.json()
    console.log('Scrape Do PDF response received')

    // Extract text content from the response
    const textContent = scrapeData.body || scrapeData.text || ''
    
    if (!textContent) {
      throw new Error('No text content extracted from PDF')
    }

    // Process the extracted text
    const extractedData = {
      fileName: fileName,
      fileType: 'pdf',
      extractedAt: new Date().toISOString(),
      content: {
        title: `PDF Document: ${fileName}`,
        textContent: textContent,
        wordCount: textContent.split(' ').length,
        metadata: {
          title: fileName,
          extractedAt: new Date().toISOString(),
          source: 'scrape-do-api'
        },
        sections: extractSections(textContent),
        keywords: extractKeywords(textContent),
        summary: generateSummary(textContent)
      }
    }

    console.log('PDF processing completed:', extractedData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'PDF processed successfully',
        extractedData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    console.error('Error in process-pdf function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process PDF'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function extractSections(text: string): any[] {
  // Simple section extraction based on common patterns
  const sections = []
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 50)
  
  paragraphs.forEach((paragraph, index) => {
    if (paragraph.trim()) {
      sections.push({
        title: `Section ${index + 1}`,
        content: paragraph.trim(),
        pageNumber: Math.floor(index / 3) + 1 // Estimate page numbers
      })
    }
  })
  
  return sections.slice(0, 10) // Limit to 10 sections
}

function extractKeywords(text: string): string[] {
  // Extract important keywords from the text
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
  
  const wordCount: { [key: string]: number } = {}
  
  words.forEach(word => {
    if (!isStopWord(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1
    }
  })
  
  // Return most frequent words
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word)
}

function generateSummary(text: string): string {
  // Generate a simple summary by taking the first few sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
  return sentences.slice(0, 3).join('. ') + '.'
}

function isStopWord(word: string): boolean {
  const stopWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ]
  
  return stopWords.includes(word)
}