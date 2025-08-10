import React from 'react';

const ContactFormSuccess = ({ submissionData, onNewMessage }) => {
  return (
    <div className="text-center py-8 animate-fade-in">
      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
        <i className="fas fa-check text-3xl text-white"></i>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Message Sent Successfully! 🎉
      </h3>
      
      <div className="bg-green-500/20 backdrop-blur-lg border border-green-300/50 rounded-2xl p-6 mb-6">
        <div className="text-left space-y-2">
          <p className="text-green-800 dark:text-green-200">
            <strong>Subject:</strong> {submissionData.subject}
          </p>
          <p className="text-green-800 dark:text-green-200">
            <strong>Priority:</strong> {submissionData.priority}
          </p>
          <p className="text-green-800 dark:text-green-200">
            <strong>Expected Response:</strong> 2-4 hours
          </p>
        </div>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
        Thank you for reaching out! We've received your message and our support team will get back to you soon. 
        You'll receive a confirmation email shortly with your ticket number.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onNewMessage}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200"
        >
          <i className="fas fa-plus mr-2"></i>
          Send Another Message
        </button>
        <a
          href="/help"
          className="bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-2xl hover:bg-white/30 transition-all duration-200 text-center"
        >
          <i className="fas fa-question-circle mr-2"></i>
          Visit Help Center
        </a>
      </div>
    </div>
  );
};

export default ContactFormSuccess;
