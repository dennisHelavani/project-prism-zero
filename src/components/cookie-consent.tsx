'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COOKIE_CONSENT_KEY = 'cookie-consent-accepted';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // This code only runs on the client, preventing hydration mismatches.
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <Card className="max-w-4xl mx-auto p-6 bg-secondary text-secondary-foreground shadow-lg flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <Cookie className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-grow text-sm text-center md:text-left">
              <p>
                We use essential cookies to make our site work. By clicking &quot;Accept&quot;, you agree to our use of cookies. For more details, see our{' '}
                <Link href="#" className="underline hover:text-primary">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button onClick={handleAccept}>Accept</Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
