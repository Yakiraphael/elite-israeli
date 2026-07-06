import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import MissionSection from '../components/MissionSection';
import ImpactStats from '../components/ImpactStats';
import BubblesGallery from '../components/BubblesGallery';
import IEFAPlatformSection from '../components/IEFAPlatformSection';
import EliteIdShowcase from '../components/EliteIdShowcase';
import GoalsSection from '../components/GoalsSection';
import TransferHubSection from '../components/TransferHubSection';
import ROISection from '../components/ROISection';
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
      <ImpactStats />
      <BubblesGallery />
      <IEFAPlatformSection />
      <EliteIdShowcase />
      <GoalsSection />
      <ROISection />
      <TeamSection />
      <RoadmapSection />
      <TransferHubSection />
      <ContactSection />
      <Footer />
      <SocialFloat />
    </div>
  );
}