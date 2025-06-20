import Headerpage from '@/components/Navbar';
import Heropage from '@/components/Hero';
import Statspage from '@/components/Stats';
import Whychoosepage from '@/components/Whychoose';
import Footer from '@/components/Footer';
import Testimonialpage from '@/components/Testimonial';
import Services from '@/components/Services';
import Pricingpage from '@/components/Pricing';
import Galarypage from '@/components/Galary';
import CategoryCircle from '@/components/CategoryCircles';
import BestSellers from '@/components/Bestseller';
import NewArrival from '@/components/NewArrivals';
import Divider from '@/components/Divider';
export default function Main () {
  return (
    <>
      <Headerpage />
      <Heropage />
       <Statspage />
      <CategoryCircle />
      <NewArrival />
      <BestSellers  />
      <Whychoosepage />
     
      <Services />
      <Testimonialpage />
       <Divider />
      <Pricingpage />
      <Galarypage />
      <Footer />
    </>
  );
}