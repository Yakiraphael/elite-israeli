import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import MissionSection from '../components/MissionSection';
import GoalsSection from '../components/GoalsSection';
import BubblesGallery from '../components/BubblesGallery';
import TeamSection from '../components/TeamSection';
import RoadmapSection from '../components/RoadmapSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import SocialFloat from '../components/SocialFloat';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <MissionSection />
      <GoalsSection />
      <BubblesGallery />
      <TeamSection />
      <RoadmapSection />
      <ContactSection />
      <Footer />
      <SocialFloat />
    </div>
  );
}