import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageMeta from '../components/seo/PageMeta';
import {
  ShieldAlert,
  ArrowLeft,
  Home,
  LifeBuoy,
  LockKeyhole
} from 'lucide-react';

const AccessDeniedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = location.state?.from?.pathname || '/';
  const requiredRole = location.state?.requiredRole;

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/');
  };

  return (
    <>
      <PageMeta
        title="Access Restricted • ShoeMarkNet"
        description="You do not have permission to view this page."
        robots="noindex, nofollow"
      />

  <section className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 py-20 px-4 sm:px-5 lg:px-6 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
          <div className="absolute bottom-10 right-16 w-72 h-72 bg-violet-400/30 blur-[90px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="glass-card p-10 text-center space-y-10">
            <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-pink-500 shadow-premium">
              <ShieldAlert size={42} className="text-white" aria-hidden="true" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white">
                Access Restricted
              </h1>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                It looks like you don’t have permission to view this page just yet. If you believe this is a mistake, our support team can help you get the right access.
              </p>
            </div>

            <div className="glass-card bg-white/10 dark:bg-slate-900/40 border-white/20 dark:border-slate-700/30 p-6 rounded-2xl text-left space-y-4">
              <div className="flex items-center gap-3 text-blue-100 text-sm">
                <LockKeyhole size={18} aria-hidden="true" />
                <span>Requested URL</span>
              </div>
              <code className="block w-full rounded-xl bg-black/30 px-4 py-3 text-start text-sm text-blue-100">
                {location.pathname}
              </code>
              {requiredRole && (
                <div className="flex flex-wrap items-center gap-3 text-sm text-blue-100">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2">
                    Required role:
                    <strong className="uppercase tracking-wider">{requiredRole}</strong>
                  </span>
                </div>
              )}
              <div className="text-xs text-blue-100/70">
                You were redirected from {fromPath}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={handleBack}
                className="btn-glass px-6 py-3 text-white hover:scale-105 transition-transform inline-flex items-center justify-center gap-3"
              >
                <ArrowLeft size={18} aria-hidden="true" />
                Go back
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-premium px-6 py-3 inline-flex items-center justify-center gap-3"
              >
                <Home size={18} aria-hidden="true" />
                Back to home
              </button>
            </div>

            <div className="glass-card bg-white/10 dark:bg-slate-900/40 border-white/10 p-6 text-sm text-blue-100 space-y-4">
              <div className="flex items-center gap-3">
                <LifeBuoy size={18} aria-hidden="true" />
                <span className="font-semibold">Need elevated access?</span>
              </div>
              <p>
                Reach out to our support team with your account details and the role you need. We’ll help you get sorted as soon as possible.
              </p>
              <a
                href="mailto:support@shoemarknet.com"
                className="inline-flex items-center gap-2 text-white underline underline-offset-4"
              >
                support@shoemarknet.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AccessDeniedPage;
