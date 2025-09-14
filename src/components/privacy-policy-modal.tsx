
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';

// This is a placeholder component.
// You can replace this with your actual privacy policy content.
export function PrivacyPolicyModal() {
  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-headline">Privacy Policy</DialogTitle>
        <DialogDescription asChild>
            <div className="text-sm text-muted-foreground pt-4 max-h-[70vh] overflow-y-auto pr-4">
                <p className="font-bold">Last updated: 26 July 2024</p>

                <h3 className="font-bold text-lg text-foreground mt-4 mb-2">1. Introduction</h3>
                <p>
                    Welcome to Hard Hat AI. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you.
                </p>

                <h3 className="font-bold text-lg text-foreground mt-4 mb-2">2. Information We Collect</h3>
                <p>
                    We may collect personal information that you provide to us, such as your name, email address, and project details when you use our document generation service.
                </p>
                 <p className="mt-2">
                    We also collect technical data automatically, such as your IP address, browser type, and usage information through cookies and similar technologies.
                </p>

                 <h3 className="font-bold text-lg text-foreground mt-4 mb-2">3. How We Use Your Information</h3>
                <p>
                    We use your information to:
                </p>
                <ul className="list-disc list-inside pl-4 mt-1">
                    <li>Provide, operate, and maintain our services.</li>
                    <li>Generate and deliver your requested documents.</li>
                    <li>Communicate with you, including for customer service.</li>
                    <li>Improve and personalize our services.</li>
                </ul>
            </div>
        </DialogDescription>
      </DialogHeader>
      <div className="flex justify-end pt-4">
        <DialogClose asChild>
          <Button type="button">Close</Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
}
