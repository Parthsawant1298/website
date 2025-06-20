import Headerpage from '@/components/Header';
import Heropage from '@/components/Hero';
import Statspage from '@/components/Stats';
import Whychoosepage from '@/components/Whychoose';
import Footer from '@/components/Footer';
import Testimonialpage from '@/components/Testimonial';
import Services from '@/components/Services';
import Partnership from '@/components/Partner';
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
       <Partnership />
      <Galarypage />
      <Footer />
    </>
  );
}