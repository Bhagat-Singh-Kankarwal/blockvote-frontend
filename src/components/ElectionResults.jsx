function ElectionResults({ election, results, count, onBack }) {
  // Calculate percentages
  const totalVotes = count?.totalVotes || count?.voteCount || 0;
  
  // Find winning candidate
  let winningCandidate = null;
  let maxVotes = 0;
  
  if (results && Array.isArray(results)) {
    results.forEach(result => {
      // Handle both property naming conventions
      const voteCount = result.count || result.voteCount || 0;
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        winningCandidate = result;
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto font-quicksand">
      {/* <div className="hidden flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Election Results</h2>
        <button
          onClick={onBack}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Back to Elections
        </button>
      </div> */}
      
      {election && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="font-semibold text-lg">{election.name}</h3>
          <p className="text-gray-600 font-medium">{election.description}</p>
          <div className="flex flex-wrap gap-x-4 text-sm text-gray-500 mt-2">
            <p>ID: <span className="font-semibold">{election.electionID}</span></p>
            <p>Status: <span className="font-semibold">{election.status}</span></p>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between">
          <div>
            <h4 className="text-lg font-medium">Total Votes</h4>
            <p className="text-3xl font-bold">{totalVotes}</p>
          </div>
          
          {winningCandidate && (
            <div className="text-right">
              <h4 className="text-lg font-medium">Winner</h4>
              <p className="text-3xl font-bold text-green-600">
                {winningCandidate.candidateName || winningCandidate.name || 'Unknown'}
              </p>
              <p className="text-sm text-gray-600">
                {winningCandidate.count || winningCandidate.voteCount || 0} votes 
                ({totalVotes > 0 ? Math.round(((winningCandidate.count || winningCandidate.voteCount) / totalVotes) * 100) : 0}%)
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Results Breakdown</h4>
        
        {!results || results.length === 0 ? (
          <p className="text-gray-600 italic">No votes have been cast yet</p>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => {
              // Support both naming conventions
              const candidateName = result.candidateName || result.name || `Candidate ${result.candidateID}`;
              const voteCount = result.count || result.voteCount || 0;
              
              return (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{candidateName}</span>
                    <span className="font-medium">
                      {voteCount} votes ({totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: totalVotes > 0 ? `${(voteCount / totalVotes) * 100}%` : '0%' }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        <p className="mb-1">Note: These results are retrieved directly from the blockchain and cannot be altered.</p>
        <p>For completed elections, these results are final.</p>
      </div>
    </div>
  );
}

export default ElectionResults;