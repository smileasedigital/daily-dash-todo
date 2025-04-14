
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EmailTester: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    if (!validateEmail(testEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      console.log("Sending test email to:", testEmail);
      const { data, error } = await supabase.functions.invoke('test-email', {
        body: { email: testEmail }
      });

      console.log("Response:", data, error);

      if (error) {
        console.error("Error from function:", error);
        throw error;
      }

      toast.success('Test email sent successfully', {
        description: `An email has been sent to ${testEmail}`
      });
      
      // Clear input after successful send
      setTestEmail('');
    } catch (err) {
      console.error('Error sending test email:', err);
      toast.error('Failed to send test email. Check if Mailgun API keys are set in Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Test Email Configuration</CardTitle>
        <CardDescription>
          Test your Mailgun email integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/20">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Make sure you've added the MAILGUN_API_KEY and MAILGUN_DOMAIN to your Supabase Edge Functions settings.
          </AlertDescription>
        </Alert>
        <p className="text-sm text-muted-foreground mb-4">
          Enter an email address below and click "Send Test" to receive a test email.
          This will help verify if your email notifications are working correctly.
        </p>
        <div className="flex space-x-2">
          <Input
            type="email"
            placeholder="Enter email address"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleTestEmail} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Test'
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          Powered by Mailgun
        </p>
        <a 
          href="https://documentation.mailgun.com/en/latest/"
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline"
        >
          Mailgun Documentation
        </a>
      </CardFooter>
    </Card>
  );
};

export default EmailTester;
