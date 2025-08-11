import React from 'react';
import { Link } from 'react-router-dom';

const NavigationMegaMenu = ({ isOpen, onClose }) => {
  const menuItems = [
    {
      title: 'Men',
      categories: [
        { name: 'Running Shoes', href: '/category/men-running' },
        { name: 'Basketball', href: '/category/men-basketball' },
        { name: 'Casual', href: '/category/men-casual' },
        { name: 'Formal', href: '/category/men-formal' }
      ]
    },
    {
      title: 'Women',
      categories: [
        { name: 'Running Shoes', href: '/category/women-running' },
        { name: 'Athletic', href: '/category/women-athletic' },
        { name: 'Casual', href: '/category/women-casual' },
        { name: 'Heels', href: '/category/women-heels' }
      ]
    },
    {
      title: 'Kids',
      categories: [
        { name: 'Boys Shoes', href: '/category/boys' },
        { name: 'Girls Shoes', href: '/category/girls' },
        { name: 'Toddler', href: '/category/toddler' },
        { name: 'School Shoes', href: '/category/school' }
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 w-full bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-2xl z-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          {menuItems.map((section, index) => (
            <div key={index}>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.categories.map((category, idx) => (
                  <li key={idx}>
                    <Link
                      to={category.href}
                      onClick={onClose}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationMegaMenu;
