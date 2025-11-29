import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import PageMeta from '../components/seo/PageMeta';
import LoadingSpinner from '../components/common/feedback/LoadingSpinner';
import { logoutUser } from '../redux/slices/authSlice';
import { CheckCircle2 } from 'lucide-react';

const Logout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      const timeout = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 800);

      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, navigate]);

  const isProcessing = useMemo(() => isAuthenticated || isLoading, [isAuthenticated, isLoading]);

  return (
    <>
      <PageMeta
        title="Signing Out | ShoeMarkNet"
        description="We are signing you out securely."
        robots="noindex, nofollow"
      />

      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center shadow-2xl max-w-md w-full space-y-6">
          {isProcessing ? (
            <LoadingSpinner size="large" message="Signing you out…" />
          ) : (
            <>
              <div className="flex items-center justify-center">
                <div className="p-4 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                  <CheckCircle2 size={48} aria-hidden="true" />
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Signed out</h1>
                <p className="text-slate-600 dark:text-slate-300">
                  You have been signed out. Redirecting you to the login page…
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Go to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Logout;
