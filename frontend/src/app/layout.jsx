import './globals.css';
import Navbar from './components/layout/Navbar';

export const metadata = {
  title: 'TRIPneO | Book Bus, Train, Flight & Taxi',
  description: 'A scalable microservices-based transport booking platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}