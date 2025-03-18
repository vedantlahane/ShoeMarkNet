import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectTotalQTY, setOpenCart } from '../app/CartSlice.jsx';

import { HeartIcon, MagnifyingGlassIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import logo from '../assets/Drip kicks logo.png';

const Navbar = () => {//arrow function component Navbar with hooks useState, useEffect, useDispatch, useSelector
    const [navState, setNavState] = useState(false);//useState hook is used to add state to functional components. useState returns an array with two elements. The first element is the current state value and the second element is a function that lets you update it.
    const dispatch = useDispatch();//useDispatch hook is used to dispatch actions in the redux store. it  means that you can dispatch actions to the store from any component in your application. dispatch is a function that takes an action object as an argument and sends it to the store.
    const totalQTY = useSelector(selectTotalQTY);//

    const onCartToggle = () => {
        dispatch(setOpenCart({
            cartState: true
        }))
    }//onCartToggle function is used to open the cart when the cart icon is clicked.

    const onNavScroll = () => {
        if(window.scrollY > 30) {
            setNavState(true);
        } else {
            setNavState(false);
        }
    }
    useEffect(() => {
        window.addEventListener('scroll', onNavScroll);

        return () => {
            window.removeEventListener('scroll', onNavScroll);
        }
    },[]);
return (
    <>
        <header className={
          !navState ? 'absolute top-7 left-0 right-0 opacity-100 z-50' : 'fixed top-0 left-0 right-0 h-[9vh] flex items-center justify-center opacity-100 z-[200] blur-effect-theme'
        }>
          <nav className='flex items-center justify-between nike-container'>
                <a href='/' className='flex items-center'>
                    <span className='text-l font-medium'>ShoeMarkNet</span>
                     {/* <img
                          src={logo}
                          alt="logo/img"
                          className={`w-20 h-15 brightness-0`}
                     /> */}
                </a>
                <ul className='flex items-center justify-center gap-2'>
                     <li className='grid items-center'
                     onClick={() => window.location.href = '/explore'}>
                          <MagnifyingGlassIcon className={`icon-style ${navState && "text-slate-900 transition-all duration-300"}`} />
                     </li>
                     <li className='grid items-center' onClick={() => window.location.href = '/story'}>
                          <HeartIcon className={`icon-style ${navState && "text-slate-900 transition-all duration-300"}`} />
                     </li>
                     <li className='grid items-center'>
                          <button type='button' onClick={onCartToggle} className='border-none outline-none active:scale-110 transition-all duration-300 relative'>
                                <ShoppingBagIcon className={`icon-style ${navState && "text-slate-900 transition-all duration-300"}`} />
                                <div className={`absolute top-4 right-0 shadow w-4 h-4 text-[0.65rem] leading-tight font-medium rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 ${navState ? 'bg-slate-900 text-slate-100 shadow-slate-900' : 'bg-slate-100 text-slate-900 shadow-slate-100'}`}>{totalQTY}</div>
                          </button>
                     </li>
                </ul>
          </nav>
        </header>
    </>
  )
}

export default Navbar