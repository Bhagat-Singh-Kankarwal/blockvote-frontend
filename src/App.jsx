import { BrowserRouter, Routes, Route } from 'react-router-dom';

import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";

import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import EmailVerification from "supertokens-auth-react/recipe/emailverification";
import { EmailVerificationPreBuiltUI } from "supertokens-auth-react/recipe/emailverification/prebuiltui";
import { EmailPasswordPreBuiltUI } from 'supertokens-auth-react/recipe/emailpassword/prebuiltui';
import * as reactRouterDom from "react-router-dom";

import { SessionAuth } from "supertokens-auth-react/recipe/session";

import { Toaster } from 'sonner';

import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import VotingDashboard from './pages/VotingDashboard';

SuperTokens.init({
  appInfo: {
    appName: "super-auth",
    apiDomain: import.meta.env.VITE_API_URL || "http://localhost:9010",
    websiteDomain: import.meta.env.VITE_WEBSITE_DOMAIN || "http://localhost:5173",
    apiBasePath: "/auth",
    websiteBasePath: "/auth",
  },
  style: `
    [data-supertokens~=superTokensBranding] {
      display:none;
    }

    [data-supertokens~=headerTitle] {
      font-family: 'Quicksand', sans;
    }
  `,
  getRedirectionURL: async (context) => {
    // Handle email verification success
    if (context.action === "VERIFY_EMAIL") {
      return "/dashboard";
    }
    
    if (context.action === "SUCCESS") {
      if (context.redirectToPath !== undefined) {
        return context.redirectToPath;
      }
      return "/dashboard";
    }
    return undefined;
  },
  recipeList: [
    EmailVerification.init({
      mode: "REQUIRED",
      emailVerificationFeature: {
        disableDefaultImplementation: false
      }
    }),
    EmailPassword.init(),
    Session.init()
  ],
});

function App() {
  return (
    <SuperTokensWrapper>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Toaster position="top-right" richColors />
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              
              <Route path="/admin-conflict" element={
                <div className="min-h-[calc(100vh-84px)] flex items-center justify-center p-4">
                  <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 max-w-md">
                    <p className="font-bold">Session Conflict</p>
                    <p>You cannot be logged in as both admin and user simultaneously.</p>
                  </div>
                </div>
              } />

              {/* This line adds all the SuperTokens routes, including email verification */}
              {getSuperTokensRoutesForReactRouterDom(reactRouterDom, [EmailPasswordPreBuiltUI, EmailVerificationPreBuiltUI])}

              <Route path='/dashboard' element={
                <SessionAuth requireAuth={true}>
                  <VotingDashboard />
                </SessionAuth>
              } />

              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </SuperTokensWrapper>
  );
}

export default App;

// import { BrowserRouter, Routes, Route } from 'react-router-dom';

// import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
// import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
// import Session from "supertokens-auth-react/recipe/session";

// import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
// import EmailVerification from "supertokens-auth-react/recipe/emailverification";
// import { EmailVerificationPreBuiltUI } from "supertokens-auth-react/recipe/emailverification/prebuiltui";
// import { EmailPasswordPreBuiltUI } from 'supertokens-auth-react/recipe/emailpassword/prebuiltui';
// import * as reactRouterDom from "react-router-dom";

// import { SessionAuth } from "supertokens-auth-react/recipe/session";

// import { Toaster } from 'sonner';

// import LandingPage from './pages/LandingPage';
// import AdminLogin from './pages/AdminLogin';
// import AdminDashboard from './pages/AdminDashboard';
// import Navbar from './components/Navbar';
// import VotingDashboard from './pages/VotingDashboard';


// SuperTokens.init({
//   appInfo: {
//     appName: "super-auth",
//     apiDomain: "http://localhost:9010",
//     websiteDomain: "http://localhost:5173",
//     apiBasePath: "/auth",
//     websiteBasePath: "/auth",
//   },
//   style: `
//     [data-supertokens~=superTokensBranding] {
//       display:none;
//     }

//     [data-supertokens~=headerTitle] {
//       font-family: 'Quicksand', sans;
//     }
//   `,
//   getRedirectionURL: async (context) => {
//     if (context.action === "SUCCESS" && context.newSessionCreated) {
//       if (context.redirectToPath !== undefined) {
//         return context.redirectToPath;
//       }
//       return "/dashboard";
//     }
//     return undefined;
//   },
//   recipeList: [
//     EmailVerification.init({
//       mode: "REQUIRED", // or "OPTIONAL"
//     }),
//     EmailPassword.init(),
//     Session.init()],
// });

// function App() {
//   return (
//     <SuperTokensWrapper>
//       <BrowserRouter>
//         <div className="min-h-screen flex flex-col">
//           <Toaster position="top-right" richColors />
//           <Navbar />
//           <main className="flex-1">
//             <Routes>
//               <Route path="/" element={<LandingPage />} />
              
//               <Route path="/admin-conflict" element={
//                 <div className="min-h-[calc(100vh-84px)] flex items-center justify-center p-4">
//                   <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 max-w-md">
//                     <p className="font-bold">Session Conflict</p>
//                     <p>You cannot be logged in as both admin and user simultaneously.</p>
//                   </div>
//                 </div>
//               } />


//               {getSuperTokensRoutesForReactRouterDom(reactRouterDom, [EmailPasswordPreBuiltUI, EmailVerificationPreBuiltUI])}


//               <Route path='/dashboard' element={
//                 <SessionAuth>

//                     <VotingDashboard />

//                 </SessionAuth>
//               } />

//               <Route path="/admin" element={<AdminLogin />} />
//               <Route path="/admin/dashboard" element={

//                   <AdminDashboard />

//               } />
//             </Routes>
//           </main>
//         </div>
//       </BrowserRouter>
//     </SuperTokensWrapper>
//   );
// }

// export default App;
