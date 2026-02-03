import FeaturedItems from '@/components/customer/FeaturedItems';
import Footer from '@/components/customer/Footer';
import OutletsShowcase from '@/components/customer/Outlets';
import PopularItems from '@/components/customer/PopularItems';
import Testimonials from '@/components/customer/Testimonial';
import Hero from '@/components/hero';
import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';
import RightSidebar from '@/components/RightSidebar';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      
      {/* Main Container with proper layout */}
      <div className="flex w-full pt-16">
        {/* Left Spacer */}
        <div className="hidden md:block w-20 flex-shrink-0" />
        
        {/* Center Content */}
        <main className="flex-1 min-w-0">
          <Hero />
          <PopularItems />
          <OutletsShowcase />
          <FeaturedItems />
          <Testimonials />
          <Footer />
        </main>
        
        {/* Right Sidebar */}
        <div className="hidden xl:block">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
