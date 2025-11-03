import React from "react";
import { motion } from "motion/react";
import { TrendingUp, Users, Star, Award } from "lucide-react";

const SaleStats = ({ stats }) => {
  const statItems = [
    {
      icon: TrendingUp,
      value: stats.total,
      label: "Items on Sale",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      darkBgColor: "from-blue-950/50 to-cyan-950/50",
    },
    {
      icon: Award,
      value: `${stats.maxDiscount}%`,
      label: "Max Discount",
      color: "from-indigo-500 to-purple-500",
      bgColor: "from-indigo-50 to-purple-50",
      darkBgColor: "from-indigo-950/50 to-purple-950/50",
    },
    {
      icon: Users,
      value: "10K+",
      label: "Happy Customers",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      darkBgColor: "from-green-950/50 to-emerald-950/50",
    },
    {
      icon: Star,
      value: `${stats.averageDiscount}%`,
      label: "Avg Savings",
      color: "from-rose-500 to-pink-500",
      bgColor: "from-rose-50 to-pink-50",
      darkBgColor: "from-rose-950/50 to-pink-950/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`group relative overflow-hidden rounded-2xl border border-slate-200/50 bg-gradient-to-br ${stat.bgColor} p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-700/50 dark:${stat.darkBgColor}`}
        >
          {/* Background gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}></div>

          <div className="relative z-10">
            {/* Icon */}
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${stat.color} text-white shadow-lg`}>
              <stat.icon className="h-6 w-6" />
            </div>

            {/* Value */}
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {stat.value}
            </div>

            {/* Label */}
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {stat.label}
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-white/20"></div>
          <div className="absolute -bottom-2 -left-2 h-3 w-3 rounded-full bg-white/10"></div>
        </motion.div>
      ))}
    </div>
  );
};

export default SaleStats;