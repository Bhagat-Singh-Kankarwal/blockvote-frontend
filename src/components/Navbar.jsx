import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSessionContext, signOut } from 'supertokens-auth-react/recipe/session';
import { toast } from 'sonner';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import logo from '../assets/img/logo.png';

function Navbar() {
  const navigate = useNavigate();
  const sessionContext = useSessionContext();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const location = useLocation();
  
  // Check if user is logged in with SuperTokens
  const isUserLoggedIn = sessionContext.loading === false && sessionContext.doesSessionExist;
  
  // Check for admin token on component mount and route change
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    setIsAdminLoggedIn(!!adminToken);
  }, [location.pathname]);
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuRef]);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleUserLogout = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
    toast.success('Admin logged out successfully');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-transparent">
      <div className={`bg-white shadow-md ${mobileMenuOpen ? 'rounded-t-2xl': 'rounded-2xl'} w-11/12 mx-auto mt-5 px-4 sm:px-6 lg:px-8 lg:w-8/12`}>
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="text-3xl font-bold font-instrument text-gray-800">
              BlockVote
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 font-quicksand font-semibold">
            <Link 
              to="/"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Home
            </Link>
            
            {isUserLoggedIn && !isAdminLoggedIn && (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={handleUserLogout}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
            
            {!isUserLoggedIn && !isAdminLoggedIn && (
              <>
                <Link to="/auth" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Login / Register
                </Link>
                <Link to="/admin" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Admin
                </Link>
              </>
            )}
            
            {isAdminLoggedIn && (
              <>
                <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Admin Dashboard
                </Link>
                <button 
                  onClick={handleAdminLogout}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden absolute z-50 w-11/12 mx-auto left-0 right-0" 
          ref={mobileMenuRef}
        >
          <div className="bg-white shadow-lg rounded-b-xl px-2 pt-2 pb-3 space-y-1 font-quicksand font-semibold">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base hover:bg-gray-100 text-gray-600"
            >
              Home
            </Link>

            {isUserLoggedIn && !isAdminLoggedIn && (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base hover:bg-gray-100 text-gray-600"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleUserLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base hover:bg-gray-100 text-gray-600"
                >
                  Logout
                </button>
              </>
            )}

            {!isUserLoggedIn && !isAdminLoggedIn && (
              <>
                <Link
                  to="/auth"
                  className="block px-3 py-2 rounded-md text-base hover:bg-gray-100 text-gray-600"
                  >
                  Login / Register
                </Link>
                <Link to="/admin" className="block px-3 py-2 rounded-md text-base hover:bg-gray-100 text-gray-600">
                  Admin
                </Link>
              </>
            )}

            {isAdminLoggedIn && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="block px-3 py-2 rounded-md text-base hover:bg-gray-100 text-gray-600"
                >
                  Admin Dashboard
                </Link>
                <button
                  onClick={handleAdminLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base hover:bg-gray-100 text-gray-600"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

// import { useEffect, useState } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useSessionContext, signOut } from 'supertokens-auth-react/recipe/session';
// import { toast } from 'sonner';
// import logo from '../assets/img/logo.png';

// function Navbar() {
//   const navigate = useNavigate();
//   const sessionContext = useSessionContext();
//   const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
//   const location = useLocation();
  
//   // Check if user is logged in with SuperTokens
//   const isUserLoggedIn = sessionContext.loading === false && sessionContext.doesSessionExist;
  
//   // Check for admin token on component mount and route change
//   useEffect(() => {
//     const adminToken = localStorage.getItem('adminToken');
//     setIsAdminLoggedIn(!!adminToken);
//   }, [location.pathname]);

//   const handleUserLogout = async () => {
//     await signOut();
//     navigate('/');
//   };

//   const handleAdminLogout = () => {
//     localStorage.removeItem('adminToken');
//     // setIsAdminLoggedIn(false);
//     navigate('/admin');
//     toast.success('Admin logged out successfully');
//   };

//   return (
//     <nav className="bg-transparent">
//       <div className="bg-white shadow-md rounded-2xl w-11/12 mx-auto mt-5 px-4 sm:px-6 lg:px-8 lg:w-8/12">
//         <div className="flex justify-between h-16 items-center">
//           <div className="flex-shrink-0">
//             {/* <img src={logo} alt="Logo" className="h-10 w-10" /> */}
//             <Link to="/" className="text-3xl font-bold font-instrument text-gray-800">
//               BlockVote
//             </Link>
//           </div>
          
//           <div className="flex space-x-2 font-quicksand font-semibold lg:space-x-8">
//             <Link to="/" className="text-gray-600 hover:text-gray-800 transition-colors">
//               Home
//             </Link>
            
//             {/* Show user-specific links only if user is logged in */}
//             {isUserLoggedIn && !isAdminLoggedIn && (
//               <>
//                 <Link to="/dashboard" className="text-gray-600 hover:text-gray-800 transition-colors">
//                   Dashboard
//                 </Link>
//                 <button 
//                   onClick={handleUserLogout}
//                   className="text-gray-600 hover:text-gray-800 transition-colors"
//                 >
//                   Logout
//                 </button>
//               </>
//             )}
            
//             {/* Show login link only if neither user nor admin is logged in */}
//             {!isUserLoggedIn && !isAdminLoggedIn && (
//               <Link to="/auth" className="text-gray-600 hover:text-gray-800 transition-colors">
//                 Login / Register
//               </Link>
//             )}
            
//             {/* Admin section - mutually exclusive with user login */}
//             {isAdminLoggedIn ? (
//               <>
//                 <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-800 transition-colors">
//                   Admin Dashboard
//                 </Link>
//                 <button 
//                   onClick={handleAdminLogout}
//                   className="text-gray-600 hover:text-gray-800 transition-colors"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <></>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;