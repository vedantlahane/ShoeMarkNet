import React, { useState, useCallback } from 'react';
import { trackEvent } from '../../utils/analytics';

const FAQSection = ({ faqs, animateElements, className = '' }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFaqToggle = useCallback((faqId) => {
    setExpandedFaq(prev => prev === faqId ? null : faqId);
    
    trackEvent('faq_item_clicked', {
      faq_id: faqId,
      action: expandedFaq === faqId ? 'collapsed' : 'expanded'
    });
  }, [expandedFaq]);

  const handleHelpfulClick = useCallback((faqId, isHelpful) => {
    trackEvent('faq_feedback', {
      faq_id: faqId,
      helpful: isHelpful
    });
  }, []);

  return (
    <section className={className}>
      <div className="container mx-auto px-4">
        <div className={`text-center mb-12 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            <i className="fas fa-question-circle mr-3"></i>
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Quick answers to common questions about our products and services
          </p>
          
          {/* FAQ Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-search text-gray-400 text-4xl mb-4"></i>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No FAQs Found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className={`bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl overflow-hidden ${
                    animateElements ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <button
                    onClick={() => handleFaqToggle(faq.id)}
                    className="w-full px-8 py-6 text-left hover:bg-white/10 transition-colors duration-200 flex items-center justify-between"
                  >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-start">
                      <i className="fas fa-question-circle text-blue-500 mr-3 mt-1 flex-shrink-0"></i>
                      {faq.question}
                    </h3>
                    <i className={`fas fa-chevron-${expandedFaq === faq.id ? 'up' : 'down'} text-gray-400 transition-transform duration-200 flex-shrink-0 ml-4`}></i>
                  </button>
                  
                  {expandedFaq === faq.id && (
                    <div className="px-8 pb-6 animate-fade-in">
                      <div className="pl-8 border-l-2 border-blue-500/20">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                          {faq.answer}
                        </p>
                        
                        {/* FAQ Metadata */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              <i className="fas fa-eye mr-1"></i>
                              {faq.views} views
                            </span>
                            <span>
                              <i className="fas fa-thumbs-up mr-1"></i>
                              {faq.helpful} found helpful
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Was this helpful?</span>
                            <button
                              onClick={() => handleHelpfulClick(faq.id, true)}
                              className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors duration-200"
                              title="Yes, helpful"
                            >
                              <i className="fas fa-thumbs-up"></i>
                            </button>
                            <button
                              onClick={() => handleHelpfulClick(faq.id, false)}
                              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors duration-200"
                              title="No, not helpful"
                            >
                              <i className="fas fa-thumbs-down"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAQ Footer */}
        <div className={`text-center mt-12 ${animateElements ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Still need help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Can't find what you're looking for? Our support team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105">
                <i className="fas fa-question mr-2"></i>
                Ask a Question
              </button>
              <button className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-bold py-3 px-8 rounded-2xl hover:bg-white/30 transition-all duration-200">
                <i className="fas fa-comments mr-2"></i>
                Start Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
