import React from 'react';

const HelpBanner = () => {
  return (
    <div className="bg-black text-white grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      <div className="p-12 lg:p-24 flex flex-col justify-center items-start">
        <h2 className="text-3xl font-bold mb-4">Need Help? Check <br/> Out Our Help Center</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Got questions? We've got answers. Visit our help center for support with orders, returns, and more.
        </p>
        <button className="px-8 py-3 rounded-full border border-violet-500 text-violet-400 font-bold hover:bg-violet-600 hover:text-white transition-all">
          Go to Help Center
        </button>
      </div>
      <div className="h-[300px] lg:h-auto relative">
        <img 
          src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1000" 
          className="w-full h-full object-cover opacity-80" 
          alt="Help Center" 
        />
      </div>
    </div>
  );
};

export default HelpBanner;