
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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
      const { error } = await supabase.functions.invoke('test-email', {
        body: { email: testEmail }
      });

      if (error) {
        throw error;
      }

      toast.success('Test email sent successfully', {
        description: `An email has been sent to ${testEmail}`
      });
      
      // Clear input after successful send
      setTestEmail('');
    } catch (err) {
      console.error('Error sending test email:', err);
      toast.error('Failed to send test email');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <Card className="shadow-md mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Test Email Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Use this tool to test if your email notifications are working correctly. 
          Enter an email address below and click "Send Test" to receive a test email.
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
      <CardFooter className="flex justify-end">
        <p className="text-xs text-muted-foreground">
          Powered by Resend
        </p>
      </CardFooter>
    </Card>
  );
};

export default EmailTester;
