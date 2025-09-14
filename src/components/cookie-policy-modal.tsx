
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';

export function CookiePolicyModal() {
  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-headline">Cookie Policy</DialogTitle>
        <DialogDescription asChild>
            <div className="text-sm text-muted-foreground pt-4 max-h-[70vh] overflow-y-auto pr-4">
                <p className="font-bold">Last updated: 26 July 2025</p>

                <h3 className="font-bold text-lg text-foreground mt-4 mb-2">1. What Are Cookies?</h3>
                <p>
                    Cookies are small text files stored on your device when you visit a website. They help the
                    website function properly, improve performance, and provide information to the site
                    owner.
                </p>

                <h3 className="font-bold text-lg text-foreground mt-4 mb-2">2. Types of Cookies We Use</h3>
                <ol className="list-decimal list-inside space-y-2">
                    <li>
                        <span className="font-semibold">Strictly Necessary Cookies</span>
                        <ul className="list-disc list-inside pl-4 mt-1">
                            <li>These cookies are required for the operation of our Site.</li>
                            <li>Example: enabling page navigation, security, and form submissions.</li>
                        </ul>
                    </li>
                    <li>
                        <span className="font-semibold">Performance &amp; Analytics Cookies</span>
                         <ul className="list-disc list-inside pl-4 mt-1">
                            <li>These help us understand how visitors use our Site so we can improve it.</li>
                            <li>Example: Google Analytics, which gives us anonymous usage statistics.</li>
                        </ul>
                    </li>
                    <li>
                        <span className="font-semibold">Functionality Cookies</span>
                         <ul className="list-disc list-inside pl-4 mt-1">
                            <li>These remember your preferences (such as form inputs) to provide a better user experience.</li>
                        </ul>
                    </li>
                    <li>
                        <span className="font-semibold">Advertising / Marketing Cookies (if enabled)</span>
                         <ul className="list-disc list-inside pl-4 mt-1">
                            <li>These may be set by third-party services (e.g., Stripe, social media pixels) to deliver relevant adverts or track conversions.</li>
                        </ul>
                    </li>
                </ol>

                <h3 className="font-bold text-lg text-foreground mt-4 mb-2">3. Third-Party Cookies</h3>
                <p>Some cookies are placed by third-party providers:</p>
                <ul className="list-disc list-inside pl-4 mt-1">
                    <li>Stripe – for secure payments</li>
                    <li>Tally.so – for form submissions</li>
                    <li>Google Analytics (optional) – for site traffic analysis</li>
                </ul>
                <p className="mt-2">Each provider has its own cookie/privacy policy.</p>

                <h3 className="font-bold text-lg text-foreground mt-4 mb-2">4. How Long Are Cookies Stored?</h3>
                <ul className="list-disc list-inside pl-4">
                    <li><span className="font-semibold">Session cookies:</span> deleted when you close your browser.</li>
                    <li><span className="font-semibold">Persistent cookies:</span> remain until they expire or you delete them.</li>
                </ul>

                <h3 className="font-bold text-lg text-foreground mt-4 mb-2">5. Managing Cookies</h3>
                <p>
                    You can control and manage cookies in your browser settings. Most browsers allow you to:
                </p>
                <ul className="list-disc list-inside pl-4 mt-1">
                    <li>Block all cookies</li>
                    <li>Delete existing cookies</li>
                    <li>Set preferences for certain sites</li>
                </ul>
                <p className="mt-2">Please note: if you disable cookies, some parts of our Site may not function properly.</p>

                <h3 className="font-bold text-lg text-foreground mt-4 mb-2">6. Updates to This Policy</h3>
                <p>
                    We may update this Cookie Policy from time to time. Changes will be posted here with an
                    updated &#39;Last updated&#39; date.
                </p>

                <h3 className="font-bold text-lg text-foreground mt-4 mb-2">7. Contact Us</h3>
                <p>
                    If you have any questions about our use of cookies, please contact us at: <a href="mailto:aaron@hardhatai.co" className="text-primary hover:underline">aaron@hardhatai.co</a>
                </p>
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
