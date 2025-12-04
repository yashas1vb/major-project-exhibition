import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { HeroSection } from '@/components/landing/HeroSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';

const Index = () => {
  const navigate = useNavigate();
  const { currentUser, isLoadingUser } = useStore();

  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      navigate('/');
    }
  }, [currentUser, isLoadingUser, navigate]);

  if (!currentUser) return null;

  return (
    <AppLayout>
      <HeroSection />
      <AboutSection />
      <FAQSection />
      <Footer />
    </AppLayout>
  );
};

export default Index;
