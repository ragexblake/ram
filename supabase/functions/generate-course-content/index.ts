import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { course } = await req.json();

    if (!course) {
      throw new Error('Course data is required');
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    // Create a comprehensive prompt for course content generation
    const systemPrompt = `You are an expert course content creator. Generate comprehensive, structured course content based on the provided course information.

CRITICAL REQUIREMENTS:
- Create exactly 4 main sections with 3-4 subsections each
- Each subsection should have substantial, educational content (300-500 words)
- Include practical examples and real-world applications
- Make content engaging and easy to understand
- Structure content with proper headings and bullet points
- Ensure content flows logically from basic to advanced concepts

Return the response as a JSON object with this exact structure:
{
  "sections": [
    {
      "id": "section-1",
      "title": "Section Title",
      "description": "Brief section description",
      "subsections": [
        {
          "id": "subsection-1-1",
          "title": "Subsection Title",
          "content": "Detailed HTML content with headings, paragraphs, lists, etc.",
          "hasQuiz": true/false
        }
      ]
    }
  ]
}

CONTENT GUIDELINES:
- Use HTML formatting: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- Include practical examples and case studies
- Add quizzes to every 3rd or 4th subsection
- Make content relevant to the course goal and industry
- Ensure progressive difficulty from basic to advanced`;

    const userPrompt = `Generate comprehensive course content for:

Course Title: ${course.course_title}
Track Type: ${course.track_type}
Course Goal: ${course.course_plan?.goal || 'Professional development'}
Industry: ${course.course_plan?.industry || 'General'}
Subject: ${course.course_plan?.subject || 'General'}
Skill Level: ${course.course_plan?.skillLevel || 'Intermediate'}
Duration: ${course.course_plan?.duration || '30 minutes'}

Create 4 main sections with 3-4 subsections each. Make the content educational, practical, and engaging.`;

    console.log('Generating course content with Groq...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      throw new Error(`Groq API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    let courseContent = data.choices[0].message.content;

    console.log('Generated course content:', courseContent);

    // Try to parse as JSON, if it fails, create a structured fallback
    let structuredContent;
    try {
      // Remove any markdown code blocks if present
      courseContent = courseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      structuredContent = JSON.parse(courseContent);
    } catch (parseError) {
      console.log('Failed to parse JSON, creating fallback structure');
      
      // Create a fallback structure based on course type
      if (course.track_type === 'Corporate') {
        structuredContent = createCorporateFallback(course);
      } else {
        structuredContent = createEducationalFallback(course);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        courseContent: structuredContent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-course-content function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function createCorporateFallback(course: any) {
  const goal = course.course_plan?.goal || 'professional skills';
  const industry = course.course_plan?.industry || 'business';
  
  return {
    sections: [
      {
        id: "section-1",
        title: "Introduction",
        description: "Course overview and fundamentals",
        subsections: [
          {
            id: "subsection-1-1",
            title: "Welcome",
            content: `
              <h2>Welcome to ${course.course_title}</h2>
              <p>Welcome to this comprehensive training program designed to enhance your ${goal} in the ${industry} industry.</p>
              
              <h3>What You'll Learn</h3>
              <ul>
                <li><strong>Core Concepts:</strong> Master the fundamental principles</li>
                <li><strong>Practical Application:</strong> Apply knowledge in real scenarios</li>
                <li><strong>Best Practices:</strong> Learn industry standards</li>
                <li><strong>Professional Growth:</strong> Develop career-advancing skills</li>
              </ul>
              
              <h3>Course Structure</h3>
              <p>This course is organized into progressive modules that build upon each other, ensuring a comprehensive understanding of the subject matter.</p>
            `,
            hasQuiz: false
          },
          {
            id: "subsection-1-2",
            title: "Learning Objectives",
            content: `
              <h2>Learning Objectives</h2>
              <p>By the end of this course, you will be able to:</p>
              
              <ul>
                <li>Understand key concepts and terminology</li>
                <li>Apply learned principles in practical situations</li>
                <li>Identify best practices and common pitfalls</li>
                <li>Develop strategies for continuous improvement</li>
              </ul>
              
              <h3>Assessment Criteria</h3>
              <p>Your progress will be measured through:</p>
              <ul>
                <li>Knowledge check quizzes</li>
                <li>Practical exercises</li>
                <li>Real-world scenario applications</li>
              </ul>
            `,
            hasQuiz: true
          }
        ]
      },
      {
        id: "section-2",
        title: `Understanding ${industry}`,
        description: "Industry fundamentals and context",
        subsections: [
          {
            id: "subsection-2-1",
            title: "Industry Overview",
            content: `
              <h2>${industry} Industry Overview</h2>
              <p>The ${industry} sector plays a crucial role in today's economy, with unique challenges and opportunities.</p>
              
              <h3>Key Characteristics</h3>
              <ul>
                <li>Market dynamics and trends</li>
                <li>Regulatory environment</li>
                <li>Technology impact</li>
                <li>Competitive landscape</li>
              </ul>
              
              <h3>Current Trends</h3>
              <p>Understanding current market trends is essential for success in this field.</p>
            `,
            hasQuiz: false
          },
          {
            id: "subsection-2-2",
            title: "Key Players and Stakeholders",
            content: `
              <h2>Key Players and Stakeholders</h2>
              <p>Success in ${industry} requires understanding the various stakeholders and their roles.</p>
              
              <h3>Primary Stakeholders</h3>
              <ul>
                <li><strong>Customers:</strong> End users and decision makers</li>
                <li><strong>Partners:</strong> Strategic alliances and vendors</li>
                <li><strong>Regulators:</strong> Compliance and oversight bodies</li>
                <li><strong>Competitors:</strong> Market rivals and alternatives</li>
              </ul>
              
              <h3>Stakeholder Management</h3>
              <p>Effective stakeholder management involves understanding their needs, expectations, and influence on your success.</p>
            `,
            hasQuiz: true
          }
        ]
      },
      {
        id: "section-3",
        title: `${goal} Development`,
        description: "Core skill development and application",
        subsections: [
          {
            id: "subsection-3-1",
            title: "Core Competencies",
            content: `
              <h2>Core Competencies for ${goal}</h2>
              <p>Developing strong ${goal} requires mastering several key competencies.</p>
              
              <h3>Essential Skills</h3>
              <ul>
                <li><strong>Communication:</strong> Clear and effective interaction</li>
                <li><strong>Problem-solving:</strong> Analytical thinking and solution development</li>
                <li><strong>Leadership:</strong> Influencing and guiding others</li>
                <li><strong>Adaptability:</strong> Thriving in changing environments</li>
              </ul>
              
              <h3>Skill Development Framework</h3>
              <p>A systematic approach to developing these competencies through practice and feedback.</p>
            `,
            hasQuiz: false
          },
          {
            id: "subsection-3-2",
            title: "Practical Applications",
            content: `
              <h2>Practical Applications</h2>
              <p>Learn how to apply ${goal} in real-world scenarios specific to ${industry}.</p>
              
              <h3>Common Scenarios</h3>
              <ul>
                <li>Client interactions and presentations</li>
                <li>Team collaboration and leadership</li>
                <li>Problem-solving and decision-making</li>
                <li>Performance optimization</li>
              </ul>
              
              <h3>Best Practices</h3>
              <p>Industry-proven approaches that lead to consistent success.</p>
            `,
            hasQuiz: true
          }
        ]
      },
      {
        id: "section-4",
        title: "Implementation and Mastery",
        description: "Advanced techniques and continuous improvement",
        subsections: [
          {
            id: "subsection-4-1",
            title: "Advanced Techniques",
            content: `
              <h2>Advanced Techniques</h2>
              <p>Take your ${goal} to the next level with advanced strategies and techniques.</p>
              
              <h3>Advanced Strategies</h3>
              <ul>
                <li>Complex problem-solving methodologies</li>
                <li>Strategic thinking and planning</li>
                <li>Innovation and creativity techniques</li>
                <li>Performance optimization methods</li>
              </ul>
              
              <h3>Expert-Level Applications</h3>
              <p>Learn how experts in ${industry} apply these advanced concepts to achieve exceptional results.</p>
            `,
            hasQuiz: false
          },
          {
            id: "subsection-4-2",
            title: "Continuous Improvement",
            content: `
              <h2>Continuous Improvement</h2>
              <p>Develop a mindset and framework for ongoing professional development.</p>
              
              <h3>Improvement Strategies</h3>
              <ul>
                <li><strong>Self-Assessment:</strong> Regular evaluation of skills and performance</li>
                <li><strong>Feedback Integration:</strong> Learning from others and experiences</li>
                <li><strong>Goal Setting:</strong> Establishing clear development objectives</li>
                <li><strong>Skill Updates:</strong> Staying current with industry changes</li>
              </ul>
              
              <h3>Long-term Success</h3>
              <p>Building sustainable practices for career-long learning and growth.</p>
            `,
            hasQuiz: true
          }
        ]
      }
    ]
  };
}

function createEducationalFallback(course: any) {
  const subject = course.course_plan?.subject || 'the subject';
  const objective = course.course_plan?.objective || 'learning objectives';
  
  return {
    sections: [
      {
        id: "section-1",
        title: "Introduction",
        description: "Course overview and learning objectives",
        subsections: [
          {
            id: "subsection-1-1",
            title: "Welcome",
            content: `
              <h2>Welcome to ${course.course_title}</h2>
              <p>Welcome to this exciting learning journey into ${subject}! This course is designed to help you master ${objective}.</p>
              
              <h3>What You'll Discover</h3>
              <ul>
                <li><strong>Fundamental Concepts:</strong> Build a solid foundation</li>
                <li><strong>Practical Skills:</strong> Apply knowledge through exercises</li>
                <li><strong>Critical Thinking:</strong> Develop analytical abilities</li>
                <li><strong>Real-World Connections:</strong> See how concepts apply in life</li>
              </ul>
              
              <h3>Learning Approach</h3>
              <p>We'll use interactive examples, visual aids, and step-by-step explanations to make learning engaging and effective.</p>
            `,
            hasQuiz: false
          },
          {
            id: "subsection-1-2",
            title: "Course Navigation",
            content: `
              <h2>How to Use This Course</h2>
              <p>Navigate through the course using the sidebar menu. Each section builds on the previous one.</p>
              
              <h3>Learning Tips</h3>
              <ul>
                <li>Take notes as you read</li>
                <li>Complete all quizzes to test understanding</li>
                <li>Review previous sections if needed</li>
                <li>Practice concepts regularly</li>
              </ul>
              
              <h3>Assessment</h3>
              <p>Your understanding will be checked through quizzes and practical exercises throughout the course.</p>
            `,
            hasQuiz: true
          }
        ]
      },
      {
        id: "section-2",
        title: `${subject} Fundamentals`,
        description: "Core concepts and principles",
        subsections: [
          {
            id: "subsection-2-1",
            title: "Basic Concepts",
            content: `
              <h2>Basic Concepts in ${subject}</h2>
              <p>Let's start with the fundamental building blocks that form the foundation of ${subject}.</p>
              
              <h3>Key Terminology</h3>
              <ul>
                <li>Essential definitions and vocabulary</li>
                <li>Common symbols and notation</li>
                <li>Basic principles and rules</li>
                <li>Historical context and development</li>
              </ul>
              
              <h3>Why These Matter</h3>
              <p>Understanding these basics will help you build confidence and tackle more complex topics with ease.</p>
            `,
            hasQuiz: false
          },
          {
            id: "subsection-2-2",
            title: "Core Principles",
            content: `
              <h2>Core Principles</h2>
              <p>These fundamental principles guide everything we do in ${subject}.</p>
              
              <h3>Universal Rules</h3>
              <ul>
                <li>Primary laws and guidelines</li>
                <li>Logical reasoning patterns</li>
                <li>Problem-solving approaches</li>
                <li>Common applications</li>
              </ul>
              
              <h3>Practical Examples</h3>
              <p>See how these principles apply in everyday situations and real-world scenarios.</p>
            `,
            hasQuiz: true
          }
        ]
      },
      {
        id: "section-3",
        title: "Practical Applications",
        description: "Applying knowledge in real situations",
        subsections: [
          {
            id: "subsection-3-1",
            title: "Guided Examples",
            content: `
              <h2>Guided Examples</h2>
              <p>Let's work through examples step-by-step to see how concepts apply in practice.</p>
              
              <h3>Example Categories</h3>
              <ul>
                <li><strong>Basic Applications:</strong> Simple, straightforward examples</li>
                <li><strong>Intermediate Challenges:</strong> Multi-step problems</li>
                <li><strong>Advanced Scenarios:</strong> Complex, real-world situations</li>
              </ul>
              
              <h3>Problem-Solving Strategy</h3>
              <p>Learn a systematic approach to tackling any problem in ${subject}.</p>
            `,
            hasQuiz: false
          },
          {
            id: "subsection-3-2",
            title: "Practice Problems",
            content: `
              <h2>Practice Problems</h2>
              <p>Now it's your turn! Apply what you've learned through these practice exercises.</p>
              
              <h3>Exercise Types</h3>
              <ul>
                <li>Skill-building exercises</li>
                <li>Application problems</li>
                <li>Critical thinking challenges</li>
                <li>Creative projects</li>
              </ul>
              
              <h3>Self-Assessment</h3>
              <p>Check your understanding and identify areas for additional practice.</p>
            `,
            hasQuiz: true
          }
        ]
      },
      {
        id: "section-4",
        title: "Advanced Topics",
        description: "Complex concepts and future learning",
        subsections: [
          {
            id: "subsection-4-1",
            title: "Complex Concepts",
            content: `
              <h2>Advanced Concepts</h2>
              <p>Ready for the next level? These advanced topics build on everything you've learned.</p>
              
              <h3>Advanced Applications</h3>
              <ul>
                <li>Multi-layered problem solving</li>
                <li>Integration with other subjects</li>
                <li>Research and analysis techniques</li>
                <li>Creative and innovative approaches</li>
              </ul>
              
              <h3>Expert Strategies</h3>
              <p>Learn techniques used by experts and professionals in the field.</p>
            `,
            hasQuiz: false
          },
          {
            id: "subsection-4-2",
            title: "Future Learning",
            content: `
              <h2>Where to Go From Here</h2>
              <p>Congratulations on completing this course! Here's how to continue your learning journey.</p>
              
              <h3>Next Steps</h3>
              <ul>
                <li><strong>Advanced Courses:</strong> Build on this foundation</li>
                <li><strong>Practical Projects:</strong> Apply skills in real situations</li>
                <li><strong>Community Learning:</strong> Connect with other learners</li>
                <li><strong>Continuous Practice:</strong> Maintain and improve skills</li>
              </ul>
              
              <h3>Resources for Continued Learning</h3>
              <p>Recommended books, websites, and communities to support your ongoing education.</p>
            `,
            hasQuiz: true
          }
        ]
      }
    ]
  };
}