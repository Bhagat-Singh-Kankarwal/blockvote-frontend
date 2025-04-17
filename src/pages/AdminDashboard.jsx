import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../utils/api';
import ElectionForm from '../components/ElectionForm';
import ElectionList from '../components/ElectionList';
import ElectionResults from '../components/ElectionResults';

function AdminDashboard() {
  const [adminStatus, setAdminStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('elections'); // 'elections', 'create', 'results'
  const [elections, setElections] = useState([]);
  const [electionResults, setElectionResults] = useState({});
  // const [selectedElection, setSelectedElection] = useState(null);
  const [isInitializingLedger, setIsInitializingLedger] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verify admin token and fetch status
    checkAdminStatus();
  }, []);

  useEffect(() => {
    // Load elections when dashboard is opened
    if (adminStatus && adminStatus.status === 'enrolled') {
      fetchElections();
    }
  }, [adminStatus]);

  const checkAdminStatus = async () => {
    try {
      if (!localStorage.getItem('adminToken')) {
        // No token found, redirect to login
        navigate('/admin');
        return;
      }

      const response = await api.get('/fabric/admin/status');
      setAdminStatus(response.data);
    } catch (error) {
      console.error('Failed to verify admin status:', error);
      toast.error('Admin session invalid or expired');
      // Clear invalid token
      localStorage.removeItem('adminToken');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Admin logged out successfully');
    navigate('/admin');
  };

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/elections');
      setElections(response.data || []);
    } catch (error) {
      console.error('Error fetching elections:', error);
      toast.error('Failed to fetch elections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async (electionData) => {
    try {
      setLoading(true);

      // Ensure dates are properly formatted for the blockchain
      const formattedData = {
        ...electionData
      };
      // Check if startDate and endDate are already numbers
      if (typeof formattedData.startDate !== 'number') {
        // If they're strings, convert them correctly
        try {
          formattedData.startDate = new Date(formattedData.startDate).getTime();
        } catch (err) {
          console.error("Invalid startDate format:", formattedData.startDate);
          toast.error("Invalid start date format");
          return;
        }
      }

      if (typeof formattedData.endDate !== 'number') {
        try {
          formattedData.endDate = new Date(formattedData.endDate).getTime();
        } catch (err) {
          console.error("Invalid endDate format:", formattedData.endDate);
          toast.error("Invalid end date format");
          return;
        }
      }

      await api.post('/admin/elections', formattedData);

      toast.success('Election created successfully');
      setActiveTab('elections');
      fetchElections();
    } catch (error) {
      console.error('Error creating election:', error);
      toast.error(error.response?.data?.details || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  // const handleUpdateElectionStatus = async (electionId, newStatus) => {
  //   try {
  //     setLoading(true);
  //     await api.put(`/admin/elections/${electionId}/status`,
  //       { newStatus }
  //     );
  //     toast.success(`Election status updated to ${newStatus}`);
  //     fetchElections();
  //   } catch (error) {
  //     console.error('Error updating election status:', error);
  //     toast.error(error.response?.data?.details || 'Failed to update election status');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleUpdateElectionStatus = async (electionId, newStatus) => {
    try {
      setLoading(true);

      // Confirm before making certain status changes
      if (newStatus === 'CANCELED' && !window.confirm('Are you sure you want to cancel this election? This action may not be reversible.')) {
        setLoading(false);
        return;
      }

      if (newStatus === 'RESULTS_DECLARED' && !window.confirm('Are you sure you want to declare the results? This will finalize the election outcome.')) {
        setLoading(false);
        return;
      }

      await api.put(`/admin/elections/${electionId}/status`, {
        newStatus
      });

      const formattedStatus = newStatus
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      toast.success(`Election status updated to ${formattedStatus}`);
      fetchElections();
    } catch (error) {
      console.error('Error updating election status:', error);
      toast.error(`Failed to update election status: ${error.response?.data?.details || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteElection = async (electionId) => {
    if (!window.confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/admin/elections/${electionId}`);
      toast.success('Election deleted successfully');
      fetchElections();
    } catch (error) {
      console.error('Error deleting election:', error);
      toast.error(error.response?.data?.details || 'Failed to delete election');
    } finally {
      setLoading(false);
    }
  };

  // const handleViewResults = async (electionId) => {
  //   try {
  //     setLoading(true);
  //     const resultsResponse = await api.get(`/admin/elections/${electionId}/results`);

  //     const countResponse = await api.get(`/admin/elections/${electionId}/count`);

  //     // Find the election details
  //     // const election = elections.find(e => e.id === electionId);
  //     const election = elections.find(e => e.id === electionId || e.electionID === electionId);

  //     setElectionResults({
  //       election,
  //       results: resultsResponse.data,
  //       count: countResponse.data
  //     });

  //     setActiveTab('results');
  //   } catch (error) {
  //     console.error('Error fetching election results:', error);
  //     toast.error('Failed to fetch election results');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleViewResults = async (electionId) => {
    try {
      setLoading(true);
      const resultsResponse = await api.get(`/admin/elections/${electionId}/results`);

      // Add this debug log
      console.log('Raw results from blockchain:', resultsResponse.data);

      const countResponse = await api.get(`/admin/elections/${electionId}/count`);

      // Find the election details with the correct property
      const election = elections.find(e => e.electionID === electionId);

      if (!election) {
        console.warn(`Could not find election details for ID: ${electionId}`);
      }

      // Transform the vote results to match the component's expected format
      const transformedResults = resultsResponse.data.map(result => ({
        candidateName: result.name,
        candidateID: result.candidateID,
        count: result.voteCount,
        party: result.party
      }));

      setElectionResults({
        election,
        results: transformedResults,
        count: {
          totalVotes: countResponse.data.voteCount || 0
        }
      });

      setActiveTab('results');
    } catch (error) {
      console.error('Error fetching election results:', error);
      // Show more detailed error for better debugging
      const errorMessage = error.response?.data?.details || error.message;
      toast.error(`Failed to fetch results: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeLedger = async () => {
    if (!window.confirm('Are you sure you want to initialize the ledger? This will reset all blockchain data.')) {
      return;
    }

    try {
      setIsInitializingLedger(true);
      await api.post('/initLedger', {});
      toast.success('Ledger initialized successfully');
      fetchElections();
    } catch (error) {
      console.error('Error initializing ledger:', error);
      toast.error('Failed to initialize ledger');
    } finally {
      setIsInitializingLedger(false);
    }
  };

  if (loading && !adminStatus) {
    return (
      <div className="min-h-[calc(100vh-84px)] flex items-center justify-center">
        <div className="text-lg">Verifying admin credentials...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-84px)] w-11/12 mx-auto flex flex-col pt-5 md:p-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-quicksand">Admin Dashboard</h1>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg font-quicksand">
          <h2 className="text-xl font-semibold mb-2">Admin Status</h2>
          {adminStatus && (
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Status:</span> {adminStatus.status}
              </div>
              {/* <div><span className="font-medium">Message:</span> {adminStatus.message}</div> */}
              <div className={`mt-2 text-sm font-semibold ${adminStatus.status === 'enrolled' ? 'text-green-600' : 'text-amber-600'}`}>
                {adminStatus.status === 'enrolled'
                  ? '✓ Admin is properly enrolled with the blockchain network'
                  : '! Admin needs to be enrolled with the blockchain network'}
              </div>
            </div>
          )}
        </div>

        {/* Admin Enrollment Button */}
        {adminStatus && adminStatus.status === 'not_enrolled' && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <h2 className="text-lg font-medium mb-2">Admin Enrollment Required</h2>
            <p className="text-gray-700 mb-4">
              The admin identity is not enrolled with the blockchain network.
              You need to enroll the admin to manage blockchain operations.
            </p>
            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  await api.post('/fabric/admin/enroll', {});
                  toast.success('Admin enrolled successfully');
                  await checkAdminStatus(); // Refresh status
                } catch (error) {
                  console.error('Failed to enroll admin:', error);
                  toast.error('Admin enrollment failed');
                } finally {
                  setLoading(false);
                }
              }}
              className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
            >
              Enroll Admin
            </button>
          </div>
        )}

        {/* Only show election management if admin is enrolled */}
        {adminStatus && adminStatus.status === 'enrolled' && (
          <>
            {/* Navigation Tabs */}
            <div className="flex border-b mb-6 font-quicksand font-semibold">
              <button
                onClick={() => setActiveTab('elections')}
                className={`px-4 py-2 ${activeTab === 'elections' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              >
                Elections
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 ${activeTab === 'create' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              >
                Create Election
              </button>
              {Object.keys(electionResults).length > 0 && (
                <button
                  onClick={() => setActiveTab('results')}
                  className={`px-4 py-2 ${activeTab === 'results' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                >
                  Results
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {activeTab === 'elections' && (
                <ElectionList
                  elections={elections}
                  onUpdateStatus={handleUpdateElectionStatus}
                  onDelete={handleDeleteElection}
                  onViewResults={handleViewResults}
                  loading={loading}
                />
              )}

              {activeTab === 'create' && (
                <ElectionForm onSubmit={handleCreateElection} loading={loading} />
              )}

              {activeTab === 'results' && Object.keys(electionResults).length > 0 && (
                <ElectionResults
                  election={electionResults.election}
                  results={electionResults.results}
                  count={electionResults.count}
                  onBack={() => setActiveTab('elections')}
                />
              )}
            </div>

            {/* Initialize Ledger Button */}
            <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-semibold font-quicksand mb-2">Advanced Operations</h3>
              <p className="text-gray-700 mb-4 font-sans text-base">
                Warning: Initializing the ledger will reset all blockchain data. This action cannot be undone.
              </p>
              <button
                onClick={handleInitializeLedger}
                disabled={isInitializingLedger}
                className="px-4 py-2 bg-red-600 font-quicksand font-bold text-white rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                {isInitializingLedger ? 'INITIALIZING...' : 'INITIALIZE LEDGER'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;