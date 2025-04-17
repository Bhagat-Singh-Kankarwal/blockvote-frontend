import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../utils/api';
import { useSessionContext, getUserId } from 'supertokens-auth-react/recipe/session';
import VotingModal from '../components/VotingModal';
import PublicElectionResults from '../components/PublicElectionResults';

import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';


const VotingDashboard = () => {
  const sessionContext = useSessionContext();
  const [loading, setLoading] = useState(true);
  const [hasIdentity, setHasIdentity] = useState(false);
  const [identityFile, setIdentityFile] = useState(null);
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);
  const [userId, setUserId] = useState(null);

  const [isRegisteredButMissingFile, setIsRegisteredButMissingFile] = useState(false);

  // New state variables for elections
  const [activeElections, setActiveElections] = useState([]);
  const [userElections, setUserElections] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [fetchingElections, setFetchingElections] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [showVotingModal, setShowVotingModal] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);

  const [completedElections, setCompletedElections] = useState([]);
  const [selectedCompletedElection, setSelectedCompletedElection] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('Transaction ID copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
        toast.error('Failed to copy transaction ID');
      });
  };

  // Add a function to fetch completed elections
  const fetchCompletedElections = async () => {
    try {
      const response = await api.get('/elections');
      // Filter elections with RESULTS_DECLARED status
      const declared = response.data.filter(
        election => election.status === 'RESULTS_DECLARED' || election.status === 'ENDED'
      );
      setCompletedElections(declared);
    } catch (error) {
      console.error('Error fetching completed elections:', error);
    }
  };

  // Call this function when the component loads and has identity
  useEffect(() => {
    if (hasIdentity && identityFile) {
      fetchActiveElections();
      fetchUserElections();
      fetchCompletedElections();
    }
  }, [hasIdentity, identityFile]);


  useEffect(() => {
    if (sessionContext.loading === false && sessionContext.doesSessionExist) {
      // Get userId for filename and localStorage key
      getUserId().then(id => {
        setUserId(id);

        // Check if identity exists in localStorage first
        const storedIdentity = localStorage.getItem(`blockchain_identity_${id}`);
        if (storedIdentity) {
          try {
            setIdentityFile(JSON.parse(storedIdentity));
            setHasIdentity(true);
            setLoading(false);
          } catch (err) {
            console.error('Error parsing stored identity:', err);
            // If stored identity is corrupted, check with the server
            checkFabricIdentity(true);
          }
        } else {
          console.error('No blockchain identity found in localStorage');
          checkFabricIdentity(true);
        }
      });
    }
  }, [sessionContext.loading]);

  const checkFabricIdentity = async (localIdentityMissing = false) => {
    try {
      const response = await api.get('/fabric/identity/check');
      if (response.data.registered && localIdentityMissing) {
        // User is registered on server but missing local identity
        toast.warning('Your blockchain identity file is missing. Please upload it.');
        setIsRegisteredButMissingFile(true);
        setHasIdentity(false);
      } else {
        setHasIdentity(response.data.registered);
        setIsRegisteredButMissingFile(false);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error checking fabric identity:', error);
      toast.error('Failed to check blockchain identity status');
      setLoading(false);
    }
  };

  const handleIdentityFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const identityData = JSON.parse(event.target.result);
        // Basic validation - could be enhanced based on your file structure
        if (!identityData) {
          throw new Error('Invalid identity file format');
        }

        // Store the identity in state and localStorage
        setIdentityFile(identityData);
        localStorage.setItem(`blockchain_identity_${userId}`, JSON.stringify(identityData));

        // Update states
        setHasIdentity(true);
        setIsRegisteredButMissingFile(false);

        toast.success('Identity file successfully restored');
      } catch (error) {
        console.error('Error parsing identity file:', error);
        toast.error('Invalid identity file format');
      }
    };

    reader.readAsText(file);
  };

  const registerWithFabric = async () => {
    try {
      setLoading(true);
      const response = await api.post('/fabric/register');

      // Store identity file for download
      const identityData = response.data.identityFile;
      setIdentityFile(identityData);

      // Save to localStorage for future use
      if (userId) {
        localStorage.setItem(`blockchain_identity_${userId}`, JSON.stringify(identityData));
      }

      setShowDownloadPrompt(true);
      setHasIdentity(true);

      toast.success('Blockchain identity created successfully');
    } catch (error) {
      console.error('Error registering with fabric:', error);
      toast.error('Failed to create blockchain identity');
    } finally {
      setLoading(false);
    }
  };

  const downloadIdentityFile = () => {
    if (!identityFile) return;

    // Create a JSON blob
    const blob = new Blob([JSON.stringify(identityFile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a meaningful filename using userId if available
    const filename = userId
      ? `blockchain_identity_${userId}.json`
      : `blockchain_identity_${Date.now()}.json`;

    // Create a temporary link element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    setShowDownloadPrompt(false);
  };

  // Fetch active elections
  const fetchActiveElections = async () => {
    try {
      setFetchingElections(true);
      const response = await api.get('/elections/active');
      console.log("Active elections response:", response.data);
      setActiveElections(response.data || []);
    } catch (error) {
      console.error('Error fetching active elections:', error);
      toast.error('Failed to fetch active elections');
    } finally {
      setFetchingElections(false);
    }
  };

  // Fetch user's elections (where they are registered)
  const fetchUserElections = async () => {
    if (!identityFile) return;

    try {
      setFetchingElections(true);

      // Get user's registered elections
      const response = await api.post('/user/elections', {
        credentials: identityFile
      });

      const userElectionData = response.data || [];
      setUserElections(userElectionData);

      // Create a map of candidate names by ID for each election
      const candidateNameMap = {};
      userElectionData.forEach(election => {
        candidateNameMap[election.electionID] = {};
        election.candidates.forEach(candidate => {
          candidateNameMap[election.electionID][candidate.candidateID] = candidate.name;
        });
      });

      // For each user election, check if user has voted
      const votes = {};
      await Promise.all(
        userElectionData.map(async (election) => {
          try {
            const voteResponse = await api.post(`/elections/${election.electionID}/voted`, {
              credentials: identityFile
            });

            // If user voted, enrich the vote with candidate name
            if (voteResponse.data && voteResponse.data.hasVoted && voteResponse.data.vote) {
              const vote = voteResponse.data.vote;

              // Make sure we capture the transaction ID
              const transactionID = voteResponse.data.transactionID || vote.transactionID;
              if (transactionID) {
                vote.transactionID = transactionID;
              }

              // Lookup candidate name using candidateID
              if (vote.candidateID && candidateNameMap[election.electionID]) {
                const candidateName = candidateNameMap[election.electionID][vote.candidateID] || 'Unknown Candidate';
                vote.candidateName = candidateName;
                // Enrich the vote object with candidate name
                // voteResponse.data.vote.candidateName = candidateName;
              }
            }

            votes[election.electionID] = voteResponse.data;
          } catch (error) {
            console.error(`Error checking vote for election ${election.electionID}:`, error);
          }
        })
      );

      setUserVotes(votes);

      // Debug logged votes to help troubleshoot
      console.log("Enriched vote data:", votes);

    } catch (error) {
      console.error('Error fetching user elections:', error);
      toast.error('Failed to fetch your registered elections');
    } finally {
      setFetchingElections(false);
    }
  };

  // Register for an election
  const registerForElection = async (electionId) => {
    if (!identityFile) {
      toast.error('Blockchain identity required to register');
      return;
    }

    try {
      setFetchingElections(true);
      await api.post(`/elections/${electionId}/register`, {
        credentials: identityFile
      });

      toast.success('Successfully registered for election');

      // Refresh user elections
      await fetchUserElections();
      await fetchActiveElections();
    } catch (error) {
      console.error(`Error registering for election ${electionId}:`, error);
      toast.error(error.response?.data?.details || 'Failed to register for election');
    } finally {
      setFetchingElections(false);
    }
  };

  // Cast a vote
  const castVote = async (electionId, candidateId) => {
    if (!identityFile) {
      toast.error('Blockchain identity required to vote');
      return;
    }

    try {
      setVotingInProgress(true);
      
      const response = await api.post(`/elections/${electionId}/vote`, {
        candidateID: candidateId,
        credentials: identityFile
      });

      // Find candidate name for feedback
      const election = userElections.find(e => e.electionID === electionId) ||
        activeElections.find(e => e.electionID === electionId);
      let candidateName = "your selected candidate";

      if (election) {
        const candidate = election.candidates.find(c => c.candidateID === candidateId);
        if (candidate) candidateName = candidate.name;
      }

      // Display success toast with transaction ID if available
      const txId = response.data?.transactionID;
      const txIdMessage = txId ? `\nTransaction ID: ${txId.substring(0, 10)}...` : '';
      toast.success(`Vote cast successfully for ${candidateName}!${txIdMessage}`);
      setShowVotingModal(false);

      // Refresh user elections and votes
      await fetchUserElections();
    } catch (error) {
      console.error(`Error casting vote in election ${electionId}:`, error);
      toast.error(error.response?.data?.details || 'Failed to cast vote');
    } finally {
      setVotingInProgress(false);
    }
  };

  // Load elections data when user has blockchain identity
  useEffect(() => {
    if (hasIdentity && identityFile) {
      fetchActiveElections();
      fetchUserElections();
    }
  }, [hasIdentity, identityFile]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-84px)] flex items-center justify-center">
        <div className="text-lg font-quicksand">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-84px)] flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center mb-2 mt-10 md:mt-0 md:mb-12">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 font-quicksand">
          Voting Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-8 font-quicksand font-medium">
          Manage your elections and view results
        </p>
      </div>

      {!hasIdentity ? (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full font-quicksand">
          <div className="bg-amber-100 text-amber-700 p-4 rounded mb-6">
            <p className="font-semibold">Blockchain Identity Required</p>
            <p className="mt-2 text-sm font-medium">To participate in secure voting, you need to create a blockchain identity.</p>
          </div>

          {isRegisteredButMissingFile ? (
            <>
              <div className="mb-6">
                <p className="text-gray-700 mb-2 font-medium">You're already registered. Upload your identity file:</p>
                <label className="block w-full cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleIdentityFileUpload}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-blue-400 p-4 rounded text-center hover:bg-blue-50 transition">
                    <p>Click to upload identity file</p>
                    <p className="text-sm text-gray-500">(.json format)</p>
                  </div>
                </label>
              </div>
            </>
          ) : (
            <button
              onClick={registerWithFabric}
              className="w-full font-semibold px-6 py-2 bg-indigo-400 text-white rounded hover:bg-primary/100 transition-colors"
              disabled={loading}
            >
              {loading ? 'Creating Identity...' : 'Create Blockchain Identity'}
            </button>
          )}
        </div>
      ) : showDownloadPrompt ? (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full font-quicksand">
          <div className="bg-green-100 text-green-700 p-4 rounded mb-6">
            <p className="font-bold">Identity Created Successfully!</p>
            <p className="mt-2 font-medium text-sm">Please download your identity file and keep it safe. Your identity has also been saved in this browser for convenience.</p>
          </div>

          <button
            onClick={downloadIdentityFile}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition font-medium w-full mb-4"
          >
            Download Identity File
          </button>

          <p className="text-xs text-gray-500 text-center">
            Note: If you clear your browser data, you'll need this file to restore your identity.
          </p>
        </div>
      ) : (
        /* New Elections UI */
        <div className="w-full max-w-6xl font-quicksand">
          {fetchingElections && activeElections.length === 0 && userElections.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading elections...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Active Elections */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4">
                  Active Elections
                </h2>
                {activeElections.length === 0 ? (
                  <p className="text-gray-600">No active elections at the moment.</p>
                ) : (
                  <div className="space-y-4">
                    {activeElections.map(election => {
                      // Fix: Use consistent property names when checking registration status
                      const isRegistered = userElections.some(e => e.electionID === election.electionID);

                      // Fix: Use consistent property access for vote checking
                      const hasVoted = userVotes[election.electionID]?.hasVoted;

                      return (
                        <div key={election.electionID} className="border rounded-lg p-4">
                          <h3 className="font-semibold">
                            {election.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 font-medium">
                            {election.description}
                          </p>
                          <div className="flex flex-col md:flex-row items-start gap-2 md:justify-between md:items-center mt-4">
                            {!isRegistered ? (
                              <button
                                onClick={() => registerForElection(election.electionID)}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded font-medium text-sm disabled:opacity-50"
                                disabled={fetchingElections}
                              >
                                {fetchingElections ? (
                                  <>
                                    <span className="inline-block animate-spin mr-1">⟳</span>
                                    Processing...
                                  </>
                                ) : 'REGISTER'}
                              </button>
                            ) : hasVoted ? (
                              <div className="flex flex-col">
                                <span className="text-green-600 text-sm font-semibold">
                                  ✓ You voted for: {userVotes[election.electionID]?.vote?.candidateName ||
                                    `Candidate ${userVotes[election.electionID]?.vote?.candidateID || 'Unknown'}`}
                                </span>

                              </div>

                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedElection(election);
                                  setShowVotingModal(true);
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm font-semibold"
                              >
                                CAST VOTE
                              </button>
                            )}
                            <span className="text-xs text-gray-500 font-semibold">
                              Ends: {new Date(election.endDate).toLocaleDateString("en-GB")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Your Votes */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Your Votes</h2>
                {Object.keys(userVotes).filter(id => userVotes[id]?.hasVoted).length === 0 ? (
                  <p className="text-gray-600">You haven't cast any votes yet.</p>
                ) : (
                  <div className="space-y-4">
                    {Object.keys(userVotes)
                      .filter(id => userVotes[id]?.hasVoted)
                      .map(electionId => {
                        const election = userElections.find(e => e.electionID === electionId) || {};
                        const vote = userVotes[electionId]?.vote || {};

                        // Look up candidate name from elections if not in vote object
                        let candidateName = vote.candidateName;
                        if (!candidateName && vote.candidateID && election.candidates) {
                          const candidate = election.candidates.find(c => c.candidateID === vote.candidateID);
                          candidateName = candidate?.name || `Candidate ${vote.candidateID}`;
                        }

                        return (
                          <div key={electionId} className="border rounded-lg p-4">
                            <h3 className="font-semibold">{election.name}</h3>
                            <p className="text-sm text-green-600 font-semibold">
                              You voted for: {candidateName || `Candidate ${vote.candidateID || 'Unknown'}`}
                            </p>
                            {vote.transactionID && (
                              <p className="text-xs text-gray-500 mt-1 font-semibold flex items-center">
                                <span className="mr-1">Transaction ID:</span>
                                <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">{vote.transactionID.substring(0, 15)}...</code>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(vote.transactionID);
                                  }} 
                                  className="ml-2 text-blue-500 hover:text-blue-600 transition-colors"
                                  title="Copy transaction ID"
                                >
                                  <ClipboardDocumentIcon className="h-4 w-4 text-black" />
                                </button>
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2 font-semibold">
                              Voted on: {new Date(vote.timestamp || Date.now()).toLocaleString("en-GB", {hour12: true})}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {completedElections.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-lg col-span-1 md:col-span-2">
                  <h2 className="text-xl font-semibold mb-4">Past Elections with Results</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedElections.map(election => (
                      <div key={election.electionID} className="border rounded-lg p-4">
                        <h3 className="font-semibold">{election.name}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2 font-medium">
                          {election.description}
                        </p>
                        <button
                          onClick={() => {
                            setSelectedCompletedElection(election);
                            setShowResultsModal(true);
                          }}
                          className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded text-sm mt-2 font-semibold"
                        >
                          View Official Results
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Modal */}
              {showResultsModal && selectedCompletedElection && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className=" max-w-3xl w-full p-6">
                    <PublicElectionResults
                      electionId={selectedCompletedElection.electionID}
                      onClose={() => {
                        setShowResultsModal(false);
                        setSelectedCompletedElection(null);
                      }}
                    />
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* Voting Modal */}
      {showVotingModal && selectedElection && (
        <VotingModal
          election={selectedElection}
          onClose={() => {
            setShowVotingModal(false);
            setSelectedElection(null);
          }}
          onVote={castVote}
          loading={votingInProgress}
        />
      )}
    </div>

  );
};

export default VotingDashboard;