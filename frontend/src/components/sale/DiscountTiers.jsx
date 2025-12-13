import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Percent, Tag, Star, Award } from "lucide-react";

const DiscountTiers = ({ products }) => {
  const discountTiers = useMemo(() => {
    const tiers = [
      {
        range: "50%+",
        minDiscount: 50,
        icon: Award,
        title: "Premium Deals",
        description: "Luxury brands at unbeatable prices",
        color: "from-indigo-500 to-purple-500",
        bgColor: "from-indigo-50 to-purple-50",
        darkBgColor: "from-indigo-950/50 to-purple-950/50",
        borderColor: "border-indigo-200/50 dark:border-indigo-800/50",
      },
      {
        range: "10-30%",
        minDiscount: 10,
        maxDiscount: 30,
        icon: Percent,
        title: "Smart Deals",
        description: "Quality products at reasonable prices",
        color: "from-rose-500 to-pink-500",
        bgColor: "from-rose-50 to-pink-50",
        darkBgColor: "from-rose-950/50 to-pink-950/50",
        borderColor: "border-rose-200/50 dark:border-rose-800/50",
      },
      {
        range: "Under 30%",
        minDiscount: 0,
        maxDiscount: 30,
        icon: Star,
        title: "Smart Buys",
        description: "Quality items at reasonable discounts",
        color: "from-blue-500 to-indigo-500",
        bgColor: "from-blue-50 to-indigo-50",
        darkBgColor: "from-blue-950/50 to-indigo-950/50",
        borderColor: "border-blue-200/50 dark:border-blue-800/50",
      },
    ];

    return tiers.map(tier => ({
      ...tier,
      count: products.filter(product => {
        const discount = product.discount || 0;
        if (tier.maxDiscount !== undefined) {
          return discount >= tier.minDiscount && discount < tier.maxDiscount;
        }
        return discount >= tier.minDiscount;
      }).length,
    }));
  }, [products]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {discountTiers.map((tier, index) => (
        <motion.div
          key={tier.range}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`group relative overflow-hidden rounded-2xl border ${tier.borderColor} bg-gradient-to-br ${tier.bgColor} p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:${tier.darkBgColor}`}
        >
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}></div>

          <div className="relative z-10">
            {/* Icon */}
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${tier.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <tier.icon className="h-8 w-8" />
            </div>

            {/* Range */}
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {tier.range}
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
              {tier.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {tier.description}
            </p>

            {/* Count */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/60 dark:bg-slate-900/60 px-4 py-2">
              <Percent className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {tier.count} Items
              </span>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-white/40"></div>
          <div className="absolute bottom-4 left-4 h-1.5 w-1.5 rounded-full bg-white/30"></div>
        </motion.div>
      ))}
    </div>
  );
};

export default DiscountTiers;