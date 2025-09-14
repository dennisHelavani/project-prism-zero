
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CookiePolicyModal } from './cookie-policy-modal';
import { PrivacyPolicyModal } from './privacy-policy-modal';

const COOKIE_CONSENT_KEY = 'cookie-consent-interacted';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  useEffect(() => {
    if (hasMounted) {
      try {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (consent !== 'true') {
          setIsVisible(true);
        }
      } catch (e) {
        console.error("Could not access localStorage:", e);
      }
    }
  }, [hasMounted]);

  const handleConsent = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    } catch (e) {
      console.error("Could not write to localStorage:", e);
    }
    setIsVisible(false);
  };
  
  return (
    <AnimatePresence>
      {hasMounted && isVisible && (
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
                <Dialog>
                  <DialogTrigger asChild>
                     <button className="underline hover:text-primary">Privacy Policy</button>
                  </DialogTrigger>
                  <PrivacyPolicyModal />
                </Dialog>
                 {' '}and{' '}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="underline hover:text-primary">Cookie Policy</button>
                  </DialogTrigger>
                  <CookiePolicyModal />
                </Dialog>
                .
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <Button variant="ghost" onClick={handleConsent}>Reject</Button>
              <Button onClick={handleConsent}>Accept</Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
