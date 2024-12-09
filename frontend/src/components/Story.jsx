import React from "react";
import Stories from "./utils/Stories"

const Story = ({ ifExists, story }) => {
    console.log(story)
return (
    <div className="relative h-auto w-auto flex flex-row">
        <div className="bg-theme clip-path h-[85vh] lg:h-[75vh] md:h-[65vh] sm:h-[55vh] w-auto absolute top-0 left-0 right-0 opacity-100 z-10"></div>
        <div className="relative opacity-100 z-20 grid items-center justify-items-center nike-container">
            <div className="grid items-center justify-items-center mt-28 md:mt-24"></div>
            <h1 className="text-6xl lg:text-5xl md:text-4xl sm:text-3xl xsm:text-2xl font-extrabold filter drop-shadow-sm text-slate-200 ">
                {story.title}
            </h1>
            <div className="nike-container mt-8">
                <div
                    className={`grid items-center justify-items-center gap-7 lg:gap-5 mt-7 ${
                        ifExists
                            ? "grid-cols-3 xl:grid-cols-2 sm:grid-cols-1"
                            : "grid-cols-3 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1"
                    }`}
                >
                    {story.news.map((newsItem, index) => (
                <Stories key={index} news={newsItem}ifExists={ifExists} />
              ))}
                    
                </div>
            </div>
        </div>
    </div>
);
};

export default Story;
