import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

console.log('User Analytics function initialized')

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header')
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action') || 'get-overview'
    const timeRange = searchParams.get('timeRange') || '30'

    console.log(`Processing ${action} for user ${user.id} with time range ${timeRange}`)

    switch (action) {
      case 'get-overview':
        return await getAnalyticsOverview(user.id, parseInt(timeRange))
      
      case 'get-traffic':
        return await getTrafficSources(user.id, parseInt(timeRange))
      
      case 'get-content':
        return await getContentPerformance(user.id, parseInt(timeRange))
      
      case 'get-keywords':
        return await getKeywordPerformance(user.id, parseInt(timeRange))
      
      case 'generate-sample':
        return await generateSampleData(user.id)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function getAnalyticsOverview(userId: string, days: number) {
  // Get analytics data for the specified time range
  const { data: analyticsData, error: analyticsError } = await supabase
    .from('user_analytics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date', { ascending: false })

  if (analyticsError) {
    console.error('Analytics data error:', analyticsError)
    throw analyticsError
  }

  // Get blog posts count
  const { count: totalPosts } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Calculate aggregated metrics
  const totalViews = analyticsData.reduce((sum, day) => sum + (day.page_views || 0), 0)
  const totalVisitors = analyticsData.reduce((sum, day) => sum + (day.unique_visitors || 0), 0)
  const avgBounceRate = analyticsData.length > 0 
    ? analyticsData.reduce((sum, day) => sum + (day.bounce_rate || 0), 0) / analyticsData.length 
    : 0
  const avgTimeOnPage = analyticsData.length > 0 
    ? analyticsData.reduce((sum, day) => sum + (day.avg_time_on_page || 0), 0) / analyticsData.length 
    : 0
  const avgConversionRate = analyticsData.length > 0 
    ? analyticsData.reduce((sum, day) => sum + (day.conversion_rate || 0), 0) / analyticsData.length 
    : 0
  const totalRevenue = analyticsData.reduce((sum, day) => sum + (day.revenue || 0), 0)

  // Calculate ROI (simple calculation based on revenue vs estimated costs)
  const estimatedCosts = totalPosts * 10 // €10 per post estimated cost
  const roi = estimatedCosts > 0 ? ((totalRevenue - estimatedCosts) / estimatedCosts) * 100 : 0

  // Calculate growth rates (compare first half vs second half of period)
  const midPoint = Math.floor(analyticsData.length / 2)
  const firstHalf = analyticsData.slice(midPoint)
  const secondHalf = analyticsData.slice(0, midPoint)
  
  const firstHalfViews = firstHalf.reduce((sum, day) => sum + (day.page_views || 0), 0)
  const secondHalfViews = secondHalf.reduce((sum, day) => sum + (day.page_views || 0), 0)
  const viewsGrowth = firstHalfViews > 0 ? ((secondHalfViews - firstHalfViews) / firstHalfViews) * 100 : 0

  const overview = {
    totalPosts: totalPosts || 0,
    totalViews,
    uniqueVisitors: totalVisitors,
    avgTimeOnPage: Math.round(avgTimeOnPage),
    bounceRate: Math.round(avgBounceRate * 100) / 100,
    conversionRate: Math.round(avgConversionRate * 100) / 100,
    revenue: Math.round(totalRevenue * 100) / 100,
    roi: Math.round(roi),
    viewsGrowth: Math.round(viewsGrowth),
    dailyData: analyticsData
  }

  return new Response(
    JSON.stringify({ success: true, data: overview }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getTrafficSources(userId: string, days: number) {
  // Get analytics data for traffic sources
  const { data: analyticsData, error } = await supabase
    .from('user_analytics')  
    .select('organic_traffic, direct_traffic, social_traffic, referral_traffic')
    .eq('user_id', userId)
    .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

  if (error) {
    throw error
  }

  const totalOrganic = analyticsData.reduce((sum, day) => sum + (day.organic_traffic || 0), 0)
  const totalDirect = analyticsData.reduce((sum, day) => sum + (day.direct_traffic || 0), 0)
  const totalSocial = analyticsData.reduce((sum, day) => sum + (day.social_traffic || 0), 0)
  const totalReferral = analyticsData.reduce((sum, day) => sum + (day.referral_traffic || 0), 0)
  const totalTraffic = totalOrganic + totalDirect + totalSocial + totalReferral

  const traffic = {
    organic: {
      value: totalTraffic > 0 ? Math.round((totalOrganic / totalTraffic) * 100 * 10) / 10 : 0,
      change: '+12%' // Placeholder for growth calculation
    },
    direct: {
      value: totalTraffic > 0 ? Math.round((totalDirect / totalTraffic) * 100 * 10) / 10 : 0,
      change: '+5%'
    },
    social: {
      value: totalTraffic > 0 ? Math.round((totalSocial / totalTraffic) * 100 * 10) / 10 : 0,
      change: '-3%'
    },
    referral: {
      value: totalTraffic > 0 ? Math.round((totalReferral / totalTraffic) * 100 * 10) / 10 : 0,
      change: '+8%'
    }
  }

  return new Response(
    JSON.stringify({ success: true, data: traffic }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getContentPerformance(userId: string, days: number) {
  // Get top performing blog posts
  const { data: blogPosts, error } = await supabase
    .from('blog_posts')
    .select('title, slug, created_at, word_count')
    .eq('user_id', userId)
    .eq('status', 'publish')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    throw error
  }

  // Generate sample performance data for each post
  const topPosts = blogPosts.map((post, index) => ({
    title: post.title,
    views: Math.floor(Math.random() * 10000) + 1000,
    ctr: Math.round((Math.random() * 3 + 1) * 100) / 100,
    revenue: Math.floor(Math.random() * 1000) + 100
  })).sort((a, b) => b.views - a.views).slice(0, 5)

  return new Response(
    JSON.stringify({ success: true, data: topPosts }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getKeywordPerformance(userId: string, days: number) {
  // Generate sample keyword data (in real app, this would come from Google Search Console API)
  const sampleKeywords = [
    'seo tips', 'content marketing', 'local business', 'website builder', 'digital marketing',
    'blog writing', 'social media', 'email marketing', 'wordpress', 'web design'
  ]

  const keywords = sampleKeywords.slice(0, 5).map(keyword => ({
    keyword,
    position: Math.floor(Math.random() * 20) + 1,
    clicks: Math.floor(Math.random() * 1000) + 100,
    impressions: Math.floor(Math.random() * 10000) + 1000,
    ctr: Math.round((Math.random() * 10 + 2) * 100) / 100
  }))

  return new Response(
    JSON.stringify({ success: true, data: keywords }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function generateSampleData(userId: string) {
  // Call the database function to generate sample analytics data
  const { error } = await supabase
    .rpc('generate_sample_analytics', { target_user_id: userId })

  if (error) {
    console.error('Error generating sample data:', error)
    throw error
  }

  return new Response(
    JSON.stringify({ success: true, message: 'Sample analytics data generated successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}