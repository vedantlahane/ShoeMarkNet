import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Clock, Tag } from 'lucide-react';

const CampaignCard = ({ campaign, index }) => {
    const { name, description, bannerImage, slug, endDate, discount, type } = campaign;

    const calculateDaysLeft = () => {
        if (!endDate) return null;
        const diff = new Date(endDate) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    const daysLeft = calculateDaysLeft();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-2xl bg-card border border-theme shadow-sm hover:shadow-md transition-all duration-300"
        >
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={bannerImage}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Badge */}
                <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm ${type === 'sale' ? 'bg-red-500' : 'bg-blue-500'
                        }`}>
                        <Tag className="w-3 h-3" />
                        {type}
                    </span>
                </div>

                {/* Timer Badge */}
                {daysLeft !== null && daysLeft <= 7 && (
                    <div className="absolute bottom-4 right-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs font-medium">
                            <Clock className="w-3 h-3 text-yellow-400" />
                            <span>{daysLeft} days left</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-theme mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {name}
                </h3>
                <p className="text-theme-secondary text-sm mb-4 line-clamp-2 h-10">
                    {description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    {discount?.value > 0 && (
                        <div className="flex flex-col">
                            <span className="text-xs text-theme-secondary uppercase font-semibold">Discount</span>
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                {discount.type === 'percentage' ? `Up to ${discount.value}% Off` :
                                    discount.type === 'fixed' ? `$${discount.value} Off` : 'Special Deal'}
                            </span>
                        </div>
                    )}

                    <Link
                        to={`/categories/sale?campaign=${slug}`} // Linking to category page with filter for now, ideally dedicated page
                        className="inline-flex items-center gap-2 px-4 py-2 bg-theme text-theme-inverse rounded-lg text-sm font-medium hover:bg-theme-secondary transition-colors"
                    >
                        Shop Now
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default CampaignCard;
