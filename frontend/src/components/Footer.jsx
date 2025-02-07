import React, { useEffect, useState } from 'react'

const Footer = ({ footerAPI: { titles, links, img } }) => {
  const [year, setYear] = useState(null)
  
  useEffect(() => {
      setYear(new Date().getFullYear())
  }, [])
  
  return (
    <>
      <footer className='bg-theme pt-7 pb-5 mt-10'>
        <div className='nike-container text-slate-200'>
          <div className='grid items-start grid-cols-3 max-w-2xl w-full m-auto md:max-w-none md:gap-5'>
            {titles.map((val, i) => (
              <div key={i} className="grid items-center">
                <h1 className='text-lg lg:text-base md:text-sm uppercase font-semibold'>{val.title}</h1>
              </div>
            ))}
            {links.map((list, index) => (
              <ul key={index} className="grid items-center gap-1">
                {list.map((link, i) => (
                  <li key={i} className="text-sm sm:text-xs">{link.link}</li>
                ))}
              </ul>
            ))}
          </div>
          {img && (
            <div className="flex justify-center my-4">
              <img src={`http://localhost:5000/${img}`} alt="Footer Logo" className="h-10" />
            </div>
          )}
          <div className='mt-5 text-center'>
            <p className='text-sm md:text-center'>
              Copyright<sup className='text-base font-bold'>&copy;</sup> All Reserved Rights 
              <span className='font-semibold'> Vedant Lahane {year}</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer