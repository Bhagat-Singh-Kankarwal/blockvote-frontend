import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LockClosedIcon, UserGroupIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useSessionContext } from 'supertokens-auth-react/recipe/session';

function LandingPage() {
  const sessionContext = useSessionContext();
  const isUserLoggedIn = sessionContext.loading === false && sessionContext.doesSessionExist;
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Check if user has admin token when component mounts or login state changes
  useEffect(() => {
    // Simple check for admin token in localStorage
    const adminToken = localStorage.getItem('adminToken');
    setIsAdminLoggedIn(!!adminToken);
  }, [isUserLoggedIn]);
  
  return (
    <div className="min-h-[calc(100vh-84px)] flex flex-col items-center justify-center p-4">
      <div className=" w-10/12 text-center mb-2 md:mb-12 md:w-full">
        <h1 className="text-4xl font-bold font-instrument mb-4 text-gray-800">
          Blockchain Voting System
        </h1>
        <p className="text-lg font-quicksand text-gray-800 mb-8 text-justify md:text-center">
          Secure, transparent, and immutable voting platform powered by blockchain technology
        </p>
      </div>

      <div className="flex flex-col items-center md:flex-row justify-center gap-3 md:gap-8 w-full max-w-2xl">
        {/* SCENARIO 1: No one logged in - show both options */}
        {!isUserLoggedIn && !isAdminLoggedIn && (
          <>
            <Link
              to="/auth"
              className="flex-1 p-6 w-11/12 md:w-auto bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="font-quicksand text-xl font-bold mb-2">User Login</h2>
              <p className="text-gray-600 text-[15px] font-quicksand font-semibold">Login or register to cast your vote</p>
            </Link>

            <Link
              to="/admin"
              className="flex-1 p-6 w-11/12 md:max-w-md bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <LockClosedIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="font-quicksand text-xl font-bold mb-2">Admin Login</h2>
              <p className="text-gray-600 text-[15px] font-quicksand font-semibold">Login to manage elections</p>
            </Link>
          </>
        )}

        {/* SCENARIO 2: User logged in - only show voting dashboard */}
        {isUserLoggedIn && !isAdminLoggedIn && (
          <Link
            to="/dashboard"
            className="flex-1 p-6 w-11/12 md:w-auto bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="font-quicksand text-xl font-bold mb-2">Voting Dashboard</h2>
            <p className="text-gray-600 text-[15px] font-quicksand font-semibold">Access your secure voting dashboard</p>
          </Link>
        )}

        {/* SCENARIO 3: Admin logged in - only show admin dashboard */}
        {isAdminLoggedIn && (
          <Link
            to="/admin/dashboard"
            className="flex-1 p-6 w-11/12 md:max-w-md bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <ClipboardDocumentIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="font-quicksand text-xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-gray-600 text-[15px] font-quicksand font-semibold">Manage elections and view results</p>
          </Link>
        )}
      </div>
    </div>
  );
}

export default LandingPage;
