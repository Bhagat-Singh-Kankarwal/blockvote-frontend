import { useState, useEffect } from 'react';
import api from '../utils/api';

function PublicElectionResults({ electionId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [election, setElection] = useState(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // First get the election details
        const electionResponse = await api.get(`/elections/${electionId}`);
        setElection(electionResponse.data);
        
        // Only try to fetch results if status is RESULTS_DECLARED
        if (electionResponse.data.status === 'RESULTS_DECLARED' || electionResponse.data.status === 'ENDED') {
          const resultsResponse = await api.get(`/elections/${electionId}/public-results`);
          setResults(resultsResponse.data);
        } else {
          setError('Results have not been officially declared yet');
        }
      } catch (err) {
        console.error('Error fetching election results:', err);
        setError(err.response?.data?.details || 'Failed to fetch election results');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [electionId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4 font-quicksand font-semibold"></div>
        <p>Loading results...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Election Results</h2>
          {onClose && (
            <button onClick={onClose} className="text-gray-500">
              Close
            </button>
          )}
        </div>
        
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded">
          <p className="font-medium">Results Not Available</p>
          <p className="mt-2">{error}</p>
          {election && election.status !== 'RESULTS_DECLARED' && (
            <p className="mt-2 text-sm">
              Current status: {election.status.replace('_', ' ')}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  if (!results || !election) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <p>No results data available</p>
      </div>
    );
  }
  
  // Calculate total votes
  const totalVotes = results.reduce((sum, candidate) => sum + (candidate.voteCount || 0), 0);
  
  // Find winner (if there is one)
  // const winner = [...results].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))[0];
  // Find winner (if there is one)
  let winnerMessage = 'No votes have been cast';
  let winner = null;
  
  if (totalVotes > 0) {
    // Sort by vote count (highest first)
    const sortedResults = [...results].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    
    // Check if we have a clear winner or a tie
    if (sortedResults.length > 0) {
      winner = sortedResults[0];
      
      // Check for tie (if there are multiple candidates with the same highest vote count)
      const tiedCandidates = sortedResults.filter(c => c.voteCount === winner.voteCount);
      
      if (tiedCandidates.length > 1) {
        winnerMessage = `Tie between ${tiedCandidates.map(c => c.name).join(', ')}`;
      } else {
        winnerMessage = winner.name;
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold md:text-2xl">Official Election Results</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 font-medium hover:text-gray-700 transition-colors text-sm md:text-base">
            Close
          </button>
        )}
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold text-lg">{election.name}</h3>
        <p className="text-gray-600 font-medium">{election.description}</p>
      </div>
      

      <div className="bg-green-50 p-4 rounded mb-6">
        <h3 className="font-bold">Winner: {winnerMessage}</h3>
        {winner && (
          <p className="text-base font-medium md:text-lg">{winner.voteCount || 0} votes 
            ({totalVotes > 0 ? Math.round((winner.voteCount / totalVotes) * 100) : 0}%)
          </p>
        )}
      </div>
      
      <h4 className="font-medium mb-3">Final Results</h4>
      <div className="space-y-2">
        {results.map((result) => (
          <div key={result.candidateID} className="border rounded p-3">
            <div className="flex justify-between mb-1">
              <span className='font-medium'>
                {result.name}
              </span>
              <span className="font-medium">
                {result.voteCount} votes 
                ({totalVotes > 0 ? Math.round((result.voteCount / totalVotes) * 100) : 0}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: totalVotes > 0 ? `${(result.voteCount / totalVotes) * 100}%` : '0%' }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PublicElectionResults;