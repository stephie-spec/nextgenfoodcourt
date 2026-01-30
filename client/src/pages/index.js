import FeaturedItems from '@/components/customer/FeaturedItems';
import Footer from '@/components/customer/Footer';
import OutletsShowcase from '@/components/customer/Outlets';
import PopularItems from '@/components/customer/PopularItems';
import Testimonials from '@/components/customer/Testimonial';
import Hero from '@/components/hero';
import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';

export default function Home() {
  return (
    <>
      <title>Nextgen Food Court</title>
      <meta name="description" content="Experience authentic African cuisines" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <Navbar />
      <Sidebar />
      <main className="md:ml-20" />
      <Hero />
      <PopularItems />
      <OutletsShowcase />
      <FeaturedItems />
      <Testimonials />
      <Footer />  
    </>
  );
}
