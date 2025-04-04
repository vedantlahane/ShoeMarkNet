import React from 'react';

const Stories = ({ifExists,news}) => {
    return (
        <div
            className={`relative bg-theme grid items-center ${
                ifExists ? "justify-items-start" : "justify-items-center"
            } rounded-xl py-4 px-5 transition-all duration-700 ease-in-out w-full hover:scale-105`}
        >
            <div
                className={`grid items-center ${
                    ifExists ? "justify-items-start" : "justify-items-center"
                }`}
            >
                <h2 className="text-xl font-semibold mb-2">{news.title}</h2>
                <p className="text-gray-700 mb-2">{news.text}</p>
                <img
                    src={news.img}
                    alt={news.title}
                    className="w-full h-48 object-cover mb-2 rounded"
                />
                <div className="flex justify-between items-center mb-2">
                    {/* <span className="text-gray-500 text-sm">{news.time}</span>
                    <span className="text-gray-500 text-sm">{news.like}</span> */}
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">
                        By {news.by} 
                    </span>
                    <a href={news.url} className="text-blue-500 text-sm">
                        {news.btn}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Stories;