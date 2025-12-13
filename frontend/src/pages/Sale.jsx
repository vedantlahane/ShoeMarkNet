import { lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Sparkles, ShoppingBag, ArrowRight } from "lucide-react";
import { getActiveCampaigns } from "../redux/slices/campaignSlice";
import PageMeta from "../components/seo/PageMeta";
import PageLayout from '../components/common/layout/PageLayout';
import ErrorMessage from '../components/common/feedback/ErrorMessage';

const CampaignBanner = lazy(() => import("../components/sale/CampaignBanner"));
const CampaignCard = lazy(() => import("../components/campaign/CampaignCard"));

const Sale = () => {
  const dispatch = useDispatch();

  const {
    activeCampaigns,
    isLoading,
    error,
  } = useSelector((state) => state.campaign);

  useEffect(() => {
    dispatch(getActiveCampaigns());
  }, [dispatch]);

  // Sort campaigns by priority (already done in backend, but good to ensure)
  const heroCampaign = activeCampaigns.length > 0 ? activeCampaigns[0] : null;
  const otherCampaigns = activeCampaigns.length > 1 ? activeCampaigns.slice(1) : [];

  // SEO Meta data
  const metaTitle = "Campaign Hub | Exclusive Sales & Deals | ShoeMarkNet";
  const metaDescription = "Discover the latest sales, flash deals, and exclusive campaigns at ShoeMarkNet. Limited time offers on premium footwear.";

  // Page breadcrumbs
  const headerBreadcrumbs = (
    <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-theme-secondary">
      <Link to="/" className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400">
        Home
      </Link>
      <span className="opacity-60">/</span>
      <span className="text-theme">Campaigns</span>
    </nav>
  );

  // Loading skeleton
  const CampaignGridSkeleton = () => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={`skeleton-${index}`} className="h-96 rounded-2xl bg-card border border-theme animate-pulse p-4">
          <div className="h-48 rounded-xl bg-theme-secondary mb-4"></div>
          <div className="h-6 w-3/4 rounded bg-theme-secondary mb-2"></div>
          <div className="h-4 w-1/2 rounded bg-theme-secondary mb-4"></div>
          <div className="mt-auto h-10 w-full rounded-lg bg-theme-secondary"></div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <PageMeta title={metaTitle} description={metaDescription} />

      <PageLayout
        title="Campaign Hub"
        description="Exclusive deals and limited-time offers"
        breadcrumbs={headerBreadcrumbs}
      >
        <div className="space-y-12">
          {/* Hero Section - Top Priority Campaign */}
          {isLoading ? (
            <div className="rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 h-80 animate-pulse"></div>
          ) : error ? (
            <ErrorMessage message={error} onRetry={() => window.location.reload()} />
          ) : heroCampaign ? (
            <Suspense fallback={<div className="h-80 rounded-2xl bg-card animate-pulse"></div>}>
              <CampaignBanner campaign={heroCampaign} />
            </Suspense>
          ) : (
            <div className="text-center py-20 bg-card rounded-2xl border border-theme">
              <Sparkles className="w-12 h-12 text-theme-secondary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-theme mb-2">No Active Campaigns</h2>
              <p className="text-theme-secondary">Check back later for exciting new deals!</p>
            </div>
          )}

          {/* Active Campaigns Grid */}
          {!isLoading && otherCampaigns.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-theme flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                  More Ways to Save
                </h2>
              </div>

              <Suspense fallback={<CampaignGridSkeleton />}>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {otherCampaigns.map((campaign, index) => (
                    <CampaignCard key={campaign._id || campaign.slug} campaign={campaign} index={index} />
                  ))}
                </div>
              </Suspense>
            </section>
          )}

          {/* Newsletter / Notifications CTA */}
          <section className="relative overflow-hidden rounded-2xl bg-theme-inverse text-theme-inverse p-8 md:p-12 text-center">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold">Never Miss a Deal</h2>
              <p className="text-lg opacity-90">
                Subscribe to our newsletter to get notified about upcoming flash sales, exclusive drops, and member-only discounts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap">
                  Subscribe
                </button>
              </div>
              <p className="text-xs opacity-60 mt-4">
                By subscribing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>

            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </section>
        </div>
      </PageLayout>
    </>
  );
};

export default Sale;