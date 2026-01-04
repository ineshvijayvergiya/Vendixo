import React from 'react';
import Button from '../../components/ui/Button';

const Contact = () => {
  return (
    <div className="min-h-screen bg-white py-20 px-6">
       <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
             <form className="space-y-6">
                <div>
                   <label className="block text-sm font-bold mb-2">Name</label>
                   <input type="text" className="w-full p-3 border rounded-lg outline-none focus:border-violet-600" placeholder="John Doe" />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-2">Email</label>
                   <input type="email" className="w-full p-3 border rounded-lg outline-none focus:border-violet-600" placeholder="john@example.com" />
                </div>
                <div>
                   <label className="block text-sm font-bold mb-2">Message</label>
                   <textarea rows="4" className="w-full p-3 border rounded-lg outline-none focus:border-violet-600" placeholder="How can we help?"></textarea>
                </div>
                <Button variant="primary" fullWidth>Send Message</Button>
             </form>
          </div>
       </div>
    </div>
  );
};
export default Contact;