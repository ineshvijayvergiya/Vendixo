import React from 'react';
import HelpBanner from '../../components/common/HelpBanner';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold mb-8 text-gray-900">About TechShed</h1>
        <p className="text-xl text-gray-600 leading-relaxed mb-12">
          We are a team of tech enthusiasts dedicated to bringing you the latest gadgets at the best prices. 
          Founded in 2024, TechShed has grown from a small garage project to a global e-commerce brand.
          Our mission is simple: **Tech for Everyone.**
        </p>
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" 
          alt="Team" 
          className="rounded-2xl shadow-xl w-full"
        />
      </div>
      <HelpBanner />
    </div>
  );
};
export default About;