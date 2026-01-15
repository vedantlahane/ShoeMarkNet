import React from 'react';
import PageMeta from '../components/seo/PageMeta';
import PageHeader from '../components/common/layout/PageHeader';

const About = () => {
    return (
        <>
            <PageMeta
                title="About Us | ShoeMarkNet"
                description="Learn more about ShoeMarkNet, our mission, and our passion for premium footwear."
            />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="container-app py-10">
                    <PageHeader
                        title="About ShoeMarkNet"
                        description="Your destination for premium footwear and style."
                        breadcrumbItems={[{ label: 'About' }]}
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                <i className="fas fa-bullseye text-xl text-blue-600 dark:text-blue-400"></i>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Our Mission</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                To provide the highest quality footwear with an exceptional shopping experience. We believe that great shoes can take you to great places.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                                <i className="fas fa-gem text-xl text-emerald-600 dark:text-emerald-400"></i>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quality First</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                We carefully select every pair of shoes in our collection. From materials to craftsmanship, we ensure that you get nothing but the best.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                                <i className="fas fa-heart text-xl text-purple-600 dark:text-purple-400"></i>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Customer Focus</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                Your satisfaction is our priority. Our dedicated support team is always here to help you find the perfect fit.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Our Story</h3>
                        <div className="mt-4 space-y-4 text-slate-600 dark:text-slate-400">
                            <p>
                                Founded in 2024, ShoeMarkNet started with a simple idea: to make premium footwear accessible to everyone. What began as a small collection has grown into a comprehensive catalog of the world's finest shoe brands.
                            </p>
                            <p>
                                We are passionate about style, comfort, and durability. Whether you're looking for athletic performance, casual comfort, or formal elegance, we have something for you.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">50+</div>
                            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Premium Brands</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
                            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">10K+</div>
                            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Happy Customers</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">4.9</div>
                            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Average Rating</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
                            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">24/7</div>
                            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">Customer Support</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default About;

