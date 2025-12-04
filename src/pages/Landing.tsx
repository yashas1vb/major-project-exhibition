import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { useStore } from '@/store/useStore';
import { Code2, Loader2 } from 'lucide-react';
import { TypingEffect } from '@/components/ui/TypingEffect';
import { AboutSection } from '@/components/landing/AboutSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';

const Landing = () => {
    const navigate = useNavigate();
    const { currentUser, isLoadingUser } = useStore();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');

    useEffect(() => {
        if (currentUser) {
            navigate('/home');
        }
    }, [currentUser, navigate]);

    const handleAuth = (tab: 'login' | 'signup') => {
        setAuthTab(tab);
        setShowAuthModal(true);
    };

    if (isLoadingUser) {
        return (
            <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0E14] text-white overflow-x-hidden relative font-sans">
            {/* Starry Background Effect */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute h-1 w-1 bg-white rounded-full top-10 left-20 opacity-50 animate-pulse"></div>
                <div className="absolute h-1 w-1 bg-purple-500 rounded-full top-40 left-1/4 opacity-60 animate-pulse delay-75"></div>
                <div className="absolute h-1.5 w-1.5 bg-blue-500 rounded-full top-1/3 right-1/3 opacity-40 animate-pulse delay-150"></div>
                <div className="absolute h-1 w-1 bg-white rounded-full bottom-20 right-20 opacity-30 animate-pulse"></div>
                <div className="absolute h-2 w-2 bg-purple-400 rounded-full top-1/2 left-10 opacity-20 blur-sm"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0B0E14] to-[#0B0E14]"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Code2 className="h-6 w-6 text-blue-400" />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        CollabCode
                    </span>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#about" className="hover:text-white transition-colors">About</a>
                    <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
                </nav>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        className="text-white hover:text-white hover:bg-white/10"
                        onClick={() => handleAuth('signup')}
                    >
                        Sign Up
                    </Button>
                    <Button
                        className="bg-white text-black hover:bg-gray-200 rounded-full px-6"
                        onClick={() => handleAuth('login')}
                    >
                        Login
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center gap-12">
                <div className="space-y-8 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                        Code Together <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                            <TypingEffect words={['Anytime.', 'Anywhere.', 'Seamlessly.']} />
                        </span>
                    </h1>

                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Real-time collaborative coding boards, blazing-fast editors and seamless task management—all in one place.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-purple-900/20 w-full sm:w-auto"
                            onClick={() => handleAuth('signup')}
                        >
                            Get Started Free
                        </Button>
                        <Button
                            variant="outline"
                            className="border-gray-700 bg-black/50 text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg w-full sm:w-auto"
                            onClick={() => handleAuth('login')}
                        >
                            Live Demo
                        </Button>
                    </div>
                </div>

                {/* Code Card Preview */}
                <div className="w-full max-w-4xl relative mt-12">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-30"></div>
                    <div className="relative bg-[#13161C] border border-gray-800 rounded-2xl p-6 shadow-2xl text-left">
                        <div className="flex gap-2 mb-6">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="font-mono text-sm space-y-1 mb-8">
                            <div className="flex">
                                <span className="text-blue-400 mr-2">function</span>
                                <span className="text-yellow-300">collaborate</span>
                                <span className="text-gray-400">() {'{'}</span>
                            </div>
                            <div className="pl-4 flex">
                                <span className="text-purple-400 mr-1">console</span>
                                <span className="text-gray-400">.</span>
                                <span className="text-blue-300 mr-1">log</span>
                                <span className="text-gray-400">(</span>
                                <span className="text-green-400">"Hello, CollabCode!"</span>
                                <span className="text-gray-400">);</span>
                            </div>
                            <div className="text-gray-400">{'}'}</div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Other Sections */}
            <div className="relative z-10 bg-[#0B0E14]">
                <AboutSection />
                <FAQSection />
                <Footer />
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                defaultTab={authTab}
            />
        </div>
    );
};

export default Landing;
