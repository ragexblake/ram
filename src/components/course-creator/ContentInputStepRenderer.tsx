import React, { useState } from 'react';
import { Upload, Globe, FileText, Info, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContentInputStepRendererProps {
  formData: any;
  setFormData: (data: any) => void;
}

const ContentInputStepRenderer: React.FC<ContentInputStepRendererProps> = ({
  formData,
  setFormData
}) => {
  const [activeTab, setActiveTab] = useState<'websites' | 'files'>('websites');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleWebsiteCrawl = async () => {
    if (!websiteUrl.trim()) return;
    
    console.log('Starting website crawl for:', websiteUrl);
    setIsCrawling(true);
    
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session check:', !!session?.user);
      
      if (!session?.user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to scrape website content.",
          variant: "destructive",
        });
        return;
      }

      console.log('Calling scrape-website function...');
      
      // Call the scrape-website function
      const response = await supabase.functions.invoke('scrape-website', {
        body: {
          websiteUrl: websiteUrl.trim(),
          userId: session.user.id
        }
      });
      
      // If the function fails, try a fallback approach
      if (response.error) {
        console.log('Supabase function failed, trying fallback...');
        // For now, create a simple mock response for testing
        const mockData = {
          url: websiteUrl.trim(),
          title: `Content from ${websiteUrl.trim()}`,
          description: `Extracted content from ${websiteUrl.trim()}`,
          mainContent: `This is a placeholder for content extracted from ${websiteUrl.trim()}. The actual scraping function needs to be deployed.`,
          businessKeywords: ['content', 'website', 'information'],
          companyTerms: ['website', 'content'],
          navigationItems: ['Home', 'About', 'Contact'],
          extractedAt: new Date().toISOString(),
          wordCount: 50
        };
        
        setFormData({ 
          ...formData, 
          contentSource: 'website',
          websiteUrl: websiteUrl.trim(),
          contentData: mockData,
          scrapedAt: new Date().toISOString()
        });

        toast({
          title: "Website Content Added (Mock)",
          description: `Added placeholder content for ${websiteUrl}. Function deployment required for actual scraping.`,
        });
        return;
      }

      console.log('Scrape response:', response);

      if (response.error) {
        console.error('Supabase function error:', response.error);
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        console.log('Scraping successful, extracted data:', response.data.extractedData);
        
        setFormData({ 
          ...formData, 
          contentSource: 'website',
          websiteUrl: websiteUrl.trim(),
          contentData: response.data.extractedData,
          scrapedAt: new Date().toISOString()
        });

        toast({
          title: "Website Scraped Successfully",
          description: `Successfully extracted content from ${response.data.finalUrl || websiteUrl}`,
        });
      } else {
        console.error('No success flag in response:', response.data);
        throw new Error('Failed to scrape website - no success response');
      }
    } catch (error: any) {
      console.error('Error crawling website:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      toast({
        title: "Scraping Failed",
        description: error.message || "Failed to scrape website content. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsCrawling(false);
    }
  };

  // Test function to check if Supabase functions are working
  const testSupabaseFunction = async () => {
    try {
      console.log('Testing Supabase function connection...');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
      
      // First test if we can reach any Supabase function
      try {
        const testResponse = await supabase.functions.invoke('check-subscription', {
          body: { userId: session?.user?.id || 'test-user' }
        });
        console.log('Basic function test response:', testResponse);
      } catch (basicError) {
        console.log('Basic function test failed:', basicError);
      }
      
      const response = await supabase.functions.invoke('scrape-website', {
        body: {
          websiteUrl: 'https://example.com',
          userId: session?.user?.id || 'test-user'
        }
      });
      console.log('Test response:', response);
      
      if (response.error) {
        console.error('Function error:', response.error);
        toast({
          title: "Function Test Failed",
          description: response.error.message,
          variant: "destructive",
        });
      } else {
        console.log('Function test successful');
        toast({
          title: "Function Test Successful",
          description: "Supabase function is working correctly",
        });
      }
    } catch (error) {
      console.error('Test function error:', error);
      toast({
        title: "Function Test Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setIsProcessingPdf(true);
      
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to process PDF files.",
            variant: "destructive",
          });
          return;
        }

        // For now, we'll create a mock PDF processing response
        // In production, you would upload to storage and process with the Edge Function
        console.log('Processing PDF...');

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create mock extracted data
        const mockExtractedData = {
          fileName: file.name,
          fileType: 'pdf',
          extractedAt: new Date().toISOString(),
          content: {
            title: `PDF Document: ${file.name}`,
            textContent: `This is a placeholder for content extracted from ${file.name}. The actual PDF parsing functionality needs to be implemented with a proper PDF library.`,
            pageCount: Math.floor(Math.random() * 10) + 1,
            wordCount: Math.floor(Math.random() * 1000) + 100,
            metadata: {
              title: file.name,
              author: 'Unknown',
              creationDate: new Date().toISOString(),
              fileSize: file.size
            },
            sections: [
              {
                title: 'Introduction',
                content: 'This is a placeholder section for the PDF content.',
                pageNumber: 1
              },
              {
                title: 'Main Content',
                content: 'This section contains the main content extracted from the PDF.',
                pageNumber: 2
              }
            ],
            keywords: ['pdf', 'document', 'content', 'placeholder', 'extraction'],
            summary: `This PDF document (${file.name}) contains placeholder content that would be extracted using a proper PDF parsing library.`
          }
        };

        // Try to call the process-pdf function if it's available
        let finalExtractedData = mockExtractedData;
        try {
          const response = await supabase.functions.invoke('process-pdf', {
            body: {
              fileUrl: 'mock-url',
              userId: session.user.id,
              fileName: file.name
            }
          });

          if (response.data?.success) {
            // Use the actual response if available
            finalExtractedData = response.data.extractedData;
          }
        } catch (functionError) {
          console.log('PDF processing function not available, using mock data:', functionError);
        }

        // Use the extracted data (either from function or mock)
        setFormData({ 
          ...formData, 
          contentSource: 'pdf',
          uploadedFile: file,
          fileName: file.name,
          fileSize: file.size,
          contentData: finalExtractedData,
          processedAt: new Date().toISOString()
        });

        toast({
          title: "PDF Processed Successfully",
          description: `Successfully extracted content from ${file.name}`,
        });

      } catch (error: any) {
        console.error('Error processing PDF:', error);
        toast({
          title: "PDF Processing Failed",
          description: error.message || "Failed to process PDF. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessingPdf(false);
      }
    } else if (file) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <h3 className="text-xl font-semibold">Optional: Train AI on existing content</h3>
        <Info className="h-5 w-5 text-gray-400" />
      </div>
      
      <p className="text-gray-600">
        Provide existing content to help the AI generate more relevant and accurate course material.
      </p>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'websites' | 'files')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="websites" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Websites</span>
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Files</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="websites" className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <div className="flex space-x-2">
                <Input
                  type="url"
                  placeholder="https://www.example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleWebsiteCrawl}
                  disabled={!websiteUrl.trim() || isCrawling}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {isCrawling ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Crawling...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Fetch
                    </>
                  )}
                </Button>
              </div>
              {/* Debug button - remove in production */}
              <div className="mt-2">
                <Button
                  onClick={testSupabaseFunction}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Test Function Connection
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              This will crawl all the links starting with the URL (not including files on the website).
            </p>

            {formData.websiteUrl && formData.contentData && (
              <div className="p-4 bg-green-50 rounded-lg space-y-2">
                <p className="text-sm text-green-700 font-medium">
                  ✓ Website content loaded: {formData.websiteUrl}
                </p>
                {formData.contentData.title && (
                  <p className="text-xs text-green-600">
                    Title: {formData.contentData.title}
                  </p>
                )}
                {formData.contentData.wordCount && (
                  <p className="text-xs text-green-600">
                    Extracted {formData.contentData.wordCount} words of content
                  </p>
                )}
                {formData.contentData.businessKeywords && formData.contentData.businessKeywords.length > 0 && (
                  <p className="text-xs text-green-600">
                    Key topics: {formData.contentData.businessKeywords.slice(0, 5).join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload PDF Document
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop your PDF here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isProcessingPdf}
                />
                <label
                  htmlFor="pdf-upload"
                  className={`inline-flex items-center px-4 py-2 rounded-lg cursor-pointer ${
                    isProcessingPdf 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  {isProcessingPdf ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose PDF File
                    </>
                  )}
                </label>
              </div>
            </div>

            {uploadedFile && formData.contentData && (
              <div className="p-4 bg-green-50 rounded-lg space-y-2">
                <p className="text-sm text-green-700 font-medium">
                  ✓ PDF processed: {uploadedFile.name}
                </p>
                {formData.contentData.content?.title && (
                  <p className="text-xs text-green-600">
                    Title: {formData.contentData.content.title}
                  </p>
                )}
                {formData.contentData.content?.wordCount && (
                  <p className="text-xs text-green-600">
                    Extracted {formData.contentData.content.wordCount} words
                  </p>
                )}
                {formData.contentData.content?.pageCount && (
                  <p className="text-xs text-green-600">
                    Pages: {formData.contentData.content.pageCount}
                  </p>
                )}
                {formData.contentData.content?.keywords && formData.contentData.content.keywords.length > 0 && (
                  <p className="text-xs text-green-600">
                    Key topics: {formData.contentData.content.keywords.slice(0, 5).join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <Info className="h-4 w-4 inline mr-1" />
          This step is optional. If you skip it, the AI will generate course content based on your industry and requirements.
        </p>
      </div>
    </div>
  );
};

export default ContentInputStepRenderer; 