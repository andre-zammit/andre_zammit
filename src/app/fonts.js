// In your app/fonts.js file
import { Inter, Montserrat, DM_Sans, Raleway } from 'next/font/google';

// Option 1: Inter (modern, clean, professional)
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Option 2: Montserrat (elegant, professional)
export const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

// Option 3: DM Sans (modern, technical, clean)
export const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

// Option 4: Raleway (elegant, distinctive)
export const raleway = Raleway({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway',
});