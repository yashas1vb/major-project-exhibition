import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Loader2 } from 'lucide-react';

const AuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { checkAuth } = useStore();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            console.log('AuthSuccess: Received token, attempting to verify...');
            localStorage.setItem('token', token);
            checkAuth()
                .then(() => {
                    // Verify if we actually have a user now
                    const state = useStore.getState();
                    if (state.currentUser) {
                        console.log('AuthSuccess: Authentication successful, redirecting to home');
                        navigate('/home');
                    } else {
                        console.error('AuthSuccess: checkAuth resolved but no user found');
                        navigate('/login?error=auth_verification_failed');
                    }
                })
                .catch((err) => {
                    console.error('AuthSuccess: checkAuth failed', err);
                    navigate('/login?error=auth_check_failed');
                });
        } else {
            console.warn('AuthSuccess: No token found in URL');
            navigate('/login?error=no_token');
        }
    }, [searchParams, navigate, checkAuth]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
};

export default AuthSuccess;
