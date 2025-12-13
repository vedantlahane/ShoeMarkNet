import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Sparkles } from 'lucide-react';

const CampaignBanner = ({ campaign }) => {
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!campaign?.endDate) return;

        const calculateTimeLeft = () => {
            const difference = new Date(campaign.endDate) - new Date();

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [campaign?.endDate]);

    if (!campaign) return null;

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white blur-3xl"></div>
                <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 gap-6">
                <div className="flex-1 space-y-4 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm mb-3">
                            <Sparkles className="h-4 w-4 text-yellow-300" />
                            <span>Flash Sale</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
                            {campaign.name}
                        </h1>
                        <p className="text-lg text-blue-100 max-w-xl">
                            {campaign.description}
                        </p>
                    </motion.div>
                </div>

                {timeLeft && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col items-center gap-4 bg-white/10 p-6 rounded-xl backdrop-blur-md border border-white/20"
                    >
                        <div className="flex items-center gap-2 text-blue-100 font-medium">
                            <Clock className="h-5 w-5" />
                            <span>Offer Ends In</span>
                        </div>
                        <div className="flex gap-4 text-center">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold font-mono">{String(timeLeft.days).padStart(2, '0')}</span>
                                <span className="text-xs uppercase tracking-wider opacity-70">Days</span>
                            </div>
                            <span className="text-3xl font-bold opacity-50">:</span>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                                <span className="text-xs uppercase tracking-wider opacity-70">Hours</span>
                            </div>
                            <span className="text-3xl font-bold opacity-50">:</span>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                                <span className="text-xs uppercase tracking-wider opacity-70">Mins</span>
                            </div>
                            <span className="text-3xl font-bold opacity-50">:</span>
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold font-mono text-yellow-300">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                <span className="text-xs uppercase tracking-wider opacity-70">Secs</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CampaignBanner;
