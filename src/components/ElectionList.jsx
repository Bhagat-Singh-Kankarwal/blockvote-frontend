import { useState } from 'react';

function ElectionList({ elections, onUpdateStatus, onDelete, onViewResults, loading }) {
  const [expandedElections, setExpandedElections] = useState([]);
  const [expandedVoterLists, setExpandedVoterLists] = useState([]);

  const toggleExpand = (electionId) => {
    if (expandedElections.includes(electionId)) {
      setExpandedElections(expandedElections.filter(id => id !== electionId));
    } else {
      setExpandedElections([...expandedElections, electionId]);
    }
  };

  const toggleVoterList = (e, electionId) => {
    e.stopPropagation();
    if (expandedVoterLists.includes(electionId)) {
      setExpandedVoterLists(expandedVoterLists.filter(id => id !== electionId));
    } else {
      setExpandedVoterLists([...expandedVoterLists, electionId]);
    }
  };

  // Define which statuses can transition to which other statuses
  const getAvailableStatusTransitions = (currentStatus) => {
    // Normalize status for comparison
    const status = currentStatus.toUpperCase();
    
    switch (status) {
      case 'CREATED':
        return ['ACTIVE', 'CANCELED'];
      case 'ACTIVE':
        return ['PAUSED', 'ENDED', 'CANCELED'];
      case 'PAUSED':
        return ['ACTIVE', 'ENDED', 'CANCELED'];
      case 'ENDED':
        return [''];
      case 'CANCELED':
        return []; // Terminal state
      default:
        return ['ACTIVE', 'CANCELED']; // Default options
    }
  };

  // Get button config for a given status
  const getButtonConfig = (status) => {
    return {
      'ACTIVE': {
        color: 'green',
        label: 'Activate'
      },
      'PAUSED': {
        color: 'yellow',
        label: 'Pause'
      },
      'ENDED': {
        color: 'blue',
        label: 'End'
      },
      'RESULTS_DECLARED': {
        color: 'purple',
        label: 'Declare Results'
      },
      'CANCELED': {
        color: 'red',
        label: 'Cancel'
      }
    }[status] || { color: 'gray', label: status };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-GB", { hour12: true });
  };

  const getStatusClass = (status) => {
    // Normalize status for comparison
    const normalizedStatus = status.toUpperCase();
    
    switch (normalizedStatus) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'ENDED': return 'bg-blue-100 text-blue-800';
      case 'CANCELED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  // Render the status action buttons based on the available transitions
  const renderStatusActionButtons = (election) => {
    const availableTransitions = getAvailableStatusTransitions(election.status);
    
    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {availableTransitions.map(status => {
          const config = getButtonConfig(status);
          return (
            <button
              key={status}
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(election.electionID, status);
              }}
              className={`uppercase px-3 py-1 font-semibold bg-${config.color}-500 text-white text-sm rounded hover:bg-${config.color}-600`}
            >
              {config.label}
            </button>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-12">Loading elections...</div>;
  }

  if (!elections || elections.length === 0) {
    return (
      <div className="text-center py-12 font-quicksand">
        <p className="text-gray-600 font-bold">No elections found.</p>
        <p className="text-sm text-gray-500 mt-2 font-semibold">Create a new election to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-quicksand">
      <h2 className="text-xl font-semibold mb-4">Elections ({elections.length})</h2>
      
      {elections.map((election) => (
        <div key={election.electionID} className="border rounded-lg overflow-hidden">
          <div 
            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => toggleExpand(election.electionID)}
          >
            <div className="flex-1">
              <h3 className="font-semibold">{election.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-1 font-semibold">{election.description}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase select-none ${getStatusClass(election.status)}`}>
                {election.status}
              </span>
              <button className='text-xs font-quicksand'>
                {expandedElections.includes(election.electionID) ? '▲' : '▼'}
              </button>
            </div>
          </div>
          
          {expandedElections.includes(election.electionID) && (
            <div className="p-4 border-t bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 font-semibold">ID: {election.electionID}</p>
                  <p className="text-sm text-gray-500 font-semibold">Start: {formatDate(election.startDate)}</p>
                  <p className="text-sm text-gray-500 font-semibold">End: {formatDate(election.endDate)}</p>
                  
                  {/* Voter Registration Section */}
                  <div className="mt-3">
                    <div 
                      className="flex items-center cursor-pointer text-sm"
                      onClick={(e) => toggleVoterList(e, election.electionID)}
                    >
                      <span className="font-semibold">
                        Registered Voters: {election.registeredVoters ? election.registeredVoters.length : 0}
                      </span>
                      <button className="ml-2 text-xs">
                        {expandedVoterLists.includes(election.electionID) ? '(Hide)' : '(Show)'}
                      </button>
                    </div>
                    
                    {expandedVoterLists.includes(election.electionID) && (
                      <div className="mt-2 ml-2 max-h-32 overflow-auto bg-white p-2 rounded border text-sm">
                        {election.registeredVoters && election.registeredVoters.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {election.registeredVoters.map((voter, idx) => (
                              <li key={idx} className="text-gray-700 truncate">{voter}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">No registered voters</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {/* <div>
                  <p className="text-sm font-semibold">Candidates:</p>
                  <ul className="list-disc pl-5 text-sm">
                    {election.candidates.map((candidate) => (
                      <li key={candidate.id || candidate.candidateID} className=''>
                        <span className='font-semibold text-base'>
                          {candidate.name}
                        </span>
                        <span className='ml-3'>
                          {candidate.party}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div> */}
                <div>
                  <p className="text-sm font-semibold mb-2">Candidates:</p>
                  <div className="w-10/12 relative overflow-x-auto border border-gray-300 rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                          <th scope="col" className="px-4 py-2">
                            ID
                          </th>
                          <th scope="col" className="px-4 py-2">
                            Name
                          </th>
                          <th scope="col" className="px-4 py-2">
                            Party
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {election.candidates.map((candidate) => (
                          <tr key={candidate.id || candidate.candidateID} className="bg-white border-b border-gray-200 last:border-b-0">
                            <th scope="row" className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                              {candidate.id || candidate.candidateID}
                            </th>
                            <td className="px-4 py-2 font-semibold">
                              {candidate.name}
                            </td>
                            <td className="px-4 py-2 font-medium">
                              {candidate.party}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Status Control Buttons */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Status Actions:</h4>
                {renderStatusActionButtons(election)}
              </div>
              
              {/* Other Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewResults(election.electionID);
                  }}
                  disabled={loading || !['ENDED', 'RESULTS_DECLARED'].includes(election.status.toUpperCase())}
                  className={`uppercase px-3 py-1 bg-purple-500 text-white font-semibold text-sm rounded hover:bg-purple-600 disabled:opacity-50 ${
                    !['ENDED', 'RESULTS_DECLARED'].includes(election.status.toUpperCase()) ? 'cursor-not-allowed' : ''
                  }`}
                >
                  View Results
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(election.electionID);
                  }}
                  disabled={loading}
                  className="uppercase px-3 py-1 bg-red-500 text-white font-semibold text-sm rounded hover:bg-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ElectionList;
// import { useState } from 'react';

// function ElectionList({ elections, onUpdateStatus, onDelete, onViewResults, loading }) {
//   const [expandedElections, setExpandedElections] = useState([]);
//   const [expandedVoterLists, setExpandedVoterLists] = useState([]);

//   const toggleExpand = (electionId) => {
//     if (expandedElections.includes(electionId)) {
//       setExpandedElections(expandedElections.filter(id => id !== electionId));
//     } else {
//       setExpandedElections([...expandedElections, electionId]);
//     }
//   };

//   const toggleVoterList = (e, electionId) => {
//     e.stopPropagation(); // Prevent toggling the main election panel
    
//     if (expandedVoterLists.includes(electionId)) {
//       setExpandedVoterLists(expandedVoterLists.filter(id => id !== electionId));
//     } else {
//       setExpandedVoterLists([...expandedVoterLists, electionId]);
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString();
//   };

//   const getStatusClass = (status) => {
//     // Normalize status for comparison
//     const normalizedStatus = status.toUpperCase();
    
//     switch (normalizedStatus) {
//       case 'ACTIVE': return 'bg-green-100 text-green-800';
//       case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
//       case 'ENDED': return 'bg-blue-100 text-blue-800';
//       case 'RESULTS_DECLARED': return 'bg-purple-100 text-purple-800';
//       case 'CANCELED': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };
  
//   // Helper function to format status for display
//   const formatStatus = (status) => {
//     // Convert RESULTS_DECLARED to "Results Declared"
//     return status
//       .split('_')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
//       .join(' ');
//   };

//   if (loading) {
//     return <div className="text-center py-12">Loading elections...</div>;
//   }

//   if (!elections || elections.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-gray-600">No elections found.</p>
//         <p className="text-sm text-gray-500 mt-2">Create a new election to get started.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold mb-4">Elections ({elections.length})</h2>
      
//       {elections.map((election) => (
//         <div key={election.electionID} className="border rounded-lg overflow-hidden">
//           <div 
//             className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
//             onClick={() => toggleExpand(election.electionID)}
//           >
//             <div className="flex-1">
//               <h3 className="font-semibold">{election.name}</h3>
//               <p className="text-sm text-gray-600 line-clamp-1">{election.description}</p>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getStatusClass(election.status)}`}>
//                 {formatStatus(election.status)}
//               </span>
//               <button>
//                 {expandedElections.includes(election.electionID) ? '▲' : '▼'}
//               </button>
//             </div>
//           </div>
          
//           {expandedElections.includes(election.electionID) && (
//             <div className="p-4 border-t bg-gray-50">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <p className="text-sm text-gray-500">ID: {election.electionID}</p>
//                   <p className="text-sm text-gray-500">Start: {formatDate(election.startDate)}</p>
//                   <p className="text-sm text-gray-500">End: {formatDate(election.endDate)}</p>
                  
//                   {/* Voter Registration Section */}
//                   <div className="mt-3">
//                     <div 
//                       className="flex items-center cursor-pointer text-sm"
//                       onClick={(e) => toggleVoterList(e, election.electionID)}
//                     >
//                       <span className="font-semibold">
//                         Registered Voters: {election.registeredVoters ? election.registeredVoters.length : 0}
//                       </span>
//                       <button className="ml-2 text-xs">
//                         {expandedVoterLists.includes(election.electionID) ? '(Hide)' : '(Show)'}
//                       </button>
//                     </div>
                    
//                     {expandedVoterLists.includes(election.electionID) && (
//                       <div className="mt-2 ml-2 max-h-32 overflow-auto bg-white p-2 rounded border text-sm">
//                         {election.registeredVoters && election.registeredVoters.length > 0 ? (
//                           <ul className="list-disc list-inside">
//                             {election.registeredVoters.map((voter, idx) => (
//                               <li key={idx} className="text-gray-700 truncate">{voter}</li>
//                             ))}
//                           </ul>
//                         ) : (
//                           <p className="text-gray-500 italic">No registered voters</p>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold">Candidates:</p>
//                   <ul className="list-disc pl-5 text-sm">
//                     {election.candidates.map((candidate) => (
//                       <li key={candidate.id || candidate.candidateID}>
//                         {candidate.name}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
              
//               {/* Status Control Buttons */}
//               <div>
//                 <h4 className="text-sm font-semibold mb-2">Status Actions:</h4>
//                 <div className="flex flex-wrap gap-2 mb-4">
                    
//                   {/* ACTIVE */}
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onUpdateStatus(election.electionID, 'ACTIVE');
//                     }}
//                     disabled={loading || election.status === 'ACTIVE'}
//                     className={`uppercase px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 
//                       ${election.status === 'ACTIVE' ? 'opacity-50 cursor-not-allowed' : ''}`}
//                   >
//                     Activate
//                   </button>
                  
//                   {/* PAUSED */}
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onUpdateStatus(election.electionID, 'PAUSED');
//                     }}
//                     disabled={loading || election.status === 'PAUSED'}
//                     className={`uppercase px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 
//                       ${election.status === 'PAUSED' ? 'opacity-50 cursor-not-allowed' : ''}`}
//                   >
//                     Pause
//                   </button>
                  
//                   {/* ENDED */}
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onUpdateStatus(election.electionID, 'ENDED');
//                     }}
//                     disabled={loading || election.status === 'ENDED'}
//                     className={`uppercase px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 
//                       ${election.status === 'ENDED' ? 'opacity-50 cursor-not-allowed' : ''}`}
//                   >
//                     End
//                   </button>
                  
                  
//                   {/* CANCELED */}
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onUpdateStatus(election.electionID, 'CANCELED');
//                     }}
//                     disabled={loading || election.status === 'CANCELED'}
//                     className={`uppercase px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 
//                       ${election.status === 'CANCELED' ? 'opacity-50 cursor-not-allowed' : ''}`}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
              
//               {/* Other Action Buttons */}
//               <div className="flex flex-wrap gap-2 mt-2">
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onViewResults(election.electionID);
//                   }}
//                   disabled={loading}
//                   className="uppercase px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50"
//                 >
//                   View Results
//                 </button>
                
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onDelete(election.electionID);
//                   }}
//                   disabled={loading}
//                   className="uppercase px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

// export default ElectionList;


// import { useState } from 'react';

// function ElectionList({ elections, onUpdateStatus, onDelete, onViewResults, loading }) {
//   const [expandedElections, setExpandedElections] = useState([]);
//   const [expandedVoterLists, setExpandedVoterLists] = useState([]);

//   const toggleExpand = (electionId) => {
//     if (expandedElections.includes(electionId)) {
//       setExpandedElections(expandedElections.filter(id => id !== electionId));
//     } else {
//       setExpandedElections([...expandedElections, electionId]);
//     }
//   };

//   const toggleVoterList = (e, electionId) => {
//     e.stopPropagation(); // Prevent toggling the main election panel
    
//     if (expandedVoterLists.includes(electionId)) {
//       setExpandedVoterLists(expandedVoterLists.filter(id => id !== electionId));
//     } else {
//       setExpandedVoterLists([...expandedVoterLists, electionId]);
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString();
//   };

//   const getStatusClass = (status) => {
//     switch (status) {
//       case 'upcoming': return 'bg-yellow-100 text-yellow-800';
//       case 'active': return 'bg-green-100 text-green-800';
//       case 'completed': return 'bg-blue-100 text-blue-800';
//       case 'cancelled': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   if (loading) {
//     return <div className="text-center py-12">Loading elections...</div>;
//   }

//   if (!elections || elections.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-gray-600">No elections found.</p>
//         <p className="text-sm text-gray-500 mt-2">Create a new election to get started.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold mb-4">Elections ({elections.length})</h2>
      
//       {elections.map((election) => (
//         <div key={election.electionID} className="border rounded-lg overflow-hidden">
//           <div 
//             className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
//             onClick={() => toggleExpand(election.electionID)}
//           >
//             <div className="flex-1">
//               <h3 className="font-semibold">{election.name}</h3>
//               <p className="text-sm text-gray-600 line-clamp-1">{election.description}</p>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(election.status)}`}>
//                 {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
//               </span>
//               <button>
//                 {expandedElections.includes(election.electionID) ? '▲' : '▼'}
//               </button>
//             </div>
//           </div>
          
//           {expandedElections.includes(election.electionID) && (
//             <div className="p-4 border-t bg-gray-50">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <p className="text-sm text-gray-500">ID: {election.electionID}</p>
//                   <p className="text-sm text-gray-500">Start: {formatDate(election.startDate)}</p>
//                   <p className="text-sm text-gray-500">End: {formatDate(election.endDate)}</p>
                  
//                   {/* Voter Registration Section */}
//                   <div className="mt-3">
//                     <div 
//                       className="flex items-center cursor-pointer text-sm"
//                       onClick={(e) => toggleVoterList(e, election.electionID)}
//                     >
//                       <span className="font-semibold">
//                         Registered Voters: {election.registeredVoters ? election.registeredVoters.length : 0}
//                       </span>
//                       <button className="ml-2 text-xs">
//                         {expandedVoterLists.includes(election.electionID) ? '(Hide)' : '(Show)'}
//                       </button>
//                     </div>
                    
//                     {expandedVoterLists.includes(election.electionID) && (
//                       <div className="mt-2 ml-2 max-h-32 overflow-auto bg-white p-2 rounded border text-sm">
//                         {election.registeredVoters && election.registeredVoters.length > 0 ? (
//                           <ul className="list-disc list-inside">
//                             {election.registeredVoters.map((voter, idx) => (
//                               <li key={idx} className="text-gray-700 truncate">{voter}</li>
//                             ))}
//                           </ul>
//                         ) : (
//                           <p className="text-gray-500 italic">No registered voters</p>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold">Candidates:</p>
//                   <ul className="list-disc pl-5 text-sm">
//                     {election.candidates.map((candidate) => (
//                       <li key={candidate.id || candidate.candidateID}>
//                         {candidate.name}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
              
//               <div className="flex flex-wrap gap-2">
//                 {election.status !== 'active' && (
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onUpdateStatus(election.electionID, 'active');
//                     }}
//                     disabled={loading}
//                     className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
//                   >
//                     Activate
//                   </button>
//                 )}
                
//                 {election.status === 'active' && (
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onUpdateStatus(election.electionID, 'completed');
//                     }}
//                     disabled={loading}
//                     className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
//                   >
//                     Complete
//                   </button>
//                 )}
                
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onViewResults(election.electionID);
//                   }}
//                   disabled={loading}
//                   className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50"
//                 >
//                   View Results
//                 </button>
                
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onDelete(election.electionID);
//                   }}
//                   disabled={loading}
//                   className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

// export default ElectionList;

// import { useState } from 'react';

// function ElectionList({ elections, onUpdateStatus, onDelete, onViewResults, loading }) {
//   const [expandedElections, setExpandedElections] = useState([]);

//   const toggleExpand = (electionId) => {
//     if (expandedElections.includes(electionId)) {
//       setExpandedElections(expandedElections.filter(id => id !== electionId));
//     } else {
//       setExpandedElections([...expandedElections, electionId]);
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleString();
//   };

//   const getStatusClass = (status) => {
//     switch (status) {
//       case 'upcoming': return 'bg-yellow-100 text-yellow-800';
//       case 'active': return 'bg-green-100 text-green-800';
//       case 'completed': return 'bg-blue-100 text-blue-800';
//       case 'cancelled': return 'bg-red-100 text-red-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   if (loading) {
//     return <div className="text-center py-12">Loading elections...</div>;
//   }

//   if (!elections || elections.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-gray-600">No elections found.</p>
//         <p className="text-sm text-gray-500 mt-2">Create a new election to get started.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold mb-4">Elections ({elections.length})</h2>
      
//       {elections.map((election) => (
//         <div key={election.electionID} className="border rounded-lg overflow-hidden">
//           <div 
//             className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
//             onClick={() => toggleExpand(election.electionID)}
//           >
//             <div className="flex-1">
//               <h3 className="font-semibold">{election.name}</h3>
//               <p className="text-sm text-gray-600 line-clamp-1">{election.description}</p>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(election.status)}`}>
//                 {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
//               </span>
//               <button>
//                 {expandedElections.includes(election.electionID) ? '▲' : '▼'}
//               </button>
//             </div>
//           </div>
          
//           {expandedElections.includes(election.electionID) && (
//             <div className="p-4 border-t bg-gray-50">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                 <div>
//                   <p className="text-sm text-gray-500">ID: {election.electionID}</p>
//                   <p className="text-sm text-gray-500">Start: {formatDate(election.startDate)}</p>
//                   <p className="text-sm text-gray-500">End: {formatDate(election.endDate)}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold">Candidates:</p>
//                   <ul className="list-disc pl-5 text-sm">
//                     {election.candidates.map((candidate) => (
//                       <li key={candidate.id}>{candidate.name}</li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
              
//               <div className="flex flex-wrap gap-2">
//                 {election.status !== 'active' && (
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onUpdateStatus(election.electionID, 'active');
//                     }}
//                     disabled={loading}
//                     className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
//                   >
//                     Activate
//                   </button>
//                 )}
                
//                 {election.status === 'active' && (
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onUpdateStatus(election.electionID, 'completed');
//                     }}
//                     disabled={loading}
//                     className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
//                   >
//                     Complete
//                   </button>
//                 )}
                
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onViewResults(election.electionID);
//                   }}
//                   disabled={loading}
//                   className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50"
//                 >
//                   View Results
//                 </button>
                
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onDelete(election.electionID);
//                   }}
//                   disabled={loading}
//                   className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }

// export default ElectionList;