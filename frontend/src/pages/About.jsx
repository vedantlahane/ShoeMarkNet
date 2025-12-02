import React from 'react';
import PageMeta from '../components/seo/PageMeta';

const About = () => {
    return (
        <>
            <PageMeta
                title="About Us | ShoeMarkNet"
                description="Learn more about ShoeMarkNet, our mission, and our passion for premium footwear."
            />
            <div className="min-h-screen bg-page py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-theme sm:text-5xl sm:tracking-tight lg:text-6xl">
                            About ShoeMarkNet
                        </h1>
                        <p className="mt-5 max-w-xl mx-auto text-xl text-theme-secondary">
                            Your destination for premium footwear and style.
                        </p>
                    </div>

                    <div className="mt-16">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            <div className="bg-card overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-theme">Our Mission</h3>
                                    <div className="mt-2 text-sm text-theme-secondary">
                                        <p>
                                            To provide the highest quality footwear with an exceptional shopping experience. We believe that great shoes can take you to great places.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-theme">Quality First</h3>
                                    <div className="mt-2 text-sm text-theme-secondary">
                                        <p>
                                            We carefully select every pair of shoes in our collection. From materials to craftsmanship, we ensure that you get nothing but the best.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-theme">Customer Focus</h3>
                                    <div className="mt-2 text-sm text-theme-secondary">
                                        <p>
                                            Your satisfaction is our priority. Our dedicated support team is always here to help you find the perfect fit.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 bg-card overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-2xl font-bold text-theme mb-4">Our Story</h3>
                            <div className="prose dark:prose-invert max-w-none text-theme-secondary">
                                <p>
                                    Founded in 2024, ShoeMarkNet started with a simple idea: to make premium footwear accessible to everyone. What began as a small collection has grown into a comprehensive catalog of the world's finest shoe brands.
                                </p>
                                <p className="mt-4">
                                    We are passionate about style, comfort, and durability. Whether you're looking for athletic performance, casual comfort, or formal elegance, we have something for you.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default About;
